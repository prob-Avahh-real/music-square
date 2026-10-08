const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎻🦋 正在导入吕思清演出作品全集...\n');

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

var email = 'lvsiqing@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('butterfly', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '吕思清', email, hash,
      'Lu Siqing (1969–) — 帕格尼尼大赛金奖，华人小提琴家的骄傲，《梁祝》最佳诠释者 🎻🦋');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 吕思清');
} else {
  console.log('  ✓ 用户已存在: 吕思清');
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
    .run(Math.floor(Math.random()*1000+400), Math.floor(Math.random()*250+60), Math.floor(Math.random()*35+10), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

ins('梁祝小提琴协奏曲 — 相爱 (Butterfly Lovers — Love Theme)',
  '吕思清最著名的录音。何占豪·陈钢作曲。草桥结拜，十八相送，全球销量破百万的《梁祝》版本。🦋🎻',
  72, 'G',
  makeTrack('violin', chnScale(79,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.4, 0.2),
  5.0, '#F1948A');

ins('梁祝小提琴协奏曲 — 化蝶 (Butterfly Lovers — Transformation)',
  '终乐章。彩虹万里，蝴蝶双飞。吕思清的揉弦让每个音符都在颤抖。🌈🦋',
  58, 'G',
  makeTrack('violin', chnScale(79,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.5, 0.3),
  5.5, '#9B59B6');

ins('Zigeunerweisen — Sarasate (流浪者之歌)',
  '吕思清在帕格尼尼大赛的参赛曲目。吉普赛人的悲歌与狂舞，技巧与情感的完美平衡。💃🎻',
  88, 'C',
  makeTrack('violin', diatonic(84,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.25, 0.1),
  6.0, '#C0392B');

ins('Meditation from Thais — Massenet (泰伊斯冥想曲)',
  '吕思清音色的极致展现。小提琴最柔美的旋律，每个音符都如丝绸般顺滑。🙏🎻',
  54, 'D',
  makeTrack('violin', diatonic(86,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.6, 0.35),
  5.0, '#DDA0DD');

ins('Violin Concerto in D — Tchaikovsky (柴可夫斯基小提琴协奏曲)',
  '四大协奏曲之首。吕思清与各大乐团合作的核心曲目。第三乐章如火箭升空。🚀🎻',
  112, 'D',
  makeTrack('violin', diatonic(86,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11,12]), 0.2, 0.1),
  6.5, '#2980B9');

ins('Introduction et Rondo Capriccioso — Saint-Saens (引子与回旋随想曲)',
  '吕思清现场最受欢迎的安可曲之一。西班牙风情的炫技名作。✨🎻',
  108, 'A',
  makeTrack('violin', diatonic(93,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.2, 0.1),
  5.5, '#F39C12');

ins('思乡曲 — 马思聪 (Nostalgia — Ma Sicong)',
  '马思聪《内蒙组曲》第二乐章。吕思清演奏中国小提琴作品的范本。🌙🎻',
  66, 'C',
  makeTrack('violin', chnScale(72,[0,2,3,5,6,5,3,2,0,2,3,5,6,5,3,2,0]), 0.45, 0.25),
  4.5, '#2C3E50');

console.log('\n📊 吕思清作品入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   吕思清总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
