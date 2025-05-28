function getLeadFields() {
  const odooUrl = "https://test-dye.quilsoft.com";
  
  // Credenciales de autenticación
  const db = "test_dye_0201";
  const login = "maused@dyesa.com";
  const password = "199c1d6571746ca0d8ee2fcac0a913d8e91e27e0";
  
  
  const authEndpoint = "/web/session/authenticate";
  const authPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: { db, login, password },
    id: 1
  };
  
  const authOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify(authPayload),
    muteHttpExceptions: true
  };
  
  try {
    const authResponse = UrlFetchApp.fetch(odooUrl + authEndpoint, authOptions);
    const authJson = JSON.parse(authResponse.getContentText());
    
    if (authJson.error) {
      Logger.log("Error de autenticación: " + JSON.stringify(authJson.error));
      return null;
    }
    
    const sessionCookie = authResponse.getHeaders()["Set-Cookie"];
    Logger.log("Autenticación exitosa. Cookie de sesión: " + sessionCookie);
    
    // Continúa con la obtención de campos...
  } catch (error) {
    Logger.log("Error durante la autenticación: " + error.toString());
    return null;
  }
}

function getOdooUsers() {
  // Configura la URL de tu instancia de Odoo
  const odooUrl = "https://dye.quilsoft.com";
  
  // Credenciales de autenticación
  const db = "dye_prod";
  const login = "maused@dyesa.com";
  const password = "967ce27624f6e6bfdf1b674efcbc2fda5603796e";
  
  // Endpoint para autenticación
  const authEndpoint = "/web/session/authenticate";
  
  // Parámetros para la solicitud de autenticación
  const authPayload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      db: db,
      login: login,
      password: password
    },
    id: 1
  };
  
  // Opciones de la solicitud de autenticación
  const authOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(authPayload),
    muteHttpExceptions: true
  };
  
  try {
    // Realizar la solicitud de autenticación
    const authResponse = UrlFetchApp.fetch(odooUrl + authEndpoint, authOptions);
    const authJson = JSON.parse(authResponse.getContentText());
    
    if (authJson.error) {
      Logger.log("Error de autenticación: " + JSON.stringify(authJson.error));
      return null;
    }
    
    // Obtener la cookie de sesión
    const sessionCookie = authResponse.getHeaders()["Set-Cookie"];
    
    // Endpoint para leer datos del modelo res.users
    const readEndpoint = "/web/dataset/call_kw";
    
    // Parámetros para leer los usuarios
    const readPayload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "res.users", // Modelo de usuarios
        method: "search_read", // Método para buscar y leer registros
        args: [
          [], // Dominio vacío para obtener todos los usuarios
          ["id", "name", "login"] // Campos a recuperar
        ],
        kwargs: {
          context: {}
        }
      },
      id: 2
    };
    
    // Opciones de la solicitud para leer usuarios
    const readOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": sessionCookie // Incluir la cookie de sesión
      },
      payload: JSON.stringify(readPayload),
      muteHttpExceptions: true
    };
    
    // Realizar la solicitud para leer usuarios
    const readResponse = UrlFetchApp.fetch(odooUrl + readEndpoint, readOptions);
    const readJson = JSON.parse(readResponse.getContentText());
    
    if (readJson.error) {
      Logger.log("Error al leer usuarios: " + JSON.stringify(readJson.error));
      return null;
    }
    
    // Obtener la lista de usuarios
    const userList = readJson.result;
    Logger.log("Lista de usuarios: " + JSON.stringify(userList));
    
    return userList;
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return null;
  }
}
function getOdooDatabaseList() {
  // Configura la URL de tu instancia de Odoo
  const odooUrl = "https://dye.quilsoft.com/";
  
  // Endpoint para listar las bases de datos
  const endpoint = "/web/database/list";
  
  // Parámetros para la solicitud JSON-RPC
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {},
    id: 1 // Identificador de la solicitud
  };
  
  // Opciones de la solicitud
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // Para manejar errores manualmente
  };
  
  try {
    // Realizar la solicitud HTTP POST
    const response = UrlFetchApp.fetch(odooUrl + endpoint, options);
    
    // Parsear la respuesta JSON
    const jsonResponse = JSON.parse(response.getContentText());
    
    // Verificar si hay errores en la respuesta
    if (jsonResponse.error) {
      Logger.log("Error: " + JSON.stringify(jsonResponse.error));
      return null;
    }
    
    // Obtener la lista de bases de datos
    const databaseList = jsonResponse.result;
    Logger.log("Lista de bases de datos: " + JSON.stringify(databaseList));
    
    return databaseList;
  } catch (error) {
    Logger.log("Error al conectar con Odoo: " + error.toString());
    return null;
  }
}

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

