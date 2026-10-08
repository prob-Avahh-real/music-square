const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎼🇨🇳 正在导入近年华人音乐家代表作全集...\n');

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

function diatonic(root, steps) {
  const major = [0, 2, 4, 5, 7, 9, 11];
  return steps.map(s => root + major[s % 7] + (Math.floor(s / 7) * 12));
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
      .run(Math.floor(Math.random()*600+150), Math.floor(Math.random()*150+25), Math.floor(Math.random()*18+3), id);
    console.log(`  ✓ ${w[0]}`);
    totalNew++;
  }
}

// ─── 1. 朱践耳 ───
const zhu = ensureUser('zhujianer@music.square', '朱践耳',
  'Zhu Jian\'er (1922–2017) — 中国最具国际影响力的交响乐作曲家，十部交响曲的丰碑 🎻🏔️', 'symphony10');
insertWorks(zhu.id, [
  ['第一交响曲 (Symphony No.1)','以文化大革命为背景的悲剧交响曲，1986年获全国交响乐比赛一等奖。⚡',88,'C',makeChordTrack('orchestra',[[48,52,55,60],[45,49,52,57],[43,47,50,55],[40,44,48,52]],2.0),5.0,'#1B1B1B'],
  ['第二交响曲 (Symphony No.2)','被称为"启示录"，以人声与管弦乐表现人类的苦难与救赎。🙏',66,'E',makeTrack('voice',chnScale(64,[0,1,3,5,6,5,3,1,0,1,3,5,6,5,3,1]),0.5,0.3),6.0,'#2C3E50'],
  ['第十交响曲"江雪" (Symphony No.10 "River Snow")','柳宗元《江雪》意境，结合京剧吟唱与管弦乐。❄️🎭',60,'G',makeTrack('voice',chnScale(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.5,0.35),6.5,'#A9CCE3'],
  ['节日序曲 (Festival Overture)','欢腾的中国节日场景，锣鼓喧天。🎉🥁',132,'C',makeTrack('brass',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.2,0.1),3.0,'#E74C3C'],
]);

// ─── 2. 王西麟 ───
const wang = ensureUser('wangxilin@music.square', '王西麟',
  'Wang Xilin (1936–) — 中国最有悲剧力量的交响乐作曲家 🎻⚫', 'tragedy');
insertWorks(wang.id, [
  ['第三交响曲 (Symphony No.3)','"55天"的饥饿与黑暗，用音乐凝固的历史创伤。🌑',56,'C',makeChordTrack('orchestra',[[48,51,55],[44,48,51],[41,44,48],[48,51,55,60]],3.0),8.0,'#1C1C1C'],
  ['钢琴协奏曲 (Piano Concerto)','黄河的另一种表达，沉重的历史记忆与现代技术融合。🎹🌊',80,'C',makeTrack('piano',diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]),0.35,0.2),6.0,'#5D6D7E'],
  ['云南音诗 (Yunnan Tone Poems)','《太行山印象》姊妹篇，西南少数民族的音乐画卷。🌿🏔️',72,'A',makeTrack('orchestra',chnScale(69,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.4,0.25),5.5,'#27AE60'],
  ['晋风 (Shanxi Impressions)','黄土高原的唢呐与交响，泥土中的生命力。🌾🎺',104,'C',makeTrack('suona',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.25,0.15),4.0,'#D35400'],
]);

// ─── 3. 何训田 ───
const hext = ensureUser('hexuntian@music.square', '何训田',
  'He Xuntian (1953–) — 西藏音乐与现代音乐的跨界大师 🏔️🎵', 'sisterdrum');
