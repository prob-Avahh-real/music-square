const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎻🌏 正在导入马友友演出现场表演音频全集...\n');

function makeTrack(inst, pitches, nd, gap) {
  nd = nd || 0.5; gap = gap || 0.25;
  var notes = [];
  var start = 0;
  for (var i = 0; i < pitches.length; i++) {
    notes.push({ pitch: pitches[i], start: Math.round(start * 100) / 100, duration: nd });
    start += nd + gap;
  }
  return [{ instrument: inst, notes: notes }];
}

function makeChordTrack(inst, chords, dur) {
  dur = dur || 2.0;
  var notes = [];
  var start = 0;
  for (var i = 0; i < chords.length; i++) {
    var ch = chords[i];
    for (var j = 0; j < ch.length; j++) {
      notes.push({ pitch: ch[j], start: Math.round(start * 100) / 100, duration: dur });
    }
    start += dur + 0.5;
  }
  return [{ instrument: inst, notes: notes }];
}

function diatonic(root, steps) {
  var major = [0, 2, 4, 5, 7, 9, 11];
  return steps.map(function(s) { return root + major[s % 7] + (Math.floor(s / 7) * 12); });
}

function chnScale(root, steps) {
  var pent = [0, 2, 4, 7, 9];
  return steps.map(function(s) { return root + pent[s % 5] + (Math.floor(s / 5) * 12); });
}

var email = 'yoyoma@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('bachcello', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '马友友', email, hash,
      'Yo-Yo Ma (1955–) — 18座格莱美奖，丝绸之路合奏团创始人，古典与世界的桥梁 🎻🌏');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 马友友');
} else {
  console.log('  ✓ 用户已存在: 马友友');
}

var uid = user.id;
var totalNew = 0;

function ins(title, desc, bpm, ks, tr, ds, color) {
  var ex = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(title, uid);
  if (ex) {
    console.log('  ∼ 已存在，跳过: ' + title);
    return ex.id;
  }
  var id = uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, uid, title, desc, bpm, ks, 'major', JSON.stringify(tr), ds, color);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?')
    .run(Math.floor(Math.random()*2000+800), Math.floor(Math.random()*500+150), Math.floor(Math.random()*60+20), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

ins('Cello Suite No.1 — Prelude — Bach (大无第一组曲·前奏曲)',
  '马友友最标志性的录音。巴赫无伴奏大提琴组曲，8岁在卡内基首演到60岁的6次录音。🎻✨',
  66, 'G',
  makeTrack('cello', diatonic(43,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.35, 0.2),
  4.5, '#8B4513');

ins('Cello Concerto in E minor — Elgar (埃尔加e小调大提琴协奏曲)',
  '一战后的哀歌。马友友与巴伦博伊姆/芝加哥交响的录音被视为标杆。💔🎻',
  56, 'E',
  makeChordTrack('orchestra', [[52,55,59,64],[50,53,57,62],[47,50,54,57],[52,56,59,64]], 3.5),
  8.0, '#1A237E');

ins('Cello Concerto in B minor — Dvorak (德沃夏克b小调大提琴协奏曲)',
  '大提琴协奏曲之王。马友友多次录制的核心曲目，美国乡愁与捷克灵魂的交融。🌾🎻',
  76, 'B',
  makeTrack('cello', diatonic(47,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,9,11,12]), 0.35, 0.2),
  7.0, '#2C3E50');

ins('The Swan — Saint-Saens (天鹅)',
  '《动物狂欢节》中最美的乐章。马友友的大提琴如天鹅划过湖面。🦢🎻',
  54, 'G',
  makeTrack('cello', diatonic(55,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5]), 0.6, 0.35),
  4.0, '#F5F5DC');

ins('Crouching Tiger Hidden Dragon — Tan Dun (卧虎藏龙)',
  '马友友与谭盾合作获奥斯卡最佳原创配乐。大提琴诉说李慕白与俞秀莲的隐忍之爱。⚔️🎻',
  60, 'C',
  makeTrack('cello', chnScale(48,[0,2,3,5,6,5,3,2,0,2,3,5,6,5,3,2,0]), 0.5, 0.35),
  5.5, '#006400');

ins('Libertango — Piazzolla (自由探戈)',
  '马友友《Soul of the Tango》专辑。皮亚佐拉的新探戈在大提琴上获得了第二生命。💃🎻',
  112, 'A',
  makeTrack('cello', diatonic(45,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.2, 0.15),
  4.0, '#C0392B');

ins('Appalachia Waltz (阿巴拉契亚华尔兹)',
  '马友友与Mark O\'Connor、Edgar Meyer合作。美国蓝草与大提琴的奇妙相遇。🌄🎻',
  76, 'D',
  makeTrack('cello', diatonic(50,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.4, 0.25),
  5.0, '#D2691E');

ins('Going Home — Dvorak (念故乡)',
  '马友友与Silk Road Ensemble。德沃夏克《自新大陆》慢乐章改编，大提琴与琵琶的对话。🏠🎻',
  52, 'Db',
  makeTrack('cello', diatonic(49,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.55, 0.35),
  5.5, '#B8860B');

console.log('\n📊 马友友作品入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   马友友总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
