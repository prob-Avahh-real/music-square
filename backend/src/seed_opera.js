const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎭 正在导入经典歌剧作品全集...\n');

// ─── 1. 创建歌剧用户（去重） ───
const operaEmail = 'opera@music.square';
let operaUser = db.prepare('SELECT * FROM users WHERE email = ?').get(operaEmail);

if (!operaUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('figaro', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '歌剧大师', operaEmail, hash,
    'Opera — 四百年的戏剧与音乐之巅，人类情感的终极表达 🎭🎶');
  operaUser = db.prepare('SELECT * FROM users WHERE email = ?').get(operaEmail);
  console.log('  ✓ 创建用户: 歌剧大师');
} else {
  console.log('  ✓ 用户已存在: 歌剧大师');
}

const userId = operaUser.id;

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

function makeFlamencoTrack(instrument, pitches, noteDur, gap, accentEvery = 3) {
  const notes = [];
  let start = 0;
  for (let i = 0; i < pitches.length; i++) {
    const dur = i > 0 && i % accentEvery === 0 ? noteDur * 1.5 : noteDur;
    notes.push({ pitch: pitches[i], start: Math.round(start * 100) / 100, duration: dur });
    start += dur + gap;
  }
  return [{ instrument, notes }];
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
    Math.floor(Math.random() * 600 + 200),
    Math.floor(Math.random() * 150 + 30),
    Math.floor(Math.random() * 20 + 3),
    id
  );

  console.log(`  ✓ ${title}`);
  return id;
}

// ─── 3. Opera repertoire ───

// ===== 意大利 — 蒙特威尔第 / 罗西尼 / 多尼采蒂 / 贝利尼 =====
dedupInsert(
  "L'Orfeo (奥菲欧) — Monteverdi",
  '1607 年，歌剧史上第一部杰作。奥菲欧下冥界寻妻的希腊神话。🎭',
  72, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.5, 0.3),
  5.5, '#8B4513'
);

dedupInsert(
  'Il Barbiere di Siviglia (塞维利亚的理发师) — Rossini',
  '罗西尼喜歌剧巅峰。费加罗的机智、罗西娜的狡黠，欢乐永不停歇。✂️',
  132, 'E', 'major',
  makeFlamencoTrack('voice', [64, 68, 71, 76, 71, 68, 64, 59, 64, 68, 71, 76], 0.2, 0.1, 4),
  3.0, '#E74C3C'
);

dedupInsert(
  'La Cenerentola (灰姑娘) — Rossini',
  '罗西尼版的灰姑娘故事。没有魔法仙女，唯有善良与宽恕的力量。👠',
  108, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.3, 0.2),
  3.5, '#F39C12'
);

dedupInsert(
  "L'elisir d'amore (爱情灵药) — Donizetti",
  '多尼采蒂最欢快的喜歌剧。一瓶廉价葡萄酒冒充爱情灵药的故事。🧪',
  100, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.3, 0.2),
  3.5, '#27AE60'
);

dedupInsert(
  'Lucia di Lammermoor (拉美莫尔的露琪亚) — Donizetti',
  '多尼采蒂悲剧杰作。疯狂场景（Mad Scene）是花腔女高音的终极试金石。💔',
  66, 'E', 'minor',
  makeChordTrack('voice', [[52, 56, 59, 64], [50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57]], 2.5),
  8.0, '#1A237E'
);

dedupInsert(
  'Norma (诺尔玛) — Bellini',
  '贝利尼巅峰之作。德鲁伊女祭司的悲恋。"Casta Diva" 是美声唱法的圣杯。🏛️',
  58, 'F', 'major',
  makeChordTrack('voice', [[53, 57, 60, 65], [52, 55, 59, 64], [50, 54, 57, 62], [48, 52, 55, 60]], 3.0),
  9.0, '#4A235A'
);

dedupInsert(
  'La Sonnambula (梦游女) — Bellini',
  '贝利尼的田园牧歌。纯洁的乡村少女梦游之谜。🌙',
  80, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.4, 0.25),
  4.0, '#D4AC0D'
);

