const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('💀❤️ Importando Undertale OST...\n');

const utEmail = 'tobyfox@music.square';
let utUser = db.prepare('SELECT * FROM users WHERE email = ?').get(utEmail);
if (!utUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'Toby Fox',utEmail,bcrypt.hashSync('determination',10),'Toby Fox (1991–) — Undertale/Deltarune creator & composer, one-man RPG miracle 🐕🎹');
  utUser = db.prepare('SELECT * FROM users WHERE email = ?').get(utEmail);
  console.log('  + user: Toby Fox');
} else { console.log('  + exists: Toby Fox'); }
const uid = utUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function ins(t,desc,b,ks,sc,tr,ds,co){const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);if(ex){console.log('  ~ '+t);return ex.id;}const id=uuidv4();db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2600+1800),Math.floor(Math.random()*850+300),Math.floor(Math.random()*130+50),id);console.log('  + '+t);return id;}

console.log('  Undertale...');

ins('Undertale - Once Upon a Time','The opening theme. A simple melody that promises a story worth hearing.',60,'C','major',mk('piano',[60,64,67,72,71,67,64,60,60,64,67,72,71,67,64,62],0.5,0.35),5.5,'#8E44AD');

ins('Undertale - Ruins','Falling into the underground. The first area theme — gentle, mysterious, welcoming.',72,'C','major',mkMP('piano',[60,64,67,72,71,67,64,60,62,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.4,0.25,2.5),5.5,'#D2B4DE');

ins('Undertale - Bonetrousle','Papyrus charges in! The great skeleton wants to capture you.',140,'C','major',mk('piano',chn(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.2,0.1),2.5,'#E67E22');

ins('Undertale - Spider Dance','Muffets battle theme. A waltz that builds into a frantic showdown.',120,'D','minor',mk('piano',[62,65,69,74,72,69,65,62,64,65,69,74,72,69,65,64],0.25,0.15),3.0,'#8E44AD');

ins('Undertale - Spear of Justice','Undyne throws her spear. The most determined battle theme in the underground.',140,'C','minor',mk('guitar',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],0.2,0.1),2.5,'#3498DB');

ins('Undertale - Death by Glamour','Mettaton EX takes the stage. Disco synth and laser beams — oh yes!',128,'F#','minor',mk('synth',[66,69,73,78,76,73,69,66,68,69,73,78,76,73,69,68],0.2,0.1),3.0,'#E91E63');

ins('Undertale - Megalovania','Sans judges you. The bad time theme heard round the world.',120,'D','minor',mk('synth',[62,62,65,62,62,65,69,69,67,65,62,60,58,60,62,65],0.2,0.1),2.5,'#1B1B1B');

ins('Undertale - Hopes and Dreams','Asriel Dreemurr fights to save you. The most cathartic final battle theme.',140,'C','major',mkC('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],1.5),4.0,'#F1C40F');

ins('Undertale - His Theme','Asriels tears fall on the golden flowers. The saddest music box in the world.',56,'C','major',mk('piano',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],0.6,0.4),6.5,'#F5B7B1');

ins('Undertale - Undertale (New Home)','The monsters tell their story. Walking through the judgment hall.',64,'C','major',mkMP('piano',[60,64,67,72,71,67,64,60,62,64,67,72,74,72,71,67],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,3.0),6.5,'#E8DAEF');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Undertale OST: '+cnt.cnt+' tracks');
console.log('  Account: tobyfox@music.square / determination');
