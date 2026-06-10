// Aplica el contenido editable de content/site.json a la página.
// Mejora progresiva: si falla la carga, se mantienen los textos por defecto del HTML.
(function () {
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return (o == null ? undefined : o[k]); }, obj);
  }
  fetch('content/site.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      // Texto
      document.querySelectorAll('[data-cms]').forEach(function (el) {
        var v = get(data, el.getAttribute('data-cms'));
        if (v != null && v !== '') el.textContent = v;
      });
      // Enlaces (href)
      document.querySelectorAll('[data-cms-href]').forEach(function (el) {
        var v = get(data, el.getAttribute('data-cms-href'));
        if (v) el.setAttribute('href', v);
      });
      // Imagen de fondo (background-image)
      document.querySelectorAll('[data-cms-bg]').forEach(function (el) {
        var v = get(data, el.getAttribute('data-cms-bg'));
        if (v) el.style.backgroundImage = "url('" + v + "')";
      });
      // src de <img>
      document.querySelectorAll('[data-cms-src]').forEach(function (el) {
        var v = get(data, el.getAttribute('data-cms-src'));
        if (v) el.setAttribute('src', v);
      });
    })
    .catch(function () { /* se mantienen los valores por defecto */ });
})();
