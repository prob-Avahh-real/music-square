const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎹 正在导入德彪西音乐全集...\n');

// ─── 1. 创建德彪西用户（去重） ───
const debussyEmail = 'debussy@music.square';
let debussyUser = db.prepare('SELECT * FROM users WHERE email = ?').get(debussyEmail);

if (!debussyUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('clairdelune', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '德彪西', debussyEmail, hash,
    'Claude Debussy (1862–1918) — 印象主义音乐大师，用音符作画 🎨');
  debussyUser = db.prepare('SELECT * FROM users WHERE email = ?').get(debussyEmail);
  console.log('  ✓ 创建用户: 德彪西');
} else {
  console.log('  ✓ 用户已存在: 德彪西');
}

const userId = debussyUser.id;

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

  // sprinkle some play/like counts
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

// ─── 3. Obras-primas de Debussy ───

// ===== Piano Solo =====
dedupInsert(
  'Clair de Lune (月光)',
  'Suite Bergamasque 第三乐章，德彪西最著名的钢琴曲。月光洒落，如梦如幻。🌙',
  50, 'Db', 'major',
  makeTrack('piano', [61, 66, 69, 73, 78, 73, 69, 66, 61, 57, 54, 49], 0.6, 0.3),
  5.5, '#2C3E7B'
);

dedupInsert(
  'Arabesque No. 1 (第一号阿拉贝斯克)',
  'Deux Arabesques 第一首。流畅优美的旋律线条，如藤蔓般缠绕攀升。',
  72, 'C', 'major',
  makeTrack('piano', [60, 62, 64, 67, 72, 76, 79, 76, 72, 67, 64, 62], 0.4, 0.2),
  4.0, '#6AB04C'
);

dedupInsert(
  'Arabesque No. 2 (第二号阿拉贝斯克)',
  'Deux Arabesques 第二首。更为活泼灵动，带有民间舞曲风格。',
  96, 'G', 'major',
  makeTrack('piano', [55, 59, 62, 67, 71, 74, 79, 74, 71, 67, 62, 59], 0.35, 0.15),
  3.5, '#E8A317'
);

dedupInsert(
  'Rêverie (梦)',
  '1880年创作的钢琴小品。温柔朦胧的和声，仿佛半梦半醒之间的遐想。',
  60, 'F', 'major',
  makeChordTrack('piano', [[53, 57, 60], [52, 55, 59], [50, 54, 57], [48, 52, 55]], 2.5),
  10.0, '#9B59B6'
);

dedupInsert(
  'Suite Bergamasque — Prélude (贝加马斯克组曲 — 前奏曲)',
  'Suite Bergamasque 第一乐章。节奏鲜明，充满活力的开场。',
  100, 'G', 'major',
  makeTrack('piano', [67, 72, 76, 79, 84, 79, 76, 72, 67, 64, 60], 0.3, 0.2),
  3.5, '#2980B9'
);

dedupInsert(
  'Suite Bergamasque — Menuet (贝加马斯克组曲 — 小步舞曲)',
  'Suite Bergamasque 第二乐章。优雅古典的舞曲形式，带着德彪西特有的色彩。',
  80, 'B', 'major',
  makeTrack('piano', [59, 63, 66, 71, 75, 78, 75, 71, 66, 63, 59], 0.4, 0.2),
  4.0, '#27AE60'
);

dedupInsert(
  'Suite Bergamasque — Passepied (贝加马斯克组曲 — 帕斯皮耶)',
  'Suite Bergamasque 终曲。轻快的布列塔尼舞曲节奏，急促而灿烂。',
  120, 'F', 'major',
  makeTrack('piano', [53, 57, 60, 65, 69, 72, 77, 72, 69, 65, 60, 57], 0.25, 0.15),
  3.0, '#E74C3C'
);

dedupInsert(
  'Pagodes (塔)',
  'Estampes (版画) 第一首。受爪哇甘美兰音乐启发，五声音阶营造东方意境。🏯',
  66, 'F', 'major',
  makeChordTrack('piano', [[53, 57, 60, 64], [51, 55, 58, 62], [48, 52, 55, 60], [53, 56, 60, 63]], 2.0),
  6.5, '#C0392B'
);

dedupInsert(
  'La soirée dans Grenade (格拉纳达的黄昏)',
  'Estampes (版画) 第二首。哈巴涅拉节奏下的西班牙风情。💃',
  88, 'D', 'major',
  makeTrack('piano', [62, 66, 69, 73, 66, 69, 73, 78, 73, 69, 66, 62], 0.4, 0.2),
  4.5, '#D35400'
);