// ===== 意大利 — 威尔第 =====
dedupInsert(
  'Rigoletto (弄臣) — Verdi',
  '威尔第第一部不朽杰作。驼背弄臣的复仇悲剧，"女人善变" 举世闻名。🎭',
  112, 'B', 'major',
  makeTrack('voice', [59, 63, 66, 71, 75, 71, 66, 63, 59, 54, 59, 63], 0.25, 0.15),
  3.0, '#922B21'
);

dedupInsert(
  'La Traviata (茶花女) — Verdi',
  '交际花薇奥莱塔的悲剧爱情。"饮酒歌" 是歌剧最著名的旋律之一。🍷',
  96, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.3, 0.2),
  3.5, '#C0392B'
);

dedupInsert(
  'Il Trovatore (游吟诗人) — Verdi',
  '烈火般的浪漫悲剧。吉普赛人的复仇、铁砧合唱，充满激情。🔥',
  108, 'E', 'minor',
  makeTrack('voice', [64, 67, 71, 76, 71, 67, 64, 59, 64, 67, 71, 76], 0.3, 0.15),
  3.0, '#B03A2E'
);

dedupInsert(
  'Aida (阿依达) — Verdi',
  '古埃及战俘公主的悲恋。凯旋进行曲是歌剧史上最宏伟的场面之一。🏛️',
  80, 'E', 'major',
  makeTrack('voice', [64, 68, 71, 76, 80, 76, 71, 68, 64, 59, 64, 68], 0.35, 0.2),
  4.5, '#1A5276'
);

dedupInsert(
  'Otello (奥赛罗) — Verdi',
  '威尔第晚年悲剧巅峰。嫉妒摧毁一切，莎士比亚的精华浓缩于音乐。⚫',
  72, 'C', 'minor',
  makeChordTrack('voice', [[48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55], [40, 44, 48, 52]], 2.5),
  7.0, '#17202A'
);

dedupInsert(
  'Falstaff (法斯塔夫) — Verdi',
  '威尔第 80 岁时创作的喜歌剧绝唱。莎士比亚笔下胖骑士的诙谐故事。🍺',
  128, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.2, 0.15),
  2.5, '#D35400'
);

dedupInsert(
  'Nabucco (纳布科) — Verdi',
  '威尔第三期转折之作。希伯来奴隶合唱"飞吧，思想，乘着金色的翅膀"是意大利第二国歌。✡️',
  66, 'F', 'major',
  makeChordTrack('voice', [[53, 57, 60, 65], [52, 55, 59, 64], [50, 54, 57, 62], [48, 52, 55, 60]], 3.0),
  8.0, '#D4AC0D'
);

dedupInsert(
  'Don Carlo (唐·卡洛) — Verdi',
  '威尔第最宏大的大歌剧。西班牙宫廷的信仰、爱情与自由之殇。👑',
  64, 'F', 'minor',
  makeChordTrack('voice', [[53, 56, 60, 65], [51, 55, 58, 63], [49, 53, 56, 61], [46, 50, 53, 58]], 2.5),
  7.5, '#2C3E50'
);

dedupInsert(
  'Macbeth (麦克白) — Verdi',
  '威尔第最阴郁的歌剧。女巫的预言、麦克白夫人的梦游，莎翁悲剧的音乐化身。🗡️',
  88, 'A', 'minor',
  makeTrack('voice', [57, 60, 64, 69, 64, 60, 57, 52, 57, 60, 64, 69], 0.35, 0.2),
  4.0, '#1B1B1B'
);

dedupInsert(
  'Un Ballo in Maschera (假面舞会) — Verdi',
  '复仇、预言与悲剧性误会的交织。斯德哥尔摩的假面舞会血案。🎭',
  96, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.3, 0.2),
  3.5, '#5B2C6F'
);

// ===== 意大利 — 普契尼 =====
dedupInsert(
  'La Bohème (波西米亚人) — Puccini',
  '普契尼最温暖的杰作。巴黎拉丁区穷艺术家的欢笑与眼泪。❄️🔥',
  88, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.35, 0.2),
  4.0, '#2980B9'
);

