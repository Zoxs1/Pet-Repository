const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const electronPath = require("electron");
const localAppData = path.join(root, ".localappdata");
const electronCache = path.join(root, ".electron-cache");
const npmCache = path.join(root, ".npm-cache");

for (const dir of [localAppData, electronCache, npmCache, path.join(root, "data", "dev")]) {
  fs.mkdirSync(dir, { recursive: true });
}

const child = spawn(electronPath, [root], {
  cwd: root,
  stdio: "inherit",
  windowsHide: false,
  env: {
    ...process.env,
    APP_CHANNEL: "dev",
    LOCALAPPDATA: localAppData,
    ELECTRON_CACHE: electronCache,
    npm_config_cache: npmCache
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
    return;
  }
  process.exit(code ?? 0);
});
