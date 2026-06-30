const fs = require("fs");
const path = require("path");
const { nativeImage } = require("electron");
const { createZipFromFolder } = require("./pet-zip");

function padFrame(index, total) {
  return String(index + 1).padStart(Math.max(4, String(total).length), "0");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeFilePart(value, fallback = "export") {
  const cleanValue = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ");
  return cleanValue || fallback;
}

function uniqueFileName(usedNames, preferredName) {
  const extension = path.extname(preferredName);
  const baseName = path.basename(preferredName, extension);
  let candidate = preferredName;
  let index = 1;

  while (usedNames.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${baseName} ${index}${extension}`;
  }

  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function cloneManifest(manifest) {
  const cleanManifest = JSON.parse(JSON.stringify(manifest));
  delete cleanManifest.petRef;
  delete cleanManifest.editable;
  delete cleanManifest.manifestPath;
  delete cleanManifest.baseDir;
  delete cleanManifest.iconUrl;

  for (const animation of Object.values(cleanManifest.animations || {})) {
    delete animation.sourceUrl;
    delete animation.soundUrl;
  }

  return cleanManifest;
}

function getFrameSize(manifest, animation) {
  const defaults = manifest.defaults || {};
  return {
    width: Number(animation.frameWidth || defaults.frameWidth || 128),
    height: Number(animation.frameHeight || defaults.frameHeight || 128),
    columns: Number(animation.columns || defaults.columns || 1)
  };
}

function resolveAssetPath(petStore, manifest, assetPath) {
  if (!assetPath) return null;
  if (String(assetPath).startsWith("library://")) {
    return petStore.resolveLibraryPath(assetPath);
  }
  return path.resolve(manifest.baseDir || path.dirname(manifest.manifestPath || ""), assetPath);
}

function ensureCleanExportFolder(destinationRoot, manifest, suffix) {
  const petName = sanitizeFilePart(manifest.id || manifest.name || "pet", "pet");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportFolder = path.join(destinationRoot, `${petName}-${suffix}-${stamp}`);
  fs.mkdirSync(exportFolder, { recursive: true });
  return exportFolder;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function report(onProgress, message, current, total) {
  if (onProgress) onProgress({ message, current, total, percent: total > 0 ? Math.round((current / total) * 100) : 0 });
  await new Promise((resolve) => setImmediate(resolve));
}

function copySounds(petStore, manifest, exportFolder, cleanManifest) {
  const soundsFolder = path.join(exportFolder, "sounds");
  const soundMap = new Map();
  const usedNames = new Set();

  for (const [animationId, animation] of Object.entries(manifest.animations || {})) {
    if (!animation.sound) continue;
    const sourcePath = resolveAssetPath(petStore, manifest, animation.sound);
    if (!sourcePath || !fs.existsSync(sourcePath)) continue;

    if (!soundMap.has(animation.sound)) {
      fs.mkdirSync(soundsFolder, { recursive: true });
      const safeName = uniqueFileName(usedNames, sanitizeFilePart(path.basename(sourcePath), `${animationId}${path.extname(sourcePath) || ".wav"}`));
      const targetPath = path.join(soundsFolder, safeName);
      fs.copyFileSync(sourcePath, targetPath);
      soundMap.set(animation.sound, `sounds/${safeName}`);
    }

    if (cleanManifest.animations?.[animationId]) {
      cleanManifest.animations[animationId].sound = soundMap.get(animation.sound);
    }
  }
}

function writePetStudioXml(exportFolder, manifest, sheetEntries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<PetStudioAtlas schemaVersion="1" petId="${escapeXml(manifest.id)}" petName="${escapeXml(manifest.name)}">`
  ];

  for (const sheet of sheetEntries) {
    lines.push(`  <Sheet animation="${escapeXml(sheet.animationId)}" label="${escapeXml(sheet.label)}" imagePath="${escapeXml(sheet.imagePath)}" frameWidth="${sheet.frameWidth}" frameHeight="${sheet.frameHeight}" frames="${sheet.frames}" columns="${sheet.columns}" fps="${sheet.fps}" loop="${sheet.loop ? "true" : "false"}">`);
    for (const frame of sheet.frameEntries) {
      lines.push(`    <SubTexture name="${escapeXml(frame.name)}" x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" frameIndex="${frame.index}" />`);
    }
    lines.push("  </Sheet>");
  }

  lines.push("</PetStudioAtlas>");
  fs.writeFileSync(path.join(exportFolder, "pet-studio.xml"), `${lines.join("\n")}\n`, "utf8");
}

async function exportSpritesheetXml({ petStore, manifest, destinationRoot, onProgress }) {
  const exportFolder = ensureCleanExportFolder(destinationRoot, manifest, "spritesheet-xml");
  const spritesFolder = path.join(exportFolder, "sprites");
  fs.mkdirSync(spritesFolder, { recursive: true });

  const cleanManifest = cloneManifest(manifest);
  const sheetEntries = [];
  const animations = Object.entries(manifest.animations || {});
  let done = 0;
  const total = animations.length + 3;

  await report(onProgress, "Preparando exportacion de spritesheets", done, total);

  for (const [animationId, animation] of animations) {
    const sourcePath = resolveAssetPath(petStore, manifest, animation.source);
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      throw new Error(`No se encontro la imagen de ${animationId}`);
    }

    const targetName = `${sanitizeFilePart(animationId, "animacion")}.png`;
    const targetRelativePath = `sprites/${targetName}`;
    fs.copyFileSync(sourcePath, path.join(spritesFolder, targetName));
    if (cleanManifest.animations?.[animationId]) cleanManifest.animations[animationId].source = targetRelativePath;

    const frameSize = getFrameSize(manifest, animation);
    const frames = Number(animation.frames || 1);
    const frameEntries = [];

    for (let index = 0; index < frames; index += 1) {
      frameEntries.push({
        index,
        name: `${animationId}_${padFrame(index, frames)}`,
        x: (index % frameSize.columns) * frameSize.width,
        y: Math.floor(index / frameSize.columns) * frameSize.height,
        width: frameSize.width,
        height: frameSize.height
      });
    }

    sheetEntries.push({
      animationId,
      label: animation.label || animationId,
      imagePath: targetRelativePath,
      frameWidth: frameSize.width,
      frameHeight: frameSize.height,
      columns: frameSize.columns,
      frames,
      fps: Number(animation.fps || manifest.defaults?.fps || 24),
      loop: animation.loop !== false,
      frameEntries
    });

    done += 1;
    await report(onProgress, `Copiando spritesheet: ${animation.label || animationId}`, done, total);
  }

  copySounds(petStore, manifest, exportFolder, cleanManifest);
  done += 1;
  await report(onProgress, "Copiando sonidos usados", done, total);

  writeJson(path.join(exportFolder, "pet.json"), cleanManifest);
  done += 1;
  await report(onProgress, "Escribiendo pet.json", done, total);

  writePetStudioXml(exportFolder, cleanManifest, sheetEntries);
  done += 1;
  await report(onProgress, "Escribiendo pet-studio.xml", done, total);

  return { ok: true, exportFolder, files: sheetEntries.length + 2 };
}

