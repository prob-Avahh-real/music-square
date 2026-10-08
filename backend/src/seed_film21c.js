const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎬🌟 正在导入21世纪经典电影原声音乐全集...\n');

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

function chnScale(root, steps) {
  var pent = [0, 2, 4, 7, 9];
  return steps.map(function(s) { return root + pent[s % 5] + (Math.floor(s / 5) * 12); });
}

var email = 'films21c@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('celluloid', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '21世纪经典电影', email, hash,
      '21st Century Film Classics — 从角斗士到沙丘，新千年的电影音乐圣殿 🎬🎵');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 21世纪经典电影');
} else {
  console.log('  ✓ 用户已存在: 21世纪经典电影');
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
    .run(Math.floor(Math.random()*2500+1000), Math.floor(Math.random()*600+200), Math.floor(Math.random()*80+25), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

// ===== Hans Zimmer =====
ins('Gladiator — Now We Are Free (角斗士·我们自由了)',
  '2000. Hans Zimmer & Lisa Gerrard. 马克西姆斯在麦田中倒下。"Go to them." 🌾⚔️',
  66, 'D',
  makeTrack('voice', diatonic(74,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.45, 0.3),
  4.5, '#D4AC0D');

ins('Gladiator — The Battle (角斗士·大战)',
  '2000. 日耳曼尼亚森林之战。铜管与战鼓重新定义了史诗配乐。⚔️🔥',
  120, 'C',
  makeTrack('brass', diatonic(72,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,9,11,12]), 0.2, 0.1),
  4.0, '#8B0000');

ins('Inception — Time (盗梦空间·时间)',
  '2010. 层层递进的钢琴。"You are waiting for a train..." ⌚😢',
  64, 'E',
  makeChordTrack('piano', [[52,56,59,64],[50,54,57,62],[48,52,55,60],[47,50,54,57]], 3.0),
  5.0, '#1A237E');

ins('Interstellar — No Time for Caution (星际穿越·没时间犹豫)',
  '2014. "It is not possible." "No, it is necessary." 管风琴的宇宙轰鸣。🚀🪐',
  80, 'C',
  makeChordTrack('organ', [[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,58],[48,52,55,60,67]], 2.5),
  6.0, '#0D0D2B');

ins('Interstellar — Cornfield Chase (星际穿越·玉米地追逐)',
  '2014. 库珀追无人机穿越玉米地。探索欲在管风琴中燃烧。🌽✈️',
  96, 'C',
  makeTrack('organ', diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.3, 0.15),
  3.5, '#191970');

ins('The Dark Knight — Why So Serious (黑暗骑士)',
  '2008. 希斯·莱杰的小丑主题。八音盒后是9分钟噪音风暴。🃏🖤',
  88, 'D',
  makeTrack('cello', diatonic(50,[0,1,3,5,6,5,3,1,0,1,3,5,6,8,6,5,3,1]), 0.35, 0.2),
  4.5, '#1C1C1C');

ins('Pirates of the Caribbean — He is a Pirate (加勒比海盗)',
  '2003. Klaus Badelt. 杰克船长的冒险号角。"This is the day you will always remember." 🏴‍☠️⚓',
  120, 'D',
  makeTrack('brass', diatonic(74,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11]), 0.2, 0.1),
  3.5, '#8B4513');

ins('Dune — Pauls Dream (沙丘·保罗之梦)',
  '2021. 人声、风笛与合成器。"I must not fear. Fear is the mind-killer." 🏜️🐛',
  56, 'C',
  makeChordTrack('voices', [[48,52,55,60],[44,48,51,55],[48,52,55,60],[41,44,48,51]], 3.5),
  5.5, '#C19A6B');

ins('Dunkirk — Supermarine (敦刻尔克)',
  '2017. 谢泼德音调。永不停止上升的弦乐，永不抵达的救援。✈️🌊',
  132, 'C',
  makeTrack('strings', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.15, 0.08),
  4.0, '#4682B4');

// ===== Howard Shore =====
ins('The Lord of the Rings — The Fellowship (指环王·护戒使者)',
  '2001. Howard Shore. 夏尔主题，中土世界在交响乐团中苏醒。"Even the smallest person can change the future." 💍🌿',
  72, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,12]), 0.35, 0.2),
  4.5, '#2E8B57');

ins('The Lord of the Rings — The Return of the King (指环王·王者归来)',
  '2003. "My friends, you bow to no one." 阿拉贡加冕。👑🎺',
  60, 'G',
  makeChordTrack('orchestra', [[55,59,62,67],[53,57,60,65],[50,54,57,62],[55,59,62,67]], 3.0),
  5.5, '#DAA520');

