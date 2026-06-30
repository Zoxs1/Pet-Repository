# Formato inicial de mascota

El primer formato vive en `pet.json`. Su objetivo es describir una mascota sin depender de un motor concreto.

## Ideas base

- Una mascota tiene metadatos, valores por defecto y animaciones.
- Cada animacion apunta a una imagen compuesta por frames.
- Cada animacion puede definir `frames`, `fps`, `loop`, `source`, `sound`, `scale` y `syncToSound`.
- Los valores `frameWidth`, `frameHeight` y `columns` pueden estar en `defaults` o en una animacion especifica.
- Los ajustes de referencia visual se guardaran en `editor`; sirven para editar, no son reglas duras del motor.
- Los offsets de alineacion se guardan en `offset` por animacion y `frameOffsets` por frame.
- `actions` mapea comportamientos genericos de la mascota a animaciones concretas.
- `library://` apunta a archivos dentro de la biblioteca activa, por ejemplo `library://sounds/MiMascota/voz.ogg`.

## Acciones base

- `intro`, `idle`, `rest`, `sleep`, `click`, `drag` y `hover` son acciones simples.
- `patrol` y `run` aceptan direcciones como `left`, `right`, `up` y `down`.
- `random` es una lista de emotes o acciones espontaneas.
- Una mascota puede tener animaciones extra sin romper el formato; solo empiezan a usarse cuando se asignan a una accion o a un comportamiento futuro.

## Exportacion

Pet Studio tiene tres salidas iniciales:

- `Paquete completo`: crea un `.petpack.zip` listo para compartir o respaldar. Dentro viajan `pet.json`, `pet-studio.xml`, `sprites/`, `sounds/` y `package.json`.
- `Spritesheet and XML`: copia las imagenes compuestas actuales en `sprites/`, copia sonidos usados en `sounds/`, genera un `pet.json` autocontenido y crea `pet-studio.xml` con la posicion de cada frame dentro de cada spritesheet.
- `Individual images`: recorta cada animacion frame por frame en `frames/<animacion>/`, genera `individual-images.json` como indice de reconstruccion, copia sonidos usados y tambien deja un `pet.json` con la configuracion actual.

Las exportaciones se crean dentro de una carpeta nueva con fecha para no pisar exportaciones anteriores. La app muestra progreso porque una mascota con muchos frames puede tardar.

## Importacion

La importacion usa una pantalla de revision antes de crear la mascota:

- `Paquete completo`: lee un `.petpack.zip`, valida `pet.json`, revisa imagenes y sonidos, y copia todo a `data/dev/library/pets/<id>`.
- `Individual images`: permite seleccionar imagenes o carpetas, agrupa frames por nombre/carpeta, genera spritesheets internos y crea un `pet.json` inicial.
- `Spritesheet and XML`: queda reservado para el adaptador de formatos externos como FNF/XML.

Al confirmar la revision, la app refresca la lista de mascotas y abre la mascota importada en el editor.

## Datos iniciales

El repositorio base no incluye mascotas editables ni fixtures obligatorios. Las mascotas se crean por importacion, recorte de frames o paquetes completos, y quedan dentro de la biblioteca activa.
