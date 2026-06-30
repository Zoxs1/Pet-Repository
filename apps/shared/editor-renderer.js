const els = {
  runtimeText: document.getElementById("runtimeText"),
  petSelect: document.getElementById("petSelect"),
  reloadPetButton: document.getElementById("reloadPetButton"),
  animationList: document.getElementById("animationList"),
  petName: document.getElementById("petName"),
  animationMeta: document.getElementById("animationMeta"),
  playButton: document.getElementById("playButton"),
  loopButton: document.getElementById("loopButton"),
  autoPlayButton: document.getElementById("autoPlayButton"),
  restartButton: document.getElementById("restartButton"),
  editorToggleButton: document.getElementById("editorToggleButton"),
  savePetButton: document.getElementById("savePetButton"),
  deletePetButton: document.getElementById("deletePetButton"),
  editorResizeHandle: document.getElementById("editorResizeHandle"),
  stageWrap: document.getElementById("stageWrap"),
  stage: document.getElementById("stage"),
  scaleInput: document.getElementById("scaleInput"),
  scaleValue: document.getElementById("scaleValue"),
  fpsInput: document.getElementById("fpsInput"),
  fpsValue: document.getElementById("fpsValue"),
  applyAllToggle: document.getElementById("applyAllToggle"),
  ghostToggle: document.getElementById("ghostToggle"),
  ghostSelect: document.getElementById("ghostSelect"),
  animationLabelInput: document.getElementById("animationLabelInput"),
  soundFolderSelect: document.getElementById("soundFolderSelect"),
  soundSelect: document.getElementById("soundSelect"),
  syncSoundToggle: document.getElementById("syncSoundToggle"),
  importSoundButton: document.getElementById("importSoundButton"),
  createSoundFolderButton: document.getElementById("createSoundFolderButton"),
  moveSoundButton: document.getElementById("moveSoundButton"),
  frameInput: document.getElementById("frameInput"),
  frameStrip: document.getElementById("frameStrip"),
  animOffsetX: document.getElementById("animOffsetX"),
  animOffsetY: document.getElementById("animOffsetY"),
  frameOffsetX: document.getElementById("frameOffsetX"),
  frameOffsetY: document.getElementById("frameOffsetY"),
  resetOffsetsButton: document.getElementById("resetOffsetsButton"),
  actionMappingList: document.getElementById("actionMappingList")
};

const ctx = els.stage.getContext("2d");
const simpleActionRows = [
  ["intro", "Intro"],
  ["idle", "Idle"],
  ["rest", "Atencion"],
  ["sleep", "Dormir"],
  ["click", "Click"],
  ["drag", "Arrastre"],
  ["hover", "Hover"]
];
const directionalActionRows = [
  ["patrol", "Patrulla"],
  ["run", "Correr"]
];
const directions = [
  ["left", "Izquierda"],
  ["right", "Derecha"],
  ["up", "Arriba"],
  ["down", "Abajo"],
  ["upLeft", "Arriba izq."],
  ["upRight", "Arriba der."],
  ["downLeft", "Abajo izq."],
  ["downRight", "Abajo der."]
];

const promptTemplates = [
  {
    id: "front-normal",
    group: "Bases chibi",
    title: "Frontal chibi - prompt normal",
    summary: "Usalo cuando tengas una imagen del personaje y quieras una primera base frontal estilo mascota chibi.",
    usage: "Adjunta una referencia del personaje original. Si tienes una imagen chibi de estilo preferido, adjuntala tambien y dile a la IA que use esa imagen solo como estilo.",
    content: `Create one full-body front-facing chibi mascot version of the provided character reference.

Use the reference character only for identity, outfit, colors, hairstyle, accessories and personality.
Use the chibi style reference, if provided, only for proportions, rendering style and cute mascot feeling.

Style target:
- soft 3D anime chibi mobile game mascot
- very large head, about 45 to 50 percent of total height
- short compact body
- short arms and legs
- small simplified hands
- small readable shoes or feet
- glossy large anime eyes
- tiny nose or almost invisible nose
- small cute mouth
- friendly calm expression
- polished game character preview look
- soft cel-shading with smooth gradients
- subtle complete outer silhouette outline
- outline color should be soft dark brown, muted gray-brown, or a darker color sampled from the character palette
- outline must remain visible around white hair, pale skin, white clothing, hands, feet, accessories and thin hair strands
- do not use thick pure black comic outlines
- soft frontal studio lighting

Character preservation:
- preserve the main outfit
- preserve the main color palette
- preserve hairstyle and hair color
- preserve eye color
- preserve important accessories and symbols
- keep the character instantly recognizable
- simplify tiny details only when needed for chibi readability

Sprite readiness:
- full body visible
- front view only
- neutral idle standing pose
- arms relaxed or slightly raised in a cute mascot pose
- feet visible and aligned naturally
- centered character
- enough empty space around the body
- transparent background only
- no text, no logo, no watermark, no extra characters
- no dramatic perspective, no action pose, no motion blur

Negative prompt:
realistic proportions, adult body proportions, long realistic legs, semi-realistic face, cropped feet, cropped hair, extra limbs, extra fingers, wrong outfit, changed colors, different character, white background, colored background, messy background, missing outline, broken outline, pure black thick outline, heavy shadow, dramatic lighting, blurry, low resolution, pixel art, flat sticker style, western cartoon style

Final instruction:
Generate a clean full-body front-facing chibi mascot image suitable as a base for later desktop pet sprite creation.`
  },
  {
    id: "front-json",
    group: "Bases chibi",
    title: "Frontal chibi - JSON",
    summary: "La misma idea frontal, pero en formato estructurado para modelos que responden mejor con instrucciones tipo JSON.",
    usage: "Adjunta la imagen del personaje. Opcionalmente adjunta una referencia chibi del estilo que quieres copiar.",
    content: `{
  "task": "Create one full-body front-facing chibi mascot version of the provided character reference.",
  "reference_usage": {
    "character_reference": "Use for identity, outfit, colors, hairstyle, accessories and personality.",
    "optional_chibi_style_reference": "Use only for chibi proportions, soft 3D anime rendering, face simplification and mascot feeling."
  },
  "style": {
    "name": "soft 3D anime chibi mobile game mascot",
    "proportions": {
      "head": "very large, about 45 to 50 percent of total height",
      "body": "short compact torso",
      "arms": "short simplified arms",
      "legs": "short chibi legs",
      "hands": "small simplified hands",
      "feet": "small readable shoes or feet"
    },
    "face": {
      "eyes": "large glossy anime eyes",
      "nose": "minimal or almost invisible",
      "mouth": "small cute mouth",
      "expression": "friendly calm charming"
    },
    "rendering": {
      "finish": "polished mobile game character preview",
      "shading": "soft cel-shading with smooth gradients",
      "outline": "subtle complete outer silhouette outline using soft dark brown, muted gray-brown, or a darker color sampled from the character palette",
      "outline_requirements": [
        "outline must wrap the entire body silhouette",
        "outline must remain visible around white hair, pale skin, white clothing, hands, feet, accessories and thin hair strands",
        "avoid thick pure black comic outlines"
      ],
      "lighting": "soft frontal studio lighting"
    }
  },
  "output": {
    "view": "front view only",
    "pose": "neutral idle standing pose",
    "framing": "full body centered with empty space around the character",
    "background": "transparent only",
    "sprite_ready": true
  },
  "character_preservation": [
    "main outfit",
    "main color palette",
    "hairstyle",
    "hair color",
    "eye color",
    "important accessories",
    "iconic symbols",
    "overall personality impression"
  ],
  "negative_prompt": [
    "realistic proportions",
    "adult body proportions",
    "long realistic legs",
    "semi-realistic face",
    "cropped body",
    "cropped feet",
    "cropped hair",
    "extra limbs",
    "extra fingers",
    "wrong outfit",
    "changed colors",
    "different character",
    "messy background",
    "white background",
    "colored background",
    "missing outline",
    "broken outline",
    "pure black thick outline",
    "heavy shadows",
    "dramatic lighting",
    "blurry",
    "low resolution",
    "pixel art",
    "flat sticker style",
    "western cartoon style"
  ],
  "final_instruction": "Generate one clean full-body front-facing chibi mascot image suitable as a base for later desktop pet sprite creation."
}`
  },
  {
    id: "turnaround-normal",
    group: "Bases chibi",
    title: "4 vistas chibi - prompt normal",
    summary: "Usalo cuando encontraste una imagen chibi de tu personaje o un estilo chibi que te gusta, y ademas tienes referencias originales en frente, lados y espalda.",
    usage: "Adjunta la imagen chibi como referencia de estilo. Adjunta las 4 vistas del personaje original como referencia de diseno. Este prompt pide una hoja tecnica para recortar sprites.",
    content: `Create a clean 4-view orthographic chibi model sheet for sprite creation.

Use the provided chibi image only as the style and proportion reference.
Use the provided full character turnaround images only as the costume, hair, colors, accessories, side details and back details reference.

Generate exactly four full-body views of the same chibi model:
1. Front view
2. True left side view
3. Back view
4. True right side view

Critical side-view rule:
- the left and right views must be true 90-degree side profiles
- do not draw 3/4 views
- do not draw partial side views
- do not show both eyes in side views
- show one visible eye or the eye edge only
- the nose, face, chest, feet and cape must face sideways
- arms, legs, hair and clothing must align as a real side profile
- the side silhouettes must look like the same model rotated exactly 90 degrees

Style rules:
- soft 3D anime chibi mascot look
- very large head, about 50 percent of total height
- short compact body
- short legs, not long realistic legs
- small simplified hands
- cute neutral expression
- polished mobile game character preview style
- soft cel-shading
- subtle complete outer silhouette outline
- outline color should be soft dark brown, muted gray-brown, or a darker color sampled from the character palette
- outline must remain visible around white hair, pale skin, white clothing, hands, feet, accessories and thin hair strands
- do not use thick pure black comic outlines
- no realistic adult proportions
- do not make the body taller or slimmer
- do not change the face style between views

Technical sprite rules:
- strict orthographic view, no perspective distortion
- same exact scale in all four views
- same head size in every view
- same body height in every view
- same lighting in every view
- same invisible ground line for all feet
- neutral idle pose
- arms relaxed naturally
- full body visible
- feet visible
- enough empty space around each view
- transparent background only
- no text, no labels, no arrows, no title, no watermark
- no decorative background
- no strong cast shadows

Character consistency rules:
- treat this as the exact same chibi model rotated four times
- preserve hairstyle volume across all views
- preserve accessories in their correct rotated positions
- preserve outfit layers, colors, cape, jewelry, shoes and iconic details
- use the full character references to infer missing side and back details
- do not invent unrelated costume elements
- do not simplify iconic details too much
- do not change the character identity

Layout:
- place the four views in one horizontal row
- evenly spaced
- centered vertically
- each view inside its own invisible column
- no overlap between views

Negative prompt:
text, labels, front label, side label, back label, arrows, watermark, logo, white background, colored background, decorative background, starry background, missing outline, broken outline, pure black thick outline, dramatic pose, action pose, 3/4 side view, partial side view, perspective angle, different character, inconsistent outfit, changed hairstyle, missing accessories, missing cape, missing hat or crown, long realistic legs, adult proportions, realistic body, cropped feet, cropped hair, extra limbs, extra fingers, blurry, low resolution, painterly background, heavy shadow

Final instruction:
Create a production-ready chibi turnaround sheet suitable for cutting into 2D desktop pet sprites.`
  },
  {
    id: "turnaround-json",
    group: "Bases chibi",
    title: "4 vistas chibi - JSON",
    summary: "Version estructurada para generar una hoja tecnica de 4 vistas usando estilo chibi + referencias originales.",
    usage: "Adjunta una referencia chibi del estilo deseado y las 4 vistas del personaje original. Es ideal antes de pedir animaciones como idle, walk o run.",
    content: `{
  "task": "Create a production-ready 4-view orthographic chibi turnaround sheet for 2D sprite creation.",
  "reference_usage": {
    "chibi_reference": "Use only for chibi proportions, face simplification, soft 3D anime mascot style and rendering.",
    "full_character_turnaround_references": "Use for accurate outfit structure, colors, hairstyle, accessories, side details and back details."
  },
  "output_views": {
    "count": 4,
    "views": ["front", "true_left_side_90_degrees", "back", "true_right_side_90_degrees"],
    "layout": "one horizontal row, evenly spaced, centered vertically",
    "scale": "same height, same head size, same body scale in every view",
    "grounding": "all feet aligned to the same invisible ground line",
    "background": "transparent only",
    "forbidden": ["text", "labels", "arrows", "title", "watermark", "decorative background"]
  },
  "side_view_rules": {
    "left_and_right_views": "must be true 90-degree side profiles",
    "not_allowed": [
      "3/4 side view",
      "partial side view",
      "showing both eyes in side views",
      "front-facing torso in side views",
      "front-facing feet in side views"
    ],
    "required": [
      "one visible eye or eye edge only",
      "nose and face facing sideways",
      "chest and torso facing sideways",
      "feet facing sideways",
      "hair volume rotated correctly",
      "cape and accessories rotated correctly",
      "side silhouette matches the same model rotated exactly 90 degrees"
    ]
  },
  "style": {
    "name": "soft 3D anime chibi mobile game mascot",
    "proportions": {
      "head": "very large, about 50 percent of total height",
      "body": "short compact torso",
      "legs": "short chibi legs, not long or realistic",
      "hands": "small simplified hands",
      "feet": "small readable shoes"
    },
    "rendering": {
      "shading": "soft cel-shading with smooth gradients",
      "outline": "subtle complete outer silhouette outline using soft dark brown, muted gray-brown, or a darker color sampled from the character palette",
      "outline_requirements": [
        "outline must wrap the full body silhouette in every view",
        "outline must remain visible around white hair, pale skin, white clothing, hands, feet, accessories and thin hair strands",
        "avoid thick pure black comic outlines"
      ],
      "lighting": "soft consistent studio lighting",
      "finish": "polished game character preview render"
    },
    "pose": {
      "type": "neutral idle standing pose",
      "arms": "relaxed naturally",
      "feet": "visible and stable",
      "expression": "cute calm neutral"
    }
  },
  "consistency_rules": [
    "The four views must look like the exact same chibi model rotated.",
    "Do not change face style between views.",
    "Do not change body proportions between views.",
    "Do not make one view taller, slimmer or more realistic than another.",
    "Preserve the same hairstyle volume across all views.",
    "Preserve accessories in the correct rotated positions across all views.",
    "Preserve outfit layers, colors, cape, jewelry, shoes and iconic design elements.",
    "Use the full character references to infer missing side and back details.",
    "Do not invent unrelated costume details."
  ],
  "negative_prompt": [
    "text",
    "labels",
    "watermark",
    "white background",
    "colored background",
    "missing outline",
    "broken outline",
    "pure black thick outline",
    "decorative background",
    "dramatic lighting",
    "heavy shadows",
    "action pose",
    "perspective distortion",
    "3/4 side view",
    "partial side view",
    "adult proportions",
    "long realistic legs",
    "slim realistic body",
    "inconsistent face",
    "inconsistent costume",
    "changed hairstyle",
    "missing accessories",
    "missing cape",
    "missing hat or crown",
    "cropped feet",
    "cropped hair",
    "extra limbs",
    "extra fingers",
    "blurry",
    "low resolution"
  ],
  "final_instruction": "Generate a clean chibi model sheet suitable for cutting into sprites and importing into a desktop pet editor."
}`
  },
  {
    id: "idle-spritesheet",
    group: "Animaciones esenciales",
    title: "Idle / respiracion",
    summary: "Crea una animacion base suave para que la mascota se mantenga viva sin moverse de lugar.",
    usage: "Usa la hoja chibi frontal o de 4 vistas como identidad. Ideal para empezar cualquier mascota antes de caminar o correr.",
    content: `Create an idle breathing sprite animation for the provided chibi character.

Use the chibi character reference as the only identity reference.
Keep the same outfit, colors, hairstyle, accessories, face style and chibi proportions in every frame.

Animation target:
- idle breathing loop
- subtle up and down body motion
- tiny hair and clothing movement
- calm cute expression
- no walking, no jumping, no pose change
- the feet must stay planted on the same ground line
- the character must not slide or change scale

Technical output:
- transparent background only
- horizontal spritesheet
- equal-size cells
- 8 to 12 frames
- seamless loop
- full body visible in every frame
- centered inside each cell
- same camera and same scale in every frame
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, camera movement, sliding feet, changing scale, different face, different outfit, cropped feet, cropped hair, extra limbs, blurry, low resolution

Final instruction:
Generate a transparent-background horizontal spritesheet for a stable idle breathing loop, ready to be cut into desktop pet frames.`
  },
  {
    id: "walk-4-directions",
    group: "Animaciones esenciales",
    title: "Caminar 4 direcciones",
    summary: "Genera caminata frontal, espalda, izquierda y derecha usando tu hoja de 4 vistas como modelo.",
    usage: "Adjunta la hoja chibi de 4 vistas. Opcionalmente adjunta una caminata de otra mascota solo como referencia de movimiento.",
    content: `Create four walking sprite animations for the provided chibi character: walk down/front, walk up/back, walk left and walk right.

Use the character turnaround sheet as the only identity reference.
If a walking reference spritesheet is provided, use it only as motion reference: step rhythm, leg movement, arm swing and timing.
Do not copy the reference character design.

Animation requirements:
- same chibi character in every frame
- same outfit, colors, hairstyle and accessories in every frame
- same head size and body proportions in every frame
- stable ground line
- no jitter
- no sliding except natural walking motion
- no changing scale
- no changing face style
- short cute chibi steps
- hair and clothing may bounce subtly

Direction requirements:
- walk down/front uses the front view
- walk up/back uses the back view
- walk left uses a true 90-degree left side view
- walk right uses a true 90-degree right side view
- side walking frames must remain true side profile, not 3/4 view

Technical output:
- transparent background only
- create four separate horizontal spritesheets, one per direction
- equal-size cells in each spritesheet
- 8 to 12 frames per direction
- full body visible in every frame
- centered inside each cell
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, 3/4 side view, partial side view, changing outfit, changing hairstyle, long realistic legs, adult proportions, cropped feet, jitter, inconsistent scale, extra limbs, blurry, low resolution

Final instruction:
Generate transparent-background walking spritesheets suitable for importing as desktop pet walk animations.`
  },
  {
    id: "run-4-directions",
    group: "Animaciones esenciales",
    title: "Correr 4 direcciones",
    summary: "Crea correr hacia frente, espalda, izquierda y derecha con mas energia que caminar.",
    usage: "Adjunta la hoja de 4 vistas. Si tienes una referencia de otra mascota corriendo, agregala como motion reference.",
    content: `Create four running sprite animations for the provided chibi character: run down/front, run up/back, run left and run right.

Use the character turnaround sheet as the identity reference.
Use any provided running reference only as motion reference: speed, body lean, step rhythm, bounce and timing.
Do not copy the reference character design.

Animation requirements:
- same chibi character in every frame
- same outfit, colors, hairstyle, accessories and face style
- same head size and body scale
- more energetic than walking
- slight forward lean in side runs
- faster leg movement and stronger arm swing
- hair, cape or clothing can trail slightly with motion
- stable ground line
- no frame jitter
- no scale changes
- no camera movement

Direction requirements:
- run down/front uses the front view
- run up/back uses the back view
- run left uses true 90-degree left profile
- run right uses true 90-degree right profile
- side runs must not become 3/4 views

Technical output:
- transparent background only
- create four separate horizontal spritesheets, one per direction
- equal-size cells
- 8 to 12 frames per direction
- full body visible in every frame
- centered inside each cell
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, 3/4 side view, partial side view, inconsistent outfit, changing face, adult proportions, long legs, cropped feet, jitter, blurry, low resolution

Final instruction:
Generate transparent-background running spritesheets ready for desktop pet movement animations.`
  },
  {
    id: "intro-outro",
    group: "Animaciones esenciales",
    title: "Entrada y salida",
    summary: "Crea una animacion para aparecer y otra para despedirse o salir de pantalla.",
    usage: "Usa la vista frontal chibi como identidad. Puedes pedir una entrada magica, salto pequeño, saludo o aparicion simple.",
    content: `Create two short transparent-background chibi sprite animations for the provided character: intro and outro.

Use the chibi character reference as the only identity reference.
Keep the same outfit, colors, hairstyle, accessories and proportions in all frames.

Intro animation:
- the character appears in a cute desktop pet style
- choose a simple readable action: tiny hop, sparkle entrance, wave, or pop-in
- end in the neutral idle pose

Outro animation:
- the character leaves or says goodbye
- choose a simple readable action: wave goodbye, tiny bow, fade-like step away, or small hop out
- start from the neutral idle pose

Technical output:
- transparent background only
- two separate horizontal spritesheets: intro and outro
- equal-size cells
- 12 to 24 frames per animation
- full body visible in every frame
- same scale in every frame
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- stable ground line unless the character briefly hops
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, different outfit, changing hairstyle, changing proportions, cropped body, extra limbs, excessive effects, heavy glow, blurry, low resolution

Final instruction:
Generate transparent-background intro and outro spritesheets suitable for a desktop pet.`
  },
  {
    id: "sleep-rest",
    group: "Animaciones esenciales",
    title: "Dormir / descansar",
    summary: "Genera una accion tranquila para cuando la mascota se queda quieta por un rato.",
    usage: "Adjunta la referencia chibi. Funciona bien con una pose simple sentada, acostada o cabeceando de sueño.",
    content: `Create a sleep or resting sprite animation for the provided chibi character.

Use the chibi character reference as the only identity reference.
Keep the same outfit, colors, hairstyle, accessories and chibi proportions in every frame.

Animation target:
- cute sleepy or resting behavior
- soft breathing motion
- slow head bob or relaxed sitting pose
- optional tiny sleep bubble or simple Z effect, but keep it small
- no large background effects
- no walking or running

Technical output:
- transparent background only
- horizontal spritesheet
- equal-size cells
- 12 to 24 frames
- seamless loop if possible
- full body visible in every frame
- centered inside each cell
- stable scale
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, bed, room, scenery, changing outfit, changing hairstyle, cropped body, excessive effects, extra characters, blurry, low resolution

Final instruction:
Generate a transparent-background sleep/rest spritesheet ready for desktop pet idle behavior.`
  },
  {
    id: "emote-reference",
    group: "Personalidad",
    title: "Emote desde referencia",
    summary: "Convierte una accion de otra imagen o spritesheet en un emote para tu mascota.",
    usage: "Adjunta tu personaje chibi y una referencia de movimiento de otra mascota haciendo click, saludo, celebracion, sorpresa o una secuencia corta.",
    content: `Create a chibi emote sprite animation for the provided character.

Use the chibi character reference as the only identity reference.
Use the provided emote/action reference only as motion reference: pose order, expression idea, body rhythm and timing.
Do not copy the reference character design, outfit, face, hair or colors.

Animation target:
[WRITE THE EMOTE HERE: wave, celebrate, surprised, attention, grab cursor, clap, cheer, angry, shy, laugh]

Requirements:
- same chibi character in every frame
- same outfit, colors, hairstyle and accessories
- same head size and body proportions
- expressive but readable movement
- stable scale
- no jitter
- full body visible
- transparent background only
- no extra characters
- no scene background

Technical output:
- horizontal spritesheet
- equal-size cells
- 12 to 32 frames depending on the action
- centered inside each cell
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, copied reference character, changed outfit, changed hairstyle, inconsistent face, cropped feet, cropped hair, extra limbs, blurry, low resolution

Final instruction:
Generate a transparent-background emote spritesheet that preserves the character identity and transfers only the action motion.`
  },
  {
    id: "dance-keyframes",
    group: "Personalidad",
    title: "Baile desde frames clave",
    summary: "Usa poses extraidas de un video o GIF para crear un baile chibi consistente.",
    usage: "Extrae 6 a 12 frames clave de un baile y adjuntalos junto al personaje chibi. Pide una animacion corta primero.",
    content: `Create a chibi dance sprite animation for the provided character.

Use the chibi character reference as the only identity reference.
Use the provided dance keyframes or pose sequence only as motion reference.
Transfer the rhythm, pose order, arm positions, body gestures and timing.
Do not copy the dancer identity, clothes, face, colors or proportions.

Animation requirements:
- same chibi character in every frame
- same outfit, colors, hairstyle, accessories and face style
- same chibi proportions
- full body visible in every frame
- transparent background only
- stable ground line unless the dance includes a small hop
- no camera movement
- no perspective changes
- no scale changes
- no jitter
- readable silhouette in every pose
- keep the dance cute and mascot-like

Technical output:
- horizontal spritesheet
- equal-size cells
- 8 to 24 frames
- seamless loop if the dance supports it
- centered inside each cell
- preserve a subtle complete outer silhouette outline in every frame
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- no labels, no text, no borders, no shadows outside the character

Negative prompt:
background, white background, colored background, text, labels, watermark, missing outline, broken outline, pure black thick outline, copied dancer design, changed outfit, changed hairstyle, realistic body, long legs, cropped feet, excessive motion blur, extra limbs, blurry, low resolution

Final instruction:
Generate a transparent-background dance spritesheet using the keyframes as motion reference while preserving the chibi character identity.`
  },
  {
    id: "add-outline-normal",
    group: "Utilidades",
    title: "Agregar outline a personaje",
    summary: "Auxiliar para una imagen chibi ya creada que necesita una silueta mas clara antes de recortar o animar.",
    usage: "Adjunta tu imagen chibi ya generada. Opcionalmente adjunta una referencia de Uma/chibi con outline para reforzar el estilo. Pide que conserve la imagen y solo mejore el borde.",
    content: `Add a subtle production-ready outer outline to the provided chibi character image.

Use the provided image as the exact character identity, pose, outfit, hairstyle, colors, expression and proportions.
Do not redesign the character.
Do not change the pose.
Do not change the outfit.
Do not change the face.
Do not upscale or blur the image.

Outline target:
- create a complete outer silhouette outline around the entire character
- include hair tips, long hair strands, hands, fingers, feet, shoes, accessories, capes, ribbons and small dangling details
- the outline must help separate the character from any background
- use a subtle color, not pure black
- preferred outline colors: soft dark brown, muted gray-brown, dark warm gray, or a darker color sampled from the character palette
- the outline should be visible around white hair, pale skin, white clothing and light accessories
- keep the outline consistent in thickness
- avoid thick comic-book line art
- avoid a sticker border look
- preserve the existing internal line art as much as possible
- preserve transparent background if the image already has transparency

If the image has a background:
- keep only the character
- output on transparent background
- do not add a white or colored background

Technical output:
- transparent background only
- full body visible
- same canvas framing if possible
- crisp edges
- preserve original detail and resolution
- no text, no logo, no watermark
- no shadow outside the character

Negative prompt:
redesigned character, changed outfit, changed hairstyle, changed face, changed pose, extra accessories, missing hair strands, missing fingers, missing feet, thick black outline, sticker border, glow border, blurred edges, lower resolution, white background, colored background, text, watermark

Final instruction:
Return the same chibi character with a clean subtle full-body outline, ready for background removal, frame cutting and desktop pet sprite creation.`
  },
  {
    id: "add-outline-json",
    group: "Utilidades",
    title: "Agregar outline - JSON",
    summary: "Version estructurada para pedir un borde sutil sin alterar el personaje.",
    usage: "Adjunta la imagen chibi ya hecha. Puedes agregar una referencia de outline, pero no es obligatorio.",
    content: `{
  "task": "Add a subtle production-ready outer outline to the provided chibi character image.",
  "reference_usage": {
    "main_image": "Use as the exact identity, pose, outfit, hairstyle, colors, expression, proportions and framing.",
    "optional_outline_reference": "Use only for outline thickness, softness and color behavior. Do not copy the reference character."
  },
  "do_not_change": [
    "character identity",
    "pose",
    "outfit",
    "hairstyle",
    "face",
    "expression",
    "colors",
    "proportions",
    "accessories",
    "resolution",
    "sharpness"
  ],
  "outline": {
    "type": "complete outer silhouette outline",
    "coverage": [
      "full body silhouette",
      "hair tips",
      "long hair strands",
      "hands",
      "fingers",
      "feet",
      "shoes",
      "accessories",
      "capes",
      "ribbons",
      "small dangling details"
    ],
    "color": "soft dark brown, muted gray-brown, dark warm gray, or a darker color sampled from the character palette",
    "visibility": "must remain visible around white hair, pale skin, white clothing and light accessories",
    "thickness": "subtle and consistent, not thick",
    "forbidden": [
      "pure black comic outline",
      "thick sticker border",
      "glow border",
      "blurred border"
    ]
  },
  "background": {
    "output": "transparent only",
    "if_background_exists": "remove it while preserving the character and outline",
    "forbidden": ["white background", "colored background", "decorative background", "shadow outside the character"]
  },
  "technical_output": {
    "full_body_visible": true,
    "crisp_edges": true,
    "preserve_original_detail": true,
    "preserve_canvas_framing_if_possible": true,
    "no_text": true,
    "no_logo": true,
    "no_watermark": true
  },
  "negative_prompt": [
    "redesigned character",
    "changed outfit",
    "changed hairstyle",
    "changed face",
    "changed pose",
    "extra accessories",
    "missing hair strands",
    "missing fingers",
    "missing feet",
    "thick black outline",
    "sticker border",
    "glow border",
    "blurred edges",
    "lower resolution",
    "white background",
    "colored background",
    "text",
    "watermark"
  ],
  "final_instruction": "Return the same chibi character with a clean subtle full-body outline, ready for background removal, frame cutting and desktop pet sprite creation."
}`
  },
  {
    id: "spritesheet-technical",
    group: "Utilidades",
    title: "Reglas tecnicas de spritesheet",
    summary: "Prompt auxiliar para pegar al final de cualquier pedido de animacion.",
    usage: "Usalo como refuerzo si ChatGPT genera fondos, cambia escala o entrega imagenes dificiles de recortar.",
    content: `Technical sprite output rules:

- transparent background only
- no white background
- no colored background
- no decorative background
- no scene
- no labels
- no text
- no title
- no watermark
- no borders between frames
- no shadows outside the character
- output as a horizontal spritesheet
- all frames must have equal-size cells
- the character must be centered inside each cell
- full body visible in every frame
- keep the same scale in every frame
- keep the same head size in every frame
- keep the same body proportions in every frame
- keep the same outfit, hairstyle, colors and accessories in every frame
- preserve a subtle complete outer silhouette outline in every frame
- outline color should be soft dark brown, muted gray-brown, dark warm gray, or a darker color sampled from the character palette
- outline must stay visible around pale hair, pale skin, white clothing, hands, feet and small accessories
- avoid thick pure black comic outlines
- feet should stay aligned to a stable invisible ground line unless the action jumps
- avoid jitter between frames
- avoid camera movement
- avoid perspective changes
- avoid changing face style
- avoid extra limbs or extra fingers

Final instruction:
The result must be ready to cut into individual transparent PNG frames for a desktop pet editor.`
  }
];

