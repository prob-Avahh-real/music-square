const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎻🌟 正在导入华人演奏家演出现场作品全集...\n');

function makeTrack(inst, pitches, nd = 0.5, gap = 0.25) {
  const notes = [];
  let start = 0;
  for (const p of pitches) {
    notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: nd });
    start += nd + gap;
  }
  return [{ instrument: inst, notes }];
}

function makeChordTrack(inst, chords, dur = 2.0) {
  const notes = [];
  let start = 0;
  for (const ch of chords) {
    for (const p of ch) {
      notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: dur });
    }
    start += dur + 0.5;
  }
  return [{ instrument: inst, notes }];
}

function diatonic(root, steps) {
  const major = [0, 2, 4, 5, 7, 9, 11];
  return steps.map(s => root + major[s % 7] + (Math.floor(s / 7) * 12));
}

function ensureUser(email, username, bio, password) {
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
      .run(id, username, email, hash, bio);
    console.log('  ✓ 创建用户: ' + username);
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }
  return user;
}

let totalNew = 0;

function insertWorks(userId, works) {
  for (const w of works) {
    const existing = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(w[0], userId);
    if (existing) {
      console.log('  ∼ 已存在，跳过: ' + w[0]);
      continue;
    }
    const id = uuidv4();
    db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(id, userId, w[0], w[1], w[2], w[3], 'major', JSON.stringify(w[4]), w[5], w[6]);
    db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?')
      .run(Math.floor(Math.random()*800+300), Math.floor(Math.random()*200+50), Math.floor(Math.random()*25+5), id);
    console.log('  ✓ ' + w[0]);
    totalNew++;
  }
}

// 1. 匡俊宏 — 古典吉他
const kuang = ensureUser('kuangjunhong@music.square', '匡俊宏',
  'Kuang Junhong (1999–) — 中国古典吉他天才，国际大赛最年轻获奖者 🎸🌟', 'guitarprodigy');
insertWorks(kuang.id, [
  ['Recuerdos de la Alhambra — Tarrega (阿尔罕布拉宫的回忆)',
   '轮指技巧的巅峰之作。匡俊宏的演绎如水银泻地，每个音符都是格拉纳达的叹息。🏰🎸',
   80, 'A', makeTrack('classical guitar', diatonic(69,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]), 0.3, 0.15), 4.0, '#D4AC0D'],
  ['Asturias (Leyenda) — Albeniz (阿斯图里亚斯传奇)',
   '西班牙吉他文献中最具冲击力的作品。匡俊宏的速度与颗粒感令人窒息。⚡🎸',
   132, 'E', makeTrack('classical guitar', diatonic(64,[0,2,3,5,7,8,7,5,3,2,0,2,3,5,7,5]), 0.2, 0.1), 3.5, '#C0392B'],
  ['Concierto de Aranjuez — Adagio — Rodrigo (阿兰胡埃斯协奏曲)',
   '吉他协奏曲之王。第二乐章是西班牙内战的泣血挽歌。💔🎻',
   56, 'B', makeTrack('classical guitar', diatonic(59,[0,2,1,3,5,7,5,3,1,2,4,2,1,0,2,4,2]), 0.6, 0.4), 7.0, '#1A237E'],
  ['Capricho Arabe — Tarrega (阿拉伯风格绮想曲)',
   '摩尔人在西班牙留下的音乐记忆。小夜曲般的温柔与异域风情。🌙🎸',
   66, 'D', makeTrack('classical guitar', diatonic(62,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5]), 0.4, 0.25), 5.0, '#8E44AD'],
  ['Un Sueno en la Floresta — Barrios (森林之梦)',
   '巴拉圭吉他大师巴里奥斯的杰作。20品超高把位颤音如林间鸟鸣。🌳🐦',
   72, 'G', makeTrack('classical guitar', diatonic(67,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,5]), 0.35, 0.2), 4.5, '#27AE60'],
]);

// 2. 陆逸轩 (Eric Lu) — 钢琴
const lu = ensureUser('ericlu@music.square', '陆逸轩',
  'Eric Lu / Lu Yixuan (1997–) — 利兹国际钢琴大赛冠军，华纳古典签约艺术家 🎹🏆', 'leedsgold');
