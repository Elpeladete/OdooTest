function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function createTaskInOdoo(data) {
  const url = 'https://test-dye.quilsoft.com/jsonrpc';
  const apiKey = '307529c39bf0de8e607ccbb3c059eb9a7cc22201';
  const dbName = 'dye_test_0201'; // Reemplaza con el nombre de tu base de datos
  const userId = 2; // Reemplaza con el ID del usuario
  const userPassword = '9911'; // Reemplaza con la contraseña del usuario

  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute',
      args: [
        dbName,
        userId,
        userPassword,
        'project.task',
        'create',
        {
          name: data.name,
          description: data.description,
          project_id: parseInt(data.project_id),
          user_id: parseInt(data.user_id),
        },
      ],
    },
    id: 1,
  };

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.error) {
      throw new Error(`Error en Odoo: ${JSON.stringify(result.error)}`);
    }

    return `Tarea creada exitosamente. ID: ${result.result}`;
  } catch (error) {
    throw new Error(`Error al crear la tarea: ${error.message}`);
  }
}
