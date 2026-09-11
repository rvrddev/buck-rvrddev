// public/js/month.js
// Lógica completa de la vista "Mes": render del cuaderno, tracker, objetivos, navegación

// ============ CARGAR MES ============
async function loadMonth() {
  document.getElementById('calendarStatusText').textContent = 'CARGANDO...';

  try {
    const data = await API.getMonth(BUCK.currentYear, BUCK.currentMonth);

    if (!data) {
      showToast('Ese mes no existe todavía', 'error');
      document.getElementById('calendarStatusText').textContent = 'SIN DATOS';
      return;
    }

    BUCK.monthData = data;
    renderAll();
  } catch (err) {
    console.error(err);
    document.getElementById('calendarStatusText').textContent = 'ERROR';
  }
}

// ============ RENDER GENERAL ============
function renderAll() {
  if (!BUCK.monthData) return;
  const { month, habits, checks, objectives, events, notes } = BUCK.monthData;

  document.getElementById('monthPicker').value = month.year + '-' + pad(month.month + 1);
  document.getElementById('monthTitle').value = month.title;
  document.getElementById('mantraInput').value = month.mantra;

  renderEvents(month.year, month.month, events, notes);
  renderTracker(month.year, month.month, habits, checks);
  renderObjectives(objectives);
  updateSummary(checks);

  document.getElementById('calendarStatusText').textContent = 'GUARDADO · ' + month.title.toUpperCase();
}

// ============ RENDER EVENTOS ============
function renderEvents(year, month, events, notes) {
  const body = document.getElementById('eventsTableBody');
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = {};
  events.forEach(e => { eventsByDay[e.day] = e; });
  const noteDays = new Set(notes.map(n => n.day));

  body.innerHTML = '';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const hasNote = noteDays.has(day);
    const ev = eventsByDay[day];

    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="day-num ' + (weekend ? 'weekend' : '') + '">' +
        '<span>' + day + '</span>' +
        (hasNote ? ' <span style="color:#f59e0b;font-size:.9rem" title="Tiene nota">●</span>' : '') +
      '</td>' +
      '<td class="day-text">' +
        '<input type="text" data-day="' + day + '" value="' + escapeHtml(ev ? ev.text : '') + '">' +
      '</td>';
    body.appendChild(tr);
  }

  // Listeners con debounce
  body.querySelectorAll('input[data-day]').forEach(input => {
    input.addEventListener('input', (e) => {
      const day = parseInt(e.target.dataset.day);
      onEventChange(day, e.target.value);
    });
  });
}

// ============ RENDER TRACKER ============
function renderTracker(year, month, habits, checks) {
  const header = document.getElementById('trackerHeader');
  const body = document.getElementById('trackerTableBody');
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Header con nombres de hábitos
  header.innerHTML = '<th style="width:28px;min-width:24px;"></th>';
  habits.forEach(h => {
    const th = document.createElement('th');
    th.className = 'habit-header cat-' + (h.category || 'routine');
    th.textContent = h.name;
    header.appendChild(th);
  });

  // Set para búsqueda rápida
  const checkedSet = new Set(
    checks.filter(c => c.checked).map(c => c.habitId + '_' + c.day)
  );

  // Body con días y checks
  body.innerHTML = '';
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const tr = document.createElement('tr');

    let cells = '<td class="day-row ' + (weekend ? 'weekend' : '') + '">' + day + '</td>';
    habits.forEach(h => {
      const checked = checkedSet.has(h.id + '_' + day);
      cells += '<td class="cell-check ' + (checked ? 'checked' : '') + '" data-habit="' + h.id + '" data-day="' + day + '"></td>';
    });
    tr.innerHTML = cells;
    body.appendChild(tr);
  }

  // Listeners
  body.querySelectorAll('.cell-check').forEach(cell => {
    cell.addEventListener('click', () => {
      const habitId = parseInt(cell.dataset.habit);
      const day = parseInt(cell.dataset.day);
      onToggleCheck(habitId, day, cell);
    });
  });
}