const state = {
  manifest: null,
  runtime: {
    channel: "dev",
    appMode: "desktop",
    version: "0.1.0",
    platform: "win32",
    arch: "x64",
    activeLibraryPath: ""
  },
  images: new Map(),
  soundLibrary: {
    folders: [],
    sounds: []
  },
  selectedSoundFolder: "",
  currentAnimationId: null,
  frameIndex: 0,
  playing: false,
  loopCurrent: true,
  keepPlayingOnChange: false,
  lastFrameTime: 0,
  animationOffsets: {},
  frameOffsets: {},
  simpleSettings: {
    applyToAll: false,
    global: { scale: 1, fps: 24 },
    byAnimation: {}
  },
  camera: {
    zoom: 1,
    panX: 0,
    panY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    touchMode: null,
    touchStartDistance: 0,
    touchStartZoom: 1,
    touchStartPanX: 0,
    touchStartPanY: 0,
    touchLastX: 0,
    touchLastY: 0
  },
  editorResize: {
    dragging: false,
    startY: 0,
    startHeight: 208
  },
  editorVisible: true,
  canvasSize: {
    width: 720,
    height: 520
  },
  exportProgress: {
    overlay: null,
    closeTimer: null
  },
  updateCenter: {
    overlay: null
  },
  importReview: {
    overlay: null,
    current: null,
    selectedAnimation: null,
    previewImages: new Map(),
    frameIndex: 0,
    lastFrameTime: 0,
    loopRunning: false
  },
  promptLibrary: {
    overlay: null,
    selectedId: "front-normal"
  },
  spriteCutter: {
    overlay: null,
    image: null,
    imageInfo: null,
    originalImageUrl: null,
    selectedCells: new Set(),
    cropRect: null,
    animations: {},
    activeAnimation: "Idle",
    previewIndex: 0,
    camera: {
      zoom: 1,
      panX: 0,
      panY: 0
    },
    drag: {
      mode: null,
      startCanvasX: 0,
      startCanvasY: 0,
      startImageX: 0,
      startImageY: 0,
      startPanX: 0,
      startPanY: 0
    },
    touch: {
      mode: null,
      startDistance: 0,
      startZoom: 1,
      startPanX: 0,
      startPanY: 0,
      lastX: 0,
      lastY: 0
    },
    backgroundRemoval: {
      color: "#ffffff",
      mode: "edge",
      aiModel: "medium",
      tolerance: 38,
      softness: 22,
      edgeExpand: 1,
      picking: false
    },
    imageEnhance: {
      scale: 2,
      mode: "hybrid",
      antiAlias: 45,
      sharpen: 32,
      alphaClean: 10
    },
    imageEnhanceLab: {
      overlay: null,
      sourceDataUrl: "",
      previewSourceDataUrl: "",
      previewTimer: null,
      previewRequest: 0,
      lastPreview: null,
      originalImage: null,
      previewImage: null,
      view: {
        zoom: 1,
        panX: 0,
        panY: 0,
        dragging: false,
        startX: 0,
        startY: 0,
        startPanX: 0,
        startPanY: 0,
        dragScaleX: 1,
        dragScaleY: 1,
        touchMode: null,
        touchStartDistance: 0,
        touchStartZoom: 1,
        touchLastX: 0,
        touchLastY: 0
      }
    },
    maskEditor: {
      visible: false,
      tool: "background",
      brushSize: 4,
      opacity: 48,
      grid: true,
      data: null,
      width: 0,
      height: 0,
      sourceDataUrl: "",
      recoveryDataUrl: "",
      recoveryWidth: 0,
      recoveryHeight: 0,
      target: "sheet",
      frameAnimation: "",
      frameIndex: -1,
      returnDataUrl: "",
      returnCamera: null,
      cursorX: -1,
      cursorY: -1
    },
    grid: {
      columns: 1,
      rows: 1,
      cellWidth: 0,
      cellHeight: 0,
      offsetX: 0,
      offsetY: 0,
      gapX: 0,
      gapY: 0
    }
  }
};

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

function getBaseSimpleSettings(animationId = state.currentAnimationId) {
  const animation = getAnimation(animationId);
  return {
    scale: animation?.scale || getDefaults().scale || 1,
    fps: animation?.fps || getDefaults().fps || 24
  };
}

function getSimpleSettings(animationId = state.currentAnimationId) {
  if (state.simpleSettings.applyToAll) return state.simpleSettings.global;
  return state.simpleSettings.byAnimation[animationId] || getBaseSimpleSettings(animationId);
}

function getFps(animation = getAnimation()) {
  return Number(getSimpleSettings(state.currentAnimationId).fps) || animation?.fps || getDefaults().fps || 24;
}

function getScale(animationId = state.currentAnimationId) {
  return Number(getSimpleSettings(animationId).scale) || getDefaults().scale || 1;
}

function getFrameOffsetKey(animationId = state.currentAnimationId, frameIndex = state.frameIndex) {
  return `${animationId}:${frameIndex}`;
}

function getAnimationOffset(animationId = state.currentAnimationId) {
  return state.animationOffsets[animationId] || { x: 0, y: 0 };
}

function getFrameOffset(animationId = state.currentAnimationId, frameIndex = state.frameIndex) {
  return state.frameOffsets[getFrameOffsetKey(animationId, frameIndex)] || { x: 0, y: 0 };
}

function setAnimation(animationId) {
  const animation = getAnimation(animationId);
  if (!animation) return;

  state.currentAnimationId = animationId;
  state.frameIndex = 0;
  state.playing = state.keepPlayingOnChange;
  state.lastFrameTime = 0;
  els.frameInput.max = Math.max(0, animation.frames - 1);
  els.frameInput.value = "0";
  els.animationLabelInput.value = animation.label || animationId;
  renderSoundOptions();
  syncSimpleInputs();
  syncOffsetInputs();
  syncPlaybackButtons();
  renderAnimationList();
  renderFrameStrip();
  draw();
}

function renderAnimationList() {
  els.animationList.innerHTML = "";

  for (const [id, animation] of Object.entries(state.manifest.animations)) {
    const button = document.createElement("button");
    button.textContent = animation.label || id;
    button.className = id === state.currentAnimationId ? "active" : "";
    button.addEventListener("click", () => setAnimation(id));
    els.animationList.appendChild(button);
  }
}

function renderGhostOptions() {
  const selectedValue = els.ghostSelect.value || state.manifest.editor?.referenceAnimation || "idle";
  els.ghostSelect.innerHTML = "";

  for (const [id, animation] of Object.entries(state.manifest.animations)) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = animation.label || id;
    els.ghostSelect.appendChild(option);
  }

  els.ghostSelect.value = getAnimation(selectedValue) ? selectedValue : state.manifest.editor?.referenceAnimation || "idle";
}

function createAnimationOption(animationId, animation) {
  const option = document.createElement("option");
  option.value = animationId;
  option.textContent = animation.label || animationId;
  return option;
}

function fillAnimationSelect(select, selectedValue, allowEmpty = false) {
  select.innerHTML = "";

  if (allowEmpty) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Sin asignar";
    select.appendChild(emptyOption);
  }

  for (const [id, animation] of Object.entries(state.manifest.animations)) {
    select.appendChild(createAnimationOption(id, animation));
  }

  select.value = selectedValue || "";
}

function renderSoundFolders() {
  if (!els.soundFolderSelect) return;
  const selectedValue = state.selectedSoundFolder;
  els.soundFolderSelect.innerHTML = "";

  const looseOption = document.createElement("option");
  looseOption.value = "";
  looseOption.textContent = "Sueltos";
  els.soundFolderSelect.appendChild(looseOption);

  for (const folder of state.soundLibrary.folders) {
    const option = document.createElement("option");
    option.value = folder;
    option.textContent = folder;
    els.soundFolderSelect.appendChild(option);
  }

  els.soundFolderSelect.value = state.soundLibrary.folders.includes(selectedValue) ? selectedValue : "";
  state.selectedSoundFolder = els.soundFolderSelect.value;
}

function getVisibleLibrarySounds() {
  return state.soundLibrary.sounds.filter((sound) => (sound.folder || "") === state.selectedSoundFolder);
}

function renderSoundOptions() {
  if (!els.soundSelect) return;
  const animation = getAnimation();
  const selectedValue = animation?.sound || "";
  const existingOptions = new Set();
  els.soundSelect.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Sin sonido";
  els.soundSelect.appendChild(emptyOption);
  existingOptions.add("");

  for (const sound of getVisibleLibrarySounds()) {
    const option = document.createElement("option");
    option.value = sound.id;
    option.textContent = sound.name;
    els.soundSelect.appendChild(option);
    existingOptions.add(sound.id);
  }

  if (selectedValue && !existingOptions.has(selectedValue)) {
    const assignedSound = state.soundLibrary.sounds.find((sound) => sound.id === selectedValue);
    const option = document.createElement("option");
    option.value = selectedValue;
    option.textContent = assignedSound ? `Asignado / ${assignedSound.relativePath}` : `Asignado / ${selectedValue}`;
    els.soundSelect.appendChild(option);
  }

  els.soundSelect.value = selectedValue;
  els.syncSoundToggle.checked = animation?.syncToSound === true;
}

async function refreshSoundLibrary() {
  const result = await window.petStudio.listSounds();
  state.soundLibrary = {
    folders: result?.folders || [],
    sounds: result?.sounds || []
  };
  renderSoundFolders();
  renderSoundOptions();
}

function renderActionMappings() {
  if (!els.actionMappingList) return;
  els.actionMappingList.innerHTML = "";
  state.manifest.actions ||= {};

  for (const [actionKey, actionLabel] of simpleActionRows) {
    const row = document.createElement("label");
    row.className = "action-row";
    const label = document.createElement("span");
    label.textContent = actionLabel;
    const select = document.createElement("select");
    select.className = "field";
    fillAnimationSelect(select, state.manifest.actions[actionKey], true);
    select.addEventListener("change", () => {
      if (select.value) state.manifest.actions[actionKey] = select.value;
      else delete state.manifest.actions[actionKey];
    });
    row.append(label, select);
    els.actionMappingList.appendChild(row);
  }

  for (const [groupKey, groupLabel] of directionalActionRows) {
    state.manifest.actions[groupKey] ||= {};
    for (const [directionKey, directionLabel] of directions) {
      if (groupKey === "patrol" && !["left", "right", "up", "down"].includes(directionKey)) continue;
      const row = document.createElement("label");
      row.className = "action-row";
      const label = document.createElement("span");
      label.textContent = `${groupLabel} ${directionLabel}`;
      const select = document.createElement("select");
      select.className = "field";
      fillAnimationSelect(select, state.manifest.actions[groupKey][directionKey], true);
      select.addEventListener("change", () => {
        if (select.value) state.manifest.actions[groupKey][directionKey] = select.value;
        else delete state.manifest.actions[groupKey][directionKey];
      });
      row.append(label, select);
      els.actionMappingList.appendChild(row);
    }
  }

  const randomActions = Array.isArray(state.manifest.actions.random) ? state.manifest.actions.random : [];
  for (let index = 0; index < Math.max(4, randomActions.length + 1); index += 1) {
    const row = document.createElement("label");
    row.className = "action-row";
    const label = document.createElement("span");
    label.textContent = `Emote ${index + 1}`;
    const select = document.createElement("select");
    select.className = "field";
    fillAnimationSelect(select, randomActions[index], true);
    select.addEventListener("change", () => {
      const nextRandom = Array.isArray(state.manifest.actions.random) ? [...state.manifest.actions.random] : [];
      nextRandom[index] = select.value;
      state.manifest.actions.random = nextRandom.filter(Boolean);
      renderActionMappings();
    });
    row.append(label, select);
    els.actionMappingList.appendChild(row);
  }
}

function renderFrameStrip() {
  if (!els.frameStrip) return;
  els.frameStrip.innerHTML = "";

  const animation = getAnimation();
  const image = state.images.get(state.currentAnimationId);
  if (!animation || !image) return;

  const { width, height, columns } = getFrameSize(animation);
  for (let index = 0; index < animation.frames; index += 1) {
    const button = document.createElement("button");
    button.className = "frame-button";
    button.type = "button";
    button.dataset.frame = String(index);

    const thumb = document.createElement("canvas");
    thumb.width = 48;
    thumb.height = 48;
    const thumbCtx = thumb.getContext("2d");
    const sourceX = (index % columns) * width;
    const sourceY = Math.floor(index / columns) * height;
    const fitScale = Math.min(thumb.width / width, thumb.height / height);
    const drawWidth = width * fitScale;
    const drawHeight = height * fitScale;
    thumbCtx.imageSmoothingEnabled = false;
    thumbCtx.clearRect(0, 0, thumb.width, thumb.height);
    thumbCtx.drawImage(image, sourceX, sourceY, width, height, (thumb.width - drawWidth) / 2, (thumb.height - drawHeight) / 2, drawWidth, drawHeight);

    const number = document.createElement("span");
    number.textContent = String(index + 1);
    button.append(thumb, number);
    button.addEventListener("click", () => {
      state.frameIndex = index;
      els.frameInput.value = String(index);
      syncOffsetInputs();
      syncFrameStripSelection();
      draw();
    });
    els.frameStrip.appendChild(button);
  }

  syncFrameStripSelection();
}

function syncFrameStripSelection() {
  if (!els.frameStrip) return;
  for (const button of els.frameStrip.querySelectorAll(".frame-button")) {
    button.classList.toggle("active", Number(button.dataset.frame) === state.frameIndex);
  }
}

function syncOffsetInputs() {
  const animationOffset = getAnimationOffset();
  const frameOffset = getFrameOffset();
  els.animOffsetX.value = animationOffset.x;
  els.animOffsetY.value = animationOffset.y;
  els.frameOffsetX.value = frameOffset.x;
  els.frameOffsetY.value = frameOffset.y;
}

function loadSavedOffsets() {
  state.animationOffsets = {};
  state.frameOffsets = {};

  for (const [animationId, animation] of Object.entries(state.manifest.animations || {})) {
    if (animation.offset) {
      state.animationOffsets[animationId] = {
        x: Number(animation.offset.x) || 0,
        y: Number(animation.offset.y) || 0
      };
    }

    for (const [frameIndex, offset] of Object.entries(animation.frameOffsets || {})) {
      state.frameOffsets[getFrameOffsetKey(animationId, Number(frameIndex))] = {
        x: Number(offset.x) || 0,
        y: Number(offset.y) || 0
      };
    }
  }
}

function syncSimpleInputs() {
  const settings = getSimpleSettings();
  els.scaleInput.value = String(settings.scale);
  els.fpsInput.value = String(settings.fps);
  els.applyAllToggle.checked = state.simpleSettings.applyToAll;
  syncSimpleValueLabels();
}

function syncSimpleValueLabels() {
  els.scaleValue.textContent = `${Number(els.scaleInput.value).toFixed(2)}x`;
  els.fpsValue.textContent = `${Number(els.fpsInput.value)} fps`;
}

function syncPlaybackButtons() {
  enforcePlaybackRules();
  els.playButton.textContent = state.playing ? "Pausa" : "Play";
  els.playButton.classList.toggle("active", state.playing);
  els.loopButton.classList.toggle("active", state.loopCurrent);
  els.autoPlayButton.classList.toggle("active", state.keepPlayingOnChange);
}

function syncEditorVisibility() {
  document.body.classList.toggle("editor-collapsed", !state.editorVisible);
  els.editorToggleButton.classList.toggle("active", state.editorVisible);
  els.editorToggleButton.textContent = state.editorVisible ? "Editor" : "Mostrar editor";
  requestAnimationFrame(resizeStageCanvas);
}

function resetCamera() {
  state.camera.zoom = 1;
  state.camera.panX = 0;
  state.camera.panY = 0;
  draw();
}

function ensureExportProgressOverlay() {
  if (state.exportProgress.overlay) return state.exportProgress.overlay;

  const overlay = document.createElement("div");
  overlay.className = "export-progress-overlay";
  overlay.innerHTML = `
    <section class="export-progress-dialog" role="status" aria-live="polite">
      <h2 id="exportProgressTitle">Exportando</h2>
      <p id="exportProgressMessage">Preparando archivos...</p>
      <div class="export-progress-track">
        <div id="exportProgressBar" class="export-progress-bar"></div>
      </div>
      <p id="exportProgressMeta" class="export-progress-meta">0%</p>
    </section>
  `;
  document.body.appendChild(overlay);
  state.exportProgress.overlay = overlay;
  return overlay;
}

