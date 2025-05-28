# OdooTest - Cliente Google Apps Script para Odoo

Una aplicación web desarrollada en Google Apps Script que conecta con Odoo ERP para crear tareas, leads y tickets de soporte.

## 🚀 Funcionalidades

### ✅ Gestión de Tareas
- Crear tareas en proyectos de Odoo
- Asignar usuarios responsables
- Establecer fechas límite
- Añadir descripciones detalladas

### ✅ Gestión de Leads (CRM)
- Crear leads/oportunidades de ventas
- Capturar información completa del contacto
- Asignar comerciales responsables
- Integración con módulo CRM de Odoo

### ✅ Gestión de Tickets de Soporte
- **Sistema inteligente de tickets** que funciona con múltiples modelos de Odoo:
  - `helpdesk.ticket` (preferido)
  - `project.task` (respaldo)
  - `crm.lead` (último recurso)
- **Carga dinámica de datos** desde Odoo:
  - Usuarios técnicos activos
  - Tipos de ticket
  - Equipos de soporte
  - Estados/Etapas de ticket
  - Clientes/Partners
- **Auto-llenado inteligente** de datos del cliente
- **Archivos adjuntos**:
  - Soporte para múltiples archivos (máximo 10MB por archivo)
  - Formatos permitidos: PDF, DOC, DOCX, TXT, imágenes (JPG, PNG, GIF), ZIP, RAR
  - Vista previa en tiempo real con iconos por tipo de archivo
  - Eliminación individual de archivos antes del envío
  - Integración automática con el modelo `ir.attachment` de Odoo
- **Validación de campos** y manejo de errores robusto
- **Sistema de respaldo** con valores predefinidos si los modelos no están disponibles

### ✅ Lectura y Búsqueda de Tickets
- **Búsqueda por ID** en múltiples modelos de Odoo
- **Detección automática** del modelo donde se encuentra el ticket
- **Búsqueda específica** en modelos individuales:
  - `helpdesk.ticket`
  - `project.task` 
  - `crm.lead`
- **Visualización completa** de información del ticket:
  - Datos básicos (ID, título, estado, prioridad)
  - Información de asignación (técnico, equipo, proyecto)
  - Datos del cliente (nombre, email, teléfono)
  - Fechas importantes (creación, modificación, límite)
  - Descripción completa con formato
  - Información específica por modelo (probabilidad, ingresos para leads)
- **Procesamiento inteligente** de campos relacionales (Many2one)
- **Formateo de fechas** localizadas
- **Iconos de prioridad** visuales para fácil identificación

### ✅ Panel de Diagnóstico
- Configuración de conexión a Odoo
- Pruebas de conectividad
- Información de versión del sistema
- Logs detallados con diferentes niveles
- Interfaz para gestión de configuración

## 🔧 Configuración

### Requisitos
- Instancia de Odoo (versión 13+)
- Cuenta de Google con acceso a Google Apps Script
- Credenciales de Odoo (usuario/contraseña o API Key)

### Instalación
1. Crear un nuevo proyecto en Google Apps Script
2. Copiar el contenido de `Codigo.gs` al editor de código
3. Crear un archivo HTML llamado `Index` y copiar el contenido de `Index.html`
4. Configurar las credenciales de Odoo en el panel de diagnóstico

### Configuración de Odoo
```
URL: https://tu-instancia.odoo.com
Base de datos: nombre_de_tu_bd
Usuario: tu_usuario@empresa.com
Contraseña: tu_contraseña_o_api_key
```

## 📖 Guía de Uso

### Buscar y Leer Tickets
1. **Navegar a la pestaña "Leer Tickets"**
2. **Introducir el ID del ticket** que deseas buscar
3. **Seleccionar el modelo de búsqueda**:
   - **Detección Automática**: Busca en todos los modelos (recomendado)
   - **helpdesk.ticket**: Búsqueda específica en tickets de helpdesk
   - **project.task**: Búsqueda específica en tareas de proyecto
   - **crm.lead**: Búsqueda específica en leads/oportunidades
4. **Hacer clic en "Buscar Ticket"**
5. **Revisar la información completa** del ticket encontrado

