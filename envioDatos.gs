/**
 * Script para exportar datos de inquilinos desde Google Sheets a Back-Bot API
 * Versión optimizada con soporte para encabezados en inglés y español
 */



function exportarInquilinos() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  // Siempre usar la hoja 'INQUILINOS NOTIFICACIONES'
  const sheet = ss.getSheetByName('INQUILINOS NOTIFICACIONES');
  if (!sheet) {
    mostrarMensaje('❌ No se encontró la hoja "INQUILINOS NOTIFICACIONES".');
    return;
  }
  Logger.log('🏷 Hoja usada: %s', sheet.getName());
  const allData = sheet.getDataRange().getValues();
  if (allData.length < 2) {
    mostrarMensaje('❌ La hoja no tiene datos para procesar.');
    return;
  }
  const headers = allData[0].map(h => h.toString().trim().toLowerCase());
  Logger.log('Headers detectados: ' + JSON.stringify(headers));
  if (allData.length > 1) Logger.log('Primera fila de datos: ' + JSON.stringify(allData[1]));
  // Mapeo flexible: español e inglés
  const headerMap = {
    'nombre': 'nombre', 'name': 'nombre',
    'telefono': 'telefono', 'number': 'telefono',
    'fecha_entrada': 'fecha_entrada', 'entry_date': 'fecha_entrada',
    'fecha_salida': 'fecha_salida', 'exit_date': 'fecha_salida',
    'fecha_reserva': 'fecha_reserva', 'reservation_date': 'fecha_reserva',
    'reminder_activated': 'reminder_activated', 'recordatorio_activado': 'reminder_activated',
    'address': 'address', 'piso': 'address', 'direccion': 'address'
  };
  // Encabezados requeridos para el backend
  const REQUIRED = ['nombre','telefono','fecha_entrada','fecha_salida','fecha_reserva','reminder_activated','address'];
  // Verificar que existan todos los requeridos
  const mappedHeaders = headers.map(h => headerMap[h] || null);
  const missing = REQUIRED.filter(r => !mappedHeaders.includes(r));
  if (missing.length) {
    mostrarMensaje('❌ Faltan columnas en la hoja: ' + missing.join(', '));
    return;
  }
  const tenants = [];
  let emptyRows = 0;
  allData.slice(1).forEach((row, idx) => {
    const rowNum = idx + 2;
    Logger.log('Procesando fila ' + rowNum + ': ' + JSON.stringify(row));
    const isFilaVacia = row.every(val => val === "" || val == null || val.toString().trim() === "");
    if (isFilaVacia) {
      emptyRows++;
      Logger.log('Fila %d completamente vacía → ignorada', rowNum);
      return;
    }
    // Construir el objeto tenant usando el mapeo
    const tenant = {};
    REQUIRED.forEach(req => {
      // Buscar el índice del encabezado que mapea a este campo requerido
      const idxHeader = mappedHeaders.indexOf(req);
      if (idxHeader === -1) return;
      let value = row[idxHeader];
      // Fechas
      if (["fecha_entrada","fecha_salida","fecha_reserva"].includes(req) && value instanceof Date) {
        value = Utilities.formatDate(value, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
      }
      // Booleano para reminder_activated
      if (req === 'reminder_activated') {
        value = (value === true || (value && value.toString().toLowerCase() === 'true'));
      }
      tenant[req] = value;
    });
    Logger.log('Tenant construido para fila ' + rowNum + ': ' + JSON.stringify(tenant));
    // Validar que TODOS los campos requeridos estén completos
    let filaCompleta = REQUIRED.every(k => tenant[k] !== '' && tenant[k] != null && tenant[k].toString().trim() !== '');
    if (filaCompleta) {
      tenants.push(tenant);
      Logger.log('✅ Fila %d → %s', rowNum, JSON.stringify(tenant));
    } else {
      Logger.log('Fila %d incompleta o vacía, NO enviada', rowNum);
    }
  });
  Logger.log('Filas procesadas: %d (vacías: %d)', tenants.length, emptyRows);
  if (!tenants.length) {
    mostrarMensaje('❌ No se encontró ningún inquilino válido para enviar.');
    return;
  }
  // Envío HTTP
  const payload = { inquilinos: tenants };
  const opts = {
    method:           'post',
    contentType:      'application/json',
    payload:          JSON.stringify(payload),
    muteHttpExceptions: true
  };
  try {
    const API_URL = 'https://back-bot-4pfj.onrender.com/api/tenants/from-sheet';
    const resp = UrlFetchApp.fetch(API_URL, opts);
    const code = resp.getResponseCode();
    const text = resp.getContentText();
    if (code >= 200 && code < 300) {
      const data = JSON.parse(text);
      mostrarMensaje(`✅ Éxito: ${data.mensaje || 'Datos guardados correctamente.'}`);
      // Marcar en hoja
      const statusCol = headers.length + 1;
      sheet.getRange(1, statusCol).setValue('Estado');
      tenants.forEach((_, i) => {
        sheet.getRange(i+2, statusCol)
             .setValue(`Enviado ${new Date().toLocaleString()}`);
      });
    }
    else if (code === 400) {
      const err = (() => {
        try { return JSON.parse(text).error; } catch(e){ return text; }
      })();
      mostrarMensaje(`❌ Validación: ${err}`);
    }
    else if (code === 500) {
      mostrarMensaje(`❌ Error servidor (500). Revisa logs para más detalle.`);
      Logger.log('Error 500: %s', text);
    }
    else {
      mostrarMensaje(`❌ HTTP ${code}: ${text.substring(0,300)}`);
    }
  }
  catch (e) {
    mostrarMensaje(`❌ Fallo en la solicitud: ${e.message}`);
    Logger.log(e);
  }
  Logger.log('--- Exportación finalizada ---');
}

