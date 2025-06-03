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
    }    // Agregar usuario técnico - Asignar automáticamente a Brandon Depetris si no se especifica otro
    if (ticketData.user_id && ticketData.user_id !== '') {
      odooTicketData['user_id'] = parseInt(ticketData.user_id);
    } else {
      // Asignar automáticamente a Brandon Depetris (ID=14)
      odooTicketData['user_id'] = 14;
      logInfo("Ticket asignado automáticamente a Brandon Depetris (UID=14)");
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

// Función para formatear fechas de Odoo
function formatOdooDate(dateString) {
  if (!dateString) {
    return null;
  }
  try {
    // Odoo fechas pueden venir en formato 'YYYY-MM-DD HH:MM:SS' o 'YYYY-MM-DD'
    // El constructor de Date() de JavaScript usualmente maneja bien estos formatos.
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      // Si la fecha no es válida, devolver el string original o null
      logWarning("Fecha inválida para formatOdooDate", { dateString: dateString });
      return dateString; 
    }
    // Formatear a 'YYYY-MM-DD HH:MM:SS' usando la zona horaria del script
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  } catch (error) {
    logError("Error formateando fecha en formatOdooDate", { dateString: dateString, error: error.toString() });
    return dateString; // Devolver original en caso de error inesperado
  }
}

// Función para obtener usuarios con información comercial completa
function getOdooUsersWithCommercialInfo() {
  try {
    logInfo("Obteniendo usuarios con información comercial completa");
    
    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }
    
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');
    
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    
    // Buscar todos los usuarios con información detallada
    const users = xmlrpcExecute(
      config.url,
      config.db,
      uid,
      password,
      'res.users',
      'search_read',
      [
        [], // Obtener todos los usuarios (activos e inactivos)
        [
          'id', 
          'name', 
          'login', 
          'email',
          'active',
          'login_date',
          'groups_id',
          'category_id'
        ]
      ]
    );
    
    // Procesar usuarios para obtener información del grupo comercial
    const processedUsers = users.map(user => {
      let commercialGroup = 'Sin grupo';
      
      // Obtener información de grupos si existe
      if (user.groups_id && user.groups_id.length > 0) {
        try {
          // Buscar grupos específicamente comerciales
          const groups = xmlrpcExecute(
            config.url,
            config.db,
            uid,
            password,
            'res.groups',
            'search_read',
            [
              [['id', 'in', user.groups_id]],
              ['name', 'category_id']
            ]
          );
          
          // Buscar grupos comerciales (Sales, CRM, etc.)
          const commercialGroups = groups.filter(group => 
            group.name && (
              group.name.toLowerCase().includes('sales') ||
              group.name.toLowerCase().includes('crm') ||
              group.name.toLowerCase().includes('ventas') ||
              group.name.toLowerCase().includes('comercial')
            )
          );
          
          if (commercialGroups.length > 0) {
            commercialGroup = commercialGroups[0].name;
          }
        } catch (groupError) {
          logWarning("Error obteniendo grupos del usuario", { userId: user.id, error: groupError.toString() });
        }
      }
      
      return {
        id: user.id,
        name: user.name,
        login: user.login,
        email: user.email,
        active: user.active,
        login_date: user.login_date ? formatOdooDate(user.login_date) : null,
        commercial_group: commercialGroup
      };
    });
    
    logInfo("Usuarios con información comercial obtenidos exitosamente", { count: processedUsers.length });
    return { success: true, users: processedUsers };
    
  } catch (error) {
    logError("Error al obtener usuarios con información comercial", { error: error.toString() });
    return { success: false, error: error.message || error.toString() };
  }
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

