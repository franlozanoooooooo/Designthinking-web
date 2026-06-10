# 🤖 Chatbot "Roji" — Guía de puesta en marcha

El sitio del Club Atlético Antoniano incluye un asistente virtual con IA
(Claude) que guía al aficionado y le ayuda a hacerse abonado o comprar
entradas, tanto en la **web** como derivándolo a **WhatsApp**.

## ¿Qué se ha añadido?

| Archivo | Para qué sirve |
|---|---|
| `assets/chatbot.js` | El widget de chat que se ve en la web (botón flotante + ventana). |
| `assets/chatbot.css` | Estilos del widget con los colores del club. |
| `netlify/functions/chat.mjs` | Función serverless que habla con la IA de Claude (guarda la clave en secreto). |
| `netlify.toml` | Configuración de despliegue en Netlify. |
| `package.json` | Dependencia del SDK de Anthropic. |

El widget está incluido en: `index`, `club`, `equipo`, `cantera`,
`noticias` y `contacto`.

---

## Pasos para activarlo (una sola vez)

### 1. Consigue una API key de Claude
- Entra en <https://console.anthropic.com> → **API Keys** → crea una clave.
- Tendrás que añadir saldo/método de pago (el uso de un chatbot pequeño es
  de muy pocos euros al mes).

### 2. Publica la web en Netlify
El sitio es estático pero el chatbot necesita un servidor para la IA. Netlify
hace las dos cosas a la vez y tiene plan gratuito.

1. Crea una cuenta en <https://www.netlify.com> (puedes entrar con GitHub).
2. **Add new site → Import an existing project** y elige este repositorio.
3. Deja la configuración por defecto (el `netlify.toml` ya lo define todo) y
   pulsa **Deploy**.

### 3. Añade la clave como variable de entorno
En el panel de Netlify del sitio:
- **Site configuration → Environment variables → Add a variable**
- Nombre: `ANTHROPIC_API_KEY`
- Valor: la clave que copiaste en el paso 1
- Guarda y lanza un **redeploy** (Deploys → Trigger deploy).

¡Listo! El botón "¿Te ayudo?" aparecerá abajo a la derecha y el chat ya
responderá con IA.

---

## Personalización rápida

- **Número de WhatsApp:** edita la primera línea de `assets/chatbot.js`
  (`WHATSAPP_NUMBER`). Pon el número del club en formato internacional sin
  "+" ni espacios (ej. España: `34XXXXXXXXX`).
- **Lo que sabe y cómo responde el bot:** edita el texto `SYSTEM` en
  `netlify/functions/chat.mjs` (precios, horarios, tono, etc.).
- **Modelo de IA:** en `netlify/functions/chat.mjs`, la constante `MODEL`.
  Por defecto usa `claude-opus-4-8` (el más capaz). Si prefieres respuestas
  más rápidas y económicas, cámbialo por `claude-haiku-4-5`.
- **Saludo y botones rápidos:** variables `SALUDO` y `SUGERENCIAS` en
  `assets/chatbot.js`.

---

## Notas

- La página `design-thinking.html` no lleva el widget (es una página
  independiente). Si quieres que también lo tenga, dímelo.
- Mientras no configures la `ANTHROPIC_API_KEY`, el chat mostrará un aviso de
  que aún no está disponible (no da error grave).
- Si en el futuro quieres un bot **automático dentro de WhatsApp** (que
  responda solo sin que nadie esté), eso requiere dar de alta el número en la
  WhatsApp Business API de Meta; se puede montar como segundo paso.