### Información Mostrada
La búsqueda exitosa mostrará:
- **Información básica**: ID, título, modelo utilizado, prioridad con iconos
- **Estado del ticket**: Etapa actual y estado kanban (si aplica)
- **Asignación**: Técnico asignado, equipo responsable, proyecto relacionado
- **Datos del cliente**: Nombre, email, teléfono de contacto
- **Fechas importantes**: Creación, última modificación, fecha límite
- **Descripción completa**: Contenido formateado del ticket
- **Información específica**: Datos adicionales según el tipo de modelo

## 🎨 Características Técnicas

### Backend (Google Apps Script)
- **Protocolo XML-RPC** para comunicación con Odoo
- **Sistema de logging** con múltiples niveles (DEBUG, INFO, WARNING, ERROR)
- **Manejo de errores robusto** con fallbacks automáticos
- **Detección automática de modelos** disponibles en Odoo
- **Validación de datos** antes del envío

### Frontend (HTML/CSS/JavaScript)
- **Interfaz moderna** con diseño responsivo
- **Navegación por pestañas** intuitiva
- **Indicadores de carga** en tiempo real
- **Validación de formularios** del lado cliente
- **Mensajes de éxito/error** informativos
- **Auto-llenado de campos** relacionados

### Funcionalidades de Tickets Avanzadas

#### 🔄 Carga Dinámica de Datos
- **Usuarios**: Obtiene lista de usuarios internos activos
- **Tipos de ticket**: Busca en `helpdesk.ticket.type` o usa valores predefinidos
- **Equipos**: Busca en `helpdesk.team` o usa equipos predefinidos
- **Estados**: Busca en `helpdesk.stage`, luego `project.task.type`, o usa estados predefinidos
- **Clientes**: Obtiene partners/empresas con ranking de cliente

#### 📊 Estados de Ticket
El sistema maneja estados/etapas de ticket con múltiples fallbacks:

1. **`helpdesk.stage`** (preferido): Estados específicos de helpdesk con secuencia
2. **`project.task.type`** (respaldo): Tipos de tarea como estados
3. **Estados predefinidos** (último recurso):
   - Nuevo
   - En Progreso  
   - Pendiente
   - Resuelto
   - Cerrado

Los estados se ordenan automáticamente por secuencia y incluyen información sobre si el estado cierra el ticket.

#### 🤖 Auto-llenado Inteligente
- Al seleccionar un cliente existente, se auto-llenan email y teléfono
- Limpia campos manuales cuando se selecciona cliente existente
- Mantiene consistencia de datos

#### ⚡ Sistema de Respaldo
- Si `helpdesk.ticket` no existe, intenta `project.task`
- Si `project.task` falla, usa `crm.lead` como último recurso
- Valores predefinidos si los modelos especializados no están disponibles

#### 🔍 Botón de Recarga Manual
- Permite recargar datos dinámicos sin refrescar la página
- Útil para recuperarse de errores de red o timeouts
- Feedback visual durante la carga

## 📊 Logging y Depuración

### Niveles de Log
- **DEBUG**: Información detallada para desarrollo
- **INFO**: Operaciones normales y exitosas
- **WARNING**: Situaciones que requieren atención pero no detienen la operación
- **ERROR**: Errores que impiden completar la operación

### Funciones de Diagnóstico
- `testConnection()`: Verifica conectividad con Odoo
- `getOdooSystemInfo()`: Obtiene información de versión
- `getLogs()`: Recupera logs del sistema
- `clearLogs()`: Limpia logs almacenados

## 🛠️ Estructura del Código

### Archivos Principales
- `Codigo.gs`: Lógica del servidor (Google Apps Script)
- `Index.html`: Interfaz de usuario (HTML/CSS/JS)
- `appsscript.json`: Configuración del proyecto

### Funciones Principales del Backend
- `addOdooTask()`: Creación de tareas
- `addOdooLead()`: Creación de leads
- `addOdooTicket()`: Creación de tickets con búsqueda automática de cliente, tipo y equipo fijos, formato HTML
- `processTicketAttachments()`: Procesamiento y subida de archivos adjuntos a Odoo
- `getOdooUsersForForm()`: Obtener usuarios técnicos para formularios
- `readOdooTicket()`: Búsqueda y lectura de tickets en múltiples modelos
- `processTicketFields()`: Procesamiento de campos relacionales de tickets
- `formatOdooDate()`: Formateo de fechas de Odoo

## 📎 Sistema de Archivos Adjuntos

