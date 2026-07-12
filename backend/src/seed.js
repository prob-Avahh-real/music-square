const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();

console.log('🌱 Seeding database...');

// Create demo users
const demoUsers = [
  { username: '音乐旅人', email: 'traveler@music.square', bio: '用音符记录旅途中的每一刻感动 🎒', password: '123456' },
  { username: '夜曲诗人', email: 'nocturne@music.square', bio: '深夜最适合写旋律，安静地发光', password: '123456' },
  { username: '节拍小子', email: 'beatboy@music.square', bio: '鼓点就是我的心跳 🥁', password: '123456' },
  { username: '和弦精灵', email: 'chords@music.square', bio: 'C Am F G 四个和弦走天下', password: '123456' },
];

const userIds = [];

for (const u of demoUsers) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
  if (existing) {
    userIds.push(existing.id);
    continue;
  }
  const id = uuidv4();
  const hash = bcrypt.hashSync(u.password, 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)').run(id, u.username, u.email, hash, u.bio);
  userIds.push(id);
  console.log(`  ✓ 用户: ${u.username}`);
}

// Create demo compositions
const demoTracks = [
  // Composition 1: Simple melody
  [
    { instrument: 'piano', notes: [
      { pitch: 60, start: 0, duration: 0.5 }, { pitch: 64, start: 0.5, duration: 0.5 },
      { pitch: 67, start: 1.0, duration: 0.5 }, { pitch: 72, start: 1.5, duration: 1.0 },
      { pitch: 71, start: 2.5, duration: 0.5 }, { pitch: 72, start: 3.0, duration: 1.0 },
    ]},
    { instrument: 'bass', notes: [
      { pitch: 48, start: 0, duration: 1.0 }, { pitch: 48, start: 1.0, duration: 1.0 },
      { pitch: 43, start: 2.0, duration: 1.0 }, { pitch: 48, start: 3.0, duration: 1.0 },
    ]}
  ],
  // Composition 2: Beat
  [
    { instrument: 'drums', notes: [
      { pitch: 36, start: 0, duration: 0.25 }, { pitch: 38, start: 0.5, duration: 0.25 },
      { pitch: 36, start: 1.0, duration: 0.25 }, { pitch: 38, start: 1.5, duration: 0.25 },
      { pitch: 36, start: 2.0, duration: 0.25 }, { pitch: 42, start: 2.5, duration: 0.25 },
      { pitch: 38, start: 3.0, duration: 0.25 }, { pitch: 36, start: 3.5, duration: 0.25 },
    ]},
    { instrument: 'synth', notes: [
      { pitch: 64, start: 0, duration: 2.0 }, { pitch: 67, start: 2.0, duration: 2.0 },
    ]}
  ],
  // Composition 3: Chill
  [
    { instrument: 'guitar', notes: [
      { pitch: 55, start: 0, duration: 1.0 }, { pitch: 59, start: 1.0, duration: 1.0 },
      { pitch: 60, start: 2.0, duration: 2.0 },
      { pitch: 55, start: 4.0, duration: 1.0 }, { pitch: 57, start: 5.0, duration: 1.0 },
      { pitch: 60, start: 6.0, duration: 2.0 },
    ]},
    { instrument: 'pad', notes: [
      { pitch: 48, start: 0, duration: 4.0 }, { pitch: 53, start: 4.0, duration: 4.0 },
    ]}
  ]
];

const demoCompositions = [
  { userId: 0, title: '清晨的阳光', description: '一段简单的钢琴旋律，献给每个醒来的早晨 ☀️', bpm: 90, key: 'C', tracks: 0, duration: 4.0, color: '#F9CA24' },
  { userId: 1, title: '午夜城市', description: '霓虹灯下的节拍', bpm: 128, key: 'Am', tracks: 1, duration: 4.0, color: '#6C5CE7' },
  { userId: 2, title: '林间漫步', description: '安静的木吉他，适合放空', bpm: 75, key: 'G', tracks: 2, duration: 8.0, color: '#00B894' },
  { userId: 3, title: '雨后彩虹', description: '雨停了，彩虹出来了 🌈', bpm: 100, key: 'F', tracks: 0, duration: 4.0, color: '#FD79A8' },
  { userId: 0, title: '星空下', description: '躺在草地上看星星的感觉', bpm: 60, key: 'Dm', tracks: 2, duration: 6.0, color: '#0984E3' },
];

for (const dc of demoCompositions) {
  const existing = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(dc.title, userIds[dc.userId]);
  if (existing) continue;

  const id = uuidv4();
  db.prepare(`
    INSERT INTO compositions (id, user_id, title, description, bpm, key_signature, scale, tracks, duration_secs, cover_color)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(id, userIds[dc.userId], dc.title, dc.description, dc.bpm, dc.key, 'major',
    JSON.stringify(demoTracks[dc.tracks]), dc.duration, dc.color);

  // Random play/like counts
  db.prepare('UPDATE compositions SET play_count = ?, like_count = ?, comment_count = ? WHERE id = ?')
    .run(Math.floor(Math.random() * 200), Math.floor(Math.random() * 50), Math.floor(Math.random() * 10), id);

  console.log(`  ✓ 作品: ${dc.title} by user ${dc.userId}`);
}

// Create some follows
const followPairs = [[0,1],[0,2],[1,0],[1,3],[2,0],[2,1],[3,0],[3,1]];
for (const [follower, following] of followPairs) {
  db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?,?)').run(userIds[follower], userIds[following]);
}

// Create some comments
const demoComments = [
  { compTitle: '清晨的阳光', userId: 1, content: '好好听！让我想起了自己的早晨时光' },
  { compTitle: '清晨的阳光', userId: 2, content: '第三个音要是能加个装饰音就更好了' },
  { compTitle: '午夜城市', userId: 0, content: '这个鼓点太上头了 🔥' },
  { compTitle: '午夜城市', userId: 3, content: '合成器音色选得真好' },
  { compTitle: '林间漫步', userId: 0, content: '听着听着就放松下来了' },
  { compTitle: '雨后彩虹', userId: 1, content: '和弦进行很美' },
];

for (const dc of demoComments) {
  const comp = db.prepare('SELECT id FROM compositions WHERE title = ?').get(dc.compTitle);
  if (!comp) continue;
  db.prepare('INSERT INTO comments (id, composition_id, user_id, content) VALUES (?,?,?,?)')
    .run(uuidv4(), comp.id, userIds[dc.userId], dc.content);
  console.log(`  ✓ 评论: ${dc.content.slice(0, 20)}... on ${dc.compTitle}`);
}

console.log('\n✅ 种子数据创建完成！');
console.log('   测试账号: traveler@music.square / 123456');
process.exit(0);