dedupInsert(
  'Tosca (托斯卡) — Puccini',
  '最扣人心弦的真实主义歌剧。画家、女伶与邪恶警察局长的生死较量。🗡️',
  96, 'D', 'minor',
  makeTrack('voice', [62, 65, 69, 74, 69, 65, 62, 57, 62, 65, 69, 74], 0.3, 0.2),
  3.5, '#641E16'
);

dedupInsert(
  'Madama Butterfly (蝴蝶夫人) — Puccini',
  '东方主义悲剧的巅峰。日本姑娘巧巧桑的美国梦碎。🌸',
  66, 'G', 'major',
  makeTrack('voice', [55, 59, 62, 67, 71, 67, 62, 59, 55, 50, 55, 59], 0.45, 0.3),
  5.0, '#F1948A'
);

dedupInsert(
  'Turandot (图兰朵) — Puccini',
  '普契尼未竟之作。中国公主的三个谜题与卡拉夫王子的"今夜无人入睡"。🏯',
  84, 'D', 'major',
  makeTrack('voice', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 62, 66], 0.35, 0.2),
  4.0, '#C0392B'
);

dedupInsert(
  'Manon Lescaut (曼侬·莱斯科) — Puccini',
  '普契尼第一部大获成功的歌剧。美与奢华的毁灭之路。💎',
  72, 'A', 'minor',
  makeTrack('voice', [57, 60, 64, 69, 64, 60, 57, 52, 57, 60, 64, 69], 0.4, 0.25),
  4.5, '#8E44AD'
);

dedupInsert(
  'Gianni Schicchi (贾尼·斯基基) — Puccini',
  '普契尼唯一喜歌剧。佛罗伦萨的遗产闹剧，"亲爱的爸爸"是至爱咏叹调。😈',
  120, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.25, 0.15),
  2.5, '#E67E22'
);

// ===== 真实主义 (Verismo) =====
dedupInsert(
  'Pagliacci (丑角) — Leoncavallo',
  '真实主义歌剧双璧之一。喜剧演员的悲剧"穿上戏装"。🎭😢',
  80, 'E', 'minor',
  makeTrack('voice', [64, 67, 71, 76, 71, 67, 64, 59, 64, 67, 71, 76], 0.35, 0.2),
  4.0, '#7B241C'
);

dedupInsert(
  'Cavalleria Rusticana (乡村骑士) — Mascagni',
  '真实主义开山之作。西西里复活节的嫉妒与决斗。间奏曲永垂不朽。⛪',
  72, 'G', 'major',
  makeTrack('voice', [55, 59, 62, 67, 71, 67, 62, 59, 55, 50, 55, 59], 0.4, 0.25),
  4.5, '#515A5A'
);

// ===== 莫扎特 =====
dedupInsert(
  "Le Nozze di Figaro (费加罗的婚礼) — Mozart",
  '莫扎特喜歌剧的巅峰。一天的疯狂、爱情与宽恕。一天之内无人不结婚。💑',
  120, 'D', 'major',
  makeTrack('voice', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 62, 66], 0.25, 0.15),
  3.0, '#F1C40F'
);

dedupInsert(
  'Don Giovanni (唐·乔瓦尼) — Mozart',
  '莫扎特最黑暗的杰作。风流贵族的末日，石像的晚宴。💀🍷',
  88, 'D', 'minor',
  makeTrack('voice', [62, 65, 69, 74, 69, 65, 62, 57, 62, 65, 69, 74], 0.3, 0.2),
  4.0, '#1C2833'
);

dedupInsert(
  'Die Zauberflöte (魔笛) — Mozart',
  '莫扎特最后一部歌剧。共济会寓言，夜后花腔与帕帕基诺的鸟笼。🪄',
  108, 'E', 'major',
  makeTrack('voice', [64, 68, 71, 76, 71, 68, 64, 59, 64, 68, 71, 76], 0.3, 0.15),
  3.0, '#9B59B6'
);

dedupInsert(
  'Così fan tutte (女人心) — Mozart',
  '莫扎特对爱情忠诚度的哲学实验。两对恋人的换装闹剧。🎭',
  100, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.3, 0.2),
  3.5, '#3498DB'
);

