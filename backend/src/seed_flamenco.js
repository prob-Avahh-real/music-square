const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('💃 正在导入弗拉门戈音乐全集...\n');

// ─── 1. 创建弗拉门戈用户（去重） ───
const flamencoEmail = 'flamenco@music.square';
let flamencoUser = db.prepare('SELECT * FROM users WHERE email = ?').get(flamencoEmail);

if (!flamencoUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('olé', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '弗拉门戈', flamencoEmail, hash,
    'Flamenco — 西班牙灵魂之舞，吉他与深歌的火焰 🔥💃');
  flamencoUser = db.prepare('SELECT * FROM users WHERE email = ?').get(flamencoEmail);
  console.log('  ✓ 创建用户: 弗拉门戈');
} else {
  console.log('  ✓ 用户已存在: 弗拉门戈');
}

const userId = flamencoUser.id;

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
    Math.floor(Math.random() * 500 + 100),
    Math.floor(Math.random() * 120 + 20),
    Math.floor(Math.random() * 15 + 2),
    id
  );

  console.log(`  ✓ ${title}`);
  return id;
}

// ─── 3. Flamenco palette ───

// ===== Palos Fundamentales (核心风格) =====

dedupInsert(
  'Soleá (索莱阿)',
  '弗拉门戈之母。十二拍深沉之歌，孤寂而庄严，是 cante jondo 的根基。🕯️',
  84, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 64, 68, 71, 64, 59, 64, 68, 71, 76], 0.4, 0.2),
  5.0, '#8B0000'
);

dedupInsert(
  'Bulerías (布雷里亚斯)',
  '最欢快热烈的弗拉门戈风格。十二拍高速循环，吉他与即兴演唱的狂欢。🎉',
  144, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 57, 61, 64, 57, 52, 57, 61, 64, 69], 0.2, 0.1),
  3.0, '#E74C3C'
);

dedupInsert(
  'Alegrías (阿莱格里亚斯)',
  '加迪斯（Cádiz）的欢乐颂歌。十二拍结构，明亮开朗，以"tiriti tran"吟唱为标志。☀️',
  108, 'C', 'major',
  makeTrack('guitar', [60, 64, 67, 60, 64, 67, 60, 55, 60, 64, 67, 72], 0.3, 0.2),
  3.5, '#F1C40F'
);

dedupInsert(
  'Seguiriyas (塞吉里亚斯)',
  '弗拉门戈最深沉的风格之一。缓慢而痛苦，直击灵魂深处的呐喊。😢',
  60, 'E', 'minor',
  makeChordTrack('guitar', [[52, 56, 59], [50, 54, 57], [48, 52, 55], [45, 49, 52]], 2.5),
  8.0, '#1C2833'
);

dedupInsert(
  'Tangos (探戈斯)',
  '四拍节奏的欢快风格。弗拉门戈探戈不同于阿根廷探戈，更轻快活泼。💃',
  116, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 64, 61, 57, 52, 57, 61, 64, 69], 0.3, 0.15),
  3.5, '#E67E22'
);

dedupInsert(
  'Tientos (蒂恩托斯)',
  '源自 Tangos 但更缓慢深沉。节奏更舒展，情感更内敛。🌆',
  88, 'A', 'minor',
  makeTrack('guitar', [57, 60, 64, 69, 64, 60, 69, 64, 60, 57, 52, 57], 0.4, 0.25),
  4.5, '#A0522D'
);

dedupInsert(
  'Farruca (法鲁卡)',
  '源自西班牙北部的四拍风格。原为男舞独舞，刚健有力。🔥',
  96, 'A', 'minor',
  makeTrack('guitar', [57, 60, 64, 69, 64, 60, 57, 52, 57, 60, 64, 69], 0.3, 0.15),
  3.5, '#C0392B'
);

dedupInsert(
  'Fandangos (凡丹戈斯)',
  '三拍子的传统舞曲。起源于韦尔瓦（Huelva），轻快而富有乡土气息。🌿',
  100, 'E', 'major',
  makeFlamencoTrack('guitar', [64, 68, 71, 76, 71, 68, 64, 59, 64, 68, 71, 76], 0.3, 0.15, 3),
  3.5, '#27AE60'
);

dedupInsert(
  'Fandangos de Huelva (韦尔瓦凡丹戈)',
  'Huelva 地区的 Fandangos 变体。唱腔装饰华丽，吉他伴奏丰富。',
  108, 'E', 'major',
  makeTrack('guitar', [64, 67, 71, 76, 71, 67, 76, 71, 67, 64, 59, 56], 0.3, 0.15),
  3.0, '#1E8449'
);

