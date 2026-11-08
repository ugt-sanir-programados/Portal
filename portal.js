(() => {
  const config = window.UGT_PORTAL || {};
  const byId = id => document.getElementById(id);
  const endpoint = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.contactEndpoint || '') ? config.contactEndpoint : '';
  const form = byId('draftForm');
  const status = byId('draftState');
  const send = byId('contactSubmit');
  const recipients = config.contactRecipients || [];
  send.disabled = false;
  if (!endpoint && recipients.length) {
    byId('contactMode').textContent = 'Envío por correo';
    byId('contactNote').textContent = 'El mensaje se abrirá en tu aplicación de correo. Revísalo y pulsa Enviar allí. Evita incluir datos de pacientes o información sensible.';
    byId('contactAside').textContent = 'Tu mensaje se dirigirá al comité y a los delegados de prevención.';
    send.textContent = 'Abrir mi correo';
  }
  if (endpoint) {
    form.action = endpoint;
    form.method = 'post';
    byId('contactMode').textContent = 'Buzón de la sección sindical';
    byId('replyField').hidden = false;
    byId('replyEmail').disabled = false;
    byId('replyEmail').required = true;
    byId('contactNote').textContent = 'Tu mensaje y tu correo se tramitan mediante Google Apps Script para que pueda responderte la sección sindical. Evita incluir datos de pacientes o información sensible.';
    byId('contactAside').textContent = 'Usaremos el correo que indiques para responder a tu consulta.';
    send.textContent = 'Enviar mensaje';
  }

  form.addEventListener('submit', async event => {
    const message = byId('message');
    if (!message.value.trim()) {
      event.preventDefault();
      status.textContent = 'Escribe un mensaje antes de continuar.';
      message.focus();
      return;
    }
    if (endpoint) {
      status.textContent = 'Enviando… Google mostrará el resultado.';
      return;
    }
    event.preventDefault();
    if (recipients.length) {
      const subject = byId('kind').value + ' · ' + byId('topic').value;
      const body = message.value.trim().replace(/\r?\n/g, '\r\n');
      status.textContent = 'Revisa el borrador en tu aplicación de correo y pulsa Enviar.';
      window.location.href = 'mailto:' + recipients.join(',') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      return;
    }
    const draft = byId('kind').value + ' · ' + byId('topic').value + '\n\n' + message.value.trim();
    try {
      await navigator.clipboard.writeText(draft);
      status.textContent = 'Borrador copiado. Puedes pegarlo donde quieras.';
    } catch {
      message.focus();
      message.select();
      status.textContent = 'Mensaje seleccionado. Usa la opción Copiar de tu dispositivo.';
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
