const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🚀👽 正在导入科幻影视剧配乐OST全集...\n');

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

var email = 'scifi@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('warpdrive', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '科幻影视剧', email, hash,
      'Sci-Fi Soundtracks — 从2001太空漫游到曼达洛人，跨越星系的电影与电视配乐 🚀👽');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 科幻影视剧');
} else {
  console.log('  ✓ 用户已存在: 科幻影视剧');
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
    .run(Math.floor(Math.random()*3000+1200), Math.floor(Math.random()*800+250), Math.floor(Math.random()*100+30), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

// ===== Clássicos do Cinema =====
ins('2001 A Space Odyssey — Also Sprach Zarathustra (2001太空漫游)',
  '1968. Richard Strauss. 太阳从地球背面升起，猿人将骨头抛向天空。科幻电影的原点。🌅🦴',
  80, 'C',
  makeChordTrack('organ', [[48,52,55,60,64],[48,52,55,60,64],[48,52,55,60,64],[41,45,48,53,57]], 2.5),
  3.0, '#1C1C1C');

ins('2001 A Space Odyssey — Blue Danube (2001太空漫游)',
  '1968. Johann Strauss II. 太空船与空间站对接的华尔兹。失重中的优雅。🛰️💃',
  88, 'D',
  makeTrack('orchestra', diatonic(74,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.3, 0.15),
  4.0, '#4682B4');

ins('Star Wars — Main Title (星球大战)',
  '1977. John Williams. 黄色字幕向太空深处卷去。史上最著名的开场。⭐🚀',
  120, 'Bb',
  makeTrack('brass', diatonic(70,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11,12]), 0.2, 0.1),
  5.0, '#FFD700');

ins('Star Wars — The Imperial March (星球大战·帝国进行曲)',
  '1980. 达斯·维达的呼吸声响起前，低音铜管先宣告黑暗的降临。"I am your father." 🖤🎺',
  88, 'G',
  makeTrack('brass', diatonic(55,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,1,3,5,7,5,3]), 0.3, 0.15),
  4.0, '#0B0B0B');

ins('Star Wars — Duel of the Fates (星球大战·命运之战)',
  '1999. 达斯·摩尔双头剑出场。梵文合唱团将星战提升到了歌剧高度。⚔️🔥',
  112, 'E',
  makeChordTrack('choir', [[52,55,59,64],[50,53,57,62],[48,52,55,60],[52,55,59,64,71]], 1.5),
  4.5, '#8B0000');

ins('E.T. — Flying Theme (E.T.外星人)',
  '1982. John Williams. 自行车飞过月亮。管弦乐让观众同时大笑和大哭。🌙🚲',
  96, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,11,12,14,12,11,9,7,5,4,2,0]), 0.25, 0.15),
  4.0, '#4B0082');

ins('Close Encounters — Five Tone Motif (第三类接触)',
  '1977. John Williams. 五个音符——人类与外星文明的第一次对话。Re, Mi, Do, Do, Sol。👽🎵',
  60, 'G',
  makeTrack('synth', [74,76,72,60,79], 0.4, 0.3),
  2.5, '#FF4500');

ins('Blade Runner — Main Titles (银翼杀手)',
  '1982. Vangelis. 2019年11月，洛杉矶。雨、霓虹与合成器的赛博朋克圣经。🌧️🌆',
  72, 'C',
  makeTrack('synth', diatonic(60,[0,2,1,3,2,4,3,5,4,2,1,0,2,1,3,2,4,3,5]), 0.4, 0.25),
  4.5, '#FF1493');

ins('Alien — Main Title (异形)',
  '1979. Jerry Goldsmith. "In space no one can hear you scream." 太空寂静中的恐惧。👽🥚',
  48, 'C',
  makeChordTrack('strings', [[48,52,55],[44,48,51],[40,43,47],[48,52,55,60]], 4.0),
  4.0, '#006400');

ins('The Matrix — Main Title (黑客帝国)',
  '1999. Don Davis. 绿色的数字雨和交响工业金属。"What is the Matrix?" 💊🕶️',
  108, 'C',
  makeTrack('brass', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.25, 0.12),
  3.5, '#00FF00');

ins('Jurassic Park — Main Theme (侏罗纪公园)',
  '1993. John Williams. 格兰特博士第一次看到腕龙。生命找到了出路。🦕🌴',
  72, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11]), 0.3, 0.2),
  5.0, '#228B22');

ins('Back to the Future — Main Theme (回到未来)',
  '1985. Alan Silvestri. 德罗宁加速到88英里。1.21吉瓦！🎸⚡',
  140, 'C',
  makeTrack('brass', diatonic(84,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11]), 0.15, 0.1),
  3.5, '#FF4500');

ins('The Terminator — Main Theme (终结者)',
  '1984. Brad Fiedel. 合成器敲出钢铁心脏的节奏。"I will be back." 🤖💀',
  96, 'C',
  makeTrack('synth', [60,60,60,63,63,63,65,65,65,63,63,63,60,60,60,58,58,58], 0.2, 0.15),
  3.0, '#8B0000');

