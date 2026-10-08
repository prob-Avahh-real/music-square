const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎻 正在导入海顿音乐全集...\n');

// ─── 1. 创建海顿用户（去重） ───
const haydnEmail = 'haydn@music.square';
let haydnUser = db.prepare('SELECT * FROM users WHERE email = ?').get(haydnEmail);

if (!haydnUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('symphony', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '海顿', haydnEmail, hash,
    'Joseph Haydn (1732–1809) — 交响乐之父与弦乐四重奏之父，古典主义的基石 🎻✨');
  haydnUser = db.prepare('SELECT * FROM users WHERE email = ?').get(haydnEmail);
  console.log('  ✓ 创建用户: 海顿');
} else {
  console.log('  ✓ 用户已存在: 海顿');
}

const userId = haydnUser.id;

// ─── 2. 辅助函数 ───
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

// Escala diatônica ocidental — tom maior natural
function diatonic(root, steps) {
  const major = [0, 2, 4, 5, 7, 9, 11];
  return steps.map(s => root + major[s % 7] + (Math.floor(s / 7) * 12));
}

function dedupInsert(title, description, bpm, keySig, scale, tracks, durationSecs, color) {
  const existing = db.prepare(
    'SELECT id FROM compositions WHERE title = ? AND user_id = ?'
  ).get(title, userId);

  if (existing) {
    console.log(`  ∼ 已存在，跳过: ${title}`);
    return existing.id;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO compositions (id, user_id, title, description, bpm, key_signature, scale, tracks, duration_secs, cover_color)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(id, userId, title, description, bpm, keySig, scale, JSON.stringify(tracks), durationSecs, color);

  db.prepare(
    'UPDATE compositions SET play_count = ?, like_count = ?, comment_count = ? WHERE id = ?'
  ).run(
    Math.floor(Math.random() * 500 + 200),
    Math.floor(Math.random() * 120 + 30),
    Math.floor(Math.random() * 18 + 3),
    id
  );

  console.log(`  ✓ ${title}`);
  return id;
}

// ─── 3. Obras-primas de Haydn ───

// ===== London Symphonies (Nos. 93–104) =====
dedupInsert(
  'Symphony No. 94 "Surprise" — Andante (惊愕交响曲)',
  '海顿最著名的交响曲。第二乐章中突如其来的强音和弦"惊醒"打瞌睡的听众。😲⚡',
  72, 'G', 'major',
  makeTrack('strings', diatonic(67, [0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 4, 5, 4, 2, 0]), 0.4, 0.3),
  6.0, '#F39C12'
);

dedupInsert(
  'Symphony No. 101 "Clock" — Andante (时钟交响曲)',
  '伦敦交响曲之一。第二乐章低音弦乐模拟钟摆的"滴答"节奏，精妙绝伦。⏰🎵',
  80, 'D', 'major',
  makeTrack('bassoon', diatonic(50, [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 4, 0, 2, 0]), 0.5, 0.3),
  7.0, '#2980B9'
);

dedupInsert(
  'Symphony No. 104 "London" — Finale (伦敦交响曲)',
  '海顿最后一部交响曲。终乐章以克罗地亚民歌为主题，欢腾而壮丽。🇬🇧🎺',
  132, 'D', 'major',
  makeTrack('orchestra', diatonic(74, [0, 2, 4, 2, 0, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2]), 0.2, 0.1),
  4.5, '#C0392B'
);

dedupInsert(
  'Symphony No. 100 "Military" — Allegretto (军队交响曲)',
  '第二乐章加入了土耳其军乐队的三角铁、钹和大鼓。战场上的进行曲。🥁🎖️',
  100, 'G', 'major',
  makeTrack('brass', diatonic(67, [0, 2, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 0, 2, 4, 2]), 0.3, 0.15),
  5.0, '#D35400'
);

dedupInsert(
  'Symphony No. 103 "Drumroll" — Introduction (擂鼓交响曲)',
  '以定音鼓独奏开场，是海顿最富戏剧性的交响曲引子之一。🥁⚡',
  60, 'Eb', 'major',
  makeChordTrack('orchestra', [[51, 55, 58, 63], [48, 52, 55, 60], [51, 55, 58, 63], [53, 56, 60, 65]], 2.5),
  8.0, '#1A5276'
);

// ===== Sturm und Drang Symphonies =====
dedupInsert(
  'Symphony No. 45 "Farewell" — Finale (告别交响曲)',
  '末乐章乐手逐一离席。这是海顿用音乐向雇主发出的"我们要休假"的信号。🕯️👋',
  72, 'F#', 'minor',
  makeTrack('strings', diatonic(66, [0, 2, 1, 0, 2, 1, 0, -1, 0, 2, 1, 0, -1, -3, -1, 0]), 0.5, 0.4),
  7.5, '#4A235A'
);

dedupInsert(
  'Symphony No. 44 "Trauer" — Allegro (哀伤交响曲)',
  '"狂飙突进"时期的杰作。海顿自称希望用此曲的慢乐章作为自己的葬礼音乐。⚰️🎻',
  108, 'E', 'minor',
  makeTrack('strings', diatonic(64, [0, 2, -1, 0, 2, 4, 2, 0, -1, 0, 2, 4, 5, 4, 2, 0]), 0.25, 0.15),
  5.5, '#17202A'
);

// ===== Paris Symphonies (Nos. 82–87) =====
dedupInsert(
  'Symphony No. 83 "La Poule" — Allegro (母鸡交响曲)',
  '巴黎交响曲之一。第一乐章中弦乐的装饰音模仿母鸡咯咯叫。🐔🎻',
  112, 'G', 'minor',
  makeTrack('strings', diatonic(55, [0, 2, 0, 2, 0, 2, 4, 2, 0, 2, 0, 2, 4, 5, 4, 2]), 0.25, 0.15),
  5.0, '#E67E22'
);

dedupInsert(
  'Symphony No. 85 "La Reine" — Romance (王后交响曲)',
  '玛丽·安托瓦内特最喜爱的交响曲。第二乐章浪漫曲优雅如凡尔赛宫廷。👑🌸',
  66, 'B', 'major',
  makeTrack('strings', diatonic(71, [0, 2, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 0, 2, 4, 2]), 0.5, 0.3),
  7.0, '#DDA0DD'
);

// ===== Oratorios =====
dedupInsert(
  'The Creation — "The Heavens Are Telling" (创世纪 — 诸天述说)',
  '受亨德尔《弥赛亚》启发而作的清唱剧巅峰。合唱"诸天述说神的荣耀"光芒万丈。🌌🎶',
  88, 'C', 'major',
  makeChordTrack('choir', [[48, 52, 55, 60], [50, 53, 57, 62], [52, 55, 59, 64], [48, 52, 55, 60, 67]], 2.5),
  8.0, '#F5F5DC'
);

dedupInsert(
  'The Creation — "The Representation of Chaos" (创世纪 — 混沌的呈现)',
  '海顿最大胆的和声实验。开篇用不协和音描绘创世之前的混沌虚空。🌑💫',
  44, 'C', 'minor',
  makeChordTrack('orchestra', [[48, 51, 55], [46, 50, 53], [44, 48, 51], [48, 51, 55, 60]], 4.0),
  9.0, '#1C2833'
);

dedupInsert(
  'The Seasons — "Spring" Chorus (四季 — 春天合唱)',
  '清唱剧《四季》的开场合唱。冰雪消融，万物复苏的欢庆场面。🌸🌱',
  104, 'G', 'major',
  makeTrack('choir', diatonic(67, [0, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9]), 0.3, 0.15),
  4.5, '#2ECC71'
);

// ===== Concertos =====
dedupInsert(
  'Cello Concerto No. 1 in C — Moderato (第一大提琴协奏曲)',
  '1961年在布拉格重新发现的海顿杰作。大提琴的歌唱性在此达到极致。🎻🎵',
  76, 'C', 'major',
  makeTrack('cello', diatonic(48, [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0, 2, 4, 5]), 0.4, 0.2),
  8.0, '#9B59B6'
);

dedupInsert(
  'Cello Concerto No. 2 in D — Allegro (第二大提琴协奏曲)',
  '海顿最后一部协奏曲。辉煌的技巧与优雅的古典风格完美平衡。🎻✨',
  112, 'D', 'major',
  makeTrack('cello', diatonic(50, [0, 2, 4, 2, 0, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9]), 0.3, 0.15),
  6.5, '#8E44AD'
);

dedupInsert(
  'Trumpet Concerto in Eb — Finale (小号协奏曲)',
  '为按键小号的发明者安东·魏丁格所作。辉煌的终乐章，小号独奏的华彩段落举世闻名。🎺🔥',
  120, 'Eb', 'major',
  makeTrack('trumpet', diatonic(63, [0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9]), 0.25, 0.1),
  4.5, '#F39C12'
);

// ===== String Quartets =====
dedupInsert(
  'String Quartet Op. 76 No. 3 "Emperor" — Poco adagio (皇帝四重奏)',
  '海顿最著名的弦乐四重奏。慢乐章以他创作的《上帝保佑弗朗茨皇帝》为主题，后来成为德国国歌。👑🇩🇪',
  60, 'G', 'major',
  makeChordTrack('strings', [[55, 59, 62, 67], [53, 57, 60, 65], [50, 55, 59, 62], [55, 59, 62, 67]], 3.0),
  7.0, '#D4AC0D'
);

dedupInsert(
  'String Quartet Op. 76 No. 2 "Fifths" — Allegro (五度四重奏)',
  '因开头以下行五度音程闻名。四把弦乐器的对话充满机智与活力。🎻💬',
  116, 'D', 'minor',
  makeTrack('strings', diatonic(62, [0, -3, 0, -3, -6, -3, 0, 2, 0, 2, 4, 2, 0, 2, 4, 5]), 0.2, 0.1),
  6.0, '#E74C3C'
);

dedupInsert(
  'String Quartet Op. 33 No. 2 "The Joke" — Finale (玩笑四重奏)',
  '终乐章中频繁的停顿戏弄听众——以为结束了却还没结束。海顿的幽默感在跳动的音符间闪烁。😂🎵',
  104, 'Eb', 'major',
  makeTrack('strings', diatonic(63, [0, 2, 4, 2, 0, 0, 2, 4, 2, 0, 0, 2, 4, 5, 7, 5, 4, 2, 0, 0]), 0.3, 0.15),
  4.0, '#27AE60'
);

dedupInsert(
  'String Quartet Op. 64 No. 5 "The Lark" — Allegro (云雀四重奏)',
  '第一小提琴在高音区奏出的旋律如云雀在天空中翱翔歌唱。🐦☁️',
  108, 'D', 'major',
  makeTrack('violin', diatonic(86, [0, 2, 4, 5, 7, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2]), 0.25, 0.1),
  5.5, '#87CEEB'
);

// ===== Piano Sonatas =====
dedupInsert(
  'Piano Sonata Hob.XVI:52 in Eb — Allegro (降E大调钢琴奏鸣曲)',
  '海顿最后一首也是最宏伟的钢琴奏鸣曲。为伦敦的布罗德伍德钢琴而作，音响饱满辉煌。🎹🏛️',
  112, 'Eb', 'major',
  makeTrack('piano', diatonic(63, [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9]), 0.3, 0.15),
  7.0, '#D35400'
);

// ─── 4. Sumário ───
const insertCount = db.prepare(
  'SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?'
).get(userId);
console.log(`\n📊 海顿全集入库完成！`);
console.log(`   总计作品: ${insertCount.cnt}`);
console.log(`   测试账号: haydn@music.square / symphony`);

process.exit(0);
