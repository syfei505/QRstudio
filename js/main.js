'use strict';

/* Event listener dan inisialisasi aplikasi */

/* ---------- Events ---------- */
$('#modeTabs').addEventListener('click',e=>{
  const b=e.target.closest('[data-mode]');if(!b||b.dataset.mode===state.mode)return;
  state.mode=b.dataset.mode;state.override=null;renderTabs();renderBody();persist();schedulePreview();
});
$('#styleTabs').addEventListener('click',e=>{
  const b=e.target.closest('[data-pane]');if(!b)return;
  $$('#styleTabs button').forEach(x=>x.setAttribute('aria-selected',String(x===b)));
  $$('.pane').forEach(p=>p.hidden=p.dataset.p!==b.dataset.pane);
});
const modeBody=$('#modeBody');
modeBody.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.k!==undefined){state.single[state.mode][t.dataset.k]=t.type==='checkbox'?t.checked:t.value;state.override=null;refresh();}
  else if(t.dataset.f){const i=+t.closest('.rowline').dataset.i;state.rows[i][t.dataset.f]=t.value;state.override=null;refresh();updateRowInfo();}
  else if(t.dataset.b){state[t.dataset.b]=t.type==='checkbox'?t.checked:t.value;state.override=null;refresh();updateRowInfo();}
});
modeBody.addEventListener('change',async e=>{
  if(e.target.id!=='file')return;
  const file=e.target.files[0];if(!file)return;
  if(typeof XLSX==='undefined'){toast('Library Excel belum termuat. Muat ulang halaman.');e.target.value='';return;}
  try{
    const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
    const arr=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:false,defval:''});
    const parsed=fromMatrix(arr);
    if(!parsed.length){toast('Tidak ada data yang terbaca di file ini');}
    else{addRows(parsed);toast(`${Math.min(parsed.length,MAX_ROWS)} baris diimpor`);}
  }catch(err){toast('File tidak bisa dibaca. Pastikan formatnya .xlsx, .xls, atau .csv');}
  e.target.value='';
});
modeBody.addEventListener('paste',e=>{
  const t=e.target;if(!t.dataset||!t.dataset.f)return;
  const text=(e.clipboardData||window.clipboardData).getData('text');
  if(!/[\r\n]/.test(text.trim()))return;
  e.preventDefault();
  const parsed=fromText(text);if(!parsed.length)return;
  const i=+t.closest('.rowline').dataset.i,cur=state.rows[i];
  const empty=!cur.label.trim()&&!cur.value.trim();
  state.rows.splice(i,empty?1:0,...parsed);state.rows=state.rows.slice(0,MAX_ROWS);
  state.override=null;renderRows();refresh();toast(`${parsed.length} baris ditempel`);
});
modeBody.addEventListener('keydown',e=>{
  if(e.key!=='Enter'||!e.target.dataset||e.target.dataset.f!=='value')return;
  e.preventDefault();
  const i=+e.target.closest('.rowline').dataset.i;
  if(i===state.rows.length-1){state.rows.push({label:'',value:''});renderRows(i+1);}
  else{const el=$(`.rowline[data-i="${i+1}"] [data-f="label"]`);if(el)el.focus();}
});
modeBody.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act;
  if(act==='add'){if(state.rows.length>=MAX_ROWS){toast(`Maksimal ${MAX_ROWS} baris`);return;}state.rows.push({label:'',value:''});renderRows(state.rows.length-1);}
  else if(act==='del'){const i=+b.closest('.rowline').dataset.i;state.rows.splice(i,1);if(!state.rows.length)state.rows.push({label:'',value:''});state.override=null;renderRows();refresh();}
  else if(act==='paste'){$('#pasteArea').value='';const d=$('#pasteDlg');d.showModal?d.showModal():d.setAttribute('open','');$('#pasteArea').focus();}
  else if(act==='template'){await saveFile('template-va.csv',new Blob(['nama,nomor_va\r\nBudi Santoso,8808123456789012\r\nSiti Rahmawati,8808123456789013\r\n'],{type:'text/csv'}));}
  else if(act==='generate'){generate();}
  else if(act==='save'){
    const c=contentFor(state.mode);if(!c){toast('Isi data dulu sebelum menyimpan');return;}
    state.results.push({label:MODES[state.mode].label,content:c});renderResults();toast('Ditambahkan ke hasil');
  }
  else if(act==='reset'){
    if(state.mode==='batch'){state.rows=[{label:'',value:''}];state.prefix='';state.suffix='';state.clean=false;state.results=[];renderResults();}
    else{const d=state.single[state.mode];Object.keys(d).forEach(k=>d[k]=typeof d[k]==='boolean'?false:(k==='sec'?'WPA':''));}
    state.override=null;renderBody();schedulePreview();toast('Data direset');
  }
});
/* paste dialog */
$('#pasteCancel').addEventListener('click',()=>$('#pasteDlg').close());
$('#pasteOk').addEventListener('click',()=>{
  const parsed=fromText($('#pasteArea').value);
  if(!parsed.length){toast('Belum ada data untuk ditambahkan');return;}
  addRows(parsed);$('#pasteDlg').close();toast(`${Math.min(parsed.length,MAX_ROWS)} baris ditambahkan`);
});

