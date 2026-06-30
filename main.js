const { app, BrowserWindow, Menu, ipcMain, screen, shell, dialog, clipboard } = require("electron");
const crypto = require("crypto");
const fs = require("fs");
const https = require("https");
const path = require("path");
const { pathToFileURL } = require("url");
const { removeBackground } = require("@imgly/background-removal-node");
const { createPetStore } = require("./packages/core/pet-store");
const { exportSpritesheetXml, exportIndividualImages, exportPetPackage } = require("./packages/core/pet-exporter");
const {
  preparePackageImport,
  installPackageImport,
  prepareIndividualImagesImport,
  installIndividualImagesImport
} = require("./packages/core/pet-importer");

const projectRoot = __dirname;
const channel = process.env.APP_CHANNEL === "prod" ? "prod" : "dev";
const appMode = process.env.PET_STUDIO_APP === "mobile" ? "mobile" : "dev-lab";
let mainWindow = null;
const petWindows = new Map();
const pendingImports = new Map();
const startupLogPath = path.join(projectRoot, "data", "dev", "startup.log");
const petStore = createPetStore({ projectRoot, channel });
const updateRepository = {
  owner: "Zoxs1",
  repo: "Pet-Repository",
  apiBase: "https://api.github.com/repos/Zoxs1/Pet-Repository"
};
const libraryFolders = [
  path.join("library", "pets"),
  path.join("library", "sounds"),
  path.join("library", "imports", "spritesheet-xml"),
  path.join("library", "imports", "individual-images"),
  path.join("library", "imports", "packages"),
  path.join("library", "imports", "background-removal"),
  path.join("library", "exports", "spritesheet-xml"),
  path.join("library", "exports", "individual-images"),
  path.join("library", "exports", "packages"),
  path.join("library", "config")
];

const windowConfigs = {
  "dev-lab": {
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    title: "Pet Studio Dev",
    entry: path.join(projectRoot, "apps", "dev-lab", "index.html")
  },
  mobile: {
    width: 430,
    height: 860,
    minWidth: 360,
    minHeight: 640,
    title: "Pet Studio Mobile Dev",
    entry: path.join(projectRoot, "apps", "mobile", "index.html")
  }
};

function logStartup(message) {
  fs.mkdirSync(path.dirname(startupLogPath), { recursive: true });
  fs.appendFileSync(startupLogPath, `${new Date().toISOString()} ${message}\n`, "utf8");
}

process.on("uncaughtException", (error) => {
  logStartup(`uncaughtException: ${error.stack || error.message}`);
});

process.on("unhandledRejection", (error) => {
  logStartup(`unhandledRejection: ${error?.stack || error}`);
});

function createWindow() {
  const config = windowConfigs[appMode];
  logStartup("creating window");
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    title: config.title,
    backgroundColor: "#111317",
    webPreferences: {
      preload: path.join(projectRoot, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  setupApplicationMenu();
  const indexPath = config.entry;
  logStartup(`loading ${indexPath}`);
  mainWindow.loadFile(indexPath);
  mainWindow.on("closed", () => {
    logStartup("window closed");
    mainWindow = null;
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sendMenuAction(action, payload = {}) {
  if (!mainWindow) return;
  mainWindow.webContents.send("menu:action", { action, payload });
}

function sendExportProgress(payload = {}) {
  if (!mainWindow) return;
  mainWindow.webContents.send("export:progress", payload);
}

function openProjectPath(...parts) {
  shell.openPath(path.join(projectRoot, ...parts));
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Pet-Studio-Updater"
      }
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        let data = null;
        try {
          data = body ? JSON.parse(body) : null;
        } catch (error) {
          reject(new Error(`Respuesta invalida de GitHub: ${error.message}`));
          return;
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(data);
          return;
        }

        const reason = data?.message || `HTTP ${response.statusCode}`;
        const requestError = new Error(reason);
        requestError.statusCode = response.statusCode;
        reject(requestError);
      });
    });

    request.setTimeout(15000, () => {
      request.destroy(new Error("Tiempo de espera agotado al conectar con GitHub."));
    });
    request.on("error", reject);
  });
}

