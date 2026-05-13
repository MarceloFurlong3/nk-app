// ═══════════════════════════════════════════════════════════════
// NK DISTRIBUCIONES — views/editor.js
// Vista de edición/eliminación de remitos existentes
// ═══════════════════════════════════════════════════════════════
import { apiFetch, apiPost, toast, formatPeso, esc } from '../shared.js';

export function montarEditor(contenedor) {
  contenedor.innerHTML = getHTML();
  initLogica(contenedor);
}

function getHTML() {
  return `
<style>
.e-wrap { background:#cbd5e1; display:flex; flex-direction:column; align-items:center; padding:20px 16px 30px; gap:14px; min-height:100%; }

/* LISTA PANEL */
.e-lista-panel { width:210mm; background:white; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.1); overflow:hidden; }
.e-lista-header { background:#0f1f3d; padding:14px 18px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.e-lista-header h2 { font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; color:white; letter-spacing:1px; flex:1; }
.e-lista-toggle { background:rgba(255,255,255,0.15); border:none; color:white; border-radius:4px; padding:6px 14px; font-family:'Barlow',sans-serif; font-size:11px; font-weight:700; cursor:pointer; }
.e-lista-toggle:hover { background:rgba(255,255,255,0.25); }
.e-filtros { padding:12px 16px; background:#f1f5f9; border-bottom:1.5px solid #e2e8f0; display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.e-filtro-group { display:flex; align-items:center; gap:6px; }
.e-filtro-group label { font-size:9px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; }
.e-filtro-inp { border:1.5px solid #e2e8f0; border-radius:4px; padding:5px 10px; font-family:'Barlow',sans-serif; font-size:11px; outline:none; background:white; color:#1e293b; }
.e-filtro-inp:focus { border-color:#1d4ed8; }
.e-filtro-count { font-size:10px; color:#64748b; font-weight:600; margin-left:auto; white-space:nowrap; }
.e-tabla-wrap { max-height:320px; overflow-y:auto; }
.e-tabla { width:100%; border-collapse:collapse; }
.e-tabla thead tr { background:#0f1f3d; position:sticky; top:0; z-index:2; }
.e-tabla thead th { padding:9px 10px; font-size:9px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px; text-align:left; white-space:nowrap; }
.e-tabla thead th:not(:first-child) { border-left:1px solid rgba(255,255,255,0.1); }
.e-tabla tbody tr { border-bottom:1px solid #e2e8f0; cursor:pointer; transition:background 0.1s; }
.e-tabla tbody tr:hover { background:#dbeafe !important; }
.e-tabla tbody tr:nth-child(even) { background:#f1f5f9; }
.e-tabla tbody tr:nth-child(odd)  { background:white; }
.e-tabla tbody td { padding:7px 10px; font-size:10px; color:#1e293b; }
.e-tabla tbody td:not(:first-child) { border-left:1px solid #e2e8f0; }
.e-tabla .col-num { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:800; color:#0f1f3d; letter-spacing:1px; }
.e-tabla .col-total { font-weight:700; color:#0f1f3d; text-align:right; }
.e-tabla .col-fecha { color:#64748b; white-space:nowrap; }
.e-tabla-empty { padding:30px; text-align:center; color:#64748b; font-size:12px; }
.badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; white-space:nowrap; }
.badge-pendiente { background:#fef3c7; color:#92400e; }
.badge-efectivo  { background:#dcfce7; color:#166534; }
.badge-transferencia { background:#dbeafe; color:#1e40af; }
.badge-default   { background:#e2e8f0; color:#64748b; }

/* BUSCADOR */
.e-buscador { width:210mm; background:white; border-radius:8px; padding:14px 18px; box-shadow:0 4px 16px rgba(0,0,0,0.1); display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.e-buscador label { font-size:11px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; }
.e-buscador-num { border:2px solid #e2e8f0; border-radius:6px; padding:9px 14px; font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800; color:#0f1f3d; letter-spacing:3px; width:120px; text-align:center; outline:none; }
.e-buscador-num:focus { border-color:#1d4ed8; }
.e-btn-buscar { background:#1d4ed8; color:white; border:none; border-radius:6px; padding:10px 22px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; cursor:pointer; }
.e-btn-buscar:hover { background:#1e40af; }
.e-buscador-hint { font-size:10px; color:#64748b; flex:1; min-width:120px; }

/* TOOLBAR */
.e-toolbar { width:210mm; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.e-btn { display:flex; align-items:center; gap:7px; padding:10px 18px; border:none; border-radius:6px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; cursor:pointer; transition:all 0.15s; }
.e-btn-print  { background:#1d4ed8; color:white; }
.e-btn-print:hover { background:#1e40af; }
.e-btn-save   { background:#16a34a; color:white; }
.e-btn-save:hover { background:#15803d; }
.e-btn-save:disabled { background:#86efac; cursor:not-allowed; }
.e-btn-delete { background:#dc2626; color:white; }
.e-btn-delete:hover { background:#b91c1c; }
.e-vend-wrap { display:flex; align-items:center; gap:8px; background:white; border-radius:6px; padding:8px 14px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
.e-vend-wrap label { font-size:10px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; }
.e-vend-wrap select { border:none; outline:none; font-family:'Barlow',sans-serif; font-size:12px; font-weight:600; color:#1e293b; background:transparent; cursor:pointer; }
.e-edit-badge { background:#fff3cd; border:1.5px solid #f59e0b; border-radius:6px; padding:8px 16px; font-size:11px; font-weight:700; color:#92400e; display:flex; align-items:center; gap:8px; }
.e-edit-badge .dot { width:8px; height:8px; border-radius:50%; background:#f59e0b; animation:epulse 1.2s infinite; }
@keyframes epulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* CONFIRMACIÓN */
.e-confirm { width:210mm; background:#fff3cd; border:1.5px solid #f59e0b; border-radius:6px; padding:12px 16px; display:none; align-items:center; gap:10px; flex-wrap:wrap; }
.e-confirm.visible { display:flex; }
.e-confirm span { font-size:11px; font-weight:600; color:#92400e; flex:1; }
.e-btn-confirm-ok { background:#16a34a; color:white; border:none; border-radius:6px; padding:9px 18px; font-family:'Barlow',sans-serif; font-size:12px; font-weight:700; cursor:pointer; }
.e-btn-confirm-ok:hover { background:#15803d; }
.e-btn-confirm-cancel { background:none; border:none; color:#64748b; font-size:20px; cursor:pointer; }
.e-btn-confirm-cancel:hover { color:#dc2626; }

/* EMPTY STATE */
.e-empty { width:210mm; background:white; border-radius:8px; padding:40px; text-align:center; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
.e-empty .ico { font-size:40px; margin-bottom:12px; }
.e-empty h3 { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:700; color:#0f1f3d; letter-spacing:1px; margin-bottom:6px; }
.e-empty p { font-size:11px; color:#64748b; line-height:1.6; }

/* PAGE */
.e-page { width:210mm; background:white; box-shadow:0 20px 60px rgba(245,158,11,0.35), 0 0 0 3px #f59e0b; display:none; flex-direction:column; overflow:hidden; position:relative; }
.e-page.visible { display:flex; }
.e-watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-35deg); font-family:'Barlow Condensed',sans-serif; font-size:72px; font-weight:800; color:rgba(245,158,11,0.06); letter-spacing:8px; pointer-events:none; z-index:1; white-space:nowrap; }
.e-header { background:#0f1f3d; display:flex; align-items:stretch; min-height:95px; }
.e-brand { flex:1; padding:20px 26px; display:flex; flex-direction:column; justify-content:center; }
.e-brand-name { font-family:'Barlow Condensed',sans-serif; font-size:34px; font-weight:800; color:white; letter-spacing:2px; line-height:1; text-transform:uppercase; }
.e-brand-tag { font-size:10px; color:#0ea5e9; letter-spacing:4px; text-transform:uppercase; font-weight:600; margin-top:5px; }
.e-header-info { padding:20px 26px; display:flex; flex-direction:column; justify-content:center; gap:4px; border-left:1px solid rgba(255,255,255,0.1); }
.e-header-info span { font-size:10px; color:#dbeafe; font-weight:500; }
.e-header-info span strong { color:white; font-weight:700; }
.e-accent { height:5px; background:linear-gradient(90deg,#0ea5e9,#1d4ed8,#0f1f3d); }
.e-meta { display:flex; border-bottom:2px solid #e2e8f0; }
.e-meta-client { flex:1; padding:16px 22px; background:#f1f5f9; display:flex; flex-direction:column; gap:11px; }
.e-field { display:flex; align-items:center; gap:10px; position:relative; }
.e-field label { font-size:9px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; white-space:nowrap; min-width:80px; }
.e-field input, .e-field select { flex:1; border:none; border-bottom:1.5px dashed #94a3b8; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:11px; font-weight:500; color:#1e293b; padding:2px 4px 4px; }
.e-field input:focus, .e-field select:focus { border-bottom-color:#1d4ed8; background:#bfdbfe; border-radius:2px 2px 0 0; }
.e-double { display:flex; }
.e-double .e-field { flex:1; }
.e-double .e-field+.e-field { border-left:1px solid #e2e8f0; padding-left:12px; margin-left:12px; }
.e-meta-right { width:165px; border-left:2px solid #e2e8f0; display:flex; flex-direction:column; }
.e-meta-box { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px 16px; border-bottom:1px solid #e2e8f0; }
.e-meta-box:last-child { border-bottom:none; }
.e-meta-box-lbl { font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; }
.e-num-display { width:100%; height:28px; background:#0f1f3d; border-radius:3px; display:flex; align-items:center; justify-content:center; font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:800; color:white; letter-spacing:3px; }
.e-meta-box input { width:100%; height:28px; background:white !important; border:1.5px solid #e2e8f0 !important; border-radius:3px; text-align:center; font-size:11px; font-weight:600; outline:none; font-family:'Barlow',sans-serif; }
.e-tipo-wrap { display:flex; align-items:center; gap:8px; padding:7px 22px; background:#f1f5f9; border-bottom:1px solid #e2e8f0; }
.e-tipo-wrap label { font-size:9px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; }
.e-tipo-wrap select { border:1.5px solid #e2e8f0; border-radius:4px; padding:4px 10px; font-size:10px; font-weight:600; background:white; width:auto; outline:none; font-family:'Barlow',sans-serif; }

/* SEARCH WRAP */
.e-search-wrap { position:relative; flex:1; }
.e-search-input { width:100%; border:none; border-bottom:1.5px dashed #94a3b8; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:11px; font-weight:500; color:#1e293b; padding:2px 4px 4px; }
.e-search-input:focus { border-bottom-color:#1d4ed8; background:#bfdbfe; border-radius:2px 2px 0 0; }
.e-search-dd { display:none; position:absolute; top:100%; left:0; right:0; z-index:1000; background:white; border:1.5px solid #e2e8f0; border-radius:0 0 6px 6px; max-height:200px; overflow-y:auto; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
.e-search-dd.open { display:block; }
.e-search-opt { padding:7px 12px; font-size:11px; color:#1e293b; cursor:pointer; }
.e-search-opt:hover { background:#bfdbfe; }

/* TABLA REMITO */
.e-table-wrap { padding:0 22px; margin-top:18px; }
.e-table-wrap table { width:100%; border-collapse:collapse; }
.e-table-wrap thead tr { background:#0f1f3d; }
.e-table-wrap thead th { padding:11px 8px; font-size:9px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1.2px; text-align:left; }
.e-table-wrap thead th:not(:first-child) { text-align:center; border-left:1px solid rgba(255,255,255,0.1); }
.e-table-wrap thead th.col-prod  { width:34%; }
.e-table-wrap thead th.col-canje { width:7%; }
.e-table-wrap thead th.col-desc  { width:7%; }
.e-table-wrap thead th.col-price { width:16%; }
.e-table-wrap thead th.col-qty   { width:10%; }
.e-table-wrap thead th.col-total { width:20%; }
.e-table-wrap thead th.col-del   { width:6%; }
.e-table-wrap tbody tr { border-bottom:1px solid #e2e8f0; }
.e-table-wrap tbody tr:nth-child(even) { background:#f1f5f9; }
.e-table-wrap tbody tr:nth-child(odd)  { background:white; }
.e-table-wrap tbody td { padding:3px 4px; height:30px; }
.e-table-wrap tbody td:not(:first-child) { text-align:center; border-left:1px solid #e2e8f0; }
.e-table-wrap tbody td input[type="number"] { font-size:10px; height:100%; padding:2px 6px; border:none; outline:none; background:transparent; font-family:'Barlow',sans-serif; color:#1e293b; width:100%; }
.e-table-wrap tbody td input[type="number"]:focus { background:#bfdbfe; border-radius:2px; }
.e-td-prod-wrap { position:relative; }
.e-td-prod-input { width:100%; border:none; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:10px; color:#1e293b; padding:2px 6px; height:100%; }
.e-td-prod-input:focus { background:#bfdbfe; }
.e-td-dropdown { display:none; position:absolute; top:100%; left:0; z-index:500; background:white; border:1.5px solid #e2e8f0; border-radius:0 0 6px 6px; min-width:260px; max-height:180px; overflow-y:auto; box-shadow:0 8px 20px rgba(0,0,0,0.15); }
.e-td-dropdown.open { display:block; }
.e-td-opt { padding:6px 10px; font-size:10px; color:#1e293b; cursor:pointer; }
.e-td-opt:hover { background:#bfdbfe; }
.e-td-canje { text-align:center !important; vertical-align:middle; }
.e-chk-canje { width:15px; height:15px; cursor:pointer; accent-color:#d97706; }
.e-table-wrap tbody tr.es-canje-row { background:#fff7ed !important; }
.e-inp-desc { width:100%; text-align:center !important; font-size:10px; font-weight:600; color:#7c3aed; border:none; border-bottom:1.5px dashed transparent !important; outline:none; background:transparent; transition:border-color 0.2s; font-family:'Barlow',sans-serif; }
.e-inp-desc:focus { border-bottom-color:#7c3aed !important; background:#f5f3ff; border-radius:2px; }
.e-inp-precio { text-align:center !important; font-weight:600; color:#1e293b; border:none; border-bottom:1.5px dashed transparent !important; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:10px; width:100%; }
.e-inp-precio:focus { border-bottom-color:#1d4ed8 !important; background:#bfdbfe; border-radius:2px; }
.e-inp-precio.editado { color:#1d4ed8; font-style:italic; }
.e-td-total { font-size:10px; font-weight:600; color:#1e293b; text-align:center; padding:3px 8px; }
.e-table-wrap tbody tr.tiene-descuento .e-td-total { color:#7c3aed; }
.e-table-wrap tbody tr.es-canje-row .e-td-total { color:#d97706; }
.e-btn-del { background:none; border:none; cursor:pointer; color:#cbd5e1; font-size:16px; line-height:1; transition:color 0.15s; padding:0 4px; }
.e-btn-del:hover { color:#dc2626; }
.e-add-btn { display:flex; align-items:center; gap:6px; margin:8px 22px 0; background:none; border:1.5px dashed #e2e8f0; border-radius:4px; padding:6px 14px; font-family:'Barlow',sans-serif; font-size:10px; font-weight:600; color:#64748b; cursor:pointer; transition:all 0.15s; width:calc(100% - 44px); }
.e-add-btn:hover { border-color:#1d4ed8; color:#1d4ed8; background:#f1f5f9; }
.e-total-row { display:flex; justify-content:flex-end; padding:0 22px; margin-top:10px; }
.e-total-box { display:flex; align-items:stretch; border:2px solid #0f1f3d; width:330px; }
.e-total-label { background:#0f1f3d; color:white; font-family:'Barlow Condensed',sans-serif; font-size:15px; font-weight:700; letter-spacing:2px; text-transform:uppercase; padding:11px 22px; display:flex; align-items:center; flex:1; justify-content:flex-end; }
.e-total-value { background:white; width:145px; border-left:2px solid #0f1f3d; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:#0f1f3d; padding:11px; }
.e-obs { margin:14px 22px 0; background:#f1f5f9; border:1.5px solid #e2e8f0; border-radius:4px; padding:9px 16px 12px; }
.e-obs-lbl { font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:5px; }
.e-obs textarea { width:100%; border:none; outline:none; background:transparent; font-family:'Barlow',sans-serif; font-size:10px; color:#1e293b; resize:none; height:32px; }
.e-sigs { display:flex; gap:22px; padding:16px 22px; margin-top:12px; }
.e-sig { flex:1; display:flex; flex-direction:column; align-items:center; }
.e-sig-lbl { font-size:9px; font-weight:700; color:white; text-transform:uppercase; letter-spacing:1px; background:#1d4ed8; width:100%; text-align:center; padding:8px 0; border-radius:3px 3px 0 0; }
.e-sig-area { width:100%; height:56px; background:#f1f5f9; border:1.5px solid #e2e8f0; border-top:none; border-radius:0 0 3px 3px; }
.e-footer { background:#0f1f3d; padding:11px 26px; display:flex; align-items:center; justify-content:center; gap:28px; margin-top:18px; }
.e-footer-item { display:flex; align-items:center; gap:6px; font-size:9px; color:#dbeafe; font-weight:600; }
.e-footer-icon { width:16px; height:16px; background:#0ea5e9; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:9px; color:white; }
.e-footer-div { width:1px; height:16px; background:rgba(255,255,255,0.15); }

/* MOBILE */
@media(max-width:600px){
  .e-wrap { padding:0; background:#f1f5f9; }
  .e-lista-panel, .e-buscador, .e-toolbar, .e-confirm, .e-empty { width:100%; border-radius:0; box-shadow:none; }
  .e-toolbar { padding:10px 12px; gap:8px; background:white; border-bottom:2px solid #e2e8f0; position:sticky; top:0; z-index:50; }
  .e-btn { flex:1; justify-content:center; padding:10px 6px; font-size:10px; min-height:44px; }
  .e-vend-wrap { width:100%; }
  .e-page { width:100%; box-shadow:none; }
  .e-header { flex-direction:column; min-height:auto; }
  .e-brand { padding:14px 16px; }
  .e-brand-name { font-size:26px; }
  .e-header-info { border-left:none; border-top:1px solid rgba(255,255,255,0.1); padding:10px 16px; flex-direction:row; flex-wrap:wrap; gap:4px 18px; }
  .e-meta { flex-direction:column; }
  .e-meta-client { padding:14px 16px; gap:14px; }
  .e-field label { min-width:70px; }
  .e-field input, .e-field select, .e-search-input { font-size:14px !important; padding:6px 4px 6px !important; }
  .e-double { flex-direction:column; gap:12px; }
  .e-double .e-field+.e-field { border-left:none; padding-left:0; margin-left:0; border-top:1px solid #e2e8f0; padding-top:12px; }
  .e-meta-right { width:100%; border-left:none; border-top:2px solid #e2e8f0; flex-direction:row; }
  .e-meta-box { flex:1; border-bottom:none; border-right:1px solid #e2e8f0; padding:10px 12px; }
  .e-meta-box:last-child { border-right:none; }
  .e-table-wrap { padding:0 12px; margin-top:12px; overflow-x:hidden; }
  .e-table-wrap table thead { display:none; }
  .e-table-wrap table, .e-table-wrap tbody { display:block; width:100%; }
  .e-table-wrap tbody tr { display:grid; grid-template-columns:1fr 1fr; border:1.5px solid #e2e8f0; border-radius:8px; margin-bottom:10px; background:white !important; box-shadow:0 1px 4px rgba(0,0,0,0.06); overflow:hidden; position:relative; }
  .e-table-wrap tbody tr.es-canje-row { background:#fff7ed !important; border-color:#d97706 !important; }
  .e-table-wrap tbody td:first-child { grid-column:1/-1; border-left:none !important; border-bottom:1px solid #e2e8f0; padding:8px 10px; background:#f1f5f9 !important; }
  .e-td-prod-input { font-size:13px !important; font-weight:600; }
  .e-table-wrap tbody td:nth-child(4) { border-left:none !important; border-bottom:1px solid #e2e8f0; padding:8px 10px; }
  .e-table-wrap tbody td:nth-child(4)::before { content:'Precio'; display:block; font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; margin-bottom:4px; }
  .e-inp-precio { font-size:14px !important; text-align:left !important; }
  .e-table-wrap tbody td:nth-child(5) { border-bottom:1px solid #e2e8f0; padding:8px 10px; }
  .e-table-wrap tbody td:nth-child(5)::before { content:'Cant.'; display:block; font-size:8px; font-weight:700; color:#1d4ed8; text-transform:uppercase; margin-bottom:4px; }
  .e-table-wrap tbody td.e-td-total { grid-column:1/-1; border-left:none !important; text-align:right !important; padding:8px 12px !important; font-size:13px !important; font-weight:800 !important; color:#0f1f3d !important; background:#dbeafe !important; border-top:1px solid #e2e8f0 !important; }
  .e-table-wrap tbody td.e-td-canje { grid-column:1; grid-row:2; border-left:none !important; border-bottom:1px solid #e2e8f0; padding:6px 10px; display:flex; align-items:center; gap:6px; }
  .e-table-wrap tbody td.e-td-canje::before { content:'Canje'; font-size:8px; font-weight:700; color:#d97706; text-transform:uppercase; }
  .e-table-wrap tbody td:last-child { position:absolute; top:6px; right:6px; border:none !important; background:transparent !important; padding:0 !important; height:auto !important; }
  .e-add-btn { width:calc(100% - 24px); margin:10px 12px 0; padding:14px; font-size:13px; border-radius:8px; justify-content:center; min-height:48px; }
  .e-total-row { padding:0 12px; margin-top:14px; }
  .e-total-box { width:100%; }
  .e-sigs { display:none; }
  .e-footer { gap:14px; flex-wrap:wrap; padding:12px 16px; }
}

/* PRINT */
@media print {
  .e-toolbar, .e-lista-panel, .e-buscador, .e-confirm, .e-empty, .e-btn-del, .e-add-btn { display:none !important; }
  .e-page { box-shadow:none !important; outline:none !important; display:flex !important; }
  .e-watermark { display:none !important; }
  input, textarea { background:transparent !important; }
  thead th.col-canje, tbody td.e-td-canje, thead th.col-del, tbody td:last-child { display:none; }
  .e-sigs { display:flex !important; }
  .e-header { flex-direction:row !important; min-height:95px !important; }
  tbody tr.vacia { display:none; }
}
@page { size:A4; margin:0; }
</style>

<div class="e-wrap">

  <!-- LISTA DE REMITOS -->
  <div class="e-lista-panel" id="e-lista-panel">
    <div class="e-lista-header">
      <h2>📋 Remitos guardados</h2>
      <button class="e-lista-toggle" id="e-lista-toggle">Ocultar ▲</button>
    </div>
    <div id="e-lista-body">
      <div class="e-filtros">
        <div class="e-filtro-group">
          <label>Local</label>
          <select class="e-filtro-inp" id="e-filtro-local">
            <option value="">Todos</option>
          </select>
        </div>
        <div class="e-filtro-group">
          <label>Estado</label>
          <select class="e-filtro-inp" id="e-filtro-estado">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div class="e-filtro-group">
          <label>Buscar</label>
          <input type="text" class="e-filtro-inp" id="e-filtro-texto" placeholder="Nombre del local..." style="min-width:140px">
        </div>
        <span class="e-filtro-count" id="e-filtro-count">— remitos</span>
      </div>
      <div class="e-tabla-wrap">
        <table class="e-tabla">
          <thead><tr>
            <th>N° Remito</th><th>Fecha</th><th>Local</th><th>Vendedor</th><th>Total</th><th>Estado</th>
          </tr></thead>
          <tbody id="e-lista-tbody">
            <tr><td colspan="6" class="e-tabla-empty">Conectá el Apps Script para ver los remitos</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- BUSCADOR -->
  <div class="e-buscador">
    <label>Remito N°</label>
    <input type="number" class="e-buscador-num" id="e-buscar-num" placeholder="0001" min="1">
    <button class="e-btn-buscar" id="e-btn-buscar">🔍 Cargar</button>
    <span class="e-buscador-hint">Escribí el número o hacé clic en un remito de la lista</span>
  </div>

  <!-- TOOLBAR (oculto hasta que se carga un remito) -->
  <div class="e-toolbar" id="e-toolbar" style="display:none">
    <div class="e-edit-badge"><div class="dot"></div> EDITANDO N° <span id="e-badge-num">—</span></div>
    <button class="e-btn e-btn-print" id="e-btn-print">🖨️ Imprimir</button>
    <button class="e-btn e-btn-save"  id="e-btn-save">💾 Guardar</button>
    <button class="e-btn e-btn-delete" id="e-btn-delete">🗑 Eliminar</button>
    <div class="e-vend-wrap">
      <label>Vendedor:</label>
      <select id="e-sel-vendedor"><option value="">— Seleccioná —</option></select>
    </div>
  </div>

  <!-- CONFIRMACIÓN -->
  <div class="e-confirm" id="e-confirm">
    <span id="e-confirm-txt">¿Confirmar?</span>
    <button class="e-btn-confirm-ok" id="e-btn-confirm-ok">Confirmar</button>
    <button class="e-btn-confirm-cancel" id="e-btn-confirm-cancel">×</button>
  </div>

  <!-- EMPTY STATE -->
  <div class="e-empty" id="e-empty">
    <div class="ico">📝</div>
    <h3>SELECCIONÁ UN REMITO</h3>
    <p>Hacé clic en un remito de la lista<br>o ingresá el número en el buscador.</p>
  </div>

  <!-- PAGE -->
  <div class="e-page" id="e-page">
    <div class="e-watermark">EDITANDO</div>
    <div class="e-header">
      <div class="e-brand">
        <div class="e-brand-name">NK Distribuciones</div>
        <div class="e-brand-tag">Bahía Blanca · Buenos Aires</div>
      </div>
      <div class="e-header-info">
        <span><strong>CUIT:</strong> 20-39149565-4</span>
        <span><strong>Dirección:</strong> Patricios 1262, Bahía Blanca</span>
        <span><strong>CP:</strong> 8000 · Buenos Aires</span>
        <span><strong>Tel:</strong> 291-4463139</span>
      </div>
    </div>
    <div class="e-accent"></div>
    <div class="e-meta">
      <div class="e-meta-client">
        <div class="e-field">
          <label>Cliente</label>
          <div class="e-search-wrap">
            <input type="text" class="e-search-input" id="e-cliente-input" placeholder="Escribí para buscar..." autocomplete="off">
            <input type="hidden" id="e-cliente-idx">
            <div class="e-search-dd" id="e-cliente-dd"></div>
          </div>
        </div>
        <div class="e-double">
          <div class="e-field"><label>Dirección</label><input type="text" id="e-dir" readonly style="color:#64748b"></div>
          <div class="e-field"><label>Zona</label><input type="text" id="e-zona" readonly style="color:#64748b"></div>
        </div>
        <div class="e-double">
          <div class="e-field"><label>Teléfono</label><input type="text" id="e-tel" readonly style="color:#64748b"></div>
          <div class="e-field"><label>Día visita</label><input type="text" id="e-dia" readonly style="color:#64748b;font-weight:700"></div>
        </div>
      </div>
      <div class="e-meta-right">
        <div class="e-meta-box">
          <div class="e-meta-box-lbl">Remito N°</div>
          <div class="e-num-display" id="e-num-display">—</div>
        </div>
        <div class="e-meta-box">
          <div class="e-meta-box-lbl">Fecha</div>
          <input type="text" id="e-fecha" placeholder="dd/mm/aaaa">
        </div>
      </div>
    </div>
    <div class="e-tipo-wrap">
      <label>Tipo:</label>
      <select id="e-sel-tipo">
        <option value="Venta">Venta</option>
        <option value="Devolución">Devolución</option>
        <option value="Consignación">Consignación</option>
      </select>
    </div>
    <div class="e-table-wrap">
      <table>
        <thead><tr>
          <th class="col-prod">Producto / Descripción</th>
          <th class="col-canje">Canje</th>
          <th class="col-desc">Desc%</th>
          <th class="col-price">Precio Unit.</th>
          <th class="col-qty">Cant.</th>
          <th class="col-total">Total</th>
          <th class="col-del"></th>
        </tr></thead>
        <tbody id="e-tbody"></tbody>
      </table>
    </div>
    <button class="e-add-btn" id="e-add-btn">＋ Agregar producto</button>
    <div class="e-total-row">
      <div class="e-total-box">
        <div class="e-total-label">Total</div>
        <div class="e-total-value" id="e-gran-total">$ 0,00</div>
      </div>
    </div>
    <div class="e-obs">
      <div class="e-obs-lbl">Observaciones</div>
      <textarea id="e-obs" placeholder="Notas, condiciones de pago, etc..."></textarea>
    </div>
    <div class="e-sigs">
      <div class="e-sig"><div class="e-sig-lbl">Recibí conforme</div><div class="e-sig-area"></div><div class="e-sig-sub">Firma y aclaración</div></div>
      <div class="e-sig"><div class="e-sig-lbl">NK Distribuciones</div><div class="e-sig-area"></div><div class="e-sig-sub">Firma y sello</div></div>
    </div>
    <div class="e-footer">
      <div class="e-footer-item"><div class="e-footer-icon">▶</div>@nk.distribuciones</div>
      <div class="e-footer-div"></div>
      <div class="e-footer-item"><div class="e-footer-icon">▶</div>@produccionesdelabahia</div>
      <div class="e-footer-div"></div>
      <div class="e-footer-item"><div class="e-footer-icon">▶</div>@Nk Studio</div>
    </div>
  </div>

</div>`;
}