dedupInsert(
  'Jardins sous la pluie (雨中花园)',
  'Estampes (版画) 第三首。雨滴在花园中跳跃，法国童谣旋律穿插其中。🌧️',
  120, 'E', 'minor',
  makeTrack('piano', [64, 67, 72, 76, 71, 67, 64, 60, 56, 60, 64, 67], 0.2, 0.1),
  3.5, '#3498DB'
);

dedupInsert(
  'L\'Isle joyeuse (快乐岛)',
  '受华托油画《舟发西苔岛》启发。欢快的庆典，灿烂的技巧性作品。🎉',
  132, 'A', 'major',
  makeTrack('piano', [57, 61, 64, 69, 73, 76, 81, 76, 73, 69, 64, 61], 0.3, 0.1),
  4.0, '#F39C12'
);

dedupInsert(
  'Masques (假面)',
  '1904年创作。带有舞曲节奏的神秘气氛，如面具舞会般变幻莫测。🎭',
  100, 'B', 'major',
  makeTrack('piano', [59, 63, 66, 71, 74, 78, 74, 71, 66, 63, 59, 54], 0.35, 0.15),
  3.5, '#8E44AD'
);

dedupInsert(
  'Pour le piano — Prélude (为钢琴而作 — 前奏曲)',
  'Pour le piano 第一乐章。充满活力的托卡塔风格，辉煌的开场。',
  112, 'C', 'major',
  makeTrack('piano', [60, 64, 67, 72, 76, 79, 84, 79, 76, 72, 67, 64], 0.25, 0.15),
  3.0, '#1ABC9C'
);

dedupInsert(
  'Pour le piano — Sarabande (为钢琴而作 — 萨拉班德)',
  'Pour le piano 第二乐章。庄严缓慢的舞曲，厚重丰满的和声。',
  40, 'E', 'major',
  makeChordTrack('piano', [[52, 56, 59, 64], [54, 57, 61, 66], [51, 55, 58, 63], [49, 53, 56, 61]], 3.0),
  10.0, '#2ECC71'
);

dedupInsert(
  'Pour le piano — Toccata (为钢琴而作 — 托卡塔)',
  'Pour le piano 终曲。急速奔腾的音流，辉煌的炫技之作。🏃',
  144, 'C', 'major',
  makeTrack('piano', [60, 64, 67, 72, 76, 79, 84, 88, 84, 79, 76, 72], 0.15, 0.1),
  2.5, '#16A085'
);

// ===== Orchestral Works =====
dedupInsert(
  'Prélude à l\'après-midi d\'un faune (牧神午后前奏曲)',
  '德彪西最具革命性的作品。长笛独奏开启梦幻般的午后，现代音乐的起点。🌿',
  60, 'E', 'major',
  makeTrack('flute', [64, 68, 71, 76, 71, 68, 64, 61, 68, 64, 61, 56], 0.6, 0.4),
  8.0, '#7DCEA0'
);

dedupInsert(
  'La Mer — De l\'aube à midi sur la mer (海 — 从黎明到正午的海)',
  'La Mer (海) 第一乐章。夜色退去，海面从幽暗到金光万丈的壮丽景象。🌅',
  72, 'C', 'major',
  makeTrack('harp', [48, 52, 55, 60, 64, 67, 72, 76, 72, 67, 64, 60], 0.5, 0.3),
  6.0, '#1A5276'
);

dedupInsert(
  'La Mer — Jeux de vagues (海 — 波浪的游戏)',
  'La Mer (海) 第二乐章。浪花飞溅，光影交错，波光粼粼。🌊',
  100, 'C', 'major',
  makeTrack('violin', [69, 73, 76, 81, 76, 73, 69, 64, 60, 64, 69, 73], 0.3, 0.2),
  4.0, '#2E86C1'
);

dedupInsert(
  'La Mer — Dialogue du vent et de la mer (海 — 风与海的对话)',
  'La Mer (海) 终曲。狂风与巨浪的激烈对话，磅礴收束。🌪️',
  120, 'C', 'minor',
  makeChordTrack('orchestra', [[56, 60, 63, 67], [51, 55, 58, 63], [48, 51, 56, 60], [44, 48, 51, 56]], 1.5),
  6.0, '#0E6251'
);

dedupInsert(
  'Nocturnes — Nuages (夜曲 — 云)',
  'Nocturnes (夜曲) 第一乐章。缓慢移动的云层，忧郁而静谧的灰色天空。☁️',
  52, 'B', 'minor',
  makeChordTrack('strings', [[47, 50, 54, 59], [45, 49, 52, 57], [42, 46, 49, 54], [47, 51, 54, 58]], 3.0),
  10.0, '#5D6D7E'
);

