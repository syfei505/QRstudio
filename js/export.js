'use strict';

/* Ekspor file: PNG, SVG, dan unduhan */

/* ---------- Export helpers ---------- */
async function svgToPng(svg,px){
  const m=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const w=px,h=Math.round(px*(+m[2])/(+m[1]));
  const img=new Image();
  await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('img'));img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const ctx=cv.getContext('2d');ctx.drawImage(img,0,0,w,h);
  return new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('blob')),'image/png'));
}
async function saveFile(name,blob){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('Mengunduh '+name);return true;
}
const slug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);
async function exportOne(content,label,fmt,fallbackName){
  const px=+state.style.px;
  const name=(slug(label)||slug(content)||fallbackName||'qr');
  try{
    const {svg}=buildSVG(content,state.style,'x',px);
    if(fmt==='svg')return saveFile(`qr-${name}.svg`,new Blob([svg],{type:'image/svg+xml'}));
    const blob=await svgToPng(svg,px);
    return saveFile(`qr-${name}.png`,blob);
  }catch(err){toast('Gagal membuat file. Coba ukuran yang lebih kecil.');return false;}
}