// Función simple de prueba de conexión para debug.html
function testConnection() {
  logInfo("Iniciando prueba de conexión básica");
  return testConnectionDetailed();
}

// Obtiene la configuración de Odoo (para la página de debug)
function getOdooConfig() {
  logInfo("Obteniendo configuración de Odoo");
  
  try {
    const props = PropertiesService.getScriptProperties();
    const url = props.getProperty('ODOO_URL');
    const db = props.getProperty('ODOO_DB');
    const username = props.getProperty('ODOO_USER');
    const password = props.getProperty('ODOO_PASSWORD');
    
    // No enviamos la contraseña al frontend por seguridad
    return {
      url: url || "",
      db: db || "",
      username: username || "",
      password: password ? "[CONFIGURADA]" : ""  // Solo indicamos si está configurada o no
    };
  } catch (error) {
    logError("Error al obtener configuración", { error: error.toString() });
    return {
      url: "",
      db: "",
      username: "",
      password: ""
    };
  }
}

// Función para guardar la configuración de Odoo
function saveOdooConfig(configData) {
  try {
    logInfo("Guardando configuración de Odoo", {
      url: configData.url,
      db: configData.db,
      username: configData.username
      // No logging de la contraseña por seguridad
    });
    
    // Validar la configuración
    if (!configData.url) {
      return { success: false, error: "La URL de Odoo es obligatoria" };
    }
    
    if (!configData.db) {
      return { success: false, error: "La base de datos es obligatoria" };
    }
    
    if (!configData.username) {
      return { success: false, error: "El nombre de usuario es obligatorio" };
    }
    
    if (!configData.password) {
      return { success: false, error: "La contraseña es obligatoria" };
    }
    
    // Guardar en las propiedades del script
    const props = PropertiesService.getScriptProperties();
    props.setProperty('ODOO_URL', configData.url);
    props.setProperty('ODOO_DB', configData.db);
    props.setProperty('ODOO_USER', configData.username);
    props.setProperty('ODOO_PASSWORD', configData.password);
    
    logInfo("Configuración guardada correctamente");
    return { success: true, message: "Configuración guardada correctamente" };
    
  } catch (error) {
    logError("Error al guardar la configuración", { error: error.toString() });
    return { success: false, error: "Error al guardar la configuración: " + error.message };
  }
}

// Función auxiliar para crear payload XML-RPC
function createXmlRpcPayload(method, params) {
  let payload = '<?xml version="1.0"?>';
  payload += '<methodCall>';
  payload += '<methodName>' + method + '</methodName>';
  payload += '<params>';
  
  // Añadir cada parámetro
  params.forEach(param => {
    payload += '<param>';
    payload += '<value>';
    payload += convertJsValueToXmlRpc(param);
    payload += '</value>';
    payload += '</param>';
  });
  
  payload += '</params>';
  payload += '</methodCall>';
  
  return payload;
}

// Convertir un valor JS a XML-RPC
function convertJsValueToXmlRpc(value) {
  if (value === null || value === undefined) {
    return '<nil/>';
  }
  
  const type = typeof value;
  
  if (type === 'string') {
    return '<string>' + escapeXml(value) + '</string>';
  }
  else if (type === 'number') {
    if (Number.isInteger(value)) {
      return '<int>' + value + '</int>';
    } else {
      return '<double>' + value + '</double>';
    }
  }
  else if (type === 'boolean') {
    return '<boolean>' + (value ? '1' : '0') + '</boolean>';
  }
  else if (Array.isArray(value)) {
    let xml = '<array><data>';
    value.forEach(item => {
      xml += '<value>' + convertJsValueToXmlRpc(item) + '</value>';
    });
    xml += '</data></array>';
    return xml;
  }
  else if (type === 'object') {
    let xml = '<struct>';
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        xml += '<member>';
        xml += '<name>' + escapeXml(key) + '</name>';
        xml += '<value>' + convertJsValueToXmlRpc(value[key]) + '</value>';
        xml += '</member>';
      }
    }
    xml += '</struct>';
    return xml;
  }
  
  // Por defecto, convertir a string
  return '<string>' + escapeXml(String(value)) + '</string>';
}

