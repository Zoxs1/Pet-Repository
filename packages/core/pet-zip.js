const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  crcTable[index] = value >>> 0;
}

function crc32(buffer) {
  let value = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    value = crcTable[(value ^ buffer[index]) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function writeUInt16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function writeUInt32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function listFiles(folderPath) {
  const files = [];

  function walk(currentPath) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      files.push(entryPath);
    }
  }

  walk(folderPath);
  return files;
}

function toZipPath(rootPath, filePath) {
  return path.relative(rootPath, filePath).split(path.sep).join("/");
}

function isSafeZipPath(entryName) {
  const normalized = String(entryName || "").replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) return false;
  return !normalized.split("/").some((part) => part === "..");
}

async function createZipFromFolder(sourceFolder, targetZipPath, onProgress) {
  const files = listFiles(sourceFolder);
  fs.mkdirSync(path.dirname(targetZipPath), { recursive: true });
  const fd = fs.openSync(targetZipPath, "w");
  const centralEntries = [];
  let offset = 0;
  let current = 0;

  try {
    for (const filePath of files) {
      const data = fs.readFileSync(filePath);
      const entryName = toZipPath(sourceFolder, filePath);
      const nameBuffer = Buffer.from(entryName, "utf8");
      const dateTime = dosDateTime(fs.statSync(filePath).mtime);
      const checksum = crc32(data);
      const localOffset = offset;
      const localHeader = Buffer.concat([
        writeUInt32(0x04034b50),
        writeUInt16(20),
        writeUInt16(0x0800),
        writeUInt16(0),
        writeUInt16(dateTime.time),
        writeUInt16(dateTime.day),
        writeUInt32(checksum),
        writeUInt32(data.length),
        writeUInt32(data.length),
        writeUInt16(nameBuffer.length),
        writeUInt16(0),
        nameBuffer
      ]);

      fs.writeSync(fd, localHeader);
      fs.writeSync(fd, data);
      offset += localHeader.length + data.length;
      centralEntries.push({ entryName, nameBuffer, dateTime, checksum, size: data.length, localOffset });

      current += 1;
      if (onProgress) onProgress({ current, total: files.length, message: `Empaquetando ${entryName}` });
      await new Promise((resolve) => setImmediate(resolve));
    }

    const centralOffset = offset;
    for (const entry of centralEntries) {
      const centralHeader = Buffer.concat([
        writeUInt32(0x02014b50),
        writeUInt16(20),
        writeUInt16(20),
        writeUInt16(0x0800),
        writeUInt16(0),
        writeUInt16(entry.dateTime.time),
        writeUInt16(entry.dateTime.day),
        writeUInt32(entry.checksum),
        writeUInt32(entry.size),
        writeUInt32(entry.size),
        writeUInt16(entry.nameBuffer.length),
        writeUInt16(0),
        writeUInt16(0),
        writeUInt16(0),
        writeUInt16(0),
        writeUInt32(0),
        writeUInt32(entry.localOffset),
        entry.nameBuffer
      ]);
      fs.writeSync(fd, centralHeader);
      offset += centralHeader.length;
    }

    const centralSize = offset - centralOffset;
    const endRecord = Buffer.concat([
      writeUInt32(0x06054b50),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(centralEntries.length),
      writeUInt16(centralEntries.length),
      writeUInt32(centralSize),
      writeUInt32(centralOffset),
      writeUInt16(0)
    ]);
    fs.writeSync(fd, endRecord);
  } finally {
    fs.closeSync(fd);
  }

  return { ok: true, zipPath: targetZipPath, files: files.length };
}

function findEndOfCentralDirectory(buffer) {
  const minOffset = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("El ZIP no tiene una tabla central valida.");
}

function readZipEntries(zipPath) {
  const buffer = fs.readFileSync(zipPath);
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let cursor = centralOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error("Entrada ZIP invalida.");
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.slice(cursor + 46, cursor + 46 + nameLength).toString("utf8");

    entries.push({ name, method, compressedSize, uncompressedSize, localOffset });
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return { buffer, entries };
}

function extractZip(zipPath, targetFolder, onProgress) {
  const { buffer, entries } = readZipEntries(zipPath);
  fs.mkdirSync(targetFolder, { recursive: true });
  let current = 0;

  for (const entry of entries) {
    current += 1;
    if (!isSafeZipPath(entry.name)) continue;

    const localOffset = entry.localOffset;
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("Cabecera ZIP local invalida.");
    const nameLength = buffer.readUInt16LE(localOffset + 26);
    const extraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + nameLength + extraLength;
    const dataEnd = dataStart + entry.compressedSize;
    const compressedData = buffer.slice(dataStart, dataEnd);
    const targetPath = path.join(targetFolder, entry.name);

    if (entry.name.endsWith("/")) {
      fs.mkdirSync(targetPath, { recursive: true });
      continue;
    }

    let data;
    if (entry.method === 0) data = compressedData;
    else if (entry.method === 8) data = zlib.inflateRawSync(compressedData);
    else throw new Error(`Metodo ZIP no soportado: ${entry.method}`);

    if (data.length !== entry.uncompressedSize) throw new Error(`Tamano invalido en ${entry.name}`);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, data);
    if (onProgress) onProgress({ current, total: entries.length, message: `Extrayendo ${entry.name}` });
  }

  return { ok: true, entries: entries.length };
}

module.exports = {
  createZipFromFolder,
  extractZip,
  readZipEntries
};
