const canvas = document.getElementById("petCanvas");
const closeButton = document.getElementById("closeButton");
const ctx = canvas.getContext("2d");
const params = new URLSearchParams(window.location.search);
const petRef = params.get("ref") || params.get("id") || "";

const state = {
  manifest: null,
  images: new Map(),
  sounds: new Map(),
  currentAnimationId: null,
  frameIndex: 0,
  lastFrameTime: 0,
  actionStartedAt: 0,
  actionHoldUntil: 0,
  nextDecisionAt: 0,
  mode: "loading",
  moveVector: { x: 0, y: 0 },
  moveUntil: 0,
  followStartedAt: 0,
  followArrivedAt: 0,
  dragging: false,
  dragStart: { x: 0, y: 0 },
  dragLast: { x: 0, y: 0 },
  dragMoved: false,
  lastMoveSentAt: 0,
  currentSound: null
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getDefaults() {
  return state.manifest?.defaults || {};
}

function getAnimation(id = state.currentAnimationId) {
  return state.manifest?.animations?.[id] || null;
}

function getFrameSize(animation = getAnimation()) {
  const defaults = getDefaults();
  return {
    width: animation?.frameWidth || defaults.frameWidth || 128,
    height: animation?.frameHeight || defaults.frameHeight || 128,
    columns: animation?.columns || defaults.columns || 1
  };
}

function getActionValue(actionName) {
  return state.manifest?.actions?.[actionName] || null;
}

function resolveAnimationId(actionName, fallbackIds = []) {
  const actionValue = getActionValue(actionName);
  if (typeof actionValue === "string" && getAnimation(actionValue)) return actionValue;

  for (const fallbackId of fallbackIds) {
    if (getAnimation(fallbackId)) return fallbackId;
  }

  return Object.keys(state.manifest?.animations || {})[0] || null;
}

function resolveDirectionalAnimation(groupName, direction) {
  const group = getActionValue(groupName);
  if (group && typeof group === "object" && !Array.isArray(group) && getAnimation(group[direction])) {
    return group[direction];
  }

  const fallbacks = {
    left: ["walkLeft", "left"],
    right: ["walkRight", "right"],
    up: ["walkUp", "up"],
    down: ["walkDown", "down"]
  };

  return fallbacks[direction].find((id) => getAnimation(id)) || resolveAnimationId("idle", ["idle"]);
}

function getProfile() {
  return state.manifest?.behaviors?.profile || {};
}

function getRange(name, fallbackMin, fallbackMax) {
  const value = getProfile()[name] || {};
  return {
    min: Number(value.min) || fallbackMin,
    max: Number(value.max) || fallbackMax
  };
}

function stopCurrentSound() {
  if (!state.currentSound) return;
  state.currentSound.pause();
  state.currentSound.currentTime = 0;
  state.currentSound = null;
}

function playSound(animation) {
  if (!animation?.soundUrl) return;
  const sound = state.sounds.get(animation.soundUrl);
  if (!sound) return;
  stopCurrentSound();
  sound.currentTime = 0;
  state.currentSound = sound;
  sound.play().catch(() => {});
  return Number.isFinite(sound.duration) ? sound.duration * 1000 : null;
}

function setAnimation(animationId, mode) {
  if (!animationId || !getAnimation(animationId)) return;
  const animation = getAnimation(animationId);
  const now = performance.now();
  state.currentAnimationId = animationId;
  state.frameIndex = 0;
  state.lastFrameTime = 0;
  state.actionStartedAt = now;
  state.actionHoldUntil = 0;
  state.mode = mode;
  if (!animation.soundUrl) stopCurrentSound();
  const soundMs = playSound(animation);
  if (animation.syncToSound === true && soundMs) {
    const animationMs = ((animation.frames || 1) / (animation.fps || getDefaults().fps || 24)) * 1000;
    state.actionHoldUntil = now + Math.max(soundMs, animationMs);
  }
  draw();
}

function setIdle() {
  setAnimation(resolveAnimationId("idle", ["idle", "walkIdle"]), "idle");
  const range = getRange("idleSeconds", 3, 7);
  state.nextDecisionAt = performance.now() + randomBetween(range.min, range.max) * 1000;
}

function setSleep() {
  setAnimation(resolveAnimationId("sleep", ["sleep", "idle"]), "sleep");
  const range = getRange("sleepSeconds", 8, 14);
  state.nextDecisionAt = performance.now() + randomBetween(range.min, range.max) * 1000;
}

function setRandomEmote() {
  const actionValue = getActionValue("random");
  const candidates = Array.isArray(actionValue) ? actionValue.filter((id) => getAnimation(id)) : [];
  const animationId = candidates.length > 0 ? pick(candidates) : resolveAnimationId("click", ["click", "idle"]);
  setAnimation(animationId, "emote");
}

function setAttention() {
  const range = getRange("attentionSeconds", 2.5, 4);
  setAnimation(resolveAnimationId("rest", ["walkIdle", "idle"]), "attention");
  state.actionHoldUntil = performance.now() + randomBetween(range.min, range.max) * 1000;
}

function startFollowCursor() {
  state.followStartedAt = performance.now();
  state.followArrivedAt = 0;
  state.moveUntil = 0;
  state.mode = "follow";
}

function directionFromVector(vector) {
  if (Math.abs(vector.x) >= Math.abs(vector.y)) return vector.x < 0 ? "left" : "right";
  return vector.y < 0 ? "up" : "down";
}

function setPatrol() {
  const angle = randomBetween(0, Math.PI * 2);
  const vector = { x: Math.cos(angle), y: Math.sin(angle) };
  const direction = directionFromVector(vector);
  const range = getRange("walkSeconds", 2, 5);

  state.moveVector = vector;
  state.moveUntil = performance.now() + randomBetween(range.min, range.max) * 1000;
  setAnimation(resolveDirectionalAnimation("patrol", direction), "patrol");
}

function chooseNextBehavior() {
  const weights = getProfile().randomWeights || {};
  const patrolWeight = Number(weights.patrol) || 55;
  const emoteWeight = Number(weights.emote) || 25;
  const sleepWeight = Number(weights.sleep) || 20;
  const roll = Math.random() * (patrolWeight + emoteWeight + sleepWeight);

  if (roll < patrolWeight) {
    setPatrol();
    return;
  }

  if (roll < patrolWeight + emoteWeight) {
    setRandomEmote();
    return;
  }

  setSleep();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const animation = getAnimation();
  const image = state.images.get(state.currentAnimationId);
  if (!animation || !image) return;

  const { width, height, columns } = getFrameSize(animation);
  const sourceX = (state.frameIndex % columns) * width;
  const sourceY = Math.floor(state.frameIndex / columns) * height;
  const scale = Number(animation.scale || getDefaults().scale || 1);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const animationOffset = animation.offset || { x: 0, y: 0 };
  const frameOffset = animation.frameOffsets?.[state.frameIndex] || { x: 0, y: 0 };
  const x = (canvas.width - drawWidth) / 2 + (Number(animationOffset.x) || 0) + (Number(frameOffset.x) || 0);
  const y = (canvas.height - drawHeight) / 2 + (Number(animationOffset.y) || 0) + (Number(frameOffset.y) || 0);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, sourceX, sourceY, width, height, x, y, drawWidth, drawHeight);
  ctx.restore();
}

