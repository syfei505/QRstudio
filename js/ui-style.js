'use strict';

/* Panel tampilan (warna, bentuk, logo, bingkai) */

/* ---------- Style UI ---------- */
function cellIcon(kind){
  const sh=(x,y)=>kind==='square'?`<rect x="${x}" y="${y}" width="10" height="10"/>`:kind==='smooth'?`<rect x="${x}" y="${y}" width="10" height="10" rx="3.5"/>`:kind==='dots'?`<circle cx="${x+5}" cy="${y+5}" r="4.6"/>`:`<path d="M${x} ${y+5}A5 5 0 0 1 ${x+5} ${y}H${x+10}V${y+5}A5 5 0 0 1 ${x+5} ${y+10}H${x}Z"/>`;
  return `<svg viewBox="0 0 28 28" width="30" height="30" fill="currentColor" aria-hidden="true">${[[3,3],[15,3],[3,15],[15,15]].map(([x,y])=>sh(x,y)).join('')}</svg>`;
}
function eyeIcon(kind){
  const ring=kind==='circle'?'<circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="14" cy="14" r="4"/>':
    kind==='rounded'?'<rect x="4" y="4" width="20" height="20" rx="6.5" fill="none" stroke="currentColor" stroke-width="4"/><rect x="10" y="10" width="8" height="8" rx="2.5"/>':
    '<rect x="4" y="4" width="20" height="20" fill="none" stroke="currentColor" stroke-width="4"/><rect x="10" y="10" width="8" height="8"/>';
  return `<svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true">${ring}</svg>`;
}
function frameIcon(kind){
  const q='<rect x="9" y="5" width="10" height="10" rx="1.5" fill="currentColor"/>';
  if(kind==='bar')return `<svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true">${q}<rect x="5" y="19" width="18" height="5" rx="2.5" fill="currentColor"/></svg>`;
  if(kind==='outline')return `<svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true"><rect x="3" y="3" width="22" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>${q}<rect x="8" y="19" width="12" height="2.4" rx="1.2" fill="currentColor"/></svg>`;
  return `<svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true">${q.replace('x="9" y="5" width="10" height="10"','x="7" y="7" width="14" height="14"')}</svg>`;
}
function buildOpts(){
  const mk=(sel,key,items,icon)=>{$(sel).innerHTML=items.map(([v,l])=>`<button type="button" class="opt" role="radio" data-opt="${key}" data-v="${v}" aria-checked="false">${icon(v)}${l}</button>`).join('');};
  mk('#optDot','dot',[['square','Kotak'],['smooth','Halus'],['dots','Bulat'],['leaf','Daun']],cellIcon);
  mk('#optEye','eyeShape',[['square','Kotak'],['rounded','Tumpul'],['circle','Bulat']],eyeIcon);
  mk('#optFrame','frame',[['none','Tanpa'],['bar','Label'],['outline','Garis']],frameIcon);
  $('#presets').innerHTML=PRESETS.map((p,i)=>{
    const s=Object.assign({},DEFAULT_STYLE,p.s);
    const bg=s.grad?`linear-gradient(135deg,${s.fg},${s.fg2})`:s.fg;
    return `<button type="button" class="preset" data-preset="${i}"><span class="sw" style="background:${bg};box-shadow:0 0 0 3px ${s.bg},0 0 0 4.5px var(--line)"></span>${p.n}</button>`;
  }).join('');
}
function syncStyleUI(){
  const s=state.style;
  $$('[data-s]').forEach(el=>{
    const v=s[el.dataset.s];
    if(el.type==='checkbox')el.checked=!!v;else el.value=v;
  });
  $$('[data-hex]').forEach(el=>el.textContent=String(s[el.dataset.hex]).toUpperCase());
  $$('[data-out]').forEach(el=>el.textContent=s[el.dataset.out]+(el.dataset.out==='logoSize'?'%':' modul'));
  $$('[data-opt]').forEach(b=>b.setAttribute('aria-checked',String(s[b.dataset.opt]===b.dataset.v)));
  $$('[data-show="grad"]').forEach(el=>el.hidden=!s.grad);
  $$('[data-show="eyeCustom"]').forEach(el=>el.hidden=s.eyeSync);
  const hasLogo=!!s.logo;
  $('#logoClear').hidden=!hasLogo;$('#logoSizeGroup').hidden=!hasLogo;
  $('#logoThumb').innerHTML=hasLogo?`<img alt="Logo terpilih" src="${s.logo}">`:$('#logoThumb').dataset.def;
  $('#ecc').disabled=hasLogo;
  $('#captionGroup').hidden=s.frame==='none';
  $('#zipFmt').value=s.zipFmt;
}
function styleChanged(){syncStyleUI();persist();refresh(true);}
