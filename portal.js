(() => {
  const byId = id => document.getElementById(id);

  byId('contactForm').addEventListener('submit', event => {
    const message = byId('message');
    const status = byId('draftState');
    if (!message.value.trim()) {
      event.preventDefault();
      status.textContent = 'Escribe un mensaje antes de continuar.';
      message.focus();
      return;
    }
    status.textContent = 'Enviando… Google mostrará el resultado.';
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