### Características
- **Múltiples archivos**: Hasta 10 archivos por ticket
- **Tamaño máximo**: 10MB por archivo
- **Formatos soportados**:
  - Documentos: PDF, DOC, DOCX, TXT
  - Imágenes: JPG, JPEG, PNG, GIF
  - Comprimidos: ZIP, RAR
- **Vista previa en tiempo real**: Iconos por tipo de archivo y tamaños formateados
- **Eliminación individual**: Remover archivos antes del envío
- **Validación automática**: Verificación de tipo y tamaño

### Proceso de Subida
1. **Selección**: El usuario selecciona archivos desde el formulario
2. **Validación**: Se verifican tipos y tamaños permitidos
3. **Conversión**: Los archivos se convierten a base64 para transmisión
4. **Envío**: Los archivos se suben junto con los datos del ticket
5. **Almacenamiento**: Se crean registros en `ir.attachment` de Odoo vinculados al ticket

### Funciones Frontend
- `setupAttachmentHandling()`: Inicializa el manejo de archivos
- `handleFileSelection()`: Procesa archivos seleccionados
- `updateAttachmentPreview()`: Actualiza la vista previa
- `prepareAttachmentsForUpload()`: Convierte archivos a base64
- `removeAttachment()`: Elimina archivos individuales

### Funciones Backend
- `processTicketAttachments()`: Crea adjuntos en Odoo usando el modelo `ir.attachment`

## 🔒 Seguridad

- Las contraseñas se almacenan usando `PropertiesService` de Google Apps Script
- No se muestran credenciales en la interfaz
- Validación de entrada en cliente y servidor
- Manejo seguro de errores sin exponer información sensible

## 📈 Próximas Mejoras

- [ ] Soporte para edición de tickets existentes
- [ ] Notificaciones por email automáticas
- [ ] Dashboard con estadísticas de tickets
- [ ] Integración con calendarios para tareas
- [ ] Soporte para comentarios/seguimiento en tickets
- [ ] Filtros avanzados en listas desplegables
- [ ] Búsqueda de clientes por texto
- [ ] Templates de tickets predefinidos
- [ ] Notificaciones por email
- [ ] Dashboard de estadísticas

## 🐛 Solución de Problemas

### Error de Conexión
1. Verificar URL, base de datos y credenciales
2. Comprobar que el módulo necesario esté instalado en Odoo
3. Revisar logs en el panel de diagnóstico

### Dropdowns Vacíos
1. Usar el botón "Recargar Datos"
2. Verificar permisos del usuario en Odoo
3. Comprobar que los modelos existan en la instalación

### Ticket No Se Crea
- El sistema intentará automáticamente con diferentes modelos
- Revisar logs para ver qué modelo se utilizó
- Verificar configuración de campos obligatorios en Odoo

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades:
1. Revisar los logs en el panel de diagnóstico
2. Verificar la configuración de conexión
3. Comprobar que todos los módulos necesarios estén instalados en Odoo

---

**Desarrollado con ❤️ para integración con Odoo ERP**

## 🎫 Creación de Tickets Mejorada

### Configuración Automática
El sistema ahora maneja automáticamente:
- **Tipo de ticket**: Se asigna automáticamente "IngresoReparacionesDJI"
- **Equipo de soporte**: Se asigna automáticamente "Team GarantíasDJI"
- **Búsqueda de cliente**: Búsqueda automática por nombre usando operador `ilike`
- **Formato HTML**: Conversión automática de URLs a enlaces y saltos de línea a `<br>`

### Campos del Formulario Simplificado
- **Título del ticket** (requerido)
- **Prioridad**: Baja, Normal, Alta, Urgente
- **Descripción**: Formateada automáticamente en HTML
- **Técnico asignado** (opcional): Lista cargada dinámicamente desde Odoo
- **Nombre del cliente**: Búsqueda automática en base de datos
- **Email y teléfono del cliente**: Campos opcionales para información adicional
- **Categoría manual**: Campo opcional para clasificación adicional

### Proceso de Creación
1. El sistema busca automáticamente el tipo "IngresoReparacionesDJI"
2. Se busca el equipo "Team GarantíasDJI" 
3. Si se proporciona nombre de cliente, se busca automáticamente en res.partner
4. La descripción se formatea en HTML con enlaces automáticos
5. Se incluye información del cliente en la descripción
6. El ticket se crea usando fallbacks (helpdesk.ticket → project.task → crm.lead)
