'use strict';

/* Daftar hasil batch dan unduh ZIP */

/* ---------- Results ---------- */
function renderResults(){
  const body=$('#resBody'),list=state.results;
  $('#resCount').textContent=list.length;
  ['#zipAll','#clearRes'].forEach(s=>$(s).disabled=!list.length);
  $('#resSearch').disabled=!list.length;
  if(!list.length){body.innerHTML='<div class="empty-res"><b>Belum ada QR code</b>Isi data di atas, lalu klik “Buat QR” untuk menampilkannya di sini.</div>';return;}
  const q=state.search.trim().toLowerCase();
  const cards=[];
  list.forEach((it,i)=>{
    if(q&&!(it.label.toLowerCase().includes(q)||it.content.toLowerCase().includes(q)))return;
    let inner,ok=true;
    try{inner=buildSVG(it.content,state.style,'r'+i).svg;}catch(e){ok=false;inner='<div class="err">Data terlalu panjang untuk QR</div>';}
    cards.push(`<article class="rcard" data-i="${i}">
      <button class="thumb" type="button" data-act="pv" aria-label="Lihat ${esc(it.label||it.content)} di pratinjau" ${ok?'':'disabled'} ${state.style.transparent?'style="background:repeating-conic-gradient(#dfe2ee 0 25%,#fff 0 50%) 0 0/14px 14px"':''}>${inner}</button>
      <div style="min-width:0"><strong>${esc(it.label||'Tanpa nama')}</strong><code title="${esc(it.content)}">${esc(it.content.replace(/\n/g,' '))}</code></div>
      <div class="rc-actions"><button class="btn btn-sm" type="button" data-act="png" ${ok?'':'disabled'}>PNG</button><button class="btn btn-sm" type="button" data-act="svg" ${ok?'':'disabled'}>SVG</button><button class="icon-btn" type="button" data-act="rdel" aria-label="Hapus dari hasil">${ICON_X}</button></div>
    </article>`);
  });
  body.innerHTML=cards.length?`<div class="rgrid">${cards.join('')}</div>`:'<div class="empty-res"><b>Tidak ada yang cocok</b>Coba kata kunci lain.</div>';
}
function generate(){
  const items=batchItems();
  if(!items.length){toast('Isi minimal satu nomor VA dulu');return;}
  state.results=items;state.search='';$('#resSearch').value='';
  renderResults();
  toast(`${items.length} QR code dibuat`);
  $('#results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
async function zipAll(){
  if(typeof JSZip==='undefined'){toast('Library ZIP belum termuat. Muat ulang halaman.');return;}
  const btn=$('#zipAll'),label=btn.textContent,fmt=state.style.zipFmt,px=+state.style.px;
  btn.disabled=true;
  try{
    const zip=new JSZip(),used=new Set(),list=state.results;
    for(let i=0;i<list.length;i++){
      btn.textContent=`Menyiapkan ${i+1}/${list.length}…`;
      const it=list[i];
      let base=slug(it.label)||slug(it.content)||'qr';
      let name=`${String(i+1).padStart(3,'0')}-${base}`;
      while(used.has(name))name+='-x';used.add(name);
      try{
        const {svg}=buildSVG(it.content,state.style,'z',px);
        if(fmt==='svg')zip.file(name+'.svg',svg);else zip.file(name+'.png',await svgToPng(svg,px));
      }catch(e){}
      if(i%4===3)await new Promise(r=>setTimeout(r));
    }
    btn.textContent='Menyusun ZIP…';
    const blob=await zip.generateAsync({type:'blob'});
    await saveFile(`qr-codes-${new Date().toISOString().slice(0,10)}.zip`,blob);
  }catch(err){toast('Gagal membuat ZIP');}
  btn.textContent=label;btn.disabled=!state.results.length;
}
