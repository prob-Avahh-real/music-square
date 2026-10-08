const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('💃🕺 Importando Mamma Mia! OST (ABBA)...\n');

const mmEmail = 'abba@music.square';
let mmUser = db.prepare('SELECT * FROM users WHERE email = ?').get(mmEmail);
if (!mmUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'ABBA',mmEmail,bcrypt.hashSync('dancingqueen',10),'Benny Andersson & Björn Ulvaeus — ABBA founders, Mamma Mia! composers, the greatest pop songwriters of all time 🎹🇸🇪');
  mmUser = db.prepare('SELECT * FROM users WHERE email = ?').get(mmEmail);
  console.log('  + user: ABBA');
} else { console.log('  + exists: ABBA'); }
const uid = mmUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function mkPop(mi,p,nd,g){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const bn=[];let bs=0;for(let i=0;i<4;i++){bn.push({pitch:48,start:Math.round(bs*100)/100,duration:2.0});bn.push({pitch:43,start:Math.round((bs+2)*100)/100,duration:2.0});bs+=4.5;}const dn=[];let ds=0;for(let i=0;i<16;i++){dn.push({pitch:36,start:Math.round(ds*100)/100,duration:0.25});dn.push({pitch:38,start:Math.round((ds+0.5)*100)/100,duration:0.25});ds+=1.0;}return[{instrument:mi,notes:mn},{instrument:'bass',notes:bn},{instrument:'drums',notes:dn}];}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*3500+3000),Math.floor(Math.random()*1200+600),Math.floor(Math.random()*180+80),id);
  console.log('  + '+t);return id;
}

console.log('  Mamma Mia!...\n');

ins('Mamma Mia - Mamma Mia','Donna discovers her three ex-lovers at the door. I have been cheated by you since I do not know when. 😱🚪',136,'D','major',
  mkPop('piano',[62,66,69,74,73,69,66,62,62,66,69,74,73,69,66,62,62,66,69,74,73,69,66,62],0.25,0.1),4.0,'#3498DB');

ins('Mamma Mia - Dancing Queen','The Greek island erupts. All the women dancing on the pier — you can dance, you can jive. 💃🌅',100,'A','major',
  mkMP('voice',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61],[[45,49,52,57],[43,47,50,55],[41,45,48,53],[45,49,52,57]],0.35,0.2,2.5),5.5,'#E91E63');

ins('Mamma Mia - Super Trouper','Donna and the Dynamos reunion. Spotlight shining on the wedding eve. 🎤✨',118,'C','major',
  mkMP('voice',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.15,2.0),4.5,'#F39C12');

ins('Mamma Mia - Money Money Money','Donna dreaming of a rich man while scrubbing the taverna floor. Money money money, always sunny in a rich man world. 💰☀️',124,'A','minor',
  mkPop('piano',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],0.25,0.1),4.0,'#27AE60');

ins('Mamma Mia - The Winner Takes It All','Meryl Streep on the cliff. The gods may throw the dice — the saddest ABBA song ever written. 😭🌊',64,'A','major',
  mkMP('voice',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61,57,61,64,68,73],[[45,49,52,57],[43,47,50,55],[41,45,48,53],[45,49,52,57],[43,47,50,55]],0.5,0.3,3.0),7.0,'#8E44AD');

ins('Mamma Mia - Take a Chance on Me','Rosie pursues Bill on the beach. If you change your mind, I am the first in line. 🏖️💕',108,'C','major',
  mkPop('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],0.25,0.12),4.0,'#F1948A');

ins('Mamma Mia - I Have a Dream','Sophie sends off the invitations. I believe in angels — the song that starts it all. ✉️👼',72,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,3.0),6.5,'#85C1E9');

ins('Mamma Mia - SOS','Sam sings to Donna. So when you are near me, darling can you hear me — the desperate plea across the taverna. 📻💔',126,'F','major',
  mkMP('voice',[65,69,72,76,74,72,69,65,69,72,76,79,76,72,69,65],[[41,45,48,53],[43,47,50,55],[45,49,52,57],[41,45,48,53]],0.25,0.1,2.0),4.0,'#E74C3C');

ins('Mamma Mia - Chiquitita','Donna devastated, Tanya and Rosie console her. Chiquitita, tell me what is wrong — friendship in harmony. 🤗💧',84,'A','major',
  mkMP('voice',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61],[[45,49,52,57],[43,47,50,55],[41,45,48,53],[45,49,52,57]],0.4,0.25,2.5),5.5,'#F5B7B1');

ins('Mamma Mia - Voulez-Vous','The bachelor party and bachelorette collide on the beach. Voulez-vous — the disco inferno. 🕺🔥',126,'C','minor',
  mkPop('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],0.2,0.08),3.5,'#C0392B');

ins('Mamma Mia - Gimme Gimme Gimme','The Dynamos rehearsing their old moves. Gimme gimme gimme a man after midnight. 🌙💋',120,'D','minor',
  mkPop('synth',[62,65,69,74,72,69,65,62,65,69,74,77,74,69,65,62],0.25,0.1),4.0,'#8E44AD');

ins('Mamma Mia - Slipping Through My Fingers','Donna helps Sophie get ready for the wedding. Schoolbag in hand, she leaves home in the early morning. 🎒😢',68,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.55,0.35,3.5),7.5,'#F7DC6F');

ins('Mamma Mia - Our Last Summer','Harry remembers his summer with Donna. Walking along the Seine, laughing in the rain. 🌧️🇫🇷',80,'C','major',
  mkMP('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.45,0.3,3.0),6.5,'#2ECC71');

ins('Mamma Mia - Does Your Mother Know','Tanya fends off the young beach boy. I can dance with you honey, if you think it is funny. 👠😏',132,'G','major',
  mkPop('piano',[55,59,62,67,66,62,59,55,59,62,67,71,67,62,59,55],0.25,0.1),4.0,'#E74C3C');

ins('Mamma Mia - Knowing Me Knowing You','Sam and Donna walk through old photos. Knowing me, knowing you — there is nothing we can do. 📸💔',96,'A','major',
  mkMP('voice',[57,61,64,68,69,68,64,61,57,61,64,68,69,68,64,61],[[45,49,52,57],[43,47,50,55],[41,45,48,53],[45,49,52,57]],0.35,0.2,2.5),5.5,'#5D6D7E');

ins('Mamma Mia - Lay All Your Love on Me','Sky and Sophie on the beach. Do not go wasting your emotion — the synth-disco confession. 🏖️💘',132,'D','minor',
  mkPop('synth',[62,65,69,74,72,69,65,62,65,69,74,77,74,69,65,62],0.2,0.08),3.5,'#3498DB');

ins('Mamma Mia - Waterloo','The finale. The entire cast on the pier — I was defeated, you won the war. 🎉🏆',148,'D','major',
  mkMP('voice',[62,66,69,74,73,69,66,62,66,69,74,78,74,69,66,62],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.2,0.08,1.5),3.5,'#F1C40F');

ins('Mamma Mia - Thank You for the Music','Sophie sings the encore. Without a song or a dance, what are we? 🎵🙏',72,'C','major',
  mkMP('voice',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,3.0),7.0,'#D2B4DE');

ins('Mamma Mia - Honey Honey','Sophie reads Donnas diary. Honey honey, how you thrill me — the sweetest flashback song. 🍯📔',108,'C','major',
  mkPop('piano',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],0.25,0.12),4.0,'#F5B041');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Mamma Mia! OST: '+cnt.cnt+' tracks');
console.log('  Account: abba@music.square / dancingqueen');
