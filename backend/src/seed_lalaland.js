const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎬🌃 Importando La La Land OST...\n');

const llEmail = 'hurwitz@music.square';
let llUser = db.prepare('SELECT * FROM users WHERE email = ?').get(llEmail);
if (!llUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'Justin Hurwitz',llEmail,bcrypt.hashSync('cityofstars',10),'Justin Hurwitz (1985–) — La La Land composer, 2x Oscar winner, the man who made jazz romantic again 🎹🌃');
  llUser = db.prepare('SELECT * FROM users WHERE email = ?').get(llEmail);
  console.log('  + user: Justin Hurwitz');
} else { console.log('  + exists: Justin Hurwitz'); }
const uid = llUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function mkJazz(mel,chords,nd,g){const mn=[];let s=0;for(const x of mel){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const cn=[];let cs=0;for(const ch of chords){for(const x of ch){cn.push({pitch:x,start:Math.round(cs*100)/100,duration:2.5});}cs+=2.5+0.5;}return[{instrument:'piano',notes:mn},{instrument:'bass',notes:cn}];}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*3000+2500),Math.floor(Math.random()*1000+500),Math.floor(Math.random()*150+80),id);
  console.log('  + '+t);return id;
}

console.log('  La La Land...\n');

ins('La La Land - Another Day of Sun','The opening number. A hundred dancers on a LA freeway — the most joyful traffic jam in cinema history. ☀️🚗',126,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],2.0),5.0,'#F1C40F');

ins('La La Land - Someone in the Crowd','Mias roommates pull her to a Hollywood party. The swimming pool fantasy — jazz hands under string lights. 🎭🏊',138,'C','major',
  mkMP('voice',[60,64,67,72,76,72,67,64,62,64,67,72,76,72,67,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.25,0.12,2.0),4.0,'#E91E63');

ins('La La Land - Mia & Sebastians Theme','The piano melody that bookends the film. Sebastian plays it alone — and Mia finds him. 🎹💕',58,'A','major',
  mk('piano',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61,57,61,64,68,73,72,69,64,61],0.4,0.2),6.0,'#8E44AD');

ins('La La Land - A Lovely Night','Mia and Sebastian after the pool party. Tap dancing under the streetlight — what a waste of a lovely night. 💃🌙',112,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,62,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.15,2.0),4.5,'#D2B4DE');

ins('La La Land - Planetarium','Mia and Sebastian float into the stars at Griffith Observatory. Waltz in zero gravity. 🌌💫',72,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[36,40,43,48,52]],3.0),7.0,'#3498DB');

ins('La La Land - City of Stars (Duet)','Mia humming, Sebastian singing. The Oscar-winning song — city of stars, are you shining just for me? 🌟🎤',62,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,60,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,3.0),7.0,'#F5B041');

ins('La La Land - City of Stars (Piano Solo)','The theme stripped bare. Just Sebastian at the keys — the melody that haunts the whole film. 🎹🌟',56,'C','major',
  mk('piano',[60,64,67,72,71,67,64,60,60,64,67,72,71,67,64,62,60,64,67,72,76,72,67,64],0.55,0.3),6.5,'#F7DC6F');

ins('La La Land - Start a Fire','John Legend brings synth-pop to the jazz club. Keiths band The Messengers — the moment Seb sells out. 🔥🎸',108,'C','minor',
  mkMP('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.25,0.12,2.0),4.0,'#E74C3C');

ins('La La Land - Audition (The Fools Who Dream)','Mias audition song. Her aunt jumped into the Seine — here is to the fools who dream. 😭🎭',52,'C','major',
  mkMP('voice',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.6,0.35,3.5),8.0,'#F5B7B1');

ins('La La Land - Epilogue','The what-if montage. Seven minutes of an entire alternate life — the most beautiful heartbreak in cinema. 💔🎬',72,'C','major',
  mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[36,40,43,48,52],[48,52,55,60,64]],2.5),7.5,'#9B59B6');

ins('La La Land - The End','The final glance. Mia and Sebastian look at each other across the club — a lifetime in a single look. 🎹👀',60,'A','major',
  mk('piano',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61],0.6,0.35),6.0,'#2C3E50');

ins('La La Land - Summer Montage (Madeline)','Montage of LA summer love. Jazz piano with a bossa nova pulse — the sunniest days of their lives. ☀️🎹',96,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.4,0.2,2.5),5.5,'#85C1E9');

ins('La La Land - Engagement Party','Sebastian hears Mia and her boyfriend through the wall. The party music fades — only piano remains. 🥂💧',72,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.45,0.3,3.0),6.5,'#F1948A');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  La La Land OST: '+cnt.cnt+' tracks');
console.log('  Account: hurwitz@music.square / cityofstars');
