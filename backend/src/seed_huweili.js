const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎬🇭🇰 Importando Hu Weili (胡伟立) Complete Works...\n');

const hwEmail = 'huweili@music.square';
let hwUser = db.prepare('SELECT * FROM users WHERE email = ?').get(hwEmail);
if (!hwUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'胡伟立',hwEmail,bcrypt.hashSync('kungfu',10),'Hu Weili / William Hu (1937–) — HK film music legend, scored Stephen Chow classics & wuxia epics 🎬🎻');
  hwUser = db.prepare('SELECT * FROM users WHERE email = ?').get(hwEmail);
  console.log('  + user: 胡伟立');
} else { console.log('  + exists: 胡伟立'); }
const uid = hwUser.id;

// ─── helpers ───
function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function dor(r,st){const d=[0,2,3,5,7,9,10];return st.map(s=>r+d[s%7]+Math.floor(s/7)*12);}
function jpn(r,st){const s=[0,1,5,7,8];return st.map(x=>r+s[x%5]+Math.floor(x/5)*12);}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2200+1300),Math.floor(Math.random()*600+250),Math.floor(Math.random()*80+30),id);
  console.log('  + '+t);return id;
}

// =====================================================
//  功夫 (Kung Fu Hustle) — 2004
// =====================================================
console.log('  Kung Fu Hustle...\n');

ins('Kung Fu Hustle - 只要为你活一天 (As Long as I Live for You)','The love theme. Sing and Ah Fong in the lollipop scene — gentle erhu and strings amidst the chaos. 🍭❤️',60,'D','major',
  mkMP('erhu',[62,66,69,74,73,69,66,62,64,66,69,74,73,69,66,64],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.5,0.3,3.0),7.0,'#E91E63');

ins('Kung Fu Hustle - 市集 (The Market)','The Pig Sty Alley morning bustle. Lively strings and pipa — a chaotic Chinese marketplace symphony. 🏘️🥟',116,'C','major',
  mk('pipa',chn(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]),0.2,0.1),2.5,'#F39C12');

ins('Kung Fu Hustle - 闯将令 (March of the Generals)','The Beast vs the Axe Gang. Military drums and suona — the ultimate showdown cue. ⚔️💥',140,'D','minor',
  mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),3.5,'#C0392B');

ins('Kung Fu Hustle - 小刀会序曲 (Dagger Society Overture)','The hero arrives. The most iconic wuxia entrance theme — used from Stephen Chow to Donnie Yen. 🗡️🌀',104,'G','major',
  mkC('orchestra',[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],2.0),5.0,'#F1C40F');

ins('Kung Fu Hustle - 东海渔歌 (East Sea Fisherman Song)','The Lion Roar technique. Orchestral waves crashing against the Beast. 🌊🦁',120,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.0),5.0,'#3498DB');

// =====================================================
//  少林足球 (Shaolin Soccer) — 2001
// =====================================================
console.log('\n  Shaolin Soccer...\n');

