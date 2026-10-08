const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎭🏛️ 正在导入21世纪大型国家剧院LIVE演出曲目全集...\n');

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

var email = 'nationaltheatre@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('curtaincall', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '国家剧院LIVE', email, hash,
      'NT Live, Met Opera, ROH, Bolshoi, NCPA — 21世纪世界剧院直播的黄金时代 🎭🏛️🎥');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 国家剧院LIVE');
} else {
  console.log('  ✓ 用户已存在: 国家剧院LIVE');
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
    .run(Math.floor(Math.random()*1500+600), Math.floor(Math.random()*400+120), Math.floor(Math.random()*50+15), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

// ===== NT Live =====
ins('NT Live — Hamlet (2015) Opening Music',
  'Benedict Cumberbatch / Lyndsey Turner. 哥本哈根城堡中的丹麦王子。"To be, or not to be." 💀🎭',
  56, 'E',
  makeChordTrack('orchestra', [[52,55,59,64],[50,53,57,62],[47,50,54,57],[52,56,59,64]], 3.5),
  4.5, '#2C1810');

ins('NT Live — Frankenstein (2011) Opening',
  'Danny Boyle. Jonny Lee Miller & Benedict Cumberbatch 互换角色。Creature 从羊水中诞生。⚡🧟',
  60, 'C',
  makeTrack('cello', diatonic(48,[0,2,1,3,2,4,3,5,4,2,1,0,2,4,5,7,5,4,2]), 0.5, 0.35),
  5.0, '#004d00');

ins('NT Live — War Horse (战马) Theme',
  '2007/2014. 一战中 Joey 与 Albert 的羁绊。手绘木偶的呼吸感动了全球。🐴🎻',
  72, 'G',
  makeTrack('violin', diatonic(79,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.4, 0.25),
  4.0, '#8B7355');

ins('NT Live — Angels in America (天使在美国) Music',
  '2017. Tony Kushner. 里根时代，天使在布鲁克林降落。"The Great Work begins." 🕊️🌈',
  64, 'C',
  makeTrack('piano', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0,2,4]), 0.45, 0.3),
  5.0, '#9370DB');

ins('NT Live — The Curious Incident (深夜小狗离奇事件) Music',
  '2012. Mark Haddon / Marianne Elliott. 克里斯托弗的逻辑世界——数学在舞台上爆炸成光。🧮✨',
  96, 'C',
  makeTrack('synth', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.25, 0.12),
  4.0, '#FF4500');

ins('NT Live — One Man Two Guvnors (一仆二主) Music',
  '2011. James Corden. 布莱顿海滨的即兴喜剧。海鲜意面从天而降。🎭🍝',
  112, 'C',
  makeTrack('skiffle band', diatonic(72,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4]), 0.25, 0.15),
  3.5, '#FF6347');

ins('NT Live — The Lehman Trilogy (雷曼兄弟三部曲) Music',
  '2018. Stefano Massini / Sam Mendes. 旋转玻璃盒中164年的帝国兴衰。📦🏦',
  60, 'D',
  makeTrack('piano', diatonic(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.5, 0.35),
  5.0, '#1C1C1C');

// ===== RSC =====
ins('RSC Live — King Lear (李尔王) Storm Scene',
  '2016. Ian McKellen. 暴风雨中的疯王。"Blow, winds, and crack your cheeks!" 🌪️👑',
  72, 'D',
  makeChordTrack('orchestra', [[50,54,57,62],[48,52,55,60],[45,49,52,57],[43,47,50,55]], 2.0),
  3.5, '#2F4F4F');

ins('RSC Live — Macbeth (麦克白) Witches Scene',
  '2018. "Double, double toil and trouble." 苏格兰高地的三女巫。🧙‍♀️🔥',
  64, 'E',
  makeTrack('percussion', diatonic(52,[0,0,0,0,5,0,3,0,0,5,0,7,0,5,3,0]), 0.4, 0.3),
  3.0, '#4A0E0E');

// ===== Met Opera Live =====
ins('Met Opera Live — Carmen (卡门) Habanera — Bizet',
  '2010. Elina Garanca. "L\'amour est un oiseau rebelle." 💃🌹',
  72, 'D',
  makeTrack('orchestra', diatonic(74,[0,2,1,0,2,1,0,2,3,5,3,2,0,2,3,5,6,5,3]), 0.4, 0.25),
  4.0, '#FF0000');

ins('Met Opera Live — La Boheme (波西米亚人) Mi chiamano Mimi — Puccini',
  '2008. 巴黎拉丁区的蜡烛。咪咪的手在黑暗中找到了鲁道夫。🕯️❄️',
  54, 'D',
  makeTrack('voice', diatonic(86,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5]), 0.55, 0.35),
  5.0, '#FFB6C1');

