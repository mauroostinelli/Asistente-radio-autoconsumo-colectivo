/**
 * @OnlyCurrentDoc // Recomendado para mejorar rendimiento y seguridad
 */

/**
 * Función principal que se ejecuta cuando se accede a la URL de la aplicación web.
 * Sirve el archivo HTML principal de la interfaz de usuario.
 *
 * @param {Object} e El objeto de evento de la solicitud GET.
 * @returns {HtmlOutput} El objeto de salida HTML para mostrar al usuario.
 */
function doGet(e) {
  // Servir el archivo HTML llamado 'index.html' (asegúrate de que tu HTML se llama así)
  return HtmlService.createHtmlOutputFromFile('index')
      // Establece el título que aparecerá en la pestaña del navegador
      .setTitle('☀️ Asistente Solar Interactivo v2')
      // Añade la meta tag viewport para diseño responsive en móviles
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      // Permite que el contenido se muestre en iframes si es necesario (útil para embeber)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Busca una ubicación geográfica utilizando la API pública de Nominatim (OpenStreetMap).
 * Esta función es llamada desde el lado del cliente (JavaScript en index.html)
 * usando google.script.run.
 * Prioriza resultados dentro de España.
 *
 * @param {string} query El término de búsqueda introducido por el usuario.
 * @returns {Array|null} Un array de objetos con los resultados encontrados por Nominatim,
 * o null si ocurre un error durante la solicitud o procesamiento.
 * Devuelve un array vacío si la consulta es demasiado corta.
 */
function searchNominatim(query) {
  // Validar la entrada: no buscar si la consulta es nula o muy corta
  if (!query || query.trim().length < 3) {
    console.log("Consulta de búsqueda demasiado corta: ", query);
    return []; // Devolver array vacío para que el cliente sepa que no hubo resultados válidos
  }

  // Limpiar un poco la query por si acaso
  const sanitizedQuery = query.trim();
  console.log("Buscando en Nominatim: ", sanitizedQuery);

  // Coordenadas aproximadas del bounding box para España (incluyendo Canarias)
  const viewbox = '-18.2,27.6,4.3,43.8'; // lon_min, lat_min, lon_max, lat_max

  // Construir la URL para la API de Nominatim
  // Parámetros:
  // q: La consulta de búsqueda (codificada para URL)
  // format=json: Pedir respuesta en formato JSON
  // addressdetails=1: Incluir detalles de la dirección desglosados
  // limit=5: Limitar el número de resultados (ajustable)
  // countrycodes=es: Priorizar resultados en España
  // viewbox=... : Sugerir un área de búsqueda
  // bounded=1: Restringir resultados estrictamente dentro del viewbox
  // polygon_geojson=1: Solicitar la geometría del área (si está disponible)
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sanitizedQuery)}&format=json&addressdetails=1&limit=5&countrycodes=es&viewbox=${viewbox}&bounded=1&polygon_geojson=1`;

  // Opciones para la solicitud HTTP usando UrlFetchApp de Google Apps Script
  const options = {
    'method' : 'get', // Método HTTP GET
    'contentType': 'application/json', // Tipo de contenido esperado
    'muteHttpExceptions': true, // IMPORTANTE: Permite capturar errores HTTP (ej. 404, 500) sin detener el script
    'headers': {
      // ¡¡¡ ES FUNDAMENTAL CAMBIAR ESTE EMAIL POR UNO REAL !!!
      // Proporcionar un User-Agent es una buena práctica y requerido por la política de uso de Nominatim.
      // Ayuda a los administradores de OSM a identificar el origen del tráfico.
      'User-Agent': 'AsistenteSolarInteractivo/1.0 (AppsScript; Contacto: pon_tu_email_real_aqui@dominio.com)'
    }
  };

  try {
    // Realizar la llamada a la API
    const response = UrlFetchApp.fetch(nominatimUrl, options);
    const responseCode = response.getResponseCode(); // Obtener el código de estado HTTP
    const responseBody = response.getContentText(); // Obtener el cuerpo de la respuesta como texto

    // Verificar si la solicitud fue exitosa (código 200 OK)
    if (responseCode === 200) {
      // Intentar parsear la respuesta JSON
      const results = JSON.parse(responseBody);
      console.log(`Resultados de Nominatim para '${sanitizedQuery}':`, results.length);
      // Devolver el array de resultados parseados
      return results;
    } else {
      // Registrar un error si el código de estado no es 200
      console.error(`Error en la respuesta de Nominatim: Código ${responseCode}, URL: ${nominatimUrl}, Respuesta: ${responseBody}`);
      // Devolver null para indicar al cliente que hubo un problema en el servidor
      return null;
    }
  } catch (error) {
    // Capturar cualquier otro error que ocurra durante la llamada (ej. problemas de red, JSON mal formado)
    console.error(`Excepción al llamar a UrlFetchApp o procesar respuesta para '${sanitizedQuery}': ${error}`);
    console.error(`URL intentada: ${nominatimUrl}`);
    // Devolver null para indicar al cliente que hubo un error inesperado
    return null;
  }
}

// --- Espacio para futuras funciones del lado del servidor ---
/*
 function calculateSolarPotential(latitude, longitude, roofDetails) {
   // Ejemplo: Aquí podrías llamar a otra API (como PVGIS) o hacer cálculos
   // basados en la ubicación y detalles proporcionados.
   // const { area, orientation, tilt } = roofDetails;
   // ... Lógica de cálculo ...
   // const potential = { estimatedKwhYear: ..., panelsNeeded: ... };
   // console.log("Calculando potencial solar para:", latitude, longitude);
   // return potential;
 }

 function saveProjectData(projectInfo) {
   // Ejemplo: Guardar los datos de un proyecto/marcador en una Hoja de Cálculo de Google.
   // const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ProyectosSolares');
   // sheet.appendRow([projectInfo.id, projectInfo.lat, projectInfo.lng, new Date(), ...]);
   // console.log("Guardando datos del proyecto:", projectInfo.id);
   // return { success: true, projectId: projectInfo.id };
 }
*/