dedupInsert(
  'Nocturnes — Fêtes (夜曲 — 节日)',
  'Nocturnes (夜曲) 第二乐章。节日夜晚的狂欢，管弦乐色彩斑斓。🎆',
  132, 'A', 'major',
  makeTrack('trumpet', [57, 61, 64, 69, 73, 76, 81, 76, 73, 69, 64, 61], 0.2, 0.15),
  3.5, '#E67E22'
);

dedupInsert(
  'Nocturnes — Sirènes (夜曲 — 海妖)',
  'Nocturnes (夜曲) 第三乐章。女声合唱如海妖歌声，神秘而迷人。🧜‍♀️',
  66, 'C', 'major',
  makeTrack('voice', [60, 64, 67, 72, 76, 72, 67, 64, 60, 55, 60, 64], 0.5, 0.3),
  6.0, '#1F618D'
);

// ===== Chamber Music =====
dedupInsert(
  'String Quartet in G minor, Op. 10 (G小调弦乐四重奏)',
  '1893年创作的唯一一首弦乐四重奏。循环结构，充满异国情调和灵动节奏。',
  80, 'G', 'minor',
  makeTrack('violin', [55, 59, 62, 67, 71, 74, 79, 74, 71, 67, 62, 59], 0.4, 0.2),
  4.5, '#7B241C'
);

dedupInsert(
  'Syrinx (绪任克斯)',
  '长笛独奏作品。希腊神话中潘神与绪任克斯的故事，孤独而优美。🌾',
  56, 'D', 'minor',
  makeTrack('flute', [62, 66, 69, 74, 69, 66, 62, 57, 54, 57, 62, 66], 0.5, 0.3),
  5.0, '#D4AC0D'
);

dedupInsert(
  'Sonata for Cello and Piano (大提琴与钢琴奏鸣曲)',
  '晚期三首奏鸣曲之一。内省而充满张力，德彪西最后的心声。',
  72, 'D', 'minor',
  makeTrack('cello', [50, 54, 57, 62, 57, 54, 50, 45, 42, 45, 50, 54], 0.45, 0.2),
  4.0, '#A93226'
);

dedupInsert(
  'Sonata for Flute, Viola and Harp (长笛、中提琴与竖琴奏鸣曲)',
  '1915年创作。三件乐器音色完美融合，如印象派画作般细腻。',
  66, 'F', 'major',
  makeTrack('harp', [53, 57, 60, 65, 69, 72, 77, 72, 69, 65, 60, 57], 0.5, 0.25),
  4.5, '#1E8449'
);

dedupInsert(
  'Sonata for Violin and Piano (小提琴与钢琴奏鸣曲)',
  '德彪西最后的作品。轻盈透明，带着几分讽刺与怀旧。🎻',
  84, 'G', 'minor',
  makeTrack('violin', [55, 59, 62, 67, 71, 74, 79, 74, 71, 67, 62, 59], 0.35, 0.2),
  3.5, '#B03A2E'
);

// ===== Songs & Vocal =====
dedupInsert(
  'Beau Soir (美丽的黄昏)',
  '保罗·布尔热诗作谱曲。夕阳西下，河面金光，对美好的短暂叹息。🌆',
  60, 'E', 'major',
  makeTrack('voice', [64, 68, 71, 76, 71, 68, 64, 61, 57, 61, 64, 68], 0.5, 0.3),
  5.0, '#E59866'
);

dedupInsert(
  'Mandoline (曼陀林)',
  '魏尔伦诗作谱曲。轻盈摇曳的沙龙小景，如拨弦乐器般清脆。',
  100, 'A', 'major',
  makeTrack('piano', [57, 61, 64, 69, 73, 76, 73, 69, 64, 61, 57, 52], 0.25, 0.2),
  3.0, '#F4D03F'
);

dedupInsert(
  'C\'est l\'extase (心醉神迷)',
  'Ariettes oubliées (被遗忘的咏叹调) 第一首。魏尔伦诗，描绘慵懒沉醉的意境。',
  54, 'B', 'major',
  makeTrack('voice', [59, 63, 66, 71, 75, 78, 75, 71, 66, 63, 59, 54], 0.6, 0.3),
  5.0, '#76448A'
);

