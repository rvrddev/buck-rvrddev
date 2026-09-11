// public/js/utils.js
// Funciones utilitarias compartidas por toda la app

// ============ ESTADO GLOBAL ============
// (Lo compartimos desde aquí para que todos los archivos lo vean)
window.BUCK = {
  currentYear: 2026,
  currentMonth: 9,
  monthData: null,
  saveTimers: {},
  autosaveTimer: null,
  currentUser: null,
};

// ============ CONSTANTES ============
window.MONTHS = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
window.DAYS_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

// ============ UTILIDADES ============
window.pad = function(n) {
  return String(n).padStart(2, '0');
};

window.showToast = function(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.className = 'toast ' + type, 2500);
};

window.showAutosave = function() {
  const dot = document.getElementById('autosaveDot');
  if (!dot) return;
  dot.classList.add('active');
  clearTimeout(window.BUCK.autosaveTimer);
  window.BUCK.autosaveTimer = setTimeout(() => dot.classList.remove('active'), 800);
};

window.debounce = function(key, fn, delay = 700) {
  if (window.BUCK.saveTimers[key]) clearTimeout(window.BUCK.saveTimers[key]);
  window.BUCK.saveTimers[key] = setTimeout(fn, delay);
};

window.escapeHtml = function(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};