const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🗡️🛡️ 正在导入塞尔达传说 OST 全集...\n');

const zeldaEmail = 'kondo@music.square';
let zeldaUser = db.prepare('SELECT * FROM users WHERE email = ?').get(zeldaEmail);

if (!zeldaUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('triforce', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '近藤浩治', zeldaEmail, hash,
    'Koji Kondo (1961–) — Nintendo 传奇作曲家，塞尔达与马力欧的音乐之父 🎮🎵');
  zeldaUser = db.prepare('SELECT * FROM users WHERE email = ?').get(zeldaEmail);
  console.log('  + 创建用户: 近藤浩治');
} else {
  console.log('  + 用户已存在: 近藤浩治');
}

const userId = zeldaUser.id;

function makeTrack(instrument, pitches, noteDuration = 0.5, gap = 0.25) {
  const notes = [];
  let start = 0;
  for (const p of pitches) {
    notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: noteDuration });
    start += noteDuration + gap;
  }
  return [{ instrument, notes }];
}

function makeChordTrack(instrument, chords, duration = 2.0) {
  const notes = [];
  let start = 0;
  for (const chord of chords) {
    for (const p of chord) {
      notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration });
    }
    start += duration + 0.5;
  }
  return [{ instrument, notes }];
}

function makeMelodyAndPad(melodyInst, melodyPitches, padChords, nd, gap, chordDur) {
  const melodyNotes = [];
  let start = 0;
  for (const p of melodyPitches) {
    melodyNotes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: nd });
    start += nd + gap;
  }
  const padNotes = [];
  let chordStart = 0;
  for (const chord of padChords) {
    for (const p of chord) {
      padNotes.push({ pitch: p, start: Math.round(chordStart * 100) / 100, duration: chordDur });
    }
    chordStart += chordDur + 0.5;
  }
  return [{ instrument: melodyInst, notes: melodyNotes }, { instrument: 'pad', notes: padNotes }];
}

function makeFullArrangement(melodyInst, pitches, pads, basses, nd, gap, chordDur) {
  const mt = { instrument: melodyInst, notes: [] };
  let start = 0;
  for (const p of pitches) { mt.notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: nd }); start += nd + gap; }
  const pt = { instrument: 'pad', notes: [] };
  let cs = 0;
  for (const ch of pads) { for (const p of ch) { pt.notes.push({ pitch: p, start: Math.round(cs * 100) / 100, duration: chordDur }); } cs += chordDur + 0.5; }
  const bt = { instrument: 'bass', notes: [] };
  let bs = 0;
  for (const p of basses) { bt.notes.push({ pitch: p, start: Math.round(bs * 100) / 100, duration: chordDur + 0.5 }); bs += chordDur + 0.5; }
  return [mt, pt, bt];
}

function chnScale(root, steps) {
  const pent = [0, 2, 4, 7, 9];
  return steps.map(s => root + pent[s % 5] + (Math.floor(s / 5) * 12));
}

function dorianScale(root, steps) {
  const d = [0, 2, 3, 5, 7, 9, 10];
  return steps.map(s => root + d[s % 7] + (Math.floor(s / 7) * 12));
}

function phrygianScale(root, steps) {
  const p = [0, 1, 3, 5, 7, 8, 10];
  return steps.map(s => root + p[s % 7] + (Math.floor(s / 7) * 12));
}

function dedupInsert(title, desc, bpm, keySig, scale, tracks, ds, color) {
  const ex = db.prepare('SELECT id FROM compositions WHERE title=? AND user_id=?').get(title, userId);
  if (ex) { console.log('  ~ ja existe: '+title); return ex.id; }
  const id = uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)').run(id, userId, title, desc, bpm, keySig, scale, JSON.stringify(tracks), ds, color);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*2000+1000),Math.floor(Math.random()*600+150),Math.floor(Math.random()*80+30),id);
  console.log('  + '+title);
  return id;
}

// =====================================================
//  NES / SNES Era
// =====================================================
console.log('  NES & SNES Era...\n');

dedupInsert('Zelda - Main Theme (Overworld)','The anthem that started it all. March across Hyrule Field.',120,'C','major',
  makeFullArrangement('piano',[72,76,79,76,72,76,79,84,79,76,72,79,76,72,71,72],[[48,52,55,60],[43,47,50,55],[45,48,52,57],[48,52,55,60]],[48,43,45,48],0.3,0.15,2.0),4.5,'#F1C40F');