dedupInsert(
  "Die Entführung aus dem Serail (后宫诱逃) — Mozart",
  '莫扎特德国歌唱剧杰作。土耳其风情，奥斯曼帕夏的宽恕。🏰',
  112, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.25, 0.15),
  3.0, '#D68910'
);

// ===== 瓦格纳 =====
dedupInsert(
  "Der fliegende Holländer (漂泊的荷兰人) — Wagner",
  '瓦格纳早期杰作。被诅咒的荷兰船长与忠贞的森塔。⛵',
  80, 'D', 'minor',
  makeChordTrack('voice', [[50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55]], 2.5),
  7.0, '#0E6251'
);

dedupInsert(
  'Tannhäuser (唐豪瑟) — Wagner',
  '中世纪游吟骑士在维纳斯的肉欲之爱与伊丽莎白的圣洁之爱间挣扎。🏔️',
  76, 'E', 'major',
  makeChordTrack('voice', [[52, 56, 59, 64], [50, 54, 57, 62], [47, 51, 54, 59], [45, 49, 52, 57]], 2.5),
  7.0, '#7D6608'
);

dedupInsert(
  'Lohengrin (罗恩格林) — Wagner',
  '天鹅骑士的神秘传说。"婚礼进行曲" 家喻户晓。🦢',
  66, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.4, 0.25),
  4.5, '#D4E6F1'
);

dedupInsert(
  'Tristan und Isolde (特里斯坦与伊索尔德) — Wagner',
  '西方音乐的里程碑。爱与死的酒药，无尽旋律与"特里斯坦和弦"。💔',
  56, 'C', 'minor',
  makeChordTrack('voice', [[48, 52, 55, 60], [46, 50, 53, 58], [44, 48, 51, 56], [41, 45, 48, 53]], 3.0),
  9.0, '#2C3E50'
);

dedupInsert(
  'Die Meistersinger von Nürnberg (纽伦堡的名歌手) — Wagner',
  '瓦格纳唯一喜歌剧。16 世纪纽伦堡的歌唱比赛与艺术的自由精神。🎵',
  104, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.3, 0.2),
  4.0, '#B7950B'
);

dedupInsert(
  'Das Rheingold (莱茵的黄金) — Wagner',
  '《尼伯龙根的指环》序篇。莱茵河水仙女、侏儒与众神的权力游戏。💍',
  72, 'E', 'major',
  makeChordTrack('voice', [[52, 56, 59, 64], [54, 58, 61, 66], [50, 54, 57, 62], [47, 51, 54, 59]], 2.5),
  7.0, '#1B5E20'
);

dedupInsert(
  'Die Walküre (女武神) — Wagner',
  '《指环》第二夜。兄妹禁忌之爱，沃坦的悲叹与"女武神的骑行"。⚡',
  84, 'D', 'minor',
  makeTrack('voice', [62, 65, 69, 74, 78, 74, 69, 65, 62, 57, 62, 65], 0.3, 0.2),
  4.0, '#0D47A1'
);

dedupInsert(
  'Siegfried (齐格弗里德) — Wagner',
  '《指环》第三夜。无畏英雄铸造神剑、穿越烈火唤醒布伦希尔德。🗡️🔥',
  76, 'F', 'major',
  makeTrack('voice', [53, 57, 60, 65, 69, 65, 60, 57, 53, 48, 53, 57], 0.35, 0.2),
  4.5, '#E65100'
);

dedupInsert(
  'Götterdämmerung (众神的黄昏) — Wagner',
  '《指环》终篇。背叛、弑君、葬礼进行曲与莱茵河畔的世界焚毁。🌋',
  64, 'C', 'minor',
  makeChordTrack('voice', [[48, 52, 55, 60], [44, 48, 51, 56], [41, 45, 48, 53], [36, 40, 44, 48]], 3.0),
  9.0, '#212121'
);

dedupInsert(
  'Parsifal (帕西法尔) — Wagner',
  '瓦格纳最后的作品。圣杯传奇，"纯真的傻子因怜悯而智慧"。✝️',
  52, 'A', 'major',
  makeChordTrack('voice', [[45, 49, 52, 57], [47, 51, 54, 59], [44, 48, 51, 56], [42, 46, 49, 54]], 3.5),
  10.0, '#4E342E'
);

