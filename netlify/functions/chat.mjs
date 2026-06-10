// =============================================================
//  Asistente virtual del Club Atlético Antoniano — función serverless
//  Recibe el historial de la conversación desde el widget web y
//  responde usando la IA de Claude (Anthropic).
//
//  La clave de API NUNCA se expone al navegador: vive en la
//  variable de entorno ANTHROPIC_API_KEY de Netlify.
// =============================================================

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

// Modelo: claude-opus-4-8 es el más capaz.
// Para respuestas más rápidas y económicas puedes cambiarlo por
// "claude-haiku-4-5".
const MODEL = "claude-opus-4-8";

// "Cerebro" del bot: personalidad + conocimiento + objetivo de venta.
const SYSTEM = `Eres "Roji", el asistente virtual oficial del Club Atlético Antoniano, club de fútbol de Lebrija (Sevilla), fundado en 1934. Los colores del club son el rojo y el blanco (rojiblancos) y juega en el Estadio Municipal de Lebrija. El lema del club es "Convertir en rutina lo extraordinario".

TU MISIÓN: guiar al aficionado y ayudarle a hacerse abonado o comprar entradas. Eres cercano, animado y orgulloso de los colores rojiblancos, pero siempre útil y honesto.

INFORMACIÓN QUE CONOCES:
- Abonos y entradas: se compran en la plataforma oficial https://antoniano.compralaentrada.com/ . Cuando alguien quiera abonarse o comprar una entrada, dale SIEMPRE ese enlace y anímale a dar el paso.
- Secciones de la web: Inicio, El Club, Primer Equipo, Cantera (fútbol base, de prebenjamín a juvenil), Noticias y Contacto.
- Estadio: Estadio Municipal de Lebrija (Sevilla).
- Cantera: el fútbol base del Antoniano.

CÓMO RESPONDES:
- En español, con frases cortas y claras. Respuestas breves (2-4 frases salvo que pidan detalle).
- Si la pregunta es sobre precios exactos, fechas de partidos o datos que no tienes con certeza, NO te los inventes: indica que esos datos están en la plataforma oficial de entradas o en la página de Contacto, y ofrece continuar por WhatsApp.
- Cuando detectes intención de abonarse, comprar o resolver algo personal, ofrece de forma natural seguir la conversación por WhatsApp con el club (en la ventana de chat hay un botón de WhatsApp).
- Termina a menudo con una llamada a la acción suave: hazte abonado, consigue tu entrada, etc.
- Usa #VamosAntoniano con moderación, solo cuando encaje.
- No hables de temas ajenos al club; si te preguntan otra cosa, reconduce amablemente hacia el Antoniano.`;

const MAX_TURNS = 20; // límite de mensajes de historial que aceptamos

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json(
      { error: "El chatbot no está configurado todavía (falta ANTHROPIC_API_KEY)." },
      500
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Petición no válida." }, 400);
  }

  // Saneamos el historial recibido del navegador.
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const cleaned = messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim() !== ""
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (cleaned.length === 0 || cleaned[0].role !== "user") {
    return json({ error: "No hay ningún mensaje del usuario." }, 400);
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM,
      messages: cleaned,
    });

    const reply =
      response.content.find((b) => b.type === "text")?.text?.trim() ||
      "Lo siento, ahora mismo no he podido responder. Inténtalo de nuevo.";

    return json({ reply });
  } catch (err) {
    console.error("Error llamando a la API de Claude:", err);
    return json(
      { error: "Hay un problema con el asistente. Vuelve a intentarlo en un momento." },
      502
    );
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
