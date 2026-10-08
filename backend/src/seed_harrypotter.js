const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('⚡🦉 正在导入哈利波特全系列原声音乐...\n');

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
  var major = [0, 2, 4, 5, 7, 9, 11];
  return steps.map(function(s) { return root + major[s % 7] + (Math.floor(s / 7) * 12); });
}

var email = 'harrypotter@music.square';
var user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
if (!user) {
  var id = uuidv4();
  var hash = bcrypt.hashSync('hedwig', 10);
  db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
    .run(id, '哈利波特 Harry Potter', email, hash,
      'Harry Potter (2001–2011) — John Williams, Patrick Doyle, Nicholas Hooper & Alexandre Desplat 的魔法音乐世界 ⚡🦉');
  user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  console.log('  ✓ 创建用户: 哈利波特 Harry Potter');
} else {
  console.log('  ✓ 用户已存在: 哈利波特 Harry Potter');
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
    .run(Math.floor(Math.random()*1500+600), Math.floor(Math.random()*400+100), Math.floor(Math.random()*50+15), id);
  console.log('  ✓ ' + title);
  totalNew++;
  return id;
}

// HP1 Philosophers Stone — John Williams
ins("Hedwig's Theme — (海德薇主题曲)",
  'HP1~8 全系列主题。钢片琴响起，猫头鹰送来霍格沃茨录取通知书。🦉✨📜',
  72, 'E',
  makeTrack('celesta', diatonic(76,[0,2,4,5,7,9,7,5,4,2,4,5,7,5,4,2,0,2,4,5]), 0.3, 0.15),
  5.0, '#2C1B4D');

ins("Harry's Wondrous World (哈利的奇妙世界)",
  'HP1 哈利第一次看到对角巷和霍格沃茨。管弦乐奏出纯真的惊奇。🏰🌟',
  88, 'C',
  makeTrack('orchestra', diatonic(72,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9]), 0.3, 0.15),
  5.0, '#6C3483');

ins('Leaving Hogwarts (离开霍格沃茨)',
  'HP1 片尾。学年结束，哈利坐上霍格沃茨特快。温暖的告别。🚂🍂',
  60, 'G',
  makeChordTrack('strings', [[55,59,62,67],[53,57,60,65],[50,55,59,62],[55,59,62,67]], 2.5),
  4.5, '#8E44AD');

ins('The Quidditch Match (魁地奇比赛)',
  'HP1 哈利的第一场魁地奇。飞天扫帚与金色飞贼的管弦乐狂想。🧹🏟️',
  144, 'C',
  makeTrack('brass', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7,5]), 0.15, 0.1),
  4.0, '#C0392B');

ins('Christmas at Hogwarts (霍格沃茨的圣诞节)',
  'HP1 圣诞节的霍格沃茨。隐形衣、厄里斯魔镜里的父母。❄️🎄',
  72, 'D',
  makeTrack('celesta', diatonic(74,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2]), 0.4, 0.25),
  3.5, '#87CEEB');

// HP2 Chamber of Secrets — John Williams
ins('Fawkes the Phoenix (凤凰福克斯)',
  'HP2 福克斯主题。凤凰的眼泪治愈蛇怪的毒伤。浴火重生。🔥🦅',
  60, 'F',
  makeTrack('harp', diatonic(65,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.5, 0.3),
  4.5, '#E74C3C');

ins('Dobby the House Elf (家养小精灵多比)',
  'HP2 "Harry Potter must not go back to Hogwarts!" 多比的主题。🧦',
  76, 'C',
  makeTrack('woodwind', diatonic(72,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2,4,5]), 0.35, 0.2),
  3.5, '#8B4513');

ins('The Chamber of Secrets (密室)',
  'HP2 哈利大战蛇怪。管风琴与合唱营造阴森的地下圣殿。🐍⚔️',
  80, 'A',
  makeChordTrack('organ', [[45,49,53,57],[43,47,51,55],[40,44,48,52],[45,49,53,57]], 2.5),
  5.0, '#1C2833');

