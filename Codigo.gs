/**
 * CONFIGURACIÓN - ¡IMPORTANTE!
 * Guarda tus credenciales de Odoo de forma segura usando las Propiedades del Script.
 * Ve a Archivo > Propiedades del proyecto > Propiedades del script.
 * Añade las siguientes claves y sus valores correspondientes:
 * ODOO_URL       -> La URL base de tu instancia Odoo (ej: https://tu_dominio.odoo.com)
 * ODOO_DB        -> El nombre de tu base de datos Odoo
 * ODOO_USER      -> El nombre de usuario (login) o email para la API
 * ODOO_PASSWORD  -> La contraseña o Clave API (API Key) del usuario
 */

// Función principal que se ejecuta cuando accedes a la URL del Web App
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Crear Tarea en Odoo (Apps Script)');
      // .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // Descomentar si hay problemas embebiendo
}

// Función llamada desde el JavaScript del cliente para crear la tarea
function addOdooTask(taskData) {
  try {
    const props = PropertiesService.getScriptProperties();
    const odooUrl = props.getProperty('ODOO_URL');
    const odooDb = props.getProperty('ODOO_DB');
    const odooUser = props.getProperty('ODOO_USER');
    const odooPassword = props.getProperty('ODOO_PASSWORD');

    if (!odooUrl || !odooDb || !odooUser || !odooPassword) {
      throw new Error("Faltan propiedades del script para la configuración de Odoo.");
    }

    // 1. Autenticar y obtener UID
    const uid = authenticateOdoo(odooUrl, odooDb, odooUser, odooPassword);
    if (!uid) {
      throw new Error("Fallo en la autenticación con Odoo.");
    }
    Logger.log("Autenticación exitosa. UID: " + uid);

    // 2. Preparar datos para Odoo (nombres técnicos)
    const odooTaskData = {
      'name': taskData.name,
      'project_id': taskData.project_id, // Asegúrate que sea un entero
    };
    if (taskData.description) {
      odooTaskData['description'] = taskData.description;
    }
    if (taskData.user_id) {
      // Formato especial para campos Many2many como user_ids (Asignados)
      // Si tu campo es Many2one (user_id), sería solo: odooTaskData['user_id'] = taskData.user_id;
      odooTaskData['user_ids'] = [[6, 0, [taskData.user_id]]];
    }
     if (taskData.deadline) {
      odooTaskData['date_deadline'] = taskData.deadline; // Formato YYYY-MM-DD
    }

    // 3. Crear la tarea usando execute_kw
    const taskId = executeOdooKw(odooUrl, odooDb, uid, odooPassword, 'project.task', 'create', [odooTaskData]);

    Logger.log("Tarea creada con éxito. ID: " + taskId);
    return { success: true, task_id: taskId };

  } catch (error) {
    Logger.log("Error al crear tarea: " + error.message + "\nStack: " + error.stack);
    // Devuelve el mensaje de error al cliente
    return { success: false, error: error.message };
  }
}

// --- FUNCIONES AUXILIARES PARA XML-RPC ---

/**
 * Autentica en Odoo y devuelve el User ID (uid).
 */
function authenticateOdoo(url, db, user, password) {
  const endpoint = url + '/xmlrpc/2/common';
  const payload = `
    <methodCall>
      <methodName>authenticate</methodName>
      <params>
        <param><value><string>${db}</string></value></param>
        <param><value><string>${user}</string></value></param>
        <param><value><string>${password}</string></value></param>
        <param><value><struct></struct></value></param>
      </params>
    </methodCall>`;

  const options = {
    'method': 'post',
    'contentType': 'text/xml',
    'payload': payload,
    'muteHttpExceptions': true // Para poder manejar errores nosotros mismos
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode !== 200) {
    throw new Error(`Error de autenticación (${responseCode}): ${responseBody}`);
  }

  // Parsear la respuesta XML para obtener el UID
  try {
    const xmlDoc = XmlService.parse(responseBody);
    const root = xmlDoc.getRootElement();
    // Navegar por la estructura XML para encontrar el <int> o <i4> con el UID
    const valueElement = root.getChild('params').getChild('param').getChild('value');
    const uidElement = valueElement.getChild('int') || valueElement.getChild('i4'); // Odoo puede usar int o i4
    if (!uidElement || uidElement.getText() === 'false' || parseInt(uidElement.getText()) === 0) {
       throw new Error("Autenticación fallida, Odoo devolvió un UID inválido o cero.");
    }
    return parseInt(uidElement.getText());
  } catch (e) {
    Logger.log("Error parseando XML de autenticación: " + e + "\nResponse: " + responseBody);
    throw new Error("Error al procesar la respuesta de autenticación de Odoo.");
  }
}

/**
 * Ejecuta un método (como 'create', 'search_read', 'write') en un modelo de Odoo.
 */