function advanceAnimation(timestamp) {
  const animation = getAnimation();
  if (!animation) return;

  const fps = Number(animation.fps || getDefaults().fps || 24);
  const frameMs = 1000 / fps;
  if (state.lastFrameTime && timestamp - state.lastFrameTime < frameMs) return;

  state.frameIndex += 1;
  if (state.frameIndex >= animation.frames) {
    if (animation.syncToSound === true && timestamp < state.actionHoldUntil) {
      state.frameIndex = 0;
    } else if (animation.loop) {
      state.frameIndex = 0;
    } else {
      state.frameIndex = animation.frames - 1;
      setIdle();
      return;
    }
  }

  state.lastFrameTime = timestamp;
  draw();
}

async function movePet(timestamp) {
  if (state.mode === "attention") {
    if (timestamp >= state.actionHoldUntil) setIdle();
    return;
  }

  if (state.mode === "follow") {
    await followCursor(timestamp);
    return;
  }

  if (state.mode !== "patrol" || timestamp >= state.moveUntil) {
    if (state.mode === "patrol") setIdle();
    return;
  }

  if (timestamp - state.lastMoveSentAt < 16) return;
  const speed = Number(getProfile().walkSpeed) || 1.25;
  state.lastMoveSentAt = timestamp;
  await window.petStudio.movePetWindowBy(
    state.moveVector.x * speed,
    state.moveVector.y * speed,
    { edgeOverflow: Number(getProfile().edgeOverflow) || 82 }
  );
}