async function exportIndividualImages({ petStore, manifest, destinationRoot, onProgress }) {
  const exportFolder = ensureCleanExportFolder(destinationRoot, manifest, "individual-images");
  const framesRoot = path.join(exportFolder, "frames");
  fs.mkdirSync(framesRoot, { recursive: true });

  const cleanManifest = cloneManifest(manifest);
  const animations = Object.entries(manifest.animations || {});
  const totalFrames = animations.reduce((total, [, animation]) => total + Number(animation.frames || 0), 0);
  const total = totalFrames + 3;
  const indexManifest = {
    format: "pet-studio-individual-images-v1",
    exportedAt: new Date().toISOString(),
    pet: {
      id: cleanManifest.id,
      name: cleanManifest.name,
      schemaVersion: cleanManifest.schemaVersion
    },
    defaults: cleanManifest.defaults,
    editor: cleanManifest.editor,
    actions: cleanManifest.actions,
    behaviors: cleanManifest.behaviors,
    animations: {}
  };
  let done = 0;

  await report(onProgress, "Preparando recorte de frames", done, total);

  for (const [animationId, animation] of animations) {
    const sourcePath = resolveAssetPath(petStore, manifest, animation.source);
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      throw new Error(`No se encontro la imagen de ${animationId}`);
    }

    const image = nativeImage.createFromPath(sourcePath);
    if (image.isEmpty()) throw new Error(`No se pudo leer la imagen de ${animationId}`);

    const frameSize = getFrameSize(manifest, animation);
    const frames = Number(animation.frames || 1);
    const animationFolderName = sanitizeFilePart(animationId, "animacion");
    const animationFolder = path.join(framesRoot, animationFolderName);
    fs.mkdirSync(animationFolder, { recursive: true });

    indexManifest.animations[animationId] = {
      ...cleanManifest.animations[animationId],
      frames,
      frameWidth: frameSize.width,
      frameHeight: frameSize.height,
      columns: frameSize.columns,
      frameFiles: []
    };
    delete indexManifest.animations[animationId].source;

    for (let index = 0; index < frames; index += 1) {
      const fileName = `${animationFolderName}_${padFrame(index, frames)}.png`;
      const frameRelativePath = `frames/${animationFolderName}/${fileName}`;
      const crop = {
        x: (index % frameSize.columns) * frameSize.width,
        y: Math.floor(index / frameSize.columns) * frameSize.height,
        width: frameSize.width,
        height: frameSize.height
      };
      const frameImage = image.crop(crop);
      fs.writeFileSync(path.join(animationFolder, fileName), frameImage.toPNG());
      indexManifest.animations[animationId].frameFiles.push(frameRelativePath);

      done += 1;
      if (done % 8 === 0 || done === totalFrames) {
        await report(onProgress, `Exportando frames: ${animation.label || animationId}`, done, total);
      }
    }
  }

  copySounds(petStore, manifest, exportFolder, cleanManifest);
  done = totalFrames + 1;
  await report(onProgress, "Copiando sonidos usados", done, total);

  writeJson(path.join(exportFolder, "pet.json"), cleanManifest);
  done += 1;
  await report(onProgress, "Escribiendo pet.json", done, total);

  writeJson(path.join(exportFolder, "individual-images.json"), indexManifest);
  done += 1;
  await report(onProgress, "Escribiendo indice de frames", done, total);

  return { ok: true, exportFolder, frames: totalFrames };
}