insertWorks(lu.id, [
  ['Ballade No.4 in F minor — Chopin (第四叙事曲)',
   '肖邦叙事曲的巅峰。陆逸轩2018利兹比赛演奏，被誉为"肖邦再世"。🎹🌊',
   66, 'F', makeTrack('piano', diatonic(53,[0,2,1,3,5,7,8,7,5,3,2,0,2,4,5,7,9,7,5,4,2]), 0.4, 0.25), 7.0, '#4A235A'],
  ['Piano Sonata No.2 in Bb minor — Chopin (第二钢琴奏鸣曲)',
   '《葬礼进行曲》的出处。陆逸轩的慢乐章沉静如深渊。⚰️🎹',
   72, 'Bb', makeChordTrack('piano', [[58,62,65,70],[56,60,63,68],[53,57,60,65],[58,62,65,70]], 2.5), 8.0, '#1C1C2E'],
  ['Piano Sonata D.960 — Schubert (第21钢琴奏鸣曲)',
   '舒伯特最后一首奏鸣曲。陆逸轩Warner录音室版的冥想与升华。☁️✨',
   54, 'Bb', makeChordTrack('piano', [[58,62,65,70],[56,60,63,68],[53,57,60,65],[51,55,58,63]], 3.0), 10.0, '#D4E6F1'],
  ['24 Preludes — Chopin (24首前奏曲选)',
   '陆逸轩Warner录音室全集。每首都是微观宇宙。🌌🎹',
   88, 'C', makeTrack('piano', diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.3, 0.15), 5.5, '#2C3E50'],
  ['Variations on a Theme of Handel — Brahms (亨德尔主题变奏曲)',
   '勃拉姆斯最辉煌的钢琴独奏作品。陆逸轩的技巧与结构感在此尽显。🏛️🎹',
   96, 'Bb', makeTrack('piano', diatonic(58,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5,4,2]), 0.25, 0.15), 6.5, '#7B241C'],
]);

// 3. 李映衡 (Christian Li) — 小提琴
const cli = ensureUser('christianli@music.square', '李映衡',
  'Christian Li / Li Yingheng (2007–) — 梅纽因大赛最年轻冠军，Decca Classics签约 🎻🌟', 'menuhin');
insertWorks(cli.id, [
  ['The Four Seasons — Summer Presto — Vivaldi (四季·夏·急板)',
   '暴风雨般的急板。李映衡10岁梅纽因比赛演奏，技术之成熟震惊四座。⛈️🎻',
   144, 'G', makeTrack('violin', diatonic(67,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.15, 0.08), 2.5, '#E74C3C'],
  ['Meditation from Thais — Massenet (泰伊斯冥想曲)',
   '小提琴最柔美的旋律。李映衡Decca录音中丝绸般的音色。🙏🎻',
   54, 'D', makeTrack('violin', diatonic(74,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5]), 0.6, 0.35), 5.5, '#DDA0DD'],
  ['Introduction et Rondo Capriccioso — Saint-Saens (引子与回旋随想曲)',
   '西班牙风情的炫技名作。李映衡的快速音阶如流星划过。✨🎻',
   108, 'A', makeTrack('violin', diatonic(69,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,9,7,5]), 0.2, 0.1), 5.0, '#F39C12'],
  ['Violin Concerto in E minor — Mendelssohn (e小调小提琴协奏曲)',
   '四大小提琴协奏曲之一。李映衡15岁与交响乐团合作，青春与成熟并存。🌸🎻',
   92, 'E', makeTrack('violin', diatonic(64,[0,2,4,7,9,11,9,7,4,2,0,2,4,7,9,11,12,11,9]), 0.3, 0.15), 6.0, '#2980B9'],
  ['Czardas — Monti (查尔达什舞曲)',
   '匈牙利吉普赛风格的炫技小品。从深情慢板到疯狂快板的完美对比。💃🎻',
   120, 'D', makeTrack('violin', diatonic(62,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]), 0.2, 0.1), 4.0, '#8B0000'],
]);

console.log('\n📊 华人演奏家作品入库完成！新增作品: ' + totalNew);
const allUsers = db.prepare("SELECT u.username, COUNT(c.id) as cnt FROM users u LEFT JOIN compositions c ON u.id=c.user_id WHERE u.email LIKE '%@music.square' GROUP BY u.id ORDER BY cnt DESC").all();
allUsers.forEach(function(r) { console.log('  ' + r.username.padEnd(12) + ' → ' + String(r.cnt).padStart(3) + ' 首'); });
const tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('\n  📦 总计: ' + tt.t + ' 部作品');

process.exit(0);
