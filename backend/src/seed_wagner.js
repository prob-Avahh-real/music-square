const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎭 正在导入瓦格纳音乐全集...\n');

// ─── 1. 创建瓦格纳用户（去重） ───
const wagnerEmail = 'wagner@music.square';
let wagnerUser = db.prepare('SELECT * FROM users WHERE email = ?').get(wagnerEmail);

if (!wagnerUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('tristan', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '瓦格纳', wagnerEmail, hash,
    'Richard Wagner (1813–1883) — 音乐戏剧的革命者，"总体艺术"与主导动机的大师 🎭⚡');
  wagnerUser = db.prepare('SELECT * FROM users WHERE email = ?').get(wagnerEmail);
  console.log('  ✓ 创建用户: 瓦格纳');
} else {
  console.log('  ✓ 用户已存在: 瓦格纳');
}

const userId = wagnerUser.id;

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
    Math.floor(Math.random() * 700 + 300),
    Math.floor(Math.random() * 180 + 40),
    Math.floor(Math.random() * 25 + 5),
    id
  );

  console.log(`  ✓ ${title}`);
  return id;
}

// ─── 3. Obras-primas de Wagner ───

// ===== Der Ring des Nibelungen (O Anel do Nibelungo) =====
dedupInsert(
  'Das Rheingold (莱茵的黄金)',
  '《尼伯龙根的指环》前夕。莱茵河底的黄金被盗，诸神的黄昏拉开序幕。🌊💍',
  72, 'Eb', 'major',
  makeChordTrack('orchestra', [[51, 55, 58, 63], [53, 56, 60, 65], [51, 55, 58, 63], [48, 52, 55, 60]], 2.5),
  7.0, '#D4AC0D'
);

dedupInsert(
  'Die Walküre — Ride of the Valkyries (女武神的骑行)',
  '《女武神》第三幕前奏曲。铜管齐鸣，女武神策马奔腾于雷霆之中。⚡🐎',
  132, 'B', 'minor',
  makeTrack('brass', diatonic(59, [0, 2, 4, 7, 4, 2, 0, 2, 4, 7, 9, 11, 9, 7, 4, 2]), 0.2, 0.1),
  3.0, '#922B21'
);

dedupInsert(
  'Die Walküre — Wotan\'s Farewell (沃坦的告别)',
  '《女武神》终场。众神之王沃坦与爱女布伦希尔德诀别，魔火环绕。🔥💔',
  48, 'E', 'major',
  makeChordTrack('orchestra', [[52, 56, 59, 64], [54, 57, 61, 66], [51, 55, 58, 63], [49, 53, 56, 61]], 3.0),
  9.0, '#E74C3C'
);

dedupInsert(
  'Siegfried — Forest Murmurs (森林细语)',
  '《齐格弗里德》第二幕。主人公在森林中聆听鸟鸣与自然的呢喃。🌲🐦',
  60, 'F', 'major',
  makeTrack('woodwind', diatonic(65, [0, 2, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2, 0, 2, 4, 5]), 0.35, 0.2),
  4.5, '#27AE60'
);

dedupInsert(
  'Götterdämmerung — Siegfried\'s Funeral March (齐格弗里德葬礼进行曲)',
  '《诸神的黄昏》第三幕。沉重的葬礼进行曲，主导动机层层交织，英雄陨落。⚰️⚫',
  54, 'C', 'minor',
  makeChordTrack('brass', [[48, 52, 55, 60], [45, 48, 52, 55], [43, 47, 50, 55], [48, 52, 55, 60]], 3.0),
  8.0, '#17202A'
);

dedupInsert(
  'Götterdämmerung — Immolation Scene (献祭场景)',
  '《诸神的黄昏》终场。布伦希尔德骑马投入烈焰，瓦尔哈拉神殿在火海中崩塌。🔥🏰',
  76, 'Eb', 'major',
  makeTrack('orchestra', diatonic(63, [0, 2, 4, 6, 4, 2, 0, 2, 4, 6, 8, 10, 8, 6, 4, 2]), 0.3, 0.15),
  6.0, '#C0392B'
);

