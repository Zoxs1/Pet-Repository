const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("petStudio", {
  getRuntimeInfo: () => ipcRenderer.invoke("runtime:getInfo"),
  listPets: () => ipcRenderer.invoke("pets:list"),
  loadPet: (ref) => ipcRenderer.invoke("pets:load", ref),
  savePet: (ref, manifest) => ipcRenderer.invoke("pets:save", ref, manifest),
  deletePet: (ref) => ipcRenderer.invoke("pets:delete", ref),
  launchPet: (ref) => ipcRenderer.invoke("pets:launch", ref),
  exportPetPackage: (ref, manifest) => ipcRenderer.invoke("exports:petPackage", ref, manifest),
  exportSpritesheetXml: (ref, manifest) => ipcRenderer.invoke("exports:spritesheetXml", ref, manifest),
  exportIndividualImages: (ref, manifest) => ipcRenderer.invoke("exports:individualImages", ref, manifest),
  preparePackageImport: () => ipcRenderer.invoke("imports:preparePackage"),
  prepareIndividualImagesImport: () => ipcRenderer.invoke("imports:prepareIndividualImages"),
  confirmImport: (token, options) => ipcRenderer.invoke("imports:confirm", token, options),
  cancelImport: (token) => ipcRenderer.invoke("imports:cancel", token),
  listSounds: () => ipcRenderer.invoke("library:listSounds"),
  openSoundsFolder: () => ipcRenderer.invoke("library:openSoundsFolder"),
  importSound: (options) => ipcRenderer.invoke("library:importSound", options),
  copyText: (text) => ipcRenderer.invoke("clipboard:writeText", String(text || "")),
  chooseSpriteSheetImage: () => ipcRenderer.invoke("spriteCutter:chooseImage"),
  exportSpriteCutterFrames: (payload) => ipcRenderer.invoke("spriteCutter:exportFrames", payload),
  removeImageBackground: (payload) => ipcRenderer.invoke("imageTools:removeBackground", payload),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  movePetWindowBy: (deltaX, deltaY, options) => ipcRenderer.invoke("petWindow:moveBy", deltaX, deltaY, options),
  getPetWindowInfo: () => ipcRenderer.invoke("petWindow:getInfo"),
  getCursorScreenPoint: () => ipcRenderer.invoke("screen:getCursorPoint"),
  closePetWindow: () => ipcRenderer.invoke("petWindow:close"),
  onMenuAction: (handler) => {
    const listener = (_event, message) => handler(message);
    ipcRenderer.on("menu:action", listener);
    return () => ipcRenderer.removeListener("menu:action", listener);
  },
  onExportProgress: (handler) => {
    const listener = (_event, message) => handler(message);
    ipcRenderer.on("export:progress", listener);
    return () => ipcRenderer.removeListener("export:progress", listener);
  }
});