/**
 * Función segura para mostrar mensajes que funciona en cualquier contexto
 */

function mostrarMensaje(msg) {
  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {
    Logger.log('UI no disponible, mostrando en hoja: %s', msg);
    const sh = SpreadsheetApp.getActiveSheet();
    const r  = sh.getLastRow() + 2;
    sh.getRange(r,1).setValue('Mensaje:');
    sh.getRange(r,2).setValue(msg).setWrap(true);
  }
}

/**
 * Muestra el registro de logs en una hoja aparte para facilitar la depuración
 */

function mostrarLogs() {
  const logs = Logger.getLog().split('\n');
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  let sheet  = ss.getSheetByName('Logs');
  if (!sheet) sheet = ss.insertSheet('Logs');
  sheet.clear();
  sheet.getRange(1,1,1,2).setValues([['Fecha','Mensaje']]);
  logs.forEach((l,i)=>{
    if (l.trim()) {
      sheet.getRange(i+2,1).setValue(new Date());
      sheet.getRange(i+2,2).setValue(l);
    }
  });
  sheet.autoResizeColumn(2).activate();
}

/**
 * Crea una copia de seguridad de los datos en otra hoja
 */

function crearBackupDatos() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const sheet  = ss.getActiveSheet();
  const datos  = sheet.getDataRange().getValues();
  const nombre = 'Backup ' + Utilities.formatDate(new Date(), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'yyyy-MM-dd_HH:mm');
  let bsheet   = ss.getSheetByName(nombre);

  if (bsheet) bsheet.clear();
  else        bsheet = ss.insertSheet(nombre);

  bsheet.getRange(1,1,datos.length,datos[0].length).setValues(datos);
  datos.slice(1).forEach((row,i)=>{
    row.forEach((c,j)=>{
      if (c instanceof Date)
        bsheet.getRange(i+2,j+1)
              .setNumberFormat('yyyy-MM-dd');
    });
  });

  try {
    SpreadsheetApp.getUi().alert(`Backup creado: "${nombre}"`);
  } catch(e){
    Logger.log('Backup creado: %s', nombre);
  }
}

/**
 * Función para ejecutar la exportación mediante un disparador (trigger)
 * Esta función es segura para ejecutarse automáticamente sin UI
 */
// ...existing code...

/**
 * Menú personalizado
 */

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Back‑Bot')
      .addItem('Exportar Inquilinos','exportarInquilinos')
      .addSeparator()
      .addItem('Ver Logs','mostrarLogs')
      .addItem('Crear Backup','crearBackupDatos')
      .addToUi();
  } catch(e){
    Logger.log('No se pudo crear menú: %s', e.toString());
  }
}