// Escapar caracteres XML
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Parsear respuesta XML-RPC
function parseXmlRpcResponse(xmlString) {
  logDebug("Parseando respuesta XML-RPC");
  
  try {
    const xmlDoc = XmlService.parse(xmlString);
    const root = xmlDoc.getRootElement();
    
    // Verificar si hay un error (fault)
    const fault = root.getChild('fault');
    if (fault) {
      const struct = fault.getChild('value').getChild('struct');
      const members = struct.getChildren('member');
      
      let faultCode, faultString;
      members.forEach(member => {
        const name = member.getChildText('name');
        if (name === 'faultCode') {
          faultCode = parseInt(member.getChild('value').getChildText('int'));
        } else if (name === 'faultString') {
          faultString = member.getChild('value').getChildText('string');
        }
      });
      
      logError("Error XML-RPC", { faultCode: faultCode, faultString: faultString });
      throw new Error(faultString || 'XML-RPC Fault');
    }
    
    // Procesar la respuesta normal
    const params = root.getChild('params');
    if (!params) {
      logError("No se encontraron parámetros en la respuesta XML-RPC");
      return null;
    }
    
    const param = params.getChild('param');
    if (!param) {
      logError("No se encontró parámetro en la respuesta XML-RPC");
      return null;
    }
    
    const value = param.getChild('value');
    if (!value) {
      logError("No se encontró valor en la respuesta XML-RPC");
      return null;
    }
    
    return parseXmlRpcValue(value);
  } catch (error) {
    logError("Error al parsear XML-RPC", { error: error.toString() });
    throw error;
  }
}

// Parsear valor XML-RPC recursivamente
function parseXmlRpcValue(valueElement) {
  // Buscar el primer hijo que no sea texto (el tipo de datos)
  const children = valueElement.getChildren();
  
  // Si no hay hijos, el valor es una cadena directa
  if (children.length === 0) {
    return valueElement.getText() || "";
  }
  
  // Obtener el primer elemento hijo (tipo de dato)
  const typeElement = children[0];
  const typeName = typeElement.getName();
  
  switch (typeName) {
    case 'int':
    case 'i4':
      return parseInt(typeElement.getText());
    
    case 'boolean':
      return typeElement.getText() === '1';
    
    case 'string':
      return typeElement.getText() || "";
    
    case 'double':
      return parseFloat(typeElement.getText());
    
    case 'dateTime.iso8601':
      return new Date(typeElement.getText());
    
    case 'base64':
      return Utilities.base64Decode(typeElement.getText());
    
    case 'nil':
      return null;
    
    case 'array':
      const data = typeElement.getChild('data');
      if (!data) return [];
      
      const arrayValues = data.getChildren('value');
      return arrayValues.map(arrayValue => parseXmlRpcValue(arrayValue));
    
    case 'struct':
      const result = {};
      const members = typeElement.getChildren('member');
      
      members.forEach(member => {
        const name = member.getChildText('name');
        const memberValue = member.getChild('value');
        result[name] = parseXmlRpcValue(memberValue);
      });
      
      return result;
    
    default:
      logWarning("Tipo XML-RPC desconocido", { typeName: typeName });
      return typeElement.getText();
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

// Función para crear una nueva tarea en Odoo
function addOdooTask(taskData) {
  try {
    logInfo("Iniciando creación de tarea", taskData);
    
    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }
    
    // Obtener credenciales reales (no la versión sanitizada que devuelve getOdooConfig)
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');
    
    // Autenticar con Odoo
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    logInfo("Autenticación exitosa", { uid: uid });
    
    // Preparar datos para la tarea
    const odooTaskData = {
      'name': taskData.name,
      'project_id': parseInt(taskData.project_id), // Asegurar que sea entero
    };
    
    if (taskData.description) {
      odooTaskData['description'] = taskData.description;
    }
    
    if (taskData.user_id) {
      // Formato para usuarios asignados (Many2many en Odoo)
      odooTaskData['user_ids'] = [[6, 0, [parseInt(taskData.user_id)]]];
    }
    
    if (taskData.deadline) {
      odooTaskData['date_deadline'] = taskData.deadline; // Formato YYYY-MM-DD
    }
    
    // Crear la tarea en Odoo
    const taskId = xmlrpcExecute(
      config.url, 
      config.db, 
      uid, 
      password, 
      'project.task', 
      'create', 
      [odooTaskData]
    );
    
    logInfo("Tarea creada exitosamente", { task_id: taskId });
    return { success: true, task_id: taskId };
    
  } catch (error) {
    logError("Error al crear tarea", { error: error.toString() });
    return { success: false, error: error.message || error.toString() };
  }
}

// Función para crear un nuevo lead in Odoo
function addOdooLead(leadData) {
  try {
    logInfo("Iniciando creación de lead", leadData);
    
    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }
    
    // Obtener credenciales reales (no la versión sanitizada que devuelve getOdooConfig)
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');
    
    // Autenticar con Odoo
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    logInfo("Autenticación exitosa", { uid: uid });
    
    // Preparar datos para el lead
    const odooLeadData = {
      'name': leadData.name,          // Nombre completo (Nombre + Apellido)
      'contact_name': leadData.contact_name || '',  // Nombre del contacto
      'email_from': leadData.email || '',  // Correo electrónico
      'phone': leadData.phone || '',       // Teléfono
      'description': leadData.description || '', // Descripción/notas
    };
    
    // Campos opcionales
    if (leadData.user_id) {
      odooLeadData['user_id'] = parseInt(leadData.user_id);  // Comercial asignado
    }
    
    // Crear el lead en Odoo
    const leadId = xmlrpcExecute(
      config.url, 
      config.db, 
      uid, 
      password, 
      'crm.lead', 
      'create', 
      [odooLeadData]
    );
    
    logInfo("Lead creado exitosamente", { lead_id: leadId });
    return { success: true, lead_id: leadId };
    
  } catch (error) {
    logError("Error al crear lead", { error: error.toString() });
    return { success: false, error: error.message || error.toString() };
  }
}

