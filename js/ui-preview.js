'use strict';

/* Panel pratinjau langsung dan pengecekan kontras */

/* ---------- Preview ---------- */
function lum(hex){
  const v=hex.replace('#','');const c=[0,2,4].map(i=>parseInt(v.substr(i,2),16)/255).map(x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4));
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
}
function health(s){
  const bg=s.transparent?'#FFFFFF':s.bg;const lb=lum(bg);
  const fgs=[s.fg];if(s.grad)fgs.push(s.fg2);if(!s.eyeSync)fgs.push(s.eye);
  let worst=21,inverted=false;
  fgs.forEach(c=>{const l=lum(c);const r=(Math.max(l,lb)+.05)/(Math.min(l,lb)+.05);worst=Math.min(worst,r);if(l>lb+.02)inverted=true;});
  const ico='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  if(inverted)return `<span class="chip bad">${ico}<path d="M12 8v5M12 17h.01"/></svg>Warna terbalik, banyak pemindai gagal</span>`;
  if(worst<3)return `<span class="chip bad">${ico}<path d="M12 8v5M12 17h.01"/></svg>Kontras terlalu rendah</span>`;
  if(worst<4.5)return `<span class="chip warn">${ico}<path d="M12 8v5M12 17h.01"/></svg>Kontras cukup, uji dulu</span>`;
  return `<span class="chip good">${ico}<path d="m5 12 5 5 9-10"/></svg>Kontras baik</span>`;
}
const EMPTY='<div class="qr-empty">Isi data untuk melihat QR code di sini.</div>';
let pvFrame=0;
function schedulePreview(){cancelAnimationFrame(pvFrame);pvFrame=requestAnimationFrame(updatePreview);}
function updatePreview(){
  const {content,label}=currentPreview();
  const card=$('#qrCard'),dis=b=>['#dlPng','#dlSvg','#dlCopy'].forEach(id=>$(id).disabled=b);
  card.classList.toggle('checker',!!state.style.transparent);
  $('#pvLabel').textContent=label||'';
  if(typeof qrcode==='undefined'){card.innerHTML='<div class="qr-empty">Library QR gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.</div>';dis(true);return;}
  if(!content){card.innerHTML=EMPTY;$('#qrMeta').textContent='';$('#health').innerHTML='';dis(true);return;}
  try{
    const r=buildSVG(content,state.style,'pv');
    card.innerHTML=r.svg;
    $('#qrMeta').textContent=`${r.n}×${r.n} modul · koreksi ${r.ecc}`;
    $('#health').innerHTML=health(state.style);
    dis(false);
  }catch(err){
    card.innerHTML='<div class="qr-empty">Data terlalu panjang untuk satu QR code. Persingkat isinya atau turunkan tingkat koreksi.</div>';
    $('#qrMeta').textContent='';$('#health').innerHTML='';dis(true);
  }
}
let resT;
function refresh(styleChanged){schedulePreview();if(styleChanged&&state.results.length){clearTimeout(resT);resT=setTimeout(renderResults,180);}}