function setExportProgress(message = {}) {
  const overlay = ensureExportProgressOverlay();
  const title = overlay.querySelector("#exportProgressTitle");
  const text = overlay.querySelector("#exportProgressMessage");
  const bar = overlay.querySelector("#exportProgressBar");
  const meta = overlay.querySelector("#exportProgressMeta");
  const percent = clamp(Number(message.percent || 0), 0, 100);

  if (state.exportProgress.closeTimer) {
    clearTimeout(state.exportProgress.closeTimer);
    state.exportProgress.closeTimer = null;
  }

  overlay.classList.add("open");
  overlay.classList.toggle("done", message.status === "done");
  overlay.classList.toggle("error", message.status === "error");
  title.textContent = message.title || "Exportando";
  text.textContent = message.message || "Procesando archivos...";
  bar.style.width = `${percent}%`;
  meta.textContent = `${percent}%`;

  if (message.current != null && message.total != null && message.total > 1) {
    meta.textContent = `${percent}% - ${message.current}/${message.total}`;
  }

  if (message.status === "done" || message.status === "error") {
    state.exportProgress.closeTimer = setTimeout(() => {
      overlay.classList.remove("open", "done", "error");
    }, message.status === "done" ? 1400 : 2400);
  }
}

function ensureUpdateCenterOverlay() {
  if (state.updateCenter.overlay) return state.updateCenter.overlay;

  const overlay = document.createElement("div");
  overlay.className = "update-center-overlay";
  overlay.innerHTML = `
    <section class="update-center-dialog" role="dialog" aria-modal="true">
      <header class="update-center-header">
        <div>
          <h2>Actualizaciones</h2>
          <p>Centro preparado para futuras versiones de Pet Studio.</p>
        </div>
        <button id="updateCenterCloseButton" class="icon-button" type="button">Cerrar</button>
      </header>

      <div class="update-center-body">
        <section class="update-center-card">
          <h3>Version instalada</h3>
          <div class="update-center-stat-grid">
            <span>
              <strong id="updateCurrentVersion">0.1.0</strong>
              Version
            </span>
            <span>
              <strong id="updateCurrentChannel">DEV</strong>
              Canal
            </span>
            <span>
              <strong id="updateCurrentPlatform">win32 x64</strong>
              Plataforma
            </span>
          </div>
        </section>

        <section class="update-center-card">
          <h3>Estado</h3>
          <p id="updateCenterStatus">Repositorio configurado: Zoxs1/Pet-Repository. Puedes comprobar conexion y releases publicados.</p>
        </section>

        <section class="update-center-card">
          <h3>Flujo preparado</h3>
          <div class="update-center-actions">
            <button id="updateCheckButton" class="primary-button" type="button">Buscar actualizacion</button>
            <button id="updateDownloadButton" class="secondary-button" type="button" disabled>Descargar actualizacion</button>
            <button id="updateInstallButton" class="secondary-button" type="button" disabled>Instalar y reiniciar</button>
            <button id="updateCleanButton" class="secondary-button" type="button" disabled>Limpiar temporal</button>
          </div>
        </section>

        <section class="update-center-card">
          <h3>Ultima revision</h3>
          <div id="updateReleaseInfo" class="update-release-info">
            <p>Sin revision todavia.</p>
          </div>
        </section>

        <section class="update-center-card">
          <h3>Arquitectura prevista</h3>
          <ul class="update-center-list">
            <li>PC: detectar release, descargar Setup, verificar archivo y abrir instalador.</li>
            <li>Android: detectar APK y abrir enlace/descarga para instalacion manual.</li>
            <li>Datos: conservar mascotas, sonidos, imports, exports y configuracion fuera de la app.</li>
          </ul>
        </section>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector("#updateCenterCloseButton").addEventListener("click", closeUpdateCenter);
  overlay.querySelector("#updateCheckButton").addEventListener("click", checkForUpdates);
  state.updateCenter.overlay = overlay;
  return overlay;
}

function syncUpdateCenterInfo() {
  const overlay = ensureUpdateCenterOverlay();
  overlay.querySelector("#updateCurrentVersion").textContent = state.runtime.version || "0.1.0";
  overlay.querySelector("#updateCurrentChannel").textContent = String(state.runtime.channel || "dev").toUpperCase();
  overlay.querySelector("#updateCurrentPlatform").textContent = `${state.runtime.platform || "win32"} ${state.runtime.arch || "x64"}`;
}

function renderUpdateAssetList(container, assets = []) {
  if (!assets.length) {
    const empty = document.createElement("p");
    empty.textContent = "El release no tiene archivos adjuntos.";
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("ul");
  list.className = "update-center-list";
  for (const asset of assets) {
    const item = document.createElement("li");
    const sizeMb = asset.size ? `${(asset.size / 1024 / 1024).toFixed(1)} MB` : "tamano desconocido";
    item.textContent = `${asset.name} - ${sizeMb}`;
    list.appendChild(item);
  }
  container.appendChild(list);
}

function renderUpdateResult(result) {
  const overlay = ensureUpdateCenterOverlay();
  const status = overlay.querySelector("#updateCenterStatus");
  const info = overlay.querySelector("#updateReleaseInfo");
  info.innerHTML = "";

  if (!result?.ok) {
    status.textContent = `Sin conexion o sin acceso al repositorio: ${result?.reason || "error desconocido"}`;
    const details = document.createElement("p");
    details.textContent = "Verifica internet, permisos del repositorio o que el repositorio tenga acceso publico.";
    info.appendChild(details);
    return;
  }

  status.textContent = result.message || "Revision completada.";

  if (!result.hasRelease) {
    const details = document.createElement("p");
    details.textContent = "Conexion comprobada. Cuando publiques un GitHub Release, la app podra comparar versiones y detectar instaladores.";
    info.appendChild(details);
    return;
  }

  const release = result.release || {};
  const summary = document.createElement("div");
  summary.className = "update-release-summary";
  const statusText = result.hasUpdate ? "Actualizacion disponible" : "Sin actualizacion nueva";
  const setupText = release.setupAsset ? `Setup detectado: ${release.setupAsset.name}` : "Setup de Windows no detectado.";
  const apkText = release.apkAsset ? `APK detectado: ${release.apkAsset.name}` : "APK no detectado.";
  const statusLine = document.createElement("p");
  const statusStrong = document.createElement("strong");
  statusStrong.textContent = statusText;
  statusLine.appendChild(statusStrong);
  const versionLine = document.createElement("p");
  versionLine.textContent = `Instalada: ${result.currentVersion || state.runtime.version} | Publicada: ${result.latestVersion || release.version || "sin version"}`;
  const setupLine = document.createElement("p");
  setupLine.textContent = setupText;
  const apkLine = document.createElement("p");
  apkLine.textContent = apkText;
  summary.append(statusLine, versionLine, setupLine, apkLine);
  info.appendChild(summary);
  renderUpdateAssetList(info, release.assets || []);
}

async function checkForUpdates() {
  const overlay = ensureUpdateCenterOverlay();
  const button = overlay.querySelector("#updateCheckButton");
  const status = overlay.querySelector("#updateCenterStatus");
  const info = overlay.querySelector("#updateReleaseInfo");
  button.disabled = true;
  status.textContent = "Conectando con GitHub Releases...";
  info.innerHTML = "<p>Consultando https://github.com/Zoxs1/Pet-Repository</p>";

  const result = await window.petStudio.checkForUpdates();
  renderUpdateResult(result);
  button.disabled = false;
}

function openUpdateCenter() {
  const overlay = ensureUpdateCenterOverlay();
  syncUpdateCenterInfo();
  overlay.classList.add("open");
}

function closeUpdateCenter() {
  ensureUpdateCenterOverlay().classList.remove("open");
}

function getPromptTemplate(promptId = state.promptLibrary.selectedId) {
  return promptTemplates.find((template) => template.id === promptId) || promptTemplates[0];
}

function ensurePromptLibraryOverlay() {
  if (state.promptLibrary.overlay) return state.promptLibrary.overlay;

  const overlay = document.createElement("div");
  overlay.className = "prompt-library-overlay";
  overlay.innerHTML = `
    <section class="prompt-library-dialog" role="dialog" aria-modal="true">
      <header class="prompt-library-header">
        <div>
          <h2>Promts</h2>
          <p>Plantillas para crear bases chibi listas para sprites.</p>
        </div>
        <button id="promptLibraryCloseButton" class="icon-button" type="button">Cerrar</button>
      </header>
      <div class="prompt-library-body">
        <aside id="promptTemplateList" class="prompt-template-list"></aside>
        <section class="prompt-template-detail">
          <div class="prompt-template-intro">
            <h3 id="promptTemplateTitle">Prompt</h3>
            <p id="promptTemplateSummary"></p>
            <p id="promptTemplateUsage"></p>
          </div>
          <textarea id="promptTemplateText" class="prompt-template-text" readonly spellcheck="false"></textarea>
        </section>
      </div>
      <footer class="prompt-library-actions">
        <p id="promptCopyStatus">Elige una plantilla y copiala para usarla con tu IA generativa.</p>
        <button id="promptCopyButton" class="primary-button" type="button">Copiar prompt</button>
      </footer>
    </section>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector("#promptLibraryCloseButton").addEventListener("click", closePromptLibrary);
  overlay.querySelector("#promptCopyButton").addEventListener("click", copySelectedPromptTemplate);
  state.promptLibrary.overlay = overlay;
  return overlay;
}

function renderPromptTemplateList() {
  const overlay = ensurePromptLibraryOverlay();
  const list = overlay.querySelector("#promptTemplateList");
  list.innerHTML = "";
  let currentGroup = "";

  for (const template of promptTemplates) {
    if (template.group !== currentGroup) {
      currentGroup = template.group;
      const groupLabel = document.createElement("p");
      groupLabel.className = "prompt-template-group";
      groupLabel.textContent = currentGroup;
      list.appendChild(groupLabel);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-template-row";
    button.classList.toggle("active", template.id === state.promptLibrary.selectedId);
    const title = document.createElement("strong");
    title.textContent = template.title;
    const summary = document.createElement("span");
    summary.textContent = template.summary;
    button.append(title, summary);
    button.addEventListener("click", () => selectPromptTemplate(template.id));
    list.appendChild(button);
  }
}

function selectPromptTemplate(promptId) {
  const overlay = ensurePromptLibraryOverlay();
  const template = getPromptTemplate(promptId);
  state.promptLibrary.selectedId = template.id;

  overlay.querySelector("#promptTemplateTitle").textContent = template.title;
  overlay.querySelector("#promptTemplateSummary").textContent = template.summary;
  overlay.querySelector("#promptTemplateUsage").textContent = template.usage;
  overlay.querySelector("#promptTemplateText").value = template.content;
  overlay.querySelector("#promptCopyStatus").textContent = "Listo para copiar.";
  renderPromptTemplateList();
}

function openPromptLibrary(promptId = "") {
  const overlay = ensurePromptLibraryOverlay();
  overlay.classList.add("open");
  selectPromptTemplate(promptId || state.promptLibrary.selectedId || promptTemplates[0].id);
}

function closePromptLibrary() {
  ensurePromptLibraryOverlay().classList.remove("open");
}

async function copySelectedPromptTemplate() {
  const overlay = ensurePromptLibraryOverlay();
  const template = getPromptTemplate();
  const text = overlay.querySelector("#promptTemplateText").value || template.content;
  const status = overlay.querySelector("#promptCopyStatus");

  try {
    if (window.petStudio?.copyText) {
      await window.petStudio.copyText(text);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("Portapapeles no disponible.");
    }
    status.textContent = `Copiado: ${template.title}`;
  } catch (error) {
    status.textContent = `No se pudo copiar: ${error.message}`;
  }
}

function ensureSpriteCutterEnhanceLabOverlay() {
  if (state.spriteCutter.imageEnhanceLab.overlay) return state.spriteCutter.imageEnhanceLab.overlay;

  const overlay = document.createElement("div");
  overlay.className = "enhance-lab-overlay";
  overlay.innerHTML = `
    <section class="enhance-lab-dialog" role="dialog" aria-modal="true">
      <header class="enhance-lab-header">
        <div>
          <h2>Mejorar imagen</h2>
          <p>Previsualiza antes/despues y aplica la mejora solo cuando el resultado te convenza.</p>
        </div>
        <button id="enhanceLabCloseButton" class="icon-button" type="button">Cerrar</button>
      </header>
      <div class="enhance-lab-body">
        <aside class="enhance-lab-controls">
          <label>
            Escala final
            <select id="enhanceLabScale">
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
            </select>
          </label>
          <label>
            Modo
            <select id="enhanceLabMode">
              <option value="hybrid">Hibrido IA/anime</option>
              <option value="crisp">Sprite nitido</option>
              <option value="smooth">Anime suave</option>
            </select>
          </label>
          <label>
            <span class="label-row">
              <span>Anti-aliasing</span>
              <output id="enhanceLabAaValue">45%</output>
            </span>
            <input id="enhanceLabAa" type="range" min="0" max="100" step="1" value="45">
          </label>
          <label>
            <span class="label-row">
              <span>Nitidez</span>
              <output id="enhanceLabSharpenValue">32%</output>
            </span>
            <input id="enhanceLabSharpen" type="range" min="0" max="100" step="1" value="32">
          </label>
          <label>
            <span class="label-row">
              <span>Limpiar alpha</span>
              <output id="enhanceLabAlphaValue">10</output>
            </span>
            <input id="enhanceLabAlpha" type="range" min="0" max="80" step="1" value="10">
          </label>
          <p id="enhanceLabStatus" class="enhance-lab-status">Abriendo preview...</p>
          <div class="enhance-lab-actions">
            <button id="enhanceLabApplyButton" class="primary-button" type="button">Aplicar mejora</button>
            <button id="enhanceLabResetButton" class="secondary-button" type="button">Reiniciar valores</button>
          </div>
        </aside>
        <section class="enhance-lab-preview">
          <div class="enhance-preview-card">
            <header>
              <strong>Original</strong>
              <span id="enhanceLabOriginalMeta">0 x 0</span>
            </header>
            <canvas id="enhanceLabOriginalCanvas" width="420" height="420"></canvas>
          </div>
          <div class="enhance-preview-card">
            <header>
              <strong>Preview</strong>
              <span id="enhanceLabPreviewMeta">Esperando</span>
            </header>
            <canvas id="enhanceLabPreviewCanvas" width="420" height="420"></canvas>
          </div>
        </section>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector("#enhanceLabCloseButton").addEventListener("click", closeSpriteCutterEnhanceLab);
  overlay.querySelector("#enhanceLabApplyButton").addEventListener("click", applySpriteCutterEnhanceLab);
  overlay.querySelector("#enhanceLabResetButton").addEventListener("click", resetSpriteCutterEnhanceLabValues);
  for (const canvas of overlay.querySelectorAll("#enhanceLabOriginalCanvas, #enhanceLabPreviewCanvas")) {
    canvas.addEventListener("wheel", zoomEnhanceLabView, { passive: false });
    canvas.addEventListener("mousedown", startEnhanceLabPan);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener("touchstart", startEnhanceLabTouch, { passive: false });
    canvas.addEventListener("touchmove", moveEnhanceLabTouch, { passive: false });
    canvas.addEventListener("touchend", endEnhanceLabTouch);
    canvas.addEventListener("touchcancel", endEnhanceLabTouch);
  }

  for (const input of overlay.querySelectorAll("select, input")) {
    input.addEventListener("input", () => {
      syncEnhanceLabControlsToState();
      scheduleSpriteCutterEnhancePreview();
    });
    input.addEventListener("change", () => {
      syncEnhanceLabControlsToState();
      scheduleSpriteCutterEnhancePreview();
    });
  }

  state.spriteCutter.imageEnhanceLab.overlay = overlay;
  return overlay;
}

function closeSpriteCutterEnhanceLab() {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (lab.previewTimer) {
    clearTimeout(lab.previewTimer);
    lab.previewTimer = null;
  }
  ensureSpriteCutterEnhanceLabOverlay().classList.remove("open");
}

function setEnhanceLabStatus(message) {
  getEnhanceLabControl("enhanceLabStatus").textContent = message;
}

function ensureSpriteCutterOverlay() {
  if (state.spriteCutter.overlay) return state.spriteCutter.overlay;

  const overlay = document.createElement("div");
  overlay.className = "sprite-cutter-overlay";
  overlay.innerHTML = `
    <section class="sprite-cutter-dialog" role="dialog" aria-modal="true">
      <header class="sprite-cutter-header">
        <div>
          <h2>Recortador de frames</h2>
          <p>Prepara carpetas de imagenes individuales desde un spritesheet.</p>
        </div>
        <button id="spriteCutterCloseButton" class="icon-button" type="button">Cerrar</button>
      </header>
      <div class="sprite-cutter-body">
        <aside class="sprite-cutter-controls">
          <details class="sprite-cutter-tool-panel" open>
            <summary>Archivo</summary>
            <button id="spriteCutterOpenButton" class="primary-button" type="button">Abrir imagen</button>
            <label>
              Nombre mascota
              <input id="spriteCutterPetName" type="text" value="NuevaMascota">
            </label>
            <label>
              Animacion activa
              <input id="spriteCutterAnimationName" type="text" value="Idle">
            </label>
          </details>

          <details class="sprite-cutter-tool-panel" open>
            <summary>Corte</summary>
            <div class="sprite-cutter-grid">
              <label>Columnas<input id="spriteCutterColumns" type="number" min="1" value="1"></label>
              <label>Filas<input id="spriteCutterRows" type="number" min="1" value="1"></label>
              <label>Ancho celda<input id="spriteCutterCellWidth" type="number" min="1" value="0"></label>
              <label>Alto celda<input id="spriteCutterCellHeight" type="number" min="1" value="0"></label>
              <label>X inicio<input id="spriteCutterOffsetX" type="number" min="0" value="0"></label>
              <label>Y inicio<input id="spriteCutterOffsetY" type="number" min="0" value="0"></label>
              <label>Gap X<input id="spriteCutterGapX" type="number" min="0" value="0"></label>
              <label>Gap Y<input id="spriteCutterGapY" type="number" min="0" value="0"></label>
            </div>
            <div class="sprite-cutter-button-grid">
              <button id="spriteCutterFitGridButton" class="secondary-button" type="button">Calcular celdas</button>
              <button id="spriteCutterSelectAllButton" class="secondary-button" type="button">Seleccionar todo</button>
              <button id="spriteCutterClearSelectionButton" class="secondary-button" type="button">Limpiar seleccion</button>
              <button id="spriteCutterResetViewButton" class="secondary-button" type="button">Reiniciar vista</button>
            </div>
            <button id="spriteCutterAddButton" class="primary-button" type="button">Agregar a animacion</button>
          </details>

          <details class="sprite-cutter-tool-panel">
            <summary>Quitar fondo</summary>
            <label>
              Modo
              <select id="spriteCutterBgMode">
                <option value="edge">Borde inteligente</option>
                <option value="color">Todo color similar</option>
              </select>
            </label>
            <p class="sprite-cutter-help">Borde inteligente solo borra fondo conectado al borde; protege cabello, piel y ropa clara dentro del personaje.</p>
            <div class="sprite-cutter-color-row">
              <label>
                Color
                <input id="spriteCutterBgColor" type="color" value="#ffffff">
              </label>
              <button id="spriteCutterPickBgButton" class="secondary-button" type="button">Gotero</button>
            </div>
            <label>
              <span class="label-row">
                <span>Tolerancia</span>
                <output id="spriteCutterToleranceValue">38</output>
              </span>
              <input id="spriteCutterTolerance" type="range" min="0" max="160" step="1" value="38">
            </label>
            <label>
              <span class="label-row">
                <span>Suavizado</span>
                <output id="spriteCutterSoftnessValue">22</output>
              </span>
              <input id="spriteCutterSoftness" type="range" min="0" max="120" step="1" value="22">
            </label>
            <label>
              <span class="label-row">
                <span>Expandir borde</span>
                <output id="spriteCutterEdgeExpandValue">1</output>
              </span>
              <input id="spriteCutterEdgeExpand" type="range" min="0" max="8" step="1" value="1">
            </label>
            <div class="sprite-cutter-button-grid">
              <button id="spriteCutterRemoveBgButton" class="primary-button" type="button">Aplicar</button>
              <button id="spriteCutterRestoreImageButton" class="secondary-button" type="button">Restaurar</button>
            </div>
            <div class="sprite-cutter-ai-row">
              <label>
                IA local
                <select id="spriteCutterAiModel">
                  <option value="medium">Medium calidad</option>
                  <option value="small">Small rapido</option>
                  <option value="large">Large experimental</option>
                </select>
              </label>
              <button id="spriteCutterAiRemoveBgButton" class="primary-button" type="button">Quitar con IA</button>
            </div>
          </details>

          <details class="sprite-cutter-tool-panel">
            <summary>Máscara manual</summary>
            <p class="sprite-cutter-help">Corrige zonas afectadas sin obligarte a revisar siempre. Rojo = fondo que se borrara al aplicar.</p>
            <label class="sprite-cutter-check-row">
              <input id="spriteCutterMaskVisible" type="checkbox">
              <span>Ver zona afectada</span>
            </label>
            <div class="sprite-cutter-button-grid">
              <button id="spriteCutterMaskPaintButton" class="secondary-button active" type="button">Pintar fondo</button>
              <button id="spriteCutterMaskProtectButton" class="secondary-button" type="button">Proteger</button>
            </div>
            <label>
              <span class="label-row">
                <span>Tamaño</span>
                <output id="spriteCutterMaskBrushValue">4 px</output>
              </span>
              <input id="spriteCutterMaskBrush" type="range" min="1" max="32" step="1" value="4">
            </label>
            <label>
              <span class="label-row">
                <span>Opacidad</span>
                <output id="spriteCutterMaskOpacityValue">48%</output>
              </span>
              <input id="spriteCutterMaskOpacity" type="range" min="10" max="85" step="1" value="48">
            </label>
            <label class="sprite-cutter-check-row">
              <input id="spriteCutterMaskGrid" type="checkbox" checked>
              <span>Cuadricula al acercar</span>
            </label>
            <div class="sprite-cutter-button-grid">
              <button id="spriteCutterMaskFromAlphaButton" class="secondary-button" type="button">Crear desde alpha</button>
              <button id="spriteCutterMaskApplyButton" class="primary-button" type="button">Aplicar máscara</button>
              <button id="spriteCutterMaskDiscardButton" class="secondary-button" type="button">Descartar</button>
            </div>
          </details>

          <details class="sprite-cutter-tool-panel">
            <summary>Mejorar imagen</summary>
            <p class="sprite-cutter-help">Aumenta resolucion sin cambiar de app. Usa Hibrido para IA/anime y Crisp para pixel-perfect.</p>
            <div class="sprite-cutter-grid">
              <label>
                Escala
                <select id="spriteCutterEnhanceScale">
                  <option value="2">2x</option>
                  <option value="3">3x</option>
                  <option value="4">4x</option>
                </select>
              </label>
              <label>
                Modo
                <select id="spriteCutterEnhanceMode">
                  <option value="hybrid">Hibrido</option>
                  <option value="crisp">Crisp</option>
                  <option value="smooth">Suave</option>
                </select>
              </label>
            </div>
            <label>
              <span class="label-row">
                <span>Anti-aliasing</span>
                <output id="spriteCutterEnhanceAaValue">45%</output>
              </span>
              <input id="spriteCutterEnhanceAa" type="range" min="0" max="100" step="1" value="45">
            </label>
            <label>
              <span class="label-row">
                <span>Nitidez</span>
                <output id="spriteCutterEnhanceSharpenValue">32%</output>
              </span>
              <input id="spriteCutterEnhanceSharpen" type="range" min="0" max="100" step="1" value="32">
            </label>
            <label>
              <span class="label-row">
                <span>Limpiar alpha</span>
                <output id="spriteCutterEnhanceAlphaValue">10</output>
              </span>
              <input id="spriteCutterEnhanceAlpha" type="range" min="0" max="80" step="1" value="10">
            </label>
            <div class="sprite-cutter-button-grid">
              <button id="spriteCutterEnhanceApplyButton" class="primary-button" type="button">Abrir preview</button>
              <button id="spriteCutterEnhanceFramesButton" class="secondary-button" type="button">Mejorar frames</button>
            </div>
          </details>

          <details class="sprite-cutter-tool-panel">
            <summary>Salida</summary>
            <button id="spriteCutterExportButton" class="primary-button" type="button">Exportar carpetas</button>
            <button id="spriteCutterResetButton" class="secondary-button" type="button">Vaciar temporal</button>
          </details>
          <p id="spriteCutterStatus">Abre una imagen para comenzar.</p>
        </aside>
        <section class="sprite-cutter-stage-panel">
          <div class="sprite-cutter-stage-wrap">
            <canvas id="spriteCutterCanvas" width="640" height="360"></canvas>
          </div>
        </section>
        <aside class="sprite-cutter-library">
          <h3>Animaciones temporales</h3>
          <div id="spriteCutterAnimationList" class="sprite-cutter-animation-list"></div>
          <h3>Frames de la animacion</h3>
          <div id="spriteCutterFramePreview" class="sprite-cutter-frame-preview"></div>
        </aside>
      </div>
    </section>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector("#spriteCutterCloseButton").addEventListener("click", closeSpriteCutter);
  overlay.querySelector("#spriteCutterOpenButton").addEventListener("click", openSpriteCutterImage);
  overlay.querySelector("#spriteCutterFitGridButton").addEventListener("click", fitSpriteCutterGridToImage);
  overlay.querySelector("#spriteCutterSelectAllButton").addEventListener("click", selectAllSpriteCutterCells);
  overlay.querySelector("#spriteCutterClearSelectionButton").addEventListener("click", clearSpriteCutterSelection);
  overlay.querySelector("#spriteCutterResetViewButton").addEventListener("click", resetSpriteCutterView);
  overlay.querySelector("#spriteCutterAddButton").addEventListener("click", addSelectedCellsToAnimation);
  overlay.querySelector("#spriteCutterExportButton").addEventListener("click", exportSpriteCutterFrames);
  overlay.querySelector("#spriteCutterResetButton").addEventListener("click", resetSpriteCutterLibrary);
  overlay.querySelector("#spriteCutterPickBgButton").addEventListener("click", startSpriteCutterColorPick);
  overlay.querySelector("#spriteCutterRemoveBgButton").addEventListener("click", applySpriteCutterBackgroundRemoval);
  overlay.querySelector("#spriteCutterAiRemoveBgButton").addEventListener("click", applySpriteCutterAIBackgroundRemoval);
  overlay.querySelector("#spriteCutterRestoreImageButton").addEventListener("click", restoreSpriteCutterOriginalImage);
  overlay.querySelector("#spriteCutterBgColor").addEventListener("input", () => {
    state.spriteCutter.backgroundRemoval.color = getSpriteCutterControl("spriteCutterBgColor").value;
  });
  overlay.querySelector("#spriteCutterBgMode").addEventListener("change", syncSpriteCutterBackgroundControls);
  overlay.querySelector("#spriteCutterAiModel").addEventListener("change", syncSpriteCutterBackgroundControls);
  overlay.querySelector("#spriteCutterTolerance").addEventListener("input", syncSpriteCutterBackgroundControls);
  overlay.querySelector("#spriteCutterSoftness").addEventListener("input", syncSpriteCutterBackgroundControls);
  overlay.querySelector("#spriteCutterEdgeExpand").addEventListener("input", syncSpriteCutterBackgroundControls);
  overlay.querySelector("#spriteCutterMaskVisible").addEventListener("change", () => {
    if (getSpriteCutterControl("spriteCutterMaskVisible").checked && !state.spriteCutter.maskEditor.data && state.spriteCutter.image) {
      createSpriteCutterMaskFromCurrentImage();
      return;
    }
    syncSpriteCutterMaskControls();
  });
  overlay.querySelector("#spriteCutterMaskGrid").addEventListener("change", syncSpriteCutterMaskControls);
  overlay.querySelector("#spriteCutterMaskBrush").addEventListener("input", syncSpriteCutterMaskControls);
  overlay.querySelector("#spriteCutterMaskOpacity").addEventListener("input", syncSpriteCutterMaskControls);
  overlay.querySelector("#spriteCutterMaskPaintButton").addEventListener("click", () => setSpriteCutterMaskTool("background"));
  overlay.querySelector("#spriteCutterMaskProtectButton").addEventListener("click", () => setSpriteCutterMaskTool("protect"));
  overlay.querySelector("#spriteCutterMaskFromAlphaButton").addEventListener("click", createSpriteCutterMaskFromCurrentImage);
  overlay.querySelector("#spriteCutterMaskApplyButton").addEventListener("click", applySpriteCutterMask);
  overlay.querySelector("#spriteCutterMaskDiscardButton").addEventListener("click", discardSpriteCutterMask);
  overlay.querySelector("#spriteCutterEnhanceScale").addEventListener("change", syncSpriteCutterEnhanceControls);
  overlay.querySelector("#spriteCutterEnhanceMode").addEventListener("change", syncSpriteCutterEnhanceControls);
  overlay.querySelector("#spriteCutterEnhanceAa").addEventListener("input", syncSpriteCutterEnhanceControls);
  overlay.querySelector("#spriteCutterEnhanceSharpen").addEventListener("input", syncSpriteCutterEnhanceControls);
  overlay.querySelector("#spriteCutterEnhanceAlpha").addEventListener("input", syncSpriteCutterEnhanceControls);
  overlay.querySelector("#spriteCutterEnhanceApplyButton").addEventListener("click", openSpriteCutterEnhanceLab);
  overlay.querySelector("#spriteCutterEnhanceFramesButton").addEventListener("click", enhanceSpriteCutterTemporaryFrames);
  overlay.querySelector("#spriteCutterCanvas").addEventListener("contextmenu", (event) => event.preventDefault());
  overlay.querySelector("#spriteCutterCanvas").addEventListener("mousedown", startSpriteCutterPointer);
  overlay.querySelector("#spriteCutterCanvas").addEventListener("mousemove", updateSpriteCutterMaskCursor);
  overlay.querySelector("#spriteCutterCanvas").addEventListener("mouseleave", resetSpriteCutterMaskCursor);
  overlay.querySelector("#spriteCutterCanvas").addEventListener("wheel", zoomSpriteCutterCanvas, { passive: false });
  overlay.querySelector("#spriteCutterCanvas").addEventListener("touchstart", startSpriteCutterTouch, { passive: false });
  overlay.querySelector("#spriteCutterCanvas").addEventListener("touchmove", moveSpriteCutterTouch, { passive: false });
  overlay.querySelector("#spriteCutterCanvas").addEventListener("touchend", endSpriteCutterTouch);
  overlay.querySelector("#spriteCutterCanvas").addEventListener("touchcancel", endSpriteCutterTouch);
  overlay.querySelector("#spriteCutterAnimationName").addEventListener("input", () => {
    state.spriteCutter.activeAnimation = getSpriteCutterAnimationName();
  });

  for (const input of overlay.querySelectorAll(".sprite-cutter-grid input")) {
    input.addEventListener("input", () => {
      readSpriteCutterGridFromInputs();
      drawSpriteCutterCanvas();
    });
  }

  state.spriteCutter.overlay = overlay;
  return overlay;
}

function getSpriteCutterControl(id) {
  return ensureSpriteCutterOverlay().querySelector(`#${id}`);
}

function setSpriteCutterStatus(message) {
  getSpriteCutterControl("spriteCutterStatus").textContent = message;
}

function syncSpriteCutterBackgroundControls() {
  const bg = state.spriteCutter.backgroundRemoval;
  bg.color = getSpriteCutterControl("spriteCutterBgColor").value;
  bg.mode = getSpriteCutterControl("spriteCutterBgMode").value;
  bg.aiModel = getSpriteCutterControl("spriteCutterAiModel").value;
  bg.tolerance = Number(getSpriteCutterControl("spriteCutterTolerance").value) || 0;
  bg.softness = Number(getSpriteCutterControl("spriteCutterSoftness").value) || 0;
  bg.edgeExpand = Number(getSpriteCutterControl("spriteCutterEdgeExpand").value) || 0;
  getSpriteCutterControl("spriteCutterToleranceValue").textContent = String(bg.tolerance);
  getSpriteCutterControl("spriteCutterSoftnessValue").textContent = String(bg.softness);
  getSpriteCutterControl("spriteCutterEdgeExpandValue").textContent = String(bg.edgeExpand);
}

function syncSpriteCutterMaskControls() {
  const mask = state.spriteCutter.maskEditor;
  mask.visible = getSpriteCutterControl("spriteCutterMaskVisible").checked;
  mask.grid = getSpriteCutterControl("spriteCutterMaskGrid").checked;
  mask.brushSize = Math.max(1, Number(getSpriteCutterControl("spriteCutterMaskBrush").value) || 1);
  mask.opacity = Math.max(10, Number(getSpriteCutterControl("spriteCutterMaskOpacity").value) || 48);
  getSpriteCutterControl("spriteCutterMaskBrushValue").textContent = `${mask.brushSize} px`;
  getSpriteCutterControl("spriteCutterMaskOpacityValue").textContent = `${mask.opacity}%`;
  drawSpriteCutterCanvas();
}

function setSpriteCutterMaskTool(tool) {
  const mask = state.spriteCutter.maskEditor;
  mask.tool = tool === "protect" ? "protect" : "background";
  getSpriteCutterControl("spriteCutterMaskPaintButton").classList.toggle("active", mask.tool === "background");
  getSpriteCutterControl("spriteCutterMaskProtectButton").classList.toggle("active", mask.tool === "protect");
  setSpriteCutterStatus(mask.tool === "background"
    ? "Modo máscara: pinta zonas que deben borrarse."
    : "Modo máscara: protege zonas que deben conservarse.");
}

function syncSpriteCutterEnhanceControls() {
  const enhance = state.spriteCutter.imageEnhance;
  enhance.scale = clamp(Number(getSpriteCutterControl("spriteCutterEnhanceScale").value) || 2, 2, 4);
  enhance.mode = getSpriteCutterControl("spriteCutterEnhanceMode").value || "hybrid";
  enhance.antiAlias = Number(getSpriteCutterControl("spriteCutterEnhanceAa").value) || 0;
  enhance.sharpen = Number(getSpriteCutterControl("spriteCutterEnhanceSharpen").value) || 0;
  enhance.alphaClean = Number(getSpriteCutterControl("spriteCutterEnhanceAlpha").value) || 0;
  getSpriteCutterControl("spriteCutterEnhanceAaValue").textContent = `${enhance.antiAlias}%`;
  getSpriteCutterControl("spriteCutterEnhanceSharpenValue").textContent = `${enhance.sharpen}%`;
  getSpriteCutterControl("spriteCutterEnhanceAlphaValue").textContent = String(enhance.alphaClean);
}

function writeSpriteCutterEnhanceControls() {
  const enhance = state.spriteCutter.imageEnhance;
  const sideScale = getSpriteCutterControl("spriteCutterEnhanceScale");
  sideScale.value = String(enhance.scale);
  getSpriteCutterControl("spriteCutterEnhanceMode").value = enhance.mode;
  getSpriteCutterControl("spriteCutterEnhanceAa").value = String(enhance.antiAlias);
  getSpriteCutterControl("spriteCutterEnhanceSharpen").value = String(enhance.sharpen);
  getSpriteCutterControl("spriteCutterEnhanceAlpha").value = String(enhance.alphaClean);
  getSpriteCutterControl("spriteCutterEnhanceAaValue").textContent = `${enhance.antiAlias}%`;
  getSpriteCutterControl("spriteCutterEnhanceSharpenValue").textContent = `${enhance.sharpen}%`;
  getSpriteCutterControl("spriteCutterEnhanceAlphaValue").textContent = String(enhance.alphaClean);
}

function getEnhanceLabControl(id) {
  return ensureSpriteCutterEnhanceLabOverlay().querySelector(`#${id}`);
}

function syncEnhanceLabControlsFromState() {
  const enhance = state.spriteCutter.imageEnhance;
  getEnhanceLabControl("enhanceLabScale").value = String(enhance.scale);
  getEnhanceLabControl("enhanceLabMode").value = enhance.mode;
  getEnhanceLabControl("enhanceLabAa").value = String(enhance.antiAlias);
  getEnhanceLabControl("enhanceLabSharpen").value = String(enhance.sharpen);
  getEnhanceLabControl("enhanceLabAlpha").value = String(enhance.alphaClean);
  getEnhanceLabControl("enhanceLabAaValue").textContent = `${enhance.antiAlias}%`;
  getEnhanceLabControl("enhanceLabSharpenValue").textContent = `${enhance.sharpen}%`;
  getEnhanceLabControl("enhanceLabAlphaValue").textContent = String(enhance.alphaClean);
}

function syncEnhanceLabControlsToState() {
  const enhance = state.spriteCutter.imageEnhance;
  enhance.scale = clamp(Number(getEnhanceLabControl("enhanceLabScale").value) || 2, 2, 4);
  enhance.mode = getEnhanceLabControl("enhanceLabMode").value || "hybrid";
  enhance.antiAlias = Number(getEnhanceLabControl("enhanceLabAa").value) || 0;
  enhance.sharpen = Number(getEnhanceLabControl("enhanceLabSharpen").value) || 0;
  enhance.alphaClean = Number(getEnhanceLabControl("enhanceLabAlpha").value) || 0;
  syncEnhanceLabControlsFromState();
  writeSpriteCutterEnhanceControls();
}

function hexToRgb(hex) {
  const cleanHex = String(hex || "#ffffff").replace("#", "");
  const value = Number.parseInt(cleanHex.length === 3
    ? cleanHex.split("").map((part) => `${part}${part}`).join("")
    : cleanHex, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
}

function getSpriteCutterAnimationName() {
  const rawName = getSpriteCutterControl("spriteCutterAnimationName").value.trim();
  return rawName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, "") || "Animation";
}

function getSpriteCutterPetName() {
  const rawName = getSpriteCutterControl("spriteCutterPetName").value.trim();
  return rawName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, "") || "Mascota";
}