// Función para crear un nuevo ticket en Odoo
function addOdooTicket(ticketData) {
  try {
    logInfo("Iniciando creación de ticket", ticketData);
    
    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }
    
    // Obtener credenciales reales (no la versión sanitizada que devuelve getOdooConfig)
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');
      // Autenticar con Odoo
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    logInfo("Autenticación exitosa", { uid: uid });

    // Buscar cliente por nombre si se proporciona
    let partnerId = null;
    let clienteInfo = '';
    if (ticketData.partner_name && ticketData.partner_name.trim() !== '') {
      try {
        const partners = xmlrpcExecute(
          config.url,
          config.db,
          uid,
          password,
          'res.partner',
          'search_read',
          [
            [['name', 'ilike', ticketData.partner_name.trim()]],
            ['id', 'name', 'email', 'phone']
          ]
        );
        
        if (partners && partners.length > 0) {
          partnerId = partners[0].id;
          logInfo("Cliente encontrado", { partner_id: partnerId, partner_name: partners[0].name });
          clienteInfo = `Cliente asociado: ${partners[0].name} (ID: ${partnerId})`;
        } else {
          logInfo("Cliente no encontrado, se agregará a detalles", { partner_name: ticketData.partner_name });
          clienteInfo = `Cliente informado: ${ticketData.partner_name} (no existe en sistema)`;
        }
      } catch (partnerError) {
        logWarning("Error buscando cliente", { error: partnerError.toString() });
        clienteInfo = `Cliente informado: ${ticketData.partner_name} (error en búsqueda)`;
      }
    }

    // Buscar tipo de ticket "IngresoReparacionesDJI"
    let ticketTypeId = null;
    try {
      const ticketTypes = xmlrpcExecute(
        config.url,
        config.db,
        uid,
        password,
        'helpdesk.ticket.type',
        'search_read',
        [
          [['name', '=', 'IngresoReparacionesDJI']],
          ['id', 'name']
        ]
      );
      
      if (ticketTypes && ticketTypes.length > 0) {
        ticketTypeId = ticketTypes[0].id;
        logInfo("Tipo de ticket encontrado", { ticket_type_id: ticketTypeId });
      } else {
        logWarning("Tipo de ticket 'IngresoReparacionesDJI' no encontrado");
      }
    } catch (typeError) {
      logWarning("Error buscando tipo de ticket", { error: typeError.toString() });
    }

    // Buscar equipo "Team GarantíasDJI"
    let teamId = null;
    try {
      const teams = xmlrpcExecute(
        config.url,
        config.db,
        uid,
        password,
        'helpdesk.team',
        'search_read',
        [
          [['name', '=', 'Team GarantíasDJI']],
          ['id', 'name']
        ]
      );
      
      if (teams && teams.length > 0) {
        teamId = teams[0].id;
        logInfo("Equipo encontrado", { team_id: teamId });
      } else {
        logWarning("Equipo 'Team GarantíasDJI' no encontrado");
      }
    } catch (teamError) {
      logWarning("Error buscando equipo", { error: teamError.toString() });
    }

    // Formatear descripción en HTML
    let htmlDescription = ticketData.description;
    if (htmlDescription) {
      // Convertir URLs en enlaces HTML
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      htmlDescription = htmlDescription.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
      
      // Convertir saltos de línea a <br>
      htmlDescription = htmlDescription.replace(/\n/g, '<br>');
      
      // Agregar información del cliente si existe
      if (clienteInfo) {
        htmlDescription = `<p><strong>${clienteInfo}</strong></p><hr>${htmlDescription}`;
      }
    }

    // Preparar datos para el ticket
    const odooTicketData = {
      'name': ticketData.name,                    // Título del ticket
      'description': htmlDescription,             // Descripción en HTML
      'priority': ticketData.priority || '1',    // Prioridad (0=Baja, 1=Normal, 2=Alta, 3=Urgente)
    };

    // Asignar IDs encontrados
    if (partnerId) {
      odooTicketData['partner_id'] = partnerId;
    }
    
    if (ticketTypeId) {
      odooTicketData['ticket_type_id'] = ticketTypeId;
    }
      if (teamId) {
      odooTicketData['team_id'] = teamId;
    }

    // Agregar usuario técnico si se proporciona
    if (ticketData.user_id && ticketData.user_id !== '') {
      odooTicketData['user_id'] = parseInt(ticketData.user_id);
    }

    // Agregar email y teléfono del cliente si se proporcionan
    if (ticketData.partner_email && ticketData.partner_email.trim() !== '') {
      odooTicketData['partner_email'] = ticketData.partner_email.trim();
    }
    
    if (ticketData.partner_phone && ticketData.partner_phone.trim() !== '') {
      odooTicketData['partner_phone'] = ticketData.partner_phone.trim();
    }

    // Intentar crear el ticket usando diferentes modelos posibles
    let ticketId;
    let modelUsed;
    
    // Primero intentar con helpdesk.ticket (modelo más común para tickets)
    try {
      logInfo("Intentando crear ticket con modelo helpdesk.ticket", { data: odooTicketData });
      
      ticketId = xmlrpcExecute(
        config.url, 
        config.db, 
        uid, 
        password, 
        'helpdesk.ticket', 
        'create', 
        [odooTicketData]
      );
      modelUsed = 'helpdesk.ticket';
      logInfo("Ticket creado exitosamente con modelo helpdesk.ticket", { ticket_id: ticketId });
    } catch (helpdeskError) {
      logError("Error detallado con modelo helpdesk.ticket", { 
        error: helpdeskError.toString(),
        data_sent: odooTicketData
      });
      
      // Si falla por el stage_id, intentar sin él
      if (helpdeskError.toString().includes('stage_id') || helpdeskError.toString().includes('field')) {
        try {
          logInfo("Reintentando helpdesk.ticket sin stage_id");
          const ticketDataWithoutStage = { ...odooTicketData };
          delete ticketDataWithoutStage.stage_id;
          
          ticketId = xmlrpcExecute(
            config.url, 
            config.db, 
            uid, 
            password, 
            'helpdesk.ticket', 
            'create', 
            [ticketDataWithoutStage]
          );
          modelUsed = 'helpdesk.ticket';
          logInfo("Ticket creado con helpdesk.ticket sin stage_id", { ticket_id: ticketId });
        } catch (retryError) {
          logWarning("Error en reintento con helpdesk.ticket, intentando project.task", { error: retryError.toString() });
          throw retryError; // Pasar al siguiente fallback
        }
      } else {
        logWarning("Error con modelo helpdesk.ticket, intentando project.task", { error: helpdeskError.toString() });
        throw helpdeskError; // Pasar al siguiente fallback
      }
      
      // Si falla, intentar con project.task (algunas instalaciones usan tareas como tickets)
      try {
        // Para project.task necesitamos un project_id, usaremos uno por defecto o crearemos uno
        const projectTaskData = {
          ...odooTicketData,
          'project_id': 1  // Asumimos que existe un proyecto con ID 1, esto debería ser configurable
        };
        
        ticketId = xmlrpcExecute(
          config.url, 
          config.db, 
          uid, 
          password, 
          'project.task', 
          'create', 
          [projectTaskData]
        );
        modelUsed = 'project.task';
        logInfo("Ticket creado con modelo project.task", { ticket_id: ticketId });
      } catch (taskError) {
        logWarning("Error con modelo project.task, intentando crm.lead", { error: taskError.toString() });
        
        // Como último recurso, crear como lead
        try {
          const leadData = {
            'name': ticketData.name,
            'description': odooTicketData['description'],
            'contact_name': ticketData.partner_name || '',
            'email_from': ticketData.partner_email || '',
            'user_id': ticketData.user_id ? parseInt(ticketData.user_id) : null
          };
          
          ticketId = xmlrpcExecute(
            config.url, 
            config.db, 
            uid, 
            password, 
            'crm.lead', 
            'create', 
            [leadData]
          );
          modelUsed = 'crm.lead';
          logInfo("Ticket creado como lead en crm.lead", { ticket_id: ticketId });
        } catch (leadError) {
          logError("Error en todos los modelos intentados", { 
            helpdeskError: helpdeskError.toString(),
            taskError: taskError.toString(),
            leadError: leadError.toString()
          });
          throw new Error("No se pudo crear el ticket en ningún modelo disponible. Verifique que el módulo de helpdesk esté instalado en Odoo.");
        }
      }
    }
      logInfo("Ticket creado exitosamente", { 
      ticket_id: ticketId, 
      model_used: modelUsed 
    });
      // Procesar archivos adjuntos si existen
    let attachmentResults = [];
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      logInfo("Procesando archivos adjuntos", { count: ticketData.attachments.length });
      
      try {
        attachmentResults = processTicketAttachments(
          config.url, 
          config.db, 
          uid, 
          password, 
          ticketId, 
          modelUsed, 
          ticketData.attachments
        );
        logInfo("Adjuntos procesados exitosamente", { 
          total: ticketData.attachments.length,
          successful: attachmentResults.filter(r => r.success).length
        });
      } catch (attachmentError) {
        logWarning("Error procesando algunos adjuntos", { error: attachmentError.toString() });
        // No fallar el ticket por errores en adjuntos
      }
    }
    
    return { 
      success: true, 
      ticket_id: ticketId, 
      model: modelUsed,
      message: `Ticket creado exitosamente (modelo: ${modelUsed})`,
      attachments: attachmentResults
    };
    
  } catch (error) {
    logError("Error al crear ticket", { error: error.toString() });
    return { success: false, error: error.message || error.toString() };
  }
}