insertWorks(hext.id, [
  ['阿姐鼓 (Sister Drum)','朱哲琴演唱。一张人皮鼓的传说，西藏灵魂的世界性声音。🪘🏔️',72,'G',makeTrack('voice',chnScale(67,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.5,0.3),5.5,'#8B0000'],
  ['央金玛 (Voices from the Sky)','来自天空的声音。央金玛——妙音天女。☁️🙏',66,'E',makeTrack('voice',chnScale(64,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.45,0.3),5.0,'#4169E1'],
  ['天唱 (Sky Burial)','西藏天葬的声音仪式。生于自然，归于苍穹。🦅',48,'C',makeChordTrack('choir',[[48,52,55,60],[44,48,52,55],[48,52,55,60],[41,44,48,52]],3.5),8.0,'#87CEEB'],
  ['七日谈 (Seven Days)','七天创世的音乐冥想。🎵🌌',60,'D',makeChordTrack('orchestra',[[50,54,57,62],[48,52,55,60],[45,49,52,57],[50,54,57,62]],2.5),7.0,'#9370DB'],
]);

// ─── 4. 金培达 ───
const peter = ensureUser('peterkam@music.square', '金培达',
  'Peter Kam (1961–) — 柏林银熊奖得主，香港电影配乐大师 🎬🏆', 'berlinbear');
insertWorks(peter.id, [
  ['伊莎贝拉 (Isabella)','2006 年柏林电影节最佳电影音乐银熊奖。澳门街头的父女情。🏙️🎻',72,'C',makeTrack('piano',diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.45,0.3),4.5,'#F5CBA7'],
  ['十月围城 (Bodyguards and Assassins)','革命志士的悲壮牺牲。"欲求文明之幸福，必经文明之痛苦"。⚔️',88,'E',makeChordTrack('orchestra',[[52,56,59,64],[54,57,61,66],[51,55,58,63],[48,52,55,60]],2.0),5.0,'#7B241C'],
  ['星愿 (Fly Me to Polaris)','张柏芝演唱。盲人与护士的爱情童话。✨',68,'G',makeTrack('voice',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.5,0.35),5.0,'#2980B9'],
  ['寒战 (Cold War)','警队高层的智力对决。悬疑、紧迫、张力。🔍',108,'C',makeTrack('strings',diatonic(60,[0,2,1,3,2,4,3,5,4,2,0,2,4,5,7,5]),0.25,0.15),3.5,'#17202A'],
]);

// ─── 5. 陈光荣 ───
const ckg = ensureUser('chankwongwing@music.square', '陈光荣',
  'Chan Kwong-wing (1967–) — 《无间道》配乐，港产警匪片的音乐面孔 🎬🔫', 'infernal');
insertWorks(ckg.id, [
  ['无间道 (Infernal Affairs)','"三年之后又三年"。卧底的宿命与挣扎。🔫🎻',76,'A',makeChordTrack('strings',[[57,61,64,69],[55,59,62,67],[52,56,59,64],[50,54,57,62]],2.5),5.0,'#1C1C1C'],
  ['头文字D — 漂移 (Initial D — Drift)','AE86 的引擎与轮胎尖叫。日系热血与港式青春。🚗💨',144,'C',makeTrack('synth',diatonic(60,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,9,11,9,7]),0.15,0.1),3.0,'#E74C3C'],
  ['十月围城 (Bodyguards and Assassins) — Theme','与金培达合作的史诗级配乐。革命与牺牲。🏛️',88,'E',makeTrack('orchestra',diatonic(64,[0,2,4,7,9,7,4,2,0,2,4,7,9,11,9,7]),0.3,0.2),4.5,'#7B241C'],
  ['窃听风云 (Overheard)','金融犯罪与人性贪婪的悬疑配乐。📈🕵️',100,'C',makeTrack('synth',diatonic(60,[0,1,3,5,7,5,3,1,0,1,3,5,7,8,7,5]),0.25,0.2),4.0,'#2C3E50'],
]);

// ─── 6. 林海 ───
const linhai = ensureUser('linhai@music.square', '林海',
  'Lin Hai (1969–) — 钢琴诗人，新旧交替的华语影视音乐大师 🎹🌙', 'pianopoet');
insertWorks(linhai.id, [
  ['琵琶语 (Whisper of Pipa)','《一个陌生女人的来信》主题。琵琶弦上说相思。🎵💌',66,'G',makeTrack('pipa',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.5,0.3),5.0,'#F1948A'],
  ['欢沁 (Joyful)','喜庆活泼的琵琶与钢琴对话，中国风的轻快幽默。🎉😊',112,'C',makeTrack('pipa',chnScale(60,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.25,0.15),3.0,'#F39C12'],
  ['流动的城市 (Floating City)','都市生活的速度与温度，钢琴的现代诗。🏙️🎹',84,'C',makeTrack('piano',diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),4.0,'#2980B9'],
  ['大明宫词 (Palace of Desire) — Theme','盛世大唐的华丽与哀愁。👑🏯',60,'E',makeChordTrack('orchestra',[[52,56,59,64],[54,57,61,66],[56,59,63,68],[52,56,59,64]],3.0),6.0,'#8E44AD'],
]);

// ─── 7. 顾嘉辉 ───
const koo = ensureUser('josephkoo@music.square', '顾嘉辉',
  'Joseph Koo (1933–2023) — 香港乐坛教父，"辉黄"组合之辉 🎤🇭🇰', 'lionrock');
insertWorks(koo.id, [
  ['上海滩 (Shanghai Beach)','叶丽仪原唱。"浪奔浪流，万里滔滔江水永不休"。🌊🏙️',88,'C',makeTrack('voice',diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.3,0.2),3.5,'#1A5276'],
  ['狮子山下 (Below the Lion Rock)','香港精神之歌。罗文原唱。"人生不免崎岖，难以绝无挂虑"。🦁⛰️',72,'G',makeTrack('voice',diatonic(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2]),0.4,0.25),4.0,'#D4AC0D'],
  ['世间始终你好 (You Are the Best in the World)','《射雕英雄传》主题曲。罗文与甄妮合唱。⚔️💕',100,'E',makeTrack('voice',diatonic(64,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.3,0.15),3.5,'#E74C3C'],
  ['万水千山总是情 (Love Is Everywhere)','汪明荃原唱。"未怕罡风吹散了热爱"。🏔️💖',80,'C',makeTrack('voice',diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.2),3.5,'#8E44AD'],
]);

// ─── 8. 李泰祥 ───
const ltx = ensureUser('litaihsiang@music.square', '李泰祥',
  'Li Tai-hsiang (1941–2014) — 台湾跨界音乐先驱，民歌时代的灵魂 🎻🌙', 'olivetree');
insertWorks(ltx.id, [
  ['橄榄树 (Olive Tree)','齐豫原唱。"不要问我从哪里来，我的故乡在远方"。🌳🕊️',72,'G',makeTrack('voice',diatonic(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.45,0.3),4.5,'#27AE60'],
  ['走在雨中 (Walking in the Rain)','齐豫的泣诉。"当我走在凄清的路上"。🌧️💧',60,'C',makeTrack('voice',diatonic(60,[0,2,1,0,2,1,0,2,3,5,3,2,0,2,3,5]),0.5,0.35),5.0,'#5D6D7E'],
  ['你是我所有的回忆 (You Are All My Memories)','齐豫经典。李泰祥学院派与民歌的完美融合。🎵💭',66,'D',makeTrack('voice',diatonic(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.45,0.3),4.5,'#9B59B6'],
  ['自彼次遇到你 (Since I Met You)','李泰祥晚期为林志炫创作的音乐剧选段。🎭',80,'A',makeChordTrack('orchestra',[[57,61,64,69],[55,59,62,67],[52,56,59,64],[50,54,57,62]],2.5),5.5,'#D4AC0D'],
]);

// ─── 9. 杜鸣心 ───
const du = ensureUser('dumingxin@music.square', '杜鸣心',
  'Du Mingxin (1928–) — 《红色娘子军》芭蕾舞作者之一，中国芭蕾音乐奠基人 🩰🇨🇳', 'dancer');
insertWorks(du.id, [
  ['红色娘子军 — 序曲 (Red Detachment of Women — Overture)','中国芭蕾的经典序曲。"向前进，向前进！"💃🔫',112,'C',makeTrack('orchestra',diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.25,0.15),3.0,'#C0392B'],
  ['红色娘子军 — 快乐的女战士 (Happy Woman Soldiers)','欢快的双人舞段，脚尖上的革命热情。👯',132,'G',makeTrack('orchestra',diatonic(67,[0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),0.2,0.1),2.5,'#E74C3C'],
  ['鱼美人 (The Mermaid) — 水草舞','与吴祖强合作的神话舞剧。海底世界的梦幻。🌊🧜',72,'D',makeTrack('orchestra',chnScale(62,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.4,0.25),4.5,'#2980B9'],
  ['春之采 (Colors of Spring)','交响诗。春天在中国的色彩。🌸🎻',88,'C',makeChordTrack('orchestra',[[48,52,55,60],[50,54,57,62],[48,52,55,60],[45,49,52,57]],2.0),5.0,'#2ECC71'],
]);

// ─── 10. 金湘 ───
const jinx = ensureUser('jinxiang@music.square', '金湘',
  'Jin Xiang (1935–2015) — 中国歌剧《原野》作曲家，当代中国歌剧先锋 🎭🌾', 'wildfield');
insertWorks(jinx.id, [
  ['原野 (The Savage Land) — 金子咏叹调','曹禺话剧改编歌剧。金子的爱与恨。🔥',66,'D',makeTrack('voice',chnScale(62,[0,2,3,5,3,2,0,2,3,5,6,5,3,2,0,2]),0.5,0.35),5.5,'#C0392B'],
  ['原野 — 仇虎的咏叹','黑暗的复仇之火。"天是黑的，地是黑的"。⚫',72,'A',makeTrack('voice',chnScale(69,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.45,0.3),5.0,'#1B1B1B'],
  ['原野 — 合唱 (Chorus)','村民的合唱推动戏剧张力。"天要亮了"。🌅',88,'C',makeChordTrack('choir',[[48,52,55,60],[50,54,57,62],[48,52,55,60],[45,49,52,57]],2.0),4.0,'#F39C12'],
  ['交响叙事诗 (Symphonic Ballad)','金湘管弦乐代表作。🎻',76,'C',makeTrack('orchestra',diatonic(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.35,0.25),5.0,'#8E44AD'],
]);

// ─── 11. 瞿小松 ───
const qu = ensureUser('quxiaosong@music.square', '瞿小松',
  'Qu Xiaosong (1952–) — 当代中国"新潮"音乐代表，电影与实验音乐双栖 🎬🎵', 'shanren');
insertWorks(qu.id, [
  ['青春祭 (Sacrifice of Youth)','张晓刚电影配乐。云南傣乡的青春与忧伤。🌿🎥',68,'E',makeTrack('bamboo flute',chnScale(64,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.45,0.3),5.0,'#27AE60'],
  ['孩子王 (King of the Children)','陈凯歌电影配乐。云南山区教育困境中的诗意。📚⛰️',60,'G',makeTrack('voice',chnScale(67,[0,1,3,5,3,1,0,1,3,5,6,5,3,1,0,1]),0.5,0.35),5.5,'#1A5276'],
  ['寂 (Silence)','打击乐与静默的禅意。大音希声。🪘🧘',48,'C',makeTrack('gamelan',chnScale(60,[0,2,4,5,0,2,4,5,7,5,4,2,0,2,4,5]),0.6,0.5),6.5,'#2C3E50'],
  ['大劈棺 (Splitting the Coffin)','戏曲元素的现代解构。🎭',104,'C',makeTrack('jinghu',chnScale(60,[0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),0.3,0.15),4.0,'#7B241C'],
]);

// ─── 12. 金复载 ───
const jfz = ensureUser('jinfuzai@music.square', '金复载',
  'Jin Fuzai (1942–) — 中国动画音乐之父 🎬🐒', 'monkeyking');
insertWorks(jfz.id, [
  ['三个和尚 (Three Monks)','上海美影厂巅峰之作。一个和尚挑水吃，两个和尚抬水吃……🎬🪣',88,'C',makeTrack('woodwind',chnScale(60,[0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]),0.3,0.2),3.5,'#F1C40F'],
  ['哪吒闹海 (Nezha Conquers the Dragon King)','哪吒自刎的悲壮场面配乐。经典中的经典。🐉🔥',72,'D',makeChordTrack('orchestra',[[50,54,57,62],[48,52,55,60],[45,49,52,57],[43,47,50,55]],2.5),5.5,'#E74C3C'],
  ['雪孩子 (Snow Child)','雪人融化时的催泪配乐。⛄',66,'G',makeTrack('piano',chnScale(67,[0,2,4,5,7,5,4,2,0,2,4,5,7,5,4,2]),0.5,0.3),5.0,'#87CEEB'],
  ['山水情 (Feelings of Mountains and Water)','水墨动画绝唱。古琴与山水的对话。🎋🏔️',52,'C',makeTrack('guqin',chnScale(60,[0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),0.6,0.4),7.0,'#2C3E50'],
]);

// ─── Sumário ───
const allUsers = db.prepare("SELECT u.username, COUNT(c.id) as cnt FROM users u LEFT JOIN compositions c ON u.id=c.user_id WHERE u.email LIKE '%@music.square' GROUP BY u.id ORDER BY cnt DESC").all();
console.log(`\n📊 近年华人音乐家入库完成！新增作品: ${totalNew}`);
console.log(`\n📋 当前数据库完整总览:`);
allUsers.forEach(r => console.log(`  ${r.username.padEnd(12)} → ${String(r.cnt).padStart(3)} 首`));
const t = db.prepare('SELECT COUNT(*)as t FROM compositions').get();
console.log(`\n  📦 总计: ${t.t} 部作品`);

process.exit(0);