function readSpriteCutterGridFromInputs() {
  const grid = state.spriteCutter.grid;
  grid.columns = Math.max(1, Math.floor(Number(getSpriteCutterControl("spriteCutterColumns").value) || 1));
  grid.rows = Math.max(1, Math.floor(Number(getSpriteCutterControl("spriteCutterRows").value) || 1));
  grid.cellWidth = Math.max(1, Math.floor(Number(getSpriteCutterControl("spriteCutterCellWidth").value) || 1));
  grid.cellHeight = Math.max(1, Math.floor(Number(getSpriteCutterControl("spriteCutterCellHeight").value) || 1));
  grid.offsetX = Math.max(0, Math.floor(Number(getSpriteCutterControl("spriteCutterOffsetX").value) || 0));
  grid.offsetY = Math.max(0, Math.floor(Number(getSpriteCutterControl("spriteCutterOffsetY").value) || 0));
  grid.gapX = Math.max(0, Math.floor(Number(getSpriteCutterControl("spriteCutterGapX").value) || 0));
  grid.gapY = Math.max(0, Math.floor(Number(getSpriteCutterControl("spriteCutterGapY").value) || 0));
}

function writeSpriteCutterGridToInputs() {
  const grid = state.spriteCutter.grid;
  getSpriteCutterControl("spriteCutterColumns").value = grid.columns;
  getSpriteCutterControl("spriteCutterRows").value = grid.rows;
  getSpriteCutterControl("spriteCutterCellWidth").value = grid.cellWidth;
  getSpriteCutterControl("spriteCutterCellHeight").value = grid.cellHeight;
  getSpriteCutterControl("spriteCutterOffsetX").value = grid.offsetX;
  getSpriteCutterControl("spriteCutterOffsetY").value = grid.offsetY;
  getSpriteCutterControl("spriteCutterGapX").value = grid.gapX;
  getSpriteCutterControl("spriteCutterGapY").value = grid.gapY;
}

function getSpriteCutterCellRect(column, row) {
  const grid = state.spriteCutter.grid;
  return {
    x: grid.offsetX + column * (grid.cellWidth + grid.gapX),
    y: grid.offsetY + row * (grid.cellHeight + grid.gapY),
    width: grid.cellWidth,
    height: grid.cellHeight
  };
}

function getSpriteCutterCellKey(column, row) {
  return `${column}:${row}`;
}

function parseSpriteCutterCellKey(key) {
  const [column, row] = String(key).split(":").map((value) => Number(value) || 0);
  return { column, row };
}

function getSpriteCutterCanvasPoint(event) {
  return getSpriteCutterCanvasPointFromClient(event.clientX, event.clientY);
}

function getSpriteCutterCanvasPointFromClient(clientX, clientY) {
  const canvas = getSpriteCutterControl("spriteCutterCanvas");
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height
  };
}

function canvasToSpriteCutterImage(point) {
  const camera = state.spriteCutter.camera;
  return {
    x: (point.x - camera.panX) / camera.zoom,
    y: (point.y - camera.panY) / camera.zoom
  };
}

function zoomSpriteCutterAtPoint(point, nextZoom) {
  const camera = state.spriteCutter.camera;
  const imagePoint = canvasToSpriteCutterImage(point);
  camera.zoom = clamp(nextZoom, 0.05, 12);
  camera.panX = point.x - imagePoint.x * camera.zoom;
  camera.panY = point.y - imagePoint.y * camera.zoom;
}

function normalizeSpriteCutterRect(rect) {
  const image = state.spriteCutter.image;
  if (!rect || !image) return null;
  const left = clamp(Math.min(rect.x, rect.x + rect.width), 0, image.naturalWidth);
  const top = clamp(Math.min(rect.y, rect.y + rect.height), 0, image.naturalHeight);
  const right = clamp(Math.max(rect.x, rect.x + rect.width), 0, image.naturalWidth);
  const bottom = clamp(Math.max(rect.y, rect.y + rect.height), 0, image.naturalHeight);
  const width = Math.max(1, Math.round(right - left));
  const height = Math.max(1, Math.round(bottom - top));
  return {
    x: Math.round(left),
    y: Math.round(top),
    width,
    height
  };
}

function resizeSpriteCutterCanvas() {
  const canvas = getSpriteCutterControl("spriteCutterCanvas");
  const wrap = canvas.parentElement;
  const rect = wrap.getBoundingClientRect();
  const nextWidth = Math.max(260, Math.floor(rect.width));
  const nextHeight = Math.max(220, Math.floor(rect.height));
  if (canvas.width !== nextWidth) canvas.width = nextWidth;
  if (canvas.height !== nextHeight) canvas.height = nextHeight;
}

function resetSpriteCutterView() {
  resizeSpriteCutterCanvas();
  const image = state.spriteCutter.image;
  const canvas = getSpriteCutterControl("spriteCutterCanvas");
  if (!image) {
    state.spriteCutter.camera = { zoom: 1, panX: 0, panY: 0 };
    drawSpriteCutterCanvas();
    return;
  }

  const zoom = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight, 1);
  state.spriteCutter.camera.zoom = zoom || 1;
  state.spriteCutter.camera.panX = (canvas.width - image.naturalWidth * state.spriteCutter.camera.zoom) / 2;
  state.spriteCutter.camera.panY = (canvas.height - image.naturalHeight * state.spriteCutter.camera.zoom) / 2;
  drawSpriteCutterCanvas();
  setSpriteCutterStatus("Vista reiniciada.");
}

function drawSpriteCutterMaskOverlay(ctx2d) {
  const mask = state.spriteCutter.maskEditor;
  const image = state.spriteCutter.image;
  if (!mask.visible || !mask.data || !image) return;
  if (mask.width !== image.naturalWidth || mask.height !== image.naturalHeight) return;

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.width = mask.width;
  overlayCanvas.height = mask.height;
  const overlayCtx = overlayCanvas.getContext("2d");
  const overlayData = overlayCtx.createImageData(mask.width, mask.height);
  const opacity = clamp(mask.opacity / 100, 0.1, 0.85);

  for (let pixelIndex = 0; pixelIndex < mask.data.length; pixelIndex += 1) {
    if (!mask.data[pixelIndex]) continue;
    const dataIndex = pixelIndex * 4;
    overlayData.data[dataIndex] = 255;
    overlayData.data[dataIndex + 1] = 62;
    overlayData.data[dataIndex + 2] = 105;
    overlayData.data[dataIndex + 3] = Math.round(255 * opacity);
  }

  overlayCtx.putImageData(overlayData, 0, 0);
  ctx2d.drawImage(overlayCanvas, 0, 0);
}

function drawSpriteCutterPixelGrid(ctx2d) {
  const mask = state.spriteCutter.maskEditor;
  const image = state.spriteCutter.image;
  const zoom = state.spriteCutter.camera.zoom;
  if (!mask.grid || !image || zoom < 7) return;

  const canvas = getSpriteCutterControl("spriteCutterCanvas");
  const camera = state.spriteCutter.camera;
  const left = clamp(Math.floor((0 - camera.panX) / zoom), 0, image.naturalWidth);
  const top = clamp(Math.floor((0 - camera.panY) / zoom), 0, image.naturalHeight);
  const right = clamp(Math.ceil((canvas.width - camera.panX) / zoom), 0, image.naturalWidth);
  const bottom = clamp(Math.ceil((canvas.height - camera.panY) / zoom), 0, image.naturalHeight);

  ctx2d.save();
  ctx2d.lineWidth = 1 / zoom;
  ctx2d.strokeStyle = zoom >= 12 ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 255, 255, 0.12)";
  for (let x = left; x <= right; x += 1) {
    ctx2d.beginPath();
    ctx2d.moveTo(x, top);
    ctx2d.lineTo(x, bottom);
    ctx2d.stroke();
  }
  for (let y = top; y <= bottom; y += 1) {
    ctx2d.beginPath();
    ctx2d.moveTo(left, y);
    ctx2d.lineTo(right, y);
    ctx2d.stroke();
  }
  ctx2d.restore();
}

function drawSpriteCutterMaskCursor(ctx2d) {
  const mask = state.spriteCutter.maskEditor;
  if (!mask.visible || !mask.data || mask.cursorX < 0 || mask.cursorY < 0) return;
  const size = Math.max(1, Math.floor(mask.brushSize));
  const half = Math.floor(size / 2);
  const x = clamp(mask.cursorX - half, 0, Math.max(0, mask.width - size));
  const y = clamp(mask.cursorY - half, 0, Math.max(0, mask.height - size));
  const zoom = state.spriteCutter.camera.zoom;

  ctx2d.save();
  ctx2d.fillStyle = mask.tool === "protect" ? "rgba(91, 214, 255, 0.22)" : "rgba(255, 62, 105, 0.22)";
  ctx2d.strokeStyle = mask.tool === "protect" ? "#5bd6ff" : "#ff4f78";
  ctx2d.lineWidth = Math.max(1 / zoom, 0.125);
  ctx2d.fillRect(x, y, size, size);
  ctx2d.strokeRect(x + 0.5 / zoom, y + 0.5 / zoom, size - 1 / zoom, size - 1 / zoom);
  ctx2d.restore();
}

function drawSpriteCutterCanvas() {
  resizeSpriteCutterCanvas();
  const canvas = getSpriteCutterControl("spriteCutterCanvas");
  const ctx2d = canvas.getContext("2d");
  const image = state.spriteCutter.image;
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);

  if (!image) {
    ctx2d.fillStyle = "#0a0d12";
    ctx2d.fillRect(0, 0, canvas.width, canvas.height);
    ctx2d.fillStyle = "#a9b0bd";
    ctx2d.fillText("Abre una imagen para verla aqui.", 24, 34);
    return;
  }

  ctx2d.imageSmoothingEnabled = false;
  ctx2d.save();
  ctx2d.translate(state.spriteCutter.camera.panX, state.spriteCutter.camera.panY);
  ctx2d.scale(state.spriteCutter.camera.zoom, state.spriteCutter.camera.zoom);
  ctx2d.drawImage(image, 0, 0);
  drawSpriteCutterMaskOverlay(ctx2d);
  drawSpriteCutterPixelGrid(ctx2d);
  readSpriteCutterGridFromInputs();

  const grid = state.spriteCutter.grid;
  ctx2d.lineWidth = 1 / state.spriteCutter.camera.zoom;
  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const rect = getSpriteCutterCellRect(column, row);
      const key = getSpriteCutterCellKey(column, row);
      const selected = state.spriteCutter.selectedCells.has(key);
      ctx2d.fillStyle = selected ? "rgba(83, 199, 163, 0.24)" : "rgba(240, 192, 90, 0.06)";
      ctx2d.strokeStyle = selected ? "#53c7a3" : "rgba(240, 192, 90, 0.8)";
      ctx2d.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx2d.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
    }
  }

  const cropRect = normalizeSpriteCutterRect(state.spriteCutter.cropRect);
  if (cropRect) {
    ctx2d.fillStyle = "rgba(83, 199, 163, 0.22)";
    ctx2d.strokeStyle = "#53c7a3";
    ctx2d.lineWidth = 2 / state.spriteCutter.camera.zoom;
    ctx2d.fillRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
    ctx2d.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
  }

  drawSpriteCutterMaskCursor(ctx2d);
  ctx2d.restore();
}

function loadSpriteCutterImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function getSpriteCutterImageData(image = state.spriteCutter.image) {
  if (!image) return null;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const processCtx = canvas.getContext("2d");
  processCtx.imageSmoothingEnabled = false;
  processCtx.drawImage(image, 0, 0);
  return {
    canvas,
    imageData: processCtx.getImageData(0, 0, canvas.width, canvas.height)
  };
}

function getSpriteCutterDataUrlFromImage(image = state.spriteCutter.image) {
  const data = getSpriteCutterImageData(image);
  return data ? data.canvas.toDataURL("image/png") : "";
}

async function createSpriteCutterPreviewDataUrl(dataUrl, maxSize = 360) {
  const image = await loadSpriteCutterImage(dataUrl);
  const largest = Math.max(image.naturalWidth, image.naturalHeight);
  if (largest <= maxSize) {
    return {
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      ratio: 1
    };
  }

  const ratio = maxSize / largest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const ctx2d = canvas.getContext("2d");
  ctx2d.imageSmoothingEnabled = true;
  ctx2d.imageSmoothingQuality = "high";
  ctx2d.drawImage(image, 0, 0, canvas.width, canvas.height);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
    ratio
  };
}

function resetEnhanceLabView(image) {
  const lab = state.spriteCutter.imageEnhanceLab;
  const canvas = getEnhanceLabControl("enhanceLabOriginalCanvas");
  if (!image) {
    lab.view.zoom = 1;
    lab.view.panX = 0;
    lab.view.panY = 0;
    return;
  }

  const fit = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight, 1);
  lab.view.zoom = fit || 1;
  lab.view.panX = (canvas.width - image.naturalWidth * lab.view.zoom) / 2;
  lab.view.panY = (canvas.height - image.naturalHeight * lab.view.zoom) / 2;
}

function drawEnhanceLabImage(canvas, image, imageScale = 1) {
  const ctx2d = canvas.getContext("2d");
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  if (!image) return;

  const view = state.spriteCutter.imageEnhanceLab.view;
  const logicalWidth = image.naturalWidth / Math.max(1, imageScale);
  const logicalHeight = image.naturalHeight / Math.max(1, imageScale);
  ctx2d.imageSmoothingEnabled = false;
  ctx2d.drawImage(
    image,
    Math.round(view.panX),
    Math.round(view.panY),
    Math.max(1, Math.round(logicalWidth * view.zoom)),
    Math.max(1, Math.round(logicalHeight * view.zoom))
  );
}

function drawEnhanceLabCanvases() {
  const lab = state.spriteCutter.imageEnhanceLab;
  drawEnhanceLabImage(getEnhanceLabControl("enhanceLabOriginalCanvas"), lab.originalImage);
  drawEnhanceLabImage(getEnhanceLabControl("enhanceLabPreviewCanvas"), lab.previewImage, lab.lastPreview?.scale || 1);
}

function getEnhanceLabCanvasPoint(event) {
  return getEnhanceLabCanvasPointFromClient(event.currentTarget, event.clientX, event.clientY);
}

function getEnhanceLabCanvasPointFromClient(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height
  };
}

function zoomEnhanceLabAtPoint(point, nextZoom) {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.originalImage) return;
  const view = lab.view;
  const oldZoom = view.zoom || 1;
  const imageX = (point.x - view.panX) / oldZoom;
  const imageY = (point.y - view.panY) / oldZoom;
  view.zoom = clamp(nextZoom, 0.05, 32);
  view.panX = point.x - imageX * view.zoom;
  view.panY = point.y - imageY * view.zoom;
}

function zoomEnhanceLabView(event) {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.originalImage) return;
  event.preventDefault();
  const point = getEnhanceLabCanvasPoint(event);
  const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
  zoomEnhanceLabAtPoint(point, lab.view.zoom * factor);
  drawEnhanceLabCanvases();
}

function startEnhanceLabPan(event) {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.originalImage || event.button !== 0) return;
  event.preventDefault();
  const point = getEnhanceLabCanvasPoint(event);
  const rect = event.currentTarget.getBoundingClientRect();
  lab.view.dragging = true;
  lab.view.startX = event.clientX;
  lab.view.startY = event.clientY;
  lab.view.startPanX = lab.view.panX;
  lab.view.startPanY = lab.view.panY;
  lab.view.dragScaleX = event.currentTarget.width / rect.width;
  lab.view.dragScaleY = event.currentTarget.height / rect.height;
  event.currentTarget.classList.add("panning");
  window.addEventListener("mousemove", moveEnhanceLabPan);
  window.addEventListener("mouseup", endEnhanceLabPan, { once: true });
}

function moveEnhanceLabPan(event) {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.view.dragging) return;
  lab.view.panX = lab.view.startPanX + (event.clientX - lab.view.startX) * lab.view.dragScaleX;
  lab.view.panY = lab.view.startPanY + (event.clientY - lab.view.startY) * lab.view.dragScaleY;
  drawEnhanceLabCanvases();
}

function endEnhanceLabPan() {
  const lab = state.spriteCutter.imageEnhanceLab;
  lab.view.dragging = false;
  const overlay = ensureSpriteCutterEnhanceLabOverlay();
  overlay.querySelector("#enhanceLabOriginalCanvas").classList.remove("panning");
  overlay.querySelector("#enhanceLabPreviewCanvas").classList.remove("panning");
  window.removeEventListener("mousemove", moveEnhanceLabPan);
}

function startEnhanceLabTouch(event) {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.originalImage || event.touches.length === 0) return;
  event.preventDefault();
  const view = lab.view;

  if (event.touches.length >= 2) {
    const center = getTouchCenter(event.touches);
    const point = getEnhanceLabCanvasPointFromClient(event.currentTarget, center.clientX, center.clientY);
    view.touchMode = "pinch";
    view.touchStartDistance = Math.max(1, getTouchDistance(event.touches));
    view.touchStartZoom = view.zoom;
    view.touchLastX = point.x;
    view.touchLastY = point.y;
  } else {
    const touch = event.touches[0];
    view.touchMode = "pan";
    view.touchLastX = touch.clientX;
    view.touchLastY = touch.clientY;
  }

  event.currentTarget.classList.add("panning");
}

function moveEnhanceLabTouch(event) {
  const lab = state.spriteCutter.imageEnhanceLab;
  const view = lab.view;
  if (!lab.originalImage || !view.touchMode) return;
  event.preventDefault();

  if (view.touchMode === "pinch" && event.touches.length >= 2) {
    const center = getTouchCenter(event.touches);
    const point = getEnhanceLabCanvasPointFromClient(event.currentTarget, center.clientX, center.clientY);
    const distance = Math.max(1, getTouchDistance(event.touches));
    zoomEnhanceLabAtPoint(point, view.touchStartZoom * (distance / view.touchStartDistance));
    view.panX += point.x - view.touchLastX;
    view.panY += point.y - view.touchLastY;
    view.touchLastX = point.x;
    view.touchLastY = point.y;
    drawEnhanceLabCanvases();
    return;
  }

  if (view.touchMode === "pan" && event.touches.length === 1) {
    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();
    view.panX += (touch.clientX - view.touchLastX) * (event.currentTarget.width / rect.width);
    view.panY += (touch.clientY - view.touchLastY) * (event.currentTarget.height / rect.height);
    view.touchLastX = touch.clientX;
    view.touchLastY = touch.clientY;
    drawEnhanceLabCanvases();
  }
}

function endEnhanceLabTouch(event) {
  const lab = state.spriteCutter.imageEnhanceLab;
  const view = lab.view;
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    view.touchMode = "pan";
    view.touchLastX = touch.clientX;
    view.touchLastY = touch.clientY;
    return;
  }

  view.touchMode = null;
  const overlay = ensureSpriteCutterEnhanceLabOverlay();
  overlay.querySelector("#enhanceLabOriginalCanvas").classList.remove("panning");
  overlay.querySelector("#enhanceLabPreviewCanvas").classList.remove("panning");
}

async function renderSpriteCutterEnhanceOriginal() {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.previewSourceDataUrl) return;
  const image = await loadSpriteCutterImage(lab.previewSourceDataUrl);
  lab.originalImage = image;
  resetEnhanceLabView(image);
  drawEnhanceLabCanvases();
}

function scheduleSpriteCutterEnhancePreview() {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.previewSourceDataUrl) return;
  if (lab.previewTimer) clearTimeout(lab.previewTimer);
  lab.previewTimer = setTimeout(renderSpriteCutterEnhancePreview, 160);
  setEnhanceLabStatus("Preparando preview...");
}

async function renderSpriteCutterEnhancePreview() {
  const lab = state.spriteCutter.imageEnhanceLab;
  if (!lab.previewSourceDataUrl) return;
  const requestId = lab.previewRequest + 1;
  lab.previewRequest = requestId;
  lab.previewTimer = null;
  setEnhanceLabStatus("Procesando preview temporal...");

  try {
    const preview = await enhanceSpriteCutterDataUrl(lab.previewSourceDataUrl, state.spriteCutter.imageEnhance);
    if (requestId !== lab.previewRequest) return;
    lab.lastPreview = preview;
    const previewImage = await loadSpriteCutterImage(preview.dataUrl);
    if (requestId !== lab.previewRequest) return;
    lab.previewImage = previewImage;
    drawEnhanceLabCanvases();
    const finalWidth = Math.round((state.spriteCutter.image?.naturalWidth || 0) * state.spriteCutter.imageEnhance.scale);
    const finalHeight = Math.round((state.spriteCutter.image?.naturalHeight || 0) * state.spriteCutter.imageEnhance.scale);
    getEnhanceLabControl("enhanceLabPreviewMeta").textContent = `${finalWidth} x ${finalHeight} final`;
    setEnhanceLabStatus("Preview listo. Si te gusta, aplica la mejora.");
  } catch (error) {
    setEnhanceLabStatus(`No se pudo generar preview: ${error.message}`);
  }
}

async function openSpriteCutterEnhanceLab() {
  const image = state.spriteCutter.image;
  if (!image) {
    window.alert("Abre una imagen antes de mejorarla.");
    return;
  }

  syncSpriteCutterEnhanceControls();
  const overlay = ensureSpriteCutterEnhanceLabOverlay();
  syncEnhanceLabControlsFromState();
  overlay.classList.add("open");
  setEnhanceLabStatus("Copiando imagen temporal...");

  const currentDataUrl = getSpriteCutterDataUrlFromImage(image);
  const previewSource = await createSpriteCutterPreviewDataUrl(currentDataUrl);
  state.spriteCutter.imageEnhanceLab.sourceDataUrl = currentDataUrl;
  state.spriteCutter.imageEnhanceLab.previewSourceDataUrl = previewSource.dataUrl;
  getEnhanceLabControl("enhanceLabOriginalMeta").textContent = `${image.naturalWidth} x ${image.naturalHeight}`;
  getEnhanceLabControl("enhanceLabPreviewMeta").textContent = "Calculando";
  await renderSpriteCutterEnhanceOriginal();
  scheduleSpriteCutterEnhancePreview();
}

function resetSpriteCutterEnhanceLabValues() {
  state.spriteCutter.imageEnhance = {
    scale: 2,
    mode: "hybrid",
    antiAlias: 45,
    sharpen: 32,
    alphaClean: 10
  };
  syncEnhanceLabControlsFromState();
  writeSpriteCutterEnhanceControls();
  scheduleSpriteCutterEnhancePreview();
}

async function applySpriteCutterEnhanceLab() {
  syncEnhanceLabControlsToState();
  const options = { ...state.spriteCutter.imageEnhance };
  const image = state.spriteCutter.image;
  if (!image) return;
  const finalWidth = Math.round(image.naturalWidth * options.scale);
  const finalHeight = Math.round(image.naturalHeight * options.scale);

  setExportProgress({
    status: "running",
    title: "Aplicando mejora",
    message: `Procesando imagen completa a ${finalWidth} x ${finalHeight}`,
    current: 0,
    total: 100,
    percent: 8
  });

  await new Promise((resolve) => requestAnimationFrame(resolve));
  await enhanceCurrentSpriteCutterImage(options);
  setExportProgress({
    status: "done",
    title: "Mejora aplicada",
    message: `Imagen lista: ${finalWidth} x ${finalHeight}`,
    current: 100,
    total: 100,
    percent: 100
  });
  closeSpriteCutterEnhanceLab();
}

function clampByte(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function drawScaledSpriteCutterCanvas(image, scale, smoothing) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx2d = canvas.getContext("2d");
  ctx2d.imageSmoothingEnabled = smoothing;
  ctx2d.imageSmoothingQuality = "high";
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  ctx2d.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function blendSpriteCutterCanvases(baseCanvas, smoothCanvas, strength) {
  const blend = clamp(strength, 0, 1);
  if (blend <= 0) return baseCanvas;
  if (blend >= 1) return smoothCanvas;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = baseCanvas.width;
  outputCanvas.height = baseCanvas.height;
  const outputCtx = outputCanvas.getContext("2d");
  const baseCtx = baseCanvas.getContext("2d");
  const smoothCtx = smoothCanvas.getContext("2d");
  const baseData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
  const smoothData = smoothCtx.getImageData(0, 0, smoothCanvas.width, smoothCanvas.height);
  const data = baseData.data;
  const smooth = smoothData.data;

  for (let index = 0; index < data.length; index += 4) {
    data[index] = clampByte(data[index] * (1 - blend) + smooth[index] * blend);
    data[index + 1] = clampByte(data[index + 1] * (1 - blend) + smooth[index + 1] * blend);
    data[index + 2] = clampByte(data[index + 2] * (1 - blend) + smooth[index + 2] * blend);
    data[index + 3] = clampByte(data[index + 3] * (1 - blend) + smooth[index + 3] * blend);
  }

  outputCtx.putImageData(baseData, 0, 0);
  return outputCanvas;
}

function sharpenSpriteCutterImageData(imageData, amount) {
  const strength = clamp(amount / 100, 0, 1) * 1.25;
  if (strength <= 0) return imageData;
  const { width, height, data } = imageData;
  const original = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      if (original[index + 3] === 0) continue;
      const left = index - 4;
      const right = index + 4;
      const up = index - width * 4;
      const down = index + width * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const center = original[index + channel];
        const average = (
          original[left + channel] +
          original[right + channel] +
          original[up + channel] +
          original[down + channel]
        ) / 4;
        data[index + channel] = clampByte(center + (center - average) * strength);
      }
    }
  }

  return imageData;
}

function cleanSpriteCutterAlpha(imageData, threshold) {
  const clean = Math.max(0, Number(threshold) || 0);
  if (clean <= 0) return imageData;
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha <= clean) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    } else if (alpha >= 255 - clean) {
      data[index + 3] = 255;
    }
  }

  return imageData;
}

async function enhanceSpriteCutterDataUrl(dataUrl, options = {}) {
  const image = await loadSpriteCutterImage(dataUrl);
  const scale = clamp(Number(options.scale) || 2, 2, 4);
  const mode = options.mode || "hybrid";
  const antiAlias = clamp((Number(options.antiAlias) || 0) / 100, 0, 1);
  const crispCanvas = drawScaledSpriteCutterCanvas(image, scale, false);
  const smoothCanvas = drawScaledSpriteCutterCanvas(image, scale, true);
  const blend = mode === "smooth" ? 1 : mode === "crisp" ? antiAlias * 0.35 : antiAlias;
  const outputCanvas = blendSpriteCutterCanvases(crispCanvas, smoothCanvas, blend);
  const outputCtx = outputCanvas.getContext("2d");
  let imageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  imageData = cleanSpriteCutterAlpha(imageData, options.alphaClean);
  imageData = sharpenSpriteCutterImageData(imageData, options.sharpen);
  imageData = cleanSpriteCutterAlpha(imageData, options.alphaClean);
  outputCtx.putImageData(imageData, 0, 0);
  return {
    dataUrl: outputCanvas.toDataURL("image/png"),
    width: outputCanvas.width,
    height: outputCanvas.height,
    scale
  };
}

function setSpriteCutterRecoverySource(dataUrl, width, height) {
  const mask = state.spriteCutter.maskEditor;
  mask.recoveryDataUrl = dataUrl || "";
  mask.recoveryWidth = Number(width) || 0;
  mask.recoveryHeight = Number(height) || 0;
}

function getSpriteCutterRecoverySourceForImage(image = state.spriteCutter.image) {
  const mask = state.spriteCutter.maskEditor;
  if (
    image &&
    mask.recoveryDataUrl &&
    mask.recoveryWidth === image.naturalWidth &&
    mask.recoveryHeight === image.naturalHeight
  ) {
    return mask.recoveryDataUrl;
  }
  return getSpriteCutterDataUrlFromImage(image);
}

function setSpriteCutterMaskFromAlpha(image, options = {}) {
  const imageDataResult = getSpriteCutterImageData(image);
  if (!imageDataResult) return;
  const { imageData } = imageDataResult;
  const mask = state.spriteCutter.maskEditor;
  const target = options.target || "sheet";
  const totalPixels = imageData.width * imageData.height;
  const maskData = new Uint8Array(totalPixels);
  let affected = 0;

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
    const alpha = imageData.data[pixelIndex * 4 + 3];
    if (alpha < 128) {
      maskData[pixelIndex] = 1;
      affected += 1;
    }
  }

  mask.data = maskData;
  mask.width = imageData.width;
  mask.height = imageData.height;
  mask.sourceDataUrl = options.sourceDataUrl || getSpriteCutterRecoverySourceForImage(image);
  if (target === "sheet") {
    setSpriteCutterRecoverySource(mask.sourceDataUrl, imageData.width, imageData.height);
  }
  mask.target = target;
  mask.frameAnimation = options.frameAnimation || "";
  mask.frameIndex = Number.isInteger(options.frameIndex) ? options.frameIndex : -1;
  mask.returnDataUrl = options.returnDataUrl || "";
  mask.returnCamera = options.returnCamera || null;
  mask.visible = options.visible !== false;
  getSpriteCutterControl("spriteCutterMaskVisible").checked = mask.visible;
  syncSpriteCutterMaskControls();
  setSpriteCutterStatus(`Máscara lista: ${affected} pixeles marcados como fondo.`);
}

function clearSpriteCutterMask(options = {}) {
  const mask = state.spriteCutter.maskEditor;
  mask.visible = false;
  mask.data = null;
  mask.width = 0;
  mask.height = 0;
  mask.sourceDataUrl = "";
  mask.target = "sheet";
  mask.frameAnimation = "";
  mask.frameIndex = -1;
  mask.returnDataUrl = "";
  mask.returnCamera = null;
  mask.cursorX = -1;
  mask.cursorY = -1;
  getSpriteCutterControl("spriteCutterMaskVisible").checked = false;
  if (!options.silent) setSpriteCutterStatus("Máscara descartada.");
  drawSpriteCutterCanvas();
}

function createSpriteCutterMaskFromCurrentImage() {
  const image = state.spriteCutter.image;
  if (!image) return;
  setSpriteCutterMaskFromAlpha(image, {
    target: "sheet"
  });
}

function paintSpriteCutterMaskAt(imagePoint) {
  const mask = state.spriteCutter.maskEditor;
  if (!mask.data || !state.spriteCutter.image) return;
  const centerX = clamp(Math.floor(imagePoint.x), 0, mask.width - 1);
  const centerY = clamp(Math.floor(imagePoint.y), 0, mask.height - 1);
  const brushSize = Math.max(1, Math.floor(mask.brushSize));
  const half = Math.floor(brushSize / 2);
  const startX = clamp(centerX - half, 0, mask.width - 1);
  const startY = clamp(centerY - half, 0, mask.height - 1);
  const endX = clamp(startX + brushSize - 1, 0, mask.width - 1);
  const endY = clamp(startY + brushSize - 1, 0, mask.height - 1);
  const value = mask.tool === "protect" ? 0 : 1;

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      mask.data[y * mask.width + x] = value;
    }
  }

  mask.cursorX = centerX;
  mask.cursorY = centerY;
}

function updateSpriteCutterMaskCursor(event) {
  const mask = state.spriteCutter.maskEditor;
  if (!mask.visible || !mask.data || !state.spriteCutter.image) return;
  const point = getSpriteCutterCanvasPoint(event);
  const imagePoint = canvasToSpriteCutterImage(point);
  mask.cursorX = clamp(Math.floor(imagePoint.x), 0, mask.width - 1);
  mask.cursorY = clamp(Math.floor(imagePoint.y), 0, mask.height - 1);
  drawSpriteCutterCanvas();
}

function resetSpriteCutterMaskCursor() {
  const mask = state.spriteCutter.maskEditor;
  mask.cursorX = -1;
  mask.cursorY = -1;
  drawSpriteCutterCanvas();
}

async function applySpriteCutterMask() {
  const mask = state.spriteCutter.maskEditor;
  if (!mask.data || !mask.sourceDataUrl) {
    window.alert("No hay máscara para aplicar.");
    return;
  }

  const sourceImage = await loadSpriteCutterImage(mask.sourceDataUrl);
  const imageDataResult = getSpriteCutterImageData(sourceImage);
  if (!imageDataResult) return;

  const { canvas, imageData } = imageDataResult;
  const data = imageData.data;
  const totalPixels = Math.min(mask.data.length, imageData.width * imageData.height);
  let transparentPixels = 0;

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
    if (mask.data[pixelIndex]) {
      data[pixelIndex * 4 + 3] = 0;
      transparentPixels += 1;
    }
  }

  canvas.getContext("2d").putImageData(imageData, 0, 0);
  const nextDataUrl = canvas.toDataURL("image/png");

  if (mask.target === "frame") {
    const animation = state.spriteCutter.animations[mask.frameAnimation];
    const frame = animation?.frames?.[mask.frameIndex];
    if (frame) {
      frame.dataUrl = nextDataUrl;
      frame.recoveryDataUrl = mask.sourceDataUrl;
      frame.edited = true;
    }
    const returnDataUrl = mask.returnDataUrl;
    const returnCamera = mask.returnCamera;
    clearSpriteCutterMask({ silent: true });
    if (returnDataUrl) {
      await replaceSpriteCutterImageFromDataUrl(returnDataUrl);
      if (returnCamera) state.spriteCutter.camera = { ...returnCamera };
      drawSpriteCutterCanvas();
    }
    renderSpriteCutterLibrary();
    setSpriteCutterStatus(`Frame corregido. Pixeles transparentes: ${transparentPixels}.`);
    return;
  }

  const recoveryDataUrl = mask.sourceDataUrl;
  const recoveryWidth = mask.width;
  const recoveryHeight = mask.height;
  clearSpriteCutterMask({ silent: true });
  await replaceSpriteCutterImageFromDataUrl(nextDataUrl);
  setSpriteCutterRecoverySource(recoveryDataUrl, recoveryWidth, recoveryHeight);
  setSpriteCutterStatus(`Máscara aplicada. Pixeles transparentes: ${transparentPixels}.`);
}

async function discardSpriteCutterMask() {
  const mask = state.spriteCutter.maskEditor;
  const returnDataUrl = mask.returnDataUrl;
  const returnCamera = mask.returnCamera;
  const target = mask.target;
  clearSpriteCutterMask();

  if (target === "frame" && returnDataUrl) {
    await replaceSpriteCutterImageFromDataUrl(returnDataUrl);
    if (returnCamera) state.spriteCutter.camera = { ...returnCamera };
    drawSpriteCutterCanvas();
    setSpriteCutterStatus("Edición de frame descartada. Volviste al spritesheet.");
  }
}

