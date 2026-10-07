'use strict';

/* Pembuat isi QR per jenis (URL, WiFi, WhatsApp, dll) dan parser impor */

/* ---------- Content builders ---------- */
function cleanVal(v){v=String(v).trim();if(!v)return '';if(state.clean)v=v.replace(/[\s\-]/g,'');return state.prefix+v+state.suffix;}
function contentFor(mode){
  const d=state.single[mode];
  switch(mode){
    case 'text':return d.text.trim();
    case 'wifi':{
      if(!d.ssid.trim())return '';
      const q=v=>v.replace(/([\\;,:"])/g,'\\$1');
      return `WIFI:T:${d.sec};S:${q(d.ssid)};${d.sec!=='nopass'&&d.pass?`P:${q(d.pass)};`:''}${d.hidden?'H:true;':''};`;
    }
    case 'wa':{
      let n=d.num.replace(/\D/g,'');if(!n)return '';
      if(n.startsWith('0'))n='62'+n.slice(1);else if(n.startsWith('8'))n='62'+n;
      return `https://wa.me/${n}`+(d.msg.trim()?`?text=${encodeURIComponent(d.msg.trim())}`:'');
    }
    case 'mail':{
      if(!d.to.trim())return '';
      const p=[];if(d.sub.trim())p.push('subject='+encodeURIComponent(d.sub.trim()));if(d.body.trim())p.push('body='+encodeURIComponent(d.body.trim()));
      return `mailto:${d.to.trim()}`+(p.length?'?'+p.join('&'):'');
    }
    case 'vcard':{
      if(!d.name.trim())return '';
      const parts=d.name.trim().split(/\s+/),last=parts.length>1?parts.pop():'',first=parts.join(' ');
      const L=['BEGIN:VCARD','VERSION:3.0',`N:${last};${first};;;`,`FN:${d.name.trim()}`];
      if(d.org.trim())L.push(`ORG:${d.org.trim()}`);
      if(d.phone.trim())L.push(`TEL;TYPE=CELL:${d.phone.trim()}`);
      if(d.email.trim())L.push(`EMAIL:${d.email.trim()}`);
      if(d.url.trim())L.push(`URL:${d.url.trim()}`);
      L.push('END:VCARD');return L.join('\n');
    }
  }
  return '';
}
function batchItems(){
  return state.rows.map(r=>({label:r.label.trim(),content:cleanVal(r.value)})).filter(x=>x.content);
}
function currentPreview(){
  if(state.override)return state.override;
  if(state.mode==='batch'){const it=batchItems()[0];return it?{content:it.content,label:it.label}:{content:'',label:''};}
  return {content:contentFor(state.mode),label:MODES[state.mode].label};
}

/* ---------- Import ---------- */
function fromMatrix(arr){
  const out=[];
  arr.forEach((row,i)=>{
    const cells=row.map(x=>String(x==null?'':x).trim());
    while(cells.length&&!cells[cells.length-1])cells.pop();
    if(!cells.length)return;
    if(i===0&&!cells.some(c=>/\d{5,}/.test(c))&&cells.some(c=>/nama|name|label|va|virtual|nomor|number|akun|account|kode|code|isi|data/i.test(c)))return;
    if(cells.length>=2)out.push({label:cells[0],value:cells[1]});else out.push({label:'',value:cells[0]});
  });
  return out;
}
function fromText(t){return fromMatrix(t.split(/\r?\n/).map(l=>l.split(/\t|;|\||,/)));}