async function followCursor(timestamp) {
  if (timestamp - state.lastMoveSentAt < 16) return;

  const [cursor, windowInfo] = await Promise.all([
    window.petStudio.getCursorScreenPoint(),
    window.petStudio.getPetWindowInfo()
  ]);
  if (!cursor || !windowInfo) return;

  const centerX = windowInfo.x + windowInfo.width / 2;
  const centerY = windowInfo.y + windowInfo.height / 2;
  const deltaX = cursor.x - centerX;
  const deltaY = cursor.y - centerY;
  const distance = Math.hypot(deltaX, deltaY);
  const attentionRadius = Number(getProfile().attentionRadius) || 44;

  if (distance <= attentionRadius && timestamp - state.followStartedAt > 450) {
    setAttention();
    return;
  }

  if (distance <= 1) return;

  const vector = { x: deltaX / distance, y: deltaY / distance };
  const direction = directionFromVector(vector);
  const animationId = resolveDirectionalAnimation("run", direction);
  if (state.currentAnimationId !== animationId) {
    setAnimation(animationId, "follow");
  } else {
    state.mode = "follow";
  }

  const speed = Number(getProfile().runSpeed) || 2.4;
  state.lastMoveSentAt = timestamp;
  await window.petStudio.movePetWindowBy(
    vector.x * speed,
    vector.y * speed,
    { edgeOverflow: Number(getProfile().edgeOverflow) || 82 }
  );
}

function tick(timestamp) {
  advanceAnimation(timestamp);

  if (!state.dragging) {
    movePet(timestamp);
    if ((state.mode === "idle" || state.mode === "sleep") && timestamp >= state.nextDecisionAt) {
      chooseNextBehavior();
    }
  }

  requestAnimationFrame(tick);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function loadAudio(url) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(audio);
    };

    audio.preload = "auto";
    audio.addEventListener("loadedmetadata", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.load();
    setTimeout(finish, 700);
  });
}

async function loadPet() {
  state.manifest = await window.petStudio.loadPet(petRef);
  const entries = Object.entries(state.manifest.animations);

  await Promise.all(entries.map(async ([animationId, animation]) => {
    state.images.set(animationId, await loadImage(animation.sourceUrl));
    if (animation.soundUrl) {
      state.sounds.set(animation.soundUrl, await loadAudio(animation.soundUrl));
    }
  }));

  const intro = resolveAnimationId("intro", ["intro"]);
  if (intro) {
    setAnimation(intro, "oneShot");
  } else {
    setIdle();
  }

  requestAnimationFrame(tick);
}

canvas.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;
  state.dragging = true;
  state.dragMoved = false;
  state.dragStart = { x: event.screenX, y: event.screenY };
  state.dragLast = { x: event.screenX, y: event.screenY };
  canvas.classList.add("dragging");
  setAnimation(resolveAnimationId("drag", ["grab", "idle"]), "drag");
});

window.addEventListener("mousemove", async (event) => {
  if (!state.dragging) return;
  const deltaX = event.screenX - state.dragLast.x;
  const deltaY = event.screenY - state.dragLast.y;
  const totalX = event.screenX - state.dragStart.x;
  const totalY = event.screenY - state.dragStart.y;

  if (Math.abs(totalX) + Math.abs(totalY) > 6) state.dragMoved = true;
  state.dragLast = { x: event.screenX, y: event.screenY };
  await window.petStudio.movePetWindowBy(deltaX, deltaY, { edgeOverflow: Number(getProfile().edgeOverflow) || 82 });
});

window.addEventListener("mouseup", () => {
  if (!state.dragging) return;
  state.dragging = false;
  canvas.classList.remove("dragging");

  if (!state.dragMoved) {
    startFollowCursor();
    return;
  }

  setIdle();
});

canvas.addEventListener("mouseenter", () => {
  if (state.dragging || state.mode !== "idle") return;
  const hover = resolveAnimationId("hover", ["hover"]);
  if (hover) setAnimation(hover, "idle");
});

canvas.addEventListener("mouseleave", () => {
  if (state.dragging) return;
  if (state.mode === "idle" && state.currentAnimationId === resolveAnimationId("hover", ["hover"])) {
    setIdle();
  }
});

closeButton.addEventListener("click", () => window.petStudio.closePetWindow());

loadPet().catch((error) => {
  console.error(error);
  setTimeout(() => window.petStudio.closePetWindow(), 1200);
});