// Función para procesar y subir archivos adjuntos a Odoo
function processTicketAttachments(odooUrl, db, uid, password, ticketId, modelUsed, attachments) {
  const results = [];
  
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    
    try {
      logInfo(`Procesando adjunto ${i + 1}/${attachments.length}`, { 
        filename: attachment.name,
        size: attachment.size 
      });
      
      // Preparar datos del adjunto para Odoo
      const attachmentData = {
        'name': attachment.name,
        'datas': attachment.content, // contenido en base64
        'res_model': modelUsed,
        'res_id': ticketId,
        'type': 'binary',
        'mimetype': attachment.type || 'application/octet-stream'
      };
      
      // Crear el adjunto en Odoo usando el modelo ir.attachment
      const attachmentId = xmlrpcExecute(
        odooUrl,
        db,
        uid,
        password,
        'ir.attachment',
        'create',
        [attachmentData]
      );
      
      logInfo(`Adjunto creado exitosamente`, { 
        filename: attachment.name,
        attachment_id: attachmentId 
      });
      
      results.push({
        success: true,
        filename: attachment.name,
        attachment_id: attachmentId
      });
      
    } catch (error) {
      logError(`Error creando adjunto ${attachment.name}`, { error: error.toString() });
      results.push({
        success: false,
        filename: attachment.name,
        error: error.message || error.toString()
      });
    }
  }
  
  return results;
}