// ===== Tristan und Isolde =====
dedupInsert(
  'Tristan und Isolde — Prelude (特里斯坦与伊索尔德 — 前奏曲)',
  '西方音乐史上最具革命性的作品之一。著名的"特里斯坦和弦"开启了现代音乐的大门。💔🎻',
  44, 'A', 'minor',
  makeChordTrack('strings', [[45, 49, 53, 57], [43, 47, 50, 54], [40, 44, 48, 52], [45, 49, 53, 56]], 4.0),
  12.0, '#1A237E'
);

dedupInsert(
  'Tristan und Isolde — Liebestod (爱之死)',
  '《特里斯坦》终场。伊索尔德在爱人遗体旁的升华之歌——爱与死亡合为一体。🤍✨',
  38, 'B', 'major',
  makeTrack('voice', diatonic(59, [0, 2, 4, 6, 8, 6, 4, 2, 0, 2, 4, 6, 8, 10, 8, 6]), 0.8, 0.4),
  8.0, '#8E44AD'
);

// ===== Die Meistersinger von Nürnberg =====
dedupInsert(
  'Die Meistersinger — Overture (纽伦堡的名歌手 — 序曲)',
  '瓦格纳唯一的喜剧。辉煌的C大调序曲，工匠歌手们庄严而又欢快的行列。🎺🏙️',
  104, 'C', 'major',
  makeTrack('brass', diatonic(60, [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 5]), 0.3, 0.15),
  5.0, '#F39C12'
);

dedupInsert(
  'Die Meistersinger — Prize Song (获奖之歌)',
  '第三幕中瓦尔特的获奖之歌。晨光般的旋律，感动了所有名歌手。🌅🎵',
  66, 'C', 'major',
  makeTrack('voice', diatonic(60, [0, 2, 4, 2, 0, 2, 4, 5, 7, 9, 7, 5, 4, 2, 4, 5, 7, 9]), 0.5, 0.3),
  5.5, '#D4AC0D'
);

// ===== Tannhäuser =====
dedupInsert(
  'Tannhäuser — Overture (唐豪瑟 — 序曲)',
  '朝圣者的合唱与维纳斯堡的狂欢在此交织。庄严与纵欲的永恒对抗。🏰🎻',
  88, 'E', 'major',
  makeTrack('brass', diatonic(64, [0, 2, 4, 7, 4, 2, 0, 2, 4, 7, 9, 11, 9, 7, 4, 2]), 0.35, 0.2),
  4.5, '#2980B9'
);

dedupInsert(
  'Tannhäuser — Pilgrims\' Chorus (朝圣者合唱)',
  '第三幕朝圣者归来时的庄严合唱。从悔恨到救赎的精神升华。🙏✝️',
  56, 'E', 'major',
  makeChordTrack('choir', [[52, 56, 59, 64], [54, 57, 61, 66], [52, 56, 59, 64], [49, 53, 56, 61, 68]], 3.0),
  10.0, '#F5F5DC'
);

// ===== Lohengrin =====
dedupInsert(
  'Lohengrin — Prelude to Act I (罗恩格林 — 第一幕前奏曲)',
  '圣杯的光芒从天堂降临。瓦格纳最纯净的管弦乐篇章，神秘而神圣。🏆✨',
  50, 'A', 'major',
  makeChordTrack('strings', [[57, 61, 64, 69], [55, 59, 62, 67], [52, 56, 59, 64], [57, 60, 64, 69]], 4.0),
  10.0, '#87CEEB'
);

dedupInsert(
  'Lohengrin — Bridal Chorus (婚礼合唱)',
  '第三幕著名的婚礼进行曲。全球无数新人踩着这段旋律步入婚姻殿堂。💒🔔',
  72, 'Bb', 'major',
  makeTrack('organ', diatonic(58, [0, 2, 4, 2, 0, 4, 2, 0, 2, 4, 7, 9, 7, 4, 2, 4, 0, 2]), 0.5, 0.3),
  5.0, '#FFFFFF'
);

