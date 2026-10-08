const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎬🗡️ Importando Chinese Paladin TV Series OST (麦振鸿)...\n');

const mzhEmail = 'maizhenhong@music.square';
let mzhUser = db.prepare('SELECT * FROM users WHERE email = ?').get(mzhEmail);
if (!mzhUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'麦振鸿',mzhEmail,bcrypt.hashSync('paladintv',10),'Mak Chun Hung / 麦振鸿 — the composer who defined Chinese Paladin TV sound, master of xianxia emotion 🎬🎻');
  mzhUser = db.prepare('SELECT * FROM users WHERE email = ?').get(mzhEmail);
  console.log('  + user: 麦振鸿');
} else { console.log('  + exists: 麦振鸿'); }
const uid = mzhUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function dor(r,st){const d=[0,2,3,5,7,9,10];return st.map(s=>r+d[s%7]+Math.floor(s/7)*12);}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*3200+2500),Math.floor(Math.random()*1000+500),Math.floor(Math.random()*160+70),id);
  console.log('  + '+t);return id;
}

// =====================================================
//  仙剑奇侠传一 TV (2005) — Chinese Paladin 1
// =====================================================
console.log('  Paladin TV S1 (2005)...\n');

ins('Paladin TV1 - 杀破狼 (Sha Po Lang)','JS opening theme. The star that breaks fate — Li Xiaoyao destiny begins. ✨⚔️',96,'D','minor',
  mkMP('voice',[62,65,69,74,72,69,65,62,65,69,74,77,74,69,65,62],[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.35,0.2,2.5),5.5,'#C0392B');

ins('Paladin TV1 - 终于明白 (Finally Understand)','Power Station ending theme. Xiao Yao looks back — the hardest thing is letting go. 💔🎸',72,'E','minor',
  mkMP('voice',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.45,0.3,3.0),6.5,'#5D6D7E');

ins('Paladin TV1 - 一直很安静 (Always Quiet)','A-Sang insert song. Lin Yueru watching from afar — giving is the most tender loneliness. 🌙😢',64,'A','major',
  mkMP('piano',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61],[[45,49,52,57],[43,47,50,55],[41,45,48,53],[45,49,52,57]],0.5,0.35,3.5),7.5,'#D2B4DE');

ins('Paladin TV1 - 逍遥叹 (Xiao Yao Sigh)','Hu Ge insert song. The hero looks at his reflection — years have passed, the wine has gone cold. 🍷⏳',60,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#F7DC6F');

ins('Paladin TV1 - 六月的雨 (June Rain)','Hu Ge insert song. A summer storm in the heart — I am waiting for you under the rain. 🌧️💕',68,'G','major',
  mkMP('piano',[55,59,62,67,66,62,59,55,59,62,67,71,67,62,59,55],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.5,0.35,3.5),7.5,'#3498DB');

ins('Paladin TV1 - 莫失莫忘 (Never Lose, Never Forget)','Mak Chun Hung instrumental. Li Xiaoyao and Zhao Ling-er — the love theme that made a nation cry. 🦋💧',56,'C','major',
  mkMP('erhu',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.6,0.4,3.5),8.0,'#E91E63');

ins('Paladin TV1 - 仙剑奇缘 (Paladin Destiny)','Mak Chun Hung battle theme. Sword light and spell fire — the immortal realm clash. ⚔️🔥',112,'D','minor',
  mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],2.0),5.0,'#C0392B');

ins('Paladin TV1 - 永恒的回忆 (Eternal Memory)','Mak Chun Hung ending instrumental. All the battles are over — only memories remain. 🕯️⏳',52,'C','major',
  mkMP('erhu',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.65,0.4,4.0),8.5,'#F5B7B1');

ins('Paladin TV1 - 大地之母 (Mother Earth)','Nuwa descendant theme. Zhao Ling-er power awakens — the goddess within a mortal girl. 🌍👸',60,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.5),6.5,'#8E44AD');

// =====================================================
//  仙剑奇侠传三 TV (2009) — Chinese Paladin 3
// =====================================================
console.log('\n  Paladin TV S3 (2009)...\n');

ins('Paladin TV3 - 生生世世爱 (Love Across Lifetimes)','S.H.E. opening theme. Jingtian and Xuejian — love that spans reincarnations. 💕🌀',96,'C','minor',
  mkMP('voice',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.3,0.15,2.0),4.5,'#E91E63');

ins('Paladin TV3 - 忘记时间 (Forget Time)','Hu Ge ending theme. Silence after the final battle — I want to forget, but I cannot. ⏰💔',66,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.35,3.5),7.5,'#3498DB');

ins('Paladin TV3 - 此生不换 (This Life Unchanged)','Bluebird Flying Fish insert song. Changqing and Zixuan — three lifetimes, one love. 🐍💚',72,'A','minor',
  mkMP('voice',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.45,0.3,3.0),6.5,'#27AE60');

ins('Paladin TV3 - 偏爱 (Favoritism)','Zhang Yunjing insert song. Changqing choosing Zixuan over the world — my only bias is you. 💜🗡️',78,'E','minor',
  mkMP('voice',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.4,0.25,2.5),6.0,'#8E44AD');

ins('Paladin TV3 - 答应不爱你 (Promise Not to Love You)','Ronald Cheng insert song. Zixuan drinks the forgetting potion — I promised, but I lied. 💧🍷',60,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#F1948A');

ins('Paladin TV3 - 雪见·落入凡尘 (Xuejian Falls to Earth)','Mak Chun Hung instrumental. The Tang family daughter awakening — snow falls in midsummer. ❄️🌸',64,'D','major',
  mkMP('pipa',chn(62,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.5,0.3,3.0),6.5,'#D2B4DE');

// =====================================================
//  仙剑云之凡 TV (2016) — Chinese Paladin 5
// =====================================================
console.log('\n  Paladin TV5 (2016)...\n');

ins('Paladin TV5 - 无法说爱 (Cannot Say Love)','Power Station ending theme. Jiang Yunfan — some loves are too heavy for words. 💔🌧️',68,'E','minor',
  mkMP('voice',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.5,0.35,3.5),7.5,'#5D6D7E');

ins('Paladin TV5 - 彼此 (Each Other)','Chen Chusheng insert song. Tang Yurou and Jiang Yunfan — we are each other only light. 🕯️💕',64,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#F5B041');

// =====================================================
//  Summary
// =====================================================
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
const total = db.prepare("SELECT COUNT(*) AS cnt FROM compositions WHERE title LIKE '%Paladin%' OR title LIKE '%仙剑%' OR title LIKE '%轩辕剑%'").get();
console.log('\n  Paladin TV OST: '+cnt.cnt+' tracks');
console.log('  All Paladin/Xuan-Yuan in DB: '+total.cnt+' tracks');
console.log('  Account: maizhenhong@music.square / paladintv');
