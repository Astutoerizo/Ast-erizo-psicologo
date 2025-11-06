// api/erizo.js - Función Serverless para Vercel
import { OpenAI } from 'openai';

// 🚨 La clave se obtiene de una Variable de Entorno de Vercel (¡SEGURO!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// El Prompt Maestro del Astuto Erizo
const systemPrompt = `
ROL: Eres el "Astuto Erizo", un consultor de vida y psicólogo con una perspectiva única.
PERSONALIDAD CLAVE: Tono irreverente, zen y absurdo. Enseñas auto-responsabilidad ("tu propio jardín").
ESTRUCTURA ESTRICTA: 1. Interjección 2. Análisis Irreverente 3. Consejo Zen 4. Metáfora de Erizo (gusanos/púas/madriguera, OBLIGATORIA) 5. Cierre.
DINÁMICA: Varía la longitud (corto o largo). Si el tema se repite, usa frases de persistencia como "¡Y dale con lo mismo!". No incluyas el encabezado "Astuto Erizo:" en tu respuesta.

Tu respuesta debe ser generada basándote en el historial de conversación.
`;

export default async function handler(req, res) {
  // --- INICIO CÓDIGO CORS (SOLUCIÓN DEL ERROR 'Failed to fetch') ---
  // Establece el origen permitido: el dominio de tu GitHub Pages.
  const allowedOrigin = 'https://astutoerizo.github.io'; 

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si la petición es OPTIONS (la verificación inicial del navegador), respondemos OK y terminamos.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- FIN CÓDIGO CORS ---

  // Aseguramos que solo aceptamos peticiones POST (la consulta del usuario)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Obtenemos el historial de la conversación del cuerpo de la petición (lo que el usuario ha escrito)
  const { conversationHistory } = req.body;

  if (!conversationHistory || conversationHistory.length === 0) {
    return res.status(400).json({ error: 'No se ha proporcionado historial de conversación.' });
  }
  
  // 1. Preparamos los mensajes que enviaremos a la API de OpenAI
  const messages = [
    // El primer mensaje siempre es el Prompt Maestro para establecer el rol
    { role: "system", content: systemPrompt },
    // El resto son los mensajes que el usuario ha escrito, para mantener el contexto
    ...conversationHistory 
  ];
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Rápido y económico para chat
      messages: messages,
      temperature: 0.8, // Alto para creatividad del Erizo
    });

    // 2. Enviamos la respuesta del Erizo de vuelta al frontend (index.html)
    res.status(200).json({ 
      erizoResponse: completion.choices[0].message.content.trim() 
    });

  } catch (error) {
    console.error('Error al comunicarse con OpenAI:', error);
    res.status(500).json({ 
      error: 'El Erizo se ha pinchado. Error al contactar con la guarida de la IA.',
      details: error.message 
    });
  }
}