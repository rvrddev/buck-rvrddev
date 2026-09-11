// public/js/api.js
// Funciones para comunicarse con los endpoints del backend

const API = {
  // ============ AUTENTICACIÓN ============
  async login(username, password) {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    return data;
  },

  async logout() {
    await fetch('/api/auth', { method: 'DELETE' });
  },

  async checkSession() {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        const data = await res.json();
        return data.authenticated ? data : null;
      }
      return null;
    } catch {
      return null;
    }
  },

  // ============ MES ============
  async getMonth(year, month) {
    const res = await fetch(`/api/month?year=${year}&month=${month}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Error ${res.status} al cargar mes`);
    }
    return res.json();
  },

  async updateMonth(monthId, data) {
    const res = await fetch('/api/month', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthId, ...data }),
    });
    if (!res.ok) throw new Error(`Error ${res.status} al actualizar mes`);
    return res.json();
  },

  // ============ CHECKS ============
  async toggleCheck(monthId, habitId, day, checked) {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthId, habitId, day, checked }),
    });
    if (!res.ok) throw new Error(`Error ${res.status} al guardar check`);
    return res.json();
  },

  // ============ EVENTOS ============
  async updateEvent(monthId, day, text) {
    const res = await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthId, day, text }),
    });
    if (!res.ok) throw new Error(`Error ${res.status} al guardar evento`);
    return res.json();
  },
};

window.API = API;