dedupInsert(
  'Malagueñas (马拉盖尼亚斯)',
  '源自马拉加（Málaga）的 Fandangos 变体。自由节奏，抒情悠长。🌊',
  66, 'E', 'major',
  makeChordTrack('guitar', [[52, 56, 59, 64], [50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57]], 2.0),
  6.0, '#2980B9'
);

dedupInsert(
  'Granáinas (格拉纳伊纳斯)',
  '格拉纳达（Granada）的 Fandangos 变体。带有阿拉伯遗韵，细腻华丽。🏛️',
  72, 'B', 'major',
  makeTrack('guitar', [59, 63, 66, 71, 75, 71, 66, 63, 59, 54, 59, 63], 0.4, 0.25),
  4.5, '#8E44AD'
);

dedupInsert(
  'Media Granaína (半格拉纳伊纳)',
  'Granáinas 的缩略变体。同样源自格拉纳达，更为紧凑。🕌',
  76, 'B', 'major',
  makeTrack('guitar', [59, 63, 66, 71, 75, 78, 75, 71, 66, 63, 59, 54], 0.35, 0.2),
  3.5, '#7D3C98'
);

dedupInsert(
  'Rumba (伦巴)',
  '弗拉门戈伦巴。四拍节奏，受古巴音乐影响，轻快浪漫。🌴',
  112, 'A', 'minor',
  makeTrack('guitar', [57, 60, 64, 69, 72, 69, 64, 60, 57, 52, 57, 60], 0.25, 0.15),
  3.5, '#F39C12'
);

dedupInsert(
  'Sevillanas (塞维利亚纳斯)',
  '塞维利亚（Sevilla）的四月节舞曲。三拍四段体，弗拉门戈最流行的社交舞曲。💃🕺',
  120, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.25, 0.15),
  3.0, '#D4AC0D'
);

// ===== Cantes de Ida y Vuelta (往返之歌) =====

dedupInsert(
  'Guajiras (瓜希拉斯)',
  '受古巴音乐影响的风格。十拍结构，歌词常歌颂哈瓦那风光。🇨🇺',
  88, 'C', 'major',
  makeTrack('guitar', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.35, 0.2),
  4.0, '#1ABC9C'
);

dedupInsert(
  'Colombianas (哥伦比亚纳斯)',
  '受哥伦比亚音乐影响的弗拉门戈风格。四拍节奏，旋律优美。🇨🇴',
  100, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 76, 71, 68, 64, 59, 56, 59, 64, 68], 0.3, 0.2),
  3.5, '#16A085'
);

dedupInsert(
  'Peteneras (佩特内拉斯)',
  '十二拍的忧郁之歌。传说源自 La Paterna 的一位女歌手。神秘而凄美。',
  80, 'E', 'major',
  makeTrack('guitar', [64, 67, 71, 64, 67, 71, 64, 59, 64, 67, 71, 76], 0.4, 0.2),
  4.5, '#5B2C6F'
);

// ===== Cantes Mineros (矿工之歌) =====

dedupInsert(
  'Tarantas (塔兰塔斯)',
  '阿尔梅里亚（Almería）矿工之歌。自由节奏，深沉悲凉。⛏️',
  60, 'D', 'major',
  makeChordTrack('guitar', [[50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55]], 2.5),
  7.0, '#4A235A'
);

dedupInsert(
  'Cartageneras (卡塔赫内拉斯)',
  '穆尔西亚（Murcia）矿区的 Tarantas 变体。更缓慢，更富装饰性。⚒️',
  56, 'E', 'major',
  makeChordTrack('guitar', [[52, 56, 59, 64], [50, 54, 57, 62], [47, 51, 54, 59], [45, 49, 52, 57]], 2.5),
  7.0, '#6C3483'
);

dedupInsert(
  'Mineras (米内拉斯)',
  '矿工之歌家族的核心风格。自由节奏，抒发矿工生活的艰辛与希望。💎',
  64, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 76, 71, 68, 64, 59, 64, 68, 71, 64], 0.45, 0.3),
  5.0, '#512E5F'
);

// ===== Palos Festeros (节日风格) =====

dedupInsert(
  'Buleras por Soleá (布雷里亚斯式索莱阿)',
  'Soleá 与 Bulerías 的融合。保留 Soleá 的深沉，加速至 Bulerías 的节奏。⚡',
  120, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 64, 68, 71, 64, 59, 64, 68, 71, 76], 0.25, 0.15),
  3.5, '#B03A2E'
);

dedupInsert(
  'Zambra (桑布拉)',
  '吉普赛摩尔人的庆典音乐。格拉纳达阿尔拜辛区，阿拉伯风味浓郁。🕌',
  92, 'D', 'minor',
  makeTrack('guitar', [62, 65, 69, 74, 69, 65, 62, 57, 62, 65, 69, 74], 0.3, 0.2),
  4.0, '#D35400'
);