// Función para obtener usuarios de Odoo para formularios
function getOdooUsersForForm() {
  try {
    logInfo("Obteniendo usuarios de Odoo para formulario");
    
    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }
    
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');
    
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    
    // Buscar usuarios activos
    const users = xmlrpcExecute(
      config.url,
      config.db,
      uid,
      password,
      'res.users',
      'search_read',
      [
        [['active', '=', true], ['share', '=', false]], // Solo usuarios internos activos
        ['id', 'name', 'login']
      ]
    );
    
    logInfo("Usuarios obtenidos exitosamente", { count: users.length });
    return { success: true, users: users };
    
  } catch (error) {
    logError("Error al obtener usuarios", { error: error.toString() });
    return { success: false, error: error.message || error.toString() };  }
}

// Función principal para manejar solicitudes HTTP GET
function doGet(e) {
  try {
    logInfo("Solicitud doGet recibida", e.parameter);
    
    // Simplemente servir el archivo Index.html para todas las peticiones
    const template = HtmlService.createTemplateFromFile('Index');
    
    // Pasar los parámetros a la plantilla HTML si es necesario
    template.activeTab = e.parameter.tab || 'menu'; // tab puede ser: 'menu', 'task', 'lead', 'debug'
    
    // Configurar la página web
    const htmlOutput = template.evaluate()
      .setTitle('OdooTest App')
      .setFaviconUrl('https://www.google.com/images/product/chrome_app_logo_2x.png')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    
    logInfo("Página HTML generada", { activeTab: template.activeTab });
    return htmlOutput;
  } catch (error) {
    logError("Error en doGet", { error: error.toString() });
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.toString() + '</p>');
  }
}