// Function to process ticket fields, resolve relational names, and format dates
function processTicketFields(odooUrl, db, uid, password, ticket, modelUsed) {
  logInfo(`Processing ticket fields for ID: ${ticket.id}, Model: ${modelUsed}`);
  let processed = { ...ticket }; // Clone the ticket object

  // Known relational models and their name fields (can be expanded)
  const knownRelationalModels = {
    'user_id': { model: 'res.users', nameField: 'name' },
    'team_id': { model: 'helpdesk.team', nameField: 'name' },
    'partner_id': { model: 'res.partner', nameField: 'name' },
    'stage_id': { model: 'helpdesk.stage', nameField: 'name' }, // Common for helpdesk.ticket
    // Example for project.task's stage_id if it uses a different model like project.task.type
    // 'stage_id_project_task': { model: 'project.task.type', nameField: 'name' }, 
    'ticket_type_id': { model: 'helpdesk.ticket.type', nameField: 'name' },
    'project_id': { model: 'project.project', nameField: 'name' }, // For project.task
    // Add more known relational fields and their corresponding models/name fields here
    // e.g. 'x_custom_user_id': { model: 'res.users', nameField: 'name' },
  };

  for (const field in processed) {
    if (processed.hasOwnProperty(field)) {
      let value = processed[field];

      // 1. Handle Relational Fields (Many2one, Many2many, One2many)
      if (value && typeof value === 'object' && Array.isArray(value) && value.length > 0) {
        if (value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'string') {
          // Standard Many2one: [ID, "DisplayName"]
          processed[field + '_id'] = value[0];
          processed[field] = value[1];
          processed[field + '_display_name'] = value[1];
        } else if (value.every(item => typeof item === 'number')) {
          // Array of IDs (Many2many/One2many) or a Many2one that only returned an ID [id]
          if (value.length === 1 && knownRelationalModels[field]) {
             const id = value[0];
             const modelInfo = knownRelationalModels[field];
             try {
                const relatedRecord = xmlrpcExecute(odooUrl, db, uid, password, modelInfo.model, 'read', [[id], [modelInfo.nameField]]);
                if (relatedRecord && relatedRecord.length > 0 && relatedRecord[0][modelInfo.nameField] !== undefined) {
                  processed[field + '_id'] = id;
                  processed[field] = relatedRecord[0][modelInfo.nameField];
                  processed[field + '_display_name'] = relatedRecord[0][modelInfo.nameField];
                } else {
                  processed[field + '_id'] = id;
                  processed[field] = `ID: ${id} (Name not found for ${modelInfo.model})`;
                  processed[field + '_display_name'] = `ID: ${id} (Name not found for ${modelInfo.model})`;
                }
             } catch (e) {
                logWarning(`Could not resolve name for field ${field} (ID: ${id}), model ${modelInfo.model}`, e);
                processed[field + '_id'] = id;
                processed[field] = `ID: ${id} (Error resolving name for ${modelInfo.model})`;
                processed[field + '_display_name'] = `ID: ${id} (Error resolving name for ${modelInfo.model})`;
             }
          } else {
             processed[field + '_ids'] = value; // Store as array of IDs, e.g., tag_ids: [1, 2, 3]
             // For display, the frontend might need to fetch names or show IDs.
             // To make it more consistent, we can try to create a string representation if it's a known x2many field.
             // This part can be enhanced based on how x2many fields should be displayed/edited.
             processed[field] = `IDs: ${value.join(', ')}`; // Simple display for x2many IDs
          }
        }
      } else if (typeof value === 'number' && knownRelationalModels[field]) {
        const id = value;
        const modelInfo = knownRelationalModels[field];
        // Special handling for stage_id in project.task, as it might use 'project.task.type'
        let actualModelInfo = modelInfo;
        if (field === 'stage_id' && modelUsed === 'project.task') {
            // If you have a specific entry for project.task stages, use it.
            // For example, if you added 'stage_id_project_task': { model: 'project.task.type', nameField: 'name' }
            // actualModelInfo = knownRelationalModels['stage_id_project_task'] || modelInfo;
            // For now, we assume 'project.task.type' is the stage model for 'project.task'
            // This should be configured in knownRelationalModels if different from 'helpdesk.stage'
             actualModelInfo = { model: 'project.task.type', nameField: 'name' }; 
        }

        try {
          const relatedRecord = xmlrpcExecute(odooUrl, db, uid, password, actualModelInfo.model, 'read', [[id], [actualModelInfo.nameField]]);
          if (relatedRecord && relatedRecord.length > 0 && relatedRecord[0][actualModelInfo.nameField] !== undefined) {
            processed[field + '_id'] = id;
            processed[field] = relatedRecord[0][actualModelInfo.nameField];
            processed[field + '_display_name'] = relatedRecord[0][actualModelInfo.nameField];
          } else {
            processed[field + '_id'] = id;
            processed[field] = `ID: ${id} (Name not found for ${actualModelInfo.model})`;
            processed[field + '_display_name'] = `ID: ${id} (Name not found for ${actualModelInfo.model})`;
          }
        } catch (e) {
          logWarning(`Could not resolve name for field ${field} (ID: ${id}), model ${actualModelInfo.model}`, e);
          processed[field + '_id'] = id;
          processed[field] = `ID: ${id} (Error resolving name for ${actualModelInfo.model})`;
          processed[field + '_display_name'] = `ID: ${id} (Error resolving name for ${actualModelInfo.model})`;
        }
      }

      // 2. Format Date and Datetime Fields
      if (value && (typeof value === 'string' || typeof value === 'number') && (field.toLowerCase().includes('date') || field.toLowerCase().includes('time'))) {
        try {
          const dateObj = new Date(value);
          if (!isNaN(dateObj.getTime())) {
            if (field.toLowerCase().includes('datetime') || (typeof value === 'string' && value.includes(' '))) {
              processed[field] = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
            } else if (field.toLowerCase().includes('date')) {
              processed[field] = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
            }
            // Ensure custom date fields (not datetime) are YYYY-MM-DD for date inputs
            if (field.startsWith('x_') && field.toLowerCase().includes('date') && !field.toLowerCase().includes('datetime')) {
                processed[field] = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
            }
          }
        } catch (e) {
          logWarning(`Could not parse or format date for field ${field}: ${value}`, e);
        }
      }
    }
  }
  logDebug("Processed ticket fields:", processed);
  return processed;
}

