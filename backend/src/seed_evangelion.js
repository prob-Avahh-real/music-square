const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('💜🛐 Importando EVA OST...\n');

const evaEmail = 'sagisu@music.square';
let evaUser = db.prepare('SELECT * FROM users WHERE email = ?').get(evaEmail);

if (!evaUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('nerv2024', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)').run(id, '鷺巣詩郎', evaEmail, hash, 'Shiro Sagisu (1957–) — Evangelion composer, apocalyptic symphonies 🎻💜');
  evaUser = db.prepare('SELECT * FROM users WHERE email = ?').get(evaEmail);
  console.log('  + user: 鷺巣詩郎');
} else {
  console.log('  + exists: 鷺巣詩郎');
}
const userId = evaUser.id;

function mk(inst, pitches, nd, gap) {
  nd = nd || 0.5; gap = gap || 0.25;
  const notes = [];
  let s = 0;
  for (const p of pitches) { notes.push({pitch:p, start:Math.round(s*100)/100, duration:nd}); s+=nd+gap; }
  return [{instrument:inst, notes}];
}
function mkCh(inst, chords, dur) {
  dur = dur || 2.0;
  const notes = [];
  let s = 0;
  for (const ch of chords) { for (const p of ch) { notes.push({pitch:p, start:Math.round(s*100)/100, duration:dur}); } s+=dur+0.5; }
  return [{instrument:inst, notes}];
}
function mkMP(melInst, pitches, pads, nd, gap, cdur) {
  const mn=[];let s=0;
  for(const p of pitches){mn.push({pitch:p,start:Math.round(s*100)/100,duration:nd});s+=nd+gap;}
  const pn=[];let cs=0;
  for(const ch of pads){for(const p of ch){pn.push({pitch:p,start:Math.round(cs*100)/100,duration:cdur});}cs+=cdur+0.5;}
  return [{instrument:melInst,notes:mn},{instrument:'pad',notes:pn}];
}
function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function hm(r,st){const h=[0,2,3,5,7,8,11];return st.map(s=>r+h[s%7]+Math.floor(s/7)*12);}

function ins(title,desc,bpm,keySig,scale,tracks,ds,color){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(title,userId);
  if(ex){console.log('  ~ '+title);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,userId,title,desc,bpm,keySig,scale,JSON.stringify(tracks),ds,color);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2200+1200),Math.floor(Math.random()*700+200),Math.floor(Math.random()*100+40),id);
  console.log('  + '+title);
  return id;
}

console.log('  TV Series...');

ins('A Cruel Angels Thesis','The definitive anime opening. Become a legend, young boy.',128,'C','minor',mkMP('voice',[72,75,79,75,72,75,79,84,82,79,77,75,72,75,79,84],[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],0.25,0.1,2.0),3.5,'#8E44AD');

ins('Rei I','Ayanami theme — cold, distant, fragile. Piano alone in an empty apartment.',56,'C','minor',mk('piano',[60,63,67,72,72,71,67,63,60,63,67,72,75,72,67,63],0.6,0.4),6.0,'#AED6F1');

ins('Thanatos','Misatos kiss and the weight of adult loneliness.',80,'E','minor',mkMP('voice',[64,67,71,76,74,71,67,64,64,67,71,76,74,71,67,64],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.4,0.25,2.5),5.5,'#5B2C6F');

