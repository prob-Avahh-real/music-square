const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('☕🎬 正在导入老友记 Friends 全剧集原声音乐...\n');

function makeTrack(inst, pitches, nd, gap) {
  nd = nd || 0.5; gap = gap || 0.25;
  const notes = [];
  let start = 0;
  for (const p of pitches) {
    notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: nd });
    start += nd + gap;
  }
  return [{ instrument: inst, notes }];
}

function makeChordTrack(inst, chords, dur) {
  dur = dur || 2.0;
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
  return steps.map(function(s) { return root + major[s % 7] + (Math.floor(s / 7) * 12); });
}

const email = 'friends@music.square';
let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('centralperk', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '老友记 Friends', email, hash,
      'Friends (1994–2004) — 六人十年，Central Perk 的沙发，纽约的青春 ☕🛋️');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 老友记 Friends');
} else {
  console.log('  ✓ 用户已存在: 老友记 Friends');
}

const uid = user.id;
let totalNew = 0;

function ins(title, desc, bpm, ks, tr, ds, color) {
  const ex = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(title, uid);
  if (ex) {
    console.log('  ∼ 已存在，跳过: ' + title);
    return ex.id;
  }
  const id = uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, uid, title, desc, bpm, ks, 'major', JSON.stringify(tr), ds, color);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?')
    .run(Math.floor(Math.random()*1200+500), Math.floor(Math.random()*300+80), Math.floor(Math.random()*40+10), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

// ===== Tema de Abertura =====
ins("I'll Be There for You — The Rembrandts",
  'S01E01~S10E18 片头曲。全世界最著名的拍手声。👏👏👏👏☕',
  100, 'A',
  makeTrack('guitar', diatonic(81,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.25, 0.15),
  3.0, '#FF6B35');

// ===== Phoebe's Songs =====
ins('Smelly Cat — Phoebe Buffay',
  'S02E06 首唱。"Smelly Cat, Smelly Cat, what are they feeding you?" 菲比最著名的原创曲。🐱🎸',
  88, 'G',
  makeTrack('acoustic guitar', diatonic(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]), 0.35, 0.2),
  2.5, '#C0C0C0');

ins('Sticky Shoes — Phoebe Buffay',
  '菲比人生哲学系列。粘鞋底的声音让人快乐。"Sticky shoes, sticky shoes, always make me smile..." 👟🎸',
  80, 'C',
  makeTrack('acoustic guitar', diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2]), 0.4, 0.25),
  2.0, '#E8D44D');