dedupInsert('Zelda - Fairy Fountain','The healing springs where fairies dance. Pure respite.',72,'F','major',
  makeTrack('piano',chnScale(65,[0,4,7,4,2,0,4,7,4,2,0,7,5,4,2,0]),0.35,0.2),4.0,'#E8DAEF');

dedupInsert('A Link to the Past - Hyrule Castle','Approaching the castle under storm clouds. Cinematic SNES fanfare.',108,'C','major',
  makeChordTrack('orchestra',[[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]],1.5),5.0,'#8E44AD');

dedupInsert('A Link to the Past - Dark World','The twisted mirror of Hyrule. Same melody, darker soul.',120,'C','minor',
  makeTrack('piano',dorianScale(60,[0,3,4,3,0,3,4,6,4,3,0,1,3,4,2,0]),0.3,0.15),3.5,'#4A235A');

dedupInsert('A Link to the Past - Kakariko Village','Peace in the shadow of Death Mountain. Coming home.',100,'G','major',
  makeMelodyAndPad('piano',chnScale(67,[0,2,4,2,0,4,2,0,7,5,4,2,0,2,4,0]),[[43,47,50,55],[45,48,52,57],[43,47,50,55],[48,52,55,60]],0.35,0.2,2.0),4.0,'#27AE60');

// =====================================================
//  Ocarina of Time
// =====================================================
console.log('\n  Ocarina of Time...\n');

dedupInsert('Ocarina of Time - Zelda\'s Lullaby','The princess\'s theme, seven notes that define a franchise.',72,'C','major',
  makeTrack('piano',[72,76,79,84,79,76,72,76,79,84,79,76,77,79,84,88],0.45,0.25),5.0,'#9B59B6');

dedupInsert('Ocarina of Time - Gerudo Valley','Flamenco guitar across the desert canyon. Dangerous, seductive.',126,'F#','minor',
  makeMelodyAndPad('guitar',phrygianScale(66,[0,2,3,2,0,3,5,6,5,3,2,0,2,3,5,3]),[[42,45,49,54],[44,47,51,56],[42,45,49,54],[40,43,47,52]],0.25,0.1,1.5),3.5,'#D35400');

dedupInsert('Ocarina of Time - Song of Storms','Play it to make it rain, play it to make it stop.',100,'D','minor',
  makeTrack('piano',[62,65,69,74,72,69,65,62,65,69,74,72,69,65,62,65,69,74],0.25,0.15),3.0,'#2980B9');

dedupInsert('Ocarina of Time - Saria\'s Song','The childhood friend who never forgot. Bridge between Kokiri and Sacred Realm.',88,'C','major',
  makeMelodyAndPad('piano',[72,76,72,76,79,76,72,71,72,76,72,76,79,76,72,71],[[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]],0.35,0.2,2.0),4.0,'#2ECC71');

dedupInsert('Ocarina of Time - Lost Woods','Follow the music through the maze. Disorienting looping forest.',120,'F','major',
  makeTrack('piano',chnScale(65,[0,2,4,2,0,4,2,0,4,7,5,4,2,0,2,0]),0.25,0.15),3.0,'#82E0AA');

dedupInsert('Ocarina of Time - Epona\'s Song','Call your horse from anywhere in Hyrule. A lullaby for dusk.',66,'C','major',
  makeTrack('piano',[72,76,79,84,79,76,72,76,79,84,79,76,72,72,72,72],0.5,0.3),5.5,'#F5CBA7');

dedupInsert('Ocarina of Time - Hyrule Field Morning','Link steps into the vastness of Hyrule Field. The main theme reborn in 3D.',110,'C','major',
  makeChordTrack('orchestra',[[48,52,55,60,64],[45,48,52,57,62],[43,47,50,55,60],[48,52,55,60,64]],2.0),5.5,'#F1C40F');

dedupInsert('Ocarina of Time - Temple of Time','The sacred chamber where the Master Sword waits. Seven years frozen in stone.',52,'D','major',
  makeTrack('voice',[62,69,74,69,62,69,74,78,74,69,66,62,59,62,66,69],0.8,0.5),7.0,'#F5F5F5');

// =====================================================
//  Majoras Mask
// =====================================================
console.log('\n  Majora\'s Mask...\n');

