// Sistema de logging mejorado
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
};

// Nivel de log actual (puedes cambiarlo según necesites)
const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

// Almacén de logs en memoria
let logStore = [];
const MAX_LOGS = 100;

/**
 * Registra un mensaje en el log
 * @param {string} message - Mensaje a registrar
 * @param {number} level - Nivel de log (DEBUG, INFO, WARNING, ERROR)
 * @param {Object} data - Datos adicionales para el log
 */
function logMessage(message, level = LOG_LEVELS.INFO, data = null) {
  if (level >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
    
    const logEntry = {
      timestamp: timestamp,
      level: levelName,
      message: message,
      data: data
    };
    
    // Guardar en el almacén de logs
    logStore.push(logEntry);
    if (logStore.length > MAX_LOGS) {
      logStore.shift(); // Eliminar el log más antiguo si excedemos el máximo
    }
    
    // También registrar en los logs de Apps Script
    let logString = `[${timestamp}] [${levelName}] ${message}`;
    if (data) {
      try {
        logString += ` - Data: ${JSON.stringify(data)}`;
      } catch (e) {
        logString += ` - Data: [No serializable]`;
      }
    }
    
    Logger.log(logString);
  }
}

function logDebug(message, data = null) {
  logMessage(message, LOG_LEVELS.DEBUG, data);
}

function logInfo(message, data = null) {
  logMessage(message, LOG_LEVELS.INFO, data);
}

function logWarning(message, data = null) {
  logMessage(message, LOG_LEVELS.WARNING, data);
}

function logError(message, data = null) {
  logMessage(message, LOG_LEVELS.ERROR, data);
}

// Función para obtener los logs almacenados
function getLogs() {
  return logStore;
}

// Función para limpiar los logs
function clearLogs() {
  logStore = [];
  return { success: true, message: "Logs limpiados correctamente" };
}