function parseVersionParts(version = "") {
  return String(version)
    .replace(/^v/i, "")
    .split(/[.-]/)
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));
}

function compareVersions(left = "0.0.0", right = "0.0.0") {
  const a = parseVersionParts(left);
  const b = parseVersionParts(right);
  const length = Math.max(a.length, b.length, 3);
  for (let index = 0; index < length; index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function normalizeRelease(release = {}) {
  const assets = Array.isArray(release.assets)
    ? release.assets.map((asset) => ({
        name: asset.name || "",
        size: Number(asset.size) || 0,
        downloadUrl: asset.browser_download_url || "",
        contentType: asset.content_type || ""
      }))
    : [];

  const findAsset = (predicate) => assets.find(predicate) || null;
  return {
    tag: release.tag_name || "",
    version: String(release.tag_name || release.name || "").replace(/^v/i, ""),
    name: release.name || release.tag_name || "Release",
    notes: release.body || "",
    publishedAt: release.published_at || "",
    releaseUrl: release.html_url || "",
    assets,
    setupAsset: findAsset((asset) => /\.exe$/i.test(asset.name) && /setup/i.test(asset.name)),
    portableAsset: findAsset((asset) => /\.exe$/i.test(asset.name) && /portable/i.test(asset.name)),
    apkAsset: findAsset((asset) => /\.apk$/i.test(asset.name)),
    latestYmlAsset: findAsset((asset) => /latest\.ya?ml$/i.test(asset.name)),
    blockmapAsset: findAsset((asset) => /\.blockmap$/i.test(asset.name))
  };
}

async function fetchLatestRelease() {
  try {
    return await requestJson(`${updateRepository.apiBase}/releases/latest`);
  } catch (error) {
    if (error.statusCode !== 404) throw error;
    const releases = await requestJson(`${updateRepository.apiBase}/releases`);
    if (!Array.isArray(releases) || releases.length === 0) return null;
    return releases[0];
  }
}

function getChannelDataPath(targetChannel = channel) {
  return petStore.getChannelDataPath(targetChannel);
}

function getLibraryPath(targetChannel = channel) {
  return petStore.getLibraryPath(targetChannel);
}

function ensureDataDirectories() {
  for (const targetChannel of ["dev", "prod"]) {
    for (const folder of libraryFolders) {
      fs.mkdirSync(path.join(getChannelDataPath(targetChannel), folder), { recursive: true });
    }
  }
}

function resizeMobileWindow(width, height) {
  if (!mainWindow) return;
  mainWindow.setContentSize(width, height);
  mainWindow.center();
}

function setupApplicationMenu() {
  const mobileMenu = appMode === "mobile"
    ? [{
        label: "Dispositivo",
        submenu: [
          { label: "iPhone SE 375 x 667", click: () => resizeMobileWindow(375, 667) },
          { label: "iPhone 15 393 x 852", click: () => resizeMobileWindow(393, 852) },
          { label: "Xiaomi medio 393 x 873", click: () => resizeMobileWindow(393, 873) },
          { label: "Tablet 820 x 1180", click: () => resizeMobileWindow(820, 1180) }
        ]
      }]
    : [];

  const template = [
    {
      label: "Archivo",
      submenu: [
        { label: "Recargar mascota", accelerator: "CmdOrCtrl+L", click: () => sendMenuAction("reload-pet") },
        { label: "Lanzar mascota", accelerator: "CmdOrCtrl+Enter", click: () => sendMenuAction("launch-pet") },
        { label: "Guardar mascota", accelerator: "CmdOrCtrl+S", click: () => sendMenuAction("save-pet") },
        { label: "Eliminar mascota", click: () => sendMenuAction("delete-pet") },
        { type: "separator" },
        {
          label: "Importacion",
          submenu: [
            { label: "Paquete completo", click: () => sendMenuAction("import-pet-package") },
            { label: "Spritesheet and XML", click: () => sendMenuAction("import-spritesheet-xml") },
            { label: "Individual images", click: () => sendMenuAction("import-individual-images") }
          ]
        },
        {
          label: "Exportacion",
          submenu: [
            { label: "Paquete completo", click: () => sendMenuAction("export-pet-package") },
            { label: "Spritesheet and XML", click: () => sendMenuAction("export-spritesheet-xml") },
            { label: "Individual images", click: () => sendMenuAction("export-individual-images") }
          ]
        },
        { type: "separator" },
        { label: "Abrir carpeta del proyecto", click: () => openProjectPath() },
        { label: "Abrir datos Dev", click: () => openProjectPath("data", "dev") },
        { label: "Abrir biblioteca activa", click: () => shell.openPath(getLibraryPath()) },
        { label: "Abrir fixtures", click: () => openProjectPath("data", "fixtures") },
        { type: "separator" },
        { label: "Salir", role: "quit" }
      ]
    },
    {
      label: "Ver",
      submenu: [
        { label: "Mostrar/Ocultar editor", accelerator: "CmdOrCtrl+E", click: () => sendMenuAction("toggle-editor") },
        { label: "Reiniciar camara", accelerator: "CmdOrCtrl+0", click: () => sendMenuAction("reset-camera") },
        { type: "separator" },
        { label: "Recargar ventana", accelerator: "CmdOrCtrl+R", click: () => mainWindow?.reload() },
        { label: "Herramientas de desarrollo", accelerator: "F12", click: () => mainWindow?.webContents.toggleDevTools() },
        { label: "Pantalla completa", role: "togglefullscreen" }
      ]
    },
    {
      label: "Reproduccion",
      submenu: [
        { label: "Play/Pausa", accelerator: "Space", click: () => sendMenuAction("toggle-play") },
        { label: "Bucle", accelerator: "CmdOrCtrl+B", click: () => sendMenuAction("toggle-loop") },
        { label: "Siempre activo", accelerator: "CmdOrCtrl+Shift+P", click: () => sendMenuAction("toggle-auto-play") },
        { label: "Reiniciar animacion", accelerator: "CmdOrCtrl+Shift+R", click: () => sendMenuAction("restart-animation") }
      ]
    },
    {
      label: "Promts",
      submenu: [
        { label: "Abrir biblioteca", click: () => sendMenuAction("open-prompts") },
        { type: "separator" },
        { label: "Frontal chibi - prompt normal", click: () => sendMenuAction("open-prompts", { promptId: "front-normal" }) },
        { label: "Frontal chibi - JSON", click: () => sendMenuAction("open-prompts", { promptId: "front-json" }) },
        { type: "separator" },
        { label: "4 vistas chibi - prompt normal", click: () => sendMenuAction("open-prompts", { promptId: "turnaround-normal" }) },
        { label: "4 vistas chibi - JSON", click: () => sendMenuAction("open-prompts", { promptId: "turnaround-json" }) },
        { type: "separator" },
        { label: "Agregar outline - prompt normal", click: () => sendMenuAction("open-prompts", { promptId: "add-outline-normal" }) },
        { label: "Agregar outline - JSON", click: () => sendMenuAction("open-prompts", { promptId: "add-outline-json" }) }
      ]
    },
    {
      label: "Herramientas",
      submenu: [
        { label: "Recortador de frames", accelerator: "CmdOrCtrl+Shift+F", click: () => sendMenuAction("open-sprite-cutter") }
      ]
    },
    {
      label: "Actualizaciones",
      submenu: [
        { label: "Abrir centro de actualizaciones", click: () => sendMenuAction("open-update-center") },
        { type: "separator" },
        { label: "Buscar actualizacion", click: () => sendMenuAction("check-updates") },
        { label: "Descargar actualizacion", enabled: false },
        { label: "Instalar y reiniciar", enabled: false }
      ]
    },
    ...mobileMenu,
    {
      label: "Desarrollo",
      submenu: [
        { label: `Modo actual: ${appMode}`, enabled: false },
        { label: `Canal: ${channel}`, enabled: false },
        { type: "separator" },
        { label: "Validar mascotas", click: () => sendMenuAction("show-pet-status") }
      ]
    },
    {
      label: "Ayuda",
      submenu: [
        { label: "Acerca de Pet Studio", click: () => sendMenuAction("show-about") }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function launchPet(ref) {
  const petRef = String(ref || "");
  if (!petRef) return { ok: false, reason: "Mascota no valida" };

  const existingWindow = petWindows.get(petRef);
  if (existingWindow && !existingWindow.isDestroyed()) {
    existingWindow.show();
    existingWindow.focus();
    return { ok: true, reused: true };
  }

  const manifestPath = petStore.getPetManifestPath(petRef);
  if (!fs.existsSync(manifestPath)) {
    return { ok: false, reason: "No se encontro la mascota" };
  }

  const { workArea } = screen.getPrimaryDisplay();
  const width = 340;
  const height = 340;
  const petWindow = new BrowserWindow({
    width,
    height,
    x: Math.round(workArea.x + workArea.width - width - 36),
    y: Math.round(workArea.y + workArea.height - height - 36),
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(projectRoot, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  petWindow.setAlwaysOnTop(true, "screen-saver");
  petWindow.loadFile(path.join(projectRoot, "apps", "desktop", "pet.html"), {
    query: { ref: petRef }
  });
  petWindow.on("closed", () => petWindows.delete(petRef));
  petWindows.set(petRef, petWindow);

  return { ok: true, reused: false };
}

ipcMain.handle("runtime:getInfo", () => ({
  channel,
  appMode,
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  projectRoot,
  devDataPath: path.join(projectRoot, "data", "dev"),
  prodDataPath: path.join(projectRoot, "data", "prod"),
  activeLibraryPath: getLibraryPath()
}));

ipcMain.handle("updates:check", async () => {
  const currentVersion = app.getVersion();
  try {
    const release = await fetchLatestRelease();
    if (!release) {
      return {
        ok: true,
        online: true,
        repository: updateRepository,
        currentVersion,
        hasRelease: false,
        hasUpdate: false,
        message: "Conexion OK. El repositorio existe, pero aun no tiene releases publicados."
      };
    }

    const normalized = normalizeRelease(release);
    const comparison = compareVersions(normalized.version, currentVersion);
    return {
      ok: true,
      online: true,
      repository: updateRepository,
      currentVersion,
      latestVersion: normalized.version,
      hasRelease: true,
      hasUpdate: comparison > 0,
      release: normalized,
      message: comparison > 0
        ? `Actualizacion disponible: ${normalized.version}.`
        : `No hay actualizacion nueva. Ultima version publicada: ${normalized.version || "sin version"}.`
    };
  } catch (error) {
    return {
      ok: false,
      online: false,
      repository: updateRepository,
      currentVersion,
      reason: error.message || "No se pudo consultar GitHub."
    };
  }
});

ipcMain.handle("clipboard:writeText", (_event, text = "") => {
  clipboard.writeText(String(text || ""));
  return { ok: true };
});

ipcMain.handle("pets:list", () => petStore.listPets());

ipcMain.handle("pets:load", (_event, ref) => petStore.hydratePetManifest(ref));

ipcMain.handle("pets:save", (_event, ref, manifest) => petStore.savePet(ref, manifest));

ipcMain.handle("pets:delete", (_event, ref) => {
  const petRef = String(ref || "");
  sendExportProgress({ status: "running", title: "Eliminando mascota", message: "Preparando eliminacion", current: 0, total: 100, percent: 0 });
  const existingWindow = petWindows.get(petRef);
  if (existingWindow && !existingWindow.isDestroyed()) {
    sendExportProgress({ status: "running", title: "Eliminando mascota", message: "Cerrando mascota viva", current: 6, total: 100, percent: 6 });
    existingWindow.close();
  }
  petWindows.delete(petRef);
  const result = petStore.deletePet(petRef, {
    onProgress: (progress) => sendExportProgress({ status: "running", title: "Eliminando mascota", ...progress })
  });

  if (result?.ok) {
    sendExportProgress({ status: "done", title: "Mascota eliminada", message: "Limpieza completada", current: 100, total: 100, percent: 100 });
  } else {
    sendExportProgress({ status: "error", title: "No se pudo eliminar", message: result?.reason || "La mascota no pudo eliminarse.", current: 0, total: 100, percent: 0 });
  }

  return result;
});

async function chooseExportFolder(title) {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(ownerWindow, {
    title,
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
}

function ensurePetPackageExtension(filePath) {
  if (filePath.toLowerCase().endsWith(".petpack.zip")) return filePath;
  if (filePath.toLowerCase().endsWith(".zip")) return filePath.replace(/\.zip$/i, ".petpack.zip");
  return `${filePath}.petpack.zip`;
}

function makeUniqueFolder(parentFolder, folderName) {
  let index = 0;
  let candidate = path.join(parentFolder, folderName);
  while (fs.existsSync(candidate)) {
    index += 1;
    candidate = path.join(parentFolder, `${folderName} ${index}`);
  }
  return candidate;
}

function decodePngDataUrl(dataUrl) {
  const raw = String(dataUrl || "");
  const match = raw.match(/^data:image\/png;base64,(.+)$/);
  if (!match) throw new Error("Frame PNG no valido.");
  return Buffer.from(match[1], "base64");
}

function decodeImageDataUrl(dataUrl) {
  const raw = String(dataUrl || "");
  const match = raw.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) throw new Error("Imagen no valida.");
  return Buffer.from(match[2], "base64");
}

function getBackgroundRemovalAssetsPath() {
  return `${pathToFileURL(path.join(projectRoot, "node_modules", "@imgly", "background-removal-node", "dist")).toString()}/`;
}

async function choosePetPackagePath(manifest) {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const safeName = petStore.sanitizeFilePart(manifest?.id || manifest?.name || "mascota", "mascota");
  const result = await dialog.showSaveDialog(ownerWindow, {
    title: "Exportar paquete completo",
    defaultPath: `${safeName}.petpack.zip`,
    filters: [
      { name: "Pet Studio Package", extensions: ["zip"] }
    ]
  });

  if (result.canceled || !result.filePath) return null;
  return ensurePetPackageExtension(result.filePath);
}

async function chooseImportPackagePath() {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(ownerWindow, {
    title: "Importar paquete completo",
    properties: ["openFile"],
    filters: [
      { name: "Pet Studio Package", extensions: ["zip"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
}

async function chooseIndividualImageSources() {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(ownerWindow, {
    title: "Importar imagenes individuales",
    properties: ["openFile", "openDirectory", "multiSelections"],
    filters: [
      { name: "Imagenes", extensions: ["png", "jpg", "jpeg", "webp"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths;
}

function makePendingImport(kind, payload) {
  const token = crypto.randomUUID();
  pendingImports.set(token, { kind, ...payload });
  return token;
}

function getImportsPath(...parts) {
  return path.join(getLibraryPath(), "imports", ...parts);
}

function getExportsPath(...parts) {
  return path.join(getLibraryPath(), "exports", ...parts);
}

ipcMain.handle("exports:spritesheetXml", async (_event, ref, manifest = {}) => {
  const destinationRoot = await chooseExportFolder("Exportar Spritesheet and XML");
  if (!destinationRoot) return { ok: false, canceled: true };

  sendExportProgress({ status: "running", title: "Exportando Spritesheet and XML", message: "Iniciando exportacion", current: 0, total: 1, percent: 0 });
  try {
    const storedManifest = petStore.hydratePetManifest(ref);
    const hydratedManifest = {
      ...storedManifest,
      ...manifest,
      baseDir: manifest.baseDir || storedManifest.baseDir,
      manifestPath: manifest.manifestPath || storedManifest.manifestPath
    };
    const result = await exportSpritesheetXml({
      petStore,
      manifest: hydratedManifest,
      destinationRoot,
      onProgress: (progress) => sendExportProgress({ status: "running", title: "Exportando Spritesheet and XML", ...progress })
    });
    sendExportProgress({ status: "done", title: "Exportacion completa", message: "Spritesheet and XML exportado", current: 1, total: 1, percent: 100, exportFolder: result.exportFolder });
    return result;
  } catch (error) {
    sendExportProgress({ status: "error", title: "Error al exportar", message: error.message, current: 0, total: 1, percent: 0 });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("exports:individualImages", async (_event, ref, manifest = {}) => {
  const destinationRoot = await chooseExportFolder("Exportar imagenes individuales");
  if (!destinationRoot) return { ok: false, canceled: true };

  sendExportProgress({ status: "running", title: "Exportando imagenes individuales", message: "Iniciando recorte", current: 0, total: 1, percent: 0 });
  try {
    const storedManifest = petStore.hydratePetManifest(ref);
    const hydratedManifest = {
      ...storedManifest,
      ...manifest,
      baseDir: manifest.baseDir || storedManifest.baseDir,
      manifestPath: manifest.manifestPath || storedManifest.manifestPath
    };
    const result = await exportIndividualImages({
      petStore,
      manifest: hydratedManifest,
      destinationRoot,
      onProgress: (progress) => sendExportProgress({ status: "running", title: "Exportando imagenes individuales", ...progress })
    });
    sendExportProgress({ status: "done", title: "Exportacion completa", message: "Imagenes individuales exportadas", current: 1, total: 1, percent: 100, exportFolder: result.exportFolder });
    return result;
  } catch (error) {
    sendExportProgress({ status: "error", title: "Error al exportar", message: error.message, current: 0, total: 1, percent: 0 });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("exports:petPackage", async (_event, ref, manifest = {}) => {
  const storedManifest = petStore.hydratePetManifest(ref);
  const hydratedManifest = {
    ...storedManifest,
    ...manifest,
    baseDir: manifest.baseDir || storedManifest.baseDir,
    manifestPath: manifest.manifestPath || storedManifest.manifestPath
  };
  const packagePath = await choosePetPackagePath(hydratedManifest);
  if (!packagePath) return { ok: false, canceled: true };

  sendExportProgress({ status: "running", title: "Exportando paquete completo", message: "Preparando paquete", current: 0, total: 100, percent: 0 });
  try {
    const result = await exportPetPackage({
      petStore,
      manifest: hydratedManifest,
      packagePath,
      workRoot: getExportsPath("packages"),
      onProgress: (progress) => sendExportProgress({ status: "running", title: "Exportando paquete completo", ...progress })
    });
    sendExportProgress({ status: "done", title: "Paquete completo creado", message: "Archivo .petpack.zip listo", current: 100, total: 100, percent: 100, exportFolder: result.packagePath });
    return result;
  } catch (error) {
    sendExportProgress({ status: "error", title: "Error al exportar", message: error.message, current: 0, total: 100, percent: 0 });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("imports:preparePackage", async () => {
  const packagePath = await chooseImportPackagePath();
  if (!packagePath) return { ok: false, canceled: true };

  sendExportProgress({ status: "running", title: "Revisando paquete", message: "Extrayendo paquete", current: 0, total: 100, percent: 0 });
  try {
    const prepared = preparePackageImport({
      zipPath: packagePath,
      tempRoot: getImportsPath("packages"),
      onProgress: (progress) => {
        const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
        sendExportProgress({ status: "running", title: "Revisando paquete", message: progress.message, current: progress.current, total: progress.total, percent });
      }
    });
    const token = makePendingImport("package", {
      workspaceFolder: prepared.workspaceFolder,
      packageRoot: prepared.packageRoot
    });
    sendExportProgress({ status: "done", title: "Revision lista", message: "Paquete listo para revisar", current: 100, total: 100, percent: 100 });
    return { ok: true, review: { ...prepared.review, token } };
  } catch (error) {
    sendExportProgress({ status: "error", title: "Error al revisar", message: error.message, current: 0, total: 100, percent: 0 });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("imports:prepareIndividualImages", async () => {
  const sourcePaths = await chooseIndividualImageSources();
  if (!sourcePaths) return { ok: false, canceled: true };

  try {
    const prepared = prepareIndividualImagesImport({ sourcePaths });
    const token = makePendingImport("individual-images", {
      groups: prepared.groups
    });
    return { ok: true, review: { ...prepared.review, token } };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("imports:confirm", async (_event, token, options = {}) => {
  const pending = pendingImports.get(token);
  if (!pending) return { ok: false, reason: "La importacion ya no esta disponible." };

  sendExportProgress({ status: "running", title: "Importando mascota", message: "Preparando biblioteca", current: 0, total: 100, percent: 0 });
  try {
    const progress = (value) => sendExportProgress({ status: "running", title: "Importando mascota", ...value });
    const result = pending.kind === "package"
      ? installPackageImport({
          petStore,
          packageRoot: pending.packageRoot,
          petId: options.petId,
          petName: options.petName,
          onProgress: progress
        })
      : installIndividualImagesImport({
          petStore,
          groups: pending.groups,
          petId: options.petId,
          petName: options.petName,
          onProgress: progress
        });

    pendingImports.delete(token);
    if (pending.workspaceFolder) fs.rmSync(pending.workspaceFolder, { recursive: true, force: true });
    sendExportProgress({ status: "done", title: "Importacion completa", message: "Mascota lista para editar", current: 100, total: 100, percent: 100 });
    return result;
  } catch (error) {
    sendExportProgress({ status: "error", title: "Error al importar", message: error.message, current: 0, total: 100, percent: 0 });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("imports:cancel", (_event, token) => {
  const pending = pendingImports.get(token);
  if (!pending) return { ok: true };
  pendingImports.delete(token);
  if (pending.workspaceFolder) fs.rmSync(pending.workspaceFolder, { recursive: true, force: true });
  return { ok: true };
});

ipcMain.handle("spriteCutter:chooseImage", async () => {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(ownerWindow, {
    title: "Abrir spritesheet para recortar",
    properties: ["openFile"],
    filters: [
      { name: "Imagenes", extensions: ["png", "jpg", "jpeg", "webp"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };
  const filePath = result.filePaths[0];
  return {
    ok: true,
    filePath,
    fileUrl: pathToFileURL(filePath).toString(),
    name: path.basename(filePath, path.extname(filePath))
  };
});

ipcMain.handle("imageTools:removeBackground", async (_event, payload = {}) => {
  const model = ["small", "medium", "large"].includes(payload.model) ? payload.model : "medium";
  const inputBuffer = decodeImageDataUrl(payload.dataUrl);
  const outputFolder = path.join(getLibraryPath(), "imports", "background-removal");
  fs.mkdirSync(outputFolder, { recursive: true });

  sendExportProgress({
    status: "running",
    title: "Quitando fondo IA",
    message: `Preparando modelo ${model}`,
    current: 0,
    total: 100,
    percent: 0
  });

  try {
    const blob = await removeBackground(inputBuffer, {
      publicPath: getBackgroundRemovalAssetsPath(),
      model,
      output: {
        format: "image/png",
        quality: 1
      },
      progress: (key, current, total) => {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        sendExportProgress({
          status: "running",
          title: "Quitando fondo IA",
          message: `${key}`,
          current,
          total,
          percent
        });
      }
    });

    const outputBuffer = Buffer.from(await blob.arrayBuffer());
    const fileName = `background-removed-${Date.now()}.png`;
    const outputPath = path.join(outputFolder, fileName);
    fs.writeFileSync(outputPath, outputBuffer);
    sendExportProgress({
      status: "done",
      title: "Fondo removido",
      message: "Imagen lista para recortar",
      current: 100,
      total: 100,
      percent: 100
    });

    return {
      ok: true,
      dataUrl: `data:image/png;base64,${outputBuffer.toString("base64")}`,
      filePath: outputPath,
      fileUrl: pathToFileURL(outputPath).toString()
    };
  } catch (error) {
    sendExportProgress({
      status: "error",
      title: "Error al quitar fondo IA",
      message: error.message,
      current: 0,
      total: 100,
      percent: 0
    });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("spriteCutter:exportFrames", async (_event, payload = {}) => {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const animations = Array.isArray(payload.animations) ? payload.animations : [];
  const totalFrames = animations.reduce((total, animation) => total + (Array.isArray(animation.frames) ? animation.frames.length : 0), 0);
  if (totalFrames === 0) return { ok: false, reason: "No hay frames para exportar." };

  const result = await dialog.showOpenDialog(ownerWindow, {
    title: "Guardar frames recortados",
    properties: ["openDirectory", "createDirectory"]
  });

  if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };

  const petName = petStore.sanitizeFilePart(payload.petName || "Mascota", "Mascota");
  const exportRoot = makeUniqueFolder(result.filePaths[0], petName);
  fs.mkdirSync(exportRoot, { recursive: true });

  sendExportProgress({ status: "running", title: "Exportando frames", message: "Preparando carpetas", current: 0, total: totalFrames, percent: 0 });
  let current = 0;

  try {
    for (const animation of animations) {
      const animationName = petStore.sanitizeFilePart(animation.name || "Animation", "Animation");
      const animationFolder = path.join(exportRoot, animationName);
      fs.mkdirSync(animationFolder, { recursive: true });

      for (const [index, frame] of (animation.frames || []).entries()) {
        const fileName = `${animationName}_${String(index).padStart(3, "0")}.png`;
        fs.writeFileSync(path.join(animationFolder, fileName), decodePngDataUrl(frame.dataUrl));
        current += 1;
        const percent = Math.round((current / totalFrames) * 100);
        sendExportProgress({
          status: "running",
          title: "Exportando frames",
          message: `${animationName}: ${fileName}`,
          current,
          total: totalFrames,
          percent
        });
      }
    }

    sendExportProgress({ status: "done", title: "Frames exportados", message: "Carpetas listas para importar", current: totalFrames, total: totalFrames, percent: 100 });
    return { ok: true, exportFolder: exportRoot, totalFrames };
  } catch (error) {
    sendExportProgress({ status: "error", title: "Error al exportar frames", message: error.message, current, total: totalFrames, percent: 0 });
    return { ok: false, reason: error.message };
  }
});

ipcMain.handle("library:listSounds", () => ({
  folders: petStore.listSoundFolders(),
  sounds: petStore.listLibrarySounds()
}));

ipcMain.handle("library:openSoundsFolder", () => {
  const soundsRoot = path.join(getLibraryPath(), "sounds");
  fs.mkdirSync(soundsRoot, { recursive: true });
  shell.openPath(soundsRoot);
  return { ok: true, path: soundsRoot };
});

ipcMain.handle("library:importSound", async (_event, options = {}) => {
  const ownerWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(ownerWindow, {
    title: "Importar sonido",
    properties: ["openFile"],
    filters: [
      { name: "Audio", extensions: ["wav", "mp3", "ogg", "m4a", "aac", "flac"] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false, canceled: true };
  }

  return petStore.importSound({
    ...options,
    sourcePath: result.filePaths[0]
  });
});

ipcMain.handle("pets:launch", (_event, ref) => launchPet(ref));

ipcMain.handle("petWindow:moveBy", (event, deltaX, deltaY, options = {}) => {
  const petWindow = BrowserWindow.fromWebContents(event.sender);
  if (!petWindow || petWindow.isDestroyed()) return;

  const [currentX, currentY] = petWindow.getPosition();
  const [width, height] = petWindow.getSize();
  const display = screen.getDisplayMatching({ x: currentX, y: currentY, width, height });
  const { workArea } = display;
  const edgeOverflow = clamp(Number(options.edgeOverflow || 0), 0, 160);
  const nextX = clamp(
    Math.round(currentX + Number(deltaX || 0)),
    workArea.x - edgeOverflow,
    workArea.x + workArea.width - width + edgeOverflow
  );
  const nextY = clamp(
    Math.round(currentY + Number(deltaY || 0)),
    workArea.y - edgeOverflow,
    workArea.y + workArea.height - height + edgeOverflow
  );

  petWindow.setPosition(nextX, nextY, false);
});

ipcMain.handle("petWindow:getInfo", (event) => {
  const petWindow = BrowserWindow.fromWebContents(event.sender);
  if (!petWindow || petWindow.isDestroyed()) return null;

  const [x, y] = petWindow.getPosition();
  const [width, height] = petWindow.getSize();
  return { x, y, width, height };
});

ipcMain.handle("screen:getCursorPoint", () => screen.getCursorScreenPoint());

ipcMain.handle("petWindow:close", (event) => {
  const petWindow = BrowserWindow.fromWebContents(event.sender);
  if (petWindow && !petWindow.isDestroyed()) petWindow.close();
});

app.whenReady().then(() => {
  logStartup("app ready");
  ensureDataDirectories();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
