// ═══════════════════════════════════════════════════════════════
// NK DISTRIBUCIONES — shared.js
// Código compartido entre remito.js, editor.js y panel.js
// ═══════════════════════════════════════════════════════════════

// ── URL del Apps Script ──────────────────────────────────────────
export function getURL() {
  return localStorage.getItem('nk_sheet_url') || '';
}
export function setURL(url) {
  localStorage.setItem('nk_sheet_url', url.trim());
}

// ── Toast ────────────────────────────────────────────────────────
export function toast(msg, tipo = 'ok', dur = 3500) {
  let el = document.getElementById('nk-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'nk-toast';
    el.style.cssText = `
      position:fixed;top:24px;right:24px;z-index:9999;
      padding:12px 20px;border-radius:8px;font-family:'Barlow',sans-serif;
      font-size:13px;font-weight:600;color:white;
      box-shadow:0 8px 24px rgba(0,0,0,0.2);
      transform:translateX(120%);transition:transform 0.3s ease;
      max-width:360px;line-height:1.5;
    `;
    document.body.appendChild(el);
  }
  const colores = { ok: '#16a34a', err: '#dc2626', loading: '#1d4ed8', warn: '#f59e0b' };
  el.style.background = colores[tipo] || colores.ok;
  if (tipo === 'warn') el.style.color = '#1e293b';
  else el.style.color = 'white';
  el.textContent = msg;
  el.style.transform = 'translateX(0)';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.transform = 'translateX(120%)'; }, dur);
}

// ── Formato peso argentino ───────────────────────────────────────
export function formatPeso(n) {
  return Number(n || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── Fetch GET al Apps Script ─────────────────────────────────────
export async function apiFetch(action, params = {}) {
  const url = getURL();
  if (!url) throw new Error('Sin URL configurada');
  const query = new URLSearchParams({ action, ...params }).toString();
  const r = await fetch(`${url}?${query}`);
  return r.json();
}

// ── Fetch POST al Apps Script ────────────────────────────────────
export async function apiPost(body) {
  const url = getURL();
  if (!url) throw new Error('Sin URL configurada');
  return fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// ── Fecha de hoy en dd/MM/yyyy ───────────────────────────────────
export function fechaHoy() {
  const h = new Date();
  const d = String(h.getDate()).padStart(2, '0');
  const m = String(h.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${h.getFullYear()}`;
}

// ── Convertir yyyy-MM-dd ↔ dd/MM/yyyy ───────────────────────────
export function inputAFecha(v) {
  if (!v) return '';
  const p = v.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : '';
}
export function fechaAInput(v) {
  if (!v) return '';
  const p = v.split('/');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '';
}

// ── Escape HTML básico ───────────────────────────────────────────
export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