ins('Met Opera Live — Madama Butterfly (蝴蝶夫人) Un bel di — Puccini',
  '2009. "Un bel di, vedremo." 巧巧桑等待平克顿归来。🦋🇯🇵',
  48, 'E',
  makeTrack('voice', diatonic(76,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,5]), 0.6, 0.4),
  5.5, '#FF69B4');

ins('Met Opera Live — The Magic Flute (魔笛) Queen of Night — Mozart',
  '2006. Julie Taymor. "Der Holle Rache kocht in meinem Herzen!" F6划破大都会。🌙🔥',
  120, 'F',
  makeTrack('voice', diatonic(96,[0,2,4,5,7,8,7,5,4,2,0,2,4,5,7,8,10,8,7]), 0.2, 0.1),
  3.5, '#2C1B4D');

ins('Met Opera Live — Ring Cycle (指环) Entry of the Gods — Wagner',
  '2010. Robert Lepage 巨型机械装置。彩虹桥升起，诸神步入瓦尔哈拉。🌈🏰',
  72, 'Eb',
  makeChordTrack('orchestra', [[51,55,58,63],[53,56,60,65],[51,55,58,63],[48,52,55,60]], 2.5),
  5.5, '#DAA520');

// ===== Royal Opera House =====
ins('Royal Opera House — The Nutcracker (胡桃夹子) Waltz — Tchaikovsky',
  '2016. 糖果王国的华尔兹。克拉拉的圣诞夜永不结束。🎄🌸',
  112, 'D',
  makeTrack('orchestra', diatonic(86,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.2, 0.15),
  5.5, '#FF69B4');

ins('Royal Opera House — Swan Lake (天鹅湖) Act II Theme — Tchaikovsky',
  '2018. 双簧管说出了奥杰塔的诅咒。月光下的天鹅湖畔。🦢🌙',
  66, 'B',
  makeTrack('oboe', diatonic(83,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,7,5,4]), 0.45, 0.3),
  4.5, '#F5F5DC');

ins('Royal Opera House — Tosca (托斯卡) Vissi d\'arte — Puccini',
  '2011. "我为艺术而生，为爱而生。" 🎤⚔️',
  52, 'E',
  makeTrack('voice', diatonic(76,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.6, 0.4),
  4.5, '#8B0000');

// ===== Bolshoi =====
ins('Bolshoi Ballet — Spartacus (斯巴达克斯) Adagio — Khachaturian',
  '2013. 斯巴达克斯与弗里吉亚的最后双人舞。肉体的圣歌。⚔️🩰',
  56, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,5,4]), 0.5, 0.3),
  5.5, '#B22222');

ins('Bolshoi Ballet — Don Quixote (堂吉诃德) Grand Pas — Minkus',
  '2016. 西班牙广场32个fouettes。基特丽的扇子舞。💃🪭',
  120, 'D',
  makeTrack('orchestra', diatonic(86,[0,2,4,5,7,9,11,9,7,5,4,2,0,2,4,5,7,9,7]), 0.2, 0.1),
  4.0, '#FF4500');

// ===== NCPA 国家大剧院 =====
ins('国家大剧院 — 图兰朵 (Turandot) Nessun dorma — Puccini',
  '2008. 张艺谋执导。"今夜无人入睡。" 紫禁城太庙首演。🇨🇳🏯',
  60, 'G',
  makeTrack('voice', diatonic(79,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,5]), 0.5, 0.3),
  5.0, '#C0392B');

ins('国家大剧院 — 红色娘子军 Ballet (Red Detachment of Women)',
  '2014. "向前进，向前进，战士的责任重。" 💃🔫',
  112, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.25, 0.12),
  4.0, '#C0392B');

// ===== Comédie-Française =====
ins('Comedie-Francaise — Le Misanthrope (愤世嫉俗者) Music',
  '2013. Moliere. 阿尔塞斯特在凡尔赛沙龙的愤怒。🎭💢',
  80, 'C',
  makeTrack('harpsichord', diatonic(72,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.35, 0.2),
  3.5, '#B8860B');

ins('Comedie-Francaise — Cyrano de Bergerac (大鼻子情圣) Music',
  '2016. Edmond Rostand. 月光下为克里斯蒂安念诗。"C\'est un roc!" 🎭🌹',
  66, 'D',
  makeTrack('lute', diatonic(74,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.45, 0.3),
  4.0, '#8B0000');

console.log('\n📊 国家剧院LIVE曲目入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   Theatre LIVE 总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