dedupInsert('Majoras Mask - Clock Town Day 1','72 hours to save the world. Cheerful bustle masking the falling moon.',104,'C','major',
  makeTrack('piano',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,4,2,0,2,4,5]),0.25,0.15),3.5,'#E67E22');

dedupInsert('Majoras Mask - Song of Healing','The saddest and most beautiful melody in Zelda. Sooth troubled souls.',56,'C','minor',
  makeTrack('piano',[72,71,72,74,71,72,69,67,72,71,72,74,71,72,69,67],0.55,0.35),6.0,'#6C3483');

dedupInsert('Majoras Mask - Oath to Order','Summon the four giants to catch the moon. The last hope of Termina.',60,'E','minor',
  makeChordTrack('orchestra',[[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]],3.0),7.0,'#1B4F72');

dedupInsert('Majoras Mask - Astral Observatory','The old astronomer at his telescope. A moment of wonder before the nightmare.',72,'G','major',
  makeMelodyAndPad('piano',[67,71,74,78,74,71,67,64,67,71,74,78,74,71,67,64],[[43,47,50,55],[45,48,52,57],[43,47,50,55],[48,52,55,60]],0.4,0.25,2.0),5.0,'#85C1E9');

// =====================================================
//  The Wind Waker
// =====================================================
console.log('\n  The Wind Waker...\n');

dedupInsert('Wind Waker - Dragon Roost Island','Valoo the dragon atop the volcanic spire. Pan-flute and Latin heat.',120,'D','minor',
  makeMelodyAndPad('flute',dorianScale(62,[0,3,4,6,4,3,0,3,4,6,7,6,4,3,0,3]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[40,43,47,52]],0.25,0.1,1.5),3.0,'#E74C3C');

dedupInsert('Wind Waker - The Great Sea','Unfurl the sail. The overworld theme reborn as Celtic seafaring anthem.',108,'C','major',
  makeChordTrack('orchestra',[[48,52,55,60,64],[45,48,52,57,62],[43,47,50,55,60],[48,52,55,60,64]],2.0),5.0,'#3498DB');

dedupInsert('Wind Waker - Outset Island','Link\'s birthday on a tiny island under endless sky. Childhood distilled.',96,'F','major',
  makeMelodyAndPad('guitar',chnScale(65,[0,2,4,5,7,5,4,2,0,2,4,5,4,2,0,2]),[[41,45,48,53],[43,46,50,55],[45,48,53,57],[41,45,48,53]],0.3,0.2,2.0),4.0,'#2ECC71');

dedupInsert('Wind Waker - Molgera Battle','Sand worm rising from the desert temple. Frantic hypnotic percussion.',140,'E','minor',
  makeTrack('orchestra',[64,64,67,64,64,67,71,71,69,67,64,62,60,64,67,69],0.15,0.1),2.0,'#C0392B');

// =====================================================
//  Twilight Princess
// =====================================================
console.log('\n  Twilight Princess...\n');

dedupInsert('Twilight Princess - Midna\'s Lament','Midna dying on Link\'s back as the rain pours. The most devastating piano solo.',56,'D','minor',
  makeTrack('piano',[62,65,69,74,72,69,65,62,60,62,65,69,72,69,65,62],0.6,0.4),6.5,'#4A4A4A');

