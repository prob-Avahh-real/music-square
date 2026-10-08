const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎧🌃 Importando Jazz Hop Classics...\n');

// ─── helpers ───
function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function mkLofi(mi,p,bass,drums,nd,g){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const bn=[];const dn=[];let bs=0;for(const x of bass){bn.push({pitch:x,start:Math.round(bs*100)/100,duration:2.5});bs+=2.75;}let ds=0;for(let i=0;i<Math.ceil(p.length/3);i++){dn.push({pitch:36,start:Math.round(ds*100)/100,duration:0.25});dn.push({pitch:38,start:Math.round((ds+0.5)*100)/100,duration:0.25});ds+=2.75;}return[{instrument:mi,notes:mn},{instrument:'bass',notes:bn},{instrument:'drums',notes:dn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function dor(r,st){const d=[0,2,3,5,7,9,10];return st.map(s=>r+d[s%7]+Math.floor(s/7)*12);}

function getUser(email,username,pass,bio){
  let u=db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if(!u){const id=uuidv4();db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,username,email,bcrypt.hashSync(pass,10),bio);u=db.prepare('SELECT * FROM users WHERE email=?').get(email);console.log('  + user: '+username);}
  else{console.log('  + exists: '+username);}
  return u.id;
}
function ins(uid,t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*3000+2000),Math.floor(Math.random()*1000+400),Math.floor(Math.random()*150+60),id);
  console.log('  + '+t);return id;
}

// =====================================================
//  Nujabes (瀬葉淳 / Jun Seba)
// =====================================================
console.log('  Nujabes...\n');
const nuId = getUser('nujabes@music.square','Nujabes','luvsic','Jun Seba / Nujabes (1974–2010) — the father of lofi hip hop, Samurai Champloo soundtrack 🎧🌸');

ins(nuId,'Luv(sic) pt.1','Shing02 flows over a dusty piano loop. The beginning of the hexalogy.',92,'C','minor',mkLofi('piano',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,45,43,48],null,0.4,0.2),6.5,'#8E44AD');

ins(nuId,'Luv(sic) pt.2','Acoustics — the second chapter. A guitar loop that feels like a summer afternoon.',88,'A','minor',mkLofi('guitar',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[45,43,41,45],null,0.35,0.2),5.5,'#3498DB');

ins(nuId,'Luv(sic) pt.3','The most beloved chapter. Nujabes at his peak — a beat that breathes.',90,'C','minor',mkLofi('piano',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[48,45,43,48],null,0.35,0.15),6.0,'#E74C3C');

ins(nuId,'Aruarian Dance','The Samurai Champloo interlude. The loop that made a generation fall in love with jazz hop.',86,'C','minor',mkMP('piano',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.4,0.25,3.0),7.0,'#2ECC71');

ins(nuId,'Battlecry (Samurai Champloo OP)','Shing02 opens Samurai Champloo. Sharp like the edge of a samurai sword.',98,'D','minor',mkLofi('synth',dor(62,[0,3,4,6,4,3,0,3,4,6,7,6,4,3,0,3]),[38,40,42,38],null,0.25,0.1),4.0,'#C0392B');

ins(nuId,'Feather (feat. Cise Starr & Akin)','Modal Soul opening track. Light as a feather — drums, piano, and pure flow.',88,'C','minor',mkLofi('piano',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,45,43,48],null,0.3,0.15),5.5,'#F5B041');