ins('Shaolin Soccer - 少林功夫好嘢 (Shaolin Kung Fu is Great)','Sing and his brothers demonstrate their skills. Funky kung fu groove — the sound of underdogs rising. ⚽🔥',120,'C','major',
  mkMP('piano',chn(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.15,2.0),4.0,'#27AE60');

ins('Shaolin Soccer - Main Theme','The team walks onto the field. An anthem for the rejected and the dreamers. ⚽🏟️',104,'D','major',
  mkC('orchestra',[[50,54,57,62],[45,48,52,57],[42,46,50,54],[50,54,57,62]],2.0),5.5,'#F39C12');

// =====================================================
//  Wuxia & Period Films
// =====================================================
console.log('\n  Wuxia & Period Films...\n');

ins('笑傲江湖 - 沧海一声笑 (The Swordsman Theme)','The most famous wuxia song. Three heroes drifting on a boat — the Jianghu in three chords. ⛵⚔️',72,'G','major',
  mkMP('erhu',chn(55,[0,4,7,4,2,0,4,7,9,7,5,4,2,0,4,7]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.45,0.3,3.0),6.5,'#8E44AD');

ins('东方不败 - 只记今朝笑 (Only Remember Today Laughter)','Invincible Asia theme. Pipa and flute — the divine feminine warrior ascends. 🌸🗡️',96,'D','major',
  mkMP('pipa',chn(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.3,0.15,2.0),4.0,'#E74C3C');

ins('黄飞鸿 - 男儿当自强 (Once Upon a Time in China)','Wong Fei-hung theme. A martial arts national anthem — drums and brass declaring Chinese pride. 🦁🇨🇳',110,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.0),5.0,'#C0392B');

ins('唐伯虎点秋香 - 求神 (Praying to Gods)','Flirting With Scholar opening. Wong Fei-hung theme repurposed for comedy gold. 🎭🔥',110,'C','major',
  mkC('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],2.0),5.0,'#E67E22');

// =====================================================
//  TV Scores
// =====================================================
console.log('\n  TV Series...\n');

ins('倚天屠龙记 - 刀剑如梦 (Heavenly Sword Dragon Saber)','The 1994 TV series theme. Sword and saber dream — the soundtrack of a generation of martial arts fans. ⚔️💭',96,'E','minor',
  mkMP('erhu',jpn(64,[0,1,3,4,2,1,0,1,3,4,6,4,3,1,0,1]),[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.35,0.2,2.0),5.0,'#8E44AD');

ins('神雕侠侣 - 神话情话 (The Return of the Condor Heroes)','Yang Guo and Xiaolongnv. A love that defies the martial world — melody that spans sixteen years. 🦅💕',72,'G','major',
  mkMP('flute',[55,59,62,67,66,62,59,55,57,59,62,67,66,62,59,57],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.5,0.3,3.0),6.5,'#F5B7B1');

ins('天龙八部 - 难念的经 (Demi-Gods Semi-Devils)','The 1997 Demi-Gods theme. Buddhist sutra recitation meets HK pop — fate in every line. 📿⚔️',88,'D','minor',
  mkMP('voice',dor(62,[0,3,4,6,7,6,4,3,0,3,4,6,7,9,7,6]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.35,0.2,2.5),5.5,'#F39C12');

// =====================================================
//  胡伟立 Signature Instrumental Works
// =====================================================
console.log('\n  Signature Works...\n');

ins('偷功 (Stealing Skills)','Hu Weili most iconic action cue. Erhu and percussion — the sound of a martial artist stealing forbidden techniques. 🥷⚡',130,'D','minor',
  mk('erhu',[62,65,69,74,72,69,65,62,60,62,65,69,72,69,65,62],0.2,0.1),2.5,'#1B1B1B');

ins('闯将令 (Charging Generals)','The classic military march from 1950s folk music, immortalized by Hu Weili arrangements in countless films. 🐴🎺',116,'G','major',
  mkC('orchestra',[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],2.0),5.0,'#C0392B');

ins('四川将军令 (Sichuan General Command)','Folk tune adapted by Hu Weili. The definitive wuxia battle fanfare — used in Kung Fu Hustle and beyond. 🏯🎺',126,'C','major',
  mkC('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],1.5),4.0,'#7B241C');

ins('英雄们战胜了大渡河 (Heroes Conquered the Dadu River)','The heroic river crossing theme. Hu Weili revolutionary opera adaptation — sweeping strings and chorus. 🌊🎻',100,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.5),6.0,'#F1C40F');

ins('百鸟朝凤 (Hundred Birds Paying Homage to the Phoenix)','The wedding scene classic. Suona solo — a hundred birds sing for the phoenix, chaos becomes celebration. 🐦🎊',120,'D','major',
  mk('suona',chn(62,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]),0.2,0.1),3.0,'#E74C3C');

// =====================================================
//  Summary
// =====================================================
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Hu Weili complete works imported!');
console.log('  Total: '+cnt.cnt+' tracks');
console.log('  Account: huweili@music.square / kungfu');