// Función para probar la conexión con información detallada
function testConnectionDetailed() {
  logInfo("Iniciando prueba de conexión detallada");
  
  try {
    const config = getOdooConfig();
    
    // Registrar información de configuración (sin contraseña)
    logInfo("Configuración obtenida", {
      url: config.url,
      db: config.db,
      username: config.username,
      // No registrar la contraseña por seguridad
    });
    
    // Verificar que los valores de configuración no estén vacíos
    if (!config.url) {
      logError("URL de Odoo no configurada");
      return { success: false, error: "URL de Odoo no configurada" };
    }
    
    if (!config.db) {
      logError("Base de datos de Odoo no configurada");
      return { success: false, error: "Base de datos de Odoo no configurada" };
    }
    
    if (!config.username) {
      logError("Usuario de Odoo no configurado");
      return { success: false, error: "Usuario de Odoo no configurado" };
    }
    
    if (!config.password) {
      logError("Contraseña de Odoo no configurada");
      return { success: false, error: "Contraseña de Odoo no configurada" };
    }
    
    // Construir la URL de login
    const loginUrl = config.url + '/xmlrpc/2/common';
    logInfo("URL de login construida", { loginUrl: loginUrl });
    
    // Crear payload XML-RPC
    logDebug("Creando payload XML-RPC para autenticación");
    const payload = createXmlRpcPayload('authenticate', [config.db, config.username, config.password, {}]);
    
    // Configurar opciones de la solicitud
    const options = {
      'method': 'post',
      'contentType': 'text/xml',
      'payload': payload,
      'muteHttpExceptions': true
    };
    
    // Realizar la solicitud HTTP
    logInfo("Enviando solicitud de autenticación a Odoo");
    const response = UrlFetchApp.fetch(loginUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logInfo("Respuesta recibida", { 
      responseCode: responseCode,
      responseSize: responseText.length
    });
    
    // Verificar el código de respuesta
    if (responseCode !== 200) {
      logError("Error en la respuesta HTTP", { 
        responseCode: responseCode,
        responseText: responseText
      });
      return { 
        success: false, 
        error: "Error HTTP: " + responseCode,
        details: responseText
      };
    }
    
    // Analizar la respuesta XML-RPC
    logDebug("Analizando respuesta XML-RPC");
    try {
      const uid = parseXmlRpcResponse(responseText);
      
      if (!uid) {
        logError("Autenticación fallida: UID no recibido");
        return { 
          success: false, 
          error: "Autenticación fallida. Verifique sus credenciales."
        };
      }
      
      logInfo("Autenticación exitosa", { uid: uid });
      return { 
        success: true, 
        uid: uid,
        message: "Conexión exitosa a Odoo"
      };
    } catch (parseError) {
      logError("Error al analizar la respuesta XML-RPC", { 
        error: parseError.toString(),
        responseText: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
      });
      return { 
        success: false, 
        error: "Error al analizar la respuesta: " + parseError.toString()
      };
    }
  } catch (error) {
    logError("Error en la prueba de conexión", { error: error.toString() });
    return { 
      success: false, 
      error: error.toString()
    };
  }
}

// Función para obtener información del sistema Odoo
function getOdooSystemInfo() {
  logInfo("Obteniendo información del sistema Odoo");
  
  try {
    const config = getOdooConfig();
    
    // Construir la URL para la versión
    const versionUrl = config.url + '/xmlrpc/2/common';
    logInfo("URL para obtener versión", { versionUrl: versionUrl });
    
    // Crear payload XML-RPC para version
    const payload = createXmlRpcPayload('version', []);
    
    // Configurar opciones de la solicitud
    const options = {
      'method': 'post',
      'contentType': 'text/xml',
      'payload': payload,
      'muteHttpExceptions': true
    };
    
    // Realizar la solicitud HTTP
    logInfo("Enviando solicitud de versión a Odoo");
    const response = UrlFetchApp.fetch(versionUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logInfo("Respuesta recibida", { 
      responseCode: responseCode,
      responseSize: responseText.length
    });
    
    // Verificar el código de respuesta
    if (responseCode !== 200) {
      logError("Error en la respuesta HTTP", { 
        responseCode: responseCode,
        responseText: responseText
      });
      return { 
        success: false, 
        error: "Error HTTP: " + responseCode,
        details: responseText
      };
    }
    
    // Analizar la respuesta XML-RPC
    logDebug("Analizando respuesta XML-RPC de versión");
    try {
      const versionInfo = parseXmlRpcResponse(responseText);
      logInfo("Información de versión obtenida", versionInfo);
      return { 
        success: true, 
        versionInfo: versionInfo
      };
    } catch (parseError) {
      logError("Error al analizar la respuesta XML-RPC de versión", { 
        error: parseError.toString(),
        responseText: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : "")
      });
      return { 
        success: false, 
        error: "Error al analizar la respuesta: " + parseError.toString()
      };
    }
  } catch (error) {
    logError("Error al obtener información del sistema", { error: error.toString() });
    return { 
      success: false, 
      error: error.toString()
    };
  }
}

// Modificar la función xmlrpcLogin para incluir más logging
function xmlrpcLogin(url, db, username, password) {
  logInfo("Iniciando login XML-RPC", { url: url, db: db, username: username });
  
  try {
    const loginUrl = url + '/xmlrpc/2/common';
    logDebug("URL de login", { loginUrl: loginUrl });
    
    const payload = createXmlRpcPayload('authenticate', [db, username, password, {}]);
    logDebug("Payload XML-RPC creado");
    
    const options = {
      'method': 'post',
      'contentType': 'text/xml',
      'payload': payload,
      'muteHttpExceptions': true
    };
    
    logInfo("Enviando solicitud de autenticación");
    const response = UrlFetchApp.fetch(loginUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logInfo("Respuesta recibida", { responseCode: responseCode });
    
    if (responseCode !== 200) {
      logError("Error de autenticación", { 
        responseCode: responseCode,
        responseText: responseText
      });
      throw new Error('Error de autenticación: ' + responseText);
    }
    
    logDebug("Analizando respuesta XML-RPC");
    const uid = parseXmlRpcResponse(responseText);
    
    if (!uid) {
      logError("Autenticación fallida: UID no recibido");
      throw new Error('Autenticación fallida. Verifique sus credenciales.');
    }
    
    logInfo("Autenticación exitosa", { uid: uid });
    return uid;
  } catch (error) {
    logError("Error en xmlrpcLogin", { error: error.toString() });
    throw error;
  }
}

// Modificar la función xmlrpcExecute para incluir más logging
function xmlrpcExecute(url, db, uid, password, model, method, args) {
  logInfo("Ejecutando método XML-RPC", { 
    url: url, 
    db: db, 
    uid: uid, 
    model: model, 
    method: method 
  });
  
  try {
    const executeUrl = url + '/xmlrpc/2/object';
    logDebug("URL de ejecución", { executeUrl: executeUrl });
    
    const payload = createXmlRpcPayload('execute_kw', [db, uid, password, model, method, args]);
    logDebug("Payload XML-RPC creado");
    
    const options = {
      'method': 'post',
      'contentType': 'text/xml',
      'payload': payload,
      'muteHttpExceptions': true
    };
    
    logInfo("Enviando solicitud de ejecución");
    const response = UrlFetchApp.fetch(executeUrl, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    logInfo("Respuesta recibida", { responseCode: responseCode });
    
    if (responseCode !== 200) {
      logError("Error en la ejecución", { 
        responseCode: responseCode,
        responseText: responseText
      });
      throw new Error('Error en la ejecución: ' + responseText);
    }
    
    logDebug("Analizando respuesta XML-RPC");
    const result = parseXmlRpcResponse(responseText);
    logInfo("Ejecución exitosa", { resultType: typeof result });
    
    return result;
  } catch (error) {
    logError("Error en xmlrpcExecute", { error: error.toString() });
    throw error;
  }
}

// Función principal para manejar solicitudes HTTP GET
function doGet(e) {
  try {
    logInfo("Solicitud doGet recibida", e.parameter);
    const page = e.parameter.page || 'index';
    
    // Verificar que el archivo HTML existe
    let template;
    switch(page) {
      case 'index':
        template = HtmlService.createTemplateFromFile('Index');
        break;
      case 'task':
        template = HtmlService.createTemplateFromFile('task');
        break;
      case 'lead':
        template = HtmlService.createTemplateFromFile('lead');
        break;
      case 'debug':
        template = HtmlService.createTemplateFromFile('debug');
        break;
      default:
        template = HtmlService.createTemplateFromFile('Index');
    }
    
    // Configurar la página web
    const htmlOutput = template.evaluate()
      .setTitle('OdooTest App')
      .setFaviconUrl('https://www.google.com/images/product/chrome_app_logo_2x.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    
    logInfo("Página HTML generada", { page: page });
    return htmlOutput;
  } catch (error) {
    logError("Error en doGet", { error: error.toString() });
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.toString() + '</p>');
  }
}