dedupInsert(
  'Verdiales (贝尔迪亚莱斯)',
  '马拉加（Málaga）山区的 Fandangos 变体。用吉他、小提琴、铃鼓合奏。🌄',
  108, 'C', 'major',
  makeTrack('guitar', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.3, 0.15),
  3.0, '#229954'
);

dedupInsert(
  'Saeta (赛埃塔)',
  '圣周宗教游行中的即兴歌唱。弗拉门戈最神圣的风格，无伴奏清唱。✝️🕯️',
  48, 'E', 'minor',
  makeChordTrack('voice', [[52, 55, 59], [50, 54, 57], [48, 52, 55], [45, 49, 52]], 3.0),
  8.0, '#5D6D7E'
);

// ===== Obras Maestras de los Grandes Maestros (大师名作) =====

// --- Paco de Lucía ---
dedupInsert(
  'Entre Dos Aguas (两水之间)',
  'Paco de Lucía 的不朽名作。Rumba 节奏，开场扫弦是全世界的弗拉门戈启蒙。💧',
  116, 'A', 'minor',
  makeFlamencoTrack('guitar', [57, 60, 64, 69, 64, 60, 57, 52, 57, 60, 64, 69], 0.25, 0.1, 4),
  3.0, '#2471A3'
);

dedupInsert(
  'Almoraima (阿尔莫赖马)',
  '1976 年同名专辑标题曲。Bulerías 节奏，快速凌厉的 Picado 技巧展示。⚡',
  152, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 76, 80, 76, 71, 68, 64, 59, 64, 68], 0.15, 0.1),
  2.5, '#CB4335'
);

dedupInsert(
  'Río de la Miel (蜜河)',
  'Paco de Lucía 对童年故乡 Algeciras 的怀念。蜜河在记忆中静静流淌。🏞️',
  80, 'C', 'major',
  makeTrack('guitar', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.4, 0.25),
  4.0, '#1F618D'
);

dedupInsert(
  'Zyryab (齐里亚布)',
  '向 9 世纪科尔多瓦音乐家 Ziryab 致敬的长篇组曲。弗拉门戈与阿拉伯、爵士的融合。🎵',
  108, 'E', 'major',
  makeChordTrack('guitar', [[52, 56, 59, 64], [50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57]], 1.5),
  6.0, '#7D6608'
);

dedupInsert(
  'Sólo Quiero Caminar (我只想行走)',
  'Paco de Lucía 六重奏代表作。Bulerías 节奏群奏，吉他与打击乐的对话。🚶',
  132, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 73, 76, 73, 69, 64, 61, 57, 52], 0.2, 0.1),
  3.0, '#2E4053'
);

dedupInsert(
  'Canción de Amor (爱之歌)',
  'Paco de Lucía 抒情慢板。旋律优美如歌，展现弗拉门戈吉他的温柔一面。💕',
  72, 'D', 'major',
  makeTrack('guitar', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 54, 62], 0.45, 0.25),
  4.5, '#E91E63'
);

dedupInsert(
  'Cepa Andaluza (安达卢西亚之根)',
  'Paco de Lucía 早期经典。Bulerías 风格，纯粹的弗拉门戈精神。🌹',
  140, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 76, 80, 76, 71, 68, 64, 59, 64, 68], 0.2, 0.1),
  2.5, '#922B21'
);

// --- Camarón de la Isla ---
dedupInsert(
  'La Leyenda del Tiempo (时间的传说)',
  'Camarón de la Isla 1979 年革命性专辑标题曲。弗拉门戈与摇滚、爵士的融合。⏳',
  100, 'E', 'major',
  makeTrack('voice', [64, 68, 71, 76, 71, 68, 64, 59, 64, 68, 71, 64], 0.3, 0.2),
  4.0, '#1A237E'
);

dedupInsert(
  'Como el Agua (如水)',
  'Camarón 与 Paco de Lucía 合作的经典。Bulerías 节奏，歌词深情如流水。💧',
  128, 'A', 'major',
  makeTrack('voice', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.25, 0.15),
  3.5, '#1565C0'
);

dedupInsert(
  'Soy Gitano (我是吉普赛人)',
  'Camarón 的骄傲宣言。Seguiriyas 风格，唱出吉普赛人的灵魂。🔥',
  72, 'E', 'minor',
  makeChordTrack('voice', [[52, 55, 59], [50, 54, 57], [48, 52, 55], [45, 49, 52]], 2.0),
  6.0, '#311B92'
);

// --- Vicente Amigo ---
dedupInsert(
  'Poeta (诗人)',
  'Vicente Amigo 1995 年首张专辑。现代弗拉门戈吉他杰作，融合古典与新潮。📖',
  104, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 73, 76, 73, 69, 64, 61, 57, 52], 0.3, 0.15),
  3.5, '#B7950B'
);

