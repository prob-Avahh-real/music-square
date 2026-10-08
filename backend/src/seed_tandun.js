const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎼 正在导入谭盾代表作...\n');

const tdEmail = 'tandun@music.square';
let tdUser = db.prepare('SELECT * FROM users WHERE email = ?').get(tdEmail);

if (!tdUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('crouchingtiger', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '谭盾', tdEmail, hash,
    'Tan Dun (1957–) — 奥斯卡与格莱美获奖作曲家，水乐纸乐的自然之声 🌊🎋');
  tdUser = db.prepare('SELECT * FROM users WHERE email = ?').get(tdEmail);
  console.log('  ✓ 创建用户: 谭盾');
} else {
  console.log('  ✓ 用户已存在: 谭盾');
}

const userId = tdUser.id;

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

function chnScale(root, steps) {
  const pent = [0, 2, 4, 7, 9];
  return steps.map(s => root + pent[s % 5] + (Math.floor(s / 5) * 12));
}

function dedupInsert(title, desc, bpm, keySig, scale, tracks, ds, color) {
  const existing = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(title, userId);
  if (existing) { console.log(`  ∼ 已存在，跳过: ${title}`); return existing.id; }
  const id = uuidv4();
  db.prepare(`INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(id, userId, title, desc, bpm, keySig, scale, JSON.stringify(tracks), ds, color);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?').run(Math.floor(Math.random()*900+500),Math.floor(Math.random()*300+60),Math.floor(Math.random()*30+10),id);
  console.log(`  ✓ ${title}`);
  return id;
}

// ─── 谭盾代表作 ───

// 卧虎藏龙
dedupInsert('Crouching Tiger — The Eternal Vow (永恒的誓言)','《卧虎藏龙》主题旋律。大提琴与古筝的时空对话。💫',60,'G','minor',makeTrack('cello',chnScale(67,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.5,0.3),5.5,'#283747');

dedupInsert('Crouching Tiger — A Love Before Time (月光爱人)','马友友大提琴与李玟歌声交织，穿越时空的爱恋。🌙',72,'C','minor',makeTrack('cello',chnScale(60,[0,2,3,5,3,2,0,2,3,5,7,5,3,2,0,2]),0.45,0.25),5.0,'#5B2C6F');

dedupInsert('Crouching Tiger, Hidden Dragon — 卧虎藏龙 (Cello Concerto)','奥斯卡最佳原创配乐。大提琴诉说江湖情缘。🏮🐅',76,'D','minor',makeTrack('cello',chnScale(62,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.4,0.2),4.5,'#1A237E');

// 英雄
dedupInsert('Hero — 英雄 (Violin Concerto)','张艺谋《英雄》配乐改编。天下与残剑的磅礴史诗。🗡️🌄',88,'A','minor',makeTrack('violin',chnScale(69,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.3,0.15),3.5,'#7B241C');

dedupInsert('Hero — Sword Dance (剑舞)','飞雪与残剑的剑舞。古筝与交响乐的交锋。⚔️',120,'D','minor',makeTrack('erhu',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.2,0.1),2.5,'#C0392B');

// 夜宴
dedupInsert('The Banquet — 夜宴 (Piano Concerto)','《夜宴》配乐改编。欲望与权力的宫廷华尔兹。🎭👑',96,'C','minor',makeChordTrack('piano',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[40,44,48,52]],2.0),5.0,'#1B1B1B');

// 武侠三部曲
dedupInsert('Martial Arts Trilogy — 武侠三部曲','三部协奏曲合一的完整套曲。🗡️🎻🎹',80,'C','major',makeChordTrack('orchestra',[[48,52,55,60,64],[50,54,57,62,67],[45,49,52,57,60],[43,47,50,55,59]],2.5),8.0,'#2C3E50');

// 水乐
dedupInsert('Water Concerto — 水乐','水作为乐器——滴水、流水、泼水皆为音符。🌊💧',66,'C','major',makeTrack('water',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.5,0.3),6.0,'#2980B9');

// 纸乐
dedupInsert('Paper Concerto — 纸乐','有机音乐之二。撕纸、揉纸、吹纸化为交响。📜🎵',72,'C','major',makeTrack('paper',chnScale(60,[0,2,4,0,2,4,5,4,2,0,2,4,5,7,5,4]),0.4,0.25),5.5,'#F5F5F5');

// 土乐
dedupInsert('Earth Concerto — 土乐','有机音乐之三。陶土、石头、大地之声。🌍',60,'E','minor',makeChordTrack('orchestra',[[52,55,59],[50,53,57],[48,52,55],[45,48,52]],2.5),6.5,'#5D4037');

// 地图
dedupInsert('The Map — 地图 (Cello, Video & Orchestra)','湘西采风的视听协奏曲。大提琴与苗族民歌的影像对话。🗺️🎬',76,'G','minor',makeTrack('cello',chnScale(67,[0,1,3,5,6,5,3,1,0,1,3,5,6,5,3,1]),0.35,0.2),4.5,'#8E44AD');

// 鬼戏
dedupInsert('Ghost Opera — 鬼戏','弦乐四重奏与琵琶、水、锣的跨文化对话。👻🎭',88,'C','minor',makeTrack('pipa',chnScale(60,[0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),0.3,0.15),3.5,'#4A235A');

// 茶经
dedupInsert('Tea: A Mirror of Soul — 茶经','日本茶道大师、唐朝公主与僧人的跨时空爱恋。🍵🌸',72,'G','major',makeTrack('voice',chnScale(55,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.4,0.25),5.0,'#27AE60');

// 马可波罗
dedupInsert('Marco Polo — 马可·波罗','马可·波罗在丝绸之路上的精神之旅。🐪🏛️',84,'C','minor',makeTrack('voice',chnScale(60,[0,2,4,0,2,4,5,4,2,0,2,4,5,7,5,4]),0.35,0.2),4.5,'#D35400');

// 秦始皇
dedupInsert('The First Emperor — 秦始皇','大都会歌剧院委约作品，多明戈主演。👑🏯',88,'D','minor',makeChordTrack('orchestra',[[50,54,57,62],[48,52,55,60],[45,49,52,57],[43,47,50,55]],2.0),5.5,'#7B241C');

// 牡丹亭
dedupInsert('Peony Pavilion — 牡丹亭 (多媒体歌剧)','水、书法、昆曲与多媒体交织的当代梦境。🌸🖌️',66,'E','major',makeTrack('voice',chnScale(64,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.4,0.3),5.5,'#F1948A');

// 火乐
dedupInsert('Fire Concerto — 火乐','有机音乐系列的燃烧之作。🔥🎶',132,'C','minor',makeTrack('orchestra',chnScale(60,[0,2,3,5,7,8,7,5,3,2,0,2,3,5,7,8]),0.2,0.1),3.0,'#E74C3C');

// 九歌
dedupInsert('Nine Songs — 九歌','屈原《九歌》灵感，前卫实验与前工业中国的声音碰撞。📜🎑',80,'A','minor',makeTrack('voice',chnScale(57,[0,1,3,5,6,5,3,1,0,1,3,5,6,8,6,5]),0.35,0.2),4.0,'#5D6D7E');

// 道极
dedupInsert('On Taoism — 道极','道家哲学与西方前卫音乐的碰撞。☯️',56,'C','minor',makeChordTrack('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[40,44,48,52]],3.0),7.0,'#212121');

// 天·地·人
dedupInsert('Symphony 1997: Heaven Earth Mankind — 天·地·人','为香港回归创作。编钟、童声合唱与管弦交响的史诗。🔔🇭🇰',88,'C','major',makeChordTrack('orchestra',[[48,52,55,60,64],[45,49,52,57,62],[50,54,57,62,66],[43,47,50,55,59]],2.5),7.0,'#C0392B');

// 三个音的交响诗
dedupInsert('Three Notes — 三个音的交响诗','用三个音创作的管弦乐作品。极简主义的东方哲思。🎵',72,'C','major',makeTrack('orchestra',chnScale(60,[0,2,4,0,2,4,0,2,4,0,2,4,5,4,2,0]),0.4,0.25),4.0,'#2980B9');

// 丝绸之路
dedupInsert('Silk Road — 丝绸之路','沙漠驼铃与敦煌壁画的音乐想象。🐫🏜️',80,'D','minor',makeTrack('erhu',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.0,'#B8860B');

// ─── Sumário ───
const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(userId);
console.log(`\n📊 谭盾代表作入库完成！`);
console.log(`   总计作品: ${cnt.cnt}`);
console.log(`   测试账号: tandun@music.square / crouchingtiger`);
console.log(`   🎧 打开 API 欣赏: http://localhost:3000/api/compositions?userId=${userId}`);
