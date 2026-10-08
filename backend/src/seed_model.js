const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎭🇨🇳 正在导入八大样板戏...\n');

// ─── 1. 创建样板戏用户（去重） ───
const modelEmail = 'yangbanxi@music.square';
let modelUser = db.prepare('SELECT * FROM users WHERE email = ?').get(modelEmail);

if (!modelUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('hongdengji', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '革命样板戏', modelEmail, hash,
    '革命现代京剧与芭蕾舞剧 — 一个时代的艺术烙印 🇨🇳🎭');
  modelUser = db.prepare('SELECT * FROM users WHERE email = ?').get(modelEmail);
  console.log('  ✓ 创建用户: 革命样板戏');
} else {
  console.log('  ✓ 用户已存在: 革命样板戏');
}

const userId = modelUser.id;

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

  db.prepare(
    'UPDATE compositions SET play_count = ?, like_count = ?, comment_count = ? WHERE id = ?'
  ).run(
    Math.floor(Math.random() * 800 + 400),
    Math.floor(Math.random() * 250 + 50),
    Math.floor(Math.random() * 30 + 8),
    id
  );

  console.log(`  ✓ ${title}`);
  return id;
}

// 中国五声音阶 (pentatonic)
function chnScale(root, steps) {
  const pent = [0, 2, 4, 7, 9];
  return steps.map(s => root + pent[s % 5] + (Math.floor(s / 5) * 12));
}

// ─── 3. 八大样板戏 ───

// ===== 革命现代京剧 =====
dedupInsert(
  '智取威虎山',
  '八大样板戏之首。杨子荣假扮土匪打入威虎山，智取座山雕。"打虎上山""迎来春色换人间" 永载史册。⛰️🐯',
  120, 'G', 'major',
  makeTrack('jinghu', chnScale(67, [0,2,4,0,2,4,0,2,4,6,4,2,0,2,4,0]), 0.2, 0.1),
  3.0, '#C0392B'
);

dedupInsert(
  '红灯记',
  '李玉和一家三代人的革命传承。"都有一颗红亮的心""临行喝妈一碗酒" 家喻户晓。🏮',
  88, 'D', 'major',
  makeTrack('jinghu', chnScale(62, [0,1,3,0,1,3,0,1,3,5,3,1,0,1,3,0]), 0.3, 0.15),
  3.5, '#E74C3C'
);

dedupInsert(
  '沙家浜',
  '阿庆嫂智斗刁德一、胡传魁。"智斗" 一场三人对唱堪称京剧经典。🏪🦆',
  100, 'E', 'major',
  makeTrack('jinghu', chnScale(64, [0,2,4,0,2,4,0,2,4,6,4,2,0,2,4,6]), 0.25, 0.15),
  3.0, '#D4AC0D'
);

dedupInsert(
  '海港',
  '码头工人方海珍坚守岗位的故事。"一石激起千层浪""毛泽东思想东风传送" 唱段激昂。⚓',
  96, 'C', 'major',
  makeTrack('jinghu', chnScale(60, [0,2,4,0,2,4,5,4,2,0,2,4,5,4,2,0]), 0.3, 0.15),
  3.5, '#1A5276'
);

dedupInsert(
  '奇袭白虎团',
  '中国人民志愿军奇袭南朝鲜白虎团。"打败美帝野心狼" 气势磅礴。⚔️🇨🇳',
  132, 'A', 'major',
  makeTrack('jinghu', chnScale(69, [0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]), 0.2, 0.1),
  2.5, '#7B241C'
);

// ===== 革命现代芭蕾舞剧 =====
dedupInsert(
  '红色娘子军',
  '中国第一部现代革命芭蕾舞剧。海南岛娘子军连的故事。"万泉河水清又清" 经典传唱。💃🔫',
  112, 'F', 'major',
  makeTrack('orchestra', chnScale(53, [0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.25, 0.1),
  3.0, '#C0392B'
);

dedupInsert(
  '白毛女',
  '中国芭蕾舞剧奠基之作。喜儿从人变成"鬼"再变回人的悲喜。"北风吹""扎红头绳"。🌨️👻',
  80, 'G', 'major',
  makeTrack('orchestra', chnScale(67, [0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]), 0.35, 0.2),
  4.5, '#F5B041'
);

// ===== 革命交响音乐 =====
dedupInsert(
  '交响音乐《沙家浜》',
  '用交响乐形式演绎《沙家浜》故事。打破传统京剧与交响乐的界限。🎻🎭',
  96, 'E', 'major',
  makeChordTrack('orchestra', [[52, 56, 59, 64], [50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57, 64]], 2.0),
  6.0, '#5D6D7E'
);

// ===== 后续增补 =====
dedupInsert(
  '杜鹃山',
  '柯湘率领农民自卫军的故事。"家住安源""乱云飞" 唱段苍劲有力。🌺⛰️',
  92, 'E', 'minor',
  makeTrack('jinghu', chnScale(64, [0,1,3,0,1,3,5,3,1,0,1,3,5,6,5,3]), 0.3, 0.15),
  3.5, '#8E44AD'
);

dedupInsert(
  '龙江颂',
  '龙江大队堵江抗旱的集体主义精神。"让青春焕发出革命光芒"。🌊🌾',
  84, 'D', 'major',
  makeTrack('jinghu', chnScale(62, [0,2,4,0,2,4,5,4,2,0,2,4,5,4,2,0]), 0.35, 0.2),
  4.0, '#2980B9'
);

dedupInsert(
  '平原作战',
  '八路军赵勇刚深入敌后平原游击战。"披星戴月下太行"。🌾⚔️',
  116, 'C', 'major',
  makeTrack('jinghu', chnScale(60, [0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2]), 0.25, 0.15),
  3.0, '#27AE60'
);

dedupInsert(
  '磐石湾',
  '海防民兵陆长海保卫祖国海疆的英勇故事。海岛风光与战斗激情兼具。🌊🪨',
  100, 'A', 'major',
  makeTrack('jinghu', chnScale(69, [0,2,4,0,2,4,6,4,2,0,2,4,6,7,6,4]), 0.3, 0.15),
  3.5, '#1B4F72'
);

dedupInsert(
  '钢琴伴唱《红灯记》',
  '殷承宗用钢琴伴奏京剧《红灯记》唱段。中西合璧的里程碑。🎹🎭',
  88, 'D', 'major',
  makeChordTrack('piano', [[50, 54, 57, 62], [48, 52, 55, 60], [45, 49, 52, 57], [43, 47, 50, 55]], 2.0),
  5.0, '#C0392B'
);

// ─── 4. Sumário ───
const insertCount = db.prepare(
  'SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?'
).get(userId);
console.log(`\n📊 样板戏入库完成！`);
console.log(`   总计作品: ${insertCount.cnt}`);
console.log(`   测试账号: yangbanxi@music.square / hongdengji`);
console.log(`   🎧 打开 API 欣赏: http://localhost:3000/api/compositions?userId=${userId}`);