dedupInsert(
  'Il pleure dans mon coeur (我心哀泣)',
  'Ariettes oubliées (被遗忘的咏叹调) 第二首。雨丝与心泪交织的忧郁。💧',
  48, 'C', 'minor',
  makeTrack('piano', [60, 63, 67, 60, 63, 67, 60, 55, 60, 63, 67, 72], 0.5, 0.4),
  5.0, '#5B2C6F'
);

// ===== Ballet & Stage =====
dedupInsert(
  'Jeux (游戏)',
  '芭蕾舞剧音乐。夜晚花园中，网球、月光与暧昧的三人舞。🎾',
  116, 'C', 'major',
  makeTrack('oboe', [60, 64, 67, 72, 76, 79, 76, 72, 67, 64, 60, 55], 0.3, 0.2),
  4.0, '#515A5A'
);

dedupInsert(
  'Khamma (卡玛)',
  '芭蕾舞剧。埃及少女卡玛的传说，东方色彩浓郁。🏛️',
  88, 'D', 'minor',
  makeChordTrack('orchestra', [[50, 54, 57, 62], [47, 51, 54, 59], [45, 49, 52, 57], [42, 46, 49, 54]], 2.0),
  6.0, '#D68910'
);

// ===== Additional Piano Works =====
dedupInsert(
  'La plus que lente (更慢些 — 圆舞曲)',
  '1910年创作。沙龙味十足的慵懒圆舞曲，"比慢更慢"。💃',
  76, 'G', 'major',
  makeTrack('piano', [55, 59, 62, 67, 71, 74, 71, 67, 62, 59, 55, 50], 0.45, 0.3),
  4.5, '#85C1E9'
);

dedupInsert(
  'Hommage à Haydn (致敬海顿)',
  '1909年为海顿逝世百年纪念而作。精巧的动机发展，BACH式音名游戏。',
  72, 'G', 'major',
  makeTrack('piano', [55, 59, 62, 67, 71, 67, 62, 59, 55, 52, 48, 55], 0.4, 0.2),
  3.5, '#AAB7B8'
);

dedupInsert(
  'Berceuse héroïque (英雄摇篮曲)',
  '1914年为比利时国王阿尔贝一世而作。战争时期的英雄挽歌。🕊️',
  44, 'E', 'minor',
  makeChordTrack('piano', [[52, 56, 59, 64], [50, 54, 57, 62], [49, 52, 56, 60], [47, 51, 54, 59]], 3.0),
  9.0, '#717D7E'
);

dedupInsert(
  'Danse (Tarentelle styrienne) (舞曲 — 斯蒂利亚塔兰泰拉)',
  '1890年创作。热烈奔放的意大利民间舞曲节奏。💫',
  132, 'D', 'major',
  makeTrack('piano', [62, 66, 69, 74, 78, 81, 78, 74, 69, 66, 62, 57], 0.2, 0.1),
  3.0, '#F1C40F'
);

dedupInsert(
  'Valse romantique (浪漫圆舞曲)',
  '1890年创作。沙龙圆舞曲，略带肖邦风格的优雅伤感。',
  90, 'F', 'minor',
  makeTrack('piano', [53, 57, 60, 65, 69, 72, 69, 65, 60, 57, 53, 48], 0.4, 0.25),
  3.5, '#AF7AC5'
);

dedupInsert(
  'D\'un cahier d\'esquisses (来自草图本)',
  '1903年创作。如随笔般自由流动的音画。',
  68, 'E', 'major',
  makeTrack('piano', [64, 68, 71, 76, 71, 68, 64, 60, 56, 60, 64, 68], 0.45, 0.3),
  4.0, '#FAD7A0'
);

dedupInsert(
  'Six épigraphes antiques (六首古代墓志铭)',
  '1914年创作的四手联弹作品。古希腊风情，神秘而典雅。🏛️',
  70, 'C', 'major',
  makeChordTrack('piano', [[48, 52, 55, 60], [50, 54, 57, 62], [47, 51, 54, 59], [45, 49, 52, 57]], 2.5),
  8.0, '#7E5109'
);

dedupInsert(
  'En blanc et noir (白与黑)',
  '1915年创作的双钢琴作品。战争阴影下的三首小品，黑白琴键的对话。⚫⚪',
  96, 'C', 'major',
  makeTrack('piano', [60, 64, 67, 72, 76, 79, 84, 79, 76, 72, 67, 64], 0.3, 0.2),
  4.0, '#17202A'
);

