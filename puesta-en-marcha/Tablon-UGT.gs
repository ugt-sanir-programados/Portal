// Ejecuta prepararTablon una vez desde el editor con la cuenta de Portal UGT.
function prepararTablon() {
  const props = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let folderId = props.getProperty('CARPETA_ID');
    if (!folderId) {
      folderId = DriveApp.createFolder('Carteles del tablón UGT Sanir').getId();
      props.setProperty('CARPETA_ID', folderId);
    }
    let sheetId = props.getProperty('HOJA_ID');
    if (!sheetId) {
      const book = SpreadsheetApp.create('Tablón UGT Sanir');
      const sheet = book.getSheets()[0].setName('Avisos');
      sheet.getRange('A1:E1').setValues([['Título', 'Texto', 'Enlace de la imagen de Drive', 'Fecha', 'Publicado']])
        .setFontWeight('bold').setBackground('#fce2ec');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, 3, 260);
      sheet.getRange('D2:D').setNumberFormat('dd/MM/yyyy');
      sheet.getRange('E2:E').insertCheckboxes();
      sheet.getRange('A2:E2').setValues([['PRUEBA · Cartel del tablón', 'Aviso ficticio para comprobar la publicación.', '', new Date(), false]]);
      sheetId = book.getId();
      props.setProperty('HOJA_ID', sheetId);
    }
    Logger.log('Hoja: https://docs.google.com/spreadsheets/d/' + sheetId + '/edit');
    Logger.log('Carpeta: https://drive.google.com/drive/folders/' + folderId);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('HOJA_ID');
  const folderId = props.getProperty('CARPETA_ID');
  if (!sheetId || !folderId) return paginaTablon_('<p>El tablón está pendiente de configurar.</p>');
  try {
    const book = SpreadsheetApp.openById(sheetId);
    const rows = book.getSheetByName('Avisos').getDataRange().getValues().slice(1);
    const published = rows.filter(row => row[4] === true && String(row[0]).trim());
    published.reverse().sort((a, b) => (b[3] instanceof Date ? b[3].getTime() : 0) -
      (a[3] instanceof Date ? a[3].getTime() : 0));
    const cards = published.slice(0, 8).map(([title, text, link, date]) => {
      const when = date instanceof Date ? Utilities.formatDate(date, book.getSpreadsheetTimeZone(), 'dd/MM/yyyy') : '';
      const image = cartelTablon_(String(link), folderId);
      return '<article><small>' + escaparTablon_(when) + '</small><h2>' + escaparTablon_(title) +
        '</h2>' + (text ? '<p>' + escaparTablon_(text) + '</p>' : '') +
        (image ? '<img src="' + image + '" alt="Cartel: ' + escaparTablon_(title) + '">' :
          (link ? '<p>El cartel no está disponible.</p>' : '')) + '</article>';
    });
    return paginaTablon_(cards.join('') || '<p>Todavía no hay avisos publicados.</p>');
  } catch (error) {
    return paginaTablon_('<p>El tablón no está disponible en este momento.</p>');
  }
}

function cartelTablon_(link, folderId) {
  const match = link.trim().match(/^https:\/\/drive\.google\.com\/(?:file\/d\/([\w-]+)(?:[/?#].*)?|open\?id=([\w-]+)(?:&.*)?)$/);
  if (!match) return '';
  try {
    const file = DriveApp.getFileById(match[1] || match[2]);
    const parents = file.getParents();
    let inFolder = false;
    while (parents.hasNext()) {
      if (parents.next().getId() === folderId) inFolder = true;
    }
    const mime = file.getMimeType();
    if (!inFolder || file.isTrashed() || !['image/jpeg', 'image/png', 'image/webp'].includes(mime) ||
        file.getSize() > 1500000) return '';
    return 'data:' + mime + ';base64,' + Utilities.base64Encode(file.getBlob().getBytes());
  } catch (error) {
    return '';
  }
}

function escaparTablon_(value) {
  const chars = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'};
  return String(value).replace(/[&<>"']/g, char => chars[char]);
}

function paginaTablon_(content) {
  return HtmlService.createHtmlOutput('<!doctype html><html lang="es"><head><meta charset="utf-8"><style>' +
    'body{font:16px system-ui;margin:0;padding:16px;background:#fff8f2;color:#40132d}main{max-width:850px;margin:auto}' +
    'article{background:white;border:1px solid #efdce3;border-radius:18px;padding:18px;margin:0 0 16px}' +
    'h1,h2{line-height:1.2}p{white-space:pre-wrap;overflow-wrap:anywhere}' +
    'img{display:block;max-width:100%;height:auto;margin:auto;border-radius:8px}</style></head>' +
    '<body><main><h1>Tablón UGT Sanir</h1>' + content + '</main></body></html>')
    .setTitle('Tablón UGT Sanir')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