function executeOdooKw(url, db, uid, password, model, method, args, kwargs) {
  const endpoint = url + '/xmlrpc/2/object';
  kwargs = kwargs || {}; // Opcional: argumentos por palabra clave

  // Construir el payload XML para execute_kw es complejo, especialmente los 'args'
  // args es una lista que contiene los argumentos posicionales.
  // Para 'create', args suele ser una lista con UN elemento: el diccionario de datos.
  // Para 'write', args suele ser una lista con DOS elementos: la lista de IDs y el diccionario de datos.
  const argsXml = convertJsToXmlRpc(args);
  const kwargsXml = convertJsToXmlRpc(kwargs); // Convertir kwargs si se usan

  const payload = `
    <methodCall>
      <methodName>execute_kw</methodName>
      <params>
        <param><value><string>${db}</string></value></param>
        <param><value><int>${uid}</int></value></param>
        <param><value><string>${password}</string></value></param>
        <param><value><string>${model}</string></value></param>
        <param><value><string>${method}</string></value></param>
        <param><value>${argsXml}</value></param>
        ${Object.keys(kwargs).length > 0 ? `<param><value>${kwargsXml}</value></param>` : ''}
      </params>
    </methodCall>`;

   const options = {
    'method': 'post',
    'contentType': 'text/xml',
    'payload': payload,
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if (responseCode !== 200) {
     // Intentar parsear el error si es un Fault XML-RPC
     try {
        const xmlDoc = XmlService.parse(responseBody);
        const faultString = xmlDoc.getRootElement().getChild('fault').getChild('value').getChild('struct')
                              .getChildren('member').find(m => m.getChild('name').getText() === 'faultString')
                              .getChild('value').getChild('string').getText();
        throw new Error(`Error de Odoo RPC: ${faultString}`);
     } catch(e) {
        // Si no es un fault XML o falla el parseo, mostrar error genérico
        throw new Error(`Error en execute_kw (${responseCode}): ${responseBody.substring(0, 500)}`); // Limitar longitud del mensaje
     }
  }

  // Parsear la respuesta XML para obtener el resultado (ej: el ID creado)
   try {
    const xmlDoc = XmlService.parse(responseBody);
    const root = xmlDoc.getRootElement();
    const valueElement = root.getChild('params').getChild('param').getChild('value');
    // El tipo de retorno varía (int para create, boolean para write, array para search_read)
    // Asumimos 'create' que devuelve un <int> o <i4>
    const resultElement = valueElement.getChild('int') || valueElement.getChild('i4');
     if (resultElement) {
        return parseInt(resultElement.getText());
     }
     // Podrías añadir lógica para parsear otros tipos de respuesta si es necesario
     Logger.log("Respuesta de execute_kw (no es int): " + valueElement.getValue());
     // Si no es un entero, podría ser un booleano (ej: write exitoso) u otra cosa.
     // Para 'create', esperamos un ID. Si no lo es, algo fue mal o la respuesta es inesperada.
      if (valueElement.getChild('boolean')) { // ej., write devuelve boolean
          return valueElement.getChild('boolean').getText() === '1';
      }
      // Añadir más parseo si es necesario (arrays, structs, etc.)
      throw new Error("Respuesta inesperada de Odoo execute_kw (no se encontró ID entero).");

  } catch (e) {
    Logger.log("Error parseando XML de execute_kw: " + e + "\nResponse: " + responseBody);
    throw new Error("Error al procesar la respuesta de execute_kw de Odoo.");
  }
}


/**
 * Convierte un valor/objeto JavaScript a su representación XML-RPC <value>.
 * ¡Esta es una versión SIMPLIFICADA! Puede necesitar mejoras para casos complejos.
 */
function convertJsToXmlRpc(jsValue) {
  let xml = '';
  const type = typeof jsValue;

  if (jsValue === null || jsValue === undefined) {
     xml = '<nil/>'; // Odoo a menudo usa <boolean>0</boolean> para False/null
     // xml = '<boolean>0</boolean>'; // Alternativa más común con Odoo
  } else if (type === 'string') {
    xml = `<string>${escapeXml(jsValue)}</string>`;
  } else if (type === 'number') {
    if (Number.isInteger(jsValue)) {
      xml = `<int>${jsValue}</int>`; // O podría ser <i4>
    } else {
      xml = `<double>${jsValue}</double>`;
    }
  } else if (type === 'boolean') {
    xml = `<boolean>${jsValue ? '1' : '0'}</boolean>`;
  } else if (Array.isArray(jsValue)) {
    xml = '<array><data>';
    jsValue.forEach(item => {
      xml += `<value>${convertJsToXmlRpc(item)}</value>`;
    });
    xml += '</data></array>';
  } else if (type === 'object' && jsValue !== null && jsValue.constructor === Object) {
    xml = '<struct>';
    for (const key in jsValue) {
      if (jsValue.hasOwnProperty(key)) {
        xml += '<member>';
        xml += `<name>${escapeXml(key)}</name>`;
        xml += `<value>${convertJsToXmlRpc(jsValue[key])}</value>`;
        xml += '</member>';
      }
    }
    xml += '</struct>';
  } else {
     Logger.log("Tipo no soportado para conversión XML-RPC: " + type);
     // Por defecto, tratar como string, aunque puede fallar
     xml = `<string>${escapeXml(String(jsValue))}</string>`;
  }
  return xml;
}

/**
 * Escapa caracteres especiales para XML.
 */
function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}
