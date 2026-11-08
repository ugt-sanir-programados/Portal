# Portal UGT Sanir Programados

## Publicar en GitHub Pages

1. Abre el repositorio del portal y entra en **Settings → Pages** para ver qué rama y carpeta sirven la web.
2. Sube juntos `index.html`, `portal.css`, `portal.js`, `portal-config.js`, `manifest.webmanifest`, `sw.js` y los tres iconos PNG a esa carpeta. Si el repositorio ya tiene un `index.html`, este es su reemplazo.
3. Abre la URL HTTPS de Pages y pulsa **Instalar portal**. La primera visita necesita conexión. Los lectores integrados pueden abrirse sin conexión después de que el navegador complete la carga inicial. Las aplicaciones externas, el foro y el buzón necesitan Internet.

## Activar el foro

En el repositorio que vaya a alojar las conversaciones, entra en **Settings → General → Features** y activa **Discussions**. En un repositorio público, los debates serán públicos y para participar se necesita una cuenta de GitHub.

En `portal-config.js`, rellena `discussionsRepo` con el nombre exacto `organizacion/repositorio`. Publica el cambio y comprueba que abren **Ver conversaciones** y **Abrir un tema**.

[Guía de GitHub Discussions](https://docs.github.com/es/discussions/quickstart)

## Activar el buzón

1. Crea un formulario en Formspree con el buzón que deba recibir las consultas. Si varios delegados deben recibirlas, puede usarse un buzón de grupo o configurar los destinatarios en el servicio según el plan disponible.
2. Copia la URL pública `https://formspree.io/f/ID` a `contactEndpoint` en `portal-config.js`. Los correos de destino se configuran en el servicio.
3. Publica el cambio y envía una consulta de prueba. Comprueba que llega a los destinatarios y que se puede responder al correo introducido en el formulario.

Mientras falte esa URL, el formulario permite copiar un borrador. El envío activado usa Formspree para tramitar los datos introducidos en el formulario.

[Documentación de Formspree](https://help.formspree.io/)