// ===== Modernos =====
ins('Tron Legacy — The Grid (创·战纪)',
  '2010. Daft Punk. 霓虹蓝色摩托在数字世界里划出光轨。合成器与管弦乐的交融。🏍️💙',
  96, 'C',
  makeTrack('synth', diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.25, 0.15),
  4.0, '#00BFFF');

ins('Sunshine — Adagio in D Minor (太阳浩劫)',
  '2007. John Murphy. 卡帕从地球上看到水星凌日。8分钟的宇宙弥撒。"Kaneda, what do you see?" ☀️🌑',
  48, 'D',
  makeChordTrack('orchestra', [[50,53,57,62],[48,51,55,60],[45,48,52,57],[50,53,57,62,69]], 4.0),
  5.5, '#FF8C00');

ins('Gravity — Shenzou (地心引力)',
  '2013. Steven Price. 瑞恩在神舟号返回舱里用灭火器推进。地球在背景中升起。🌍🚀',
  60, 'C',
  makeTrack('strings', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5,4,2]), 0.4, 0.25),
  6.0, '#2E86C1');

ins('Arrival — On the Nature of Daylight (降临)',
  '2016. Max Richter / Johann Johannsson. 七肢桶的语言是非线性的——时间坍缩成一个圆。👽⌛',
  52, 'D',
  makeChordTrack('strings', [[50,54,57,62],[48,52,55,60],[45,49,53,57],[50,54,57,62]], 4.0),
  5.0, '#D3D3D3');

ins('Ex Machina — Bunsen Burner (机械姬)',
  '2014. Geoff Barrow & Ben Salisbury. 图灵测试配上极简电子脉冲。艾娃在镜子前穿上了人造皮肤。🤖👗',
  72, 'C',
  makeTrack('synth', diatonic(60,[0,2,1,3,2,4,3,2,1,0,2,1,3,2,4,3,2]), 0.35, 0.25),
  4.0, '#9370DB');

ins('Annihilation — The Alien (湮灭)',
  '2018. Barrow & Salisbury. 光棱镜里的曼陀罗。人类DNA在闪光中被拆解重组。"It is not destroying. It is making something new." 🧬✨',
  56, 'C',
  makeTrack('synth', diatonic(60,[0,1,3,2,4,3,5,4,6,5,4,3,2,1,3,2,4,3,5]), 0.45, 0.3),
  5.0, '#FF69B4');

// ===== TV =====
ins('Doctor Who — Theme (神秘博士)',
  '1963/2005. Delia Derbyshire / Murray Gold. 时间漩涡中的合成器尖叫。蓝色电话亭穿越时空。📞🔷',
  96, 'C',
  makeTrack('synth', diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5,4]), 0.2, 0.1),
  3.0, '#0000CD');

ins('Stranger Things — Main Theme (怪奇物语)',
  '2016. Kyle Dixon & Michael Stein. 80年代合成器文艺复兴。颠倒世界里的Will。🚲🔦',
  84, 'C',
  makeTrack('synth', diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.3, 0.15),
  3.0, '#FF0000');

ins('Westworld — Main Theme (西部世界)',
  '2016. Ramin Djawadi. 自动钢琴弹奏着人造意识的觉醒。德洛丽丝打死了那只苍蝇。🤖🎹',
  60, 'C',
  makeTrack('piano', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.5, 0.3),
  3.5, '#B8860B');

ins('The Mandalorian — Main Theme (曼达洛人)',
  '2019. Ludwig Goransson. 低音竖笛与合成鼓点。"This is the way." "I have spoken." 🪖👶',
  88, 'D',
  makeTrack('recorder', diatonic(62,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.3, 0.2),
  3.5, '#8B4513');

ins('Battlestar Galactica — Prelude to War (太空堡垒卡拉狄加)',
  '2004. Bear McCreary. 太鼓与弦乐中的灭族之痛。"So say we all!" 🌌🥁',
  100, 'C',
  makeTrack('taiko drums', diatonic(48,[0,0,0,0,5,0,0,5,0,3,0,0,7,0,0,5,0,0,3,0]), 0.25, 0.2),
  4.0, '#2F4F4F');

ins('The Expanse — Main Theme (苍穹浩瀚)',
  '2015. Clinton Shorter. 太阳系的孤独号角。火星、地球与小行星带的三方冷战。🪐🚀',
  64, 'C',
  makeChordTrack('orchestra', [[48,52,55,60],[44,48,52,55],[41,44,48,52],[48,52,55,60,64]], 3.0),
  4.5, '#191970');

ins('Foundation — Main Theme (基地)',
  '2021. Bear McCreary. 心理史学的数学之美。银河帝国在管风琴中崩塌。"Violence is the last refuge of the incompetent." 🌌📚',
  72, 'C',
  makeChordTrack('organ', [[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,58],[48,52,55,60,67]], 2.5),
  4.5, '#2C1B4D');

console.log('\n📊 科幻影视剧配乐入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   Sci-Fi 总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