// Función para buscar y leer tickets en Odoo
function readOdooTicket(searchData) {
  try {
    logInfo("Iniciando búsqueda de ticket", searchData);
    
    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }

    // Obtener credenciales reales (no la versión sanitizada que devuelve getOdooConfig)
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');

    // Autenticar con Odoo
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    logInfo("Autenticación exitosa", { uid: uid });

    const ticketId = parseInt(searchData.ticketId);
    if (!ticketId || ticketId <= 0) {
      throw new Error("ID de ticket inválido");
    }

    let foundTicket = null;
    let modelUsed = null;
    const searchResults = [];

    // Definir los modelos a intentar según la selección del usuario
    let modelsToTry = [];
    if (searchData.model === 'auto') {
      // Detección automática: intentar todos los modelos
      modelsToTry = ['helpdesk.ticket', 'project.task', 'crm.lead'];
    } else {
      // Usar el modelo específico seleccionado
      modelsToTry = [searchData.model];
    }

    // Buscar en cada modelo
    for (const model of modelsToTry) {
      try {
        logInfo(`Buscando ticket en modelo ${model}`, { ticket_id: ticketId });
        
        // Definir campos a obtener según el modelo
        let fieldsToGet = [];
        switch (model) {
          case 'helpdesk.ticket':
            fieldsToGet = [
              'id', 'name', 'description', 'priority', 'stage_id', 'user_id', 
              'team_id', 'partner_id', 'ticket_type_id', 'create_date', 
              'write_date', 'partner_name', 'partner_email', 'partner_phone'
            ];
            break;
          case 'project.task':
            fieldsToGet = [
              'id', 'name', 'description', 'priority', 'stage_id', 'user_ids',
              'project_id', 'partner_id', 'create_date', 'write_date',
              'date_deadline', 'kanban_state'
            ];
            break;
          case 'crm.lead':
            fieldsToGet = [
              'id', 'name', 'description', 'priority', 'stage_id', 'user_id',
              'partner_id', 'contact_name', 'email_from', 'phone', 'mobile',
              'create_date', 'write_date', 'probability', 'expected_revenue'
            ];
            break;
        }

        // Buscar el ticket por ID
        const tickets = xmlrpcExecute(
          config.url,
          config.db,
          uid,
          password,
          model,
          'search_read',
          [
            [['id', '=', ticketId]], // Filtro: buscar por ID específico
            fieldsToGet
          ]
        );

        if (tickets && tickets.length > 0) {
          foundTicket = tickets[0];
          modelUsed = model;
          
          logInfo(`Ticket encontrado en modelo ${model}`, { 
            ticket_id: foundTicket.id,
            name: foundTicket.name 
          });
          
          // Si encontramos el ticket, salir del bucle
          break;
        } else {
          logInfo(`Ticket no encontrado en modelo ${model}`);
          searchResults.push({
            model: model,
            found: false,
            message: `No se encontró ticket con ID ${ticketId} en ${model}`
          });
        }

      } catch (modelError) {
        logWarning(`Error buscando en modelo ${model}`, { error: modelError.toString() });
        searchResults.push({
          model: model,
          found: false,
          error: modelError.message || modelError.toString()
        });
      }
    }    // Si encontramos un ticket, procesarlo y formatear la respuesta
    if (foundTicket) {
      // Procesar campos relacionales (Many2one) para obtener nombres legibles
      const processedTicket = processTicketFields(config.url, config.db, uid, password, foundTicket, modelUsed);
      
      return {
        success: true,
        ticket: processedTicket,
        model: modelUsed,
        message: `Ticket encontrado en modelo ${modelUsed}`,
        searchResults: searchResults
      };
    } else {
      return {
        success: false,
        error: `No se encontró ningún ticket con ID ${ticketId} en ningún modelo`,
        searchResults: searchResults,
        modelsSearched: modelsToTry
      };
    }

  } catch (error) {
    logError("Error al buscar ticket", { error: error.toString() });
    return { success: false, error: error.message || error.toString() };
  }
}

