// ===================================================================
//  Chatbot "Roji" — Club Atlético Antoniano
//  Widget de chat con IA que se integra en todas las páginas.
//  Habla con la función serverless /api/chat (que usa Claude).
// ===================================================================
(function () {
  "use strict";

  // ⚠️ CAMBIA ESTE NÚMERO por el WhatsApp real del club.
  // Formato internacional sin "+", sin espacios. Ej. España: 34XXXXXXXXX
  var WHATSAPP_NUMBER = "34600000000";
  var WHATSAPP_TEXT = "Hola, escribo desde la web del Antoniano y quería más información.";

  var SALUDO =
    "¡Hola! Soy Roji, el asistente del Club Atlético Antoniano. 🔴⚪\n¿Quieres hacerte abonado, conseguir entradas o saber algo del club?";

  var SUGERENCIAS = [
    "Quiero hacerme abonado",
    "Comprar entradas",
    "Info del primer equipo",
    "La cantera",
  ];

  // Historial de la conversación (lo que se envía a la IA).
  var history = [];
  var enviando = false;

  // ---- Construcción del DOM --------------------------------------
  var root = document.createElement("div");
  root.id = "caa-chat";

  var waHref =
    "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(WHATSAPP_TEXT);

  root.innerHTML =
    '<button id="caa-chat-launcher" aria-label="Abrir chat del club">' +
      iconChat() +
      "<span>¿Te ayudo?</span>" +
    "</button>" +
    '<section id="caa-chat-panel" role="dialog" aria-label="Asistente del Club Atlético Antoniano">' +
      '<header class="caa-head">' +
        '<div class="caa-avatar">A</div>' +
        '<div class="caa-title"><b>Roji</b><span>Antoniano · En línea</span></div>' +
        '<button class="caa-close" id="caa-close" aria-label="Cerrar chat">&times;</button>' +
      "</header>" +
      '<div class="caa-body" id="caa-body"></div>' +
      '<div class="caa-quick" id="caa-quick"></div>' +
      '<a class="caa-wa" href="' + waHref + '" target="_blank" rel="noopener">' +
        iconWhatsapp() + "Seguir por WhatsApp" +
      "</a>" +
      '<form class="caa-input" id="caa-form">' +
        '<input type="text" id="caa-text" placeholder="Escribe tu mensaje…" autocomplete="off" maxlength="500">' +
        '<button type="submit" id="caa-send" aria-label="Enviar">' + iconSend() + "</button>" +
      "</form>" +
    "</section>";

  document.body.appendChild(root);

  var launcher = document.getElementById("caa-chat-launcher");
  var panel = document.getElementById("caa-chat-panel");
  var bodyEl = document.getElementById("caa-body");
  var quickEl = document.getElementById("caa-quick");
  var form = document.getElementById("caa-form");
  var input = document.getElementById("caa-text");
  var sendBtn = document.getElementById("caa-send");
  var closeBtn = document.getElementById("caa-close");

  // ---- Abrir / cerrar --------------------------------------------
  function abrir() {
    panel.classList.add("caa-open");
    launcher.classList.add("caa-hidden");
    input.focus();
    if (history.length === 0) {
      pintarBot(SALUDO);
      pintarSugerencias();
    }
  }
  function cerrar() {
    panel.classList.remove("caa-open");
    launcher.classList.remove("caa-hidden");
  }
  launcher.addEventListener("click", abrir);
  closeBtn.addEventListener("click", cerrar);

  // ---- Sugerencias rápidas ---------------------------------------
  function pintarSugerencias() {
    quickEl.innerHTML = "";
    SUGERENCIAS.forEach(function (texto) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = texto;
      b.addEventListener("click", function () {
        quickEl.innerHTML = "";
        enviar(texto);
      });
      quickEl.appendChild(b);
    });
  }

  // ---- Pintar mensajes -------------------------------------------
  function pintarBot(texto) {
    var div = document.createElement("div");
    div.className = "caa-msg bot";
    div.innerHTML = formatear(texto);
    bodyEl.appendChild(div);
    scroll();
  }
  function pintarUsuario(texto) {
    var div = document.createElement("div");
    div.className = "caa-msg user";
    div.textContent = texto;
    bodyEl.appendChild(div);
    scroll();
  }
  function mostrarTyping() {
    var t = document.createElement("div");
    t.className = "caa-typing";
    t.id = "caa-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    bodyEl.appendChild(t);
    scroll();
  }
  function quitarTyping() {
    var t = document.getElementById("caa-typing");
    if (t) t.remove();
  }
  function scroll() {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  // Enlaces clicables + escape básico de HTML.
  function formatear(texto) {
    var esc = texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return esc.replace(/(https?:\/\/[^\s]+)/g, function (url) {
      var limpio = url.replace(/[.,)]+$/, "");
      return '<a href="' + limpio + '" target="_blank" rel="noopener">' + limpio + "</a>";
    });
  }

  // ---- Envío a la IA ---------------------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var texto = input.value.trim();
    if (texto) enviar(texto);
  });

  function enviar(texto) {
    if (enviando) return;
    enviando = true;
    sendBtn.disabled = true;
    input.value = "";
    quickEl.innerHTML = "";

    pintarUsuario(texto);
    history.push({ role: "user", content: texto });
    mostrarTyping();

    fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        quitarTyping();
        if (res.ok && res.data.reply) {
          pintarBot(res.data.reply);
          history.push({ role: "assistant", content: res.data.reply });
        } else {
          pintarBot(
            (res.data && res.data.error) ||
              "Ahora mismo no puedo responder. Prueba a escribirnos por WhatsApp. 🙏"
          );
        }
      })
      .catch(function () {
        quitarTyping();
        pintarBot(
          "Ha habido un problema de conexión. Inténtalo de nuevo o escríbenos por WhatsApp. 🙏"
        );
      })
      .finally(function () {
        enviando = false;
        sendBtn.disabled = false;
        input.focus();
      });
  }

  // ---- Iconos (SVG) ----------------------------------------------
  function iconChat() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.7 2 11.2c0 2.3 1.2 4.4 3.2 5.9-.1 1-.6 2.4-1.6 3.4 1.6-.2 3.3-.8 4.6-1.7 1.2.4 2.5.6 3.8.6 5.5 0 10-3.7 10-8.2S17.5 3 12 3z"/></svg>';
  }
  function iconSend() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-6l8-2.5-8-2.5v-6l19 8.5z"/></svg>';
  }
  function iconWhatsapp() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-.7-.3-1.3-.6-1.9-1.5-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.2.9 2.3.1.2 1.6 2.5 4 3.4.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z"/></svg>';
  }
})();