function initLogica(contenedor) {
  let clientes = [], productos = [], vendedores = [], listaRemitos = [];
  let filaIdx = 0, remitoActual = null, listaVisible = true;
  let confirmCallback = null;

  // ── Conectar ──────────────────────────────────────────────────
  async function conectar() {
    try {
      toast('⏳ Conectando...', 'loading', 8000);
      const data = await apiFetch('init');
      clientes = data.clientes || [];
      productos = data.productos || [];
      vendedores = data.vendedores || [];
      poblarVendedores();
      toast('✅ Conectado', 'ok');
      cargarListaRemitos();
    } catch(e) { toast('❌ Error al conectar', 'err', 6000); }
  }
  conectar();

  function poblarVendedores() {
    const sel = contenedor.querySelector('#e-sel-vendedor');
    sel.innerHTML = '<option value="">— Seleccioná —</option>';
    vendedores.forEach(v => { const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); });
  }

  // ── Lista de remitos ─────────────────────────────────────────
  async function cargarListaRemitos() {
    try {
      const data = await apiFetch('getListaRemitos');
      listaRemitos = data.remitos || [];
      const locales = [...new Set(listaRemitos.map(r => r.cliente))].sort();
      const sel = contenedor.querySelector('#e-filtro-local');
      sel.innerHTML = '<option value="">Todos los locales</option>';
      locales.forEach(l => { const o = document.createElement('option'); o.value = l.toLowerCase(); o.textContent = l; sel.appendChild(o); });
      filtrarLista();
    } catch(e) {}
  }

  function badgeEstado(estado, formaPago) {
    const val = (formaPago && formaPago.toLowerCase() !== 'pendiente') ? formaPago : (estado || 'Pendiente');
    const map = { efectivo:'badge-efectivo', Efectivo:'badge-efectivo', transferencia:'badge-transferencia', Transferencia:'badge-transferencia', Pendiente:'badge-pendiente', pendiente:'badge-pendiente' };
    return `<span class="badge ${map[val]||'badge-default'}">${val}</span>`;
  }

  function filtrarLista() {
    const local  = contenedor.querySelector('#e-filtro-local').value.toLowerCase();
    const estado = contenedor.querySelector('#e-filtro-estado').value;
    const texto  = contenedor.querySelector('#e-filtro-texto').value.toLowerCase();
    const f = listaRemitos.filter(r => {
      if (local  && r.cliente.toLowerCase() !== local) return false;
      if (texto  && !r.cliente.toLowerCase().includes(texto)) return false;
      if (estado) {
        if (estado === 'Pendiente') { const fp = (r.forma_pago||'').toLowerCase(); if (fp && fp !== 'pendiente') return false; }
        else if ((r.forma_pago||'').toLowerCase() !== estado.toLowerCase()) return false;
      }
      return true;
    });
    const tbody = contenedor.querySelector('#e-lista-tbody');
    contenedor.querySelector('#e-filtro-count').textContent = `${f.length} remito${f.length !== 1 ? 's' : ''}`;
    if (!f.length) { tbody.innerHTML = '<tr><td colspan="6" class="e-tabla-empty">Sin resultados</td></tr>'; return; }
    tbody.innerHTML = f.map(r => `
      <tr data-id="${r.id_orden}">
        <td class="col-num">${r.comprobante}</td>
        <td class="col-fecha">${r.fecha}</td>
        <td>${r.cliente}</td>
        <td style="color:#64748b;font-size:9px">${r.vendedor||''}</td>
        <td class="col-total">$ ${formatPeso(r.total||0)}</td>
        <td>${badgeEstado(r.estado, r.forma_pago)}</td>
      </tr>`).join('');
    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', () => {
        contenedor.querySelector('#e-buscar-num').value = tr.dataset.id;
        buscarRemito();
      });
    });
  }

  contenedor.querySelector('#e-filtro-local').addEventListener('change', filtrarLista);
  contenedor.querySelector('#e-filtro-estado').addEventListener('change', filtrarLista);
  contenedor.querySelector('#e-filtro-texto').addEventListener('input', filtrarLista);

  contenedor.querySelector('#e-lista-toggle').addEventListener('click', () => {
    listaVisible = !listaVisible;
    contenedor.querySelector('#e-lista-body').style.display = listaVisible ? 'block' : 'none';
    contenedor.querySelector('#e-lista-toggle').textContent = listaVisible ? 'Ocultar ▲' : 'Mostrar ▼';
  });

  // ── Buscar remito ────────────────────────────────────────────
  contenedor.querySelector('#e-btn-buscar').addEventListener('click', buscarRemito);
  contenedor.querySelector('#e-buscar-num').addEventListener('keydown', e => { if (e.key === 'Enter') buscarRemito(); });

  async function buscarRemito() {
    const num = parseInt(contenedor.querySelector('#e-buscar-num').value);
    if (!num || num < 1) { toast('⚠️ Ingresá un número válido', 'warn'); return; }
    toast('⏳ Cargando remito...', 'loading', 8000);
    try {
      const data = await apiFetch('getRemito', { id: num });
      if (data.error || !data.rows?.length) { toast(`❌ No se encontró el remito N° ${String(num).padStart(4,'0')}`, 'err', 5000); return; }
      cargarRemitoEnForm(data);
      toast(`✅ Remito N° ${String(num).padStart(4,'0')} cargado`, 'ok');
    } catch(e) { toast('❌ Error al buscar', 'err', 6000); }
  }

  function cargarRemitoEnForm(data) {
    const rows = data.rows, primer = rows[0];
    remitoActual = primer.id_orden;
    contenedor.querySelector('#e-badge-num').textContent    = String(remitoActual).padStart(4,'0');
    contenedor.querySelector('#e-num-display').textContent  = String(remitoActual).padStart(4,'0');
    contenedor.querySelector('#e-fecha').value              = primer.fecha || '';
    contenedor.querySelector('#e-obs').value                = primer.observaciones || '';
    const fNoCanje = rows.find(r => r.tipo !== 'Canje');
    contenedor.querySelector('#e-sel-tipo').value = fNoCanje ? fNoCanje.tipo : 'Venta';
    const selV = contenedor.querySelector('#e-sel-vendedor');
    for (const o of selV.options) { if (o.value === primer.vendedor) { selV.value = primer.vendedor; break; } }
    const cliIdx = clientes.findIndex(c => c.nombre === primer.cliente);
    if (cliIdx >= 0) seleccionarCliente(cliIdx);
    else { contenedor.querySelector('#e-cliente-input').value = primer.cliente || ''; }
    contenedor.querySelector('#e-tbody').innerHTML = '';
    filaIdx = 0;
    rows.forEach(r => crearFilaConDatos(r));
    calcularTotal();
    contenedor.querySelector('#e-empty').style.display = 'none';
    contenedor.querySelector('#e-page').classList.add('visible');
    contenedor.querySelector('#e-toolbar').style.display = 'flex';
    setTimeout(() => contenedor.querySelector('#e-page').scrollIntoView({ behavior:'smooth', block:'start' }), 100);
  }

  // ── Cliente ──────────────────────────────────────────────────
  const clienteInput = contenedor.querySelector('#e-cliente-input');
  const clienteDd    = contenedor.querySelector('#e-cliente-dd');
  clienteInput.addEventListener('input', filtrarClientes);
  clienteInput.addEventListener('focus', filtrarClientes);
  clienteInput.addEventListener('blur',  () => setTimeout(() => clienteDd.classList.remove('open'), 200));

  function filtrarClientes() {
    const q = clienteInput.value.toLowerCase();
    const f = clientes.map((c,i)=>({c,i})).filter(({c}) => `${c.nombre} ${c.direccion||''}`.toLowerCase().includes(q));
    clienteDd.innerHTML = f.length === 0
      ? '<div class="e-search-opt">Sin resultados</div>'
      : f.map(({c,i}) => `<div class="e-search-opt" data-idx="${i}">${c.direccion ? `${c.nombre} — ${c.direccion}` : c.nombre}</div>`).join('');
    clienteDd.classList.add('open');
    clienteDd.querySelectorAll('.e-search-opt[data-idx]').forEach(el => {
      el.addEventListener('mousedown', () => seleccionarCliente(parseInt(el.dataset.idx)));
    });
  }

  function seleccionarCliente(idx) {
    const c = clientes[idx];
    contenedor.querySelector('#e-cliente-idx').value = idx;
    clienteInput.value = c.direccion ? `${c.nombre} — ${c.direccion}` : c.nombre;
    clienteDd.classList.remove('open');
    contenedor.querySelector('#e-dir').value  = c.direccion  || '';
    contenedor.querySelector('#e-zona').value = c.zona       || '';
    contenedor.querySelector('#e-tel').value  = c.telefono   || '';
    contenedor.querySelector('#e-dia').value  = c.dia_visita || '';
  }

  function getCliente() {
    const idx = contenedor.querySelector('#e-cliente-idx').value;
    if (idx !== '') return clientes[parseInt(idx)];
    const nombre = clienteInput.value.split('—')[0].trim();
    return nombre ? { nombre, direccion: contenedor.querySelector('#e-dir').value, zona: contenedor.querySelector('#e-zona').value, telefono: contenedor.querySelector('#e-tel').value, dia_visita: contenedor.querySelector('#e-dia').value } : null;
  }

  // ── Filas ────────────────────────────────────────────────────
  function crearFilaConDatos(datos) {
    const tbody = contenedor.querySelector('#e-tbody');
    const i = filaIdx++;
    const tr = document.createElement('tr');
    tr.dataset.idx = i;
    const prodIdx = productos.findIndex(p => p.nombre === datos.producto || p.sku === datos.sku);
    tr.dataset.prodIdx = prodIdx >= 0 ? prodIdx : '';
    const esCanje = datos.es_canje || datos.tipo === 'Canje';
    const desc = datos.descuento ? Math.round(datos.descuento * 100) : 0;
    const precio = datos.precio_unit_original !== undefined ? datos.precio_unit_original : datos.precio_unit;
    const mp = prodIdx >= 0 ? productos[prodIdx] : null;
    if (esCanje) tr.classList.add('es-canje-row');
    if (desc > 0) tr.classList.add('tiene-descuento');
    tr.innerHTML = `
      <td><div class="e-td-prod-wrap">
        <input type="text" class="e-td-prod-input" id="e-prod-${i}" value="${esc(datos.producto||'')}" autocomplete="off">
        <div class="e-td-dropdown" id="e-dd-${i}"></div>
      </div></td>
      <td class="e-td-canje"><input type="checkbox" class="e-chk-canje" ${esCanje?'checked':''}></td>
      <td><input type="number" class="e-inp-desc" id="e-desc-${i}" placeholder="0" min="0" max="100" step="1" value="${desc||''}"></td>
      <td><input type="number" class="e-inp-precio" id="e-precio-${i}" placeholder="0,00" min="0" step="0.01"
        data-precio-lista="${mp ? (mp.precio_venta||precio) : precio}"
        data-precio-canje="${mp ? (mp.precio_canje||0) : 0}"
        value="${precio||''}"></td>
      <td><input type="number" class="e-inp-cant" id="e-cant-${i}" placeholder="0" min="0" step="1" value="${datos.cantidad||''}"></td>
      <td class="e-td-total" id="e-total-${i}"></td>
      <td><button class="e-btn-del">×</button></td>`;
    tbody.appendChild(tr);
    bindFila(tr, i);
    calcularFila(tr.querySelector('.e-inp-cant'));
  }

  function crearFila() {
    const tbody = contenedor.querySelector('#e-tbody');
    const i = filaIdx++;
    const tr = document.createElement('tr');
    tr.dataset.idx = i; tr.dataset.prodIdx = ''; tr.classList.add('vacia');
    tr.innerHTML = `
      <td><div class="e-td-prod-wrap">
        <input type="text" class="e-td-prod-input" id="e-prod-${i}" placeholder="Escribí para buscar..." autocomplete="off">
        <div class="e-td-dropdown" id="e-dd-${i}"></div>
      </div></td>
      <td class="e-td-canje"><input type="checkbox" class="e-chk-canje"></td>
      <td><input type="number" class="e-inp-desc" id="e-desc-${i}" placeholder="0" min="0" max="100" step="1"></td>
      <td><input type="number" class="e-inp-precio" id="e-precio-${i}" placeholder="0,00" min="0" step="0.01" data-precio-lista="0" data-precio-canje="0"></td>
      <td><input type="number" class="e-inp-cant" id="e-cant-${i}" placeholder="0" min="0" step="1"></td>
      <td class="e-td-total" id="e-total-${i}"></td>
      <td><button class="e-btn-del">×</button></td>`;
    tbody.appendChild(tr);
    bindFila(tr, i);
  }

  function bindFila(tr, i) {
    const prodInp   = tr.querySelector('.e-td-prod-input');
    const dd        = tr.querySelector('.e-td-dropdown');
    const chk       = tr.querySelector('.e-chk-canje');
    const descInp   = tr.querySelector('.e-inp-desc');
    const precioInp = tr.querySelector('.e-inp-precio');
    const cantInp   = tr.querySelector('.e-inp-cant');
    const delBtn    = tr.querySelector('.e-btn-del');
    prodInp.addEventListener('input', () => filtrarProductos(tr, i));
    prodInp.addEventListener('focus', () => filtrarProductos(tr, i));
    prodInp.addEventListener('blur',  () => setTimeout(() => dd.classList.remove('open'), 200));
    chk.addEventListener('change', () => { tr.classList.toggle('es-canje-row', chk.checked); const ref = chk.checked ? parseFloat(precioInp.dataset.precioCanje)||0 : parseFloat(precioInp.dataset.precioLista)||0; precioInp.value = ref; calcularFila(precioInp); });
    descInp.addEventListener('input',   () => calcularFila(descInp));
    precioInp.addEventListener('input',  () => { const ref = chk.checked ? parseFloat(precioInp.dataset.precioCanje)||0 : parseFloat(precioInp.dataset.precioLista)||0; precioInp.classList.toggle('editado', parseFloat(precioInp.value) !== ref && precioInp.value !== ''); calcularFila(precioInp); });
    cantInp.addEventListener('input',    () => calcularFila(cantInp));
    delBtn.addEventListener('click',     () => { tr.remove(); calcularTotal(); });
  }

  function filtrarProductos(tr, i) {
    const dd = tr.querySelector('.e-td-dropdown');
    const q  = tr.querySelector('.e-td-prod-input').value.toLowerCase();
    const f  = productos.filter(p => p.nombre.toLowerCase().includes(q));
    dd.innerHTML = f.length === 0 ? '<div class="e-td-opt">Sin resultados</div>' : f.map(p => `<div class="e-td-opt" data-pidx="${productos.indexOf(p)}">${esc(p.nombre)}</div>`).join('');
    dd.classList.add('open');
    dd.querySelectorAll('.e-td-opt[data-pidx]').forEach(el => {
      el.addEventListener('mousedown', () => {
        const prod = productos[parseInt(el.dataset.pidx)];
        tr.querySelector('.e-td-prod-input').value = prod.nombre;
        dd.classList.remove('open');
        tr.dataset.prodIdx = el.dataset.pidx;
        const inp = contenedor.querySelector(`#e-precio-${i}`);
        inp.dataset.precioLista = prod.precio_venta || 0;
        inp.dataset.precioCanje = prod.precio_canje || 0;
        const chk = tr.querySelector('.e-chk-canje');
        inp.value = chk.checked ? (prod.precio_canje||0) : (prod.precio_venta||0);
        inp.classList.remove('editado');
        tr.classList.remove('vacia');
        calcularFila(inp);
      });
    });
    tr.dataset.prodIdx = '';
  }

  function calcularFila(el) {
    const tr      = el.closest('tr');
    const i       = tr.dataset.idx;
    const chk     = tr.querySelector('.e-chk-canje');
    const esCanje = chk && chk.checked;
    const precio  = parseFloat(contenedor.querySelector(`#e-precio-${i}`)?.value) || 0;
    const cant    = parseFloat(contenedor.querySelector(`#e-cant-${i}`)?.value)   || 0;
    const desc    = parseFloat(contenedor.querySelector(`#e-desc-${i}`)?.value)   || 0;
    const total   = esCanje ? 0 : precio * (1 - desc/100) * cant;
    tr.classList.toggle('tiene-descuento', !esCanje && desc > 0);
    const td = contenedor.querySelector(`#e-total-${i}`);
    if (td) td.textContent = cant > 0 ? '$ ' + formatPeso(total) : '';
    if (cant > 0 || precio > 0) tr.classList.remove('vacia');
    calcularTotal();
  }

  function calcularTotal() {
    let suma = 0;
    contenedor.querySelectorAll('#e-tbody tr').forEach(tr => {
      const i   = tr.dataset.idx;
      const chk = tr.querySelector('.e-chk-canje');
      if (chk && chk.checked) return;
      suma += (parseFloat(contenedor.querySelector(`#e-precio-${i}`)?.value)||0) * (1 - (parseFloat(contenedor.querySelector(`#e-desc-${i}`)?.value)||0)/100) * (parseFloat(contenedor.querySelector(`#e-cant-${i}`)?.value)||0);
    });
    contenedor.querySelector('#e-gran-total').textContent = '$ ' + formatPeso(suma);
  }

  contenedor.querySelector('#e-add-btn').addEventListener('click', crearFila);

  // ── Obtener rows ─────────────────────────────────────────────
  function obtenerRows() {
    const c       = getCliente();
    const vendedor= contenedor.querySelector('#e-sel-vendedor').value;
    const tipo    = contenedor.querySelector('#e-sel-tipo').value;
    const fecha   = contenedor.querySelector('#e-fecha').value;
    const obs     = contenedor.querySelector('#e-obs').value;
    if (!c) return [];
    const rows = [];
    contenedor.querySelectorAll('#e-tbody tr').forEach(tr => {
      const i       = tr.dataset.idx;
      const prodIdx = tr.dataset.prodIdx;
      const chk     = tr.querySelector('.e-chk-canje');
      const cant    = parseFloat(contenedor.querySelector(`#e-cant-${i}`)?.value)    || 0;
      const precio  = parseFloat(contenedor.querySelector(`#e-precio-${i}`)?.value)  || 0;
      const desc    = parseFloat(contenedor.querySelector(`#e-desc-${i}`)?.value)    || 0;
      const nombre  = contenedor.querySelector(`#e-prod-${i}`)?.value || '';
      const esCanje = chk && chk.checked;
      if (!nombre.trim() || cant === 0) return;
      const p = prodIdx !== '' ? productos[parseInt(prodIdx)] : null;
      const precioFinal = esCanje ? precio : precio * (1 - desc/100);
      rows.push({
        id_orden: remitoActual, fecha, cliente: c.nombre,
        direccion: c.direccion||'', zona: c.zona||'', telefono: c.telefono||'', dia_visita: c.dia_visita||'',
        producto: nombre, sku: p ? (p.sku||'') : '',
        cantidad: cant, precio_unit: precioFinal, precio_unit_original: precio,
        total: precioFinal * cant, descuento: esCanje ? 0 : desc/100,
        tipo: esCanje ? 'Canje' : tipo, vendedor, es_canje: esCanje, observaciones: obs
      });
    });
    return rows;
  }

  function validar() {
    if (!getCliente())    { toast('⚠️ Seleccioná un cliente', 'err'); return false; }
    if (!contenedor.querySelector('#e-sel-vendedor').value) { toast('⚠️ Seleccioná un vendedor', 'err'); return false; }
    if (!remitoActual)    { toast('⚠️ No hay remito cargado', 'err'); return false; }
    if (!obtenerRows().length) { toast('⚠️ Agregá al menos un producto', 'err'); return false; }
    return true;
  }

  // ── Confirmación ─────────────────────────────────────────────
  function mostrarConfirm(texto, callback) {
    contenedor.querySelector('#e-confirm-txt').textContent = texto;
    confirmCallback = callback;
    contenedor.querySelector('#e-confirm').classList.add('visible');
  }

  contenedor.querySelector('#e-btn-confirm-ok').addEventListener('click', () => {
    contenedor.querySelector('#e-confirm').classList.remove('visible');
    if (confirmCallback) { confirmCallback(); confirmCallback = null; }
  });
  contenedor.querySelector('#e-btn-confirm-cancel').addEventListener('click', () => {
    contenedor.querySelector('#e-confirm').classList.remove('visible');
    confirmCallback = null;
  });

  // ── Guardar ──────────────────────────────────────────────────
  contenedor.querySelector('#e-btn-save').addEventListener('click', () => {
    if (!validar()) return;
    mostrarConfirm(`⚠️ Vas a reemplazar el remito N° ${String(remitoActual).padStart(4,'0')}. ¿Confirmar?`, ejecutarGuardado);
  });

  async function ejecutarGuardado() {
    const rows = obtenerRows();
    if (!rows.length) return;
    const btn = contenedor.querySelector('#e-btn-save');
    btn.disabled = true;
    toast('⏳ Guardando...', 'loading', 15000);
    try {
      await apiPost({ action: 'editarRemito', rows });
      toast(`✅ Remito N° ${String(remitoActual).padStart(4,'0')} actualizado`, 'ok', 5000);
      setTimeout(() => cargarListaRemitos(), 1500);
    } catch(e) { toast('❌ Error al guardar', 'err', 6000); }
    finally { btn.disabled = false; }
  }

  // ── Eliminar ─────────────────────────────────────────────────
  contenedor.querySelector('#e-btn-delete').addEventListener('click', () => {
    if (!remitoActual) return;
    mostrarConfirm(`🗑 Vas a ELIMINAR el remito N° ${String(remitoActual).padStart(4,'0')}. ¿Estás seguro?`, ejecutarEliminar);
  });

  async function ejecutarEliminar() {
    toast('⏳ Eliminando...', 'loading', 10000);
    try {
      await apiPost({ action: 'eliminarRemito', id_orden: remitoActual });
      const num = remitoActual;
      remitoActual = null;
      contenedor.querySelector('#e-empty').style.display = 'block';
      contenedor.querySelector('#e-page').classList.remove('visible');
      contenedor.querySelector('#e-toolbar').style.display = 'none';
      contenedor.querySelector('#e-buscar-num').value = '';
      toast(`🗑 Remito N° ${String(num).padStart(4,'0')} eliminado`, 'warn', 5000);
      setTimeout(() => cargarListaRemitos(), 1500);
    } catch(e) { toast('❌ Error al eliminar', 'err', 6000); }
  }

  // ── Imprimir ─────────────────────────────────────────────────
  contenedor.querySelector('#e-btn-print').addEventListener('click', () => {
    if (!remitoActual) return;
    contenedor.querySelectorAll('#e-tbody tr').forEach(tr => {
      const i = tr.dataset.idx;
      const prod = contenedor.querySelector(`#e-prod-${i}`);
      const cant = contenedor.querySelector(`#e-cant-${i}`);
      tr.classList.toggle('vacia', (!prod?.value||!prod.value.trim()) && !cant?.value);
    });
    window.print();
  });
}
