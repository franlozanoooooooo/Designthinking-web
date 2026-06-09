// Menú móvil + año del footer
document.addEventListener('DOMContentLoaded', function () {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
