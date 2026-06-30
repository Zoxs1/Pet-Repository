const fs = require("fs");
const path = require("path");
const { createPetStore } = require("../packages/core/pet-store");

const root = path.resolve(__dirname, "..");
const fixturesDir = path.join(root, "data", "fixtures");
const devLibraryDir = path.join(root, "data", "dev", "library");
const devPetsDir = path.join(devLibraryDir, "pets");
const petStore = createPetStore({ projectRoot: root, channel: "dev" });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validatePetManifest(petDir) {
  const manifestPath = path.join(petDir, "pet.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert(manifest.schemaVersion === 1, `${manifestPath}: schemaVersion must be 1`);
  assert(manifest.id, `${manifestPath}: id is required`);
  assert(manifest.name, `${manifestPath}: name is required`);
  assert(manifest.defaults?.frameWidth > 0, `${manifestPath}: defaults.frameWidth is required`);
  assert(manifest.defaults?.frameHeight > 0, `${manifestPath}: defaults.frameHeight is required`);
  assert(manifest.defaults?.columns > 0, `${manifestPath}: defaults.columns is required`);
  assert(Object.keys(manifest.animations || {}).length > 0, `${manifestPath}: animations are required`);

  for (const [id, animation] of Object.entries(manifest.animations)) {
    assert(animation.source, `${manifestPath}: animation ${id} needs source`);
    assert(animation.frames > 0, `${manifestPath}: animation ${id} needs frames`);
    const sourcePath = path.join(petDir, animation.source);
    assert(fs.existsSync(sourcePath), `${manifestPath}: missing source for ${id}: ${animation.source}`);
    if (animation.sound) {
      const soundPath = String(animation.sound).startsWith("library://")
        ? petStore.resolveLibraryPath(animation.sound)
        : path.join(petDir, animation.sound);
      assert(fs.existsSync(soundPath), `${manifestPath}: missing sound for ${id}: ${animation.sound}`);
    }
  }

  return manifest.id;
}

function validateFolder(rootDir, label) {
  if (!fs.existsSync(rootDir)) return [];
  const valid = [];

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const petDir = path.join(rootDir, entry.name);
    if (!fs.existsSync(path.join(petDir, "pet.json"))) continue;
    valid.push(`${label}:${validatePetManifest(petDir)}`);
  }

  return valid;
}

const valid = [
  ...validateFolder(fixturesDir, "fixture"),
  ...validateFolder(devPetsDir, "dev")
];

console.log(`pets ok: ${valid.join(", ")}`);