// Nueva función para obtener detalles de un ticket para edición
function getOdooTicketDetails(searchData) {
  try {
    logInfo("Iniciando obtención de detalles de ticket para edición", searchData);

    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta");
    }

    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');

    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    logInfo("Autenticación exitosa para getOdooTicketDetails", { uid: uid });

    const ticketId = parseInt(searchData.ticketId);
    if (!ticketId || ticketId <= 0) {
      throw new Error("ID de ticket inválido");
    }

    const model = searchData.model;
    if (!model) {
      throw new Error("Modelo no especificado");
    }

    // Intentar leer todos los campos accesibles pasando una lista vacía para los campos.
    // Odoo 'read' con fields=[] debería devolver todos los campos accesibles del registro.
    const fieldsToGet = []; 
    logInfo(`Buscando todos los detalles del ticket en modelo ${model}`, { ticket_id: ticketId });

    const ticketDetailsArray = xmlrpcExecute(
      config.url,
      config.db,
      uid,
      password,
      model,
      'read', // Usar 'read' para obtener un solo registro con sus campos
      [[ticketId], fieldsToGet] // [[IDs], [campos a obtener]] - lista vacía para todos los campos
    );

    if (ticketDetailsArray && ticketDetailsArray.length > 0) {
      const foundTicket = ticketDetailsArray[0]; // 'read' devuelve un array con un objeto si se encuentra
      logInfo(`Detalles del ticket encontrados en modelo ${model}`, { 
        ticket_id: foundTicket.id,
        name: foundTicket.name,
        field_count: Object.keys(foundTicket).length
      });
      
      // Procesar campos relacionales para obtener IDs y nombres si es necesario, y formatear fechas
      const processedTicket = processTicketFields(config.url, config.db, uid, password, foundTicket, model);
      
      logInfo("Ticket procesado para edición", { processed_ticket_keys: Object.keys(processedTicket) });
      return { success: true, ticket: processedTicket, model: model };

    } else {
      logWarning(`No se encontraron detalles para el ticket ID ${ticketId} en modelo ${model}`);
      return { success: false, error: `No se encontraron detalles para el ticket ID ${ticketId} en modelo ${model}` };
    }

  } catch (error) {
    logError("Error al obtener detalles del ticket para edición", { error: error.toString(), searchData: searchData });
    return { success: false, error: error.message || error.toString() };
  }
}