ins(nuId,'Counting Stars','Samurai Champloo outro. Stars falling over Edo — the most peaceful beat in anime.',76,'G','major',mkMP('piano',chn(55,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.5,0.3,3.0),7.0,'#85C1E9');

ins(nuId,'Reflection Eternal','The piano riff that never gets old. Modal Soul at its most introspective.',84,'E','minor',mkLofi('piano',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[40,42,44,40],null,0.4,0.2),6.0,'#D2B4DE');

ins(nuId,'Lady Brown (feat. Cise Starr)','A love letter on wax. Warm guitar chops and the smoothest kick-snare pattern.',90,'C','major',mkLofi('guitar',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[48,45,43,48],null,0.35,0.2),5.5,'#A0522D');

ins(nuId,'Spiritual State (feat. Uyama Hiroto)','The posthumous title track. Nujabes final message — peace beyond the beat.',72,'C','major',mkMP('piano',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.35,3.5),8.0,'#F5F5F5');

// =====================================================
//  J Dilla (Jay Dee)
// =====================================================
console.log('\n  J Dilla...\n');
const jdId = getUser('jdilla@music.square','J Dilla','donuts','James Yancey / J Dilla (1974–2006) — the greatest hip hop producer of all time 🍩🎛️');

ins(jdId,'Dont Cry','The Donuts opener. A vocal chop that feels like a hug from beyond.',86,'C','major',mkLofi('synth',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[48,45,43,48],null,0.35,0.2),5.0,'#F39C12');

ins(jdId,'Life','The beat that sounds like it was made at 3 AM. Drunk drums and soaring strings.',92,'D','minor',mkMP('violin',dor(62,[0,3,4,6,7,9,10,7,6,4,3,0,2,3,4,6]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],0.3,0.15,2.5),5.5,'#E74C3C');

ins(jdId,'Wont Do','The Slum Village classic. Synth bass and the swing only Dilla could program.',94,'C','minor',mkLofi('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[48,45,43,48],null,0.25,0.15),4.5,'#1B1B1B');

ins(jdId,'Last Donut of the Night','The Donuts closer. The sample loops as if it doesnt want to end — just like Dilla.',72,'A','minor',mkMP('piano',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.5,0.35,3.0),7.0,'#6C3483');

ins(jdId,'So Far to Go (feat. Common & DAngelo)','The Shining masterpiece. DAngelo on the hook, Dilla on the SP-303.',88,'D','minor',mkLofi('piano',dor(62,[0,3,4,6,7,6,4,3,0,3,4,6,7,9,7,6]),[38,40,42,38],null,0.35,0.2),5.5,'#2980B9');

ins(jdId,'Time: The Donut of the Heart','The beat that stops time. A 1.5-minute loop that says everything.',84,'C','minor',mkLofi('synth',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,45,43,48],null,0.3,0.2),4.5,'#E91E63');

// =====================================================
//  Uyama Hiroto
// =====================================================
console.log('\n  Uyama Hiroto...\n');
const uhId = getUser('uyama@music.square','Uyama Hiroto','freedom','Uyama Hiroto — Nujabes protege, spiritual successor of the jazz hop sound 🎷✨');

ins(uhId,'81 Summer','Saxophone over a sunset beat. The sound of youth and endless August afternoons.',84,'D','major',mkMP('sax',[62,66,69,74,73,69,66,62,64,66,69,74,73,69,66,64],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.4,0.25,2.5),6.0,'#F1C40F');

ins(uhId,'Waltz for Life Will Born','The beat that feels like it was composed for a Miyazaki film. Piano and flute waltz.',72,'G','major',mkMP('piano',[55,59,62,67,66,62,59,55,57,59,62,67,66,62,59,57],[[43,47,50,55],[45,49,52,57],[47,50,55,59],[43,47,50,55]],0.5,0.3,3.0),7.0,'#82E0AA');

ins(uhId,'Vision Eyes (feat. Golden Boy)','The Freedom of the Son highlight. Rhodes piano and a beat that floats.',90,'C','minor',mkLofi('piano',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,45,43,48],null,0.35,0.2),5.5,'#8E44AD');

// =====================================================
//  DJ Okawari
// =====================================================
console.log('\n  DJ Okawari...\n');
const doId = getUser('okawari@music.square','DJ Okawari','flower','DJ Okawari — the sound of morning coffee and city lights 🌸☕');

ins(doId,'Flower Dance','Piano and strings in perfect conversation. The most beautiful instrumental hip hop track.',88,'C','major',mkMP('piano',[60,64,67,72,76,72,67,64,62,64,67,72,76,72,67,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.4,0.2,2.5),6.0,'#F5B7B1');

ins(doId,'Luv Letter','A love letter without words. Piano and violin — elegance in every bar.',80,'A','minor',mkMP('violin',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.45,0.3,3.0),7.0,'#E8DAEF');

// =====================================================
//  Fat Jon
// =====================================================
console.log('\n  Fat Jon...\n');
const fjId = getUser('fatjon@music.square','Fat Jon','samurai','Fat Jon the Ample Soul Physician — Samurai Champloo co-producer ✈️🎵');

ins(fjId,'How You Feel','Samurai Champloo outro. The beat that asks the question — and answers it too.',88,'C','minor',mkLofi('synth',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,45,43,48],null,0.3,0.15),5.0,'#2C3E50');

ins(fjId,'624 part 2','From Afterplatinum. A beat that feels like walking through the city at night.',90,'E','minor',mkLofi('piano',[64,67,71,76,74,71,67,64,67,71,76,79,76,71,67,64],[40,42,44,40],null,0.35,0.2),5.5,'#1B4F72');

// =====================================================
//  Summary
// =====================================================
const total = db.prepare('SELECT COUNT(*) AS cnt FROM compositions').get();
console.log('\n  Jazz Hop Classics imported!');
console.log('  Total DB tracks: '+total.cnt);
console.log('  Accounts: nujabes/luvsic | jdilla/donuts | uyama/freedom | okawari/flower | fatjon/samurai');
