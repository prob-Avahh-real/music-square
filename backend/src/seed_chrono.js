const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('⏰🌌 Importando Chrono OST...\n');

const cEmail = 'mitsuda@music.square';
let cUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cEmail);
if (!cUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'光田康典',cEmail,bcrypt.hashSync('lavos',10),'Yasunori Mitsuda (1972–) — Chrono Trigger/Cross composer, Celtic-infused RPG masterpieces ⚔️🎻');
  cUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cEmail);
  console.log('  + user: 光田康典');
} else { console.log('  + exists: 光田康典'); }
const uid = cUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function dor(r,st){const d=[0,2,3,5,7,9,10];return st.map(s=>r+d[s%7]+Math.floor(s/7)*12);}
function ins(t,desc,b,ks,sc,tr,ds,co){const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);if(ex){console.log('  ~ '+t);return ex.id;}const id=uuidv4();db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2400+1400),Math.floor(Math.random()*750+250),Math.floor(Math.random()*100+40),id);console.log('  + '+t);return id;}

console.log('  Chrono Trigger...');

ins('Chrono Trigger - Main Theme','The pendulum swings. Crono jumps out of bed and into the millennium fair.',120,'C','major',mkMP('piano',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.15,2.0),4.5,'#F1C40F');

ins('Chrono Trigger - Wind Scene (600 AD)','The overworld theme for the Middle Ages. Wind through the wheat fields.',72,'G','major',mk('piano',chn(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.0,'#82E0AA');

ins('Chrono Trigger - Frogs Theme','Glenn unsheathes the Masamune. Heroic march of a frog-knight.',110,'D','major',mkC('orchestra',[[50,54,57,62],[45,48,52,57],[42,46,50,54],[50,54,57,62]],2.0),5.0,'#27AE60');

ins('Chrono Trigger - Corridors of Time','Zeals floating kingdom. A melody that sounds like it fell from the sky.',66,'E','minor',mkMP('piano',[64,67,71,76,74,71,67,64,64,67,71,76,74,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.45,0.3,2.5),6.0,'#8E44AD');

ins('Chrono Trigger - Schalas Theme','Queen Zeals daughter, locked in the Ocean Palace. A lament in dorian mode.',52,'D','dorian',mk('piano',dor(62,[0,2,3,2,0,3,5,6,5,3,2,0,2,3,5,3]),0.65,0.4),7.0,'#5DADE2');

ins('Chrono Trigger - Battle with Magus','The dark wizard awaits in his castle. The most metal battle theme on the SNES.',140,'C','minor',mkC('synth',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],1.5),3.0,'#1B1B1B');

ins('Chrono Trigger - To Far Away Times','The ending theme. All of time compressed into one perfect melody.',60,'C','major',mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],3.0),7.5,'#F7DC6F');

console.log('  Chrono Cross...');

ins('Chrono Cross - Scars of Time','The opening cinematic that changed everything. Violin and acoustic guitar duet over Celtic percussion.',86,'D','minor',mkMP('violin',dor(62,[0,3,4,6,4,3,0,3,4,6,7,6,4,3,0,3]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.3,0.15,2.0),4.0,'#C0392B');

ins('Chrono Cross - Dreams of the Shore (Another World)','Serge wakes up in an unfamiliar Arni Village. Acoustic guitar and waves.',64,'G','major',mkMP('guitar',chn(55,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[43,47,50,55],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,2.5),6.0,'#A9DFBF');

ins('Chrono Cross - Radical Dreamers','The ending song. A guitar ballad for the dimension that never was.',60,'E','minor',mkMP('guitar',[64,67,71,76,74,71,67,64,64,67,71,76,74,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.5,0.3,2.5),6.5,'#2980B9');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Chrono OST: '+cnt.cnt+' tracks');
console.log('  Account: mitsuda@music.square / lavos');
