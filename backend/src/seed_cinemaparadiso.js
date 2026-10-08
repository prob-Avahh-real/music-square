const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎬📽️ 正在导入天堂电影院 Cinema Paradiso 原声音乐全集...\n');

function makeTrack(inst, pitches, nd, gap) {
  nd = nd || 0.5; gap = gap || 0.25;
  var notes = [];
  var start = 0;
  for (var i = 0; i < pitches.length; i++) {
    notes.push({ pitch: pitches[i], start: Math.round(start * 100) / 100, duration: nd });
    start += nd + gap;
  }
  return [{ instrument: inst, notes: notes }];
}

function makeChordTrack(inst, chords, dur) {
  dur = dur || 2.0;
  var notes = [];
  var start = 0;
  for (var i = 0; i < chords.length; i++) {
    var ch = chords[i];
    for (var j = 0; j < ch.length; j++) {
      notes.push({ pitch: ch[j], start: Math.round(start * 100) / 100, duration: dur });
    }
    start += dur + 0.5;
  }
  return [{ instrument: inst, notes: notes }];
}

function diatonic(root, steps) {
  var major = [0, 2, 4, 5, 7, 9, 11];
  return steps.map(function(s) { return root + major[s % 7] + (Math.floor(s / 7) * 12); });
}

var email = 'cinemaparadiso@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('alfredo', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '天堂电影院', email, hash,
      'Nuovo Cinema Paradiso (1988) — Giuseppe Tornatore 导演，Ennio Morricone 配乐。电影之爱的终极颂歌 🎬📽️');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 天堂电影院');
} else {
  console.log('  ✓ 用户已存在: 天堂电影院');
}

var uid = user.id;
var totalNew = 0;

function ins(title, desc, bpm, ks, tr, ds, color) {
  var ex = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(title, uid);
  if (ex) {
    console.log('  ∼ 已存在，跳过: ' + title);
    return ex.id;
  }
  var id = uuidv4();
  db.prepare('INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, uid, title, desc, bpm, ks, 'major', JSON.stringify(tr), ds, color);
  db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?')
    .run(Math.floor(Math.random()*1800+700), Math.floor(Math.random()*450+130), Math.floor(Math.random()*55+18), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

ins('Cinema Paradiso — Main Theme (天堂电影院主题曲)',
  'Ennio Morricone 最动人的旋律。成年的多多回到小镇，阿尔弗雷多留给他的遗物——一卷接吻的胶片。📽️😢',
  60, 'Bb',
  makeTrack('piano', diatonic(70,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,5,4,2]), 0.5, 0.3),
  4.5, '#F4A460');

ins('Love Theme — Cinema Paradiso (天堂电影院·爱情主题)',
  'Morricone 的儿子 Andrea Morricone 谱写的主题。多多和艾莲娜的青春之恋。💕🎻',
  56, 'G',
  makeTrack('violin', diatonic(79,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5,4]), 0.55, 0.35),
  5.0, '#FFB6C1');

ins('Toto and Alfredo (多多与阿尔弗雷多)',
  '放映室里师徒之间的温情。阿尔弗雷多教多多放电影，两个人的手指叠在一起。🎞️❤️',
  72, 'C',
  makeTrack('piano', diatonic(72,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]), 0.4, 0.25),
  3.5, '#DEB887');

ins('First Youth (年少时光)',
  '多多在教堂里当辅祭，偷偷藏起神父剪掉的接吻镜头。西西里岛的童年。🏛️👦',
  80, 'D',
  makeTrack('clarinet', diatonic(74,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.35, 0.2),
  3.0, '#87CEEB');

ins('Maturity (成长)',
  '多多离开小镇去罗马。阿尔弗雷多在火车站说："别回来，别想我们。别写信。" 🚂👋',
  64, 'E',
  makeTrack('strings', diatonic(76,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]), 0.45, 0.3),
  4.0, '#696969');

ins('Nostalgia (乡愁)',
  '三十年后重返詹卡多。母亲说："我一直没有换锁，怕你回来打不开门。" 🏠💧',
  52, 'A',
  makeTrack('piano', diatonic(69,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2,0]), 0.6, 0.4),
  4.5, '#8B7355');

ins('Projection for Two (两个人的放映)',
  '阿尔弗雷多把放映机转向广场的墙壁。光影在建筑上流动，全镇人的露天电影。🎥🏘️',
  88, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9]), 0.3, 0.15),
  3.5, '#FFD700');

ins('Finale — The Kiss Montage (终曲·接吻蒙太奇)',
  '阿尔弗雷多留给多多的礼物。被神父剪掉的所有接吻镜头拼接成一整卷。"这些是你的。" 🎞️💋',
  66, 'Bb',
  makeChordTrack('strings', [[58,62,65,70],[56,60,63,68],[53,57,60,65],[58,62,65,70]], 3.0),
  5.5, '#B22222');

console.log('\n📊 天堂电影院 OST 入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   Cinema Paradiso 总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
