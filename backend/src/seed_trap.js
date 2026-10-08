const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🔥💀 Importando Trap Classics...\n');

function getUser(email,username,pass,bio){
  let u=db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if(!u){const id=uuidv4();db.prepare('INSERT INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)').run(id,username,email,bcrypt.hashSync(pass,10),bio);u=db.prepare('SELECT * FROM users WHERE email=?').get(email);console.log('  + user: '+username);}
  else{console.log('  + exists: '+username);}
  return u.id;
}

function mk808(pitches,nd,g){
  const notes=[];let s=0;
  for(const x of pitches){
    notes.push({pitch:x,start:Math.round(s*100)/100,duration:nd});s+=nd+g;
  }
  return notes;
}

// Trap beat: 808 bass + hi-hats + melody
function mkTrap(melInst,melPitches,bass808,nd,gap,tempo){
  nd=nd||0.35;gap=gap||0.15;tempo=tempo||140;
  const half=60/tempo/4; // 16th note

  const melNotes=[];
  let ms=0;
  for(const x of melPitches){
    melNotes.push({pitch:x,start:Math.round(ms*100)/100,duration:nd});
    ms+=nd+gap;
  }

  const bassNotes=[];
  let bs=0;
  for(const x of bass808){
    bassNotes.push({pitch:x,start:Math.round(bs*100)/100,duration:0.8});
    bs+=1.0;
  }

  // Hi-hat rolls
  const hh=[];
  let hs=0;
  const steps=Math.ceil(Math.max(ms,bs)/0.25);
  for(let i=0;i<steps;i++){
    const vel=(i%4===0)?1:(i%4===2)?0.7:0.3;
    if(i%8===6||i%8===7){
      hh.push({pitch:42,start:Math.round(hs*100)/100,duration:0.1});
      hs+=0.125;
      hh.push({pitch:42,start:Math.round(hs*100)/100,duration:0.1});
      hs+=0.125;
      i++;
    } else {
      hh.push({pitch:42,start:Math.round(hs*100)/100,duration:0.15});
      hs+=0.25;
    }
  }

  // Snare
  const sn=[];
  let ss=0.5;
  for(let i=0;i<Math.ceil(Math.max(ms,bs)/1.0);i++){
    sn.push({pitch:38,start:Math.round(ss*100)/100,duration:0.2});
    ss+=1.0;
  }

  // Kick (included in 808 bass track)
  return [
    {instrument:melInst,notes:melNotes},
    {instrument:'synth',notes:bassNotes},
    {instrument:'drums',notes:[...hh,...sn]}
  ];
}

function ins(uid,t,desc,b,ks,sc,tr,ds,co){
  const ex=db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(t,uid);
  if(ex){console.log('  ~ '+t);return ex.id;}
  const id=uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id,uid,t,desc,b,ks,sc,JSON.stringify(tr),ds,co);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*3000+2500),Math.floor(Math.random()*900+400),Math.floor(Math.random()*150+60),id);
  console.log('  + '+t);return id;
}

function chn(r,st){const p=[0,2,4,7,9];return st.map(s=>r+p[s%5]+Math.floor(s/5)*12);}
function hm(r,st){const h=[0,2,3,5,7,8,11];return st.map(s=>r+h[s%7]+Math.floor(s/7)*12);}

// =====================================================
//  Metro Boomin
// =====================================================
console.log('  Metro Boomin...\n');
const mbId = getUser('metro@music.square','Metro Boomin','notallheroes','Leland Wayne / Metro Boomin (1993–) — the architect of modern trap, producer of the decade 🔥🎛️');

ins(mbId,'Mask Off','Future and Metro at their peak. The flute sample that became a cultural phenomenon. 🎭🎵',75,'D','minor',
  mkTrap('flute',[62,65,69,74,72,69,65,62,65,69,74,77,74,69,65,62],[38,38,40,38,35,38,40,42,38,38,40,38],0.3,0.15,140),5.0,'#8E44AD');