dedupInsert(
  'Ciudad de las Ideas (思想之城)',
  '2000 年格莱美提名专辑。抽象而诗意的弗拉门戈叙事。🏙️',
  88, 'E', 'minor',
  makeTrack('guitar', [64, 67, 71, 76, 71, 67, 64, 59, 64, 67, 71, 76], 0.35, 0.2),
  4.0, '#4A235A'
);

// --- Manolo Sanlúcar ---
dedupInsert(
  'Tauromagia (斗牛魔法)',
  'Manolo Sanlúcar 的吉他组曲。斗牛场上的生死乐章。🐂',
  80, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 64, 61, 57, 52, 57, 61, 64, 69], 0.35, 0.2),
  4.5, '#7B241C'
);

dedupInsert(
  'Medea (美狄亚)',
  'Manolo Sanlúcar 为同名芭蕾所作。弗拉门戈交响化的巅峰。🎭',
  96, 'C', 'major',
  makeChordTrack('guitar', [[48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55], [40, 44, 48, 52]], 2.0),
  6.0, '#1B4F72'
);

// --- Sabicas ---
dedupInsert(
  'Rumba Flamenca (弗拉门戈伦巴)',
  'Sabicas 的经典 Rumba。被誉为弗拉门戈吉他的奠基人之一。🎸',
  120, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.25, 0.15),
  3.0, '#E8610C'
);

dedupInsert(
  'Fantasticas (幻想曲)',
  'Sabicas 炫技之作。快速音阶与琶音的展示。💫',
  144, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 76, 80, 84, 80, 76, 71, 68, 64, 59], 0.15, 0.1),
  2.0, '#D68910'
);

// --- Tomatito ---
dedupInsert(
  'Barrio Vía (街道社区)',
  'Tomatito 的经典专辑同名曲。当代弗拉门戈吉他的清新之声。🏘️',
  100, 'E', 'major',
  makeTrack('guitar', [64, 68, 71, 76, 71, 68, 64, 59, 56, 59, 64, 68], 0.3, 0.2),
  3.5, '#148F77'
);

// ===== Regional & Modern =====

dedupInsert(
  'Bulerías de Jerez (赫雷斯布雷里亚斯)',
  '赫雷斯-德拉弗龙特拉（Jerez）风格的 Bulerías。更紧凑、更 earthy。🍷',
  150, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.15, 0.1),
  2.5, '#B33A3A'
);

dedupInsert(
  'Tangos de Triana (特里亚纳探戈斯)',
  '塞维利亚特里亚纳（Triana）区风格的 Tangos。吉普赛风味浓郁。',
  120, 'A', 'minor',
  makeTrack('guitar', [57, 60, 64, 69, 64, 60, 57, 52, 57, 60, 64, 69], 0.3, 0.15),
  3.0, '#AF601A'
);

dedupInsert(
  'Sevillanas Rocieras (朝圣塞维利亚纳斯)',
  '罗西奥（Rocío）朝圣所用的 Sevillanas 变体。虔诚而欢快。🙏',
  116, 'A', 'major',
  makeTrack('guitar', [57, 61, 64, 69, 73, 69, 64, 61, 57, 52, 57, 61], 0.25, 0.2),
  3.0, '#239B56'
);

// ===== Cante Jondo (深歌) =====

dedupInsert(
  'Martinete (马蒂内特)',
  '深歌（Cante Jondo）最纯粹的形式之一。无吉他伴奏，只有铁砧敲击的节奏。🔨',
  50, 'E', 'minor',
  makeTrack('voice', [64, 68, 71, 76, 71, 68, 64, 59, 64, 68, 71, 76], 0.6, 0.4),
  6.0, '#2C3E50'
);

dedupInsert(
  'Debla (德布拉)',
  '深歌家族中最稀有、最艰难的风格。无伴奏清唱，感受最原始的呐喊。🔥',
  44, 'E', 'minor',
  makeTrack('voice', [64, 67, 71, 64, 67, 71, 64, 59, 64, 67, 71, 76], 0.7, 0.5),
  7.0, '#212F3D'
);

dedupInsert(
  'Caracoles (卡拉科莱斯)',
  '以街头小贩叫卖声为源的欢快风格。十二拍结构轻松活泼。🐚',
  100, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.3, 0.2),
  3.5, '#F5B041'
);

// ─── 4. Sumário ───
const insertCount = db.prepare(
  'SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?'
).get(userId);
console.log(`\n📊 弗拉门戈作品入库完成！`);
console.log(`   总计作品: ${insertCount.cnt}`);
console.log(`   测试账号: flamenco@music.square / olé`);
console.log(`   🎧 打开 API 欣赏: http://localhost:3000/api/compositions?userId=${userId}`);