// ===== Various =====
ins('Amelie — Comptine dun autre ete (天使爱美丽)',
  '2001. Yann Tiersen. 巴黎蒙马特的钢琴独白。爱美丽把铁盒还给白发老人。🎹🇫🇷',
  72, 'E',
  makeTrack('piano', diatonic(76,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5,4]), 0.35, 0.2),
  3.5, '#50C878');

ins('The Social Network — Hand Covers Bruise (社交网络)',
  '2010. Trent Reznor & Atticus Ross. 扎克伯格敲代码。电子脉冲就是他的心跳。💻⚡',
  76, 'C',
  makeTrack('synth', diatonic(60,[0,2,1,3,2,4,3,5,4,2,1,3,2,4,3,5]), 0.4, 0.25),
  3.5, '#1565C0');

ins('Requiem for a Dream — Lux Aeterna (梦之安魂曲)',
  '2000. Clint Mansell. 史上被重混最多的配乐——任何视频配上它都变成史诗。💉⚫',
  72, 'E',
  makeChordTrack('strings', [[52,56,59,64],[54,57,61,66],[51,55,58,63],[49,53,56,61]], 2.0),
  4.5, '#0B0B0B');

ins('Up — Married Life (飞屋环游记)',
  '2009. Michael Giacchino. 4分钟无对白走完Ellie和Carl的一生。🎈🏠',
  80, 'C',
  makeTrack('piano', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0,2,4,5]), 0.35, 0.2),
  4.0, '#FF6347');

ins('The Grand Budapest Hotel — Mr Moustafa (布达佩斯大饭店)',
  '2014. Alexandre Desplat. 粉红色的欧洲童话。🏨💒',
  88, 'D',
  makeTrack('balalaika', diatonic(74,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5,4]), 0.3, 0.15),
  3.5, '#FF69B4');

ins('Avatar — I See You (阿凡达)',
  '2009. James Horner. 纳威人的灵魂之音。潘多拉星的荧光森林。🌿💙',
  60, 'C',
  makeTrack('voice', chnScale(72,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4]), 0.5, 0.35),
  4.5, '#00CED1');

ins('Mad Max Fury Road — Brothers in Arms (疯狂的麦克斯4)',
  '2015. Junkie XL. 末日战鼓与电吉他。"Witness me!" 🏜️🎸',
  136, 'C',
  makeTrack('electric guitar', diatonic(60,[0,2,3,5,7,8,7,5,3,2,0,2,3,5,7,8,10,8,7]), 0.15, 0.1),
  3.5, '#FF4500');

ins('Moonlight — Littles Theme (月光男孩)',
  '2016. Nicholas Britell. 迈阿密月光下的身份追寻。🌙🏊',
  56, 'C',
  makeTrack('violin', diatonic(72,[0,2,1,3,2,4,3,5,4,2,1,0,2,1,3,2,4,3]), 0.5, 0.35),
  4.0, '#483D8B');

ins('The Revenant — Main Theme (荒野猎人)',
  '2015. 坂本龍一 & Alva Noto. 格拉斯哥荒原的刺骨冰冷。❄️🐻',
  48, 'A',
  makeChordTrack('orchestra', [[45,49,52,57],[48,51,55,60],[43,47,50,55],[45,49,52,57]], 4.0),
  5.5, '#A9CCE3');

ins('Blade Runner 2049 — Mesa (银翼杀手2049)',
  '2017. Zimmer & Wallfisch. "You look lonely." 霓虹沙漠的反乌托邦。🌆🤖',
  64, 'C',
  makeTrack('synth', diatonic(60,[0,2,1,0,2,1,0,2,4,2,1,0,2,1,0,2,4,2,1]), 0.45, 0.3),
  4.5, '#FF8C00');

ins('There Will Be Blood — Open Spaces (血色将至)',
  '2007. Jonny Greenwood. 石油钻井的金属撞击声。丹尼尔·普莱恩维尤的贪婪。🛢️⚫',
  56, 'C',
  makeChordTrack('strings', [[48,52,55],[44,48,51],[41,44,47],[48,52,55,60]], 3.5),
  4.0, '#2F1B14');

ins('Schindlers List — Main Theme (辛德勒的名单)',
  '1993. Williams / Perlman. 六百万人的哀泣困在一把小提琴里。"Whoever saves one life saves the world entire." 🕯️🎻',
  52, 'D',
  makeTrack('violin', diatonic(86,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.6, 0.4),
  5.0, '#1C1C1C');

ins('The Shape of Water — Elisas Theme (水形物语)',
  '2017. Alexandre Desplat. 哑女与鱼人的童话。"If I told you about her, what would I say?" 🌊🐟',
  64, 'C',
  makeTrack('harp', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.5, 0.3),
  4.0, '#20B2AA');

console.log('\n📊 21世纪经典电影 OST 入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   21C Films 总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
