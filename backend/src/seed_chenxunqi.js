const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎬🎻 Importando Frankie Chan (陈勋奇) Complete Works...\n');

const cxEmail = 'chenxunqi@music.square';
let cxUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cxEmail);
if (!cxUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'陈勋奇',cxEmail,bcrypt.hashSync('ashes',10),'Frankie Chan / Chen Xunqi (1951–) — HK film polymath, scored Wong Kar-wai classics & wuxia gems 🎬🎹');
  cxUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cxEmail);
  console.log('  + user: 陈勋奇');
} else { console.log('  + exists: 陈勋奇'); }
const uid = cxUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function dor(r,st){const d=[0,2,3,5,7,9,10];return st.map(s=>r+d[s%7]+Math.floor(s/7)*12);}
function phryg(r,st){const p=[0,1,3,5,7,8,10];return st.map(s=>r+p[s%7]+Math.floor(s/7)*12);}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2000+1200),Math.floor(Math.random()*550+200),Math.floor(Math.random()*70+25),id);
  console.log('  + '+t);return id;
}

// =====================================================
//  东邪西毒 (Ashes of Time) — 1994
// =====================================================
console.log('  Ashes of Time...\n');

ins('Ashes of Time - 天地孤影任我行 (Heaven and Earth)','The desert overture. Ouyang Feng alone under the vast sky — erhu and synth drones stretching to infinity. 🏜️⏳',56,'D','minor',
  mkMP('erhu',phryg(62,[0,1,3,1,0,3,5,6,5,3,1,0,1,3,5,3]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.55,0.35,3.0),7.5,'#D35400');

ins('Ashes of Time - 世事苍茫成云烟 (Vanished into Mist)','Murong Yin and Murong Yang. The swordswoman who loved herself — cello lament in the sand. 🗡️💧',52,'A','minor',
  mk('cello',[57,60,64,69,67,64,60,57,55,57,60,64,69,72,69,64],0.65,0.4),7.0,'#6C3483');

ins('Ashes of Time - 昔情难追 (Lost Love Cannot Be Recovered)','Huang Yaoshi drinks the wine of oblivion. Piano and strings — memories burning in the desert wind. 🍷💔',60,'E','minor',
  mkMP('piano',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.5,0.3,3.0),6.5,'#9B59B6');

ins('Ashes of Time - 痴痴期盼 (Foolish Expectations)','The blind swordsman waiting for his peach blossom. A guqin meditation on unrequited love. 🍑🎋',48,'G','major',
  mk('piano',chn(55,[0,4,7,4,2,0,4,7,9,7,5,4,2,0,4,2]),0.7,0.45),7.5,'#F5B7B1');

ins('Ashes of Time - 又爱又恨 (Love and Hate)','The final battle. Percussion and strings collide like swords in the desert — love indistinguishable from violence. ⚔️🔥',96,'D','minor',
  mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],2.0),5.0,'#C0392B');

// =====================================================
//  重庆森林 (Chungking Express) — 1994
// =====================================================
console.log('\n  Chungking Express...\n');

ins('Chungking Express - 梦中人 (Dream Person)','Faye Wong dancing in the Midnight Express. Cantonese rock cover of The Cranberries — the sound of 1994 Hong Kong. 🥤💃',120,'C','major',
  mkMP('guitar',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.25,0.15,2.0),4.0,'#E91E63');

ins('Chungking Express - 加利福尼亚梦 (California Dreamin)','Cop 663 at the food stall. The Mamas & Papas on repeat — longing for a California that never arrives. 🛫🌴',112,'C#','major',
  mkMP('voice',[61,65,68,73,72,68,65,61,63,65,68,73,72,68,65,63],[[49,53,56,61],[46,50,53,58],[44,48,51,56],[49,53,56,61]],0.3,0.2,2.5),5.5,'#F1C40F');

