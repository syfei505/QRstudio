'use strict';

/* Mesin QR: membentuk matriks dan menggambar SVG (bentuk titik, mata, gradasi, logo, bingkai) */

/* ---------- QR engine ---------- */
if(typeof qrcode!=='undefined'&&qrcode.stringToBytesFuncs&&qrcode.stringToBytesFuncs['UTF-8']){qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];}
const mcache=new Map();
function getMatrix(text,ecc){
  const key=ecc+'|'+text;
  if(mcache.has(key))return mcache.get(key);
  const qr=qrcode(0,ecc);qr.addData(text,'Byte');qr.make();
  const n=qr.getModuleCount(),m=[];
  for(let r=0;r<n;r++){const row=new Array(n);for(let c=0;c<n;c++)row[c]=qr.isDark(r,c);m.push(row);}
  if(mcache.size>300)mcache.clear();
  const v={n,m};mcache.set(key,v);return v;
}
function rr(x,y,w,h,tl,tr,br,bl){
  if(tr===undefined){tr=br=bl=tl;}
  const A=(r,ex,ey)=>r?`A${f2(r)} ${f2(r)} 0 0 1 ${f2(ex)} ${f2(ey)}`:'';
  return `M${f2(x+tl)} ${f2(y)}H${f2(x+w-tr)}${A(tr,x+w,y+tr)}V${f2(y+h-br)}${A(br,x+w-br,y+h)}H${f2(x+bl)}${A(bl,x,y+h-bl)}V${f2(y+tl)}${A(tl,x+tl,y)}Z`;
}
const circ=(cx,cy,r)=>`M${f2(cx-r)} ${f2(cy)}a${r} ${r} 0 1 0 ${f2(2*r)} 0a${r} ${r} 0 1 0 ${f2(-2*r)} 0Z`;
function eyePath(x,y,shape){
  if(shape==='circle')return circ(x+3.5,y+3.5,3.5)+circ(x+3.5,y+3.5,2.5)+circ(x+3.5,y+3.5,1.5);
  if(shape==='rounded')return rr(x,y,7,7,2.2)+rr(x+1,y+1,5,5,1.3)+rr(x+2,y+2,3,3,.9);
  return `M${x} ${y}h7v7h-7zM${x+1} ${y+1}h5v5h-5zM${x+2} ${y+2}h3v3h-3z`;
}
function buildSVG(text,s,uid,px){
  const ecc=s.logo?'H':s.ecc;
  const {n,m}=getMatrix(text,ecc);
  const mg=+s.margin,W=n+mg*2;
  const framed=s.frame!=='none';
  const cap=framed?(s.caption||'').trim():'';
  const barH=cap?Math.max(4.4,W*.17):0;
  const H=W+barH;
  const inEye=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
  let box=null;
  if(s.logo){const side=n*s.logoSize/100;box={c:mg+n/2,half:side/2+.9,side};}
  const skip=(r,c)=>box&&Math.abs(mg+c+.5-box.c)<box.half+.5&&Math.abs(mg+r+.5-box.c)<box.half+.5;
  const eff=[];
  for(let r=0;r<n;r++){const row=new Array(n);for(let c=0;c<n;c++)row[c]=m[r][c]&&!inEye(r,c)&&!skip(r,c);eff.push(row);}
  const D=(r,c)=>r>=0&&c>=0&&r<n&&c<n&&eff[r][c];
  const e=.012;let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    if(!eff[r][c])continue;
    const x=c+mg,y=r+mg;
    if(s.dot==='dots'){d+=circ(x+.5,y+.5,.46);}
    else if(s.dot==='smooth'){
      const R=.5,u=!D(r-1,c),dn=!D(r+1,c),l=!D(r,c-1),ri=!D(r,c+1);
      d+=rr(x-e,y-e,1+2*e,1+2*e,u&&l?R:0,u&&ri?R:0,dn&&ri?R:0,dn&&l?R:0);
    }
    else if(s.dot==='leaf'){d+=rr(x-e,y-e,1+2*e,1+2*e,.5,0,.5,0);}
    else{d+=`M${f2(x-e)} ${f2(y-e)}h${f2(1+2*e)}v${f2(1+2*e)}h${f2(-1-2*e)}z`;}
  }
  let eyes='';
  [[0,0],[0,n-7],[n-7,0]].forEach(([r,c])=>{eyes+=eyePath(c+mg,r+mg,s.eyeShape);});
  const paint=s.grad?`url(#g${uid})`:s.fg;
  const eyeFill=s.eyeSync?paint:s.eye;
  const gd={h:[0,0,W,0],v:[0,0,0,W],d:[0,0,W,W]}[s.gradDir]||[0,0,W,W];
  const defs=s.grad?`<defs><linearGradient id="g${uid}" gradientUnits="userSpaceOnUse" x1="${gd[0]}" y1="${gd[1]}" x2="${gd[2]}" y2="${gd[3]}"><stop offset="0" stop-color="${s.fg}"/><stop offset="1" stop-color="${s.fg2}"/></linearGradient></defs>`:'';
  let body='';
  if(!s.transparent)body+=`<rect width="${f2(W)}" height="${f2(H)}" rx="${framed?1.6:0}" fill="${s.bg}"/>`;
  if(s.frame==='outline')body+=`<rect x=".45" y=".45" width="${f2(W-.9)}" height="${f2(H-.9)}" rx="1.3" fill="none" stroke="${paint}" stroke-width=".9"/>`;
  body+=`<path d="${d}" fill="${paint}"/><path d="${eyes}" fill="${eyeFill}" fill-rule="evenodd"/>`;
  if(box){
    const pad=f2(box.side+.8),o=f2(box.c-(box.side+.8)/2),io=f2(box.c-box.side/2),sd=f2(box.side);
    body+=`<rect x="${o}" y="${o}" width="${pad}" height="${pad}" rx="1.4" fill="${s.transparent?'#fff':s.bg}"/><image xlink:href="${s.logo}" x="${io}" y="${io}" width="${sd}" height="${sd}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  if(cap){
    const ff='Bricolage Grotesque, Arial, Helvetica, sans-serif';
    if(s.frame==='bar'){
      const x=Math.max(1.2,mg*.6),bw=W-2*x,bh=barH*.68,by=W+(barH-bh)*.35;
      const fs=Math.min(bh*.5,(bw-2)/(cap.length*.62));
      body+=`<rect x="${f2(x)}" y="${f2(by)}" width="${f2(bw)}" height="${f2(bh)}" rx="${f2(bh/2.4)}" fill="${paint}"/>`;
      body+=`<text x="${f2(W/2)}" y="${f2(by+bh/2)}" text-anchor="middle" dominant-baseline="central" font-family="${ff}" font-weight="700" font-size="${f2(fs)}" fill="${s.transparent?'#fff':s.bg}">${esc(cap)}</text>`;
    }else{
      const fs=Math.min(barH*.42,(W-4)/(cap.length*.62));
      body+=`<text x="${f2(W/2)}" y="${f2(W+barH*.46)}" text-anchor="middle" dominant-baseline="central" font-family="${ff}" font-weight="700" font-size="${f2(fs)}" fill="${paint}">${esc(cap)}</text>`;
    }
  }
  const size=px?` width="${px}" height="${Math.round(px*H/W)}"`:'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${f2(W)} ${f2(H)}"${size} role="img" aria-label="QR code">${defs}${body}</svg>`;
  return {svg,n,ecc,W,H};
}
