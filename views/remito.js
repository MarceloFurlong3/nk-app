// ═══════════════════════════════════════════════════════════════
// NK DISTRIBUCIONES — views/remito.js
// Vista de creación de remito nuevo
// ═══════════════════════════════════════════════════════════════
import { apiFetch, apiPost, toast, formatPeso, fechaHoy, esc } from '../shared.js';

export function montarRemito(contenedor) {
  contenedor.innerHTML = getHTML();
  initLogica(contenedor);
}

// ── HTML de la vista ─────────────────────────────────────────────
function getHTML() {
  return `
<style>
.r-wrap { background:#cbd5e1; display:flex; flex-direction:column; align-items:center; padding:20px 16px 30px; gap:14px; min-height:100%; }

/* TOOLBAR */
.r-toolbar { width:210mm; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.r-btn { display:flex; align-items:center; gap:7px; padding:10px 18px; border:none; border-radius:6px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
.r-btn-print { background:#1d4ed8; color:white; box-shadow:0 3px 12px rgba(29,78,216,0.35); }
.r-btn-print:hover { background:#1e40af; transform:translateY(-1px); }
.r-btn-save { background:#16a34a; color:white; box-shadow:0 3px 12px rgba(22,163,74,0.35); }
.r-btn-save:disabled, .r-btn-save.locked { background:#94a3b8; box-shadow:none; cursor:not-allowed; transform:none; }
.r-btn-clear { background:white; color:#64748b; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
.r-btn-clear:hover { color:#ef4444; }
.r-vend-wrap { display:flex; align-items:center; gap:8px; background:white; border-radius:6px; padding:8px 14px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
.r-vend-wrap label { font-size:10px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; }
.r-vend-wrap select { border:none; outline:none; font-family:'Barlow',sans-serif; font-size:12px; font-weight:600; color:#1e293b; background:transparent; cursor:pointer; }

/* PDF AVISO */
.r-pdf-aviso { width:210mm; background:#eff6ff; border:1.5px solid #93c5fd; border-radius:6px; padding:10px 16px; display:none; align-items:center; gap:10px; }
.r-pdf-aviso.visible { display:flex; }
.r-pdf-aviso span { font-size:11px; font-weight:600; color:#1d4ed8; flex:1; }
.r-btn-confirmar { background:#16a34a; color:white; border:none; border-radius:6px; padding:8px 18px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; cursor:pointer; }
.r-btn-confirmar:hover { background:#15803d; }
.r-btn-cerrar-aviso { background:none; border:none; color:#64748b; font-size:18px; cursor:pointer; padding:0 4px; }
.r-btn-cerrar-aviso:hover { color:#ef4444; }

/* PAGE */
.r-page { width:210mm; background:white; box-shadow:0 20px 60px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden; }
.r-header { background:#0f1f3d; display:flex; align-items:stretch; min-height:95px; }
.r-brand { flex:1; padding:20px 26px; display:flex; flex-direction:column; justify-content:center; }
.r-brand-name { font-family:'Barlow Condensed',sans-serif; font-size:34px; font-weight:800; color:white; letter-spacing:2px; line-height:1; text-transform:uppercase; }
.r-brand-tag { font-size:10px; color:#0ea5e9; letter-spacing:4px; text-transform:uppercase; font-weight:600; margin-top:5px; }
.r-header-info { padding:20px 26px; display:flex; flex-direction:column; justify-content:center; gap:4px; border-left:1px solid rgba(255,255,255,0.1); }
.r-header-info span { font-size:10px; color:#dbeafe; font-weight:500; }
.r-header-info span strong { color:white; font-weight:700; }
.r-accent { height:5px; background:linear-gradient(90deg,#0ea5e9,#1d4ed8,#0f1f3d); }

.r-meta { display:flex; border-bottom:2px solid #e2e8f0; }
.r-meta-client { flex:1; padding:16px 22px; background:#f1f5f9; display:flex; flex-direction:column; gap:11px; }
.r-field { display:flex; align-items:center; gap:10px; position:relative; }
.r-field label { font-size:9px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; min-width:80px; }
.r-field input, .r-field select { flex:1; border:none; border-bottom:1.5px dashed #94a3b8; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:11px; font-weight:500; color:#1e293b; padding:2px 4px 4px; transition:border-color 0.15s; }
.r-field input:focus, .r-field select:focus { border-bottom-color:#1d4ed8; background:#bfdbfe; border-radius:2px 2px 0 0; }
.r-double { display:flex; }
.r-double .r-field { flex:1; }
.r-double .r-field+.r-field { border-left:1px solid #e2e8f0; padding-left:12px; margin-left:12px; }
.r-meta-right { width:165px; border-left:2px solid #e2e8f0; display:flex; flex-direction:column; }
.r-meta-box { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px 16px; border-bottom:1px solid #e2e8f0; }
.r-meta-box:last-child { border-bottom:none; }
.r-meta-box-lbl { font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; }
.r-num-display { width:100%; height:28px; background:#0f1f3d; border-radius:3px; display:flex; align-items:center; justify-content:center; font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:800; color:white; letter-spacing:3px; }
.r-meta-box input { width:100%; height:28px; background:white !important; border:1.5px solid #e2e8f0 !important; border-radius:3px; text-align:center; font-size:11px; font-weight:600; outline:none; font-family:'Barlow',sans-serif; }
.r-meta-box input:focus { border-color:#1d4ed8 !important; background:#bfdbfe !important; }

/* LISTA DE PRECIOS */
.r-lista-wrap { display:flex; align-items:center; gap:10px; padding:8px 22px; background:#eff6ff; border-bottom:2px solid #1d4ed8; }
.r-lista-wrap label { font-size:9px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; }
.r-lista-wrap select { border:1.5px solid #1d4ed8; border-radius:4px; padding:5px 12px; font-size:11px; font-weight:700; background:white; color:#0f1f3d; flex:1; max-width:340px; outline:none; font-family:'Barlow',sans-serif; }
.r-lista-badge { font-size:9px; font-weight:700; color:white; background:#1d4ed8; border-radius:20px; padding:3px 10px; white-space:nowrap; }

/* TABLA */
.r-table-wrap { padding:0 22px; margin-top:18px; }
.r-table-wrap table { width:100%; border-collapse:collapse; }
.r-table-wrap thead tr { background:#0f1f3d; }
.r-table-wrap thead th { padding:11px 8px; font-size:9px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1.2px; text-align:left; }
.r-table-wrap thead th:not(:first-child) { text-align:center; border-left:1px solid rgba(255,255,255,0.1); }
.r-table-wrap thead th.col-prod  { width:34%; }
.r-table-wrap thead th.col-canje { width:7%; }
.r-table-wrap thead th.col-desc  { width:7%; }
.r-table-wrap thead th.col-price { width:16%; }
.r-table-wrap thead th.col-qty   { width:10%; }
.r-table-wrap thead th.col-total { width:20%; }
.r-table-wrap thead th.col-del   { width:6%; }
.r-table-wrap tbody tr { border-bottom:1px solid #e2e8f0; }
.r-table-wrap tbody tr:nth-child(even) { background:#f1f5f9; }
.r-table-wrap tbody tr:nth-child(odd)  { background:white; }
.r-table-wrap tbody td { padding:3px 4px; height:30px; }
.r-table-wrap tbody td:not(:first-child) { text-align:center; border-left:1px solid #e2e8f0; }
.r-table-wrap tbody td input[type="number"] { font-size:10px; height:100%; padding:2px 6px; border:none; outline:none; background:transparent; font-family:'Barlow',sans-serif; color:#1e293b; width:100%; }
.r-table-wrap tbody td input[type="number"]:focus { background:#bfdbfe; border-radius:2px; }
.td-prod-wrap { position:relative; }
.td-prod-input { width:100%; border:none; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:10px; color:#1e293b; padding:2px 6px; height:100%; }
.td-prod-input:focus { background:#bfdbfe; }
.td-dropdown { display:none; position:absolute; top:100%; left:0; z-index:500; background:white; border:1.5px solid #e2e8f0; border-radius:0 0 6px 6px; min-width:260px; max-height:180px; overflow-y:auto; box-shadow:0 8px 20px rgba(0,0,0,0.15); }
.td-dropdown.open { display:block; }
.td-opt { padding:6px 10px; font-size:10px; color:#1e293b; cursor:pointer; }
.td-opt:hover { background:#bfdbfe; }
.td-canje { text-align:center !important; vertical-align:middle; }
.chk-canje { width:15px; height:15px; cursor:pointer; accent-color:#d97706; }
tbody tr.es-canje-row { background:#fff7ed !important; }
.inp-desc { width:100%; text-align:center !important; font-size:10px; font-weight:600; color:#7c3aed; border:none; border-bottom:1.5px dashed transparent !important; outline:none; background:transparent; transition:border-color 0.2s; font-family:'Barlow',sans-serif; }
.inp-desc:hover  { border-bottom-color:#c4b5fd !important; }
.inp-desc:focus  { border-bottom-color:#7c3aed !important; background:#f5f3ff; border-radius:2px; }
.inp-precio { text-align:center !important; font-weight:600; color:#1e293b; border:none; border-bottom:1.5px dashed transparent !important; outline:none; background:transparent; transition:border-color 0.2s; font-family:'Barlow',sans-serif; font-size:10px; width:100%; }
.inp-precio:hover  { border-bottom-color:#94a3b8 !important; }
.inp-precio:focus  { border-bottom-color:#1d4ed8 !important; background:#bfdbfe; border-radius:2px; }
.inp-precio.editado { color:#1d4ed8; font-style:italic; }
.td-total { font-size:10px; font-weight:600; color:#1e293b; text-align:center; padding:3px 8px; }
tr.tiene-descuento .td-total { color:#7c3aed; }
tr.es-canje-row .td-total { color:#d97706; }
.btn-del { background:none; border:none; cursor:pointer; color:#cbd5e1; font-size:16px; line-height:1; transition:color 0.15s; padding:0 4px; }
.btn-del:hover { color:#ef4444; }

/* SEARCHABLE */
.r-search-wrap { position:relative; flex:1; }
.r-search-input { width:100%; border:none; border-bottom:1.5px dashed #94a3b8; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:11px; font-weight:500; color:#1e293b; padding:2px 4px 4px; }
.r-search-input:focus { border-bottom-color:#1d4ed8; background:#bfdbfe; border-radius:2px 2px 0 0; }
.r-search-dd { display:none; position:absolute; top:100%; left:0; right:0; z-index:1000; background:white; border:1.5px solid #e2e8f0; border-radius:0 0 6px 6px; max-height:200px; overflow-y:auto; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
.r-search-dd.open { display:block; }
.r-search-opt { padding:7px 12px; font-size:11px; color:#1e293b; cursor:pointer; }
.r-search-opt:hover { background:#bfdbfe; }
.r-search-opt.sin-resultado { color:#64748b; font-style:italic; cursor:default; }

/* ADD ROW, TOTAL, OBS, FOOTER */
.r-add-btn { display:flex; align-items:center; gap:6px; margin:8px 22px 0; background:none; border:1.5px dashed #e2e8f0; border-radius:4px; padding:6px 14px; font-family:'Barlow',sans-serif; font-size:10px; font-weight:600; color:#64748b; cursor:pointer; transition:all 0.15s; width:calc(100% - 44px); }
.r-add-btn:hover { border-color:#1d4ed8; color:#1d4ed8; background:#f1f5f9; }
.r-total-row { display:flex; justify-content:flex-end; padding:0 22px; margin-top:10px; }
.r-total-box { display:flex; align-items:stretch; border:2px solid #0f1f3d; width:330px; }
.r-total-label { background:#0f1f3d; color:white; font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:11px 22px; display:flex; align-items:center; flex:1; justify-content:flex-end; }
.r-total-value { background:white; width:145px; border-left:2px solid #0f1f3d; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:#0f1f3d; padding:11px; }
.r-obs { margin:14px 22px 0; background:#f1f5f9; border:1.5px solid #e2e8f0; border-radius:4px; padding:9px 16px 12px; }
.r-obs-lbl { font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:5px; }
.r-obs textarea { width:100%; border:none; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:10px; color:#1e293b; resize:none; height:32px; }
.r-sigs { display:flex; gap:22px; padding:16px 22px; margin-top:12px; }
.r-sig { flex:1; display:flex; flex-direction:column; align-items:center; }
.r-sig-lbl { font-size:9px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px; background:#1d4ed8; width:100%; text-align:center; padding:8px 0; border-radius:3px 3px 0 0; }
.r-sig-area { width:100%; height:56px; background:#f1f5f9; border:1.5px solid #e2e8f0; border-top:none; border-radius:0 0 3px 3px; }
.r-sig-sub { font-size:8px; color:#64748b; font-style:italic; margin-top:5px; }
.r-footer { background:#0f1f3d; padding:11px 26px; display:flex; align-items:center; justify-content:center; gap:28px; margin-top:18px; }
.r-footer-item { display:flex; align-items:center; gap:6px; font-size:9px; color:#dbeafe; font-weight:600; }
.r-footer-icon { width:16px; height:16px; background:#0ea5e9; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:white; }
.r-footer-div { width:1px; height:16px; background:rgba(255,255,255,0.15); }

/* MOBILE */
@media(max-width:600px){
  .r-wrap { padding:0; background:#f1f5f9; }
  .r-toolbar { width:100%; padding:10px 12px; gap:8px; background:white; border-bottom:2px solid #e2e8f0; position:sticky; top:0; z-index:50; box-shadow:0 2px 12px rgba(0,0,0,0.08); }
  .r-btn { flex:1; justify-content:center; padding:12px 8px; font-size:11px; min-height:44px; }
  .r-btn-clear { flex:0 0 auto; padding:12px 14px; }
  .r-vend-wrap { width:100%; padding:10px 14px; }
  .r-pdf-aviso { width:100%; border-radius:0; border-left:none; border-right:none; flex-direction:column; }
  .r-pdf-aviso span { text-align:center; }
  .r-btn-confirmar { width:100%; padding:12px; }
  .r-page { width:100%; box-shadow:none; }
  .r-header { flex-direction:column; min-height:auto; }
  .r-brand { padding:14px 16px; }
  .r-brand-name { font-size:26px; }
  .r-header-info { border-left:none; border-top:1px solid rgba(255,255,255,0.1); padding:10px 16px; flex-direction:row; flex-wrap:wrap; gap:4px 18px; }
  .r-header-info span { font-size:9px; }
  .r-meta { flex-direction:column; }
  .r-meta-client { padding:14px 16px; gap:14px; }
  .r-field label { min-width:70px; }
  .r-field input, .r-field select, .r-search-input { font-size:14px !important; padding:6px 4px 6px !important; }
  .r-double { flex-direction:column; gap:12px; }
  .r-double .r-field+.r-field { border-left:none; padding-left:0; margin-left:0; border-top:1px solid #e2e8f0; padding-top:12px; }
  .r-meta-right { width:100%; border-left:none; border-top:2px solid #e2e8f0; flex-direction:row; }
  .r-meta-box { flex:1; border-bottom:none; border-right:1px solid #e2e8f0; padding:10px 12px; }
  .r-meta-box:last-child { border-right:none; }
  .r-num-display { font-size:20px; height:34px; }
  .r-lista-wrap { padding:10px 16px; flex-wrap:wrap; }
  .r-lista-wrap select { font-size:13px; max-width:100%; flex:1 1 100%; }
  .r-lista-badge { display:none; }
  .r-table-wrap { padding:0 12px; margin-top:12px; overflow-x:hidden; }
  .r-table-wrap table thead { display:none; }
  .r-table-wrap table, .r-table-wrap tbody { display:block; width:100%; }
  .r-table-wrap tbody tr { display:grid; grid-template-columns:1fr 1fr; border:1.5px solid #e2e8f0; border-radius:8px; margin-bottom:10px; background:white !important; box-shadow:0 1px 4px rgba(0,0,0,0.06); overflow:hidden; position:relative; }
  .r-table-wrap tbody tr.es-canje-row { background:#fff7ed !important; border-color:#d97706 !important; }
  .r-table-wrap tbody td:first-child { grid-column:1/-1; border-left:none !important; border-bottom:1px solid #e2e8f0; padding:8px 10px; background:#f1f5f9 !important; }
  .td-prod-input { font-size:13px !important; padding:4px 6px !important; font-weight:600; }
  .r-table-wrap tbody td:nth-child(4) { border-left:none !important; border-bottom:1px solid #e2e8f0; padding:8px 10px; }
  .r-table-wrap tbody td:nth-child(4)::before { content:'Precio'; display:block; font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .inp-precio { font-size:14px !important; text-align:left !important; }
  .r-table-wrap tbody td:nth-child(5) { border-bottom:1px solid #e2e8f0; padding:8px 10px; }
  .r-table-wrap tbody td:nth-child(5)::before { content:'Cant.'; display:block; font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .r-table-wrap tbody td:nth-child(5) input { font-size:14px !important; text-align:left !important; }
  .r-table-wrap tbody td.td-total { grid-column:1/-1; border-left:none !important; text-align:right !important; padding:8px 12px !important; font-size:13px !important; font-weight:800 !important; color:#0f1f3d !important; background:#dbeafe !important; border-top:1px solid #e2e8f0 !important; }
  .r-table-wrap tbody tr.es-canje-row td.td-total { background:#ffedd5 !important; color:#d97706 !important; }
  .r-table-wrap tbody tr.tiene-descuento td.td-total { color:#7c3aed !important; background:#f5f3ff !important; }
  .r-table-wrap tbody td.td-canje { grid-column:1; grid-row:2; border-left:none !important; border-bottom:1px solid #e2e8f0; padding:6px 10px; display:flex; align-items:center; gap:6px; }
  .r-table-wrap tbody td.td-canje::before { content:'Canje'; font-size:8px; font-weight:700; color:#d97706; text-transform:uppercase; letter-spacing:1px; }
  .chk-canje { width:18px; height:18px; }
  .r-table-wrap tbody td.td-desc { grid-column:2; grid-row:2; border-bottom:1px solid #e2e8f0; padding:6px 10px; }
  .r-table-wrap tbody td.td-desc::before { content:'Desc%'; display:block; font-size:8px; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
  .inp-desc { font-size:13px !important; text-align:left !important; }
  .r-table-wrap tbody td:last-child { position:absolute; top:6px; right:6px; border:none !important; background:transparent !important; padding:0 !important; height:auto !important; }
  .r-table-wrap tbody tr { position:relative; }
  .btn-del { font-size:20px; }
  .td-dropdown { min-width:unset; width:calc(100vw - 48px); left:0; }
  .td-opt { padding:12px 14px; font-size:13px; }
  .r-search-dd { max-height:240px; }
  .r-search-opt { padding:12px 14px; font-size:13px; }
  .r-add-btn { width:calc(100% - 24px); margin:10px 12px 0; padding:14px; font-size:13px; border-radius:8px; justify-content:center; min-height:48px; }
  .r-total-row { padding:0 12px; margin-top:14px; }
  .r-total-box { width:100%; }
  .r-total-label { font-size:16px; }
  .r-total-value { font-size:18px; width:160px; }
  .r-obs { margin:12px 12px 0; }
  .r-obs textarea { font-size:13px; height:50px; }
  .r-sigs { display:none; }
  .r-footer { gap:14px; flex-wrap:wrap; padding:12px 16px; }
  .r-table-wrap tbody tr.vacia { display:none; }
}

/* PRINT */
@media print {
  .r-toolbar, .r-pdf-aviso, .btn-del, .r-add-btn, .r-lista-badge { display:none !important; }
  .r-lista-wrap { display:none !important; }
  .r-wrap { background:none; padding:0; }
  .r-page { box-shadow:none; width:100%; }
  input, textarea { background:transparent !important; border:none !important; }
  thead th.col-canje, tbody td.td-canje, thead th.col-del, tbody td:last-child { display:none !important; }
  .r-table-wrap table { display:table !important; width:100% !important; }
  .r-sigs { display:flex !important; margin-top:40px !important; }
  .r-header { flex-direction:row !important; }
  tbody tr.vacia { display:none; }
}
@page { size:A4; margin:0; }
</style>

<div class="r-wrap">

  <!-- TOOLBAR -->
  <div class="r-toolbar">
    <button class="r-btn r-btn-print" id="r-btn-print">🖨️ Imprimir y guardar</button>
    <button class="r-btn r-btn-save locked" id="r-btn-save">💾 Enviar a Sheets</button>
    <button class="r-btn r-btn-clear" id="r-btn-clear">🗑 Nuevo</button>
    <div class="r-vend-wrap">
      <label>Vendedor:</label>
      <select id="r-sel-vendedor"><option value="">— Seleccioná —</option></select>
    </div>
  </div>

  <!-- PDF AVISO -->
  <div class="r-pdf-aviso" id="r-pdf-aviso">
    <span>✅ ¿Ya guardaste el PDF? Ahora podés enviarlo a Google Sheets.</span>
    <button class="r-btn-confirmar" id="r-btn-confirmar">💾 Sí, enviar a Sheets</button>
    <button class="r-btn-cerrar-aviso" id="r-btn-cerrar-aviso">×</button>
  </div>

  <!-- PAGE -->
  <div class="r-page">
    <div class="r-header">
      <div class="r-brand">
        <div class="r-brand-name">NK Distribuciones</div>
        <div class="r-brand-tag">Bahía Blanca · Buenos Aires</div>
      </div>
      <div class="r-header-info">
        <span><strong>CUIT:</strong> 20-39149565-4</span>
        <span><strong>Dirección:</strong> Patricios 1262, Bahía Blanca</span>
        <span><strong>CP:</strong> 8000 · Buenos Aires</span>
        <span><strong>Tel:</strong> 291-4463139</span>
      </div>
    </div>
    <div class="r-accent"></div>

    <div class="r-meta">
      <div class="r-meta-client">
        <div class="r-field">
          <label>Cliente</label>
          <div class="r-search-wrap">
            <input type="text" class="r-search-input" id="r-cliente-input" placeholder="Escribí para buscar..." autocomplete="off">
            <input type="hidden" id="r-cliente-idx">
            <div class="r-search-dd" id="r-cliente-dd"></div>
          </div>
        </div>
        <div class="r-double">
          <div class="r-field"><label>Dirección</label><input type="text" id="r-dir" readonly style="color:#64748b"></div>
          <div class="r-field"><label>Zona</label><input type="text" id="r-zona" readonly style="color:#64748b"></div>
        </div>
        <div class="r-double">
          <div class="r-field"><label>Teléfono</label><input type="text" id="r-tel" readonly style="color:#64748b"></div>
          <div class="r-field"><label>Día visita</label><input type="text" id="r-dia" readonly style="color:#64748b;font-weight:700"></div>
        </div>
      </div>
      <div class="r-meta-right">
        <div class="r-meta-box">
          <div class="r-meta-box-lbl">Remito N°</div>
          <div class="r-num-display" id="r-num-display">—</div>
        </div>
        <div class="r-meta-box">
          <div class="r-meta-box-lbl">Fecha</div>
          <input type="text" id="r-fecha" placeholder="dd/mm/aaaa">
        </div>
      </div>
    </div>

    <div class="r-lista-wrap">
      <label>Lista de precios:</label>
      <select id="r-sel-lista">
        <option value="precio_con_cambio">Lista Precios Con Cambio</option>
        <option value="precio_distribuidor">Lista de Precios PARA DISTRIBUIDOR</option>
        <option value="precio_sin_cambio">Lista de precios sin cambio</option>
        <option value="precio_zona_e">Lista De Precios zona E</option>
      </select>
      <span class="r-lista-badge" id="r-lista-badge">Con Cambio</span>
    </div>

    <div class="r-table-wrap">
      <table>
        <thead>
          <tr>
            <th class="col-prod">Producto / Descripción</th>
            <th class="col-canje">Canje</th>
            <th class="col-desc">Desc%</th>
            <th class="col-price">Precio Unit.</th>
            <th class="col-qty">Cant.</th>
            <th class="col-total">Total</th>
            <th class="col-del"></th>
          </tr>
        </thead>
        <tbody id="r-tbody"></tbody>
      </table>
    </div>

    <button class="r-add-btn" id="r-add-btn">＋ Agregar producto</button>

    <div class="r-total-row">
      <div class="r-total-box">
        <div class="r-total-label">Total</div>
        <div class="r-total-value" id="r-gran-total">$ 0,00</div>
      </div>
    </div>

    <div class="r-obs">
      <div class="r-obs-lbl">Observaciones</div>
      <textarea id="r-obs" placeholder="Notas, condiciones de pago, etc..."></textarea>
    </div>

    <div class="r-sigs">
      <div class="r-sig">
        <div class="r-sig-lbl">Recibí conforme</div>
        <div class="r-sig-area"></div>
        <div class="r-sig-sub">Firma y aclaración</div>
      </div>
      <div class="r-sig">
        <div class="r-sig-lbl">NK Distribuciones</div>
        <div class="r-sig-area"></div>
        <div class="r-sig-sub">Firma y sello</div>
      </div>
    </div>

    <div class="r-footer">
      <div class="r-footer-item"><div class="r-footer-icon">▶</div>@nk.distribuciones</div>
      <div class="r-footer-div"></div>
      <div class="r-footer-item"><div class="r-footer-icon">▶</div>@produccionesdelabahia</div>
      <div class="r-footer-div"></div>
      <div class="r-footer-item"><div class="r-footer-icon">▶</div>@Nk Studio</div>
    </div>
  </div>

</div>`;
}

