// api/search.js

// Importa 'node-fetch' si es necesario (npm install node-fetch)
// Si usas Node >= 18, puedes usar el fetch global.
// Si usas require: const fetch = require('node-fetch');
import fetch from 'node-fetch';

export default async function handler(request, response) {
  // Extraer el término de búsqueda de la URL query parameters
  const { query } = request.query;

  // --- Validación de Entrada ---
  if (!query || query.trim().length < 3) {
    console.log("API: Rechazado - Query demasiado corta:", query);
    return response.status(400).json({ error: 'La consulta debe tener al menos 3 caracteres.' });
  }

  const sanitizedQuery = query.trim();
  console.log("API: Buscando en Nominatim: ", sanitizedQuery);

  // --- Configuración de Nominatim ---
  const viewbox = '-18.2,27.6,4.3,43.8'; // BBox España
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sanitizedQuery)}&format=json&addressdetails=1&limit=5&countrycodes=es&viewbox=${viewbox}&bounded=1&polygon_geojson=1`;

  // Opciones para la llamada a Nominatim
  const options = {
    method: 'GET',
    headers: {
      // --- ¡¡¡ CAMBIA ESTE EMAIL POR EL TUYO !!! ---
      'User-Agent': 'AsistenteSolarInteractivo/1.0 (Vercel Serverless; Contacto: pon_tu_email_real_aqui@dominio.com)'
    }
  };

  // --- Llamada a Nominatim y Manejo de Respuesta ---
  try {
    const nominatimResponse = await fetch(nominatimUrl, options);

    // Verificar si la respuesta de Nominatim fue exitosa (código 2xx)
    if (nominatimResponse.ok) {
      const results = await nominatimResponse.json();
      console.log(`API: Resultados de Nominatim para '${sanitizedQuery}':`, results.length);
      // Devolver los resultados al frontend (index.html)
      response.status(200).json(results);
    } else {
      // Si Nominatim devolvió un error
      const errorText = await nominatimResponse.text(); // Leer el cuerpo como texto
      console.error(`API: Error en la respuesta de Nominatim: Código ${nominatimResponse.status}, URL: ${nominatimUrl}, Respuesta: ${errorText}`);
      // Devolver un error al frontend con el estado de Nominatim
      response.status(nominatimResponse.status).json({ error: `Error de Nominatim (${nominatimResponse.status}): ${nominatimResponse.statusText}` });
    }
  } catch (error) {
    // Capturar errores de red o problemas al hacer fetch
    console.error(`API: Excepción al llamar a Nominatim para '${sanitizedQuery}': ${error}`);
    // Devolver un error genérico 500 al frontend
    response.status(500).json({ error: 'Error interno del servidor al contactar el servicio de búsqueda.' });
  }
}