ins(mbId,'Jumpman','Drake and Future. The hook that launched a thousand memes — jumpman jumpman jumpman. 🏀💨',71,'C','minor',
  mkTrap('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[36,36,38,36,34,36,38,40],0.25,0.12,142),4.5,'#E74C3C');

ins(mbId,'Bad and Boujee','Migos and Metro. Rain drop, drop top — the beat that defined 2017. 💎🌧️',64,'C','minor',
  mkTrap('synth',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,48,50,48,45,48,50,52],0.35,0.2,127),5.5,'#F39C12');

ins(mbId,'Ric Flair Drip','Offset and Metro. Woo! The wrestling legend reborn as a trap anthem. 🤼💧',72,'A','minor',
  mkTrap('synth',[57,60,64,69,67,64,60,57,60,64,69,72,69,64,60,57],[45,45,47,45,43,45,47,48],0.3,0.15,140),5.0,'#C0392B');

ins(mbId,'Father Stretch My Hands Pt.1','Kanye and Metro. The choir sample drops and the world stops. 🙏🔥',67,'C','major',
  mkTrap('voice',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[48,48,50,48,45,48,50,52],0.4,0.25,135),5.5,'#F1C40F');

// =====================================================
//  Zaytoven
// =====================================================
console.log('\n  Zaytoven...\n');
const ztId = getUser('zaytoven@music.square','Zaytoven','beastmode','Xavier Dotson / Zaytoven (1980–) — the godfather of trap piano, church keys meets street beats 🎹🙏');

ins(ztId,'Versace','Migos and Zaytoven. The triplet flow that changed rap forever — Versace Versace Versace. 🏛️💎',68,'C','minor',
  mkTrap('piano',[60,63,67,72,75,72,67,63,60,63,67,72,75,72,67,63],[36,36,38,36,34,36,38,40],0.25,0.12,136),4.5,'#9B59B6');

ins(ztId,'I Serve the Base','Future and Zaytoven. The 808s hit so hard they distort — the sound of the trap. 💀🔊',75,'C','minor',
  mkTrap('synth',[60,63,67,72,71,67,63,60,60,63,67,72,71,67,63,60],[48,48,50,48,45,48,50,52],0.25,0.1,148),4.0,'#1B1B1B');

ins(ztId,'Peacoat','Future. Zay on the keys, Future on the mink — luxury trap at its finest. 🧥💰',69,'D','minor',
  mkTrap('piano',[62,65,69,74,72,69,65,62,65,69,74,77,74,69,65,62],[38,38,40,38,35,38,40,42],0.3,0.15,138),5.0,'#2C3E50');

// =====================================================
//  Mike WiLL Made-It
// =====================================================
console.log('\n  Mike WiLL Made-It...\n');
const mwId = getUser('mikewill@music.square','Mike WiLL Made-It','ear drummers','Michael Williams / Mike WiLL Made-It (1989–) — the hitmaker who turned whispers into anthems 🎧💥');

ins(mwId,'Black Beatles','Rae Sremmurd. The Mannequin Challenge anthem — that girl is a real crowd pleaser. 🖤🎸',73,'C','minor',
  mkTrap('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[36,36,38,36,34,36,38,40],0.3,0.15,146),5.0,'#1C2833');

ins(mwId,'Humble','Kendrick Lamar. Sit down, be humble — the piano sting that won a Pulitzer. 🎹👑',75,'C','minor',
  mkTrap('piano',[60,60,63,60,60,63,67,67,65,63,60,58,60,63,67,72],[48,48,50,48,45,48,50,52],0.25,0.1,148),4.5,'#C0392B');

ins(mwId,'No Type','Rae Sremmurd. The minimalist beat that proved less is more — I aint got no type. 🚫💔',70,'C','minor',
  mkTrap('synth',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[36,36,38,36,34,36,38,40],0.35,0.2,140),5.5,'#E74C3C');

// =====================================================
//  Lex Luger
// =====================================================
console.log('\n  Lex Luger...\n');
const llId = getUser('lexluger@music.square','Lex Luger','hardinthe','Lexus Lewis / Lex Luger (1991–) — the man who built the 2010s trap sound, Bricksquad architect 🧱🔨');

ins(llId,'Hard in da Paint','Waka Flocka Flame. The beat that tore down the wall between hip hop and pure aggression. 🎨💥',70,'C','minor',
  mkTrap('synth',[60,63,67,72,75,72,67,63,60,60,63,67,72,75,72,67],[48,48,50,48,45,48,50,52],0.2,0.08,140),3.5,'#C0392B');

ins(llId,'BMF (Blowin Money Fast)','Rick Ross. The luxury trap anthem — Lex Luger brass and Rozay boss talk. 💰🎺',68,'C','minor',
  mkTrap('synth',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[36,36,38,36,34,36,38,40],0.3,0.12,136),4.5,'#F39C12');

ins(llId,'Grove St. Party','Waka Flocka. The house party anthem — every day is a Grove Street Party. 🏠🎉',71,'C','minor',
  mkTrap('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[48,48,50,48,45,48,50,52],0.25,0.1,144),4.0,'#27AE60');

// =====================================================
//  Southside & 808 Mafia
// =====================================================
console.log('\n  Southside / 808 Mafia...\n');
const ssId = getUser('southside@music.square','Southside','808mafia','Joshua Luellen / Southside (1989–) — 808 Mafia founder, the dark lord of trap production 💀🔮');

ins(ssId,'Trap Queen','Fetty Wap. The love song that crossed over — 1738! I am like hey what is up hello. 👑💛',74,'C','major',
  mkTrap('synth',[60,64,67,72,71,67,64,60,64,67,72,76,72,67,64,60],[48,48,50,48,45,48,50,52],0.3,0.15,148),5.0,'#F1C40F');

ins(ssId,'March Madness','Future. The dark 808 anthem — Southside strings and Future pain. 🏀🌑',66,'C','minor',
  mkTrap('synth',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],[36,36,38,36,34,36,38,40],0.35,0.2,132),5.5,'#1B1B1B');

ins(ssId,'Digital Dash','Drake and Future. The What a Time opener — 808 Mafia tag in the beginning. 🏎️💨',70,'C','minor',
  mkTrap('synth',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],[48,48,50,48,45,48,50,52],0.3,0.15,140),5.0,'#2C3E50');

// =====================================================
//  Summary
// =====================================================
const total = db.prepare('SELECT COUNT(*) AS cnt FROM compositions').get();
console.log('\n  Trap Classics imported!');
console.log('  Total DB tracks: '+total.cnt);
console.log('  Accounts: metro/notallheroes | zaytoven/beastmode | mikewill/ear drummers | lexluger/hardinthe | southside/808mafia');
