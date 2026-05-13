// ═══════════════════════════════════════════════════════════════
// NK DISTRIBUCIONES — views/panel.js
// Vista del panel: Predicciones, Cobranzas y Rutas
// ═══════════════════════════════════════════════════════════════
import { apiFetch, apiPost, toast, formatPeso, fechaAInput, inputAFecha } from '../shared.js';

export function montarPanel(contenedor) {
  contenedor.innerHTML = getHTML();
  initLogica(contenedor);
}

function getHTML() {
  return `
<style>
.p-wrap { font-family:'Barlow',sans-serif; min-height:100%; background:#cbd5e1; }

/* TABS */
.p-tab-nav { background:#0f1f3d; display:flex; align-items:stretch; border-bottom:1px solid rgba(255,255,255,0.08); }
.p-tab-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:14px 8px; background:none; border:none; color:rgba(255,255,255,0.45); font-family:'Barlow',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; cursor:pointer; border-bottom:3px solid transparent; transition:all 0.2s; }
.p-tab-btn:hover { color:white; }
.p-tab-btn.activo { color:white; border-bottom-color:#0ea5e9; }
.p-tab-panel { display:none; padding:16px; }
.p-tab-panel.activo { display:block; }

/* STATS */
.p-stats { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
.p-stat { flex:1; min-width:120px; background:white; border-radius:8px; padding:12px 14px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border-left:4px solid #e2e8f0; }
.p-stat.urgente { border-left-color:#dc2626; }
.p-stat.pronto  { border-left-color:#d97706; }
.p-stat.ok      { border-left-color:#16a34a; }
.p-stat.frio    { border-left-color:#64748b; }
.p-stat.opor    { border-left-color:#7c3aed; }
.p-stat.blue    { border-left-color:#1d4ed8; }
.p-stat-lbl { font-size:9px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
.p-stat-val { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; color:#1e293b; }
.p-stat-sub { font-size:10px; color:#64748b; margin-top:1px; }

/* FILTROS */
.p-filters { display:flex; gap:10px; align-items:center; flex-wrap:wrap; background:white; border-radius:8px; padding:11px 14px; box-shadow:0 2px 8px rgba(0,0,0,0.06); margin-bottom:14px; }
.p-filters label { font-size:10px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; }
.p-filter-sel, .p-filter-inp { border:1.5px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-family:'Barlow',sans-serif; font-size:11px; font-weight:600; color:#1e293b; background:#f1f5f9; outline:none; cursor:pointer; }
.p-filter-inp { min-width:150px; cursor:text; }
.p-filter-sel:focus, .p-filter-inp:focus { border-color:#1d4ed8; }
.p-filter-sep { width:1px; height:20px; background:#e2e8f0; }
.p-btn-act { display:flex; align-items:center; gap:6px; background:#0f1f3d; color:white; border:none; border-radius:6px; padding:7px 14px; font-family:'Barlow',sans-serif; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap; }
.p-btn-act:hover { background:#1d4ed8; }
.p-btn-act.green { background:#16a34a; }
.p-btn-act.green:hover { background:#15803d; }
.p-btn-act.orange { background:#d97706; }
.p-btn-act.orange:hover { background:#b45309; }

/* TABLE */
.p-table-wrap { background:white; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06); overflow:hidden; overflow-x:auto; }
.p-table { width:100%; border-collapse:collapse; min-width:800px; }
.p-table thead tr { background:#0f1f3d; }
.p-table thead th { padding:10px 11px; font-size:9px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1.2px; text-align:left; white-space:nowrap; }
.p-table thead th:not(:first-child) { border-left:1px solid rgba(255,255,255,0.08); }
.p-table tbody tr { border-bottom:1px solid #e2e8f0; transition:background 0.1s; cursor:pointer; }
.p-table tbody tr:hover { background:#eff6ff; }
.p-table tbody td { padding:8px 11px; font-size:11px; color:#1e293b; white-space:nowrap; }
.p-table tbody td:not(:first-child) { border-left:1px solid #e2e8f0; }
.p-table tbody tr.sec-hdr td { background:#0f1f3d; color:white; font-weight:700; font-size:11px; letter-spacing:1px; padding:8px 12px; cursor:default; }

/* SCORE */
.p-score-wrap { display:flex; align-items:center; gap:8px; }
.p-score-bar { flex:1; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; min-width:50px; }
.p-score-fill { height:100%; border-radius:3px; }
.p-score-num { font-size:11px; font-weight:800; color:#1e293b; min-width:26px; text-align:right; }

/* URG BAR */
.p-urg-bar { width:50px; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; }
.p-urg-fill { height:100%; border-radius:3px; }

/* BADGES */
.p-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:12px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; white-space:nowrap; }
.pb-urgente    { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
.pb-pronto     { background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; }
.pb-ok         { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
.pb-frio       { background:#f8fafc; color:#64748b; border:1px solid #e2e8f0; }
.pb-opor       { background:#faf5ff; color:#7c3aed; border:1px solid #e9d5ff; }
.pb-nuevo      { background:#eff6ff; color:#1d4ed8; border:1px solid #dbeafe; }
.pb-pend       { background:#fff7ed; color:#c2410c; border:1px solid #fed7aa; }
.pb-pago       { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
.pb-parc       { background:#fefce8; color:#a16207; border:1px solid #fde68a; }
.pb-deuda      { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }

/* INLINE COB */
.p-inline-sel { border:1.5px solid #e2e8f0; border-radius:5px; padding:4px 7px; font-family:'Barlow',sans-serif; font-size:10px; font-weight:600; color:#1e293b; background:white; outline:none; cursor:pointer; min-width:100px; }
.p-inline-sel:focus { border-color:#1d4ed8; }
.p-inline-date { border:1.5px solid #e2e8f0; border-radius:5px; padding:4px 7px; font-family:'Barlow',sans-serif; font-size:10px; color:#1e293b; background:white; outline:none; width:110px; }
.p-inline-date:focus { border-color:#1d4ed8; }
.p-btn-save-row { background:#16a34a; color:white; border:none; border-radius:5px; padding:5px 10px; font-family:'Barlow',sans-serif; font-size:10px; font-weight:700; cursor:pointer; }
.p-btn-save-row:hover { background:#15803d; }

/* RUTAS */
.p-ruta-wrap { display:flex; gap:14px; }
.p-ruta-side { width:300px; flex-shrink:0; display:flex; flex-direction:column; gap:12px; }
.p-ruta-main { flex:1; }
.p-ruta-card { background:white; border-radius:8px; padding:14px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.p-ruta-card h3 { font-size:13px; font-weight:800; color:#0f1f3d; margin-bottom:10px; }
.p-tramo-item { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:6px; border:1.5px solid #e2e8f0; background:#f1f5f9; cursor:pointer; transition:all 0.15s; margin-bottom:6px; }
.p-tramo-item:hover, .p-tramo-item.activo { border-color:#1d4ed8; background:#dbeafe; }
.p-tramo-num { background:#0f1f3d; color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; flex-shrink:0; }
.p-tramo-info { flex:1; }
.p-tramo-tit { font-size:11px; font-weight:700; color:#1e293b; }
.p-tramo-sub { font-size:9px; color:#64748b; }
.p-btn-tramo { background:#1d4ed8; color:white; border:none; border-radius:5px; padding:5px 10px; font-family:'Barlow',sans-serif; font-size:10px; font-weight:700; cursor:pointer; }
.p-parada { display:flex; align-items:center; gap:10px; padding:8px 12px; border-bottom:1px solid #e2e8f0; }
.p-parada:last-child { border-bottom:none; }
.p-parada-num { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; background:#0ea5e9; color:white; flex-shrink:0; }
.p-parada-num.origen { background:#16a34a; }
.p-parada-num.destino { background:#0f1f3d; }
.p-parada-nombre { font-size:11px; font-weight:700; color:#1e293b; }
.p-parada-dir { font-size:10px; color:#64748b; }
.p-parada-deuda { background:#fef2f2; color:#dc2626; border-radius:4px; padding:2px 6px; font-size:9px; font-weight:700; margin-left:auto; }
.p-chk { width:15px; height:15px; cursor:pointer; accent-color:#1d4ed8; }
.p-empty { padding:40px; text-align:center; color:#64748b; }
.p-empty .ico { font-size:32px; margin-bottom:8px; }
.p-empty p { font-size:12px; font-weight:600; }

/* MODAL */
.p-modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:500; align-items:center; justify-content:center; }
.p-modal-overlay.open { display:flex; }
.p-modal { background:white; border-radius:12px; padding:24px; width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
.p-modal h3 { font-size:16px; font-weight:800; color:#0f1f3d; margin-bottom:4px; }
.p-modal p  { font-size:12px; color:#64748b; margin-bottom:14px; }
.p-modal-field { display:flex; flex-direction:column; gap:4px; margin-bottom:12px; }
.p-modal-field label { font-size:10px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; }
.p-modal-field input, .p-modal-field textarea { border:1.5px solid #e2e8f0; border-radius:6px; padding:7px 10px; font-family:'Barlow',sans-serif; font-size:12px; outline:none; }
.p-modal-field textarea { resize:none; height:52px; }
.p-modal-btns { display:flex; gap:8px; justify-content:flex-end; }
.p-btn-modal-cancel { background:#f1f5f9; color:#64748b; border:none; border-radius:6px; padding:8px 16px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; cursor:pointer; }
.p-btn-modal-ok { background:#d97706; color:white; border:none; border-radius:6px; padding:8px 16px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; cursor:pointer; }

@media(max-width:600px){
  .p-tab-btn { font-size:9px; padding:12px 4px; }
  .p-tab-panel { padding:10px; }
  .p-stats { gap:6px; }
  .p-stat { min-width:80px; padding:8px 10px; }
  .p-stat-val { font-size:18px; }
  .p-ruta-wrap { flex-direction:column; }
  .p-ruta-side { width:100%; }
  .p-table { min-width:600px; }
}
</style>

<!-- MODAL REPROGRAMAR -->
<div class="p-modal-overlay" id="p-modal">
  <div class="p-modal">
    <h3>📅 Reprogramar cobro</h3>
    <p id="p-modal-info">—</p>
    <div class="p-modal-field"><label>Nueva fecha</label><input type="date" id="p-modal-fecha"></div>
    <div class="p-modal-field"><label>Observación</label><textarea id="p-modal-obs" placeholder="Ej: Cliente pidió esperar al viernes..."></textarea></div>
    <div class="p-modal-btns">
      <button class="p-btn-modal-cancel" id="p-modal-cancel">Cancelar</button>
      <button class="p-btn-modal-ok" id="p-modal-ok">Guardar</button>
    </div>
  </div>
</div>

<div class="p-wrap">
  <!-- TABS -->
  <div class="p-tab-nav">
    <button class="p-tab-btn activo" data-tab="predicciones">🎯 Predicciones</button>
    <button class="p-tab-btn" data-tab="cobranzas">💰 Cobranzas</button>
    <button class="p-tab-btn" data-tab="rutas">🗺️ Rutas</button>
  </div>

  <!-- PREDICCIONES -->
  <div class="p-tab-panel activo" id="p-panel-predicciones">
    <div class="p-stats">
      <div class="p-stat urgente"><div class="p-stat-lbl">🔴 Urgente</div><div class="p-stat-val" id="ps-urgente">—</div><div class="p-stat-sub">visitar ya</div></div>
      <div class="p-stat pronto"><div class="p-stat-lbl">🟡 Pronto</div><div class="p-stat-val" id="ps-pronto">—</div><div class="p-stat-sub">esta semana</div></div>
      <div class="p-stat opor"><div class="p-stat-lbl">🟣 Oportunidad</div><div class="p-stat-val" id="ps-opor">—</div></div>
      <div class="p-stat ok"><div class="p-stat-lbl">🟢 Al día</div><div class="p-stat-val" id="ps-ok">—</div></div>
      <div class="p-stat frio"><div class="p-stat-lbl">⚪ Frío</div><div class="p-stat-val" id="ps-frio">—</div></div>
      <div class="p-stat blue"><div class="p-stat-lbl">🔵 Sin historial</div><div class="p-stat-val" id="ps-nuevo">—</div></div>
    </div>
    <div class="p-filters">
      <label>Filtrar:</label>
      <input type="text" class="p-filter-inp" id="p-buscar" placeholder="🔍 Buscar cliente...">
      <div class="p-filter-sep"></div>
      <select class="p-filter-sel" id="p-categoria">
        <option value="">Todas las categorías</option>
        <option value="urgente">🔴 Urgente</option>
        <option value="pronto">🟡 Pronto</option>
        <option value="oportunidad">🟣 Oportunidad</option>
        <option value="ok">🟢 Al día</option>
        <option value="frio">⚪ Frío</option>
        <option value="nuevo">🔵 Sin historial</option>
      </select>
      <select class="p-filter-sel" id="p-zona"><option value="">Todas las zonas</option></select>
      <div class="p-filter-sep"></div>
      <button class="p-btn-act green" id="p-btn-agregar-ruta">➕ Agregar a ruta</button>
      <button class="p-btn-act" id="p-btn-actualizar-pred">↻ Actualizar</button>
    </div>
    <div class="p-table-wrap">
      <table class="p-table" id="p-tabla-pred">
        <thead><tr>
          <th><input type="checkbox" id="p-chk-all" class="p-chk"></th>
          <th>Cliente</th><th>Zona</th><th>Score</th><th>Categoría</th>
          <th>Urgencia</th><th>Último remito</th><th>Días sin visita</th>
          <th>Frec.</th><th>Próx. visita</th><th>Facturado</th><th>Ganancia</th><th>Remitos</th><th>Deuda</th>
        </tr></thead>
        <tbody id="p-tbody-pred">
          <tr><td colspan="14"><div class="p-empty"><div class="ico">🔌</div><p>Conectá el sistema</p></div></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- COBRANZAS -->
  <div class="p-tab-panel" id="p-panel-cobranzas">
    <div class="p-stats">
      <div class="p-stat urgente"><div class="p-stat-lbl">Pendientes</div><div class="p-stat-val" id="c-pend">—</div><div class="p-stat-sub" id="c-pend-m">$ —</div></div>
      <div class="p-stat pronto"><div class="p-stat-lbl">Parciales</div><div class="p-stat-val" id="c-parc">—</div><div class="p-stat-sub" id="c-parc-m">$ —</div></div>
      <div class="p-stat ok"><div class="p-stat-lbl">Cobrados</div><div class="p-stat-val" id="c-pago">—</div><div class="p-stat-sub" id="c-pago-m">$ —</div></div>
      <div class="p-stat blue"><div class="p-stat-lbl">Total pendiente</div><div class="p-stat-val" id="c-total">—</div></div>
    </div>
    <div class="p-filters">
      <label>Filtrar:</label>
      <input type="text" class="p-filter-inp" id="c-cliente" placeholder="🔍 Buscar cliente...">
      <div class="p-filter-sep"></div>
      <select class="p-filter-sel" id="c-estado">
        <option value="">Todos</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Parcial">Parcial</option>
        <option value="Pagado">Pagado</option>
      </select>
      <select class="p-filter-sel" id="c-vendedor"><option value="">Todos los vendedores</option></select>
      <button class="p-btn-act" id="p-btn-actualizar-cob">↻ Actualizar</button>
    </div>
    <div class="p-table-wrap">
      <table class="p-table">
        <thead><tr>
          <th>Comprobante</th><th>Fecha</th><th>Cliente</th><th>Dirección</th>
          <th>Vendedor</th><th>Total</th><th>Estado</th><th>Forma pago</th><th>Fecha cobro</th><th>Acciones</th>
        </tr></thead>
        <tbody id="p-tbody-cob">
          <tr><td colspan="10"><div class="p-empty"><div class="ico">🔌</div><p>Conectá el sistema</p></div></td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- RUTAS -->
  <div class="p-tab-panel" id="p-panel-rutas">
    <div class="p-filters">
      <label>Ruta actual:</label>
      <span id="p-ruta-count" style="font-size:12px;font-weight:700;color:#1e293b">0 locales</span>
      <div class="p-filter-sep"></div>
      <button class="p-btn-act orange" id="p-btn-limpiar-ruta">🗑 Limpiar</button>
      <button class="p-btn-act green"  id="p-btn-generar-tramos">🗺️ Generar tramos</button>
      <button class="p-btn-act"        id="p-btn-abrir-todos">🚀 Abrir todos en Maps</button>
    </div>
    <div class="p-ruta-wrap">
      <div class="p-ruta-side">
        <div class="p-ruta-card"><h3>📍 Tramos generados</h3><div id="p-tramo-list"><div class="p-empty"><p>Generá los tramos primero</p></div></div></div>
        <div class="p-ruta-card"><h3>⬛ Locales en ruta</h3><div id="p-ruta-locales" style="max-height:280px;overflow-y:auto"><div class="p-empty"><p>Sin locales</p></div></div></div>
      </div>
      <div class="p-ruta-main">
        <div class="p-ruta-card">
          <h3 id="p-tramo-titulo">Seleccioná un tramo</h3>
          <div id="p-parada-list"><div class="p-empty"><p>Los tramos se generan ordenando los locales por proximidad geográfica.</p></div></div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function initLogica(contenedor) {
  let dataPred = { conHistorial:[], sinHistorial:[] };
  let dataCobranzas = [];
  let rutaLocales = JSON.parse(localStorage.getItem('nk_ruta') || '[]');
  let tramos = [];
  let modalData = null;

  // ── Tabs ────────────────────────────────────────────────────
  contenedor.querySelectorAll('.p-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      contenedor.querySelectorAll('.p-tab-btn').forEach(b => b.classList.remove('activo'));
      contenedor.querySelectorAll('.p-tab-panel').forEach(p => p.classList.remove('activo'));
      btn.classList.add('activo');
      contenedor.querySelector(`#p-panel-${btn.dataset.tab}`).classList.add('activo');
      if (btn.dataset.tab === 'rutas') renderRutaLocales();
    });
  });

  // ── Conexión ────────────────────────────────────────────────
  async function conectar() {
    try {
      toast('⏳ Cargando panel...', 'loading', 10000);
      await Promise.all([cargarPredicciones(), cargarCobranzas()]);
      toast('✅ Panel cargado', 'ok', 2000);
    } catch(e) { toast('❌ Error al conectar', 'err', 5000); }
  }
  conectar();

  // ══════════════════════════════════════════════════════════
  // PREDICCIONES
  // ══════════════════════════════════════════════════════════
  async function cargarPredicciones() {
    contenedor.querySelector('#p-tbody-pred').innerHTML = '<tr><td colspan="14"><div class="p-empty"><div class="ico">⏳</div><p>Calculando predicciones...</p></div></td></tr>';
    const data = await apiFetch('getVisitasInteligentes');
    dataPred = data;
    poblarFiltrosPred();
    renderPredicciones([...dataPred.conHistorial, ...dataPred.sinHistorial.map(c=>({...c,categoria:'nuevo'}))]);
    actualizarStatsPred(dataPred.conHistorial, dataPred.sinHistorial.length);
  }

  contenedor.querySelector('#p-btn-actualizar-pred').addEventListener('click', cargarPredicciones);
  contenedor.querySelector('#p-buscar').addEventListener('input', filtrarPredicciones);
  contenedor.querySelector('#p-categoria').addEventListener('change', filtrarPredicciones);
  contenedor.querySelector('#p-zona').addEventListener('change', filtrarPredicciones);

  function poblarFiltrosPred() {
    const todos = [...dataPred.conHistorial, ...dataPred.sinHistorial];
    const zonas = [...new Set(todos.map(c=>c.zona).filter(z=>z&&z!=='-'))].sort();
    const sel = contenedor.querySelector('#p-zona');
    const act = sel.value;
    sel.innerHTML = '<option value="">Todas las zonas</option>';
    zonas.forEach(z => { const o=document.createElement('option'); o.value=z; o.textContent=z; sel.appendChild(o); });
    sel.value = act;
  }

  function actualizarStatsPred(lista, nNuevos) {
    const cats = {urgente:0,pronto:0,oportunidad:0,ok:0,frio:0};
    lista.forEach(c => { if(cats[c.categoria]!==undefined) cats[c.categoria]++; });
    contenedor.querySelector('#ps-urgente').textContent = cats.urgente;
    contenedor.querySelector('#ps-pronto').textContent  = cats.pronto;
    contenedor.querySelector('#ps-opor').textContent    = cats.oportunidad;
    contenedor.querySelector('#ps-ok').textContent      = cats.ok;
    contenedor.querySelector('#ps-frio').textContent    = cats.frio;
    contenedor.querySelector('#ps-nuevo').textContent   = nNuevos;
  }

  function filtrarPredicciones() {
    const q   = contenedor.querySelector('#p-buscar').value.toLowerCase();
    const cat = contenedor.querySelector('#p-categoria').value;
    const zona= contenedor.querySelector('#p-zona').value;
    const todos = [...dataPred.conHistorial, ...dataPred.sinHistorial.map(c=>({...c,categoria:'nuevo'}))];
    renderPredicciones(todos.filter(c => {
      if (q    && !`${c.nombre} ${c.id} ${c.direccion}`.toLowerCase().includes(q)) return false;
      if (cat  && c.categoria !== cat)  return false;
      if (zona && c.zona !== zona)      return false;
      return true;
    }));
  }

  const BAD_CAT = {
    urgente:    '<span class="p-badge pb-urgente">🔴 Urgente</span>',
    pronto:     '<span class="p-badge pb-pronto">🟡 Pronto</span>',
    oportunidad:'<span class="p-badge pb-opor">🟣 Oportunidad</span>',
    ok:         '<span class="p-badge pb-ok">🟢 Al día</span>',
    frio:       '<span class="p-badge pb-frio">⚪ Frío</span>',
    nuevo:      '<span class="p-badge pb-nuevo">🔵 Sin historial</span>',
  };

  function scoreColor(s) { return s>=75?'#16a34a':s>=50?'#d97706':s>=25?'#0ea5e9':'#94a3b8'; }
  function urgColor(u)   { return u>=1.0?'#dc2626':u>=0.7?'#d97706':'#16a34a'; }

  function renderPredicciones(lista) {
    const tbody = contenedor.querySelector('#p-tbody-pred');
    if (!lista.length) { tbody.innerHTML='<tr><td colspan="14"><div class="p-empty"><div class="ico">🔍</div><p>Sin resultados</p></div></td></tr>'; return; }
    const conH = lista.filter(c=>c.categoria!=='nuevo');
    const sinH = lista.filter(c=>c.categoria==='nuevo');
    let html = '';
    if (conH.length) {
      html += `<tr class="sec-hdr"><td colspan="14">📊 CON HISTORIAL (${conH.length})</td></tr>`;
      html += conH.map(c => {
        const enRuta = rutaLocales.some(r=>r.id===c.id);
        const urgPct = Math.min(c.urgencia*100,100);
        return `<tr data-id="${c.id}">
          <td><input type="checkbox" class="p-chk p-chk-pred" data-id="${c.id}" ${enRuta?'checked':''}></td>
          <td><strong>${c.nombre}</strong><br><span style="font-size:9px;color:#64748b">${c.id}${c.telefono?' · '+c.telefono:''}</span></td>
          <td style="font-size:10px">${c.zona||'—'}</td>
          <td><div class="p-score-wrap"><div class="p-score-bar"><div class="p-score-fill" style="width:${c.score}%;background:${scoreColor(c.score)}"></div></div><span class="p-score-num">${c.score}</span></div></td>
          <td>${BAD_CAT[c.categoria]||''}</td>
          <td><div style="display:flex;align-items:center;gap:6px"><div class="p-urg-bar"><div class="p-urg-fill" style="width:${urgPct}%;background:${urgColor(c.urgencia)}"></div></div><span style="font-size:10px;font-weight:700;color:${urgColor(c.urgencia)}">${c.urgencia.toFixed(1)}x</span></div></td>
          <td>${c.ultima_compra||'—'}</td>
          <td><strong>${c.dias_sin_compra===9999?'Nunca':c.dias_sin_compra+' días'}</strong></td>
          <td>c/${c.frec_recomendada}d</td>
          <td>${c.dias_para_visita<=0?'<strong style="color:#dc2626">YA</strong>':c.dias_para_visita+' días'}</td>
          <td>${formatPeso(c.total_facturado)}</td>
          <td>${formatPeso(c.total_ganancia)}</td>
          <td>${c.n_remitos}</td>
          <td>${c.deuda>0?`<span class="p-badge pb-deuda">${formatPeso(c.deuda)}</span>`:'—'}</td>
        </tr>`;
      }).join('');
    }
    if (sinH.length) {
      html += `<tr class="sec-hdr"><td colspan="14">🔵 SIN HISTORIAL (${sinH.length})</td></tr>`;
      html += sinH.map(c => {
        const enRuta = rutaLocales.some(r=>r.id===c.id);
        return `<tr data-id="${c.id}">
          <td><input type="checkbox" class="p-chk p-chk-pred" data-id="${c.id}" ${enRuta?'checked':''}></td>
          <td><strong>${c.nombre}</strong><br><span style="font-size:9px;color:#64748b">${c.id}</span></td>
          <td style="font-size:10px">${c.zona||'—'}</td>
          <td>—</td><td>${BAD_CAT.nuevo}</td>
          <td colspan="5" style="font-size:10px;color:#64748b;font-style:italic">Sin compras registradas</td>
          <td>${c.rubro||'—'}</td><td>—</td><td>0</td>
          <td>${c.deuda>0?`<span class="p-badge pb-deuda">${formatPeso(c.deuda)}</span>`:'—'}</td>
        </tr>`;
      }).join('');
    }
    tbody.innerHTML = html;
    // Bind checkboxes
    tbody.querySelectorAll('.p-chk-pred').forEach(chk => {
      chk.addEventListener('change', () => toggleRutaChk(chk.dataset.id, chk.checked));
    });
  }

  // ── Ruta desde predicciones ──────────────────────────────
  contenedor.querySelector('#p-chk-all').addEventListener('change', e => {
    contenedor.querySelectorAll('.p-chk-pred').forEach(chk => {
      chk.checked = e.target.checked;
      toggleRutaChk(chk.dataset.id, e.target.checked);
    });
  });

  contenedor.querySelector('#p-btn-agregar-ruta').addEventListener('click', () => {
    contenedor.querySelectorAll('.p-chk-pred:checked').forEach(chk => {
      if (!rutaLocales.some(r=>r.id===chk.dataset.id)) {
        const todos = [...dataPred.conHistorial, ...dataPred.sinHistorial];
        const c = todos.find(x=>x.id===chk.dataset.id);
        if (c) rutaLocales.push(c);
      }
    });
    guardarRuta();
    toast(`✅ ${rutaLocales.length} locales en ruta`, 'ok');
    contenedor.querySelector('#p-ruta-count').textContent = `${rutaLocales.length} locales`;
  });

  function toggleRutaChk(id, checked) {
    const todos = [...dataPred.conHistorial, ...dataPred.sinHistorial];
    const c = todos.find(x=>x.id===id);
    if (!c) return;
    const idx = rutaLocales.findIndex(r=>r.id===id);
    if (checked && idx<0) rutaLocales.push(c);
    else if (!checked && idx>=0) rutaLocales.splice(idx,1);
    guardarRuta();
    contenedor.querySelector('#p-ruta-count').textContent = `${rutaLocales.length} locales`;
  }

  function guardarRuta() { localStorage.setItem('nk_ruta', JSON.stringify(rutaLocales)); }

  // ══════════════════════════════════════════════════════════
  // COBRANZAS
  // ══════════════════════════════════════════════════════════
  async function cargarCobranzas() {
    contenedor.querySelector('#p-tbody-cob').innerHTML = '<tr><td colspan="10"><div class="p-empty"><div class="ico">⏳</div><p>Cargando...</p></div></td></tr>';
    const data = await apiFetch('getCobranzas');
    dataCobranzas = data.cobranzas || [];
    poblarFiltrosCob();
    renderCobranzas(dataCobranzas);
    actualizarStatsCob(dataCobranzas);
  }

  contenedor.querySelector('#p-btn-actualizar-cob').addEventListener('click', cargarCobranzas);
  contenedor.querySelector('#c-cliente').addEventListener('input', filtrarCobranzas);
  contenedor.querySelector('#c-estado').addEventListener('change', filtrarCobranzas);
  contenedor.querySelector('#c-vendedor').addEventListener('change', filtrarCobranzas);

  function poblarFiltrosCob() {
    const sel = contenedor.querySelector('#c-vendedor');
    const act = sel.value;
    const vend = [...new Set(dataCobranzas.map(c=>c.vendedor).filter(Boolean))].sort();
    sel.innerHTML = '<option value="">Todos los vendedores</option>';
    vend.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
    sel.value = act;
  }

  function filtrarCobranzas() {
    const q    = contenedor.querySelector('#c-cliente').value.toLowerCase();
    const est  = contenedor.querySelector('#c-estado').value;
    const vend = contenedor.querySelector('#c-vendedor').value;
    const f = dataCobranzas.filter(c => {
      if (q    && !`${c.cliente} ${c.comprobante} ${c.direccion||''}`.toLowerCase().includes(q)) return false;
      if (est  && c.estado   !== est)  return false;
      if (vend && c.vendedor !== vend) return false;
      return true;
    });
    renderCobranzas(f);
    actualizarStatsCob(f);
  }

  function actualizarStatsCob(lista) {
    const pend=lista.filter(c=>c.estado==='Pendiente');
    const parc=lista.filter(c=>c.estado==='Parcial');
    const pago=lista.filter(c=>c.estado==='Pagado');
    contenedor.querySelector('#c-pend').textContent   = pend.length;
    contenedor.querySelector('#c-pend-m').textContent = formatPeso(pend.reduce((s,c)=>s+c.total,0));
    contenedor.querySelector('#c-parc').textContent   = parc.length;
    contenedor.querySelector('#c-parc-m').textContent = formatPeso(parc.reduce((s,c)=>s+c.total,0));
    contenedor.querySelector('#c-pago').textContent   = pago.length;
    contenedor.querySelector('#c-pago-m').textContent = formatPeso(pago.reduce((s,c)=>s+c.total,0));
    contenedor.querySelector('#c-total').textContent  = formatPeso([...pend,...parc].reduce((s,c)=>s+c.total,0));
  }

  function badgeCob(e) {
    if (e==='Pagado')  return '<span class="p-badge pb-pago">✓ Pagado</span>';
    if (e==='Parcial') return '<span class="p-badge pb-parc">~ Parcial</span>';
    return '<span class="p-badge pb-pend">⏳ Pendiente</span>';
  }

  function renderCobranzas(lista) {
    const tbody = contenedor.querySelector('#p-tbody-cob');
    if (!lista.length) { tbody.innerHTML='<tr><td colspan="10"><div class="p-empty"><div class="ico">🔍</div><p>Sin resultados</p></div></td></tr>'; return; }
    tbody.innerHTML = lista.map(c => `
      <tr>
        <td><strong>${c.comprobante}</strong></td>
        <td>${c.fecha}</td>
        <td><strong>${c.cliente}</strong></td>
        <td style="font-size:10px;color:#64748b">${c.direccion||'—'}</td>
        <td>${c.vendedor||'—'}</td>
        <td><strong>${formatPeso(c.total)}</strong></td>
        <td>${badgeCob(c.estado)}</td>
        <td>
          <select class="p-inline-sel" id="pfp-${c.id_orden}">
            <option value="">— Forma —</option>
            <option value="Efectivo"      ${c.forma_pago==='Efectivo'?'selected':''}>💵 Efectivo</option>
            <option value="Transferencia" ${c.forma_pago==='Transferencia'?'selected':''}>📲 Transferencia</option>
            <option value="Cheque"        ${c.forma_pago==='Cheque'?'selected':''}>📄 Cheque</option>
          </select>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:5px">
            <input type="date" class="p-inline-date" id="pfc-${c.id_orden}" value="${fechaAInput(c.fecha_cobro)}">
            <button class="p-btn-save-row" style="background:#d97706" data-id="${c.id_orden}" data-comp="${c.comprobante}" data-cli="${c.cliente}">📅</button>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:5px">
            <select class="p-inline-sel" id="pest-${c.id_orden}">
              <option value="Pendiente" ${c.estado==='Pendiente'?'selected':''}>⏳ Pendiente</option>
              <option value="Parcial"   ${c.estado==='Parcial'?'selected':''}>~ Parcial</option>
              <option value="Pagado"    ${c.estado==='Pagado'?'selected':''}>✓ Pagado</option>
            </select>
            <button class="p-btn-save-row" data-guardar="${c.id_orden}">💾</button>
          </div>
        </td>
      </tr>`).join('');

    // Bind guardar cobro
    tbody.querySelectorAll('[data-guardar]').forEach(btn => {
      btn.addEventListener('click', () => guardarCobro(parseInt(btn.dataset.guardar)));
    });
    // Bind reprog
    tbody.querySelectorAll('[data-comp]').forEach(btn => {
      btn.addEventListener('click', () => abrirReprog(parseInt(btn.dataset.id), btn.dataset.comp, btn.dataset.cli));
    });
  }

  async function guardarCobro(idOrden) {
    const estado     = contenedor.querySelector(`#pest-${idOrden}`)?.value;
    const forma_pago = contenedor.querySelector(`#pfp-${idOrden}`)?.value;
    const fc         = contenedor.querySelector(`#pfc-${idOrden}`)?.value;
    try {
      await apiPost({ action:'actualizarCobro', id_orden:idOrden, estado, forma_pago, fecha_cobro:inputAFecha(fc) });
      const c = dataCobranzas.find(x=>x.id_orden==idOrden);
      if (c) { c.estado=estado; c.forma_pago=forma_pago; c.fecha_cobro=inputAFecha(fc); }
      actualizarStatsCob(dataCobranzas);
      toast('✅ Guardado', 'ok');
    } catch(e) { toast('❌ Error al guardar', 'err'); }
  }

  // ── Modal reprog ─────────────────────────────────────────
  function abrirReprog(idOrden, comp, cliente) {
    modalData = {idOrden, comp, cliente};
    contenedor.querySelector('#p-modal-info').textContent = `${comp} · ${cliente}`;
    const s=new Date(); s.setDate(s.getDate()+7);
    contenedor.querySelector('#p-modal-fecha').value = s.toISOString().split('T')[0];
    contenedor.querySelector('#p-modal-obs').value = '';
    contenedor.querySelector('#p-modal').classList.add('open');
  }

  contenedor.querySelector('#p-modal-cancel').addEventListener('click', () => { contenedor.querySelector('#p-modal').classList.remove('open'); modalData=null; });
  contenedor.querySelector('#p-modal-ok').addEventListener('click', async () => {
    if (!modalData) return;
    const fecha_cobro   = inputAFecha(contenedor.querySelector('#p-modal-fecha').value);
    const observaciones = contenedor.querySelector('#p-modal-obs').value;
    if (!fecha_cobro) { toast('⚠️ Seleccioná una fecha','warn'); return; }
    try {
      await apiPost({ action:'actualizarCobro', id_orden:modalData.idOrden, fecha_cobro, observaciones });
      toast(`✅ Reprogramado para ${fecha_cobro}`, 'ok');
      contenedor.querySelector('#p-modal').classList.remove('open');
      modalData = null;
    } catch(e) { toast('❌ Error','err'); }
  });

  // ══════════════════════════════════════════════════════════
  // RUTAS
  // ══════════════════════════════════════════════════════════
  function renderRutaLocales() {
    contenedor.querySelector('#p-ruta-count').textContent = `${rutaLocales.length} locales`;
    const div = contenedor.querySelector('#p-ruta-locales');
    if (!rutaLocales.length) { div.innerHTML='<div class="p-empty"><p>Sin locales</p></div>'; return; }
    div.innerHTML = rutaLocales.map((c,i) => `
      <div class="p-parada">
        <div class="p-parada-num">${i+1}</div>
        <div><div class="p-parada-nombre">${c.nombre}</div><div class="p-parada-dir">${c.direccion||'Sin dirección'}</div></div>
        <button data-qid="${c.id}" style="background:none;border:none;color:#cbd5e1;cursor:pointer;font-size:14px;margin-left:auto">×</button>
      </div>`).join('');
    div.querySelectorAll('[data-qid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = rutaLocales.findIndex(r=>r.id===btn.dataset.qid);
        if (idx>=0) rutaLocales.splice(idx,1);
        guardarRuta();
        renderRutaLocales();
      });
    });
  }

  contenedor.querySelector('#p-btn-limpiar-ruta').addEventListener('click', () => {
    if (!confirm('¿Limpiar todos los locales de la ruta?')) return;
    rutaLocales = []; tramos = [];
    guardarRuta();
    renderRutaLocales();
    contenedor.querySelector('#p-tramo-list').innerHTML = '<div class="p-empty"><p>Sin tramos</p></div>';
    contenedor.querySelector('#p-parada-list').innerHTML = '';
    contenedor.querySelector('#p-tramo-titulo').textContent = 'Seleccioná un tramo';
  });

  contenedor.querySelector('#p-btn-generar-tramos').addEventListener('click', () => {
    if (!rutaLocales.length) { toast('⚠️ Agregá locales primero','err'); return; }
    const ordenados = ordenarPorProx([...rutaLocales]);
    tramos = [];
    for (let i=0; i<ordenados.length; i+=9) tramos.push(ordenados.slice(i,i+9));
    renderTramos();
    toast(`✅ ${tramos.length} tramo(s) para ${ordenados.length} locales`, 'ok');
  });

  contenedor.querySelector('#p-btn-abrir-todos').addEventListener('click', () => {
    if (!tramos.length) { toast('⚠️ Generá los tramos primero','err'); return; }
    tramos.forEach((_,i) => setTimeout(()=>abrirTramoMaps(i), i*800));
    toast(`🗺️ Abriendo ${tramos.length} tramo(s)...`, 'loading', 3000);
  });

  function ordenarPorProx(locales) {
    const conC = locales.filter(l=>l.lat);
    const sinC = locales.filter(l=>!l.lat);
    if (conC.length < 2) {
      const porZona = {};
      locales.forEach(l => { const z=l.zona||'Sin zona'; if(!porZona[z])porZona[z]=[]; porZona[z].push(l); });
      return Object.values(porZona).flat();
    }
    let origen = {lat:-38.72,lon:-62.27};
    const pend = [...conC], ord = [];
    while (pend.length) {
      let minD=Infinity, minI=0;
      pend.forEach((l,i) => { const d=Math.hypot(l.lat-origen.lat,(l.lon||0)-(origen.lon||0)); if(d<minD){minD=d;minI=i;} });
      ord.push(pend.splice(minI,1)[0]);
      origen = ord[ord.length-1];
    }
    return [...ord,...sinC];
  }

  function renderTramos() {
    const list = contenedor.querySelector('#p-tramo-list');
    if (!tramos.length) { list.innerHTML='<div class="p-empty"><p>Sin tramos</p></div>'; return; }
    list.innerHTML = tramos.map((t,i) => `
      <div class="p-tramo-item" data-idx="${i}">
        <div class="p-tramo-num">${i+1}</div>
        <div class="p-tramo-info">
          <div class="p-tramo-tit">Tramo ${i+1} de ${tramos.length}</div>
          <div class="p-tramo-sub">${t.length} paradas</div>
        </div>
        <button class="p-btn-tramo" data-maps="${i}">Maps ↗</button>
      </div>`).join('');
    list.querySelectorAll('.p-tramo-item').forEach(el => {
      el.addEventListener('click', e => { if(!e.target.closest('[data-maps]')) verTramo(parseInt(el.dataset.idx)); });
    });
    list.querySelectorAll('[data-maps]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); abrirTramoMaps(parseInt(btn.dataset.maps)); });
    });
    verTramo(0);
  }

  function verTramo(idx) {
    contenedor.querySelectorAll('.p-tramo-item').forEach(t=>t.classList.remove('activo'));
    const el = contenedor.querySelector(`.p-tramo-item[data-idx="${idx}"]`);
    if (el) el.classList.add('activo');
    const t = tramos[idx], esUltimo = idx===tramos.length-1;
    contenedor.querySelector('#p-tramo-titulo').textContent = `Tramo ${idx+1} — ${t.length} paradas`;
    const paradas = [
      {nombre:'NK Distribuciones (inicio)', dir:'Patricios 1262, Bahía Blanca', tipo:'origen'},
      ...t.map(l=>({nombre:l.nombre,dir:l.direccion,deuda:l.deuda,tipo:'parada'})),
      esUltimo
        ? {nombre:'NK Distribuciones (regreso)',dir:'Patricios 1262, Bahía Blanca',tipo:'destino'}
        : {nombre:`→ Continúa Tramo ${idx+2}`,dir:tramos[idx+1][0].nombre,tipo:'destino'}
    ];
    contenedor.querySelector('#p-parada-list').innerHTML = paradas.map((p,i) => `
      <div class="p-parada">
        <div class="p-parada-num ${p.tipo==='origen'?'origen':p.tipo==='destino'?'destino':''}">${i+1}</div>
        <div><div class="p-parada-nombre">${p.nombre}</div><div class="p-parada-dir">${p.dir||''}</div></div>
        ${p.deuda>0?`<div class="p-parada-deuda">${formatPeso(p.deuda)}</div>`:''}
      </div>`).join('');
  }

  function abrirTramoMaps(idx) {
    const t = tramos[idx], esUltimo = idx===tramos.length-1;
    const emp = encodeURIComponent('Patricios 1262, Bahía Blanca, Buenos Aires');
    let url = `https://www.google.com/maps/dir/${emp}`;
    t.forEach(l => { url += `/${encodeURIComponent((l.direccion||l.nombre)+', Bahía Blanca, Buenos Aires')}`; });
    url += esUltimo ? `/${emp}` : `/${encodeURIComponent((tramos[idx+1][0].direccion||tramos[idx+1][0].nombre)+', Bahía Blanca, Buenos Aires')}`;
    window.open(url, '_blank');
  }
}
