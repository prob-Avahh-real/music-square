const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎼🇨🇳 正在导入华人作曲家代表作全集...\n');

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

function ensureUser(email, username, bio, password) {
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)')
      .run(id, username, email, hash, bio);
    console.log(`  ✓ 创建用户: ${username}`);
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }
  return user;
}

let totalNew = 0;

function insertWorks(userId, works) {
  for (const w of works) {
    const existing = db.prepare('SELECT id FROM compositions WHERE title = ? AND user_id = ?').get(w[0], userId);
    if (existing) {
      console.log(`  ∼ 已存在，跳过: ${w[0]}`);
      continue;
    }
    const id = uuidv4();
    db.prepare(`INSERT INTO compositions (id,user_id,title,description,bpm,key_signature,scale,tracks,duration_secs,cover_color) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(id, userId, w[0], w[1], w[2], w[3], 'major', JSON.stringify(w[4]), w[5], w[6]);
    db.prepare('UPDATE compositions SET play_count=?,like_count=?,comment_count=? WHERE id=?')
      .run(Math.floor(Math.random()*700+200), Math.floor(Math.random()*200+30), Math.floor(Math.random()*20+5), id);
    console.log(`  ✓ ${w[0]}`);
    totalNew++;
  }
}

// ─── 1. 冼星海 ───
const xian = ensureUser('xianxinghai@music.square', '冼星海',
  'Xian Xinghai (1905–1945) — 人民音乐家，《黄河大合唱》作曲家 🌊', 'yellowriver');
insertWorks(xian.id, [
  ['黄河大合唱 — 黄河颂 (Ode to the Yellow River)','"我站在高山之巅，望黄河滚滚"。🌊',72,'D',makeTrack('voice',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.4,0.2),4.5,'#D4AC0D'],
  ['黄河大合唱 — 保卫黄河 (Defend the Yellow River)','轮唱经典。"保卫黄河！保卫全中国！"🔥',120,'G',makeTrack('orchestra',chnScale(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.2,0.15),2.5,'#C0392B'],
  ['黄河大合唱 — 黄河怨 (Lament of the Yellow River)','女高音的泣诉，山河破碎的国殇。💔',56,'C',makeTrack('voice',chnScale(60,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.5,0.3),5.0,'#5D6D7E'],
  ['在太行山上 (On the Taihang Mountains)','抗战合唱名作。"我们在太行山上"。⛰️',88,'A',makeTrack('voice',chnScale(69,[0,2,4,5,4,2,0,2,4,5,7,9,7,5,4,2]),0.3,0.2),3.5,'#1A5276'],
]);

// ─── 2. 聂耳 ───
const nie = ensureUser('nieer@music.square', '聂耳',
  'Nie Er (1912–1935) — 国歌作曲者，中国革命音乐先锋 🇨🇳', 'marspioneer');
insertWorks(nie.id, [
  ['义勇军进行曲 (March of the Volunteers)','中华人民共和国国歌。"起来！不愿做奴隶的人们！"🇨🇳🎺',112,'G',makeTrack('trumpet',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.25,0.1),2.5,'#C0392B'],
  ['毕业歌 (Graduation Song)','"同学们！大家起来！担负起天下的兴亡！"🎓',108,'C',makeTrack('voice',chnScale(60,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.3,0.15),3.0,'#2980B9'],
  ['卖报歌 (Newspaper Selling Song)','聂耳为卖报儿童创作的轻快歌曲。📰',104,'C',makeTrack('voice',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2]),0.25,0.15),3.0,'#F1C40F'],
  ['铁蹄下的歌女 (Song Girl Under the Iron Heel)','聂耳最柔美的旋律。🎤',66,'D',makeTrack('voice',chnScale(62,[0,2,3,5,3,2,0,2,3,5,7,5,3,2,0,2]),0.45,0.25),4.5,'#8E44AD'],
]);

// ─── 3. 阿炳 ───
const abing = ensureUser('abing@music.square', '阿炳',
  'A Bing (1893–1950) — 盲人音乐家，二胡绝响传天下 🎻', 'moonreflected');
insertWorks(abing.id, [
  ['二泉映月 (Moon Reflected on Second Spring)','二胡独奏的宇宙悲欢，华人音乐的不朽丰碑。🌙🎻',48,'G',makeTrack('erhu',chnScale(67,[0,1,3,5,6,5,3,1,0,1,3,5,6,8,6,5]),0.6,0.4),7.0,'#212121'],
  ['听松 (Listening to the Pines)','松涛阵阵，岳飞抗金的英雄气概。🌲⚔️',88,'A',makeTrack('erhu',chnScale(69,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.3,0.2),3.5,'#1B5E20'],
  ['寒春风曲 (Cold Spring Wind)','与《二泉映月》同类风格，更为凄厉冷峻。❄️',52,'D',makeTrack('erhu',chnScale(62,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.55,0.35),6.0,'#2C3E50'],
]);

// ─── 4. 梁祝 / 何占豪·陈钢 ───
const lz = ensureUser('liangzhu@music.square', '梁祝',
  'He Zhanhao & Chen Gang — 《梁祝小提琴协奏曲》🦋', 'butterfly');
insertWorks(lz.id, [
  ['梁祝 — 相爱 (Love Theme)','草桥结拜，十八相送，中国最动人的旋律。🦋',72,'G',makeTrack('violin',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.4,0.2),4.5,'#F1948A'],
  ['梁祝 — 抗婚 (Resistance)','英台抗婚，小提琴与大鼓的对抗。⚔️',120,'D',makeChordTrack('orchestra',[[50,54,57,62],[48,52,55,60],[45,49,52,57],[43,47,50,55]],1.5),4.0,'#C0392B'],
  ['梁祝 — 化蝶 (Transformation)','彩虹万里，蝴蝶双飞。🦋🌈',58,'G',makeTrack('violin',chnScale(67,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),0.5,0.3),5.0,'#9B59B6'],
]);

// ─── 5. 陈其钢 ───
const chen = ensureUser('chenqigang@music.square', '陈其钢',
  'Chen Qigang (1951–) — 北京奥运音乐总监，梅西安关门弟子 🎵', 'beijing2008');
insertWorks(chen.id, [
  ['我和你 (You and Me)','2008 北京奥运主题曲。刘欢与莎拉·布莱曼演唱。🏅🌏',72,'C',makeTrack('voice',chnScale(60,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.45,0.25),4.0,'#E74C3C'],
  ['蝶恋花 (Flowers in the Mirror)','京剧韵白与印象派管弦的完美融合。🌸',66,'A',makeChordTrack('orchestra',[[45,49,52,57],[48,52,55,60],[50,54,57,62],[43,47,50,55]],2.5),7.0,'#8E44AD'],
  ['逝去的时光 (The Lost Time)','以大提琴与古曲《阳关三叠》为素材。⏳',60,'C',makeTrack('cello',chnScale(60,[0,2,3,5,6,5,3,2,0,2,3,5,6,5,3,2]),0.5,0.3),5.5,'#5D6D7E'],
]);

// ─── 6. 贺绿汀 ───
const he = ensureUser('heluting@music.square', '贺绿汀',
  'He Luting (1903–1999) — 中国最早使用西方技巧的作曲家 🎹', 'pastoral');
insertWorks(he.id, [
  ['牧童短笛 (Buffalo Boy\'s Flute)','中国钢琴作品的里程碑。🐃🎋',84,'G',makeTrack('piano',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.15),3.5,'#27AE60'],
  ['游击队歌 (Song of the Guerrillas)','"我们都是神枪手"。🎯',116,'C',makeTrack('voice',chnScale(60,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.25,0.15),2.5,'#C0392B'],
  ['嘉陵江上 (On the Jialing River)','流亡者的乡愁。🌊😢',66,'E',makeTrack('voice',chnScale(64,[0,1,3,5,6,5,3,1,0,1,3,5,6,5,3,1]),0.45,0.3),4.5,'#5D6D7E'],
]);

// ─── 7. 马思聪 ───
const ma = ensureUser('masicong@music.square', '马思聪',
  'Ma Sicong (1912–1987) — 中国小提琴音乐之父 🎻', 'homesick');
insertWorks(ma.id, [
  ['思乡曲 (Nostalgia)','马思聪《内蒙组曲》第二乐章，最著名的小提琴独奏曲。🌙',66,'C',makeTrack('violin',chnScale(60,[0,2,3,5,6,5,3,2,0,2,3,5,6,5,3,2]),0.45,0.25),4.5,'#2C3E50'],
  ['西藏音诗 (Tibetan Poems)','高原的神秘与辽阔。🏔️',88,'D',makeTrack('violin',chnScale(62,[0,2,4,5,7,8,7,5,4,2,0,2,4,5,7,8]),0.3,0.2),3.5,'#8E44AD'],
  ['山林之歌 (Song of the Mountains)','中国交响乐早期杰作。🌲🎶',76,'A',makeChordTrack('orchestra',[[45,49,52,57],[48,52,55,60],[50,54,57,62],[43,47,50,55]],2.5),6.0,'#1E8449'],
]);

// ─── 8. 赵季平 ───
const zhao = ensureUser('zhaojiping@music.square', '赵季平',
  'Zhao Jiping (1945–) — 中国影视配乐泰斗 🎬', 'redsorghum');
insertWorks(zhao.id, [
  ['红高粱 — 妹妹你大胆地往前走','姜文的嘶吼，西北汉子的原始生命力。🌾🔥',100,'G',makeTrack('suona',chnScale(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.3,0.15),3.0,'#C0392B'],
  ['霸王别姬 — 主题变奏','程蝶衣的悲剧宿命。🎭😢',66,'C',makeTrack('jinghu',chnScale(60,[0,2,3,5,3,2,0,2,3,5,6,5,3,2,0,2]),0.45,0.3),4.5,'#212F3D'],
  ['水浒传 — 好汉歌','"大河向东流"。🌊⭐',120,'C',makeTrack('voice',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.2,0.15),2.5,'#D4AC0D'],
  ['大红灯笼高高挂 (Raise the Red Lantern)','深宅大院中的压抑与挣扎。🏮',72,'E',makeTrack('orchestra',chnScale(64,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.4,0.25),4.0,'#C0392B'],
  ['乔家大院 — 交响组曲','晋商文化的音乐画卷。🏘️🎻',80,'G',makeTrack('erhu',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.0,'#B8860B'],
]);

// ─── 9. 郭文景 ───
const guo = ensureUser('guowenjing@music.square', '郭文景',
  'Guo Wenjing (1956–) — 巴蜀鬼才，中国当代歌剧先锋 🎭', 'sichuan');
insertWorks(guo.id, [
  ['狂人日记 (Diary of a Madman)','鲁迅小说的现代歌剧演绎。📖🔥',96,'C',makeTrack('voice',chnScale(60,[0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),0.3,0.2),3.5,'#1B1B1B'],
  ['李白 (Li Bai)','诗仙李白在权力与诗意间的挣扎。🍶🎭',76,'D',makeTrack('voice',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.5,'#7D6608'],
  ['愁空山 (Sorrow in the Empty Mountain)','竹笛协奏曲。蜀地山川的苍茫。🎋🌄',66,'G',makeTrack('bamboo flute',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.4,0.3),5.0,'#1E8449'],
]);

// ─── 10. 叶小纲 ───
const ye = ensureUser('yexiaogang@music.square', '叶小纲',
  'Ye Xiaogang (1955–) — 中国当代古典音乐领军人物 🎵', 'chinaisay');
insertWorks(ye.id, [
  ['大地之歌 (Song of the Earth)','唐诗文本的大地颂歌。🏔️📜',72,'C',makeChordTrack('orchestra',[[48,52,55,60],[50,54,57,62],[45,49,52,57],[43,47,50,55]],2.5),6.0,'#1A5276'],
  ['长城 (The Great Wall)','万里长城的沧桑。🧱🇨🇳',88,'C',makeChordTrack('orchestra',[[48,52,55,60,64],[45,49,52,57,62],[43,47,50,55,59],[40,44,48,52,56]],2.0),5.0,'#7B241C'],
  ['西藏之光 (Tibetan Light)','高原的阳光与转经。☀️🙏',68,'G',makeTrack('orchestra',chnScale(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.4,0.25),4.5,'#F39C12'],
]);

// ─── 11. 周龙·陈怡 ───
const zc = ensureUser('zhoulong@music.square', '周龙·陈怡',
  'Zhou Long & Chen Yi — 普利策奖得主与格莱美提名 🏆', 'pulitzer');
insertWorks(zc.id, [
  ['白蛇传 (Madame White Snake) — 周龙','2011 年普利策音乐奖。🐍🏮',84,'D',makeTrack('voice',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.5,'#5B2C6F'],
  ['多耶 (Duo Ye) — 陈怡','侗族大歌的现代交响化。🎵🌾',100,'C',makeTrack('orchestra',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.25,0.15),3.0,'#27AE60'],
  ['中国民间舞曲 (Chinese Folk Dance) — 陈怡','民间舞蹈节奏的管弦乐。💃🥁',120,'D',makeTrack('orchestra',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.2,0.15),2.5,'#E74C3C'],
]);

// ─── 12. 盛宗亮 ───
const sheng = ensureUser('brightsheng@music.square', '盛宗亮',
  'Bright Sheng (1955–) — 歌剧《红楼梦》作曲家 🏯', 'dreampf');
insertWorks(sheng.id, [
  ['歌剧《红楼梦》 (Dream of the Red Chamber)','旧金山歌剧院版。宝玉与黛玉的木石前盟。🏯🌸',76,'C',makeTrack('voice',chnScale(60,[0,2,3,5,6,5,3,2,0,2,3,5,6,5,3,2]),0.4,0.25),4.5,'#E74C3C'],
  ['中国梦 (China Dream)','民间旋律的当代变奏。🇨🇳🎻',80,'G',makeTrack('cello',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.0,'#D4AC0D'],
  ['银河 (The Milky Way)','宇宙的中国式想象。🌌🌟',66,'C',makeChordTrack('orchestra',[[48,52,55,60,64],[50,54,57,62,67],[45,49,52,57,60],[43,47,50,55,59]],2.5),6.0,'#1A237E'],
]);

// ─── 13. 刘天华 ───
const liut = ensureUser('liutianhua@music.square', '刘天华',
  'Liu Tianhua (1895–1932) — 二胡艺术之父 🎻', 'huayue');
insertWorks(liut.id, [
  ['良宵 (Beautiful Night)','除夕即兴之作，二胡最温暖的旋律。🏮🌙',76,'D',makeTrack('erhu',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),3.5,'#F1C40F'],
  ['空山鸟语 (Birds in a Desolate Mountain)','百鸟争鸣的音画。🐦⛰️',108,'C',makeTrack('erhu',chnScale(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),0.25,0.15),3.0,'#2980B9'],
  ['病中吟 (Lament in Illness)','二胡走向独奏的起点。😷',58,'G',makeTrack('erhu',chnScale(67,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.5,0.3),5.0,'#5D6D7E'],
  ['光明行 (March Toward Brightness)','黑暗中的坚定步伐。💡🚶',100,'D',makeTrack('erhu',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.25,0.15),3.0,'#C0392B'],
]);

// ─── 14. 江文也 ───
const jiang = ensureUser('jiangwenye@music.square', '江文也',
  'Jiang Wenye (1910–1983) — 东西方音乐融合先驱 🌉', 'taiwandance');
insertWorks(jiang.id, [
  ['台湾舞曲 (Taiwan Dance)','1936 年柏林奥运获奖。台湾原住民舞蹈。🌺💃',108,'D',makeTrack('orchestra',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.25,0.15),3.0,'#E67E22'],
  ['孔庙大成乐章 (Confucian Temple Rites)','五声音阶的庄严礼乐。🏛️🎵',60,'C',makeChordTrack('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[40,44,48,52]],3.0),7.0,'#7B241C'],
  ['断章小品 (Bagatelles)','中国传统韵味的现代钢琴语汇。🎹',88,'G',makeTrack('piano',chnScale(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.3,0.2),3.5,'#8E44AD'],
]);

// ─── Sumário ───
const allUsers = db.prepare("SELECT u.username, COUNT(c.id) as cnt FROM users u LEFT JOIN compositions c ON u.id=c.user_id WHERE u.email LIKE '%@music.square' GROUP BY u.id ORDER BY cnt DESC").all();
console.log(`\n📊 华人作曲家入库完成！新增作品: ${totalNew}`);
console.log(`\n📋 当前数据库完整总览:`);
allUsers.forEach(r => console.log(`  ${r.username.padEnd(10)} → ${String(r.cnt).padStart(3)} 首`));
const t = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log(`\n  📦 总计: ${t.t} 部作品`);