// ── Lógica ───────────────────────────────────────────────────────
function initLogica(contenedor) {
  const LISTAS_LABELS = {
    precio_con_cambio: 'Con Cambio', precio_distribuidor: 'Distribuidor',
    precio_sin_cambio: 'Sin Cambio', precio_zona_e: 'Zona E'
  };

  let clientes = [], productos = [], vendedores = [], remitoNum = null;
  let filaIdx = 0, pdfListo = false;

  // ── Conectar ────────────────────────────────────────────────────
  async function conectar() {
    try {
      toast('⏳ Conectando...', 'loading', 8000);
      const data = await apiFetch('init');
      clientes = data.clientes || [];
      productos = data.productos || [];
      vendedores = data.vendedores || [];
      remitoNum = data.proximo_remito;
      poblarVendedores();
      mostrarRemitoNum();
      toast('✅ Conectado', 'ok');
    } catch(e) {
      toast('❌ No se pudo conectar', 'err', 6000);
    }
  }
  conectar();

  function poblarVendedores() {
    const sel = contenedor.querySelector('#r-sel-vendedor');
    sel.innerHTML = '<option value="">— Seleccioná —</option>';
    vendedores.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); });
  }

  function mostrarRemitoNum() {
    contenedor.querySelector('#r-num-display').textContent =
      remitoNum !== null ? String(remitoNum).padStart(4, '0') : '—';
  }

  // ── Lista de precios ────────────────────────────────────────────
  function getListaActiva() { return contenedor.querySelector('#r-sel-lista').value; }
  function getPrecioLista(prod) { return prod[getListaActiva()] || prod.precio_con_cambio || 0; }

  contenedor.querySelector('#r-sel-lista').addEventListener('change', () => {
    const lista = getListaActiva();
    contenedor.querySelector('#r-lista-badge').textContent = LISTAS_LABELS[lista] || lista;
    contenedor.querySelectorAll('#r-tbody tr').forEach(tr => {
      const i = tr.dataset.idx, prodIdx = tr.dataset.prodIdx;
      if (!prodIdx) return;
      const chk = tr.querySelector('.chk-canje');
      if (chk && chk.checked) return;
      const prod = productos[parseInt(prodIdx)];
      if (!prod) return;
      const inp = contenedor.querySelector(`#r-precio-${i}`);
      if (!inp) return;
      inp.dataset.precioLista = getPrecioLista(prod);
      inp.value = getPrecioLista(prod);
      inp.classList.remove('editado');
      calcularFila(inp);
    });
    resetPDF();
  });

  // ── Cliente search ──────────────────────────────────────────────
  const clienteInput = contenedor.querySelector('#r-cliente-input');
  const clienteDd    = contenedor.querySelector('#r-cliente-dd');

  clienteInput.addEventListener('input', () => filtrarClientes());
  clienteInput.addEventListener('focus', () => filtrarClientes());
  clienteInput.addEventListener('blur',  () => setTimeout(() => clienteDd.classList.remove('open'), 200));

  function filtrarClientes() {
    const q = clienteInput.value.toLowerCase();
    const filtrados = clientes.map((c,i)=>({c,i})).filter(({c}) => `${c.nombre} ${c.direccion||''}`.toLowerCase().includes(q));
    clienteDd.innerHTML = filtrados.length === 0
      ? '<div class="r-search-opt sin-resultado">Sin resultados</div>'
      : filtrados.map(({c,i}) => `<div class="r-search-opt" data-idx="${i}">${c.direccion ? `${c.nombre} — ${c.direccion}` : c.nombre}</div>`).join('');
    clienteDd.classList.add('open');
    clienteDd.querySelectorAll('.r-search-opt[data-idx]').forEach(el => {
      el.addEventListener('mousedown', () => seleccionarCliente(parseInt(el.dataset.idx)));
    });
    contenedor.querySelector('#r-cliente-idx').value = '';
    limpiarCliente();
    resetPDF();
  }

  function seleccionarCliente(idx) {
    const c = clientes[idx];
    contenedor.querySelector('#r-cliente-idx').value = idx;
    clienteInput.value = c.direccion ? `${c.nombre} — ${c.direccion}` : c.nombre;
    clienteDd.classList.remove('open');
    contenedor.querySelector('#r-dir').value  = c.direccion  || '';
    contenedor.querySelector('#r-zona').value = c.zona       || '';
    contenedor.querySelector('#r-tel').value  = c.telefono   || '';
    contenedor.querySelector('#r-dia').value  = c.dia_visita || '';
    resetPDF();
  }

  function limpiarCliente() {
    ['r-dir','r-zona','r-tel','r-dia'].forEach(id => { const el = contenedor.querySelector(`#${id}`); if(el) el.value=''; });
  }

  function getClienteSeleccionado() {
    const idx = contenedor.querySelector('#r-cliente-idx').value;
    return idx !== '' ? clientes[parseInt(idx)] : null;
  }

  // ── Filas ───────────────────────────────────────────────────────
  function crearFila() {
    const tbody = contenedor.querySelector('#r-tbody');
    const i = filaIdx++;
    const tr = document.createElement('tr');
    tr.dataset.idx = i;
    tr.dataset.prodIdx = '';
    tr.classList.add('vacia');
    tr.innerHTML = `
      <td><div class="td-prod-wrap">
        <input type="text" class="td-prod-input" id="r-prod-${i}" placeholder="Escribí para buscar..." autocomplete="off">
        <div class="td-dropdown" id="r-dd-${i}"></div>
      </div></td>
      <td class="td-canje"><input type="checkbox" class="chk-canje"></td>
      <td class="td-desc"><input type="number" class="inp-desc" id="r-desc-${i}" placeholder="0" min="0" max="100" step="1"></td>
      <td><input type="number" class="inp-precio" id="r-precio-${i}" placeholder="0,00" min="0" step="0.01" data-precio-lista="0" data-precio-canje="0"></td>
      <td><input type="number" class="inp-cant" id="r-cant-${i}" placeholder="0" min="0" step="1"></td>
      <td class="td-total" id="r-total-${i}"></td>
      <td><button class="btn-del">×</button></td>`;
    tbody.appendChild(tr);
    bindFila(tr, i);
  }

  function bindFila(tr, i) {
    const prodInput = tr.querySelector('.td-prod-input');
    const dd        = tr.querySelector('.td-dropdown');
    const chk       = tr.querySelector('.chk-canje');
    const descInp   = tr.querySelector('.inp-desc');
    const precioInp = tr.querySelector('.inp-precio');
    const cantInp   = tr.querySelector('.inp-cant');
    const delBtn    = tr.querySelector('.btn-del');

    prodInput.addEventListener('input', () => filtrarProductos(tr, i));
    prodInput.addEventListener('focus', () => filtrarProductos(tr, i));
    prodInput.addEventListener('blur',  () => setTimeout(() => dd.classList.remove('open'), 200));
    chk.addEventListener('change', () => onCanjeChange(tr, i));
    descInp.addEventListener('input',   () => calcularFila(descInp));
    precioInp.addEventListener('input',  () => onPrecioEditado(tr, i));
    cantInp.addEventListener('input',    () => calcularFila(cantInp));
    delBtn.addEventListener('click',     () => { tr.remove(); calcularTotal(); resetPDF(); });
  }

  function filtrarProductos(tr, i) {
    const dd = tr.querySelector('.td-dropdown');
    const q  = tr.querySelector('.td-prod-input').value.toLowerCase();
    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(q));
    dd.innerHTML = filtrados.length === 0
      ? '<div class="td-opt">Sin resultados</div>'
      : filtrados.map(p => `<div class="td-opt" data-nombre="${esc(p.nombre)}" data-pidx="${productos.indexOf(p)}">${esc(p.nombre)}</div>`).join('');
    dd.classList.add('open');
    dd.querySelectorAll('.td-opt[data-pidx]').forEach(el => {
      el.addEventListener('mousedown', () => seleccionarProducto(tr, i, parseInt(el.dataset.pidx)));
    });
    tr.dataset.prodIdx = '';
    resetPDF();
  }

  function seleccionarProducto(tr, i, prodIdx) {
    const prod = productos[prodIdx];
    const inp  = contenedor.querySelector(`#r-precio-${i}`);
    const chk  = tr.querySelector('.chk-canje');
    tr.querySelector('.td-prod-input').value = prod.nombre;
    tr.querySelector('.td-dropdown').classList.remove('open');
    tr.dataset.prodIdx = prodIdx;
    inp.dataset.precioLista = getPrecioLista(prod);
    inp.dataset.precioCanje = prod.precio_canje || 0;
    inp.value = chk.checked ? (prod.precio_canje || 0) : getPrecioLista(prod);
    inp.classList.remove('editado');
    tr.classList.remove('vacia');
    calcularFila(inp);
    resetPDF();
  }

  function onCanjeChange(tr, i) {
    const chk = tr.querySelector('.chk-canje');
    const inp = contenedor.querySelector(`#r-precio-${i}`);
    tr.classList.toggle('es-canje-row', chk.checked);
    if (chk.checked) {
      inp.value = parseFloat(inp.dataset.precioCanje) || 0;
    } else {
      const prodIdx = tr.dataset.prodIdx;
      if (prodIdx !== '') {
        const prod = productos[parseInt(prodIdx)];
        inp.dataset.precioLista = getPrecioLista(prod);
        inp.value = getPrecioLista(prod);
      } else {
        inp.value = parseFloat(inp.dataset.precioLista) || 0;
      }
    }
    inp.classList.remove('editado');
    calcularFila(chk);
    resetPDF();
  }

  function onPrecioEditado(tr, i) {
    const chk = tr.querySelector('.chk-canje');
    const inp = contenedor.querySelector(`#r-precio-${i}`);
    const ref = chk.checked ? (parseFloat(inp.dataset.precioCanje)||0) : (parseFloat(inp.dataset.precioLista)||0);
    inp.classList.toggle('editado', parseFloat(inp.value) !== ref && inp.value !== '');
    calcularFila(inp);
    resetPDF();
  }

  function calcularFila(el) {
    const tr      = el.closest('tr');
    const i       = tr.dataset.idx;
    const chk     = tr.querySelector('.chk-canje');
    const esCanje = chk && chk.checked;
    const precio  = parseFloat(contenedor.querySelector(`#r-precio-${i}`)?.value) || 0;
    const cant    = parseFloat(contenedor.querySelector(`#r-cant-${i}`)?.value)   || 0;
    const desc    = parseFloat(contenedor.querySelector(`#r-desc-${i}`)?.value)   || 0;
    const total   = esCanje ? 0 : precio * (1 - desc/100) * cant;
    tr.classList.toggle('tiene-descuento', !esCanje && desc > 0);
    const tdTotal = contenedor.querySelector(`#r-total-${i}`);
    if (tdTotal) tdTotal.textContent = cant > 0 ? '$ ' + formatPeso(total) : '';
    if (cant > 0 || precio > 0) tr.classList.remove('vacia');
    calcularTotal();
  }

  function calcularTotal() {
    let suma = 0;
    contenedor.querySelectorAll('#r-tbody tr').forEach(tr => {
      const i   = tr.dataset.idx;
      const chk = tr.querySelector('.chk-canje');
      if (chk && chk.checked) return;
      const precio = parseFloat(contenedor.querySelector(`#r-precio-${i}`)?.value) || 0;
      const cant   = parseFloat(contenedor.querySelector(`#r-cant-${i}`)?.value)   || 0;
      const desc   = parseFloat(contenedor.querySelector(`#r-desc-${i}`)?.value)   || 0;
      suma += precio * (1 - desc/100) * cant;
    });
    contenedor.querySelector('#r-gran-total').textContent = '$ ' + formatPeso(suma);
    return suma;
  }

  // ── PDF / guardar ───────────────────────────────────────────────
  function resetPDF() {
    pdfListo = false;
    contenedor.querySelector('#r-pdf-aviso').classList.remove('visible');
    const btn = contenedor.querySelector('#r-btn-save');
    btn.classList.add('locked');
  }

  function validar() {
    if (!getClienteSeleccionado())   { toast('⚠️ Seleccioná un cliente', 'err'); return false; }
    if (!contenedor.querySelector('#r-sel-vendedor').value) { toast('⚠️ Seleccioná un vendedor', 'err'); return false; }
    if (remitoNum === null)          { toast('⚠️ Sin conexión con el Sheet', 'err'); return false; }
    if (obtenerRows().length === 0)  { toast('⚠️ Agregá al menos un producto', 'err'); return false; }
    return true;
  }

  function obtenerRows() {
    const c       = getClienteSeleccionado();
    const vendedor= contenedor.querySelector('#r-sel-vendedor').value;
    const lista   = getListaActiva();
    const fecha   = contenedor.querySelector('#r-fecha').value;
    if (!c) return [];
    const rows = [];
    contenedor.querySelectorAll('#r-tbody tr').forEach(tr => {
      const i       = tr.dataset.idx;
      const prodIdx = tr.dataset.prodIdx;
      const chk     = tr.querySelector('.chk-canje');
      const cant    = parseFloat(contenedor.querySelector(`#r-cant-${i}`)?.value) || 0;
      const precio  = parseFloat(contenedor.querySelector(`#r-precio-${i}`)?.value) || 0;
      const desc    = parseFloat(contenedor.querySelector(`#r-desc-${i}`)?.value) || 0;
      const esCanje = chk && chk.checked;
      if (!prodIdx || cant === 0) return;
      const p = productos[parseInt(prodIdx)];
      const precioFinal = esCanje ? precio : precio * (1 - desc/100);
      rows.push({
        id_orden: remitoNum, fecha, cliente: c.nombre, direccion: c.direccion||'',
        zona: c.zona||'', telefono: c.telefono||'', dia_visita: c.dia_visita||'',
        producto: p.nombre, sku: p.sku||'', cantidad: cant,
        precio_unit: precioFinal, total: precioFinal * cant,
        descuento: esCanje ? 0 : desc/100,
        tipo: esCanje ? 'Canje' : (LISTAS_LABELS[lista]||lista),
        vendedor, es_canje: esCanje
      });
    });
    return rows;
  }

  contenedor.querySelector('#r-btn-print').addEventListener('click', () => {
    if (!validar()) return;
    contenedor.querySelectorAll('#r-tbody tr').forEach(tr => {
      const i = tr.dataset.idx;
      const prod = contenedor.querySelector(`#r-prod-${i}`);
      const cant = contenedor.querySelector(`#r-cant-${i}`);
      tr.classList.toggle('vacia', (!prod?.value||!prod.value.trim()) && !cant?.value);
    });
    window.print();
    setTimeout(() => {
      pdfListo = true;
      contenedor.querySelector('#r-pdf-aviso').classList.add('visible');
      const btn = contenedor.querySelector('#r-btn-save');
      btn.classList.remove('locked');
      toast('¿Guardaste el PDF? Ahora podés enviarlo a Sheets.', 'ok', 5000);
    }, 1000);
  });

  contenedor.querySelector('#r-btn-confirmar').addEventListener('click', guardarEnSheet);
  contenedor.querySelector('#r-btn-cerrar-aviso').addEventListener('click', () => resetPDF());
  contenedor.querySelector('#r-btn-save').addEventListener('click', guardarEnSheet);

  async function guardarEnSheet() {
    if (!pdfListo) { toast('⚠️ Primero imprimí el remito', 'err'); return; }
    const rows = obtenerRows();
    if (!rows.length) { toast('⚠️ No hay productos', 'err'); return; }
    const btn = contenedor.querySelector('#r-btn-save');
    btn.disabled = true;
    toast('⏳ Enviando a Sheets...', 'loading', 10000);
    try {
      await apiPost({ action: 'guardar', rows });
      const num = remitoNum;
      remitoNum++;
      mostrarRemitoNum();
      resetPDF();
      toast(`✅ Remito N° ${String(num).padStart(4,'0')} enviado`, 'ok', 5000);
    } catch(e) {
      toast('❌ Error al guardar', 'err', 6000);
    } finally {
      btn.disabled = false;
    }
  }

  contenedor.querySelector('#r-btn-clear').addEventListener('click', () => {
    if (!confirm('¿Limpiar el formulario para un nuevo remito?')) return;
    nuevoRemito();
  });

  contenedor.querySelector('#r-add-btn').addEventListener('click', crearFila);

  function nuevoRemito() {
    contenedor.querySelector('#r-cliente-input').value = '';
    contenedor.querySelector('#r-cliente-idx').value = '';
    contenedor.querySelector('#r-sel-lista').value = 'precio_con_cambio';
    contenedor.querySelector('#r-lista-badge').textContent = 'Con Cambio';
    limpiarCliente();
    contenedor.querySelector('#r-obs').value = '';
    contenedor.querySelector('#r-tbody').innerHTML = '';
    filaIdx = 0;
    calcularTotal();
    contenedor.querySelector('#r-fecha').value = fechaHoy();
    resetPDF();
    const cant = window.innerWidth <= 600 ? 3 : 12;
    for (let i = 0; i < cant; i++) crearFila();
  }

  // ── Init filas y fecha ──────────────────────────────────────────
  contenedor.querySelector('#r-fecha').value = fechaHoy();
  const cantInit = window.innerWidth <= 600 ? 3 : 12;
  for (let i = 0; i < cantInit; i++) crearFila();
}
