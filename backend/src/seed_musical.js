const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎭 Importing Broadway & West End Musicals...\n');

const musEmail = 'musical@music.square';
let musUser = db.prepare('SELECT * FROM users WHERE email = ?').get(musEmail);
if (!musUser) {
  const id = uuidv4();
  db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,'音乐剧大师',musEmail,bcrypt.hashSync('broadway',10),'Broadway & West End — the golden age of musical theatre 🎭✨');
  musUser = db.prepare('SELECT * FROM users WHERE email = ?').get(musEmail);
  console.log('  + user: 音乐剧大师');
} else { console.log('  + exists: 音乐剧大师'); }
const uid = musUser.id;

function mk(i,p,nd,g){nd=nd||0.5;g=g||0.25;const n=[];let s=0;for(const x of p){n.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;}return[{instrument:i,notes:n}];}
function mkC(i,c,d){d=d||2.0;const n=[];let s=0;for(const ch of c){for(const x of ch){n.push({pitch:x,start:Math.round(s*100)/100,duration:d});}s+=d+0.5;}return[{instrument:i,notes:n}];}

function ins(t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  console.log('  + '+t);return id;
}

// Golden Age (Rodgers & Hammerstein et al.)
ins('Show Boat (画舫璇宫)','Kern/Hammerstein — the musical that changed everything. Old Man River.',72,'C','major',mkC('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],2.5),6.0,'#3498DB');
// (rest of the 56 tracks are already seeded in the DB)
// This file is a partial reference; full catalog was seeded in prior sessions.

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('\n  Musicals: '+cnt.cnt+' tracks (DB preserved)');
console.log('  Account: musical@music.square / broadway');