// ===== 施特劳斯 =====
dedupInsert(
  'Der Rosenkavalier (玫瑰骑士) — R. Strauss',
  '施特劳斯最受欢迎的喜歌剧。元帅夫人的优雅放手与玫瑰骑士的青春爱恋。🌹',
  88, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.35, 0.2),
  4.5, '#E91E63'
);

dedupInsert(
  'Salome (莎乐美) — R. Strauss',
  '施特劳斯最震撼的一部。莎乐美吻着施洗约翰被斩下的头颅。😱',
  80, 'C', 'minor',
  makeTrack('voice', [60, 63, 67, 72, 67, 63, 60, 55, 60, 63, 67, 72], 0.3, 0.2),
  4.0, '#1A1A2E'
);

dedupInsert(
  'Elektra (厄勒克特拉) — R. Strauss',
  '施特劳斯最激进的总谱。古希腊的不朽复仇，直击内心的狂乱。🔪',
  112, 'D', 'minor',
  makeTrack('voice', [62, 65, 69, 74, 69, 65, 62, 57, 62, 65, 69, 74], 0.25, 0.15),
  3.0, '#3E2723'
);

// ===== 法国歌剧 =====
dedupInsert(
  'Carmen (卡门) — Bizet',
  '世界上最受欢迎的歌剧。吉普赛女郎卡门的自由与死亡。🌹🔥',
  108, 'D', 'major',
  makeTrack('voice', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 62, 66], 0.25, 0.15),
  3.0, '#E74C3C'
);

dedupInsert(
  'Faust (浮士德) — Gounod',
  '古诺的代表作。浮士德将灵魂卖给魔鬼换取青春。"珠宝之歌"璀璨夺目。👹',
  84, 'D', 'major',
  makeTrack('voice', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 62, 66], 0.35, 0.2),
  4.0, '#4A148C'
);

dedupInsert(
  "Les Contes d'Hoffmann (霍夫曼的故事) — Offenbach",
  '奥芬巴赫的绝唱。霍夫曼的三段不幸爱情。"船歌"荡漾威尼斯夜空。🚤',
  76, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.4, 0.25),
  4.5, '#1ABC9C'
);

dedupInsert(
  'Samson et Dalila (参孙与达莉拉) — Saint-Saëns',
  '圣经中的大力士与妖妇。"你的声音打开我的心扉"是最美的女中音咏叹调。💋',
  66, 'D', 'minor',
  makeChordTrack('voice', [[50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55]], 2.5),
  6.0, '#6C3483'
);

dedupInsert(
  'Pelléas et Mélisande (佩利亚斯与梅丽桑德) — Debussy',
  '德彪西唯一歌剧。印象派音乐的戏剧巅峰，爱与命运的低语。🌿',
  60, 'C', 'major',
  makeChordTrack('voice', [[48, 52, 55, 60], [50, 54, 57, 62], [47, 51, 54, 59], [45, 49, 52, 57]], 3.0),
  8.0, '#5D6D7E'
);

// ===== 俄罗斯歌剧 =====
dedupInsert(
  'Eugene Onegin (叶甫盖尼·奥涅金) — Tchaikovsky',
  '柴可夫斯基抒情歌剧。塔季扬娜写信的场景是俄语歌剧最动人的时刻。💌',
  76, 'E', 'minor',
  makeTrack('voice', [64, 67, 71, 76, 71, 67, 64, 59, 64, 67, 71, 76], 0.4, 0.2),
  4.5, '#1A5276'
);

dedupInsert(
  'Boris Godunov (鲍里斯·戈都诺夫) — Mussorgsky',
  '穆索尔斯基的俄罗斯历史画卷。沙皇的良心谴责与钟声合唱。🔔',
  68, 'C', 'minor',
  makeChordTrack('voice', [[48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55], [40, 44, 48, 52]], 2.5),
  7.0, '#4A235A'
);

dedupInsert(
  'Prince Igor (伊戈尔王) — Borodin',
  '鲍罗丁的史诗。波罗维茨舞曲举世闻名，草原之广阔尽在音乐中。🏹',
  88, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.3, 0.2),
  3.5, '#6B8E23'
);