// ===== Der fliegende Holländer =====
dedupInsert(
  'Der fliegende Holländer — Overture (漂泊的荷兰人 — 序曲)',
  '狂风暴雨中的幽灵船。森塔的救赎主题与荷兰人的诅咒主题激烈碰撞。⛵🌊',
  96, 'D', 'minor',
  makeTrack('brass', diatonic(62, [0, 2, -1, 0, 2, 4, 2, 0, -1, 0, 2, 4, 5, 4, 2, 0]), 0.3, 0.15),
  4.0, '#1A5276'
);

dedupInsert(
  'Der fliegende Holländer — Senta\'s Ballad (森塔的叙事曲)',
  '第二幕森塔凝视荷兰人画像时唱的叙事曲。痴情少女的救赎渴望。🎨💙',
  66, 'G', 'minor',
  makeTrack('voice', diatonic(55, [0, 2, -1, 0, 2, 4, 2, 0, -1, 0, 2, 4, 5, 7, 5, 4]), 0.5, 0.3),
  5.0, '#2E86C1'
);

// ===== Parsifal =====
dedupInsert(
  'Parsifal — Prelude (帕西法尔 — 前奏曲)',
  '瓦格纳最后一部乐剧。圣杯、圣矛与基督受难的主题，缓慢而庄严的展开。🏆✝️',
  40, 'Ab', 'major',
  makeChordTrack('orchestra', [[56, 60, 63, 68], [54, 58, 61, 66], [51, 55, 59, 63], [56, 60, 63, 68]], 4.0),
  13.0, '#4A235A'
);

dedupInsert(
  'Parsifal — Good Friday Spell (受难日魔法)',
  '第三幕中帕西法尔为昆德丽施洗。草地上的花朵在受难日绽放，音乐化为宁静的狂喜。🌸🙏',
  48, 'Db', 'major',
  makeChordTrack('strings', [[49, 53, 56, 61], [47, 51, 54, 59], [44, 48, 52, 56], [49, 53, 56, 61]], 3.5),
  11.0, '#9B59B6'
);

// ===== Rienzi =====
dedupInsert(
  'Rienzi — Overture (黎恩济 — 序曲)',
  '瓦格纳早期成名作。罗马护民官黎恩济的悲剧，序曲气势磅礴。🏛️🎺',
  112, 'D', 'major',
  makeTrack('brass', diatonic(62, [0, 2, 4, 7, 9, 7, 4, 2, 0, 2, 4, 7, 9, 11, 9, 7]), 0.3, 0.15),
  4.5, '#E67E22'
);

// ===== Wesendonck Lieder =====
dedupInsert(
  'Wesendonck Lieder — Träume (韦森东克歌曲 — 梦)',
  '为玛蒂尔德·韦森东克的诗谱曲。梦境般的温柔，预示了《特里斯坦》的和声世界。🌙💭',
  50, 'G', 'major',
  makeTrack('voice', diatonic(67, [0, 2, 4, 2, 0, 2, 4, 5, 4, 2, 0, 2, 4, 5, 7, 5]), 0.6, 0.35),
  5.5, '#DDA0DD'
);

// ===== Siegfried Idyll =====
dedupInsert(
  'Siegfried Idyll (齐格弗里德牧歌)',
  '瓦格纳送给妻子科西玛的生日礼物。在别墅楼梯上首演的室内乐杰作。🎁🎻',
  56, 'E', 'major',
  makeChordTrack('chamber', [[52, 56, 59, 64], [54, 57, 61, 66], [56, 59, 63, 68], [52, 56, 59, 64]], 3.0),
  8.0, '#E8F8F5'
);

// ─── 4. Sumário ───
const insertCount = db.prepare(
  'SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?'
).get(userId);
console.log(`\n📊 瓦格纳全集入库完成！`);
console.log(`   总计作品: ${insertCount.cnt}`);
console.log(`   测试账号: wagner@music.square / tristan`);

process.exit(0);