/* style events */
document.addEventListener('input',e=>{
  const t=e.target;if(!t.dataset||t.dataset.s===undefined)return;
  const k=t.dataset.s;let v=t.type==='checkbox'?t.checked:t.value;
  if(t.type==='range'||k==='px')v=Number(v);
  state.style[k]=v;
  if(k==='zipFmt'){persist();return;}
  styleChanged();
});
document.addEventListener('click',e=>{
  const o=e.target.closest('[data-opt]');
  if(o){state.style[o.dataset.opt]=o.dataset.v;styleChanged();return;}
  const p=e.target.closest('[data-preset]');
  if(p){Object.assign(state.style,PRESETS[+p.dataset.preset].s);styleChanged();}
});
$('#logoFile').addEventListener('change',e=>{
  const file=e.target.files[0];if(!file)return;
  const fr=new FileReader();
  fr.onload=()=>{
    const img=new Image();
    img.onload=()=>{
      const max=256,sc=Math.min(1,max/Math.max(img.width||max,img.height||max));
      const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round((img.width||max)*sc));cv.height=Math.max(1,Math.round((img.height||max)*sc));
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      state.style.logo=cv.toDataURL('image/png');styleChanged();toast('Logo dipasang');
    };
    img.onerror=()=>toast('Gambar tidak bisa dibaca');
    img.src=fr.result;
  };
  fr.readAsDataURL(file);e.target.value='';
});
$('#logoClear').addEventListener('click',()=>{state.style.logo=null;styleChanged();});

/* preview actions */
$('#dlPng').addEventListener('click',()=>{const p=currentPreview();exportOne(p.content,p.label,'png',state.mode);});
$('#dlSvg').addEventListener('click',()=>{const p=currentPreview();exportOne(p.content,p.label,'svg',state.mode);});
$('#dlCopy').addEventListener('click',async()=>{
  const p=currentPreview();
  try{
    const {svg}=buildSVG(p.content,state.style,'c',1024);
    const blob=await svgToPng(svg,1024);
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
    toast('Gambar QR disalin ke clipboard');
  }catch(err){toast('Browser tidak mengizinkan menyalin. Gunakan tombol PNG.');}
});

/* results events */
$('#resBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const card=b.closest('.rcard'),i=+card.dataset.i,it=state.results[i];
  if(b.dataset.act==='png')exportOne(it.content,it.label,'png');
  else if(b.dataset.act==='svg')exportOne(it.content,it.label,'svg');
  else if(b.dataset.act==='rdel'){state.results.splice(i,1);renderResults();}
  else if(b.dataset.act==='pv'){state.override={content:it.content,label:it.label};schedulePreview();window.scrollTo({top:0,behavior:'smooth'});toast('Ditampilkan di pratinjau');}
});
$('#resSearch').addEventListener('input',e=>{state.search=e.target.value;renderResults();});
$('#zipAll').addEventListener('click',zipAll);
$('#clearRes').addEventListener('click',()=>{state.results=[];renderResults();toast('Hasil dihapus');});

/* ---------- Init ---------- */
$('#logoThumb').dataset.def=$('#logoThumb').innerHTML;
buildOpts();renderTabs();renderBody();syncStyleUI();renderResults();updatePreview();
