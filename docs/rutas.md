# Rutas del proyecto

Este proyecto separa desde el inicio el entorno de desarrollo y la version final.

## Carpetas principales

- `apps/dev-lab`: laboratorio de desarrollo para PC.
- `apps/mobile`: ventana directa para probar la experiencia de celular.
- `apps/desktop`: mascota flotante que se lanza desde el editor.
- `apps/shared`: logica visual compartida por Dev Lab y Mobile.
- `packages/core`: logica compartida de datos, rutas, biblioteca y mascotas.
- `packages/pet-format`: definicion y validacion del formato de mascota.
- `packages/pet-importers`: futuros importadores para Spritesheet and XML e imagenes sueltas.
- `packages/renderer`: reproduccion de animaciones 2D.
- `data/dev`: datos usados solo por la version Dev.
- `data/prod`: datos usados solo por la version final.
- `data/fixtures`: archivos de demostracion y pruebas controladas. Son de solo lectura para el editor.
- `build/desktop`: salidas empaquetadas para PC.
- `build/mobile`: salidas empaquetadas para celular.

## Mascotas y biblioteca

- `data/dev/library/pets`: mascotas editables del entorno Dev.
- `data/dev/library/sounds`: galeria de sonidos del entorno Dev. Puede tener sonidos sueltos o carpetas creadas por el usuario.
- `data/dev/library/imports`: entradas temporales de importacion, incluyendo paquetes completos e imagenes individuales.
- `data/dev/library/exports`: salidas auxiliares de exportacion, incluyendo paquetes completos, Spritesheet/XML e imagenes individuales.
- `data/fixtures`: ejemplos controlados opcionales. No se copian automaticamente al entorno editable.

Cuando el usuario exporta desde `Archivo > Exportacion`, puede elegir cualquier carpeta de destino. Pet Studio crea una subcarpeta nueva para exportaciones abiertas, o un `.petpack.zip` cuando se usa `Paquete completo`.

Las importaciones temporales de paquetes viven en `data/dev/library/imports/packages` solo mientras se revisan. Al confirmar, la mascota final se copia a `data/dev/library/pets`.

## Regla de canales

La version Dev no debe escribir en las mismas rutas que la version final.

- Dev usa `APP_CHANNEL=dev`.
- Produccion usa `APP_CHANNEL=prod`.

Esto evita que pruebas, mascotas importadas o configuraciones rotas del entorno Dev afecten a la app instalada.

## Instalador

La app de PC empaquetada puede instalarse en una ruta elegida por el usuario. Los datos editables de la app no deben depender de la carpeta de instalacion.

Cuando definamos el empaquetado, la app final tendra una ruta de datos propia para produccion y la app Dev tendra otra ruta distinta.

## Comandos de desarrollo

- `npm start`: abre Pet Studio Dev Lab.
- `npm run mobile`: abre la ventana movil directa.
- `npm run validate:fixtures`: valida fixtures y mascotas editables conocidas.