function scaleSpriteCutterGrid(scale) {
  const grid = state.spriteCutter.grid;
  grid.cellWidth = Math.max(1, Math.round(grid.cellWidth * scale));
  grid.cellHeight = Math.max(1, Math.round(grid.cellHeight * scale));
  grid.offsetX = Math.max(0, Math.round(grid.offsetX * scale));
  grid.offsetY = Math.max(0, Math.round(grid.offsetY * scale));
  grid.gapX = Math.max(0, Math.round(grid.gapX * scale));
  grid.gapY = Math.max(0, Math.round(grid.gapY * scale));
  writeSpriteCutterGridToInputs();
}

function getSpriteCutterEnhanceOptions() {
  syncSpriteCutterEnhanceControls();
  return { ...state.spriteCutter.imageEnhance };
}

async function enhanceCurrentSpriteCutterImage(optionsOverride = null) {
  const image = state.spriteCutter.image;
  if (!image) return;
  const options = optionsOverride || getSpriteCutterEnhanceOptions();
  const mask = state.spriteCutter.maskEditor;
  const isFrameEdit = mask.target === "frame" && mask.frameAnimation && mask.frameIndex >= 0;
  const frameTarget = {
    animation: mask.frameAnimation,
    index: mask.frameIndex,
    returnDataUrl: mask.returnDataUrl,
    returnCamera: mask.returnCamera
  };
  const currentDataUrl = getSpriteCutterDataUrlFromImage(image);
  const recoverySource = getSpriteCutterRecoverySourceForImage(image);
  const enhanced = await enhanceSpriteCutterDataUrl(currentDataUrl, options);
  const enhancedRecovery = recoverySource && recoverySource !== currentDataUrl
    ? await enhanceSpriteCutterDataUrl(recoverySource, options)
    : enhanced;

  clearSpriteCutterMask({ silent: true });
  await replaceSpriteCutterImageFromDataUrl(enhanced.dataUrl);
  setSpriteCutterRecoverySource(enhancedRecovery.dataUrl, enhancedRecovery.width, enhancedRecovery.height);

  if (isFrameEdit) {
    const animation = state.spriteCutter.animations[frameTarget.animation];
    const frame = animation?.frames?.[frameTarget.index];
    if (frame) {
      frame.dataUrl = enhanced.dataUrl;
      frame.recoveryDataUrl = enhancedRecovery.dataUrl;
      frame.edited = true;
    }
    resetSpriteCutterView();
    setSpriteCutterMaskFromAlpha(state.spriteCutter.image, {
      sourceDataUrl: enhancedRecovery.dataUrl,
      target: "frame",
      frameAnimation: frameTarget.animation,
      frameIndex: frameTarget.index,
      returnDataUrl: frameTarget.returnDataUrl,
      returnCamera: frameTarget.returnCamera,
      visible: true
    });
    renderSpriteCutterLibrary();
  } else {
    scaleSpriteCutterGrid(enhanced.scale);
    resetSpriteCutterView();
  }

  setSpriteCutterStatus(`Imagen mejorada a ${enhanced.width} x ${enhanced.height} (${options.scale}x).`);
}

async function enhanceSpriteCutterTemporaryFrames() {
  const animations = Object.values(state.spriteCutter.animations).filter((animation) => animation.frames.length > 0);
  const totalFrames = animations.reduce((total, animation) => total + animation.frames.length, 0);
  if (totalFrames === 0) {
    window.alert("No hay frames temporales para mejorar.");
    return;
  }

  const options = getSpriteCutterEnhanceOptions();
  setExportProgress({
    status: "running",
    title: "Mejorando frames",
    message: "Preparando frames temporales",
    current: 0,
    total: totalFrames,
    percent: 0
  });

  let current = 0;
  for (const animation of animations) {
    for (const frame of animation.frames) {
      const enhanced = await enhanceSpriteCutterDataUrl(frame.dataUrl, options);
      const source = frame.recoveryDataUrl || frame.dataUrl;
      const enhancedRecovery = source === frame.dataUrl
        ? enhanced
        : await enhanceSpriteCutterDataUrl(source, options);
      frame.dataUrl = enhanced.dataUrl;
      frame.recoveryDataUrl = enhancedRecovery.dataUrl;
      frame.edited = true;
      current += 1;
      setExportProgress({
        status: "running",
        title: "Mejorando frames",
        message: `${animation.name}: ${current}/${totalFrames}`,
        current,
        total: totalFrames,
        percent: Math.round((current / totalFrames) * 100)
      });
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  renderSpriteCutterLibrary();
  setExportProgress({
    status: "done",
    title: "Frames mejorados",
    message: `${totalFrames} frames procesados`,
    current: totalFrames,
    total: totalFrames,
    percent: 100
  });
  setSpriteCutterStatus(`${totalFrames} frames temporales mejorados.`);
}

function getSpriteCutterImagePixel(imagePoint) {
  const image = state.spriteCutter.image;
  if (!image) return null;
  const x = clamp(Math.floor(imagePoint.x), 0, image.naturalWidth - 1);
  const y = clamp(Math.floor(imagePoint.y), 0, image.naturalHeight - 1);
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = 1;
  sampleCanvas.height = 1;
  const sampleCtx = sampleCanvas.getContext("2d");
  sampleCtx.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
  const [r, g, b, a] = sampleCtx.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a };
}

function startSpriteCutterColorPick() {
  state.spriteCutter.backgroundRemoval.picking = true;
  getSpriteCutterControl("spriteCutterPickBgButton").classList.add("active");
  setSpriteCutterStatus("Gotero activo: haz click izquierdo sobre el fondo.");
}

function pickSpriteCutterBackgroundColor(imagePoint) {
  const color = getSpriteCutterImagePixel(imagePoint);
  if (!color) return;
  const hex = rgbToHex(color.r, color.g, color.b);
  state.spriteCutter.backgroundRemoval.color = hex;
  state.spriteCutter.backgroundRemoval.picking = false;
  getSpriteCutterControl("spriteCutterBgColor").value = hex;
  getSpriteCutterControl("spriteCutterPickBgButton").classList.remove("active");
  setSpriteCutterStatus(`Color de fondo seleccionado: ${hex}`);
}

async function replaceSpriteCutterImageFromDataUrl(dataUrl) {
  const image = await loadSpriteCutterImage(dataUrl);
  state.spriteCutter.image = image;
  state.spriteCutter.selectedCells.clear();
  state.spriteCutter.cropRect = null;
  drawSpriteCutterCanvas();
}

async function restoreSpriteCutterOriginalImage() {
  if (!state.spriteCutter.originalImageUrl) return;
  const image = await loadSpriteCutterImage(state.spriteCutter.originalImageUrl);
  state.spriteCutter.image = image;
  state.spriteCutter.selectedCells.clear();
  state.spriteCutter.cropRect = null;
  clearSpriteCutterMask({ silent: true });
  setSpriteCutterRecoverySource(getSpriteCutterDataUrlFromImage(image), image.naturalWidth, image.naturalHeight);
  resetSpriteCutterView();
  setSpriteCutterStatus("Imagen original restaurada.");
}

function getSpriteCutterColorDistance(data, index, target) {
  const dr = data[index] - target.r;
  const dg = data[index + 1] - target.g;
  const db = data[index + 2] - target.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function applySpriteCutterAlphaCut(data, pixelIndex, distance, tolerance, softness) {
  const alphaIndex = pixelIndex * 4 + 3;
  if (distance <= tolerance) {
    data[alphaIndex] = 0;
    return data[alphaIndex] === 0;
  }

  if (softness <= 0) return false;
  const fadeLimit = tolerance + softness;
  if (distance > fadeLimit) return false;
  const ratio = clamp((distance - tolerance) / softness, 0, 1);
  data[alphaIndex] = Math.round(data[alphaIndex] * ratio);
  return data[alphaIndex] === 0;
}

function removeSpriteCutterBackgroundByColor(data, width, height, target, tolerance, softness) {
  let transparentPixels = 0;
  const totalPixels = width * height;

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4;
    const previousAlpha = data[dataIndex + 3];
    const distance = getSpriteCutterColorDistance(data, dataIndex, target);
    applySpriteCutterAlphaCut(data, pixelIndex, distance, tolerance, softness);
    if (previousAlpha > 0 && data[dataIndex + 3] === 0) transparentPixels += 1;
  }

  return {
    label: "Color completo",
    transparentPixels
  };
}

function getSpriteCutterNeighborIndexes(pixelIndex, width, height) {
  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);
  const neighbors = [];
  if (x > 0) neighbors.push(pixelIndex - 1);
  if (x < width - 1) neighbors.push(pixelIndex + 1);
  if (y > 0) neighbors.push(pixelIndex - width);
  if (y < height - 1) neighbors.push(pixelIndex + width);
  return neighbors;
}

function addSpriteCutterEdgeSeed(queue, queued, pixelIndex, data, target, tolerance, softness) {
  if (queued[pixelIndex]) return;
  const distance = getSpriteCutterColorDistance(data, pixelIndex * 4, target);
  if (distance > tolerance + softness) return;
  queued[pixelIndex] = 1;
  queue.push(pixelIndex);
}

function expandSpriteCutterBackgroundMask(mask, data, width, height, target, tolerance, softness, passes) {
  if (passes <= 0) return mask;
  const totalPixels = width * height;
  let currentMask = mask;

  for (let pass = 0; pass < passes; pass += 1) {
    const nextMask = new Uint8Array(currentMask);
    for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
      if (currentMask[pixelIndex]) continue;
      const dataIndex = pixelIndex * 4;
      const distance = getSpriteCutterColorDistance(data, dataIndex, target);
      if (distance > tolerance + softness) continue;

      const neighbors = getSpriteCutterNeighborIndexes(pixelIndex, width, height);
      if (neighbors.some((neighborIndex) => currentMask[neighborIndex])) {
        nextMask[pixelIndex] = 1;
      }
    }
    currentMask = nextMask;
  }

  return currentMask;
}

function removeSpriteCutterBackgroundFromEdges(data, width, height, target, tolerance, softness, edgeExpand) {
  const totalPixels = width * height;
  const mask = new Uint8Array(totalPixels);
  const queued = new Uint8Array(totalPixels);
  const queue = [];

  for (let x = 0; x < width; x += 1) {
    addSpriteCutterEdgeSeed(queue, queued, x, data, target, tolerance, softness);
    addSpriteCutterEdgeSeed(queue, queued, (height - 1) * width + x, data, target, tolerance, softness);
  }

  for (let y = 1; y < height - 1; y += 1) {
    addSpriteCutterEdgeSeed(queue, queued, y * width, data, target, tolerance, softness);
    addSpriteCutterEdgeSeed(queue, queued, y * width + width - 1, data, target, tolerance, softness);
  }

  for (let readIndex = 0; readIndex < queue.length; readIndex += 1) {
    const pixelIndex = queue[readIndex];
    mask[pixelIndex] = 1;

    for (const neighborIndex of getSpriteCutterNeighborIndexes(pixelIndex, width, height)) {
      addSpriteCutterEdgeSeed(queue, queued, neighborIndex, data, target, tolerance, softness);
    }
  }

  const expandedMask = expandSpriteCutterBackgroundMask(mask, data, width, height, target, tolerance, softness, edgeExpand);
  let transparentPixels = 0;

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
    if (!expandedMask[pixelIndex]) continue;
    const dataIndex = pixelIndex * 4;
    const previousAlpha = data[dataIndex + 3];
    const distance = getSpriteCutterColorDistance(data, dataIndex, target);
    applySpriteCutterAlphaCut(data, pixelIndex, distance, tolerance, softness);
    if (previousAlpha > 0 && data[dataIndex + 3] === 0) transparentPixels += 1;
  }

  return {
    label: "Borde inteligente",
    transparentPixels
  };
}

async function applySpriteCutterBackgroundRemoval() {
  const image = state.spriteCutter.image;
  if (!image) return;
  syncSpriteCutterBackgroundControls();
  const bg = state.spriteCutter.backgroundRemoval;
  const target = hexToRgb(bg.color);
  const sourceDataUrl = getSpriteCutterRecoverySourceForImage(image);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const processCtx = canvas.getContext("2d");
  processCtx.imageSmoothingEnabled = false;
  processCtx.drawImage(image, 0, 0);
  const imageData = processCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const tolerance = Math.max(0, Number(bg.tolerance) || 0);
  const softness = Math.max(0, Number(bg.softness) || 0);
  const edgeExpand = Math.max(0, Number(bg.edgeExpand) || 0);
  const result = bg.mode === "color"
    ? removeSpriteCutterBackgroundByColor(data, canvas.width, canvas.height, target, tolerance, softness)
    : removeSpriteCutterBackgroundFromEdges(data, canvas.width, canvas.height, target, tolerance, softness, edgeExpand);

  processCtx.putImageData(imageData, 0, 0);
  await replaceSpriteCutterImageFromDataUrl(canvas.toDataURL("image/png"));
  setSpriteCutterMaskFromAlpha(state.spriteCutter.image, {
    sourceDataUrl,
    target: "sheet",
    visible: false
  });
  setSpriteCutterStatus(`${result.label} aplicado. Pixeles transparentes: ${result.transparentPixels}.`);
}

function getSpriteCutterCurrentImageDataUrl() {
  const image = state.spriteCutter.image;
  if (!image) return "";
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const processCtx = canvas.getContext("2d");
  processCtx.imageSmoothingEnabled = false;
  processCtx.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

async function applySpriteCutterAIBackgroundRemoval() {
  const image = state.spriteCutter.image;
  if (!image) return;
  syncSpriteCutterBackgroundControls();
  const button = getSpriteCutterControl("spriteCutterAiRemoveBgButton");
  const sourceDataUrl = getSpriteCutterRecoverySourceForImage(image);
  button.disabled = true;
  button.textContent = "Procesando";
  setSpriteCutterStatus("IA local trabajando. La primera vez puede tardar mientras prepara el modelo.");

  try {
    const result = await window.petStudio.removeImageBackground({
      dataUrl: getSpriteCutterCurrentImageDataUrl(),
      model: state.spriteCutter.backgroundRemoval.aiModel
    });

    if (!result?.ok) {
      window.alert(result?.reason || "No se pudo quitar el fondo con IA.");
      setSpriteCutterStatus("IA local no pudo completar el recorte.");
      return;
    }

    await replaceSpriteCutterImageFromDataUrl(result.dataUrl);
    setSpriteCutterMaskFromAlpha(state.spriteCutter.image, {
      sourceDataUrl,
      target: "sheet",
      visible: false
    });
    setSpriteCutterStatus(`Fondo removido con IA local (${state.spriteCutter.backgroundRemoval.aiModel}).`);
  } finally {
    button.disabled = false;
    button.textContent = "Quitar con IA";
  }
}

async function openSpriteCutterImage() {
  const result = await window.petStudio.chooseSpriteSheetImage();
  if (result?.canceled) return;
  if (!result?.ok) {
    window.alert(result?.reason || "No se pudo abrir la imagen.");
    return;
  }

  const image = await loadSpriteCutterImage(result.fileUrl);
  state.spriteCutter.image = image;
  state.spriteCutter.imageInfo = result;
  state.spriteCutter.originalImageUrl = result.fileUrl;
  state.spriteCutter.selectedCells.clear();
  state.spriteCutter.cropRect = null;
  clearSpriteCutterMask({ silent: true });
  setSpriteCutterRecoverySource(getSpriteCutterDataUrlFromImage(image), image.naturalWidth, image.naturalHeight);
  state.spriteCutter.grid = {
    columns: 1,
    rows: 1,
    cellWidth: image.naturalWidth,
    cellHeight: image.naturalHeight,
    offsetX: 0,
    offsetY: 0,
    gapX: 0,
    gapY: 0
  };
  writeSpriteCutterGridToInputs();
  resetSpriteCutterView();
  setSpriteCutterStatus(`${result.name} abierto - ${image.naturalWidth} x ${image.naturalHeight}`);
}

function fitSpriteCutterGridToImage() {
  const image = state.spriteCutter.image;
  if (!image) return;
  readSpriteCutterGridFromInputs();
  const grid = state.spriteCutter.grid;
  grid.cellWidth = Math.max(1, Math.floor((image.naturalWidth - grid.offsetX - (grid.columns - 1) * grid.gapX) / grid.columns));
  grid.cellHeight = Math.max(1, Math.floor((image.naturalHeight - grid.offsetY - (grid.rows - 1) * grid.gapY) / grid.rows));
  writeSpriteCutterGridToInputs();
  drawSpriteCutterCanvas();
  setSpriteCutterStatus("Cuadricula recalculada con el tamano de la imagen.");
}

function zoomSpriteCutterCanvas(event) {
  const image = state.spriteCutter.image;
  if (!image) return;
  event.preventDefault();
  const point = getSpriteCutterCanvasPoint(event);
  const camera = state.spriteCutter.camera;
  const zoomFactor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
  zoomSpriteCutterAtPoint(point, camera.zoom * zoomFactor);
  drawSpriteCutterCanvas();
}

function startSpriteCutterPointer(event) {
  const image = state.spriteCutter.image;
  if (!image) return;
  event.preventDefault();
  const point = getSpriteCutterCanvasPoint(event);
  const imagePoint = canvasToSpriteCutterImage(point);

  if (event.button === 0 && state.spriteCutter.backgroundRemoval.picking) {
    event.preventDefault();
    pickSpriteCutterBackgroundColor(imagePoint);
    return;
  }

  const drag = state.spriteCutter.drag;
  drag.startCanvasX = point.x;
  drag.startCanvasY = point.y;
  drag.startImageX = imagePoint.x;
  drag.startImageY = imagePoint.y;
  drag.startPanX = state.spriteCutter.camera.panX;
  drag.startPanY = state.spriteCutter.camera.panY;

  if (event.button === 2) {
    drag.mode = "pan";
    getSpriteCutterControl("spriteCutterCanvas").classList.add("panning");
    setSpriteCutterStatus("Moviendo vista con click derecho.");
  } else if (event.button === 0 && state.spriteCutter.maskEditor.visible && state.spriteCutter.maskEditor.data) {
    drag.mode = "mask";
    paintSpriteCutterMaskAt(imagePoint);
    setSpriteCutterStatus(state.spriteCutter.maskEditor.tool === "protect"
      ? "Protegiendo zona de la máscara."
      : "Pintando zona como fondo.");
  } else if (event.button === 0) {
    drag.mode = "crop";
    state.spriteCutter.cropRect = {
      x: imagePoint.x,
      y: imagePoint.y,
      width: 1,
      height: 1
    };
    setSpriteCutterStatus("Arrastra para crear el recorte manual.");
  }

  window.addEventListener("mousemove", moveSpriteCutterPointer);
  window.addEventListener("mouseup", endSpriteCutterPointer, { once: true });
}

function moveSpriteCutterPointer(event) {
  const drag = state.spriteCutter.drag;
  if (!drag.mode) return;
  const point = getSpriteCutterCanvasPoint(event);

  if (drag.mode === "pan") {
    state.spriteCutter.camera.panX = drag.startPanX + (point.x - drag.startCanvasX);
    state.spriteCutter.camera.panY = drag.startPanY + (point.y - drag.startCanvasY);
  } else if (drag.mode === "mask") {
    const imagePoint = canvasToSpriteCutterImage(point);
    paintSpriteCutterMaskAt(imagePoint);
  } else if (drag.mode === "crop") {
    const imagePoint = canvasToSpriteCutterImage(point);
    state.spriteCutter.cropRect = {
      x: drag.startImageX,
      y: drag.startImageY,
      width: imagePoint.x - drag.startImageX,
      height: imagePoint.y - drag.startImageY
    };
  }

  drawSpriteCutterCanvas();
}

function endSpriteCutterPointer() {
  const drag = state.spriteCutter.drag;
  if (drag.mode === "crop") {
    const cropRect = normalizeSpriteCutterRect(state.spriteCutter.cropRect);
    state.spriteCutter.cropRect = cropRect;
    if (cropRect) {
      setSpriteCutterStatus(`Recorte manual listo: ${cropRect.width} x ${cropRect.height}.`);
    }
  }

  drag.mode = null;
  getSpriteCutterControl("spriteCutterCanvas").classList.remove("panning");
  window.removeEventListener("mousemove", moveSpriteCutterPointer);
  drawSpriteCutterCanvas();
}

function startSpriteCutterTouch(event) {
  const image = state.spriteCutter.image;
  if (!image || event.touches.length === 0) return;
  event.preventDefault();

  const touchState = state.spriteCutter.touch;
  const drag = state.spriteCutter.drag;

  if (event.touches.length >= 2) {
    const center = getTouchCenter(event.touches);
    const point = getSpriteCutterCanvasPointFromClient(center.clientX, center.clientY);
    touchState.mode = "pinch";
    touchState.startDistance = Math.max(1, getTouchDistance(event.touches));
    touchState.startZoom = state.spriteCutter.camera.zoom;
    touchState.startPanX = state.spriteCutter.camera.panX;
    touchState.startPanY = state.spriteCutter.camera.panY;
    touchState.lastX = point.x;
    touchState.lastY = point.y;
    drag.mode = null;
    getSpriteCutterControl("spriteCutterCanvas").classList.add("panning");
    setSpriteCutterStatus("Moviendo vista con dos dedos.");
    return;
  }

  const touch = event.touches[0];
  const point = getSpriteCutterCanvasPointFromClient(touch.clientX, touch.clientY);
  const imagePoint = canvasToSpriteCutterImage(point);

  if (state.spriteCutter.backgroundRemoval.picking) {
    pickSpriteCutterBackgroundColor(imagePoint);
    return;
  }

  touchState.mode = "draw";
  drag.startCanvasX = point.x;
  drag.startCanvasY = point.y;
  drag.startImageX = imagePoint.x;
  drag.startImageY = imagePoint.y;
  drag.startPanX = state.spriteCutter.camera.panX;
  drag.startPanY = state.spriteCutter.camera.panY;

  if (state.spriteCutter.maskEditor.visible && state.spriteCutter.maskEditor.data) {
    drag.mode = "mask";
    paintSpriteCutterMaskAt(imagePoint);
    setSpriteCutterStatus(state.spriteCutter.maskEditor.tool === "protect"
      ? "Protegiendo zona de la mÃ¡scara."
      : "Pintando zona como fondo.");
  } else {
    drag.mode = "crop";
    state.spriteCutter.cropRect = {
      x: imagePoint.x,
      y: imagePoint.y,
      width: 1,
      height: 1
    };
    setSpriteCutterStatus("Arrastra con un dedo para crear el recorte.");
  }

  drawSpriteCutterCanvas();
}

function moveSpriteCutterTouch(event) {
  const image = state.spriteCutter.image;
  if (!image || !state.spriteCutter.touch.mode) return;
  event.preventDefault();

  const touchState = state.spriteCutter.touch;
  const drag = state.spriteCutter.drag;

  if (touchState.mode === "pinch" && event.touches.length >= 2) {
    const center = getTouchCenter(event.touches);
    const point = getSpriteCutterCanvasPointFromClient(center.clientX, center.clientY);
    const distance = Math.max(1, getTouchDistance(event.touches));
    const nextZoom = touchState.startZoom * (distance / touchState.startDistance);
    zoomSpriteCutterAtPoint(point, nextZoom);
    state.spriteCutter.camera.panX += point.x - touchState.lastX;
    state.spriteCutter.camera.panY += point.y - touchState.lastY;
    touchState.lastX = point.x;
    touchState.lastY = point.y;
    drawSpriteCutterCanvas();
    return;
  }

  if (touchState.mode !== "draw" || event.touches.length !== 1 || !drag.mode) return;

  const touch = event.touches[0];
  const point = getSpriteCutterCanvasPointFromClient(touch.clientX, touch.clientY);

  if (drag.mode === "mask") {
    paintSpriteCutterMaskAt(canvasToSpriteCutterImage(point));
  } else if (drag.mode === "crop") {
    const imagePoint = canvasToSpriteCutterImage(point);
    state.spriteCutter.cropRect = {
      x: drag.startImageX,
      y: drag.startImageY,
      width: imagePoint.x - drag.startImageX,
      height: imagePoint.y - drag.startImageY
    };
  }

  drawSpriteCutterCanvas();
}

function endSpriteCutterTouch(event) {
  const touchState = state.spriteCutter.touch;

  if (touchState.mode === "pinch" && event.touches.length >= 2) return;
  if (touchState.mode === "pinch" && event.touches.length === 1) {
    touchState.mode = null;
    state.spriteCutter.drag.mode = null;
    getSpriteCutterControl("spriteCutterCanvas").classList.remove("panning");
    return;
  }

  if (touchState.mode === "draw") {
    endSpriteCutterPointer();
  }

  touchState.mode = null;
  state.spriteCutter.drag.mode = null;
  getSpriteCutterControl("spriteCutterCanvas").classList.remove("panning");
}

function selectAllSpriteCutterCells() {
  const image = state.spriteCutter.image;
  if (!image) return;
  readSpriteCutterGridFromInputs();
  const grid = state.spriteCutter.grid;
  state.spriteCutter.selectedCells.clear();
  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      state.spriteCutter.selectedCells.add(getSpriteCutterCellKey(column, row));
    }
  }
  drawSpriteCutterCanvas();
  setSpriteCutterStatus(`${state.spriteCutter.selectedCells.size} celdas seleccionadas.`);
}