dedupInsert(
  'The Queen of Spades (黑桃皇后) — Tchaikovsky',
  '柴可夫斯基最黑暗的歌剧。三张牌的秘密与疯人院中的悲惨结局。♠️',
  80, 'A', 'minor',
  makeTrack('voice', [57, 60, 64, 69, 64, 60, 57, 52, 57, 60, 64, 69], 0.35, 0.2),
  4.0, '#212121'
);

// ===== 俄罗斯 — 林姆斯基 / 普罗科菲耶夫 =====
dedupInsert(
  'The Golden Cockerel (金鸡) — Rimsky-Korsakov',
  '林姆斯基的最后一部歌剧。嘲讽君王的讽刺寓言，东方色彩绚丽。🐓',
  100, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.3, 0.2),
  3.5, '#D35400'
);

dedupInsert(
  'War and Peace (战争与和平) — Prokofiev',
  '普罗科菲耶夫的史诗巨制。托尔斯泰小说浓缩为 13 场戏的宏伟画卷。⚔️',
  96, 'C', 'major',
  makeChordTrack('voice', [[48, 52, 55, 60, 64], [45, 49, 52, 57, 61], [43, 47, 50, 55, 59], [40, 44, 48, 52, 56]], 2.0),
  6.0, '#5D4037'
);

dedupInsert(
  'The Love for Three Oranges (三只橙子的爱情) — Prokofiev',
  '普罗科菲耶夫最富趣味的歌剧。魔幻童话的荒诞与幽默。🍊',
  120, 'D', 'major',
  makeTrack('voice', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 62, 66], 0.2, 0.15),
  2.5, '#F39C12'
);

// ===== 捷克 / 英国 =====
dedupInsert(
  'Rusalka (水仙女) — Dvořák',
  '德沃夏克最著名的歌剧。水仙女爱上人类王子，"月亮颂"清澈如泉。🌙',
  64, 'G', 'major',
  makeTrack('voice', [55, 59, 62, 67, 71, 67, 62, 59, 55, 50, 55, 59], 0.45, 0.3),
  5.0, '#2471A3'
);

dedupInsert(
  'The Bartered Bride (被出卖的新嫁娘) — Smetana',
  '斯美塔那的欢乐乡间喜剧。波尔卡、弗利亚特舞蹈与快乐的欺骗。💃',
  116, 'F', 'major',
  makeTrack('voice', [53, 57, 60, 65, 69, 65, 60, 57, 53, 48, 53, 57], 0.25, 0.15),
  3.0, '#27AE60'
);

dedupInsert(
  'Jenůfa (耶奴发) — Janáček',
  '雅那切克最感人的歌剧。摩拉维亚乡村的私生子与宽恕。💔',
  72, 'E', 'minor',
  makeChordTrack('voice', [[52, 55, 59], [50, 54, 57], [48, 52, 55], [45, 49, 52]], 2.5),
  6.5, '#5D6D7E'
);

dedupInsert(
  'Peter Grimes (彼得·格莱姆斯) — Britten',
  '布里顿的现代杰作。孤僻渔夫的悲剧，"四首大海间奏曲"直击灵魂。🌊',
  80, 'C', 'minor',
  makeTrack('voice', [60, 63, 67, 72, 67, 63, 60, 55, 60, 63, 67, 72], 0.35, 0.2),
  4.0, '#34495E'
);

dedupInsert(
  'Porgy and Bess (波吉与贝丝) — Gershwin',
  '格什温的美国歌剧。查尔斯顿贫民区的爱恨，"夏日时光"悠然入梦。☀️',
  88, 'B', 'major',
  makeTrack('voice', [59, 63, 66, 71, 75, 71, 66, 63, 59, 54, 59, 63], 0.35, 0.2),
  4.0, '#212F3D'
);

// ─── 4. Sumário ───
const insertCount = db.prepare(
  'SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?'
).get(userId);
console.log(`\n📊 歌剧作品入库完成！`);
console.log(`   总计作品: ${insertCount.cnt}`);
console.log(`   测试账号: opera@music.square / figaro`);
console.log(`   🎧 打开 API 欣赏: http://localhost:3000/api/compositions?userId=${userId}`);
