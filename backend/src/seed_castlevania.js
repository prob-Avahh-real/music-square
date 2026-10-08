const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🦇🏰 Importando Castlevania OST...\n');

const cvEmail = 'yamane@music.square';
let cvUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cvEmail);
if (!cvUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'山根ミチル',cvEmail,bcrypt.hashSync('vampire',10),'Michiru Yamane (1963–) — Castlevania composer, gothic baroque-metal master 🦇🎹');
  cvUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cvEmail);
  console.log('  + user: 山根ミチル');
} else { console.log('  + exists: 山根ミチル'); }
const uid = cvUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function hm(r,st){const h=[0,2,3,5,7,8,11];return st.map(s=>r+h[s%7]+Math.floor(s/7)*12);}
function ins(t,desc,b,ks,sc,tr,ds,co){const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);if(ex){console.log('  ~ '+t);return ex.id;}const id=uuidv4();db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2000+1200),Math.floor(Math.random()*650+250),Math.floor(Math.random()*90+35),id);console.log('  + '+t);return id;}

console.log('  Castlevania...');

ins('Castlevania - Vampire Killer','The Belmont whip cracks. The original gothic action theme — NES never sounded so metal.',140,'D','minor',mk('synth',hm(62,[0,2,3,2,0,3,5,7,5,3,2,0,2,3,5,7]),0.2,0.1),2.5,'#7B241C');

ins('Castlevania - Bloody Tears','Simon Belmont walks through the rain-soaked village. The definitive CV anthem.',145,'A','minor',mk('guitar',hm(57,[0,2,3,2,0,3,5,7,5,3,2,0,2,3,5,3]),0.2,0.1),2.5,'#C0392B');

ins('Castlevania - Beginning','Stage 1 of Castlevania III. The whip cracks and Draculas castle looms.',138,'C','minor',mk('synth',[60,63,67,60,63,67,72,72,71,67,63,60,63,67,72,75],0.2,0.1),2.5,'#4A235A');

ins('SotN - Draculas Castle','Alucard enters the castle for the first time. Gothic organ and harpsichord — pure baroque elegance.',90,'C','minor',mkC('organ',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],2.5),6.0,'#1B1B1B');

ins('SotN - Dance of Pales','The library theme. A harpsichord waltz among ancient tomes.',72,'C','minor',mk('piano',hm(60,[0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),0.35,0.2),4.0,'#F5F5F5');

ins('SotN - Marble Gallery','The clock tower corridor. Pipe organ and strings — the heart of the castle.',96,'E','minor',mkC('organ',[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],2.5),5.5,'#5D6D7E');

ins('SotN - Lost Painting','The inverted chapel. A melancholy masterpiece hidden in a PlayStation game.',56,'D','minor',mk('piano',[62,65,69,74,72,69,65,62,60,62,65,69,72,69,65,62],0.6,0.4),6.5,'#6C3483');

ins('SotN - Wandering Ghosts','The colosseum theme. Driving bass and organ — a chase through the arena.',130,'C','minor',mkC('organ',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],1.5),3.5,'#C0392B');

ins('Castlevania - Divine Bloodlines','Richter Belmonts theme from Rondo of Blood. The most heroic CV track.',140,'D','minor',mk('guitar',hm(62,[0,2,3,5,3,2,0,3,5,7,5,3,2,0,2,3]),0.2,0.1),2.5,'#F39C12');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Castlevania OST: '+cnt.cnt+' tracks');
console.log('  Account: yamane@music.square / vampire');