function clearSpriteCutterSelection() {
  state.spriteCutter.selectedCells.clear();
  state.spriteCutter.cropRect = null;
  drawSpriteCutterCanvas();
  setSpriteCutterStatus("Seleccion limpia.");
}

function cropSpriteCutterRect(rect) {
  const image = state.spriteCutter.image;
  const cropRect = normalizeSpriteCutterRect(rect);
  if (!image || !cropRect) return null;
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = cropRect.width;
  frameCanvas.height = cropRect.height;
  const frameCtx = frameCanvas.getContext("2d");
  frameCtx.imageSmoothingEnabled = false;
  frameCtx.clearRect(0, 0, cropRect.width, cropRect.height);
  frameCtx.drawImage(image, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, cropRect.width, cropRect.height);
  return frameCanvas.toDataURL("image/png");
}

function cropSpriteCutterCell(column, row) {
  const image = state.spriteCutter.image;
  const rect = getSpriteCutterCellRect(column, row);
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = rect.width;
  frameCanvas.height = rect.height;
  const frameCtx = frameCanvas.getContext("2d");
  frameCtx.imageSmoothingEnabled = false;
  frameCtx.clearRect(0, 0, rect.width, rect.height);
  frameCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
  return frameCanvas.toDataURL("image/png");
}

function addSelectedCellsToAnimation() {
  const image = state.spriteCutter.image;
  if (!image || (state.spriteCutter.selectedCells.size === 0 && !state.spriteCutter.cropRect)) return;
  const animationName = getSpriteCutterAnimationName();
  state.spriteCutter.activeAnimation = animationName;
  state.spriteCutter.animations[animationName] ||= { name: animationName, frames: [] };
  const animation = state.spriteCutter.animations[animationName];

  const cropRect = normalizeSpriteCutterRect(state.spriteCutter.cropRect);
  if (cropRect) {
    const dataUrl = cropSpriteCutterRect(cropRect);
    animation.frames.push({
      dataUrl,
      recoveryDataUrl: dataUrl,
      source: `manual:${cropRect.x},${cropRect.y},${cropRect.width},${cropRect.height}`
    });
    state.spriteCutter.cropRect = null;
    renderSpriteCutterLibrary();
    drawSpriteCutterCanvas();
    setSpriteCutterStatus(`1 frame manual agregado a ${animationName}.`);
    return;
  }

  const orderedCells = [...state.spriteCutter.selectedCells]
    .map(parseSpriteCutterCellKey)
    .sort((a, b) => a.row - b.row || a.column - b.column);

  for (const cell of orderedCells) {
    const dataUrl = cropSpriteCutterCell(cell.column, cell.row);
    animation.frames.push({
      dataUrl,
      recoveryDataUrl: dataUrl,
      source: getSpriteCutterCellKey(cell.column, cell.row)
    });
  }

  state.spriteCutter.selectedCells.clear();
  renderSpriteCutterLibrary();
  drawSpriteCutterCanvas();
  setSpriteCutterStatus(`${orderedCells.length} frames agregados a ${animationName}.`);
}

async function editSpriteCutterFrame(animationName, frameIndex) {
  const animation = state.spriteCutter.animations[animationName];
  const frame = animation?.frames?.[frameIndex];
  if (!frame) return;

  const returnDataUrl = getSpriteCutterDataUrlFromImage();
  const returnCamera = { ...state.spriteCutter.camera };
  const image = await loadSpriteCutterImage(frame.dataUrl);
  state.spriteCutter.image = image;
  state.spriteCutter.selectedCells.clear();
  state.spriteCutter.cropRect = null;
  state.spriteCutter.grid = {
    columns: 1,
    rows: 1,
    cellWidth: image.naturalWidth,
    cellHeight: image.naturalHeight,
    offsetX: 0,
    offsetY: 0,
    gapX: 0,
    gapY: 0
  };
  writeSpriteCutterGridToInputs();
  resetSpriteCutterView();
  setSpriteCutterMaskFromAlpha(image, {
    sourceDataUrl: frame.recoveryDataUrl || frame.dataUrl,
    target: "frame",
    frameAnimation: animationName,
    frameIndex,
    returnDataUrl,
    returnCamera,
    visible: true
  });
  setSpriteCutterStatus(`Editando frame ${String(frameIndex).padStart(3, "0")} de ${animationName}. Aplica o descarta para volver.`);
}

function renderSpriteCutterLibrary() {
  const overlay = ensureSpriteCutterOverlay();
  const list = overlay.querySelector("#spriteCutterAnimationList");
  const preview = overlay.querySelector("#spriteCutterFramePreview");
  list.innerHTML = "";
  preview.innerHTML = "";

  const animations = Object.values(state.spriteCutter.animations);
  for (const animation of animations) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "sprite-cutter-animation-row";
    row.classList.toggle("active", animation.name === state.spriteCutter.activeAnimation);
    row.innerHTML = `<strong>${animation.name}</strong><span>${animation.frames.length} frames</span>`;
    row.addEventListener("click", () => {
      state.spriteCutter.activeAnimation = animation.name;
      getSpriteCutterControl("spriteCutterAnimationName").value = animation.name;
      renderSpriteCutterLibrary();
    });
    list.appendChild(row);
  }

  const active = state.spriteCutter.animations[state.spriteCutter.activeAnimation];
  if (!active) return;
  active.frames.forEach((frame, index) => {
    const item = document.createElement("div");
    item.className = "sprite-cutter-frame-item";
    const image = document.createElement("img");
    image.src = frame.dataUrl;
    const label = document.createElement("span");
    label.textContent = frame.edited ? `${String(index).padStart(3, "0")} editado` : String(index).padStart(3, "0");
    const actions = document.createElement("div");
    actions.className = "sprite-cutter-frame-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-button";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => editSpriteCutterFrame(active.name, index));
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "secondary-button danger";
    removeButton.textContent = "Quitar";
    removeButton.addEventListener("click", () => {
      active.frames.splice(index, 1);
      if (active.frames.length === 0) delete state.spriteCutter.animations[active.name];
      renderSpriteCutterLibrary();
    });
    actions.append(editButton, removeButton);
    item.append(image, label, actions);
    preview.appendChild(item);
  });
}

function resetSpriteCutterLibrary() {
  if (!window.confirm("Vaciar todos los frames temporales del recortador?")) return;
  state.spriteCutter.animations = {};
  state.spriteCutter.selectedCells.clear();
  renderSpriteCutterLibrary();
  drawSpriteCutterCanvas();
  setSpriteCutterStatus("Galeria temporal vacia.");
}

async function exportSpriteCutterFrames() {
  const animations = Object.values(state.spriteCutter.animations).filter((animation) => animation.frames.length > 0);
  if (animations.length === 0) {
    window.alert("No hay frames temporales para exportar.");
    return;
  }

  const totalFrames = animations.reduce((total, animation) => total + animation.frames.length, 0);
  setExportProgress({
    status: "running",
    title: "Exportando frames",
    message: "Elige la carpeta de destino.",
    current: 0,
    total: totalFrames,
    percent: 0
  });

  const result = await window.petStudio.exportSpriteCutterFrames({
    petName: getSpriteCutterPetName(),
    animations
  });

  if (result?.canceled) return;
  if (!result?.ok) {
    setExportProgress({ status: "error", title: "Error al exportar frames", message: result?.reason || "No se pudo exportar.", percent: 0 });
    window.alert(result?.reason || "No se pudo exportar.");
    return;
  }

  window.alert(`Frames exportados.\n${result.exportFolder}`);
}

function openSpriteCutter() {
  const overlay = ensureSpriteCutterOverlay();
  overlay.classList.add("open");
  renderSpriteCutterLibrary();
  requestAnimationFrame(() => {
    resizeSpriteCutterCanvas();
    drawSpriteCutterCanvas();
  });
}

function closeSpriteCutter() {
  ensureSpriteCutterOverlay().classList.remove("open");
}

