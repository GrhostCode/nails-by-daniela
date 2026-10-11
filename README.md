# Nails by Daniela

Sitio web de Nails by Daniela ([@nails_d.aniela](https://instagram.com/nails_d.aniela)). En español por defecto, con un botón para cambiar a inglés (arriba a la derecha).

Es un sitio estático: no hay base de datos ni código de servidor. Cloudflare Workers publica la carpeta `public/` tal cual.

```
public/index.html            Inicio
public/servicios/            Servicios y precios, con el cotizador (escoges y mandas el estimado por WhatsApp)
public/galeria/              Fotos que se abren en grande
public/resenas/              Comentarios reales de Instagram
public/contacto/             WhatsApp, llamada, guardar contacto, compartir y preguntas
public/precios/              Lista de precios para imprimir, con código QR
public/404.html              Página de "no encontrada"
public/assets/site.js        Teléfono, servicios, precios y textos en inglés del cotizador
public/assets/site.css       Diseño (colores arriba, en :root)
public/assets/qrcode.js      Librería del QR (qrcode-generator, licencia MIT)
public/img/                  Logo, íconos de la pestaña y fotos de la galería
public/_headers              Cabeceras de seguridad
wrangler.jsonc               Configuración de Cloudflare
```

## Cambiar datos

- **Servicios y precios:** en `SERVICES`, arriba de `public/assets/site.js`. Cada servicio tiene el nombre (`es`, `en`), la descripción (`des`, `den`) y el precio (`min`, `max`; si son iguales sale un solo precio). El cotizador, el formulario de contacto y la lista para imprimir salen de ahí. Los precios del inicio, de las preguntas frecuentes y de las descripciones de Google están escritos a mano en `public/index.html`, `public/contacto/index.html` y `public/servicios/index.html`: si cambias un precio, búscalo ahí también.
- **Teléfono:** está guardado al revés y en base64 para que los bots no lo recojan. Para cambiarlo: `printf %s "1787XXXXXXX" | rev | base64` y pon el resultado en `PHONE`.
- **Textos:** el español está en el HTML y el inglés en el atributo `data-en` del mismo elemento. Si cambias uno, cambia el otro.
- **Fotos:** en `public/img/galeria/` hay dos versiones de cada foto: la grande (`nombre.jpg`) y la pequeña para la cuadrícula (`nombre-m.jpg`, 640 px). Para añadir una, copia un bloque `<figure class="shot">` en `public/galeria/index.html`.
- **Reseñas:** solo comentarios reales, copiados tal cual, en `public/resenas/index.html`.

## Publicar

1. En Cloudflare: **Workers & Pages → Create → Import a repository**, escoge `GrhostCode/nails-by-daniela`.
2. Build command: vacío. Deploy command: `npx wrangler deploy`.
3. Cada `push` a `main` publica el sitio.
4. Si un día tiene dominio: en el Worker, **Settings → Domains & Routes → Add → Custom domain** (el dominio y `www`).

El código QR de la lista de precios apunta a la dirección desde donde se abre la página, así que al imprimirla desde el dominio final el QR lleva a ese dominio.

## Probar en tu computadora

```
npx wrangler dev     # http://localhost:8787
```