// Función para obtener las etapas/estados de un modelo específico en Odoo
function getOdooStagesForModel(modelData) {
  try {
    logInfo("Iniciando obtención de etapas para modelo", modelData);
    const model = modelData.model;
    if (!model) {
      throw new Error("Modelo no especificado para obtener etapas.");
    }

    const config = getOdooConfig();
    if (!config.url || !config.db || !config.username || !config.password) {
      throw new Error("Configuración de Odoo incompleta.");
    }
    const props = PropertiesService.getScriptProperties();
    const password = props.getProperty('ODOO_PASSWORD');
    const uid = xmlrpcLogin(config.url, config.db, config.username, password);
    logInfo("Autenticación exitosa para getOdooStagesForModel", { uid: uid });

    let stageModel;
    let fieldsToFetch = ['id', 'name', 'sequence']; // Campos comunes

    switch (model) {
      case 'helpdesk.ticket':
        stageModel = 'helpdesk.stage';
        fieldsToFetch.push('fold'); // Campo específico de helpdesk.stage
        break;
      case 'project.task':
        stageModel = 'project.task.type'; // Modelo de etapas para tareas
        // project.task.type no tiene 'fold' por defecto, pero sí 'sequence'
        break;
      case 'crm.lead':
        stageModel = 'crm.stage';
        fieldsToFetch.push('fold'); // Campo específico de crm.stage
        break;
      default:
        throw new Error("Modelo no soportado para obtener etapas: " + model);
    }

    logInfo(`Buscando etapas en modelo ${stageModel} para ${model}`, { fields: fieldsToFetch });
    const stages = xmlrpcExecute(
      config.url,
      config.db,
      uid,
      password,
      stageModel,
      'search_read',
      [[], fieldsToFetch], // Sin dominio específico, orden por defecto (sequence)
      { order: 'sequence asc' } // Asegurar orden por secuencia
    );

    if (stages) {
      logInfo(`Etapas encontradas para ${model}`, { count: stages.length, stages: stages });
      return { success: true, stages: stages, model: model };
    } else {
      logWarning(`No se encontraron etapas para el modelo ${model} (usando ${stageModel})`);
      return { success: false, error: `No se encontraron etapas para ${model}`, stages: [] };
    }

  } catch (error) {
    logError("Error al obtener etapas de Odoo", { error: error.toString(), modelData: modelData });
    return { success: false, error: error.message || error.toString(), stages: [] };
  }
}

