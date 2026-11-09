(() => {
  const byId = id => document.getElementById(id);

  const form = byId('contactForm');
  const send = byId('contactSubmit');
  const status = byId('draftState');
  const boardStatus = byId('tablonEstado');
  const boardCards = byId('tablonAvisos');
  const boardFrame = byId('tablonFrame');
  const mailFrame = document.createElement('iframe');
  mailFrame.name = 'ugt-contact-result';
  mailFrame.title = 'Confirmación del formulario';
  mailFrame.hidden = true;
  form.after(mailFrame);

  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'portal_token';
  form.append(tokenInput);
  let mailPending, boardPending;
  const token = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),
    byte => byte.toString(16).padStart(2, '0')).join('');

  form.addEventListener('submit', event => {
    const message = byId('message');
    if (!message.value.trim() || mailPending) {
      event.preventDefault();
      if (!mailPending) {
        status.textContent = 'Escribe un mensaje antes de continuar.';
        message.focus();
      }
      return;
    }
    if (location.origin !== 'https://ugt-sanir-programados.github.io') return;
    const id = token();
    tokenInput.value = id;
    form.target = mailFrame.name;
    send.disabled = true;
    status.textContent = 'Enviando…';
    mailPending = {id, timer:setTimeout(() => {
      mailPending = null;
      send.disabled = false;
      status.textContent = 'No se pudo confirmar el envío. Revisa el buzón antes de volver a enviarlo.';
    }, 30000)};
  });

  function loadBoard(){
    if (boardPending) clearTimeout(boardPending.timer);
    const id = token();
    const url = new URL(boardFrame.dataset.url);
    url.searchParams.set('portal_token', id);
    boardStatus.textContent = 'Cargando avisos…';
    boardPending = {id, timer:setTimeout(() => {
      boardPending = null;
      boardCards.replaceChildren();
      boardStatus.textContent = 'No se pudo cargar el tablón. Pulsa «Actualizar avisos» para volver a intentarlo.';
    }, 25000)};
    boardFrame.src = url.href;
  }

  function renderBoard(announcements){
    boardCards.replaceChildren();
    for (const notice of announcements) {
      const card = document.createElement('article');
      card.className = 'box tablon-aviso';
      const date = document.createElement('small');
      date.textContent = notice.date;
      const title = document.createElement('h2');
      title.textContent = notice.title;
      card.append(date, title);
      if (notice.text) {
        const body = document.createElement('p');
        body.textContent = notice.text;
        card.append(body);
      }
      if (typeof notice.image === 'string' && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(notice.image)) {
        const image = document.createElement('img');
        image.src = notice.image;
        image.alt = 'Cartel: ' + notice.title;
        image.loading = 'lazy';
        card.append(image);
      }
      if (notice.imageUnavailable) {
        const missing = document.createElement('p');
        missing.textContent = 'El cartel no está disponible.';
        card.append(missing);
      }
      boardCards.append(card);
    }
    boardStatus.textContent = announcements.length ? '' : 'Todavía no hay avisos publicados.';
  }

  window.addEventListener('message', event => {
    if (!/^https:\/\/(?:script\.google\.com|(?:[a-z0-9-]+[.-])?script\.googleusercontent\.com)$/.test(event.origin)) return;
    const data = event.data;
    if (data?.type === 'ugt-contact' && mailPending && data.token === mailPending.id) {
      clearTimeout(mailPending.timer);
      mailPending = null;
      send.disabled = false;
      if (data.ok === true) form.reset();
      status.textContent = data.ok === true ? 'Mensaje enviado al buzón.' : 'No se pudo confirmar el envío. Tu mensaje sigue aquí.';
    }
    if (data?.type === 'ugt-board' && boardPending && data.token === boardPending.id) {
      clearTimeout(boardPending.timer);
      boardPending = null;
      if (Array.isArray(data.notices)) renderBoard(data.notices);
      else {
        boardCards.replaceChildren();
        boardStatus.textContent = 'El tablón no está disponible en este momento.';
      }
    }
  });
  if (boardFrame) byId('tablonReload').onclick = loadBoard;
  function loadBoardOnEntry(){
    if (boardFrame && location.hash === '#tablon') loadBoard();
  }
  window.addEventListener('hashchange', loadBoardOnEntry);
  loadBoardOnEntry();

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
