'use strict';

/* Tab jenis QR, form isian, dan baris batch */

/* ---------- Mode tabs & body ---------- */
function renderTabs(){
  $('#modeTabs').innerHTML=Object.keys(MODES).map(k=>`<button role="tab" type="button" data-mode="${k}" aria-selected="${k===state.mode}">${MODES[k].label}</button>`).join('');
  $('#modeHint').textContent=MODES[state.mode].hint;
}
function fieldHTML(mode,f){
  const v=state.single[mode][f.k],id=`f-${mode}-${f.k}`,hint=f.h?`<p class="hint">${f.h}</p>`:'';
  if(f.t==='check')return `<div class="field"><label class="check"><input type="checkbox" id="${id}" data-k="${f.k}" ${v?'checked':''}> ${f.l}</label></div>`;
  if(f.t==='select')return `<div class="field"><label for="${id}">${f.l}</label><select class="in" id="${id}" data-k="${f.k}">${f.o.map(o=>`<option value="${o[0]}" ${o[0]===v?'selected':''}>${o[1]}</option>`).join('')}</select></div>`;
  if(f.t==='textarea')return `<div class="field"><label for="${id}">${f.l}</label><textarea class="in" id="${id}" data-k="${f.k}" rows="${f.rows||3}" placeholder="${esc(f.p||'')}">${esc(v)}</textarea>${hint}</div>`;
  return `<div class="field"><label for="${id}">${f.l}</label><input class="in" id="${id}" data-k="${f.k}" value="${esc(v)}" placeholder="${esc(f.p||'')}" autocomplete="off">${hint}</div>`;
}
const ICON_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function renderBody(){
  const body=$('#modeBody');
  if(state.mode==='batch'){
    body.innerHTML=`
      <div class="tools">
        <label class="btn" for="file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6"/></svg>Impor Excel / CSV</label>
        <input type="file" id="file" accept=".xlsx,.xls,.csv,.tsv,.txt" hidden>
        <button class="btn" type="button" data-act="paste">Tempel dari Excel</button>
        <button class="btn btn-quiet" type="button" data-act="template">Unduh template CSV</button>
      </div>
      <div class="rows-head"><span></span><span>Nama / label</span><span>Nomor VA atau isi</span><span></span></div>
      <div class="rows-scroll" id="rows"></div>
      <button class="btn btn-sm" type="button" data-act="add" style="margin-top:4px">+ Tambah baris</button>
      <details class="advanced">
        <summary>Awalan, akhiran, dan pembersihan</summary>
        <div class="two">
          <div class="field"><label for="prefix">Awalan semua baris</label><input class="in mono" id="prefix" data-b="prefix" value="${esc(state.prefix)}" placeholder="Contoh: 88088"></div>
          <div class="field"><label for="suffix">Akhiran semua baris</label><input class="in mono" id="suffix" data-b="suffix" value="${esc(state.suffix)}" placeholder="Opsional"></div>
        </div>
        <div class="field"><label class="check"><input type="checkbox" data-b="clean" ${state.clean?'checked':''}> Hapus spasi dan tanda hubung dari isi</label></div>
      </details>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-act="generate" id="genBtn">Buat QR</button>
        <button class="btn" type="button" data-act="reset">Reset</button>
        <span class="info" id="rowInfo"></span>
      </div>`;
    renderRows();
  }else{
    body.innerHTML=MODES[state.mode].fields.map(f=>fieldHTML(state.mode,f)).join('')+
      `<div class="actions"><button class="btn btn-primary" type="button" data-act="save">Simpan ke hasil</button><button class="btn" type="button" data-act="reset">Reset</button><span class="info">Unduh langsung dari pratinjau.</span></div>`;
  }
}
function renderRows(focusIdx){
  $('#rows').innerHTML=state.rows.map((r,i)=>`<div class="rowline" data-i="${i}">
    <span class="idx">${i+1}</span>
    <input class="in" data-f="label" value="${esc(r.label)}" placeholder="Nama pelanggan" aria-label="Nama baris ${i+1}" autocomplete="off">
    <input class="in mono" data-f="value" value="${esc(r.value)}" placeholder="8808 1234 5678 9012" aria-label="Nomor VA baris ${i+1}" autocomplete="off">
    <button class="icon-btn" type="button" data-act="del" aria-label="Hapus baris ${i+1}">${ICON_X}</button></div>`).join('');
  updateRowInfo();
  if(focusIdx!==undefined){const el=$(`.rowline[data-i="${focusIdx}"] [data-f="label"]`);if(el)el.focus();}
}
function updateRowInfo(){
  const n=batchItems().length,blank=state.rows.length-n;
  const b=$('#genBtn'),i=$('#rowInfo');
  if(b)b.textContent=n?`Buat ${n} QR`:'Buat QR';
  if(i)i.textContent=blank>0&&n?`${blank} baris kosong dilewati`:'';
}
function addRows(list){
  const keep=state.rows.filter(r=>r.label.trim()||r.value.trim());
  state.rows=keep.concat(list).slice(0,MAX_ROWS);
  if(!state.rows.length)state.rows=[{label:'',value:''}];
  state.override=null;renderRows();refresh();
}