// Función para actualizar un ticket existente en Odoo
function updateOdooTicket(ticketId, ticketData) {
  const odooUrl = PropertiesService.getUserProperties().getProperty('ODOO_URL');
  const db = PropertiesService.getUserProperties().getProperty('ODOO_DB');
  // const uid = PropertiesService.getUserProperties().getProperty('ODOO_UID'); // Assuming UID is stored if not using session email
  const password = PropertiesService.getUserProperties().getProperty('ODOO_PASSWORD');
    // Use a fixed UID for Brandon Depetris (ID=14) for all ticket operations
  const uid = 14; // Brandon Depetris - Usuario asignado por defecto
  logInfo(`Using Brandon Depetris (UID: ${uid}) for ticket operations`);


  if (!ticketId || typeof ticketData !== 'object' || ticketData === null) {
    Logger.log('Error: Invalid ticketId or ticketData for update.');
    return { success: false, error: 'Invalid ticketId or ticketData.' };
  }

  const id = parseInt(ticketId, 10);
  if (isNaN(id)) {
    Logger.log('Error: ticketId must be an integer.');
    return { success: false, error: 'Ticket ID must be an integer.' };
  }

  let processedValues = {};
  for (const key in ticketData) {
    if (ticketData.hasOwnProperty(key)) {
      let value = ticketData[key];

      if (key === 'id' || key === 'display_name') { // Read-only fields, skip
        continue;
      }

      // Handle empty strings, null, or undefined
      if (value === "" || value === null || value === undefined) {
        // For most fields, empty/null/undefined means 'unset', which is 'false' in Odoo.
        // Exception: Custom char/text fields (not relational, not date) might allow an empty string.
        if (value === "" && key.startsWith("x_") && !key.endsWith("_id") && !key.endsWith("_ids") && !key.toLowerCase().includes("date")) {
          processedValues[key] = "";
        } else {
          processedValues[key] = false;
        }
        continue;
      }

      // Date and Datetime fields
      if (key.toLowerCase().includes('date')) {
        try {
          const d = new Date(value); // `value` could be 'YYYY-MM-DD' or a parsable date string
          if (isNaN(d.getTime())) { // Invalid date
            Logger.log(`Invalid date value for field ${key}: ${value}. Setting to false.`);
            processedValues[key] = false;
          } else {
            // If 'datetime' or 'time' in key, format with time. Otherwise, date only.
            if (key.toLowerCase().includes('datetime') || key.toLowerCase().includes('time')) {
              processedValues[key] = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
            } else {
              processedValues[key] = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
            }
          }
        } catch (e) {
          Logger.log(`Could not parse date for field ${key}: ${value}. Error: ${e}. Setting to false.`);
          processedValues[key] = false;
        }
        continue;
      }

      // Relational Many2one fields (e.g., user_id, x_custom_relation_id)
      if (key.endsWith("_id")) {
        const intValue = parseInt(value, 10);
        // If value is not a valid integer, set to false (unset).
        // Odoo expects an integer ID or false.
        processedValues[key] = !isNaN(intValue) ? intValue : false;
        continue;
      }
      
      // Relational Many2many or One2many fields (e.g., tag_ids, x_custom_m2m_ids)
      if (key.endsWith("_ids")) {
        if (Array.isArray(value)) {
          // Filter out non-numeric IDs and convert valid ones to integers
          const idValues = value.map(val => parseInt(val, 10)).filter(val => !isNaN(val));
          // Use Odoo's command (6, 0, [IDs]) to replace all existing relations with the new set.
          // This works for setting or clearing (if idValues is empty).
          processedValues[key] = [[6, 0, idValues]];
        } else {
          Logger.log(`Invalid value for M2M/O2M field ${key} (not an array): ${value}. Setting to false.`);
          processedValues[key] = false; // Or potentially [[6, 0, []]] to attempt clearing
        }
        continue;
      }

      // Boolean fields (if sent as strings "true"/"false" from frontend)
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') {
          processedValues[key] = true;
        } else if (value.toLowerCase() === 'false') {
          processedValues[key] = false;
        } else {
          // If it's a string that looks like a number, parse it.
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue.toString() === value.trim()) { // Check if it was cleanly a number
            processedValues[key] = numValue;
          } else {
            processedValues[key] = value; // Otherwise, keep as string
          }
        }
      } else { 
        // Value is already a boolean, number, or other type (e.g. array for M2M if not caught by _ids)
        // This path should ideally only receive numbers or booleans if not string.
        processedValues[key] = value;
      }
    }
  }

  if (Object.keys(processedValues).length === 0) {
    Logger.log('No valid data to update for ticket ID: ' + ticketId);
    return { success: true, message: 'No data to update (all fields were empty or invalid).', noOperation: true };
  }

  Logger.log(`Updating Odoo ticket ID: ${id} with data: ${JSON.stringify(processedValues)} for model helpdesk.ticket`);

  const payload = XmlService.createElement('methodCall')
    .addContent(XmlService.createElement('methodName').setText('execute_kw'))
    .addContent(XmlService.createElement('params')
      .addContent(XmlService.createElement('param').addContent(XmlService.createElement('value').addContent(XmlService.createElement('string').setText(db))))
      .addContent(XmlService.createElement('param').addContent(XmlService.createElement('value').addContent(XmlService.createElement('int').setText(uid.toString()))))
      .addContent(XmlService.createElement('param').addContent(XmlService.createElement('value').addContent(XmlService.createElement('string').setText(password))))
      .addContent(XmlService.createElement('param').addContent(XmlService.createElement('value').addContent(XmlService.createElement('string').setText('helpdesk.ticket')))) // Model
      .addContent(XmlService.createElement('param').addContent(XmlService.createElement('value').addContent(XmlService.createElement('string').setText('write'))))      // Method
      .addContent(XmlService.createElement('param').addContent(XmlService.createElement('value').addContent(
        XmlService.createElement('array').addContent(XmlService.createElement('data')
          .addContent(XmlService.createElement('value').addContent( // First element of array: list of IDs to write to
            XmlService.createElement('array').addContent(XmlService.createElement('data')
              .addContent(XmlService.createElement('value').addContent(XmlService.createElement('int').setText(id.toString())))
            )
          ))
          .addContent(XmlService.createElement('value').addContent(jsonToXml(processedValues))) // Second element: dictionary of values
        )
      )))
    );

  const xmlRequest = XmlService.getRawFormat().format(payload);
  const options = {
    'method': 'post',
    'contentType': 'text/xml',
    'payload': xmlRequest,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(odooUrl + '/xmlrpc/2/object', options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const xmlDoc = XmlService.parse(responseBody);
      const root = xmlDoc.getRootElement();
      
      // Check for fault
      const fault = root.getChild('fault');
      if (fault) {
        const faultStruct = fault.getChild('value').getChild('struct');
        let faultString = "Odoo Error: ";
        faultStruct.getChildren('member').forEach(member => {
          const name = member.getChild('name').getText();
          const value = member.getChild('value').getText(); // Simplified, might need deeper parsing for complex fault values
          faultString += `${name}: ${value}; `;
        });
        Logger.log('Odoo update fault: ' + faultString + ' | Payload: ' + JSON.stringify(processedValues));
        return { success: false, error: faultString };
      }

      // Successful update typically returns true (boolean 1)
      const params = root.getChild('params');
      if (params) {
        const param = params.getChild('param');
        if (param) {
          const value = param.getChild('value');
          if (value && value.getChild('boolean') && value.getChild('boolean').getText() === '1') {
            Logger.log('Successfully updated ticket ID: ' + id);
            // After successful update, fetch the updated ticket details to return to the client
            // This ensures the client gets the most current state, including any server-side changes or computed fields.
            // Pass an empty array to get all accessible fields.
            return getOdooTicketDetails({ ticketId: id.toString(), fieldsToGet: [] });
          }
        }
      }
      Logger.log('Odoo update response not definitively successful: ' + responseBody + ' | Payload: ' + JSON.stringify(processedValues));
      return { success: false, error: 'Odoo update did not return success: ' + responseBody };

    } else {
      Logger.log('Error updating Odoo ticket: HTTP ' + responseCode + ' - ' + responseBody + ' | Payload: ' + JSON.stringify(processedValues));
      return { success: false, error: 'Server error: HTTP ' + responseCode + ' - ' + responseBody };
    }
  } catch (e) {
    Logger.log('Exception during Odoo ticket update: ' + e.toString() + ' | Payload: ' + JSON.stringify(processedValues));
    return { success: false, error: 'Exception: ' + e.toString() };
  }
}

