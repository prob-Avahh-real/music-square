const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🍄⭐ Importando Mario OST...\n');

// Reuse Koji Kondo account from Zelda seed
const mEmail = 'kondo@music.square';
let mUser = db.prepare('SELECT * FROM users WHERE email = ?').get(mEmail);
if (!mUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'近藤浩治',mEmail,bcrypt.hashSync('triforce',10),'Koji Kondo (1961–) — Nintendo composer, Mario & Zelda 🎮🎵');
  mUser = db.prepare('SELECT * FROM users WHERE email = ?').get(mEmail);
  console.log('  + user: 近藤浩治');
} else { console.log('  + using: 近藤浩治 (existing)'); }
const uid = mUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function ins(t,desc,b,ks,sc,tr,ds,co){const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);if(ex){console.log('  ~ '+t);return ex.id;}const id=uuidv4();db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2800+2000),Math.floor(Math.random()*900+350),Math.floor(Math.random()*150+60),id);console.log('  + '+t);return id;}

console.log('  Super Mario...');

ins('Super Mario - Overworld (Ground Theme)','The most recognizable video game melody in history. Do-do-do, do-do-do-dooo!',100,'C','major',mk('piano',[60,60,60,64,67,64,60,67,64,67,72,72,72,72,71,69,67,64,60,67,64,67,72,60],0.2,0.1),3.5,'#E74C3C');

ins('Super Mario - Underground','Descending into the dark pipes. Tense, sparse, and funky.',120,'C','minor',mk('synth',[48,48,48,51,48,48,51,55,51,48,48,51,48,48,51,55],0.15,0.1),2.0,'#1C2833');

ins('Super Mario - Underwater','Swimming through the deep blue. A waltz among the Cheep Cheeps.',80,'C','major',mk('piano',[60,64,67,72,71,67,64,60,62,64,67,72,71,67,64,60],0.4,0.25),4.5,'#3498DB');

ins('Super Mario - Starman','Invincible! The frantic sprint that makes you feel like a god.',150,'C','major',mk('synth',[72,76,72,76,72,76,84,84,84,79,76,72,76,72,76,72],0.15,0.05),2.0,'#F1C40F');

ins('Super Mario 64 - Dire Dire Docks','Jolly Roger Bay at night. The most atmospheric water level theme ever.',60,'C','major',mkMP('piano',[60,64,67,72,71,67,64,60,62,64,67,72,71,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,3.0),6.0,'#2980B9');

ins('Super Mario 64 - Bob-omb Battlefield','The first step into 3D Mario. Cannons, Chain Chomps, and pure joy.',120,'C','major',mkMP('piano',chn(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.25,0.15,2.0),3.5,'#27AE60');

ins('Super Mario Galaxy - Gusty Garden Galaxy','Mario soars through floating gardens in space. The most majestic orchestra in gaming.',96,'D','major',mkC('orchestra',[[50,54,57,62],[45,48,52,57],[42,46,50,54],[50,54,57,62]],2.5),6.0,'#8E44AD');

ins('Super Mario Galaxy - Rosalinas Observatory','The Comet Observatory drifts through space. A lullaby for the cosmos.',60,'C','major',mkMP('piano',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.35,3.0),7.0,'#D2B4DE');

ins('Super Mario Odyssey - Jump Up, Super Star!','Pauline sings in New Donk City. A Broadway showstopper in the Mushroom Kingdom.',128,'C','major',mkMP('voice',[60,64,67,72,76,72,67,64,62,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.25,0.1,2.0),4.0,'#E91E63');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Total Kondo tracks (Zelda+Mario): '+cnt.cnt);
console.log('  Account: kondo@music.square / triforce');
