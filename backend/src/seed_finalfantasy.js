const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎌⚔️ Importando Final Fantasy OST...\n');

const ffEmail = 'uematsu@music.square';
let ffUser = db.prepare('SELECT * FROM users WHERE email = ?').get(ffEmail);
if (!ffUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'植松伸夫',ffEmail,bcrypt.hashSync('chocobo',10),'Nobuo Uematsu (1959–) — Final Fantasy music legend, the Beethoven of game music 🎹🎮');
  ffUser = db.prepare('SELECT * FROM users WHERE email = ?').get(ffEmail);
  console.log('  + user: 植松伸夫');
} else { console.log('  + exists: 植松伸夫'); }
const uid = ffUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}
function mkMP(mi,p,pa,nd,g,cd){const mn=[];let s=0;for(const x of p){mn.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}const pn=[];let cs=0;for(const ch of pa){for(const x of ch){pn.push({pitch:x,start:Math.round(cs*100)/100,duration:cd});}cs+=cd+0.5;}return[{instrument:mi,notes:mn},{instrument:'pad',notes:pn}];}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function ins(t,desc,b,ks,sc,tr,ds,co){const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);if(ex){console.log('  ~ '+t);return ex.id;}const id=uuidv4();db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2500+1500),Math.floor(Math.random()*800+300),Math.floor(Math.random()*120+50),id);console.log('  + '+t);return id;}

console.log('  FF Classics...');

ins('FF - Prelude (Crystal Theme)','The arpeggio that opens every Final Fantasy. Crystals singing the memory of light.',72,'C','major',mk('piano',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],0.35,0.2),4.0,'#3498DB');

ins('FF - Main Theme (Opening)','The march across the world map. Adventure stretching to every horizon.',88,'C','major',mkMP('piano',[60,64,67,72,76,72,67,64,60,64,67,72,76,72,67,64],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.15,2.0),4.5,'#F1C40F');

ins('FF - Chocobo Theme','The galloping song of everyones favorite yellow bird. Wark!',140,'C','major',mk('piano',chn(60,[0,2,4,2,0,4,2,0,2,4,5,4,2,0,2,0,4,5]),0.2,0.1),2.5,'#F39C12');

ins('FFI - Cornelia Castle','Where the adventure begins. Solemn brass and strings — four Warriors of Light.',72,'C','major',mkC('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],2.5),6.0,'#8E44AD');

ins('FFIV - Theme of Love','Cecil and Rosas theme. The first great love theme in gaming history.',60,'E','major',mkMP('violin',[64,68,71,76,75,71,68,64,66,68,71,76,75,71,68,66],[[40,44,47,52],[42,45,48,53],[44,47,51,56],[40,44,47,52]],0.5,0.3,2.5),6.0,'#E91E63');

ins('FFV - Clash on the Big Bridge','Gilgamesh charges in! The most epic battle-on-a-bridge theme ever.',160,'D','minor',mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),3.5,'#C0392B');

ins('FFVI - Terras Theme','A woman with no memory walks through the snow. The saddest 16-bit melody.',56,'C','minor',mk('piano',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],0.6,0.35),6.5,'#AED6F1');

ins('FFVI - Searching for Friends','Setzer pilots the Falcon through the World of Ruin. Hope after the apocalypse.',88,'C','major',mkMP('piano',chn(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.2,2.0),4.5,'#2ECC71');

ins('FFVI - Dancing Mad (4th Movement)','The final battle against Kefka ascending to godhood. Four movements of organ chaos.',140,'C','minor',mkC('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[36,39,43,48]],1.5),5.0,'#4A235A');

ins('FFVII - Aeriths Theme','The flower girl in the church. One piano melody that broke the world.',52,'D','major',mk('piano',[62,69,74,78,74,69,62,59,62,69,74,78,74,69,66,62],0.65,0.4),7.0,'#F5B7B1');

ins('FFVII - One-Winged Angel','Sephiroth descends. Latin chorus, industrial drums — Estuans interius ira vehementi.',132,'D','minor',mkC('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),4.0,'#1B1B1B');

ins('FFVII - Cosmo Canyon','Red XIIIs home under the stars. Tribal drums and acoustic guitar.',100,'D','major',mkMP('guitar',chn(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.3,0.15,2.0),4.0,'#E67E22');

ins('FFVIII - Liberi Fatali','The opening chorus. Fithos lusec wecos vinosec — a prophecy in an unknown tongue.',96,'C','minor',mkC('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],2.5),6.0,'#C0392B');

ins('FFVIII - Eyes On Me','Julia and Lagunas love song. Waltz beneath the stars at the Deling City hotel.',72,'C','major',mkMP('voice',[60,64,67,72,71,67,64,60,62,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.4,0.25,2.5),5.5,'#9B59B6');

ins('FFIX - Youre Not Alone','Zidane breaks down, and his friends refuse to leave him behind.',84,'C','major',mkMP('piano',[60,64,67,72,71,67,64,60,62,64,67,72,74,72,71,67],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.35,0.2,2.0),4.5,'#E67E22');

ins('FFIX - Melodies of Life','Garnet and Zidanes farewell. The song that closes the book on classic FF.',68,'D','major',mkMP('voice',[62,66,69,74,73,69,66,62,64,66,69,74,73,69,66,64],[[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]],0.45,0.25,2.5),5.5,'#F7DC6F');

ins('FFX - To Zanarkand','Tidus remembers a city that no longer exists. The saddest piano opening in gaming.',52,'E','minor',mk('piano',[64,67,71,76,79,76,71,67,64,67,71,76,79,76,71,67],0.65,0.4),7.0,'#2C3E50');

ins('FFX - Suteki Da Ne','Yuna and Tidus in Macalania Woods. The lake reflects a thousand stars.',60,'C','major',mkMP('violin',[60,64,67,72,71,67,64,60,62,64,67,72,74,72,71,67],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.5,0.3,2.5),6.0,'#85C1E9');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  FF OST: '+cnt.cnt+' tracks');
console.log('  Account: uematsu@music.square / chocobo');