// Helper function to convert a JavaScript value to its XML-RPC <value> element
function _convertValueToXmlElement(val) {
  const valueElement = XmlService.createElement('value');
  if (typeof val === 'string') {
    valueElement.addContent(XmlService.createElement('string').setText(val));
  } else if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      valueElement.addContent(XmlService.createElement('int').setText(val.toString()));
    } else {
      valueElement.addContent(XmlService.createElement('double').setText(val.toString()));
    }
  } else if (typeof val === 'boolean') {
    valueElement.addContent(XmlService.createElement('boolean').setText(val ? '1' : '0'));
  } else if (val === null || val === undefined) {
    // Odoo generally expects boolean false for unsetting fields.
    // The data preparation logic in updateOdooTicket should ideally convert null/undefined to boolean `false`.
    valueElement.addContent(XmlService.createElement('boolean').setText('0'));
  } else if (Array.isArray(val)) {
    const arrayDataElement = XmlService.createElement('array').addContent(XmlService.createElement('data'));
    val.forEach(item => {
      arrayDataElement.getChild('data').addContent(_convertValueToXmlElement(item)); // Recursive call for items
    });
    valueElement.addContent(arrayDataElement);
  } else if (typeof val === 'object' && val !== null) {
    // This assumes `val` is an object that should become a <struct>.
    valueElement.addContent(jsonToXml(val)); // Recursive call for nested objects (structs)
  } else {
    // Fallback for other types. If `val` is literally `false` (boolean), it's already handled.
    Logger.log("Warning: Unknown type in _convertValueToXmlElement: " + typeof val + " for value: " + val + ". Converting to string.");
    valueElement.addContent(XmlService.createElement('string').setText(String(val)));
  }
  return valueElement;
}

// Helper function to convert JSON object to XML for Odoo
function jsonToXml(obj) {
  const struct = XmlService.createElement('struct');
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const member = XmlService.createElement('member');
      member.addContent(XmlService.createElement('name').setText(key));
      member.addContent(_convertValueToXmlElement(obj[key])); // Use the helper for the value
      struct.addContent(member);
    }
  }
  return struct;
}

/**
 * Fetches and logs all available fields and processed information for a specific Odoo ticket.
 * This is primarily a utility/debug function to display all information associated with a ticket.
 *
 * @param {string} ticketId The ID of the ticket to fetch.
 * @param {string} modelName The Odoo model of the ticket (e.g., 'helpdesk.ticket', 'project.task').
 * @return {object} An object containing the success status and either the processed ticket data or an error message.
 */