// HP3 Prisoner of Azkaban — John Williams
ins("Buckbeak's Flight (巴克比克的飞翔)",
  'HP3 哈利骑着鹰头马身有翼兽掠过湖面。John Williams 最自由的旋律。🌊🦅',
  100, 'A',
  makeTrack('orchestra', diatonic(81,[0,2,4,5,7,9,11,12,11,9,7,5,7,9,11,12,14,12,11,9]), 0.2, 0.1),
  4.5, '#2ECC71');

ins('Double Trouble (不祥之兆)',
  'HP3 开学宴会。"Something wicked this way comes." 中世纪风格合唱。🎭🔮',
  88, 'C',
  makeChordTrack('choir', [[48,52,55,60],[50,53,57,62],[48,52,55,60],[45,49,52,57]], 1.5),
  3.0, '#4A235A');

ins('Mischief Managed (恶作剧完毕)',
  'HP3 片尾。活点地图、时间转换器、狼人卢平。爵士风的嬉戏终曲。🗺️✨',
  108, 'C',
  makeTrack('jazz band', diatonic(72,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.25, 0.15),
  4.0, '#9B59B6');

// HP4 Goblet of Fire — Patrick Doyle
ins("Hogwarts' Hymn (霍格沃茨颂歌)",
  'HP4 三强争霸赛开幕式。"Hogwarts, Hogwarts, Hoggy Warty Hogwarts..." 🏰🎵',
  60, 'D',
  makeChordTrack('choir', [[50,54,57,62],[48,52,55,60],[50,54,57,62],[45,49,52,57,64]], 3.0),
  4.0, '#D4AC0D');

ins('Potter Waltz (波特圆舞曲)',
  'HP4 圣诞舞会。哈利和帕瓦蒂跳舞。尴尬又美丽。🕺💃',
  80, 'G',
  makeTrack('orchestra', diatonic(79,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.4, 0.2),
  3.5, '#2980B9');

ins('The Death of Cedric (塞德里克之死)',
  'HP4 "Kill the spare." 伏地魔回归。黑暗降临。⚰️🖤',
  48, 'E',
  makeChordTrack('strings', [[52,55,59,64],[50,54,57,62],[48,52,55,60],[45,48,52,55]], 3.5),
  5.5, '#17202A');

// HP5 Order of the Phoenix — Nicholas Hooper
ins('Professor Umbridge (乌姆里奇教授)',
  'HP5 粉红色的噩梦。小提琴的甜蜜与低音大管的残酷。🐱💕',
  96, 'F',
  makeTrack('woodwind', diatonic(65,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2,4,5]), 0.3, 0.2),
  3.0, '#FF69B4');

ins("Dumbledore's Army (邓布利多军)",
  'HP5 有求必应屋里的秘密训练。反抗在音乐中萌芽。⚔️🛡️',
  112, 'C',
  makeTrack('brass', diatonic(72,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]), 0.2, 0.15),
  3.5, '#C0392B');

ins('Fireworks (烟火)',
  'HP5 韦斯莱双子离开霍格沃茨。"Give her hell from us, Peeves!" 🎆🎇',
  120, 'C',
  makeTrack('orchestra', diatonic(84,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11]), 0.2, 0.1),
  3.0, '#F39C12');

// HP6 Half-Blood Prince — Nicholas Hooper
ins("Dumbledore's Farewell (邓布利多的告别)",
  'HP6 邓布利多之死。学生们举起魔杖驱散黑魔标记。🪄😢',
  44, 'E',
  makeChordTrack('strings', [[52,56,59,64],[50,53,57,62],[47,50,54,57],[52,56,59,64]], 4.0),
  6.0, '#1A237E');