ins('Chungking Express - 胡思乱想 (Random Thoughts)','The chase through Chungking Mansions. Percussive synth and handheld camera energy. 🏃🔫',130,'C','minor',
  mk('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],0.2,0.1),2.5,'#1C2833');

// =====================================================
//  堕落天使 (Fallen Angels) — 1995
// =====================================================
console.log('\n  Fallen Angels...\n');

ins('Fallen Angels - 忘记他 (Forget Him)','The killer and his agent in the jukebox bar. A murder ballad whispered through neon smoke. 🚬🔫',66,'A','minor',
  mkMP('voice',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.45,0.3,2.5),6.0,'#8E44AD');

ins('Fallen Angels - 因为了解 (Because I Understand)','Ho Chi-mo breaking into shops at night. Saxophone and city lights — the loneliest entrepreneur in Hong Kong. 🌃🎷',72,'C','minor',
  mkMP('sax',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.4,0.25,2.5),5.5,'#2C3E50');

ins('Fallen Angels - 思慕的人 (Yearning Person)','The mute He Zhiwu filming his father. A Taiwanese folk song refracted through Wong Kar-wai glass. 📹🏮',56,'D','major',
  mkMP('violin',[62,66,69,74,73,69,66,62,60,62,66,69,74,73,69,66],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.55,0.35,3.0),7.0,'#F5B041');

// =====================================================
//  Wuxia & Martial Arts Films
// =====================================================
console.log('\n  Wuxia & Martial Arts...\n');

ins('边城浪子 - 天涯路 (Border Town Wanderer)','Frankie Chan directs AND scores. A lone swordsman walks the edge of the martial world — erhu and desert wind. 🗡️🏜️',60,'D','minor',
  mkMP('erhu',dor(62,[0,3,4,6,4,3,0,3,4,6,7,6,4,3,0,3]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.5,0.35,3.0),6.5,'#D35400');

ins('天下无双 - 醉一场 (Drunk Once)','Chinese Odyssey theme. Faye Wong and Tony Leung singing — a wuxia musical that only Wong Kar-wai could produce. 🍷🎭',80,'G','major',
  mkMP('piano',[55,59,62,67,66,62,59,55,57,59,62,67,66,62,59,57],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.25,2.5),6.0,'#F7DC6F');

ins('冒险王 - 风中奇缘 (Dr. Wai in the Scripture with No Words)','Jet Li adventure theme. Orchestra and synth — Indiana Jones meets Chinese mythology. 📜⚔️',106,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.0),5.0,'#3498DB');

ins('富贵兵团 - 战鼓 (The Fortune Code)','WWII POW camp comedy-drama by Frankie Chan. Drumline and brass — humor and heroism under fire. 🥁🎖️',120,'D','minor',
  mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),4.0,'#C0392B');

// =====================================================
//  Signature Instrumental Works
// =====================================================
console.log('\n  Signature Works...\n');

ins('Frankie Chan - 武侠交响诗 (Wuxia Symphonic Poem)','Chen Xunqi concert work. Twenty years of martial arts film scoring distilled into one orchestral suite. 🎻⚔️',88,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.5),6.5,'#F1C40F');

ins('Frankie Chan - 香港之夜 (Hong Kong Nights)','The city through Frankie Chan eyes — neon saxophone, harbor strings, and the pulse of a sleepless metropolis. 🌃🎷',76,'C','minor',
  mkMP('sax',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.45,0.3,3.0),6.5,'#2C3E50');

ins('Frankie Chan - 武侠变奏曲 (Wuxia Variations)','Theme and variations on classic martial arts motifs. Pipa, erhu, and full orchestra — tradition in conversation with modernity. 🎼🗡️',92,'D','minor',
  mkMP('pipa',dor(62,[0,3,4,6,7,6,4,3,0,3,4,6,7,9,7,6]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.35,0.2,2.0),5.0,'#8E44AD');

// =====================================================
//  Summary
// =====================================================
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Frankie Chan complete works imported!');
console.log('  Total: '+cnt.cnt+' tracks');
console.log('  Account: chenxunqi@music.square / ashes');