function viewAllTicketFields(ticketId, modelName) {
  logInfo(`Attempting to view all fields for ticket ID: ${ticketId}, Model: ${modelName}`);

  if (!ticketId || !modelName) {
    const errorMsg = "Ticket ID and Model Name are required for viewAllTicketFields.";
    logError(errorMsg);
    return { success: false, error: errorMsg, ticket: null, model: modelName };
  }

  const searchParameters = {
    ticketId: String(ticketId), // Ensure ticketId is a string
    model: modelName
    // fieldsToGet is implicitly an empty array in getOdooTicketDetails, meaning all fields
  };

  try {
    const result = getOdooTicketDetails(searchParameters);

    if (result.success && result.ticket) {
      logInfo(`Successfully fetched all fields for ticket ID: ${ticketId}, Model: ${modelName}. Displaying details below.`);
      
      Logger.log(`---------------- DETAILED TICKET INFORMATION (ID: ${ticketId}, Model: ${modelName}) ----------------`);
      const ticketData = result.ticket;
      for (const field in ticketData) {
        if (ticketData.hasOwnProperty(field)) {
          let valueToLog = ticketData[field];
          if (typeof valueToLog === 'object' && valueToLog !== null) {
            try {
              valueToLog = JSON.stringify(valueToLog);
            } catch (e) {
              valueToLog = `[Object: ${Object.prototype.toString.call(valueToLog)}]`;
            }
          } else if (valueToLog === undefined) {
            valueToLog = "[undefined]";
          } else if (valueToLog === null) {
            valueToLog = "[null]";
          }
          Logger.log(`  ${field}: ${valueToLog}`);
        }
      }
      Logger.log("------------------------------------------------------------------------------------");
      
      return result; 
    } else {
      const errorDetail = result.error || "Unknown error occurred while fetching ticket details.";
      logError(`Failed to fetch details for ticket ID: ${ticketId}, Model: ${modelName}. Error: ${errorDetail}`);
      Logger.log(`Error fetching ticket ${ticketId} (${modelName}): ${errorDetail}`);
      return { success: false, error: errorDetail, ticket: null, model: modelName };
    }
  } catch (e) {
    const exceptionMsg = `Exception in viewAllTicketFields for ticket ID ${ticketId} (${modelName}): ${e.toString()}`;
    logError(exceptionMsg, { stack: e.stack });
    Logger.log(exceptionMsg + (e.stack ? `\nStack: ${e.stack}` : ''));
    return { success: false, error: exceptionMsg, ticket: null, model: modelName, exceptionDetail: e.toString() };
  }
}

// Example of how to call this function from the Apps Script editor for testing
function testViewAllTicketFields() {
  // --- Configuration ---
  // IMPORTANT: Ensure your Odoo connection details are correctly set in Script Properties.
  // (File > Project properties > Script properties)
  // Example properties needed: ODOO_URL, ODOO_DB, ODOO_USER, ODOO_PASSWORD

  const exampleTicketId = "1"; // !!! REPLACE with a REAL Ticket ID from your Odoo instance !!!
  const exampleModel = "helpdesk.ticket"; // !!! REPLACE with the correct MODEL if different (e.g., 'project.task') !!!

  logInfo(`Starting testViewAllTicketFields for Ticket ID: ${exampleTicketId}, Model: ${exampleModel}`);
  
  const config = getOdooConfig(); 
  if (!config.url || !config.db || !config.username || config.password === "") {
    Logger.log("WARNING: Odoo configuration might be missing or incomplete in Script Properties. Please verify.");
  } else {
    logInfo("Odoo configuration seems present (URL, DB, User). Password status: " + config.password);
  }

  const result = viewAllTicketFields(exampleTicketId, exampleModel);

  if (result && result.success) {
    Logger.log(`SUCCESS: viewAllTicketFields returned ticket data for ID ${exampleTicketId}. Details are logged above.`);
  } else {
    Logger.log(`FAILURE: viewAllTicketFields failed for Ticket ID ${exampleTicketId}.`);
    Logger.log("Error details: " + (result && result.error ? result.error : "No error message provided."));
    if (result && result.exceptionDetail) {
      Logger.log("Exception: " + result.exceptionDetail);
    }
  }
  logInfo("Finished testViewAllTicketFields.");
}