ins('Farewell Aragog (告别阿拉戈克)',
  'HP6 海格埋葬阿拉戈克。哈利喝下福灵剂——"Hi!" 🕷️⚱️',
  52, 'A',
  makeTrack('bassoon', diatonic(45,[0,2,0,2,0,2,4,2,0,2,0,2,4,5,4,2,0]), 0.55, 0.35),
  3.0, '#5D6D7E');

ins('The Friends (朋友)',
  'HP6 哈利和金妮的初吻。罗恩和拉文德分手。青春的甜蜜与酸涩。💋🌿',
  76, 'G',
  makeTrack('piano', diatonic(67,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2]), 0.4, 0.25),
  4.0, '#2ECC71');

// HP7-1 Deathly Hallows Pt 1 — Alexandre Desplat
ins('Obliviate (一忘皆空)',
  'HP7-1 开头。赫敏抹去父母的记忆。Desplat 的宿命主题。🪄💧',
  56, 'E',
  makeTrack('violin', diatonic(76,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5,4,2,0]), 0.5, 0.35),
  4.5, '#2C3E50');

ins("Lily's Theme (莉莉的主题曲)",
  'HP7-1 斯内普的记忆中。Always。母爱的牺牲是最古老的魔法。🦌🤍',
  48, 'E',
  makeChordTrack('strings', [[52,56,59,64],[54,57,61,66],[52,56,59,64],[49,53,56,61]], 4.0),
  5.5, '#F5F5DC');

ins('The Tale of the Three Brothers (三兄弟的传说)',
  'HP7-1 死亡圣器的动画。阴影木偶戏配乐。💀📖',
  60, 'C',
  makeTrack('harp', diatonic(72,[0,2,1,0,2,1,0,2,4,2,1,0,2,1,0,2]), 0.5, 0.35),
  3.5, '#1C2833');

// HP7-2 Deathly Hallows Pt 2 — Alexandre Desplat
ins('Statues (石像出动)',
  'HP8 麦格教授召唤石像保卫城堡。"Ive always wanted to use that spell!" 🗿⚔️',
  108, 'C',
  makeTrack('brass', diatonic(72,[0,2,4,5,7,9,11,12,11,9,7,5,4,2,0,2,4,5,7,9,11]), 0.2, 0.1),
  4.0, '#7B241C');

ins('Courtyard Apocalypse (庭院末日)',
  'HP8 霍格沃茨大战。友军倒下，伏地魔大军逼近。⚡🔔',
  96, 'E',
  makeChordTrack('orchestra', [[52,55,59,64],[50,53,57,62],[47,50,54,57],[52,55,59,64]], 2.0),
  5.0, '#922B21');

ins('Severus and Lily (西弗勒斯与莉莉)',
  'HP8 "Look at me..." "You have your mothers eyes." 💚👁️',
  48, 'E',
  makeTrack('piano', diatonic(76,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2,4,5,7,5]), 0.6, 0.4),
  5.0, '#006400');

ins('A New Beginning (新的开始)',
  'HP8 片尾。19年后，九又四分之三站台。"Ready?" "Ready." 🚂✨',
  72, 'C',
  makeTrack('celesta', diatonic(84,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,12,11,9]), 0.35, 0.2),
  4.0, '#D4AC0D');

// Bonus
ins('Voldemort — The Dark Lord (伏地魔主题)',
  'HP1 伏地魔主题。低音管弦的压迫感。"He Who Must Not Be Named." 🐍⚫',
  64, 'A',
  makeChordTrack('brass', [[45,48,51],[43,46,49],[40,43,46],[45,48,51,57]], 3.0),
  4.0, '#0B0B0B');

console.log('\n📊 哈利波特全系列 OST 入库完成！新增作品: ' + totalNew);
var cnt = db.prepare('SELECT COUNT(*) as cnt FROM compositions WHERE user_id = ?').get(uid);
console.log('   HP 总计: ' + cnt.cnt + ' 首');
var tt = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log('   📦 数据库总计: ' + tt.t + ' 部作品');

process.exit(0);
