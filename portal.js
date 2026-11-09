(() => {
  const byId = id => document.getElementById(id);

  // CONTACTO: envío directo a Google Apps Script.
  const form = byId('contactForm');
  const status = byId('draftState');
  const direct = byId('contactDirect');

  if (direct) direct.hidden = true;

  if (form) {
    form.target = '_self';

    form.addEventListener('submit', event => {
      const message = byId('message');

      if (!message.value.trim()) {
        event.preventDefault();
        status.textContent = 'Escribe un mensaje antes de continuar.';
        message.focus();
        return;
      }

      const tokenInput = form.querySelector('[name="portal_token"]');
      if (tokenInput) tokenInput.value = '';

      form.target = '_self';
      status.textContent = 'Enviando…';
    });

    window.addEventListener('pageshow', () => {
      status.textContent = '';
      const send = byId('contactSubmit');
      if (send) send.disabled = false;
    });
  }

  // TABLÓN DE ANUNCIOS.
  const boardStatus = byId('tablonEstado');
  const boardCards = byId('tablonAvisos');
  const boardFrame = byId('tablonFrame');
  let boardPending;

  const token = () =>
    Array.from(
      crypto.getRandomValues(new Uint8Array(16)),
      byte => byte.toString(16).padStart(2, '0')
    ).join('');

  function finishBoard() {
    if (!boardPending) return;
    clearTimeout(boardPending.timer);
    boardPending.script.remove();
    boardPending = null;
  }

  function showBoardFallback() {
    finishBoard();
    boardCards.replaceChildren();
    boardStatus.textContent = 'Mostrando la vista compatible del tablón.';
    boardFrame.src = boardFrame.dataset.url;
    boardFrame.hidden = false;
  }

  function loadBoard() {
    if (boardPending) finishBoard();

    const id = token();
    const url = new URL(boardFrame.dataset.url);
    url.searchParams.set('feed', id);

    boardFrame.hidden = true;
    boardStatus.textContent = 'Cargando avisos…';

    const script = document.createElement('script');
    script.src = url.href;

    script.onerror = () => {
      if (boardPending?.id === id) showBoardFallback();
    };

    boardPending = {
      id,
      script,
      timer: setTimeout(() => {
        if (boardPending?.id === id) showBoardFallback();
      }, 10000)
    };

    document.head.append(script);
  }

  window.ugtBoardFeed = (id, notices) => {
    if (boardPending?.id !== id) return;

    if (!Array.isArray(notices)) {
      showBoardFallback();
      return;
    }

    finishBoard();
    renderBoard(notices);
  };

  function renderBoard(announcements) {
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

      if (
        typeof notice.image === 'string' &&
        /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(notice.image)
      ) {
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

    boardStatus.textContent = announcements.length
      ? ''
      : 'Todavía no hay avisos publicados.';
  }

  const reloadBoard = byId('tablonReload');
  if (boardFrame && reloadBoard) reloadBoard.onclick = loadBoard;

  function loadBoardOnEntry() {
    if (boardFrame && location.hash === '#tablon') loadBoard();
  }

  window.addEventListener('hashchange', loadBoardOnEntry);
  loadBoardOnEntry();

  // INSTALACIÓN DE LA APLICACIÓN.
  const installButton = byId('installPortal');
  const dialog = byId('installDialog');
  let installPrompt;

  if (installButton) {
    if (
      matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone
    ) {
      installButton.hidden = true;
    }

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      installPrompt = event;
    });

    window.addEventListener('appinstalled', () => {
      installButton.hidden = true;
    });

    installButton.addEventListener('click', async () => {
      if (!installPrompt) {
        if (dialog) dialog.showModal();
        return;
      }

      const prompt = installPrompt;
      installPrompt = undefined;

      try {
        await prompt.prompt();
      } catch {
        if (dialog) dialog.showModal();
      }
    });
  }

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker
      .register('./sw.js')
      .catch(error => console.warn('PWA:', error));
  }
})();