ins('Decisive Battle','Angels are coming. Urgent brass and snare drum.',140,'D','minor',mkCh('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),3.0,'#C0392B');

ins('Angel Attack','Sachiel emerges from the sea. Tokyo-3 goes to battle.',136,'C','minor',mkCh('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],1.5),3.0,'#7B241C');

ins('Misato','Playful jazz piano hiding the weight of Second Impact.',108,'F','major',mkMP('piano',chn(65,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[41,45,48,53],[43,46,50,55],[45,48,53,57],[41,45,48,53]],0.3,0.15,2.0),4.0,'#E74C3C');

ins('Borderline Case','Shinji trapped in the Dirac Sea. Floating in nothingness.',60,'C','minor',mk('synth',[60,60,63,60,58,60,63,67,63,60,58,56,58,60,63,60],0.5,0.35),5.5,'#1B1B1B');

ins('Fly Me to the Moon (EVA Ver.)','End credits waltz through space. Claire Littley above the ruins.',100,'C','major',mkMP('voice',[60,64,67,72,71,67,64,62,60,64,67,72,71,67,64,60],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.2,2.0),4.5,'#2C3E50');

ins('Hedgehogs Dilemma','Two souls trying to get close but hurting each other.',72,'A','minor',mkMP('guitar',hm(57,[0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.4,0.25,2.0),5.0,'#5D6D7E');

ins('NERV','Gendo Ikaris world — cold synths, military drums.',96,'C','minor',mkCh('synth',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],2.5),5.5,'#1C2833');

console.log('  End of Evangelion...');

ins('Komm susser Tod','Third Impact begins. Tumbling down, tumbling down.',112,'C','major',mkCh('orchestra',[[48,52,55,60,64],[43,47,50,55,59],[45,49,52,57,60],[48,52,55,60,64]],2.5),6.5,'#E91E63');

ins('Jesus bleibet meine Freude','Bach chorale as Asuka fights the MP Evas. Baroque meets body horror.',72,'G','major',mkCh('orchestra',[[43,47,50,55],[45,48,52,57],[47,50,55,59],[48,52,55,60]],3.0),7.0,'#C0392B');

ins('II Air','Asuka awakens inside Unit-02. Bach on full orchestra.',88,'D','major',mkCh('orchestra',[[50,54,57,62],[45,48,52,57],[42,46,50,54],[50,54,57,62]],2.0),5.0,'#F39C12');

ins('Expansion of Blockade','GeoFront collapses. Rei merges with Lilith. World unmade.',96,'C','minor',mkCh('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[36,39,43,48]],2.0),5.0,'#4A235A');

ins('Everything Youve Ever Dreamed','The alternate ending never used. Was any of this real?',80,'A','minor',mkMP('voice',[57,60,64,69,67,64,60,57,57,60,64,69,67,64,60,59],[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.4,0.25,2.5),5.5,'#2980B9');

console.log('  Rebuild Series...');

ins('Beautiful World','Evangelion 1.0 ending. Hikaru Utada — if only one wish could be granted.',112,'C','major',mkMP('voice',[60,64,67,72,71,67,64,62,60,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.15,2.0),4.5,'#3498DB');

ins('Give Me Wings','Evangelion 2.0 climax. Children singing as Zeruel descends — then Unit-01 awakens.',96,'D','major',mkCh('orchestra',[[50,54,57,62],[45,48,52,57],[42,46,50,54],[50,54,57,62]],2.5),5.5,'#E74C3C');

ins('Fate (Destiny)','Mari Makinamis battle theme. The wild card enters.',144,'E','minor',mk('guitar',hm(64,[0,2,3,2,0,3,5,7,5,3,2,0,2,3,5,7]),0.2,0.1),2.5,'#F39C12');

ins('Sakura Nagashi','Evangelion 3.0 ending. Everybody finds love in the end.',72,'A','major',mkMP('piano',[57,61,64,69,68,64,61,57,59,61,64,69,68,64,61,59],[[45,49,52,57],[43,47,50,55],[41,45,49,53],[45,49,52,57]],0.4,0.25,2.5),5.5,'#F5B7B1');

ins('Gods Message','Kaworu reveals the truth. The world was already dead.',56,'C','minor',mk('piano',[60,63,67,72,71,67,63,60,58,60,63,67,72,75,72,67],0.6,0.35),6.0,'#4A4A4A');

ins('The Ultimate Soldier','WILLE vs NERV air battle. Asuka and Mari synchronized descent.',150,'D','minor',mkCh('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.0),3.0,'#C0392B');

ins('One Last Kiss','Final ending. 25 years of Evangelion — goodbye.',98,'C','major',mkMP('voice',[60,64,67,72,71,67,64,62,60,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.2,2.0),4.5,'#E91E63');

ins('Voyager','Shinji says goodbye. A new world begins without Evas.',72,'C','major',mkCh('orchestra',[[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]],3.0),7.0,'#F1C40F');

ins('Paris','Mari and WILLE retake Paris. Jazz military march — the most fun battle in EVA.',130,'C','major',mkMP('sax',[60,64,67,72,71,67,64,60,62,64,67,72,74,72,71,67],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.25,0.1,1.5),3.0,'#E74C3C');

ins('Hand of Fate','Gendo and Shinji face each other. Father and son in the space between worlds.',64,'E','minor',mkMP('cello',[64,67,71,76,74,71,67,64,64,67,71,76,79,76,71,67],[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],0.5,0.3,2.5),6.0,'#1C2833');

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(userId);
console.log('\n  EVA OST: '+cnt.cnt+' tracks');
console.log('  Account: sagisu@music.square / nerv2024');
