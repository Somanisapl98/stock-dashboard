"use strict";
const DATA_URL = "./data/dashboard-data.json";
const REFRESH_MS = 5 * 60 * 1000;
const EXPORT_PASSWORD_HASH = "7517d2acf36192256c7470950964477029bd60a46a131b1239c823fa552c161c";

const state = { raw: [], rows: [], locations: [], page: 1, pageSize: 50, sortKey: "part", sortDir: 1, multiParts: null, suggestionIndex: -1 };
const $ = id => document.getElementById(id);
const els = {
  search: $("searchInput"), suggestions: $("suggestions"), multi: $("multiInput"), multiSummary: $("multiSummary"),
  head: $("tableHead"), body: $("tableBody"), pageInfo: $("pageInfo"), resultText: $("resultText"),
  sync: $("syncStatus"), updated: $("lastUpdated"), exportMenu: $("exportMenu"), exportPw: $("exportPassword"), exportStatus: $("exportStatus")
};
const text = v => String(v ?? "").trim();
const num = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const norm = v => text(v).toLowerCase().replace(/\s+/g," ");
const escapeXml = s => text(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");

function normalizeRecord(r) {
  return { part: text(r.PartNumber ?? r.part), desc: text(r.Description ?? r.desc), location: text(r.Location ?? r.location), qty: num(r.AvailableQty ?? r.qty) };
}
function aggregate(records) {
  const map = new Map();
  for (const r0 of records) {
    const r = normalizeRecord(r0); if (!r.part || !r.location) continue;
    const key = r.part.toUpperCase();
    if (!map.has(key)) map.set(key, { part:r.part, desc:r.desc, quantities:{}, total:0 });
    const item = map.get(key); if (!item.desc && r.desc) item.desc = r.desc;
    item.quantities[r.location] = num(item.quantities[r.location]) + r.qty; item.total += r.qty;
  }
  return [...map.values()];
}
function splitParts(value) { return [...new Set(text(value).split(/[\s,;]+/).map(x=>x.trim().toUpperCase()).filter(Boolean))]; }

async function loadData(manual=false) {
  els.sync.textContent = manual ? "Refreshing…" : "Loading stock…";
  try {
    const res = await fetch(`${DATA_URL}?v=${Date.now()}`, {cache:"no-store"});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json(); if (!Array.isArray(payload.stock)) throw new Error("Invalid data file");
    state.raw = payload.stock.map(normalizeRecord);
    state.locations = Array.isArray(payload.locations) && payload.locations.length ? payload.locations.map(text) : [...new Set(state.raw.map(r=>r.location).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    state.rows = aggregate(state.raw); state.page = 1;
    els.updated.textContent = `Last updated: ${text(payload.lastUpdated) || "Not provided"}`;
    els.sync.textContent = "Latest stock loaded"; renderAll();
  } catch(err) { console.error(err); els.sync.textContent = state.rows.length ? "Refresh failed · showing last loaded data" : "Could not load stock data"; }
}

function filteredRows() {
  const q = norm(els.search.value);
  let rows = state.rows.filter(r => !q || norm(r.part).includes(q) || norm(r.desc).includes(q));
  if (state.multiParts) rows = rows.filter(r => state.multiParts.has(r.part.toUpperCase()));
  const key = state.sortKey, dir = state.sortDir;
  rows.sort((a,b) => {
    let av, bv;
    if (key === "part") { av=a.part; bv=b.part; } else if (key === "desc") { av=a.desc; bv=b.desc; } else if (key === "total") { av=a.total; bv=b.total; } else { av=num(a.quantities[key]); bv=num(b.quantities[key]); }
    if (typeof av === "number") return (av-bv)*dir;
    return text(av).localeCompare(text(bv), undefined, {numeric:true,sensitivity:"base"})*dir;
  }); return rows;
}
function setSort(key) { if(state.sortKey===key) state.sortDir*=-1; else {state.sortKey=key;state.sortDir=1;} state.page=1; renderAll(); }
function arrow(key) { return state.sortKey===key ? (state.sortDir===1 ? " ▲" : " ▼") : ""; }
function renderHead() {
  const headers = [{k:"part",l:"Part Number"},{k:"desc",l:"Description"},...state.locations.map(x=>({k:x,l:x})),{k:"total",l:"Total"}];
  els.head.innerHTML=""; const tr=document.createElement("tr");
  headers.forEach(h=>{ const th=document.createElement("th"); th.textContent=h.l+arrow(h.k); if(h.k!=="part"&&h.k!=="desc") th.className="numeric"; th.addEventListener("click",()=>setSort(h.k)); tr.appendChild(th); }); els.head.appendChild(tr);
}
function renderBody() {
  const rows=filteredRows(), pages=Math.max(1,Math.ceil(rows.length/state.pageSize)); state.page=Math.min(state.page,pages);
  const start=(state.page-1)*state.pageSize, pageRows=rows.slice(start,start+state.pageSize); els.body.innerHTML="";
  if(!pageRows.length) { const tr=document.createElement("tr"); tr.className="empty-row"; const td=document.createElement("td"); td.colSpan=state.locations.length+3; td.textContent="No matching stock found."; tr.appendChild(td); els.body.appendChild(tr); }
  pageRows.forEach(r=>{ const tr=document.createElement("tr");
    const values=[r.part,r.desc,...state.locations.map(l=>num(r.quantities[l])),r.total];
    values.forEach((v,i)=>{const td=document.createElement("td");td.textContent=(i>=2?num(v).toLocaleString("en-IN"):text(v));if(i>=2)td.classList.add("numeric");if(i===values.length-1)td.classList.add("total-cell");tr.appendChild(td);}); els.body.appendChild(tr);
  });
  $("partCount").textContent=rows.length.toLocaleString("en-IN"); $("locationCount").textContent=state.locations.length; $("totalQty").textContent=rows.reduce((s,r)=>s+r.total,0).toLocaleString("en-IN"); $("pageStat").textContent=`${rows.length?state.page:0} / ${rows.length?pages:0}`;
  els.pageInfo.textContent=`Page ${rows.length?state.page:0} of ${rows.length?pages:0}`; els.resultText.textContent=`Showing ${pageRows.length.toLocaleString("en-IN")} of ${rows.length.toLocaleString("en-IN")} matching parts`;
  $("prevPage").disabled=state.page<=1||!rows.length; $("nextPage").disabled=state.page>=pages||!rows.length;
}
function renderAll() { renderHead(); renderBody(); updateSuggestions(); }

function suggestionMatches() { const q=norm(els.search.value); if(!q) return []; return state.rows.filter(r=>norm(r.part).includes(q)||norm(r.desc).includes(q)).slice(0,10); }
function updateSuggestions() {
  const matches=suggestionMatches(); els.suggestions.innerHTML=""; state.suggestionIndex=-1;
  if(!matches.length) {els.suggestions.hidden=true;return;}
  matches.forEach((r,i)=>{const d=document.createElement("div");d.className="suggestion";d.setAttribute("role","option");const strong=document.createElement("strong");strong.textContent=r.part;const span=document.createElement("span");span.textContent=r.desc||"No description";d.append(strong,span);d.addEventListener("mousedown",e=>{e.preventDefault();selectSuggestion(i);});els.suggestions.appendChild(d);}); els.suggestions.hidden=false;
}
function selectSuggestion(i) {const m=suggestionMatches()[i];if(!m)return;els.search.value=m.part;els.suggestions.hidden=true;state.page=1;renderAll();}
function moveSuggestion(delta) {const items=[...els.suggestions.children];if(!items.length)return;state.suggestionIndex=(state.suggestionIndex+delta+items.length)%items.length;items.forEach((x,i)=>x.classList.toggle("active",i===state.suggestionIndex));items[state.suggestionIndex].scrollIntoView({block:"nearest"});}

function applyMulti() {
  const parts=splitParts(els.multi.value); if(!parts.length) {state.multiParts=null;els.multiSummary.textContent="";state.page=1;renderAll();return;}
  const available=new Set(state.rows.map(r=>r.part.toUpperCase())); const found=parts.filter(p=>available.has(p)), missing=parts.filter(p=>!available.has(p)); state.multiParts=new Set(parts); state.page=1;
  els.multiSummary.textContent=`Found ${found.length} of ${parts.length} part numbers${missing.length?`; not found: ${missing.join(", ")}`:""}`; renderAll();
}
function clearMulti() {els.multi.value="";els.multiSummary.textContent="";state.multiParts=null;state.page=1;renderAll();}

async function sha256(value) {const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");}
async function authorizeExport() {
  const pw=els.exportPw.value; if(!pw) {els.exportStatus.textContent="Enter the export password.";return false;}
  const ok=(await sha256(pw))===EXPORT_PASSWORD_HASH; els.exportStatus.textContent=ok?"Password accepted.":"Incorrect password. Export not allowed."; return ok;
}
function exportMatrix() {const rows=filteredRows();return [["PartNumber","Description",...state.locations,"Total"],...rows.map(r=>[r.part,r.desc,...state.locations.map(l=>num(r.quantities[l])),r.total])];}
function download(blob,name) {const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
function csvCell(v) {return `"${text(v).replace(/"/g,'""')}"`;}
async function exportCsv() {if(!(await authorizeExport()))return;const csv=exportMatrix().map(r=>r.map(csvCell).join(",")).join("\r\n");download(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}),`stock-export-${new Date().toISOString().slice(0,10)}.csv`);}
async function exportExcel() {
  if(!(await authorizeExport()))return; const m=exportMatrix();
  const rows=m.map((r,ri)=>`<Row>${r.map((v,ci)=>`<Cell><Data ss:Type="${ri>0&&ci>=2?"Number":"String"}">${escapeXml(v)}</Data></Cell>`).join("")}</Row>`).join("");
  const xml=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Stock"><Table>${rows}</Table></Worksheet></Workbook>`;
  download(new Blob([xml],{type:"application/vnd.ms-excel"}),`stock-export-${new Date().toISOString().slice(0,10)}.xls`);
}

els.search.addEventListener("input",()=>{state.page=1;renderAll();}); els.search.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();moveSuggestion(1);}else if(e.key==="ArrowUp"){e.preventDefault();moveSuggestion(-1);}else if(e.key==="Enter"&&state.suggestionIndex>=0){e.preventDefault();selectSuggestion(state.suggestionIndex);}else if(e.key==="Escape")els.suggestions.hidden=true;});
document.addEventListener("click",e=>{if(!e.target.closest(".search-field"))els.suggestions.hidden=true;if(!e.target.closest(".export-wrap"))els.exportMenu.hidden=true;});
$("clearSearch").addEventListener("click",()=>{els.search.value="";state.page=1;renderAll();els.search.focus();}); $("applyMulti").addEventListener("click",applyMulti); $("clearMulti").addEventListener("click",clearMulti);
$("pageSize").addEventListener("change",e=>{state.pageSize=num(e.target.value)||50;state.page=1;renderBody();}); $("prevPage").addEventListener("click",()=>{state.page--;renderBody();}); $("nextPage").addEventListener("click",()=>{state.page++;renderBody();});
$("refreshButton").addEventListener("click",()=>loadData(true)); $("exportToggle").addEventListener("click",e=>{e.stopPropagation();els.exportMenu.hidden=!els.exportMenu.hidden;}); els.exportMenu.addEventListener("click",e=>e.stopPropagation()); $("exportCsv").addEventListener("click",exportCsv); $("exportExcel").addEventListener("click",exportExcel);
loadData(); setInterval(()=>loadData(false),REFRESH_MS);