dedupInsert(
  'Préludes Book 1 — No. 8: La fille aux cheveux de lin (亚麻色头发的少女)',
  '前奏曲第一集第八首。清新温柔的肖像画，德彪西最动人的旋律之一。👩',
  60, 'G', 'major',
  makeTrack('piano', [55, 59, 62, 67, 71, 74, 71, 67, 62, 59, 55, 50], 0.5, 0.3),
  5.0, '#F0B27A'
);

dedupInsert(
  'Préludes Book 1 — No. 10: La cathédrale engloutie (沉没的大教堂)',
  '前奏曲第一集第十首。古老教堂从海底升起又沉没的传奇。⛪🌊',
  44, 'C', 'major',
  makeChordTrack('piano', [[48, 52, 55, 60, 64], [43, 47, 50, 55, 59], [40, 44, 48, 52, 55], [36, 40, 43, 48, 52]], 3.0),
  10.0, '#5D6D7E'
);

dedupInsert(
  'Préludes Book 2 — No. 6: General Lavine — eccentric (拉文将军 — 怪人)',
  '前奏曲第二集第六首。美国杂耍演员的音乐肖像，活泼幽默。🤡',
  120, 'D', 'major',
  makeTrack('piano', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 62, 66], 0.2, 0.15),
  2.5, '#E74C3C'
);

dedupInsert(
  'Préludes Book 2 — No. 12: Feux d\'artifice (焰火)',
  '前奏曲第二集第十二首。绚丽烟花与《马赛曲》片段的交织。🎆',
  144, 'F', 'major',
  makeTrack('piano', [53, 57, 60, 65, 69, 72, 77, 72, 69, 65, 60, 57], 0.15, 0.1),
  2.0, '#D35400'
);

dedupInsert(
  'Images Book 1 — Reflets dans l\'eau (水中倒影)',
  '意象集第一集第一首。水面光影的瞬息变幻，印象派钢琴的巅峰。💧',
  56, 'D', 'major',
  makeTrack('piano', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 54, 62], 0.5, 0.3),
  5.5, '#2471A3'
);

dedupInsert(
  'Images Book 2 — Cloches à travers les feuilles (林间钟声)',
  '意象集第二集第一首。穿过树叶的钟声，光影斑驳的森林。🔔🌳',
  60, 'C', 'major',
  makeChordTrack('piano', [[48, 52, 55, 60, 64, 67], [50, 54, 57, 62, 66, 69], [45, 49, 52, 57, 61, 64], [53, 57, 60, 65, 69, 72]], 2.5),
  8.0, '#1E8449'
);

// ===== Études =====
dedupInsert(
  'Étude No. 11 — Pour les arpèges composés (练习曲第11号 — 复合琶音)',
  '十二首练习曲之十一。晚期杰作，琶音织体的百科全书。📖',
  108, 'A', 'major',
  makeTrack('piano', [57, 61, 64, 69, 73, 76, 81, 76, 73, 69, 64, 61], 0.25, 0.15),
  3.0, '#5B2C6F'
);

// ===== Petite Suite =====
dedupInsert(
  'Petite Suite — En bateau (小组曲 — 泛舟)',
  '四手联弹小组曲第一首。小舟在湖面悠然飘荡。🚣',
  66, 'G', 'major',
  makeTrack('piano', [55, 59, 62, 67, 71, 74, 71, 67, 62, 59, 55, 50], 0.5, 0.25),
  4.0, '#76D7C4'
);

dedupInsert(
  'Petite Suite — Cortège (小组曲 — 行列)',
  '四手联弹小组曲第二首。行进中的队列，庄重而多彩。',
  88, 'D', 'major',
  makeTrack('piano', [62, 66, 69, 74, 78, 74, 69, 66, 62, 57, 53, 62], 0.3, 0.2),
  3.5, '#5DADE2'
);

// ===== Sacred & Choral =====
dedupInsert(
  'La Damoiselle élue (被选中的少女)',
  '根据罗塞蒂诗作的女声合唱与乐队作品。天堂中的新娘，神圣而哀婉。👼',
  56, 'E', 'major',
  makeTrack('voice', [64, 68, 71, 76, 71, 68, 64, 60, 56, 60, 64, 68], 0.5, 0.3),
  5.5, '#AED6F1'
);

// ─── 4. Sumário ───
const insertCount = db.prepare(
  'SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?'
).get(userId);
console.log(`\n📊 德彪西作品入库完成！`);
console.log(`   总计作品: ${insertCount.cnt}`);
console.log(`   测试账号: debussy@music.square / clairdelune`);
console.log(`   🎧 打开 API 欣赏: http://localhost:3000/api/compositions?userId=${userId}`);
