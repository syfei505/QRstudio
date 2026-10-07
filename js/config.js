'use strict';

/* Konfigurasi: state aplikasi, jenis QR, tema preset, dan penyimpanan lokal */

/* ---------- State ---------- */
const DEFAULT_STYLE={fg:'#1A1F44',fg2:'#2F4BFF',grad:false,gradDir:'d',bg:'#FFFFFF',transparent:false,eyeSync:false,eye:'#2F4BFF',
  dot:'smooth',eyeShape:'rounded',ecc:'M',margin:2,logo:null,logoSize:20,frame:'none',caption:'Scan untuk bayar',px:1024,zipFmt:'png'};
const state={
  mode:'batch',
  rows:[{label:'Budi Santoso',value:'8808123456789012'},{label:'Siti Rahmawati',value:'8808123456789013'},{label:'PT Maju Bersama',value:'8808123456789014'}],
  prefix:'',suffix:'',clean:false,
  single:{text:{text:''},wifi:{ssid:'',pass:'',sec:'WPA',hidden:false},wa:{num:'',msg:''},mail:{to:'',sub:'',body:''},vcard:{name:'',phone:'',email:'',org:'',url:''}},
  style:Object.assign({},DEFAULT_STYLE),
  results:[],override:null,search:''
};

const MODES={
  batch:{label:'Batch VA',hint:'Banyak QR sekaligus'},
  text:{label:'Teks & URL',hint:'Tautan atau teks bebas',fields:[
    {k:'text',l:'Teks atau tautan',t:'textarea',rows:4,p:'https://contoh.com'}]},
  wifi:{label:'WiFi',hint:'Sambung WiFi dengan sekali pindai',fields:[
    {k:'ssid',l:'Nama jaringan (SSID)',p:'Kantor-5G'},
    {k:'pass',l:'Kata sandi',p:'Kosongkan jika jaringan terbuka'},
    {k:'sec',l:'Keamanan',t:'select',o:[['WPA','WPA/WPA2/WPA3'],['WEP','WEP'],['nopass','Tanpa sandi']]},
    {k:'hidden',l:'Jaringan tersembunyi',t:'check'}]},
  wa:{label:'WhatsApp',hint:'Buka chat langsung',fields:[
    {k:'num',l:'Nomor WhatsApp',p:'0812 3456 7890',h:'Nomor berawalan 0 otomatis dijadikan +62.'},
    {k:'msg',l:'Pesan awal (opsional)',t:'textarea',rows:3,p:'Halo, saya mau tanya…'}]},
  mail:{label:'Email',hint:'Buat email baru otomatis',fields:[
    {k:'to',l:'Alamat tujuan',p:'nama@contoh.com'},
    {k:'sub',l:'Subjek',p:'Pertanyaan'},
    {k:'body',l:'Isi email',t:'textarea',rows:3}]},
  vcard:{label:'Kontak',hint:'Simpan kontak ke ponsel',fields:[
    {k:'name',l:'Nama lengkap',p:'Budi Santoso'},
    {k:'phone',l:'Telepon',p:'+62 812 3456 7890'},
    {k:'email',l:'Email',p:'budi@contoh.com'},
    {k:'org',l:'Perusahaan / jabatan',p:'PT Maju Bersama'},
    {k:'url',l:'Situs web',p:'https://contoh.com'}]}
};

const PRESETS=[
  {n:'Navy',s:{fg:'#1A1F44',grad:false,bg:'#FFFFFF',eyeSync:false,eye:'#2F4BFF',dot:'smooth',eyeShape:'rounded'}},
  {n:'Klasik',s:{fg:'#000000',grad:false,bg:'#FFFFFF',eyeSync:true,dot:'square',eyeShape:'square'}},
  {n:'Rimba',s:{fg:'#0F5132',fg2:'#2E9E6B',grad:true,gradDir:'d',bg:'#F1F8F3',eyeSync:false,eye:'#0F5132',dot:'dots',eyeShape:'circle'}},
  {n:'Senja',s:{fg:'#D6143E',fg2:'#E07B00',grad:true,gradDir:'d',bg:'#FFF7ED',eyeSync:true,dot:'smooth',eyeShape:'rounded'}},
  {n:'Lemon',s:{fg:'#1A1F44',grad:false,bg:'#F2E45C',eyeSync:true,dot:'leaf',eyeShape:'rounded'}}
];

/* ---------- Persistence ---------- */
const LS='qrstudio.v1';
try{const j=JSON.parse(localStorage.getItem(LS)||'null');if(j){Object.assign(state.style,j.style||{});state.style.logo=null;if(MODES[j.mode])state.mode=j.mode;}}catch(e){}
function persist(){try{const s=Object.assign({},state.style);delete s.logo;localStorage.setItem(LS,JSON.stringify({style:s,mode:state.mode}));}catch(e){}}
