const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎤🌊 Importando James Wong / Huang Zhan (黄霑) Complete Works...\n');

const hzEmail = 'huangzhan@music.square';
let hzUser = db.prepare('SELECT * FROM users WHERE email = ?').get(hzEmail);
if (!hzUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'黄霑',hzEmail,bcrypt.hashSync('lionrock',10),'James Wong / Huang Zhan (1941–2004) — HK legendary lyricist-composer, the soul of Cantopop & wuxia 🎤🌊');
  hzUser = db.prepare('SELECT * FROM users WHERE email = ?').get(hzEmail);
  console.log('  + user: 黄霑');
} else { console.log('  + exists: 黄霑'); }
const uid = hzUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2800+2000),Math.floor(Math.random()*800+350),Math.floor(Math.random()*120+50),id);
  console.log('  + '+t);return id;
}

// =====================================================
//  Wuxia Anthems
// =====================================================
console.log('  Wuxia Anthems...\n');

ins('沧海一声笑 (The Swordsman Laughs at the Sea)','The most iconic wuxia song ever written. Five-note pentatonic scale reversed — Huang Zhan wrote it in 20 minutes after being drunk. ⛵⚔️',72,'G','major',
  mkMP('erhu',chn(55,[0,4,7,4,2,0,4,7,9,7,5,4,2,0,4,7,9,7,5,4]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.3,3.0),6.5,'#F39C12');

ins('傲气傲笑万重浪 (Proudly Laughing at Ten Thousand Waves)','Wong Fei-hung theme. The most powerful kung fu anthem — a generation of Chinese learned patriotism from this song. 🦁🇨🇳',110,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.0),5.0,'#C0392B');

ins('世间始终你好 (The World Will Always Have You)','The Condor Heroes 1983 theme. Luo Wen and Zhen Ni duet — the definitive martial arts love song. 🦅💕',78,'G','major',
  mkMP('voice',[55,59,62,67,66,62,59,55,57,59,62,67,66,62,59,57],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.3,3.0),6.5,'#E91E63');

ins('两忘烟水里 (Forgotten in the Misty Waters)','Demi-Gods Semi-Devils 1982 theme. A duet of reincarnation and forgetting — the saddest wuxia love song. 🌫️💧',68,'E','minor',
  mkMP('flute',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.5,0.35,3.0),7.0,'#8E44AD');

// =====================================================
//  Film Classics
// =====================================================
console.log('\n  Film Classics...\n');

ins('倩女幽魂 (A Chinese Ghost Story)','Nie Xiaoqian and Ning Caichen. The ghost ballad that defined HK supernatural romance — haunting erhu and synth. 👻🌙',72,'D','minor',
  mkMP('erhu',[62,65,69,74,72,69,65,62,60,62,65,69,72,69,65,62],[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.4,0.25,2.5),5.5,'#6C3483');

ins('黎明不要来 (Dawn Dont Come)','The love theme from A Chinese Ghost Story. Ye Qianwen pleads for the night to last forever. 🌅💔',60,'A','minor',
  mkMP('voice',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.55,0.35,3.0),7.0,'#F5B7B1');

ins('道 (The Dao)','The rap from A Chinese Ghost Story. Huang Zhan himself performs — a Buddhist-Taoist sermon set to hip hop beats. ☯️🎤',96,'C','minor',
  mk('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],0.25,0.15),3.0,'#1B1B1B');

ins('当年情 (Past Feelings)','A Better Tomorrow theme. Leslie Cheung sings for Chow Yun-fat and Ti Lung — brotherhood in every note. 🔫🤝',72,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.45,0.3,3.0),6.5,'#3498DB');

ins('奔向未来的日子 (Running Towards Future Days)','A Better Tomorrow II theme. The sequel song — Leslie Cheung voice carrying the weight of sacrifice. 🏃💨',80,'C','major',
  mkMP('piano',[60,64,67,72,76,72,67,64,62,64,67,72,76,72,67,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.4,0.25,2.5),5.5,'#F1C40F');

ins('最爱上海滩 (Shanghai Bund at Its Best)','The Bund theme revisited. The Huangpu River and the city that never sleeps — trumpet solo over harbor strings. 🌃🎺',72,'C','major',
  mkMP('trumpet',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.45,0.3,3.0),6.5,'#2C3E50');

// =====================================================
//  TV Series Themes
// =====================================================
console.log('\n  TV Series Themes...\n');

ins('上海滩 (The Bund)','The most recognizable Cantonese TV theme in history. Three opening notes and you know exactly where you are. 🌊🏙️',84,'A','minor',
  mkMP('voice',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.4,0.25,2.5),5.5,'#C0392B');

ins('狮子山下 (Below the Lion Rock)','The unofficial anthem of Hong Kong. Huang Zhan lyrics and Joseph Koo melody — the spirit of a city. 🦁🏔️',66,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#27AE60');

ins('楚留香 (Chor Lau-heung)','The legendary thief theme. Adam Cheng singing — a thousand cups of wine, a thousand miles of Jianghu. 🍷🗡️',76,'D','major',
  mkMP('erhu',[62,66,69,74,73,69,66,62,66,69,74,78,74,69,66,62],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.45,0.3,3.0),6.5,'#8E44AD');

ins('万水千山总是情 (Love Across Ten Thousand Rivers)','The 1982 TVB drama theme. Liza Wang — love conquers all mountains and rivers. 🏔️💕',72,'G','major',
  mkMP('voice',[55,59,62,67,66,62,59,55,59,62,67,71,67,62,59,55],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.5,0.3,3.0),7.0,'#F5B7B1');

ins('千愁记旧情 (A Thousand Sorrows Remember Old Love)','The Return of the Condor Heroes 1983 insert song. Sorrow distilled into melody — Huang Zhan at his most poetic. 🦅😢',60,'E','minor',
  mkMP('cello',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.6,0.4,3.5),7.5,'#5D6D7E');

// =====================================================
//  Signature & Concert Works
// =====================================================
console.log('\n  Signature Works...\n');

ins('问我 (Ask Me)','Huang Zhan most personal song. An answer to all who questioned his wild life — I laugh, I cry, I am still me. 🎤✨',66,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#F5F5F5');

ins('黄霑 - 沧海一声笑 (Live Symphony Ver.)','Huang Zhan, Luo Dayou, and Tsui Hark drunk in the studio. Three voices, one legend — the definitive recording. 🎤🍷',76,'G','major',
  mkC('orchestra',[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],3.0),8.0,'#F39C12');

ins('晚风 (Evening Breeze)','Huang Zhan duet with Anita Mui. The last great collaboration — two legends sharing one microphone. 🌬️💫',62,'C','major',
  mkMP('voice',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#D2B4DE');

ins('旧梦不须记 (Old Dreams Need Not Be Remembered)','Leung Sing-po debut film theme. Huang Zhan wrote this for a new beginning — forget yesterday. 🌅🎹',58,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.6,0.4,3.5),8.0,'#F7DC6F');

// =====================================================
//  Summary
// =====================================================
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  James Wong / Huang Zhan complete works imported!');
console.log('  Total: '+cnt.cnt+' tracks');
console.log('  Account: huangzhan@music.square / lionrock');