async function exportPetPackage({ petStore, manifest, packagePath, workRoot, onProgress }) {
  const stagingRoot = ensureCleanExportFolder(workRoot, manifest, "pet-package-staging");

  try {
    await report(onProgress, "Preparando paquete completo", 0, 100);
    const spritesheetResult = await exportSpritesheetXml({
      petStore,
      manifest,
      destinationRoot: stagingRoot,
      onProgress: (progress) => {
        if (!onProgress) return;
        const percent = Math.min(68, Math.round((Number(progress.percent || 0) / 100) * 68));
        onProgress({ message: progress.message, current: percent, total: 100, percent });
      }
    });

    const packageManifest = {
      format: "pet-studio-package",
      version: 1,
      exportedAt: new Date().toISOString(),
      petId: manifest.id,
      name: manifest.name,
      content: {
        manifest: "pet.json",
        atlas: "pet-studio.xml",
        sprites: "sprites",
        sounds: "sounds"
      }
    };
    writeJson(path.join(spritesheetResult.exportFolder, "package.json"), packageManifest);
    await report(onProgress, "Escribiendo manifiesto del paquete", 72, 100);

    const zipResult = await createZipFromFolder(spritesheetResult.exportFolder, packagePath, (progress) => {
      if (!onProgress) return;
      const innerPercent = progress.total > 0 ? progress.current / progress.total : 1;
      const percent = 72 + Math.round(innerPercent * 26);
      onProgress({ message: progress.message, current: percent, total: 100, percent });
    });

    await report(onProgress, "Paquete completo creado", 100, 100);
    return { ok: true, packagePath, files: zipResult.files };
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

module.exports = {
  exportSpritesheetXml,
  exportIndividualImages,
  exportPetPackage
};
