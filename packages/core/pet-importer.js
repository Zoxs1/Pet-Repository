const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { nativeImage } = require("electron");
const { extractZip } = require("./pet-zip");

const supportedImageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const supportedSoundExtensions = new Set([".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac"]);

function sanitizeFilePart(value, fallback = "pet") {
  const cleanValue = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ");
  return cleanValue || fallback;
}

function normalizeId(value, fallback = "pet") {
  const normalized = sanitizeFilePart(value, fallback)
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function normalizeActionKey(value, fallback = "animation") {
  const id = normalizeId(value, fallback);
  const parts = id.split("_").filter(Boolean);
  if (parts.length === 0) return fallback;
  return parts.map((part, index) => {
    const lower = part.toLowerCase();
    if (index === 0) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join("");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureUniquePetId(petStore, preferredId) {
  const petsRoot = path.join(petStore.getLibraryPath(), "pets");
  const baseId = normalizeId(preferredId, "pet");
  let candidate = baseId;
  let index = 1;

  while (fs.existsSync(path.join(petsRoot, candidate))) {
    index += 1;
    candidate = `${baseId}_${index}`;
  }

  return candidate;
}

function countFiles(folderPath, extensions = null) {
  if (!fs.existsSync(folderPath)) return 0;
  let total = 0;

  function walk(currentPath) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (!extensions || extensions.has(path.extname(entry.name).toLowerCase())) total += 1;
    }
  }

  walk(folderPath);
  return total;
}

function findPackageRoot(extractFolder) {
  if (fs.existsSync(path.join(extractFolder, "pet.json"))) return extractFolder;
  const folders = fs.readdirSync(extractFolder, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (folders.length === 1) {
    const nestedRoot = path.join(extractFolder, folders[0].name);
    if (fs.existsSync(path.join(nestedRoot, "pet.json"))) return nestedRoot;
  }
  return extractFolder;
}

function inspectPetFolder(folderPath) {
  const manifestPath = path.join(folderPath, "pet.json");
  if (!fs.existsSync(manifestPath)) throw new Error("El paquete no contiene pet.json.");
  const manifest = readJson(manifestPath);
  const packagePath = path.join(folderPath, "package.json");
  const packageManifest = fs.existsSync(packagePath) ? readJson(packagePath) : null;
  const warnings = [];

  for (const [animationId, animation] of Object.entries(manifest.animations || {})) {
    if (animation.source && !fs.existsSync(path.resolve(folderPath, animation.source))) {
      warnings.push(`Falta imagen para ${animationId}: ${animation.source}`);
    }
    if (animation.sound && !String(animation.sound).startsWith("library://") && !fs.existsSync(path.resolve(folderPath, animation.sound))) {
      warnings.push(`Falta sonido para ${animationId}: ${animation.sound}`);
    }
  }

  const animations = Object.entries(manifest.animations || {}).map(([id, animation]) => ({
    id,
    label: animation.label || id,
    frames: Number(animation.frames || 0),
    fps: Number(animation.fps || manifest.defaults?.fps || 24),
    loop: animation.loop !== false,
    source: animation.source || "",
    preview: animation.source ? {
      type: "spritesheet",
      sourceUrl: pathToFileURL(path.resolve(folderPath, animation.source)).toString(),
      frameWidth: Number(animation.frameWidth || manifest.defaults?.frameWidth || 128),
      frameHeight: Number(animation.frameHeight || manifest.defaults?.frameHeight || 128),
      columns: Number(animation.columns || manifest.defaults?.columns || 1),
      frames: Number(animation.frames || 0),
      fps: Number(animation.fps || manifest.defaults?.fps || 24)
    } : null
  }));

  return {
    packageManifest,
    manifest,
    review: {
      kind: "package",
      title: "Paquete completo",
      suggestedName: manifest.name || packageManifest?.name || "Nueva mascota",
      suggestedId: normalizeId(manifest.id || packageManifest?.petId || manifest.name || "pet"),
      animationCount: animations.length,
      soundCount: countFiles(path.join(folderPath, "sounds"), supportedSoundExtensions),
      fileCount: countFiles(folderPath),
      animations,
      warnings
    }
  };
}

function copyFolderContents(sourceFolder, targetFolder) {
  fs.mkdirSync(targetFolder, { recursive: true });
  for (const entry of fs.readdirSync(sourceFolder, { withFileTypes: true })) {
    const sourcePath = path.join(sourceFolder, entry.name);
    const targetPath = path.join(targetFolder, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function preparePackageImport({ zipPath, tempRoot, onProgress }) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const extractFolder = path.join(tempRoot, `package-${stamp}`);
  extractZip(zipPath, extractFolder, onProgress);
  const packageRoot = findPackageRoot(extractFolder);
  const inspected = inspectPetFolder(packageRoot);

  return {
    workspaceFolder: extractFolder,
    packageRoot,
    review: {
      ...inspected.review,
      sourceName: path.basename(zipPath)
    }
  };
}

function installPackageImport({ petStore, packageRoot, petId, petName, onProgress }) {
  const finalPetId = ensureUniquePetId(petStore, petId);
  const targetFolder = path.join(petStore.getLibraryPath(), "pets", finalPetId);
  if (onProgress) onProgress({ message: "Copiando paquete a la biblioteca", current: 1, total: 3, percent: 33 });
  copyFolderContents(packageRoot, targetFolder);

  const manifestPath = path.join(targetFolder, "pet.json");
  const manifest = readJson(manifestPath);
  manifest.id = finalPetId;
  manifest.name = sanitizeFilePart(petName, manifest.name || finalPetId);
  writeJson(manifestPath, manifest);

  const packagePath = path.join(targetFolder, "package.json");
  if (fs.existsSync(packagePath)) {
    const packageManifest = readJson(packagePath);
    packageManifest.petId = finalPetId;
    packageManifest.name = manifest.name;
    packageManifest.importedAt = new Date().toISOString();
    writeJson(packagePath, packageManifest);
  }

  if (onProgress) onProgress({ message: "Mascota lista en biblioteca", current: 3, total: 3, percent: 100 });
  return { ok: true, petRef: `library:${finalPetId}`, petId: finalPetId, petName: manifest.name };
}

function collectImageFiles(sourcePaths) {
  const files = [];

  function walk(currentPath) {
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(currentPath)) walk(path.join(currentPath, entry));
      return;
    }

    if (supportedImageExtensions.has(path.extname(currentPath).toLowerCase())) files.push(currentPath);
  }

  for (const sourcePath of sourcePaths) {
    if (fs.existsSync(sourcePath)) walk(sourcePath);
  }

  return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

function getGroupInfo(filePath) {
  const parentName = path.basename(path.dirname(filePath));
  const baseName = path.basename(filePath, path.extname(filePath));
  const match = baseName.match(/^(.*?)[_\-\s]*(\d+)$/);
  if (match && match[1].trim()) {
    return {
      rawName: match[1].trim(),
      order: Number(match[2])
    };
  }

  return {
    rawName: parentName || baseName,
    order: Number.MAX_SAFE_INTEGER
  };
}

function prepareIndividualImagesImport({ sourcePaths }) {
  const files = collectImageFiles(sourcePaths);
  if (files.length === 0) throw new Error("No se encontraron imagenes compatibles.");

  const groupMap = new Map();
  for (const filePath of files) {
    const groupInfo = getGroupInfo(filePath);
    const animationId = normalizeActionKey(groupInfo.rawName, "animation");
    if (!groupMap.has(animationId)) {
      groupMap.set(animationId, {
        id: animationId,
        label: sanitizeFilePart(groupInfo.rawName, animationId),
        files: []
      });
    }
    groupMap.get(animationId).files.push({ path: filePath, order: groupInfo.order, name: path.basename(filePath) });
  }

  const warnings = [];
  const groups = [...groupMap.values()].sort((a, b) => a.id.localeCompare(b.id));
  for (const group of groups) {
    group.files.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    const firstImage = nativeImage.createFromPath(group.files[0].path);
    if (firstImage.isEmpty()) {
      warnings.push(`No se pudo leer ${group.files[0].name}.`);
      group.width = 0;
      group.height = 0;
      continue;
    }

    const size = firstImage.getSize();
    group.width = size.width;
    group.height = size.height;
    for (const file of group.files.slice(1)) {
      const image = nativeImage.createFromPath(file.path);
      const currentSize = image.getSize();
      if (image.isEmpty() || currentSize.width !== size.width || currentSize.height !== size.height) {
        warnings.push(`La animacion ${group.label} tiene frames con tamanos distintos.`);
        break;
      }
    }
  }

  const suggestedName = sanitizeFilePart(path.basename(path.dirname(files[0])), "Nueva mascota");
  return {
    review: {
      kind: "individual-images",
      title: "Imagenes individuales",
      sourceName: `${files.length} imagenes`,
      suggestedName,
      suggestedId: normalizeId(suggestedName, "pet"),
      animationCount: groups.length,
      soundCount: 0,
      fileCount: files.length,
      animations: groups.map((group) => ({
        id: group.id,
        label: group.label,
        frames: group.files.length,
        fps: 24,
        loop: true,
        source: `${group.width || "?"} x ${group.height || "?"}`,
        preview: {
          type: "frames",
          frameUrls: group.files.map((file) => pathToFileURL(file.path).toString()),
          frameWidth: group.width || 128,
          frameHeight: group.height || 128,
          frames: group.files.length,
          fps: 24
        }
      })),
      warnings
    },
    groups
  };
}

function composeSpritesheet(group, targetPath, columns) {
  const frameCount = group.files.length;
  const rows = Math.ceil(frameCount / columns);
  const sheetWidth = group.width * columns;
  const sheetHeight = group.height * rows;
  const targetBuffer = Buffer.alloc(sheetWidth * sheetHeight * 4);

  for (let index = 0; index < group.files.length; index += 1) {
    const image = nativeImage.createFromPath(group.files[index].path);
    if (image.isEmpty()) throw new Error(`No se pudo leer ${group.files[index].name}`);
    const size = image.getSize();
    if (size.width !== group.width || size.height !== group.height) {
      throw new Error(`La animacion ${group.label} tiene frames con tamanos distintos.`);
    }

    const sourceBuffer = image.toBitmap();
    if (sourceBuffer.length !== group.width * group.height * 4) {
      throw new Error(`No se pudo procesar ${group.files[index].name}`);
    }

    const targetX = (index % columns) * group.width;
    const targetY = Math.floor(index / columns) * group.height;
    for (let row = 0; row < group.height; row += 1) {
      const sourceStart = row * group.width * 4;
      const sourceEnd = sourceStart + group.width * 4;
      const targetStart = ((targetY + row) * sheetWidth + targetX) * 4;
      sourceBuffer.copy(targetBuffer, targetStart, sourceStart, sourceEnd);
    }
  }

  const sheet = nativeImage.createFromBitmap(targetBuffer, { width: sheetWidth, height: sheetHeight });
  fs.writeFileSync(targetPath, sheet.toPNG());
}

function buildDefaultActions(animationIds) {
  const actionSource = new Set(animationIds);
  const actions = {};

  function assign(action, candidates) {
    const match = candidates.find((candidate) => actionSource.has(candidate));
    if (match) actions[action] = match;
  }

  assign("intro", ["intro", "spawn"]);
  assign("idle", ["idle", "stand"]);
  assign("rest", ["walkIdle", "attention", "rest"]);
  assign("sleep", ["sleep"]);
  assign("click", ["click", "attack", "tap"]);
  assign("drag", ["grab", "drag"]);
  assign("hover", ["hover"]);

  const patrol = {};
  const run = {};
  const directionMap = [
    ["left", ["walkLeft", "left"]],
    ["right", ["walkRight", "right"]],
    ["up", ["walkUp", "up"]],
    ["down", ["walkDown", "down"]]
  ];

  for (const [direction, candidates] of directionMap) {
    const walkMatch = candidates.find((candidate) => actionSource.has(candidate));
    if (walkMatch) patrol[direction] = walkMatch;
    const runMatch = candidates.map((candidate) => `run${candidate.charAt(0).toUpperCase()}${candidate.slice(1)}`).find((candidate) => actionSource.has(candidate));
    if (runMatch) run[direction] = runMatch;
  }

  if (Object.keys(patrol).length > 0) actions.patrol = patrol;
  if (Object.keys(run).length > 0) actions.run = run;
  const random = animationIds.filter((id) => id.toLowerCase().startsWith("emote"));
  if (random.length > 0) actions.random = random;

  return actions;
}

function installIndividualImagesImport({ petStore, groups, petId, petName, onProgress }) {
  const finalPetId = ensureUniquePetId(petStore, petId);
  const targetFolder = path.join(petStore.getLibraryPath(), "pets", finalPetId);
  const spritesFolder = path.join(targetFolder, "sprites");
  fs.mkdirSync(spritesFolder, { recursive: true });

  const validGroups = groups.filter((group) => group.files.length > 0 && group.width > 0 && group.height > 0);
  if (validGroups.length === 0) throw new Error("No hay animaciones validas para importar.");
  const firstGroup = validGroups[0];
  const animations = {};
  const total = validGroups.length + 1;
  let current = 0;

  for (const group of validGroups) {
    const columns = Math.min(10, group.files.length);
    const fileName = `${group.id}.png`;
    composeSpritesheet(group, path.join(spritesFolder, fileName), columns);
    animations[group.id] = {
      label: group.label,
      source: `sprites/${fileName}`,
      frames: group.files.length,
      fps: 24,
      loop: true,
      frameWidth: group.width,
      frameHeight: group.height,
      columns
    };
    current += 1;
    if (onProgress) onProgress({ message: `Creando spritesheet: ${group.label}`, current, total, percent: Math.round((current / total) * 100) });
  }

  const animationIds = Object.keys(animations);
  const manifest = {
    schemaVersion: 1,
    id: finalPetId,
    name: sanitizeFilePart(petName, finalPetId),
    author: "",
    source: "Imported individual images",
    icon: null,
    defaults: {
      frameWidth: firstGroup.width,
      frameHeight: firstGroup.height,
      columns: Math.min(10, firstGroup.files.length),
      fps: 24,
      scale: 1,
      loop: true
    },
    editor: {
      referenceAnimation: animationIds.includes("idle") ? "idle" : animationIds[0],
      referenceFrame: 0
    },
    behaviors: {
      profile: {
        idleSeconds: { min: 3, max: 7 },
        walkSeconds: { min: 2, max: 5 },
        sleepSeconds: { min: 8, max: 14 },
        attentionSeconds: { min: 2.5, max: 4 },
        attentionRadius: 44,
        edgeOverflow: 82,
        walkSpeed: 1.25,
        runSpeed: 2.4,
        randomWeights: { patrol: 55, emote: 25, sleep: 20 }
      }
    },
    actions: buildDefaultActions(animationIds),
    animations
  };

  writeJson(path.join(targetFolder, "pet.json"), manifest);
  if (onProgress) onProgress({ message: "Mascota creada", current: total, total, percent: 100 });
  return { ok: true, petRef: `library:${finalPetId}`, petId: finalPetId, petName: manifest.name };
}

module.exports = {
  preparePackageImport,
  installPackageImport,
  prepareIndividualImagesImport,
  installIndividualImagesImport
};
