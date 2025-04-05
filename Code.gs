function doGet(e) {
  // Servir el archivo HTML principal
  return HtmlService.createHtmlOutputFromFile('index')
      // Modificación Cosmética: Actualizar título para consistencia
      .setTitle('Asistente Solar Interactivo v2.1') 
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Función del lado del servidor para buscar en Nominatim.
 * Se llama desde el cliente usando google.script.run.
 * @param {string} query El término de búsqueda.
 * @returns {Array|null} Un array de resultados de Nominatim o null en caso de error.
 */
function searchNominatim(query) {
  if (!query || query.length < 3) {
    return []; 
  }

  const viewbox = '-18.2,27.6,4.3,43.8';
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=es&viewbox=${viewbox}&bounded=1&polygon_geojson=1`; 

  const options = {
    'method' : 'get',
    'contentType': 'application/json',
    'muteHttpExceptions': true, 
     'headers': {
         'User-Agent': 'AsistenteSolarInteractivo/1.0 (AppsScript; Contacto: tuemail@dominio.com)' // ¡Recuerda cambiar esto!
     }
  };

  try {
    const response = UrlFetchApp.fetch(nominatimUrl, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode === 200) {
      const results = JSON.parse(responseBody);
      return results;
    } else {
      console.error(`Error en Nominatim: Código ${responseCode}, Respuesta: ${responseBody}`);
      return null; 
    }
  } catch (error) {
    console.error(`Error en UrlFetchApp: ${error}`);
    return null; 
  }
}

// La función comentada para cálculos futuros sigue siendo relevante como placeholder
// function calculateSolarPotential(data) {
//   // ...
// }