dedupInsert('Twilight Princess - Hyrule Field Twilight','Darkened Hyrule Field where twilight beasts prowl. The main theme in minor-key dread.',100,'D','minor',
  makeChordTrack('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],2.5),5.5,'#1C2833');

dedupInsert('Twilight Princess - Ordon Village','Link\'s quiet ranch life before the twilight. Pastoral guitar peace.',84,'C','major',
  makeMelodyAndPad('guitar',[60,64,67,72,71,67,64,60,60,64,67,72,71,67,64,62],[[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]],0.35,0.2,2.0),4.5,'#27AE60');

// =====================================================
//  Skyward Sword
// =====================================================
console.log('\n  Skyward Sword...\n');

dedupInsert('Skyward Sword - Ballad of the Goddess','Zelda\'s theme reversed — literally. The origin story encoded in music.',72,'C','major',
  makeChordTrack('orchestra',[[48,52,55,60,64],[45,48,52,57,62],[43,47,50,55,60],[48,52,55,60,64]],2.5),6.0,'#F7DC6F');

dedupInsert('Skyward Sword - Fi\'s Theme','The sword spirit\'s gentle humming. Piano and harp — a guardian made of code.',60,'G','major',
  makeTrack('piano',[67,74,71,67,62,67,71,74,78,74,71,67,64,67,71,67],0.5,0.3),5.5,'#D2B4DE');

// =====================================================
//  Breath of the Wild
// =====================================================
console.log('\n  Breath of the Wild...\n');

dedupInsert('Breath of the Wild - Main Theme','Link emerges from the Shrine of Resurrection. A Hyrule reclaimed by wilderness.',60,'C','minor',
  makeTrack('piano',[60,63,67,72,71,67,63,60,63,67,72,75,72,67,63,60],0.6,0.4),5.5,'#E8DAEF');

dedupInsert('Breath of the Wild - Hateno Village','Peaceful seaside village. Accordion and clarinet — the sound of a quiet life.',92,'C','major',
  makeMelodyAndPad('clarinet',[60,64,67,72,71,67,64,60,62,64,67,72,71,67,64,62],[[48,52,55,60],[45,49,52,57],[43,47,50,55],[48,52,55,60]],0.3,0.2,2.0),4.5,'#A9DFBF');

dedupInsert('Breath of the Wild - Rito Village','Dragon Roost matured into soaring strings above the Hebra snowfields.',112,'D','minor',
  makeMelodyAndPad('violin',dorianScale(62,[0,3,4,6,4,3,0,3,4,6,7,6,4,3,0,3]),[[38,41,45,50],[40,43,47,52],[42,45,50,53],[40,43,47,52]],0.3,0.15,2.0),4.0,'#5DADE2');

dedupInsert('Breath of the Wild - Kass\'s Theme','The wandering Rito accordionist. Every verse tells a Champion\'s story.',76,'A','major',
  makeMelodyAndPad('accordion',chnScale(57,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),[[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]],0.4,0.25,2.0),5.0,'#F5B041');

dedupInsert('Breath of the Wild - Hyrule Castle Exterior','Calamity-wracked castle. Zelda\'s Lullaby and main theme in nightmare minor key.',80,'C','minor',
  makeChordTrack('orchestra',[[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]],2.5),6.0,'#7B241C');

dedupInsert('Breath of the Wild - Mipha\'s Theme','The Zora Champion\'s grace. Piano elegy for the one who healed even in death.',52,'E','major',
  makeTrack('piano',[64,68,71,76,75,71,68,64,66,68,71,76,75,71,68,66],0.65,0.4),6.5,'#85C1E9');

// =====================================================
//  Tears of the Kingdom
// =====================================================
console.log('\n  Tears of the Kingdom...\n');

dedupInsert('Tears of the Kingdom - Main Theme','Link dives from sky islands. BOTW theme inverted and expanded.',68,'C','minor',
  makeTrack('sax',[60,63,67,72,75,72,67,63,65,67,72,75,79,75,72,67],0.5,0.3),5.5,'#1ABC9C');

dedupInsert('Tears of the Kingdom - Colgera Battle','Soaring through the storm chasing the Scourge of the Wind Temple. Drumline thunder, blaring brass.',140,'D','minor',
  makeChordTrack('orchestra',[[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]],1.5),4.0,'#E74C3C');

dedupInsert('Tears of the Kingdom - Lookout Landing','Hub of Hyrule\'s resistance. Determination amid ruins.',94,'C','major',
  makeChordTrack('orchestra',[[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]],2.0),4.5,'#D35400');

// =====================================================
//  Bonus
// =====================================================
console.log('\n  Bonus Tracks...\n');

dedupInsert('Zelda - Great Fairy Fountain Orchestral','25th Anniversary Symphony arrangement. Harp glissandos, sweeping strings.',64,'F','major',
  makeChordTrack('orchestra',[[41,45,48,53],[43,47,50,55],[45,48,53,57],[41,45,48,53]],3.0),7.5,'#E8DAEF');

dedupInsert('Zelda - Dark Beast Ganon Calamity Phase','Final battle across Hyrule Field. Every series theme collides as Link faces the Calamity.',96,'C','minor',
  makeChordTrack('orchestra',[[48,51,55,60],[45,48,52,57],[42,46,50,54],[48,51,55,60]],2.0),5.0,'#1B1B1B');

// =====================================================
//  Summary
// =====================================================
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(userId);
console.log('\n  Zelda OST complete!');
console.log('  Total: '+cnt.cnt);
console.log('  Account: kondo@music.square / triforce');
console.log('  API: http://localhost:3000/api/compositions?userId='+userId);
