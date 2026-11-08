(() => {
  const config = window.UGT_PORTAL || {};
  const byId = id => document.getElementById(id);
  const repo = config.discussionsRepo || '';
  if (/^[\w-]+\/[\w.-]+$/.test(repo)) {
    const forumUrl = 'https://github.com/' + repo + '/discussions';
    byId('forumMode').textContent = 'Foro en GitHub';
    byId('forumNote').textContent = 'Puedes leer el foro público. Para publicar o responder, inicia sesión con tu cuenta de GitHub.';
    byId('forumOpen').href = forumUrl;
    byId('forumNew').href = forumUrl + '/new/choose';
    byId('forumOpen').hidden = false;
    byId('forumNew').hidden = false;
  }

  const endpoint = /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(config.contactEndpoint || '') ? config.contactEndpoint : '';
  const form = byId('draftForm');
  const status = byId('draftState');
  const send = byId('contactSubmit');
  send.disabled = false;
  if (endpoint) {
    byId('contactMode').textContent = 'Buzón de la sección sindical';
    byId('replyField').hidden = false;
    byId('replyEmail').disabled = false;
    byId('replyEmail').required = true;
    byId('contactNote').textContent = 'Tu mensaje y tu correo se tramitan mediante Formspree para que pueda responderte la sección sindical. Evita incluir datos de pacientes o información sensible.';
    byId('contactAside').textContent = 'Usaremos el correo que indiques para responder a tu consulta.';
    send.textContent = 'Enviar mensaje';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = byId('message');
    if (!message.value.trim()) {
      status.textContent = 'Escribe un mensaje antes de continuar.';
      message.focus();
      return;
    }
    if (!endpoint) {
      const draft = byId('kind').value + ' · ' + byId('topic').value + '\n\n' + message.value.trim();
      try {
        await navigator.clipboard.writeText(draft);
        status.textContent = 'Borrador copiado. Puedes pegarlo donde quieras.';
      } catch {
        message.focus();
        message.select();
        status.textContent = 'Mensaje seleccionado. Usa la opción Copiar de tu dispositivo.';
      }
      return;
    }
    if (send.disabled) return;
    send.disabled = true;
    status.textContent = 'Enviando…';
    try {
      const result = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: {Accept: 'application/json'},
        signal: AbortSignal.timeout(15000),
      });
      if (!result.ok) throw new Error('Form submission failed');
      form.reset();
      status.textContent = 'Mensaje enviado al buzón.';
    } catch {
      status.textContent = 'No se pudo confirmar el envío. Tu mensaje sigue aquí.';
    } finally {
      send.disabled = false;
    }
  });

  const installButton = byId('installPortal');
  const dialog = byId('installDialog');
  let installPrompt;
  if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) installButton.hidden = true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
  });
  window.addEventListener('appinstalled', () => { installButton.hidden = true; });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) {
      dialog.showModal();
      return;
    }
    const prompt = installPrompt;
    installPrompt = undefined;
    try {
      await prompt.prompt();
    } catch {
      dialog.showModal();
    }
  });
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('PWA:', error));
  }
})();