ins('Two of Them Kissed Last Night — Phoebe Buffay',
  '菲比目击两人接吻后的即兴创作。"There was a girl, she had a friend..." 🎸😏',
  92, 'D',
  makeTrack('acoustic guitar', diatonic(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.3, 0.2),
  2.5, '#DA70D6');

ins('The Cow in the Meadow — Phoebe Buffay',
  '菲比儿童歌曲。田野里的牛对世界很满意。"Oh the cow in the meadow goes moo..." 🐄🎸',
  76, 'C',
  makeTrack('acoustic guitar', diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.45, 0.3),
  2.0, '#98FB98');

ins('Parading Goats — Phoebe Buffay',
  '菲比圣诞节即兴。游行中的山羊。"Parading goats, parading goats..." 🐐🎄',
  84, 'G',
  makeTrack('acoustic guitar', diatonic(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.35, 0.25),
  2.0, '#FFD700');

// ===== Breakups & Drama =====
ins('With or Without You — U2 (Ross & Rachel Breakup)',
  'S03E15~16 罗斯和瑞秋第一次分手。两人隔着一扇门，U2 播放着。"I can\'t live, with or without you..." 💔🚪',
  64, 'D',
  makeChordTrack('guitar', [[50,54,57,62],[48,52,55,60],[45,49,52,57],[43,47,50,55]], 3.0),
  5.0, '#4169E1');

ins('Wicked Game — Chris Isaak (Ross & Rachel Pool Table)',
  'S02E24 罗斯和瑞秋的台球桌之吻。电视史上最性感的慢镜头之一。"I never dreamed that I\'d love somebody like you..." 🎱💋',
  60, 'B',
  makeTrack('guitar', diatonic(59,[0,2,4,2,0,2,4,5,7,5,4,2,0,2,4,2,0]), 0.5, 0.35),
  4.5, '#2F4F4F');

ins('Take a Bow — Madonna (Ross Writes Rachel a Letter)',
  'S04E01 罗斯写了18页的信——正面和反面！"Say goodbye, say goodbye..." 18 pages... FRONT AND BACK! 📝💔',
  72, 'E',
  makeTrack('synth', diatonic(64,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.4, 0.3),
  4.0, '#8B008B');

ins('Angel of the Morning — Juice Newton (Ross & Rachel Morning After)',
  'S03E16 罗斯和瑞秋的清晨。"Just call me angel of the morning, angel..." ☀️🛏️',
  76, 'A',
  makeTrack('voice', diatonic(69,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.4, 0.25),
  3.5, '#FFB6C1');

// ===== Karaoke & Performances =====
ins('Endless Love — Lionel Richie (Phoebe Karaoke)',
  'S03E02 菲比的卡拉OK之夜。感动了所有人。"My love... there\'s only you in my life..." 🎤😢',
  66, 'C',
  makeTrack('voice', diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.45, 0.3),
  4.5, '#FF1493');

ins('Copacabana — Barry Manilow (Rachel Karaoke)',
  'S03E02 瑞秋被菲比推上台。"Her name was Lola, she was a showgirl..." 💃🎤',
  112, 'C',
  makeTrack('voice', diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.25, 0.15),
  3.5, '#00CED1');

ins('Delta Dawn — Tanya Tucker (Rachel Wedding Fail)',
  'S04E24 瑞秋在罗斯婚礼上被邀唱歌。"Delta Dawn what\'s that flower you have on?" 💒😳',
  84, 'D',
  makeTrack('voice', diatonic(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.35, 0.2),
  3.0, '#6A5ACD');

ins('New York State of Mind — Billy Joel (Monica at Pete\'s Lounge)',
  'S07 Monica 弹唱 Billy Joel。"I\'m in a New York state of mind..." 🎹🗽',
  64, 'C',
  makeTrack('piano', diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.5, 0.35),
  4.0, '#FF6347');

// ===== Romances =====
ins('Wonderful Tonight — Eric Clapton (Chandler & Monica Proposal)',
  'S06E24 钱德勒向莫妮卡求婚。满屋蜡烛。"You look wonderful tonight..." 💍🕯️',
  56, 'G',
  makeTrack('guitar', diatonic(67,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2]), 0.5, 0.35),
  4.0, '#FFD700');

ins('The Way You Look Tonight — Frank Sinatra (Chandler & Monica Wedding)',
  'S07E24 钱德勒和莫妮卡婚礼。"Someday, when I\'m awfully low..." 🕺💃',
  80, 'Eb',
  makeTrack('jazz band', diatonic(63,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2]), 0.4, 0.25),
  3.5, '#B8860B');

ins('Everlong — Foo Fighters (Monica & Chandler Honeymoon)',
  'S08 度蜜月闪回。Dave Grohl 的吉他。"Hello, I\'ve waited here for you..." 🎸💕',
  132, 'D',
  makeTrack('electric guitar', diatonic(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.2, 0.1),
  3.5, '#8B0000');

// ===== Comedy Gems =====
ins('Tiny Dancer — Elton John (Phoebe Thinks It\'s About Tony Danza)',
  '菲比以为歌词是 "Hold me closer, Tony Danza"。罗斯崩溃了。🎹😂',
  72, 'C',
  makeTrack('piano', diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]), 0.35, 0.2),
  4.0, '#FF4500');

ins('Space Oddity — David Bowie (Ross vs. Lyrics)',
  '罗斯说歌词是 "Ground Control to Major Tom" 还是 "Major Tong"? 全屋子人尖叫。🚀😂',
  64, 'C',
  makeTrack('synth', diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.5, 0.3),
  4.5, '#4B0082');

ins('My Heart Will Go On — Celine Dion (Phoebe Parody)',
  '菲比知道 Titanic 的真正结局——老 Rose 把项链扔了但还是死了！"Near... far... wherever you are..." 🚢😂',
  68, 'E',
  makeTrack('voice', diatonic(64,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.45, 0.3),
  4.0, '#4682B4');

ins('Don\'t Stand So Close to Me — The Police (Ross & Elizabeth)',
  'S06 罗斯和学生伊丽莎白。歌词过于贴切。"Young teacher, the subject of schoolgirl fantasy..." 🎸📚',
  108, 'D',
  makeTrack('electric guitar', diatonic(62,[0,2,4,2,0,2,4,5,7,5,4,2,0,2,4,2,0]), 0.25, 0.15),
  3.5, '#DC143C');

// ===== Closures =====
ins('What a Wonderful World — Louis Armstrong',
  '多集片尾。六人在空荡荡的公寓合影。"I see trees of green, red roses too..." 🌳🎺',
  58, 'F',
  makeTrack('trumpet', diatonic(65,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2]), 0.55, 0.35),
  3.5, '#20B2AA');

ins('Embryonic Journey — Jefferson Airplane (Series Finale)',
  'S10E17~18 全剧终。六人把钥匙留在厨房台面上，最后一次走出Monica的公寓。🎸😢☕',
  72, 'G',
  makeTrack('acoustic guitar', diatonic(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]), 0.35, 0.2),
  2.5, '#FF8C00');

console.log('\n📊 老友记 Friends OST 入库完成！新增作品: ' + totalNew);
const cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   Friends 总计: ' + cnt.cnt + ' 首');
const tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