function ensureImportReviewOverlay() {
  if (state.importReview.overlay) return state.importReview.overlay;

  const overlay = document.createElement("div");
  overlay.className = "import-review-overlay";
  overlay.innerHTML = `
    <section class="import-review-dialog" role="dialog" aria-modal="true">
      <header class="import-review-header">
        <div>
          <h2 id="importReviewTitle">Revisar importacion</h2>
          <p id="importReviewMeta">Esperando datos</p>
        </div>
        <button id="importReviewCloseButton" class="icon-button" type="button">Cerrar</button>
      </header>
      <div class="import-review-body">
        <section class="import-review-section">
          <h3>Mascota</h3>
          <div class="import-review-grid">
            <label>
              Nombre
              <input id="importReviewNameInput" type="text" value="">
            </label>
            <label>
              ID
              <input id="importReviewIdInput" type="text" value="">
            </label>
          </div>
          <div id="importReviewStats" class="import-review-stats"></div>
          <div id="importReviewWarnings" class="import-review-warnings"></div>
          <div class="import-review-preview">
            <canvas id="importReviewPreviewCanvas" width="360" height="260"></canvas>
            <p id="importReviewPreviewMeta">Selecciona una animacion</p>
          </div>
        </section>
        <section class="import-review-section">
          <h3>Animaciones detectadas</h3>
          <div id="importReviewAnimationList" class="import-review-animation-list"></div>
        </section>
      </div>
      <footer class="import-review-actions">
        <button id="importReviewCancelButton" class="secondary-button" type="button">Cancelar</button>
        <button id="importReviewConfirmButton" class="primary-button" type="button">Importar</button>
      </footer>
    </section>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector("#importReviewCloseButton").addEventListener("click", cancelImportReview);
  overlay.querySelector("#importReviewCancelButton").addEventListener("click", cancelImportReview);
  overlay.querySelector("#importReviewConfirmButton").addEventListener("click", confirmImportReview);
  state.importReview.overlay = overlay;
  return overlay;
}

function renderImportReview(review) {
  const overlay = ensureImportReviewOverlay();
  state.importReview.current = review;
  state.importReview.previewImages.clear();
  state.importReview.frameIndex = 0;
  state.importReview.lastFrameTime = 0;

  overlay.querySelector("#importReviewTitle").textContent = `Revisar ${review.title || "importacion"}`;
  overlay.querySelector("#importReviewMeta").textContent = review.sourceName || "Importacion preparada";
  overlay.querySelector("#importReviewNameInput").value = review.suggestedName || "Nueva mascota";
  overlay.querySelector("#importReviewIdInput").value = review.suggestedId || "pet";

  const stats = overlay.querySelector("#importReviewStats");
  stats.innerHTML = "";
  for (const [label, value] of [
    ["Animaciones", review.animationCount || 0],
    ["Archivos", review.fileCount || 0],
    ["Sonidos", review.soundCount || 0]
  ]) {
    const item = document.createElement("span");
    item.textContent = `${label}: ${value}`;
    stats.appendChild(item);
  }

  const warnings = overlay.querySelector("#importReviewWarnings");
  warnings.innerHTML = "";
  for (const warning of review.warnings || []) {
    const item = document.createElement("p");
    item.textContent = warning;
    warnings.appendChild(item);
  }
  warnings.hidden = !review.warnings || review.warnings.length === 0;

  const list = overlay.querySelector("#importReviewAnimationList");
  list.innerHTML = "";
  for (const animation of review.animations || []) {
    const row = document.createElement("button");
    row.className = "import-review-animation-row";
    row.type = "button";
    const title = document.createElement("strong");
    title.textContent = animation.label || animation.id;
    const meta = document.createElement("span");
    meta.textContent = `${animation.frames || 0} frames - ${animation.fps || 24} fps - ${animation.source || ""}`;
    row.append(title, meta);
    row.addEventListener("click", () => selectImportReviewAnimation(animation.id));
    list.appendChild(row);
  }

  overlay.classList.add("open");
  if (review.animations?.length) selectImportReviewAnimation(review.animations[0].id);
  startImportReviewPreviewLoop();
}

function getImportReviewAnimation(animationId = state.importReview.selectedAnimation) {
  return state.importReview.current?.animations?.find((animation) => animation.id === animationId) || null;
}

function getImportReviewPreviewCanvas() {
  const overlay = ensureImportReviewOverlay();
  return overlay.querySelector("#importReviewPreviewCanvas");
}

function getImportPreviewImageKey(animationId, frameIndex = 0) {
  return `${animationId}:${frameIndex}`;
}

function loadPreviewImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function selectImportReviewAnimation(animationId) {
  const animation = getImportReviewAnimation(animationId);
  if (!animation) return;
  const overlay = ensureImportReviewOverlay();

  state.importReview.selectedAnimation = animationId;
  state.importReview.frameIndex = 0;
  state.importReview.lastFrameTime = 0;

  for (const row of overlay.querySelectorAll(".import-review-animation-row")) {
    const title = row.querySelector("strong")?.textContent || "";
    row.classList.toggle("active", title === (animation.label || animation.id));
  }

  const preview = animation.preview;
  if (preview?.type === "spritesheet" && preview.sourceUrl && !state.importReview.previewImages.has(getImportPreviewImageKey(animation.id))) {
    state.importReview.previewImages.set(getImportPreviewImageKey(animation.id), await loadPreviewImage(preview.sourceUrl));
  }

  if (preview?.type === "frames") {
    const urls = preview.frameUrls || [];
    await Promise.all(urls.slice(0, Math.min(urls.length, 6)).map(async (url, index) => {
      const key = getImportPreviewImageKey(animation.id, index);
      if (!state.importReview.previewImages.has(key)) {
        state.importReview.previewImages.set(key, await loadPreviewImage(url));
      }
    }));
  }

  drawImportReviewPreview();
}

function drawImageFit(targetCtx, image, canvas, sourceRect = null) {
  const sourceWidth = sourceRect?.width || image.width;
  const sourceHeight = sourceRect?.height || image.height;
  const fitScale = Math.min((canvas.width - 28) / sourceWidth, (canvas.height - 46) / sourceHeight, 4);
  const drawWidth = sourceWidth * fitScale;
  const drawHeight = sourceHeight * fitScale;
  const x = (canvas.width - drawWidth) / 2;
  const y = (canvas.height - drawHeight) / 2;

  targetCtx.imageSmoothingEnabled = false;
  if (sourceRect) {
    targetCtx.drawImage(image, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, x, y, drawWidth, drawHeight);
  } else {
    targetCtx.drawImage(image, x, y, drawWidth, drawHeight);
  }
}

function drawImportReviewPreview() {
  const canvas = getImportReviewPreviewCanvas();
  const previewCtx = canvas.getContext("2d");
  const animation = getImportReviewAnimation();
  const meta = ensureImportReviewOverlay().querySelector("#importReviewPreviewMeta");
  previewCtx.clearRect(0, 0, canvas.width, canvas.height);
  previewCtx.fillStyle = "#0a0d12";
  previewCtx.fillRect(0, 0, canvas.width, canvas.height);

  if (!animation?.preview) {
    meta.textContent = "Sin previsualizacion";
    return;
  }

  const frameCount = Math.max(1, Number(animation.preview.frames || animation.frames || 1));
  const frameIndex = state.importReview.frameIndex % frameCount;

  if (animation.preview.type === "spritesheet") {
    const image = state.importReview.previewImages.get(getImportPreviewImageKey(animation.id));
    if (!image) return;
    const width = Number(animation.preview.frameWidth || 128);
    const height = Number(animation.preview.frameHeight || 128);
    const columns = Number(animation.preview.columns || 1);
    drawImageFit(previewCtx, image, canvas, {
      x: (frameIndex % columns) * width,
      y: Math.floor(frameIndex / columns) * height,
      width,
      height
    });
  } else {
    const key = getImportPreviewImageKey(animation.id, frameIndex);
    let image = state.importReview.previewImages.get(key);
    if (!image && animation.preview.frameUrls?.[frameIndex]) {
      loadPreviewImage(animation.preview.frameUrls[frameIndex]).then((loaded) => {
        state.importReview.previewImages.set(key, loaded);
        drawImportReviewPreview();
      }).catch(() => {});
      return;
    }
    if (!image) return;
    drawImageFit(previewCtx, image, canvas);
  }

  meta.textContent = `${animation.label || animation.id} - frame ${frameIndex + 1}/${frameCount}`;
}

function startImportReviewPreviewLoop() {
  if (state.importReview.loopRunning) return;
  state.importReview.loopRunning = true;

  function tickPreview(timestamp) {
    if (!state.importReview.loopRunning) return;
    const overlay = state.importReview.overlay;
    const animation = getImportReviewAnimation();
    if (overlay?.classList.contains("open") && animation?.preview) {
      const fps = Math.max(1, Number(animation.preview.fps || animation.fps || 12));
      const frameMs = 1000 / fps;
      if (!state.importReview.lastFrameTime || timestamp - state.importReview.lastFrameTime >= frameMs) {
        const frameCount = Math.max(1, Number(animation.preview.frames || animation.frames || 1));
        state.importReview.frameIndex = (state.importReview.frameIndex + 1) % frameCount;
        state.importReview.lastFrameTime = timestamp;
        drawImportReviewPreview();
      }
    }
    requestAnimationFrame(tickPreview);
  }

  requestAnimationFrame(tickPreview);
}

async function cancelImportReview() {
  const review = state.importReview.current;
  if (review?.token) await window.petStudio.cancelImport(review.token);
  state.importReview.loopRunning = false;
  state.importReview.current = null;
  ensureImportReviewOverlay().classList.remove("open");
}

async function confirmImportReview() {
  const review = state.importReview.current;
  if (!review?.token) return;
  const overlay = ensureImportReviewOverlay();
  const petName = overlay.querySelector("#importReviewNameInput").value.trim() || review.suggestedName || "Nueva mascota";
  const petId = overlay.querySelector("#importReviewIdInput").value.trim() || review.suggestedId || "pet";

  setExportProgress({
    status: "running",
    title: "Importando mascota",
    message: "Creando archivos de biblioteca",
    current: 0,
    total: 100,
    percent: 0
  });

  const result = await window.petStudio.confirmImport(review.token, { petName, petId });
  if (!result?.ok) {
    window.alert(result?.reason || "No se pudo importar la mascota.");
    return;
  }

  state.importReview.current = null;
  state.importReview.loopRunning = false;
  overlay.classList.remove("open");
  await refreshPetList(result.petRef);
  await loadPet(result.petRef);
  window.alert(`Mascota importada.\n${result.petName}`);
}

function prepareManifestForExport() {
  if (!state.manifest || !els.petSelect.value) return null;
  saveSimpleInputValues();
  applyEditorStateToManifest();
  return state.manifest;
}

async function exportCurrentPet(kind) {
  const manifest = prepareManifestForExport();
  if (!manifest) return;

  setExportProgress({
    status: "running",
    title: kind === "package" ? "Exportando paquete completo" : kind === "individual" ? "Exportando imagenes individuales" : "Exportando Spritesheet and XML",
    message: "Elige una carpeta de destino en el explorador.",
    current: 0,
    total: 1,
    percent: 0
  });

  const result = kind === "package"
    ? await window.petStudio.exportPetPackage(els.petSelect.value, manifest)
    : kind === "individual"
      ? await window.petStudio.exportIndividualImages(els.petSelect.value, manifest)
      : await window.petStudio.exportSpritesheetXml(els.petSelect.value, manifest);

  if (result?.canceled) {
    setExportProgress({ status: "error", title: "Exportacion cancelada", message: "No se eligio carpeta de destino.", percent: 0 });
    return;
  }

  if (!result?.ok) {
    setExportProgress({ status: "error", title: "Error al exportar", message: result?.reason || "No se pudo completar la exportacion.", percent: 0 });
    return;
  }

  window.alert(`Exportacion completa.\n${result.exportFolder || result.packagePath}`);
}

async function preparePackageImport() {
  setExportProgress({
    status: "running",
    title: "Preparando importacion",
    message: "Elige un paquete .petpack.zip",
    current: 0,
    total: 100,
    percent: 0
  });
  const result = await window.petStudio.preparePackageImport();
  if (result?.canceled) return;
  if (!result?.ok) {
    window.alert(result?.reason || "No se pudo revisar el paquete.");
    return;
  }
  renderImportReview(result.review);
}

async function prepareIndividualImagesImport() {
  const result = await window.petStudio.prepareIndividualImagesImport();
  if (result?.canceled) return;
  if (!result?.ok) {
    window.alert(result?.reason || "No se pudieron revisar las imagenes.");
    return;
  }
  renderImportReview(result.review);
}

function handleMenuAction(message) {
  const action = message?.action;

  if (action === "reload-pet") {
    loadPet(els.petSelect.value);
    return;
  }

  if (action === "launch-pet") {
    launchPet();
    return;
  }

  if (action === "save-pet") {
    savePet();
    return;
  }

  if (action === "delete-pet") {
    deleteCurrentPet();
    return;
  }

  if (action === "toggle-editor") {
    state.editorVisible = !state.editorVisible;
    syncEditorVisibility();
    return;
  }

  if (action === "reset-camera") {
    resetCamera();
    return;
  }

  if (action === "toggle-play") {
    els.playButton.click();
    return;
  }

  if (action === "toggle-loop") {
    els.loopButton.click();
    return;
  }

  if (action === "toggle-auto-play") {
    els.autoPlayButton.click();
    return;
  }

  if (action === "restart-animation") {
    els.restartButton.click();
    return;
  }

  if (action === "open-prompts") {
    openPromptLibrary(message?.payload?.promptId);
    return;
  }

  if (action === "open-sprite-cutter") {
    openSpriteCutter();
    return;
  }

  if (action === "open-update-center") {
    openUpdateCenter();
    return;
  }

  if (action === "check-updates") {
    openUpdateCenter();
    checkForUpdates();
    return;
  }

  if (action === "import-pet-package") {
    preparePackageImport();
    return;
  }

  if (action === "import-individual-images") {
    prepareIndividualImagesImport();
    return;
  }

  if (action === "import-spritesheet-xml") {
    window.alert("Importacion preparada: Spritesheet and XML.\nEl flujo real se implementara despues del paquete completo.");
    return;
  }

  if (action === "export-pet-package") {
    exportCurrentPet("package");
    return;
  }

  if (action === "export-spritesheet-xml") {
    exportCurrentPet("spritesheet");
    return;
  }

  if (action === "export-individual-images") {
    exportCurrentPet("individual");
    return;
  }

  if (action === "show-pet-status") {
    window.alert("Mascotas cargadas correctamente si aparecen en la lista.");
    return;
  }

  if (action === "show-about") {
    window.alert("Pet Studio Dev 0.1.0\nFormato de mascota: pet.json schema v1");
  }
}

function setupMobileMenu() {
  const menuButton = document.getElementById("mobileMenuButton");
  const closeButton = document.getElementById("mobileMenuCloseButton");
  const overlay = document.getElementById("mobileMenuOverlay");
  const panel = document.getElementById("mobileMenuPanel");
  if (!menuButton || !closeButton || !overlay || !panel) return;

  const setOpen = (open) => {
    overlay.hidden = !open;
    panel.hidden = !open;
    overlay.classList.toggle("open", open);
    panel.classList.toggle("open", open);
  };

  menuButton.addEventListener("click", () => setOpen(true));
  closeButton.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));

  panel.querySelectorAll("[data-mobile-action]").forEach((button) => {
    button.addEventListener("click", () => {
      setOpen(false);
      handleMenuAction({ action: button.dataset.mobileAction });
    });
  });
}

function setupMobileTabs() {
  const tabBar = document.getElementById("mobileTabBar");
  if (!tabBar) return;

  const buttons = [...tabBar.querySelectorAll("[data-mobile-tab]")];
  const panels = [...document.querySelectorAll("[data-mobile-panel]")];
  if (buttons.length === 0 || panels.length === 0) return;

  const setTab = (tab) => {
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mobileTab === tab);
    });
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.mobilePanel === tab);
    });

    if (!state.editorVisible) {
      state.editorVisible = true;
      syncEditorVisibility();
    }
    requestAnimationFrame(resizeStageCanvas);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.mobileTab));
  });

  const activeTab = buttons.find((button) => button.classList.contains("active"))?.dataset.mobileTab || buttons[0].dataset.mobileTab;
  setTab(activeTab);
}

function enforcePlaybackRules() {
  if (!state.keepPlayingOnChange) return;
  state.playing = true;
  state.loopCurrent = true;
}

function saveSimpleInputValues() {
  const settings = {
    scale: Number(els.scaleInput.value) || getDefaults().scale || 1,
    fps: Number(els.fpsInput.value) || getDefaults().fps || 24
  };

  if (state.simpleSettings.applyToAll) {
    state.simpleSettings.global = settings;
    return;
  }

  state.simpleSettings.byAnimation[state.currentAnimationId] = settings;
}

function drawFrame(animationId, frameIndex, alpha, extraOffset = { x: 0, y: 0 }) {
  const animation = getAnimation(animationId);
  const image = state.images.get(animationId);
  if (!animation || !image) return;

  const { width, height, columns } = getFrameSize(animation);
  const sourceX = (frameIndex % columns) * width;
  const sourceY = Math.floor(frameIndex / columns) * height;
  const scale = getScale(animationId);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const animOffset = getAnimationOffset(animationId);
  const frameOffset = getFrameOffset(animationId, frameIndex);
  const x = (els.stage.width - drawWidth) / 2 + animOffset.x + frameOffset.x + extraOffset.x;
  const y = (els.stage.height - drawHeight) / 2 + animOffset.y + frameOffset.y + extraOffset.y;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, sourceX, sourceY, width, height, x, y, drawWidth, drawHeight);
  ctx.restore();
}

function drawGuides() {
  const midX = els.stage.width / 2;
  const midY = els.stage.height / 2;

  ctx.save();
  ctx.strokeStyle = "rgba(83, 199, 163, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(midX, 0);
  ctx.lineTo(midX, els.stage.height);
  ctx.moveTo(0, midY);
  ctx.lineTo(els.stage.width, midY);
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, els.stage.width, els.stage.height);

  ctx.save();
  applyCameraTransform();
  drawGuides();

  const current = getAnimation();
  if (!current) {
    ctx.restore();
    return;
  }

  if (els.ghostToggle.checked) {
    drawFrame(els.ghostSelect.value, 0, 0.28, { x: 0, y: 0 });
  }

  drawFrame(state.currentAnimationId, state.frameIndex, 1);
  ctx.restore();
  els.animationMeta.textContent = `${current.label || state.currentAnimationId} | frame ${state.frameIndex + 1}/${current.frames} | ${getFps()} fps`;
}

function resizeStageCanvas() {
  const rect = els.stageWrap.getBoundingClientRect();
  const nextWidth = Math.max(120, Math.floor(rect.width - 20));
  const nextHeight = Math.max(120, Math.floor(rect.height - 20));

  if (nextWidth === state.canvasSize.width && nextHeight === state.canvasSize.height) {
    draw();
    return;
  }

  state.canvasSize.width = nextWidth;
  state.canvasSize.height = nextHeight;
  els.stage.width = nextWidth;
  els.stage.height = nextHeight;
  draw();
}

function applyCameraTransform() {
  const centerX = els.stage.width / 2;
  const centerY = els.stage.height / 2;
  ctx.translate(centerX + state.camera.panX, centerY + state.camera.panY);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-centerX, -centerY);
}

function getCanvasPoint(event) {
  return getCanvasPointFromClient(event.clientX, event.clientY);
}

function getCanvasPointFromClient(clientX, clientY) {
  const rect = els.stage.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * els.stage.width,
    y: ((clientY - rect.top) / rect.height) * els.stage.height
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTouchCenter(touches) {
  const first = touches[0];
  const second = touches[1] || touches[0];
  return {
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2
  };
}

function getTouchDistance(touches) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function zoomStageAtPoint(point, newZoom) {
  const oldZoom = state.camera.zoom;
  const centerX = els.stage.width / 2;
  const centerY = els.stage.height / 2;
  const worldX = centerX + (point.x - centerX - state.camera.panX) / oldZoom;
  const worldY = centerY + (point.y - centerY - state.camera.panY) / oldZoom;

  state.camera.zoom = clamp(newZoom, 0.25, 8);
  state.camera.panX = point.x - centerX - state.camera.zoom * (worldX - centerX);
  state.camera.panY = point.y - centerY - state.camera.zoom * (worldY - centerY);
}

function tick(timestamp) {
  const animation = getAnimation();
  if (animation && state.playing) {
    const frameMs = 1000 / getFps(animation);
    if (!state.lastFrameTime || timestamp - state.lastFrameTime >= frameMs) {
      state.frameIndex += 1;
      if (state.frameIndex >= animation.frames) {
        const shouldLoop = state.loopCurrent;
        state.frameIndex = shouldLoop ? 0 : animation.frames - 1;
        if (!shouldLoop) {
          state.playing = false;
          syncPlaybackButtons();
        }
      }
      els.frameInput.value = String(state.frameIndex);
      syncOffsetInputs();
      syncFrameStripSelection();
      state.lastFrameTime = timestamp;
      draw();
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

function clearPetView() {
  state.manifest = null;
  state.images.clear();
  state.currentAnimationId = null;
  state.frameIndex = 0;
  state.playing = false;
  state.keepPlayingOnChange = false;
  state.animationOffsets = {};
  state.frameOffsets = {};
  els.petName.textContent = "Sin mascota";
  els.animationMeta.textContent = "Importa o crea una mascota para comenzar";
  els.animationList.innerHTML = "";
  els.ghostSelect.innerHTML = "";
  els.frameStrip.innerHTML = "";
  els.actionMappingList.innerHTML = "";
  els.animationLabelInput.value = "";
  els.frameInput.max = "0";
  els.frameInput.value = "0";
  ctx.clearRect(0, 0, els.stage.width, els.stage.height);
  syncPlaybackButtons();
  renderSoundOptions();
}

async function loadPet(id) {
  state.manifest = await window.petStudio.loadPet(id);
  state.images.clear();
  state.currentAnimationId = null;
  state.frameIndex = 0;
  state.playing = false;
  state.loopCurrent = true;
  state.keepPlayingOnChange = false;
  state.lastFrameTime = 0;
  state.animationOffsets = {};
  state.frameOffsets = {};
  state.simpleSettings = {
    applyToAll: false,
    global: {
      scale: state.manifest.defaults?.scale || 1,
      fps: state.manifest.defaults?.fps || 24
    },
    byAnimation: {}
  };
  loadSavedOffsets();

  const entries = Object.entries(state.manifest.animations);
  await Promise.all(entries.map(async ([animationId, animation]) => {
    state.images.set(animationId, await loadImage(animation.sourceUrl));
  }));

  els.petName.textContent = state.manifest.name;
  syncPlaybackButtons();
  renderGhostOptions();
  renderActionMappings();
  setAnimation(state.manifest.editor?.referenceAnimation || entries[0][0]);
}

async function launchPet() {
  if (!els.petSelect.value) return;
  const result = await window.petStudio.launchPet(els.petSelect.value);
  if (!result?.ok) {
    window.alert(result?.reason || "No se pudo lanzar la mascota.");
  }
}

function compactOffset(offset) {
  return {
    x: Number(offset?.x) || 0,
    y: Number(offset?.y) || 0
  };
}

function isZeroOffset(offset) {
  return !offset || ((Number(offset.x) || 0) === 0 && (Number(offset.y) || 0) === 0);
}

function applyEditorStateToManifest() {
  state.manifest.editor ||= {};
  state.manifest.editor.referenceAnimation = els.ghostSelect.value;
  state.manifest.editor.referenceFrame = 0;

  for (const [animationId, animation] of Object.entries(state.manifest.animations || {})) {
    const settings = state.simpleSettings.applyToAll
      ? state.simpleSettings.global
      : state.simpleSettings.byAnimation[animationId];

    if (settings) {
      animation.scale = Number(settings.scale) || animation.scale || getDefaults().scale || 1;
      animation.fps = Number(settings.fps) || animation.fps || getDefaults().fps || 24;
    }

    const animationOffset = compactOffset(state.animationOffsets[animationId]);
    if (isZeroOffset(animationOffset)) delete animation.offset;
    else animation.offset = animationOffset;

    const savedFrameOffsets = {};
    for (const [key, offset] of Object.entries(state.frameOffsets)) {
      const [keyAnimationId, frameIndex] = key.split(":");
      if (keyAnimationId !== animationId) continue;
      const compact = compactOffset(offset);
      if (!isZeroOffset(compact)) savedFrameOffsets[frameIndex] = compact;
    }

    if (Object.keys(savedFrameOffsets).length > 0) animation.frameOffsets = savedFrameOffsets;
    else delete animation.frameOffsets;
  }
}

async function savePet() {
  if (!state.manifest || !els.petSelect.value) return;
  saveSimpleInputValues();
  applyEditorStateToManifest();

  const result = await window.petStudio.savePet(els.petSelect.value, state.manifest);
  if (!result?.ok) {
    window.alert(result?.reason || "No se pudo guardar la mascota.");
    return;
  }

  window.alert("Mascota guardada en pet.json.");
}

async function deleteCurrentPet() {
  if (!state.manifest || !els.petSelect.value) return;

  const petName = state.manifest.name || els.petSelect.selectedOptions[0]?.textContent || "esta mascota";
  if (!state.manifest.editable) {
    window.alert("Esta mascota es un ejemplo de solo lectura. Solo se pueden eliminar mascotas de la biblioteca editable.");
    return;
  }

  const firstConfirm = window.confirm(`Eliminar por completo "${petName}"?\n\nEsta accion no se puede deshacer. Se borrara su carpeta de mascota, pet.json, sprites, frames y sonidos internos. Los sonidos de la galeria general solo se borraran si ninguna otra mascota los usa.`);
  if (!firstConfirm) return;

  setExportProgress({
    status: "running",
    title: "Eliminando mascota",
    message: "Iniciando eliminacion...",
    current: 1,
    total: 100,
    percent: 1
  });

  const result = await window.petStudio.deletePet(els.petSelect.value);
  if (!result?.ok) {
    setExportProgress({ status: "error", title: "No se pudo eliminar", message: result?.reason || "La mascota no pudo eliminarse.", percent: 0 });
    window.alert(result?.reason || "No se pudo eliminar la mascota.");
    return;
  }

  setExportProgress({
    status: "running",
    title: "Mascota eliminada",
    message: "Actualizando biblioteca y lista de sonidos...",
    current: 98,
    total: 100,
    percent: 98
  });

  await refreshSoundLibrary();
  const selectedPet = await refreshPetList();
  if (selectedPet) await loadPet(selectedPet);
  else clearPetView();

  setExportProgress({
    status: "done",
    title: "Mascota eliminada",
    message: `${result.petName || petName} fue removida de la biblioteca.`,
    current: 100,
    total: 100,
    percent: 100
  });

  const soundLine = result.removedLibrarySounds?.length
    ? `\nSonidos de galeria eliminados: ${result.removedLibrarySounds.length}`
    : "";
  const soundFolderLine = result.removedLibrarySoundFolders?.length
    ? `\nCarpetas de sonido eliminadas: ${result.removedLibrarySoundFolders.length}`
    : "";
  window.alert(`Mascota eliminada por completo.\nArchivos de mascota eliminados: ${result.removedPetFiles || 0}${soundLine}${soundFolderLine}`);
}

async function importSoundForCurrentAnimation() {
  const animation = getAnimation();
  if (!animation) return;

  const result = await window.petStudio.importSound();

  if (!result?.ok) return;
  state.soundLibrary = {
    folders: result.folders || [],
    sounds: result.sounds || []
  };
  state.selectedSoundFolder = "";
  renderSoundFolders();
  animation.sound = result.sound.id;
  animation.syncToSound = true;
  renderSoundOptions();
  window.alert("Sonido importado y asignado a la animacion actual.");
}

async function openSoundsFolder() {
  await window.petStudio.openSoundsFolder();
  setTimeout(refreshSoundLibrary, 500);
}

async function refreshPetList(preferredRef = "") {
  const previousValue = els.petSelect.value;
  const pets = await window.petStudio.listPets();
  els.petSelect.innerHTML = "";

  for (const pet of pets.filter((item) => item.hasManifest)) {
    const option = document.createElement("option");
    option.value = pet.ref;
    option.textContent = pet.editable ? pet.name : `${pet.name} [solo lectura]`;
    els.petSelect.appendChild(option);
  }

  const preferredOption = preferredRef ? [...els.petSelect.options].find((option) => option.value === preferredRef) : null;
  const previousOption = previousValue ? [...els.petSelect.options].find((option) => option.value === previousValue) : null;

  if (preferredOption) els.petSelect.value = preferredOption.value;
  else if (previousOption) els.petSelect.value = previousOption.value;

  return els.petSelect.value;
}

async function bootstrap() {
  const runtime = await window.petStudio.getRuntimeInfo();
  state.runtime = { ...state.runtime, ...runtime };
  els.runtimeText.textContent = `Canal ${runtime.channel.toUpperCase()}`;
  await refreshSoundLibrary();

  const selectedPet = await refreshPetList();
  if (selectedPet) await loadPet(selectedPet);
  else clearPetView();

  setupStageResizeObserver();
  resizeStageCanvas();
  requestAnimationFrame(tick);
}

function setupStageResizeObserver() {
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(resizeStageCanvas);
    observer.observe(els.stageWrap);
    return;
  }

  window.addEventListener("resize", resizeStageCanvas);
}

els.petSelect.addEventListener("change", () => loadPet(els.petSelect.value));
els.reloadPetButton.addEventListener("click", launchPet);
els.savePetButton.addEventListener("click", savePet);
els.deletePetButton.addEventListener("click", deleteCurrentPet);
els.playButton.addEventListener("click", () => {
  state.playing = state.keepPlayingOnChange ? true : !state.playing;
  state.lastFrameTime = 0;
  syncPlaybackButtons();
  draw();
});
els.loopButton.addEventListener("click", () => {
  state.loopCurrent = state.keepPlayingOnChange ? true : !state.loopCurrent;
  syncPlaybackButtons();
  draw();
});
els.autoPlayButton.addEventListener("click", () => {
  state.keepPlayingOnChange = !state.keepPlayingOnChange;
  enforcePlaybackRules();
  state.lastFrameTime = 0;
  syncPlaybackButtons();
  draw();
});
els.restartButton.addEventListener("click", () => {
  state.frameIndex = 0;
  state.lastFrameTime = 0;
  if (!state.keepPlayingOnChange) state.playing = false;
  syncPlaybackButtons();
  els.frameInput.value = "0";
  syncOffsetInputs();
  draw();
});
els.editorToggleButton.addEventListener("click", () => {
  state.editorVisible = !state.editorVisible;
  syncEditorVisibility();
});

els.animationLabelInput.addEventListener("input", () => {
  const animation = getAnimation();
  if (!animation) return;
  animation.label = els.animationLabelInput.value.trim() || state.currentAnimationId;
  renderAnimationList();
  renderGhostOptions();
  renderActionMappings();
  draw();
});

els.soundSelect.addEventListener("change", () => {
  const animation = getAnimation();
  if (!animation) return;
  if (els.soundSelect.value) animation.sound = els.soundSelect.value;
  else delete animation.sound;
});

els.soundFolderSelect.addEventListener("change", () => {
  state.selectedSoundFolder = els.soundFolderSelect.value;
  renderSoundOptions();
});

els.syncSoundToggle.addEventListener("change", () => {
  const animation = getAnimation();
  if (!animation) return;
  animation.syncToSound = els.syncSoundToggle.checked;
});

els.importSoundButton.addEventListener("click", importSoundForCurrentAnimation);
els.createSoundFolderButton.addEventListener("click", openSoundsFolder);
els.moveSoundButton.addEventListener("click", openSoundsFolder);

els.scaleInput.addEventListener("input", () => {
  saveSimpleInputValues();
  syncSimpleValueLabels();
  draw();
});
els.fpsInput.addEventListener("input", () => {
  saveSimpleInputValues();
  syncSimpleValueLabels();
  draw();
});
els.applyAllToggle.addEventListener("change", () => {
  state.simpleSettings.applyToAll = els.applyAllToggle.checked;
  saveSimpleInputValues();
  syncSimpleInputs();
  draw();
});
els.ghostToggle.addEventListener("change", draw);
els.ghostSelect.addEventListener("change", draw);

els.frameInput.addEventListener("input", () => {
  state.frameIndex = Number(els.frameInput.value);
  syncOffsetInputs();
  syncFrameStripSelection();
  draw();
});

function bindOffsetInput(input, target, axis) {
  input.addEventListener("input", () => {
    if (target === "animation") {
      const value = getAnimationOffset();
      value[axis] = Number(input.value) || 0;
      state.animationOffsets[state.currentAnimationId] = value;
    } else {
      const value = getFrameOffset();
      value[axis] = Number(input.value) || 0;
      state.frameOffsets[getFrameOffsetKey()] = value;
    }
    draw();
  });
}

bindOffsetInput(els.animOffsetX, "animation", "x");
bindOffsetInput(els.animOffsetY, "animation", "y");
bindOffsetInput(els.frameOffsetX, "frame", "x");
bindOffsetInput(els.frameOffsetY, "frame", "y");

els.resetOffsetsButton.addEventListener("click", () => {
  delete state.animationOffsets[state.currentAnimationId];
  delete state.frameOffsets[getFrameOffsetKey()];
  syncOffsetInputs();
  syncFrameStripSelection();
  draw();
});

els.stage.addEventListener("wheel", (event) => {
  event.preventDefault();
  const point = getCanvasPoint(event);
  const zoomFactor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
  zoomStageAtPoint(point, state.camera.zoom * zoomFactor);
  draw();
}, { passive: false });

els.stage.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;
  state.camera.dragging = true;
  state.camera.lastX = event.clientX;
  state.camera.lastY = event.clientY;
  els.stage.classList.add("dragging");
});

els.stage.addEventListener("touchstart", (event) => {
  if (event.touches.length === 0) return;
  event.preventDefault();

  if (event.touches.length >= 2) {
    const center = getTouchCenter(event.touches);
    const point = getCanvasPointFromClient(center.clientX, center.clientY);
    state.camera.touchMode = "pinch";
    state.camera.touchStartDistance = Math.max(1, getTouchDistance(event.touches));
    state.camera.touchStartZoom = state.camera.zoom;
    state.camera.touchStartPanX = state.camera.panX;
    state.camera.touchStartPanY = state.camera.panY;
    state.camera.touchLastX = point.x;
    state.camera.touchLastY = point.y;
    els.stage.classList.add("dragging");
    return;
  }

  const touch = event.touches[0];
  state.camera.touchMode = "pan";
  state.camera.touchLastX = touch.clientX;
  state.camera.touchLastY = touch.clientY;
  els.stage.classList.add("dragging");
}, { passive: false });

els.stage.addEventListener("touchmove", (event) => {
  if (!state.camera.touchMode) return;
  event.preventDefault();

  if (state.camera.touchMode === "pinch" && event.touches.length >= 2) {
    const center = getTouchCenter(event.touches);
    const point = getCanvasPointFromClient(center.clientX, center.clientY);
    const distance = Math.max(1, getTouchDistance(event.touches));
    const nextZoom = state.camera.touchStartZoom * (distance / state.camera.touchStartDistance);
    zoomStageAtPoint(point, nextZoom);
    state.camera.panX += point.x - state.camera.touchLastX;
    state.camera.panY += point.y - state.camera.touchLastY;
    state.camera.touchLastX = point.x;
    state.camera.touchLastY = point.y;
    draw();
    return;
  }

  if (state.camera.touchMode === "pan" && event.touches.length === 1) {
    const touch = event.touches[0];
    const rect = els.stage.getBoundingClientRect();
    const scaleX = els.stage.width / rect.width;
    const scaleY = els.stage.height / rect.height;
    state.camera.panX += (touch.clientX - state.camera.touchLastX) * scaleX;
    state.camera.panY += (touch.clientY - state.camera.touchLastY) * scaleY;
    state.camera.touchLastX = touch.clientX;
    state.camera.touchLastY = touch.clientY;
    draw();
  }
}, { passive: false });

els.stage.addEventListener("touchend", (event) => {
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    state.camera.touchMode = "pan";
    state.camera.touchLastX = touch.clientX;
    state.camera.touchLastY = touch.clientY;
    return;
  }
  if (event.touches.length === 0) {
    state.camera.touchMode = null;
    els.stage.classList.remove("dragging");
  }
});

els.stage.addEventListener("touchcancel", () => {
  state.camera.touchMode = null;
  els.stage.classList.remove("dragging");
});

window.addEventListener("mousemove", (event) => {
  if (state.camera.dragging) {
    const rect = els.stage.getBoundingClientRect();
    const scaleX = els.stage.width / rect.width;
    const scaleY = els.stage.height / rect.height;
    state.camera.panX += (event.clientX - state.camera.lastX) * scaleX;
    state.camera.panY += (event.clientY - state.camera.lastY) * scaleY;
    state.camera.lastX = event.clientX;
    state.camera.lastY = event.clientY;
    draw();
  }

  if (state.editorResize.dragging) {
    const delta = state.editorResize.startY - event.clientY;
    const nextHeight = clamp(state.editorResize.startHeight + delta, 96, Math.round(window.innerHeight * 0.55));
    document.documentElement.style.setProperty("--editor-height", `${nextHeight}px`);
    requestAnimationFrame(resizeStageCanvas);
  }
});

window.addEventListener("mouseup", () => {
  state.camera.dragging = false;
  state.editorResize.dragging = false;
  els.stage.classList.remove("dragging");
  document.body.classList.remove("resizing-editor");
});

window.addEventListener("focus", () => {
  if (!state.manifest) return;
  refreshSoundLibrary();
});

els.editorResizeHandle.addEventListener("mousedown", (event) => {
  if (!state.editorVisible) return;
  state.editorResize.dragging = true;
  state.editorResize.startY = event.clientY;
  state.editorResize.startHeight = Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--editor-height"), 10) || 208;
  document.body.classList.add("resizing-editor");
});

els.editorResizeHandle.addEventListener("dblclick", () => {
  state.editorVisible = !state.editorVisible;
  syncEditorVisibility();
});

setupMobileMenu();
setupMobileTabs();

bootstrap().catch((error) => {
  els.runtimeText.textContent = "Error al iniciar";
  els.animationMeta.textContent = error.message;
  console.error(error);
});

if (window.petStudio?.onMenuAction) {
  window.petStudio.onMenuAction(handleMenuAction);
}

if (window.petStudio?.onExportProgress) {
  window.petStudio.onExportProgress(setExportProgress);
}