// Función auxiliar para procesar campos relacionales del ticket
function processTicketFields(odooUrl, db, uid, password, ticket, model) {
  try {
    logInfo("Procesando campos relacionales del ticket", { ticket_id: ticket.id, model: model });
    
    // Crear una copia del ticket para no modificar el original
    const processedTicket = { ...ticket };
    
    // Procesar campos Many2one comunes
    const many2oneFields = ['stage_id', 'user_id', 'partner_id', 'team_id', 'ticket_type_id', 'project_id'];
    
    many2oneFields.forEach(field => {
      if (processedTicket[field] && Array.isArray(processedTicket[field]) && processedTicket[field].length > 1) {
        // El campo Many2one viene como [id, "nombre"]
        processedTicket[field + '_name'] = processedTicket[field][1];
        processedTicket[field] = processedTicket[field][0];
      }
    });
    
    // Procesar user_ids para project.task (Many2many)
    if (model === 'project.task' && processedTicket.user_ids && Array.isArray(processedTicket.user_ids)) {
      processedTicket.assigned_users = processedTicket.user_ids;
      processedTicket.user_ids_count = processedTicket.user_ids.length;
    }
    
    // Formatear fechas
    if (processedTicket.create_date) {
      processedTicket.create_date_formatted = formatOdooDate(processedTicket.create_date);
    }
    if (processedTicket.write_date) {
      processedTicket.write_date_formatted = formatOdooDate(processedTicket.write_date);
    }
    if (processedTicket.date_deadline) {
      processedTicket.date_deadline_formatted = formatOdooDate(processedTicket.date_deadline);
    }
    
    // Formatear prioridad
    if (processedTicket.priority !== undefined) {
      const priorityMap = {
        '0': 'Baja',
        '1': 'Normal', 
        '2': 'Alta',
        '3': 'Urgente'
      };
      processedTicket.priority_name = priorityMap[processedTicket.priority.toString()] || 'Desconocida';
    }
    
    logInfo("Campos del ticket procesados exitosamente");
    return processedTicket;
    
  } catch (error) {
    logWarning("Error procesando campos relacionales", { error: error.toString() });
    return ticket; // Devolver el ticket original si hay error
  }
}

// Función auxiliar para formatear fechas de Odoo
function formatOdooDate(odooDate) {
  try {
    if (!odooDate) return '';
    
    // Las fechas de Odoo vienen en formato UTC: "2024-01-15 10:30:00"
    const date = new Date(odooDate.replace(' ', 'T') + 'Z'); // Agregar Z para UTC
    
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires' // Ajustar zona horaria local
    });
  } catch (error) {
    logWarning("Error formateando fecha", { date: odooDate, error: error.toString() });
    return odooDate; // Devolver fecha original si hay error
  }
}