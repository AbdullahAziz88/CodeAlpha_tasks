var root = document.documentElement;
try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
var sw = document.getElementById('theme');
function isDark() { return (root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark'; }
function syncSwitch() { sw.setAttribute('aria-checked', String(isDark())); }
syncSwitch();
sw.addEventListener('click', function () {
  var next = isDark() ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  syncSwitch();
  try { localStorage.setItem('theme', next); } catch (e) {}
});

//Mobile menu
var burger = document.getElementById('burger'), menu = document.getElementById('menu');
function setMenu(open) {
  menu.classList.toggle('hidden', !open); menu.classList.toggle('flex', open);
  burger.setAttribute('aria-expanded', String(open));
}
burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
menu.addEventListener('click', function (e) { if (e.target.tagName === 'A' && window.innerWidth < 768) setMenu(false); });

document.getElementById('year').textContent = new Date().getFullYear();

//Copy email
var copyBtn = document.getElementById('copy');
copyBtn.addEventListener('click', function () {
  var addr = 'abdullahaziz.me@gmail.com';
  function done() { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy email'; }, 2000); }
  function fallback() {
    var t = document.createElement('textarea'); t.value = addr; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch (e) { copyBtn.textContent = 'Select the address and copy it'; }
    document.body.removeChild(t);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(addr).then(done, fallback); } else { fallback(); }
});

// Typewriter
var el = document.getElementById('typed');
var words = ['clean web interfaces', 'AI-powered apps', 'software that works'];
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  var w = 0, n = 0, del = false;
  (function tick() {
    var full = words[w];
    n += del ? -1 : 1;
    el.textContent = full.slice(0, n);
    var delay = del ? 35 : 80;
    if (!del && n === full.length) { del = true; delay = 1800; }
    else if (del && n === 0) { del = false; w = (w + 1) % words.length; delay = 400; }
    setTimeout(tick, delay);
  })();
}
