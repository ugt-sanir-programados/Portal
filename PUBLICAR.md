# Portal UGT Sanir Programados

## Publicar en GitHub Pages

1. Abre el repositorio del portal y entra en **Settings → Pages** para ver qué rama y carpeta sirven la web.
2. Sube juntos `index.html`, `portal.css`, `portal.js`, `manifest.webmanifest`, `sw.js` y los tres iconos PNG a esa carpeta. Si el repositorio ya tiene un `index.html`, este es su reemplazo.
3. Abre la URL HTTPS de Pages y pulsa **Instalar portal**. La primera visita necesita conexión. Los lectores integrados pueden abrirse sin conexión después de que el navegador complete la carga inicial. Las aplicaciones externas, el buzón necesitan Internet.

## Comprobar el envío desde la web

El formulario está conectado a la implementación de Google Apps Script desde el formulario de `index.html`. El script recibe los campos `email`, `mensaje`, `tipo` y `tema` y envía a los buzones del comité y de Prevención.

1. Comprueba en una ventana de incógnito que la URL de la aplicación web termina en `/exec` y muestra «Buzón UGT Sanir disponible».
2. Desde el portal publicado, abre **Contacto**, pon un correo válido y escribe un mensaje identificado como prueba.
3. Pulsa **Enviar mensaje**. Google mostrará el resultado del script. Comprueba la recepción en ambos buzones y usa el botón Atrás del navegador para volver al portal.

Si cambia la URL de la implementación, actualiza el atributo `action` de `contactForm` en `index.html` y vuelve a publicar.
