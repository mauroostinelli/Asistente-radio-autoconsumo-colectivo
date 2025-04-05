export default async function handler(request, response) {
  const { query } = request.query;

  if (!query || query.trim().length < 3) {
    console.log("API: Rechazado - Query demasiado corta:", query);
    return response.status(400).json({ error: 'La consulta debe tener al menos 3 caracteres.' });
  }

  const sanitizedQuery = query.trim();
  console.log("API: Buscando en Nominatim: ", sanitizedQuery);

  const viewbox = '-18.2,27.6,4.3,43.8';
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sanitizedQuery)}&format=json&addressdetails=1&limit=5&countrycodes=es&viewbox=${viewbox}&bounded=1&polygon_geojson=1`;

  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'AsistenteSolarInteractivo/1.0 (Vercel Serverless; Contacto: pon_tu_email_real_aqui@dominio.com)'
    }
  };

  try {
    const nominatimResponse = await fetch(nominatimUrl, options);

    if (nominatimResponse.ok) {
      const results = await nominatimResponse.json();
      console.log(`API: Resultados de Nominatim para '${sanitizedQuery}':`, results.length);
      response.status(200).json(results);
    } else {
      const errorText = await nominatimResponse.text();
      console.error(`API: Error en la respuesta de Nominatim: Código ${nominatimResponse.status}, URL: ${nominatimUrl}, Respuesta: ${errorText}`);
      response.status(nominatimResponse.status).json({ error: `Error de Nominatim (${nominatimResponse.status}): ${nominatimResponse.statusText}` });
    }
  } catch (error) {
    console.error(`API: Excepción al llamar a Nominatim para '${sanitizedQuery}': ${error}`);
    response.status(500).json({ error: 'Error interno del servidor al contactar el servicio de búsqueda.' });
  }
}
