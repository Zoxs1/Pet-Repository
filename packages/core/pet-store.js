const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const supportedSoundExtensions = new Set([".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac"]);

function sanitizeFilePart(value, fallback = "nuevo") {
  const cleanValue = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ");
  return cleanValue || fallback;
}

function safePetId(value) {
  return sanitizeFilePart(value, "").replace(/[\\/]/g, "");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function makeUniquePath(folderPath, baseName, extension) {
  let index = 0;
  let candidate = path.join(folderPath, `${baseName}${extension}`);

  while (fs.existsSync(candidate)) {
    index += 1;
    candidate = path.join(folderPath, `${baseName} ${index}${extension}`);
  }

  return candidate;
}

function createPetStore({ projectRoot, channel }) {
  function getChannelDataPath(targetChannel = channel) {
    return path.join(projectRoot, "data", targetChannel);
  }

  function getLibraryPath(targetChannel = channel) {
    return path.join(getChannelDataPath(targetChannel), "library");
  }

  function getSoundsRoot() {
    return path.join(getLibraryPath(), "sounds");
  }

  function getLibraryPetsRoot() {
    return path.join(getLibraryPath(), "pets");
  }

  function getConfigRoot() {
    return path.join(getLibraryPath(), "config");
  }

  function getFixturesRoot() {
    return path.join(projectRoot, "data", "fixtures");
  }

  function getDeletedFixturesPath() {
    return path.join(getConfigRoot(), "deleted-fixtures.json");
  }

  function toLibraryId(filePath) {
    const relativePath = path.relative(getLibraryPath(), filePath).split(path.sep).join("/");
    return `library://${relativePath}`;
  }

  function isPathInside(childPath, parentPath) {
    const relativePath = path.relative(parentPath, childPath);
    return relativePath === "" || (!!relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath));
  }

  function getDeletedFixtureIds() {
    const markerPath = getDeletedFixturesPath();
    if (!fs.existsSync(markerPath)) return new Set();

    try {
      const data = readJson(markerPath);
      return new Set(Array.isArray(data?.ids) ? data.ids.map(safePetId).filter(Boolean) : []);
    } catch {
      return new Set();
    }
  }

  function saveDeletedFixtureIds(ids) {
    fs.mkdirSync(getConfigRoot(), { recursive: true });
    writeJson(getDeletedFixturesPath(), { ids: [...ids].sort((a, b) => a.localeCompare(b)) });
  }

  function rememberDeletedFixture(id) {
    if (!fs.existsSync(path.join(getFixturesRoot(), id, "pet.json"))) return;
    const ids = getDeletedFixtureIds();
    ids.add(id);
    saveDeletedFixtureIds(ids);
  }

  function collectLibrarySoundRefs(manifest) {
    const soundIds = new Set();

    for (const animation of Object.values(manifest?.animations || {})) {
      const sound = normalizeLibrarySoundRef(animation?.sound);
      if (String(sound || "").startsWith("library://sounds/")) soundIds.add(sound);
    }

    return soundIds;
  }

  function removeEmptyFoldersUpTo(startFolder, stopFolder) {
    let currentFolder = startFolder;
    while (isPathInside(currentFolder, stopFolder) && currentFolder !== stopFolder) {
      try {
        if (fs.readdirSync(currentFolder).length > 0) return;
        fs.rmdirSync(currentFolder);
      } catch {
        return;
      }
      currentFolder = path.dirname(currentFolder);
    }
  }

  function countFiles(folderPath) {
    if (!fs.existsSync(folderPath)) return 0;
    let total = 0;

    function walk(currentPath) {
      for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) walk(entryPath);
        else total += 1;
      }
    }

    walk(folderPath);
    return total;
  }

  function listDeletionEntries(folderPath) {
    const files = [];
    const folders = [];
    if (!fs.existsSync(folderPath)) return { files, folders };

    function walk(currentPath) {
      for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          walk(entryPath);
          folders.push(entryPath);
        } else {
          files.push(entryPath);
        }
      }
    }

    walk(folderPath);
    folders.push(folderPath);
    return { files, folders };
  }

  function removeFolderContents(folderPath, options = {}) {
    const { files, folders } = listDeletionEntries(folderPath);
    const total = files.length + folders.length;
    let current = 0;

    for (const filePath of files) {
      fs.rmSync(filePath, { force: true });
      current += 1;
      options.onProgress?.({
        message: `${options.label || "Eliminando archivos"}: ${path.basename(filePath)}`,
        current,
        total
      });
    }

    for (const targetFolder of folders) {
      fs.rmdirSync(targetFolder);
      current += 1;
      options.onProgress?.({
        message: `${options.label || "Eliminando carpetas"}: ${path.basename(targetFolder)}`,
        current,
        total
      });
    }

    return { files: files.length, folders: folders.length };
  }

  function collectLibrarySoundIdsFromFolder(folderPath) {
    const soundIds = new Set();
    if (!fs.existsSync(folderPath)) return soundIds;

    function walk(currentPath) {
      for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          walk(entryPath);
          continue;
        }

        if (supportedSoundExtensions.has(path.extname(entry.name).toLowerCase())) {
          soundIds.add(toLibraryId(entryPath));
        }
      }
    }

    walk(folderPath);
    return soundIds;
  }

  function listSoundFolders() {
    const soundsRoot = getSoundsRoot();
    fs.mkdirSync(soundsRoot, { recursive: true });
    const folders = new Set();

    for (const entry of fs.readdirSync(soundsRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) folders.add(entry.name);
    }

    return [...folders].sort((a, b) => a.localeCompare(b));
  }

  function listLibrarySounds() {
    const soundsRoot = getSoundsRoot();
    fs.mkdirSync(soundsRoot, { recursive: true });
    const sounds = [];

    function walk(folderPath) {
      for (const entry of fs.readdirSync(folderPath, { withFileTypes: true })) {
        const entryPath = path.join(folderPath, entry.name);
        if (entry.isDirectory()) {
          walk(entryPath);
          continue;
        }

        if (!supportedSoundExtensions.has(path.extname(entry.name).toLowerCase())) continue;
        const relativePath = path.relative(soundsRoot, entryPath).split(path.sep).join("/");
        sounds.push({
          id: toLibraryId(entryPath),
          name: path.basename(entry.name, path.extname(entry.name)),
          folder: path.dirname(relativePath) === "." ? "" : path.dirname(relativePath).split(path.sep).join("/"),
          relativePath
        });
      }
    }

    walk(soundsRoot);
    return sounds.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  }

  function findLibrarySoundByBasename(fileName) {
    if (!fileName) return null;
    const sounds = listLibrarySounds();
    return sounds.find((sound) => path.basename(sound.relativePath) === fileName) || null;
  }

  function resolveLibraryPath(libraryId) {
    const relativePath = String(libraryId).slice("library://".length);
    const exactPath = path.join(getLibraryPath(), relativePath);
    if (fs.existsSync(exactPath)) return exactPath;

    if (relativePath.startsWith("sounds/")) {
      const fallback = findLibrarySoundByBasename(path.basename(relativePath));
      if (fallback) return path.join(getLibraryPath(), fallback.id.slice("library://".length));
    }

    return exactPath;
  }

  function normalizeLibrarySoundRef(soundId) {
    if (!String(soundId || "").startsWith("library://sounds/")) return soundId;
    const exactPath = resolveLibraryPath(soundId);
    if (fs.existsSync(exactPath)) return toLibraryId(exactPath);
    return soundId;
  }

  function resolveAsset(baseDir, assetPath) {
    if (!assetPath) return null;
    if (String(assetPath).startsWith("library://")) {
      return pathToFileURL(resolveLibraryPath(assetPath)).toString();
    }
    return pathToFileURL(path.resolve(baseDir, assetPath)).toString();
  }

  function parsePetRef(ref) {
    const raw = String(ref || "");
    if (raw.includes(":")) {
      const [source, ...idParts] = raw.split(":");
      return { source, id: safePetId(idParts.join(":")) };
    }

    const id = safePetId(raw);
    const libraryPath = path.join(getLibraryPetsRoot(), id, "pet.json");
    return {
      source: fs.existsSync(libraryPath) ? "library" : "fixture",
      id
    };
  }

  function formatPetRef(source, id) {
    return `${source}:${id}`;
  }

  function getPetManifestPath(ref) {
    const parsed = parsePetRef(ref);
    if (!parsed.id) return null;

    const baseDir = parsed.source === "library"
      ? path.join(getLibraryPetsRoot(), parsed.id)
      : path.join(getFixturesRoot(), parsed.id);

    return path.join(baseDir, "pet.json");
  }

  function listPets() {
    const pets = [];
    const seen = new Set();
    const deletedFixtureIds = getDeletedFixtureIds();
    const libraryRoot = getLibraryPetsRoot();
    const fixturesRoot = getFixturesRoot();
    fs.mkdirSync(libraryRoot, { recursive: true });
    fs.mkdirSync(fixturesRoot, { recursive: true });

    for (const entry of fs.readdirSync(libraryRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(libraryRoot, entry.name, "pet.json");
      if (!fs.existsSync(manifestPath)) continue;
      const manifest = readJson(manifestPath);
      pets.push({
        ref: formatPetRef("library", entry.name),
        id: entry.name,
        name: manifest.name || entry.name,
        source: "library",
        editable: true,
        hasManifest: true
      });
      seen.add(entry.name);
    }

    for (const entry of fs.readdirSync(fixturesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (deletedFixtureIds.has(entry.name)) continue;
      const manifestPath = path.join(fixturesRoot, entry.name, "pet.json");
      if (!fs.existsSync(manifestPath)) continue;
      const manifest = readJson(manifestPath);
      pets.push({
        ref: formatPetRef("fixture", entry.name),
        id: entry.name,
        name: seen.has(entry.name) ? `${manifest.name || entry.name} (ejemplo)` : manifest.name || entry.name,
        source: "fixture",
        editable: false,
        hasManifest: true
      });
    }

    return pets.sort((a, b) => Number(b.editable) - Number(a.editable) || a.name.localeCompare(b.name));
  }

  function hydratePetManifest(ref) {
    const parsed = parsePetRef(ref);
    const manifestPath = getPetManifestPath(ref);
    if (!manifestPath || !fs.existsSync(manifestPath)) {
      throw new Error("No se encontro el pet.json");
    }

    const baseDir = path.dirname(manifestPath);
    const manifest = readJson(manifestPath);
    const animations = {};

    for (const [id, animation] of Object.entries(manifest.animations || {})) {
      const normalizedSound = normalizeLibrarySoundRef(animation.sound);
      animations[id] = {
        ...animation,
        sound: normalizedSound,
        sourceUrl: resolveAsset(baseDir, animation.source),
        soundUrl: resolveAsset(baseDir, normalizedSound)
      };
    }

    return {
      ...manifest,
      petRef: formatPetRef(parsed.source, parsed.id),
      editable: parsed.source === "library",
      manifestPath,
      baseDir,
      iconUrl: resolveAsset(baseDir, manifest.icon),
      animations
    };
  }

  function dehydratePetManifest(manifest) {
    const cleanManifest = JSON.parse(JSON.stringify(manifest));
    delete cleanManifest.petRef;
    delete cleanManifest.editable;
    delete cleanManifest.manifestPath;
    delete cleanManifest.baseDir;
    delete cleanManifest.iconUrl;

    for (const animation of Object.values(cleanManifest.animations || {})) {
      if (animation.sound) animation.sound = normalizeLibrarySoundRef(animation.sound);
      delete animation.sourceUrl;
      delete animation.soundUrl;
    }

    return cleanManifest;
  }

  function savePet(ref, manifest) {
    const parsed = parsePetRef(ref);
    if (parsed.source !== "library") {
      return { ok: false, reason: "Los ejemplos base son de solo lectura. Usa la copia editable de biblioteca." };
    }

    const manifestPath = getPetManifestPath(ref);
    if (!manifestPath || !fs.existsSync(manifestPath)) return { ok: false, reason: "No se encontro el pet.json" };

    writeJson(manifestPath, dehydratePetManifest(manifest));
    return { ok: true, manifestPath };
  }

  function ensureEditablePetFromFixture(id) {
    const safeId = safePetId(id);
    if (getDeletedFixtureIds().has(safeId)) return;
    const sourceDir = path.join(getFixturesRoot(), safeId);
    const targetDir = path.join(getLibraryPetsRoot(), safeId);
    const targetManifest = path.join(targetDir, "pet.json");
    if (fs.existsSync(targetManifest) || !fs.existsSync(path.join(sourceDir, "pet.json"))) return;

    fs.mkdirSync(targetDir, { recursive: true });
    fs.cpSync(sourceDir, targetDir, { recursive: true });
  }

  function deletePet(ref, options = {}) {
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;
    const sendProgress = (step, message) => {
      onProgress?.({
        message,
        current: step,
        total: 100,
        percent: step
      });
    };

    const parsed = parsePetRef(ref);
    if (parsed.source !== "library") {
      return { ok: false, reason: "Los ejemplos base no se eliminan desde la biblioteca editable." };
    }

    const manifestPath = getPetManifestPath(ref);
    if (!manifestPath || !fs.existsSync(manifestPath)) {
      return { ok: false, reason: "No se encontro la mascota." };
    }

    const petsRoot = getLibraryPetsRoot();
    const petFolder = path.dirname(manifestPath);
    if (!isPathInside(petFolder, petsRoot) || petFolder === petsRoot) {
      return { ok: false, reason: "Ruta de mascota no valida." };
    }

    const manifest = readJson(manifestPath);
    sendProgress(12, "Leyendo pet.json y preparando limpieza");
    const petSoundIds = collectLibrarySoundRefs(manifest);
    const sharedSoundIds = new Set();

    sendProgress(20, "Revisando sonidos compartidos con otras mascotas");
    for (const pet of listPets()) {
      if (pet.ref === formatPetRef(parsed.source, parsed.id) || pet.source !== "library") continue;
      const otherManifestPath = getPetManifestPath(pet.ref);
      if (!otherManifestPath || !fs.existsSync(otherManifestPath)) continue;
      for (const soundId of collectLibrarySoundRefs(readJson(otherManifestPath))) {
        sharedSoundIds.add(soundId);
      }
    }

    const soundsRoot = getSoundsRoot();
    const removedLibrarySounds = [];
    const removedLibrarySoundFolders = [];
    let soundStep = 30;
    for (const soundId of petSoundIds) {
      if (sharedSoundIds.has(soundId)) continue;
      const soundPath = resolveLibraryPath(soundId);
      if (!fs.existsSync(soundPath) || !isPathInside(soundPath, soundsRoot) || soundPath === soundsRoot) continue;
      fs.rmSync(soundPath, { force: true });
      removedLibrarySounds.push(path.relative(soundsRoot, soundPath).split(path.sep).join("/"));
      soundStep = Math.min(45, soundStep + 5);
      sendProgress(soundStep, `Eliminando sonido de galeria: ${path.basename(soundPath)}`);
      removeEmptyFoldersUpTo(path.dirname(soundPath), soundsRoot);
    }

    const relatedSoundFolderNames = new Set(
      [parsed.id, manifest.id, manifest.name]
        .map((value) => sanitizeFilePart(value, ""))
        .filter(Boolean)
    );

    for (const folderName of relatedSoundFolderNames) {
      const folderPath = path.join(soundsRoot, folderName);
      if (!fs.existsSync(folderPath) || !isPathInside(folderPath, soundsRoot) || folderPath === soundsRoot) continue;

      const folderSoundIds = collectLibrarySoundIdsFromFolder(folderPath);
      const hasSharedSound = [...folderSoundIds].some((soundId) => sharedSoundIds.has(soundId));
      if (hasSharedSound) continue;

      sendProgress(48, `Eliminando carpeta de sonidos relacionada: ${folderName}`);
      removeFolderContents(folderPath, {
        label: "Eliminando sonidos relacionados",
        onProgress: (progress) => {
          const percent = 48 + Math.round((progress.current / Math.max(1, progress.total)) * 12);
          sendProgress(percent, progress.message);
        }
      });
      removedLibrarySoundFolders.push(path.relative(soundsRoot, folderPath).split(path.sep).join("/"));
    }

    const removedPetFiles = countFiles(petFolder);
    sendProgress(64, "Eliminando archivos internos de la mascota");
    removeFolderContents(petFolder, {
      label: "Eliminando mascota",
      onProgress: (progress) => {
        const percent = 64 + Math.round((progress.current / Math.max(1, progress.total)) * 30);
        sendProgress(Math.min(94, percent), progress.message);
      }
    });
    sendProgress(96, "Registrando eliminacion en la biblioteca");
    rememberDeletedFixture(parsed.id);
    sendProgress(100, "Mascota eliminada por completo");

    return {
      ok: true,
      petId: parsed.id,
      petName: manifest.name || parsed.id,
      removedPetFiles,
      removedLibrarySounds,
      removedLibrarySoundFolders
    };
  }

  function importSound(options = {}) {
    const sourcePath = options.sourcePath;
    if (!sourcePath) return { ok: false, reason: "No se eligio ningun archivo." };

    const sourceExtension = path.extname(sourcePath).toLowerCase();
    const folderName = sanitizeFilePart(options.folderName, "");
    const baseName = sanitizeFilePart(options.displayName || path.basename(sourcePath, sourceExtension), "sonido");
    const targetFolder = folderName ? path.join(getSoundsRoot(), folderName) : getSoundsRoot();
    fs.mkdirSync(targetFolder, { recursive: true });

    const targetPath = makeUniquePath(targetFolder, baseName, sourceExtension);
    fs.copyFileSync(sourcePath, targetPath);

    return {
      ok: true,
      sound: {
        id: toLibraryId(targetPath),
        name: path.basename(targetPath, path.extname(targetPath)),
        folder: folderName,
        relativePath: path.relative(getSoundsRoot(), targetPath).split(path.sep).join("/")
      },
      folders: listSoundFolders(),
      sounds: listLibrarySounds()
    };
  }

  return {
    getChannelDataPath,
    getLibraryPath,
    getPetManifestPath,
    ensureEditablePetFromFixture,
    listPets,
    hydratePetManifest,
    savePet,
    deletePet,
    listSoundFolders,
    listLibrarySounds,
    importSound,
    resolveLibraryPath,
    normalizeLibrarySoundRef,
    sanitizeFilePart,
    safePetId
  };
}

module.exports = {
  createPetStore,
  supportedSoundExtensions
};
