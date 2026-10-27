# Guía: administrar camisas y precios desde Google Sheets

Con esta guía tu equipo agrega, quita y cambia camisas y precios **desde el navegador**, sin tocar código.

## Cómo funciona
- Una hoja de Google tiene dos pestañas: **Camisas** (las tarjetas de "Camisas más pedidas") y **Precios** (los precios del personalizador).
- La página lee esa hoja cada vez que alguien la abre.
- Si la hoja no responde, la página muestra los productos y precios que ya trae escritos. Nunca queda vacía.

---

## Preparación (una sola vez)

### 1. Crear la hoja
1. Entra a Google Sheets y crea una hoja nueva. Ponle de nombre **Street Boys – Catálogo**.
2. Importa `plantilla-camisas.csv`: **Archivo → Importar → Subir → "Reemplazar hoja actual"**. Renombra la pestaña a **Camisas**.
3. Crea otra pestaña y haz lo mismo con `plantilla-precios.csv`. Renómbrala **Precios**.

### 2. Publicar cada pestaña
Haz esto **dos veces**, una por pestaña:
1. **Archivo → Compartir → Publicar en la Web**.
2. En el primer menú elige la pestaña (Camisas o Precios), no "Documento completo".
3. En el segundo menú elige **Valores separados por comas (.csv)**.
4. Pulsa **Publicar** y copia el enlace.

> Deja marcada la opción "Volver a publicar automáticamente cuando se hagan cambios".

### 3. Pegar los enlaces en la página
Abre `config.js` y pega los dos enlaces:

```js
window.STREETBOYS_CONFIG = {
  camisasCsv: 'ENLACE_DE_LA_PESTAÑA_CAMISAS',
  preciosCsv: 'ENLACE_DE_LA_PESTAÑA_PRECIOS'
};
```
Sube el sitio de nuevo. Desde ahora **no hay que volver a tocar el código**.

### 4. Dar acceso al equipo
En Google Sheets pulsa **Compartir** y agrega el correo de cada persona como **Editor**. Quien no esté en la lista no podrá modificar nada.

---

## Uso diario

### Pestaña "Camisas" (una fila = una camisa)

| Columna | Qué poner | Ejemplo |
|---|---|---|
| `id` | Nombre corto sin espacios ni tildes, que no se repita | `oversize-negra` |
| `nombre` | Nombre que ve el cliente | Camisa Oversize Negra |
| `precio` | Solo el número | 89000 |
| `etiqueta` | Opcional: Nuevo, Más vendido, Edición limitada | Más vendido |
| `imagen_frente` | Enlace de la foto de frente | ver abajo |
| `imagen_espalda` | Opcional: se muestra al pasar el cursor | |
| `modelo` | `clasica`, `oversize` o `manga-larga` | oversize |
| `color` | `negro`, `blanco` o `gris` | negro |
| `activo` | `SI` para mostrarla, `NO` para ocultarla | SI |

- **Agregar una camisa:** escribe una fila nueva al final.
- **Quitarla sin borrarla:** cambia `activo` a `NO`.
- **Cambiar el orden:** mueve las filas; se muestran en el mismo orden de la hoja.
- Los botones **PERSONALIZAR** abren el personalizador con el modelo y el color de esa fila.

### Pestaña "Precios"
Cambia la columna `valor`. **No cambies los nombres de la columna `clave`.**

| clave | Qué controla |
|---|---|
| `clasica`, `oversize`, `manga-larga` | Precio base de cada modelo en el personalizador |
| `texto` | Extra por agregar texto |
| `diseno` | Extra por subir un diseño o logo |

### Fotos
La columna `imagen_frente` acepta:
1. **Un enlace de Cloudinary, ImgBB o similar** (recomendado: estable y rápido).
2. **Un enlace de Google Drive** ("Compartir → Cualquier persona con el enlace"). La página lo convierte sola, pero Drive a veces limita la carga si hay muchas visitas.
3. **Una ruta de la carpeta del sitio**, por ejemplo `img/camisa-01.webp`. Requiere que alguien suba la foto al servidor.

Recomendación para las fotos: formato WebP, proporción vertical 4:5, unos 800 px de ancho.

---

## Buenas prácticas
- Los cambios pueden tardar **hasta 5 minutos** en verse en la página.
- Los datos publicados **son públicos**: no escribas nada privado en esas dos pestañas. Para notas internas usa otra pestaña, que no se publica.
- Activa en Google **Datos → Validación de datos** en las columnas `modelo`, `color` y `activo` para que solo se puedan elegir valores válidos desde una lista.
- Si una fila no aparece, revisa que tenga `nombre` y que `activo` no esté en `NO`.

## Importante
- Los precios de la pestaña **Camisas** se muestran en las tarjetas. Los de la pestaña **Precios** se usan en el personalizador. Conviene mantenerlos coherentes.
- Esta hoja gestiona el catálogo. El carrito, el pago, la subida de diseños y el envío de pedidos todavía necesitan un servicio aparte (por ejemplo Shopify, WooCommerce o un backend propio).
