const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎻🦋 Importando Luo Jiyi / Musit (骆集益) Complete Works (Expanded)...\n');

const ljyEmail = 'luojiyi@music.square';
let ljyUser = db.prepare('SELECT * FROM users WHERE email = ?').get(ljyEmail);
if (!ljyUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'骆集益',ljyEmail,bcrypt.hashSync('butterfly',10),'Luo Jiyi / Musit (骆集益) — Softstar composer, the romantic soul of Chinese Paladin 🎻🦋');
  ljyUser = db.prepare('SELECT * FROM users WHERE email = ?').get(ljyEmail);
  console.log('  + user: 骆集益');
} else { console.log('  + exists: 骆集益'); }
const uid = ljyUser.id;

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
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2400+1600),Math.floor(Math.random()*700+300),Math.floor(Math.random()*100+40),id);
  console.log('  + '+t);return id;
}

console.log('  Paladin 1 & 2...');
ins('Paladin 1 - 蝶恋 (Butterfly Love)','The definitive Chinese Paladin love theme. Li Xiaoyao and Zhao Ling-er — a butterfly that returns every spring. 🦋💧',62,'C','major',mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#E91E63');
ins('Paladin 1 - 桃花幻梦 (Peach Blossom Dream)','Zhao Ling-er in the peach blossom forest. The dream sequence that opens the most beloved RPG in Chinese history. 🌸💤',56,'G','major',mkMP('flute',[55,59,62,67,66,62,59,55,59,62,67,71,67,62,59,55],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.6,0.4,3.5),8.0,'#F5B7B1');
ins('Paladin 1 - 君莫悲 (Gentleman Do Not Grieve)','The ending theme. The sword lost, the lover gone — the saddest farewell in gaming. 😢⚔️',58,'A','minor',mkMP('erhu',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.6,0.4,3.5),8.0,'#6C3483');
ins('Paladin 1 - 云谷鹤峰 (Cloud Valley Crane Peak)','Opening cinematics. Cranes flying over misty peaks — the first music you hear in Paladin. 🏔️🕊️',60,'D','major',mkMP('flute',[62,66,69,74,73,69,66,62,66,69,74,78,74,69,66,62],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.6,0.4,3.5),8.0,'#3498DB');

ins('Paladin 2 - 水龙吟 (Water Dragon Chant)','Wang Xiaohu theme. Pipa and erhu — the young swordsman who walks between two worlds. 🐉🌊',72,'D','minor',mkMP('pipa',dor(62,[0,3,4,6,7,6,4,3,0,3,4,6,7,9,7,6]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.4,0.25,2.5),5.5,'#3498DB');
ins('Paladin 2 - 仙剑问情 (Paladin Asks Love)','Shen Qishang theme. Fox spirit falls in love with a mortal — flute duet across species. 🦊💕',64,'C','major',mkMP('flute',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.0),7.0,'#E91E63');

console.log('  Paladin 3...');
ins('Paladin 3 - 青玉案 (Green Jade Desk)','Zixuan love theme. The snake maiden who sacrificed three lifetimes — the saddest erhu melody in Paladin. 🐍💔',60,'E','minor',mkMP('erhu',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.55,0.35,3.0),7.0,'#8E44AD');
ins('Paladin 3 - 望海潮 (Watching the Tidal Wave)','The ocean temple theme. Guqin and strings — standing at the edge of the East Sea. 🌊🎋',66,'D','major',mkMP('piano',[62,66,69,74,73,69,66,62,66,69,74,78,74,69,66,62],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.55,0.35,3.0),7.0,'#85C1E9');
ins('Paladin 3 - 紫陌丰田 (Purple Path)','Shu Mountain theme. Pipa and chimes — immortal cultivation sect at golden hour. ⛰️🔔',68,'D','major',mkMP('pipa',chn(62,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.5,0.3,2.5),6.0,'#F39C12');

ins('Paladin 3 Gaiden - 挥剑问情 (Swinging Sword Asking Love)','Nangong Huang and Wen Hui. The spin-off love theme — ask the sword, ask the heart, receive no answer. ⚔️❓',64,'C','minor',mkMP('voice',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.5,0.35,3.0),7.0,'#9B59B6');
ins('Paladin 3 Gaiden - 眉间心上 (Between Brows Upon Heart)','The unspoken love theme. Cello solo — what the eyes cannot say, the music will. 🎻💫',56,'G','major',mk('cello',chn(43,[0,4,7,9,7,5,4,2,0,4,7,9,7,5,4,7]),0.7,0.45),7.5,'#F1948A');

console.log('  Paladin 4...');
ins('Paladin 4 - 君莫思归 (Gentleman Think Not of Returning)','Yun Tianhe farewell. A hundred years later, the blind swordsman still waits — piano and strings for eternity. ⏳🎹',54,'E','minor',mkMP('piano',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.65,0.4,3.5),8.5,'#2980B9');
ins('Paladin 4 - 玉水明沙 (Jade Water Bright Sand)','Liu Mengli theme. The guqin piece that sounds like moonlight on a desert spring. 🌙🏜️',52,'D','major',mkMP('erhu',[62,66,69,74,73,69,66,62,66,69,74,78,74,69,66,62],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.65,0.4,3.5),8.0,'#D2B4DE');
ins('Paladin 4 - 步虚词 (Walking the Void Verse)','Xuan Xiao theme. The frozen immortal who defied heaven — organ and strings of cosmic defiance. ❄️🏯',60,'C','minor',mkC('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],2.5),6.5,'#1C2833');
ins('Paladin 4 - 寒声碎 (Cold Sound Shattered)','Xuan Xiao frozen prison. Ice cracking in eternal darkness — strings of absolute solitude. ❄️🔗',52,'C','minor',mkC('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],3.0),7.5,'#1B4F72');

console.log('  Paladin 5...');
ins('Paladin 5 - 凤鸣曲 (Phoenix Song)','The opening theme. A phoenix rising from the ashes of a broken seal — the adventure begins anew. 🔥🐦',78,'C','major',mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.5),6.0,'#F39C12');
ins('Paladin 5 - 龙影随风 (Dragon Shadow Follows Wind)','Long You and Xiao Man theme. The dragon prince and the Miao maiden — love across two worlds. 🐉🌸',68,'G','major',mkMP('piano',[55,59,62,67,66,62,59,55,59,62,67,71,67,62,59,55],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.55,0.35,3.0),7.0,'#27AE60');
ins('Paladin 5 - 仙缘再续 (Immortal Fate Renewed)','Ending credits theme. A hundred years later, the peach blossoms bloom again. 🌸🕯️',62,'C','major',mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.6,0.4,3.5),7.5,'#F5B7B1');

ins('Paladin 5 Prequel - 牵绊 (Bond)','Xiahou Jinxuan introspection. The merchant prince who bears the weight of two cities. ⚖️🏙️',60,'E','minor',mkMP('cello',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.6,0.4,3.5),7.5,'#5D6D7E');
ins('Paladin 5 Prequel - 暮雨今夕 (Evening Rain Tonight)','Xia farewell. Rain on the stone bridge — the last time they meet. 🌧️🌉',54,'A','minor',mkMP('erhu',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.65,0.4,3.5),8.5,'#85C1E9');

console.log('  Paladin 6...');
ins('Paladin 6 - 浮生若梦 (Life Is But a Dream)','Yue Jinzhao awakening. Two souls in one body — a dream that spans nine lifetimes. 💤🪞',58,'C','minor',mkMP('piano',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.6,0.4,3.5),7.5,'#6C3483');
ins('Paladin 6 - 越今朝 (Beyond Today)','Yue Qi theme. The girl who carries all nine lifetimes in her eyes — erhu across the river of time. 🌉⏳',56,'E','minor',mkMP('erhu',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.6,0.4,3.5),8.0,'#8E44AD');
ins('Paladin 6 - 洛家 (Luo Family Manor)','Luo family manor. Guzheng and bamboo flute — a noble house in the misty mountains. 🏯🌫️',72,'G','major',mkMP('flute',[55,59,62,67,66,62,59,55,59,62,67,71,67,62,59,55],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.5,0.35,3.0),6.5,'#27AE60');

console.log('  Paladin 7...');
ins('Paladin 7 - 剑指苍天 (Sword Points to Heavens)','Yue Qingshu and Xiu Wu. A divine sword against a heavenly conspiracy. ⚔️☁️',84,'D','minor',mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],2.0),5.5,'#8E44AD');
ins('Paladin 7 - 春晖爱日 (Spring Sunshine Beloved Day)','Pastoral theme. Miaojiang village life — pipa and erhu in golden afternoon light. 🌾☀️',72,'G','major',mkMP('pipa',chn(55,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.3,2.5),6.0,'#F7DC6F');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Luo Jiyi complete: '+cnt.cnt+' tracks');
console.log('  Account: luojiyi@music.square / butterfly');
