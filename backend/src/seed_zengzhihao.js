const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎮🗡️ Importando Zeng Zhihao (曾志豪) Complete Works...\n');

const zzhEmail = 'zengzhihao@music.square';
let zzhUser = db.prepare('SELECT * FROM users WHERE email = ?').get(zzhEmail);
if (!zzhUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'曾志豪',zzhEmail,bcrypt.hashSync('paladin',10),'Zeng Zhihao / 曾志豪 — Softstar composer, scored Chinese Paladin & Xuan-Yuan Sword series 🎮🎻');
  zzhUser = db.prepare('SELECT * FROM users WHERE email = ?').get(zzhEmail);
  console.log('  + user: 曾志豪');
} else { console.log('  + exists: 曾志豪'); }
const uid = zzhUser.id;

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
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2200+1500),Math.floor(Math.random()*650+280),Math.floor(Math.random()*90+35),id);
  console.log('  + '+t);return id;
}

// =====================================================
//  仙剑奇侠传三 (Chinese Paladin 3)
// =====================================================
console.log('  Chinese Paladin 3...\n');

ins('Paladin 3 - 御剑江湖 (Flying Sword Across the World)','The main theme of Paladin 3. Jingtian and Xuejian soaring above the six realms — erhu and orchestra in epic flight. ⚔️🌌',88,'D','minor',
  mkMP('erhu',dor(62,[0,3,4,6,7,6,4,3,0,3,4,6,7,9,7,6]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.35,0.2,2.0),5.0,'#8E44AD');

ins('Paladin 3 - 仙剑问情 (Asking Love of the Immortal Sword)','The love theme. Solo piano asking the question every Paladin hero must face — sword or heart? 💔🗡️',66,'C','minor',
  mkMP('piano',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.5,0.3,3.0),6.5,'#E91E63');

ins('Paladin 3 - 玉满堂 (Hall of Jade)','Jingtian pawnshop theme. Lively pipa and flute — counting coins and cracking jokes. 🪙😄',112,'C','major',
  mk('pipa',chn(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]),0.25,0.1),3.0,'#27AE60');

ins('Paladin 3 - 还魂草 (Resurrection Herb)','The ghost market theme. Xiao and synth — a melody that walks between the living and the dead. 👻🌿',60,'E','minor',
  mkMP('flute',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.55,0.35,3.0),7.0,'#6C3483');

ins('Paladin 3 - 玄色风 (Dark Wind)','Chonglou theme. Deep drums and aggressive strings — the demon lord enters. 👿⚡',130,'D','minor',
  mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),3.5,'#1B1B1B');

// =====================================================
//  仙剑奇侠传四 (Chinese Paladin 4)
// =====================================================
console.log('\n  Chinese Paladin 4...\n');

ins('Paladin 4 - 回梦游仙 (Dreaming Back to the Immortal Journey)','The main theme. Yun Tianhe and Liu Mengli — a hundred years of borrowed dreams, one melody. 💫🕯️',72,'G','major',
  mkMP('piano',chn(55,[0,4,7,9,7,5,4,2,0,4,7,9,7,5,4,2,0]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.3,3.0),6.5,'#3498DB');

ins('Paladin 4 - 织梦行云 (Weaving Dreams, Walking Clouds)','Han Lingsha theme. Pipa arpeggios like falling petals — the thief who stole a frozen heart. 🌸💨',60,'D','major',
  mk('pipa',chn(62,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9]),0.45,0.3),5.5,'#F5B7B1');

ins('Paladin 4 - 蝶恋 (Butterfly Love)','The recurring love theme across the series. Violin and harp — love that transcends reincarnation. 🦋💕',68,'C','major',
  mkMP('violin',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.35,3.0),7.0,'#F1948A');

ins('Paladin 4 - 苍浪剑赋 (Ode to the Azure Wave Sword)','Murong Ziying theme. Guqin and strings — the scholar-swordsman who weighs every life. 📜⚔️',76,'E','minor',
  mkMP('erhu',dor(64,[0,3,4,6,7,6,4,3,0,3,4,6,7,9,7,6]),[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.4,0.25,2.5),5.0,'#2980B9');

// =====================================================
//  仙剑奇侠传五 & 五前传 (Paladin 5 & 5 Prequel)
// =====================================================
console.log('\n  Chinese Paladin 5...\n');

ins('Paladin 5 - 心愿 (Wish)','The ending theme. Jiang Yunfan and Tang Yurou — a wish written in blood and rain. 🌧️💔',64,'A','minor',
  mkMP('voice',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.55,0.35,3.0),7.0,'#9B59B6');

ins('Paladin 5 Prequel - 有情燕 (Swallows of Love)','Xiahou Jinxuan and Xia. Two swallows flying south — a love song for the coldest winter. 🕊️❄️',62,'D','major',
  mkMP('piano',[62,66,69,74,73,69,66,62,66,69,74,78,74,69,66,62],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.55,0.35,3.0),7.0,'#85C1E9');

ins('Paladin 5 - 少年游 (Youthful Journey)','Jiang Yunfan and friends on the road. The adventure theme — four heroes, one bamboo forest. 🎋🏃',96,'G','major',
  mkMP('flute',chn(55,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.3,0.2,2.0),4.5,'#2ECC71');

// =====================================================
//  仙剑奇侠传六 (Chinese Paladin 6)
// =====================================================
console.log('\n  Chinese Paladin 6...\n');

ins('Paladin 6 - 镜中人 (Person in the Mirror)','Yue Jinzhao and Yue Qi. Two names, one soul — a mirror that reflects everything but truth. 🪞💧',60,'E','minor',
  mkMP('piano',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.55,0.35,3.0),7.0,'#D2B4DE');

ins('Paladin 6 - 浮生狱 (Floating Prison of Life)','The main theme. Nine springs of reincarnation — every life a cage, every death a key. ⛓️🕊️',72,'C','minor',
  mkC('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],2.5),6.0,'#1C2833');

// =====================================================
//  轩辕剑 (Xuan-Yuan Sword)
// =====================================================
console.log('\n  Xuan-Yuan Sword...\n');

ins('轩辕剑 - 千年宿命 (Millennium Destiny)','The series main theme. The legendary sword that divided history — bronze age meets orchestra. 🗡️⏳',80,'D','minor',
  mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],2.5),6.0,'#B8860B');

ins('轩辕剑 - 云和山的彼端 (Beyond Cloud and Mountain)','Xuan-Yuan Sword III theme. Sai Te journey from Venice to Chang an — the Silk Road in music. 🐪🏔️',76,'G','major',
  mkMP('erhu',chn(55,[0,4,7,9,7,5,4,2,0,4,7,9,7,5,4,7]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.3,2.5),6.0,'#F39C12');

ins('轩辕剑 - 苍之涛 (Azure Waves)','Xuan-Yuan Sword spin-off theme. Che Yun and Huan Zhong — time travelers trapped in the Spring and Autumn period. 🍂⌛',68,'A','minor',
  mkMP('flute',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.5,0.35,3.0),7.0,'#8E44AD');

// =====================================================
//  Summary
// =====================================================
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Zeng Zhihao complete works imported!');
console.log('  Total: '+cnt.cnt+' tracks');
console.log('  Account: zengzhihao@music.square / paladin');