// ============ RENDER OBJETIVOS ============
function renderObjectives(objectives) {
  const container = document.getElementById('objectivesContainer');

  if (!objectives.length) {
    container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-family:Inter;font-size:.75rem;padding:15px 0">Sin objetivos este mes</div>';
    return;
  }

  let html = '';
  objectives.forEach(obj => {
    let status = 'todo';
    let icon = '⚪';

    if (obj.type === 'simple') {
      if (obj.done) { status = 'done'; icon = '🟢'; }
    } else if (obj.type === 'counter') {
      if ((obj.current || 0) >= (obj.target || 1)) { status = 'done'; icon = '🟢'; }
      else if ((obj.current || 0) > 0) { status = 'progress'; icon = '🟡'; }
    } else if (obj.type === 'weekly') {
      const weeks = obj.weeks || [];
      const doneWeeks = weeks.filter(Boolean).length;
      if (doneWeeks >= weeks.length && weeks.length > 0) { status = 'done'; icon = '🟢'; }
      else if (doneWeeks > 0) { status = 'progress'; icon = '🟡'; }
    }

    const typeLabel = { simple: 'Simple', counter: 'Contador', weekly: 'Semanal' }[obj.type] || obj.type;

    html += '<div class="objective-item ' + status + '">' +
      '<div class="objective-header">' +
        '<span class="objective-status">' + icon + '</span>' +
        '<span class="objective-text ' + (status === 'done' ? 'done' : '') + '">' + escapeHtml(obj.text) + '</span>' +
        '<span class="objective-type ' + obj.type + '">' + typeLabel + '</span>' +
      '</div>';

    if (obj.type === 'counter') {
      const pct = Math.min(100, Math.round((obj.current || 0) / (obj.target || 1) * 100));
      html += '<div class="objective-detail">' +
        '<strong>' + (obj.current || 0) + '</strong> / ' + (obj.target || 1) + ' veces' +
        '<div class="objective-bar"><div class="objective-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div>';
    }

    if (obj.type === 'weekly') {
      const weeks = obj.weeks || [];
      html += '<div class="objective-detail" style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">';
      weeks.forEach((done, i) => {
        html += '<span style="padding:3px 8px;border-radius:5px;font-size:.65rem;border:1px solid ' +
          (done ? '#86efac;background:#dcfce7;color:#15803d;font-weight:700' : '#e2e8f0;background:#f8fafc;color:#64748b') +
          '">Sem ' + (i + 1) + (done ? ' ✓' : '') + '</span>';
      });
      html += '</div>';
    }

    html += '</div>';
  });

  container.innerHTML = html;
}

// ============ RESUMEN ============
function updateSummary(checks) {
  const count = checks.filter(c => c.checked).length;
  document.getElementById('monthSummary').textContent = count + ' hábitos marcados';
}

// ============ HANDLERS ============
function onTitleChange() {
  const value = document.getElementById('monthTitle').value;
  debounce('title', async () => {
    if (!BUCK.monthData) return;
    try {
      await API.updateMonth(BUCK.monthData.month.id, { title: value });
      showAutosave();
    } catch (err) { console.error(err); }
  });
}

function onMantraChange() {
  const value = document.getElementById('mantraInput').value;
  debounce('mantra', async () => {
    if (!BUCK.monthData) return;
    try {
      await API.updateMonth(BUCK.monthData.month.id, { mantra: value });
      showAutosave();
    } catch (err) { console.error(err); }
  });
}

function onEventChange(day, text) {
  if (!BUCK.monthData.events) BUCK.monthData.events = [];
  const idx = BUCK.monthData.events.findIndex(e => e.day === day);
  if (idx >= 0) BUCK.monthData.events[idx].text = text;
  else BUCK.monthData.events.push({ day, text, monthId: BUCK.monthData.month.id });

  debounce('event-' + day, async () => {
    try {
      await API.updateEvent(BUCK.monthData.month.id, day, text);
      showAutosave();
    } catch (err) { console.error(err); }
  });
}

async function onToggleCheck(habitId, day, cell) {
  if (!BUCK.monthData) return;
  const wasChecked = cell.classList.contains('checked');
  const newChecked = !wasChecked;

  // Actualizar UI inmediatamente
  cell.classList.toggle('checked', newChecked);

  // Actualizar en memoria
  const idx = BUCK.monthData.checks.findIndex(c => c.habitId === habitId && c.day === day);
  if (idx >= 0) BUCK.monthData.checks[idx].checked = newChecked;
  else BUCK.monthData.checks.push({ monthId: BUCK.monthData.month.id, habitId, day, checked: newChecked });
  updateSummary(BUCK.monthData.checks);

  // Guardar en DB
  try {
    await API.toggleCheck(BUCK.monthData.month.id, habitId, day, newChecked);
    showAutosave();
  } catch (err) {
    console.error(err);
    cell.classList.toggle('checked', wasChecked);
  }
}

// ============ NAVEGACIÓN ============
function changeMonth(delta) {
  let m = BUCK.currentMonth + delta;
  let y = BUCK.currentYear;
  if (m > 12) { m = 1; y++; }
  if (m < 1) { m = 12; y--; }
  BUCK.currentYear = y;
  BUCK.currentMonth = m;
  loadMonth();
}

function goToToday() {
  const now = new Date();
  BUCK.currentYear = now.getFullYear();
  BUCK.currentMonth = now.getMonth() + 1;
  loadMonth();
}

function goToSelectedMonth() {
  const val = document.getElementById('monthPicker').value;
  if (!val) return;
  const parts = val.split('-');
  BUCK.currentYear = parseInt(parts[0]);
  BUCK.currentMonth = parseInt(parts[1]);
  loadMonth();
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
  // Event listeners del header
  document.getElementById('prevMonthBtn').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonthBtn').addEventListener('click', () => changeMonth(1));
  document.getElementById('todayBtn').addEventListener('click', goToToday);
  document.getElementById('monthPicker').addEventListener('change', goToSelectedMonth);

  // Inputs del mes
  document.getElementById('monthTitle').addEventListener('input', onTitleChange);
  document.getElementById('mantraInput').addEventListener('input', onMantraChange);

  // Auth
  document.getElementById('authForm').addEventListener('submit', handleAuth);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Verificar sesión al cargar
  checkSession();
});

// ============ EXPORTAR ============
window.loadMonth = loadMonth;
window.changeMonth = changeMonth;
window.goToToday = goToToday;
window.goToSelectedMonth = goToSelectedMonth;
window.renderAll = renderAll;