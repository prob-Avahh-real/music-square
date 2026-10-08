const { getDb } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
console.log('🎹🎌 正在导入久石让全集...\n');

const jhEmail = 'hisaishi@music.square';
let jhUser = db.prepare('SELECT * FROM users WHERE email = ?').get(jhEmail);

if (!jhUser) {
  const id = uuidv4();
  const hash = bcrypt.hashSync('ghibli2024', 10);
  db.prepare(
    'INSERT INTO users (id, username, email, password_hash, bio) VALUES (?,?,?,?,?)'
  ).run(id, '久石让', jhEmail, hash,
    'Joe Hisaishi (1950–) — 宫崎骏与北野武的御用作曲家，极简旋律大师 🎹✨');
  jhUser = db.prepare('SELECT * FROM users WHERE email = ?').get(jhEmail);
  console.log('  ✓ 创建用户: 久石让');
} else {
  console.log('  ✓ 用户已存在: 久石让');
}

const userId = jhUser.id;

// ─── 辅助函数 ───

function makeTrack(instrument, pitches, noteDuration = 0.5, gap = 0.25) {
  const notes = [];
  let start = 0;
  for (const p of pitches) {
    notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: noteDuration });
    start += noteDuration + gap;
  }
  return [{ instrument, notes }];
}

function makeChordTrack(instrument, chords, duration = 2.0) {
  const notes = [];
  let start = 0;
  for (const chord of chords) {
    for (const p of chord) {
      notes.push({ pitch: p, start: Math.round(start * 100) / 100, duration });
    }
    start += duration + 0.5;
  }
  return [{ instrument, notes }];
}

function makeMelodyAndPad(melodyInst, melodyPitches, padChords, nd = 0.5, gap = 0.25, chordDur = 2.0) {
  const melodyNotes = [];
  let start = 0;
  for (const p of melodyPitches) {
    melodyNotes.push({ pitch: p, start: Math.round(start * 100) / 100, duration: nd });
    start += nd + gap;
  }
  const padNotes = [];
  let chordStart = 0;
  for (const chord of padChords) {
    for (const p of chord) {
      padNotes.push({ pitch: p, start: Math.round(chordStart * 100) / 100, duration: chordDur });
    }
    chordStart += chordDur + 0.5;
  }
  return [
    { instrument: melodyInst, notes: melodyNotes },
    { instrument: 'pad', notes: padNotes }
  ];
}

// 日本都节音阶 (Miyakobushi / In scale): root + [0,1,5,7,8]
function jpnScale(root, steps) {
  const inScale = [0, 1, 5, 7, 8];
  return steps.map(s => root + inScale[s % 5] + (Math.floor(s / 5) * 12));
}

// 五声音阶 (Pentatonic): root + [0,2,4,7,9]
function chnScale(root, steps) {
  const pent = [0, 2, 4, 7, 9];
  return steps.map(s => root + pent[s % 5] + (Math.floor(s / 5) * 12));
}

function dedupInsert(title, description, bpm, keySig, scale, tracks, durationSecs, color) {
  const existing = db.prepare(
    'SELECT id FROM compositions WHERE title = ? AND user_id = ?'
  ).get(title, userId);

  if (existing) {
    console.log(`  ~ ja existe, pulando: ${title}`);
    return existing.id;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO compositions (id, user_id, title, description, bpm, key_signature, scale, tracks, duration_secs, cover_color)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(id, userId, title, description, bpm, keySig, scale, JSON.stringify(tracks), durationSecs, color);

  db.prepare(
    'UPDATE compositions SET play_count = ?, like_count = ?, comment_count = ? WHERE id = ?'
  ).run(
    Math.floor(Math.random() * 1800 + 800),
    Math.floor(Math.random() * 500 + 100),
    Math.floor(Math.random() * 60 + 20),
    id
  );

  console.log(`  + ${title}`);
  return id;
}

// =====================================================
//  Studio Ghibli / Hayao Miyazaki
// =====================================================

console.log('  Studio Ghibli...\n');

// --- Nausicaa ---
dedupInsert(
  'Nausicaa - Kaze no Densetsu',
  'Nausicaa of the Valley of the Wind main theme. Nausicaa gliding over the golden fields on her Mehve. Soaring orchestral poem.',
  72, 'G', 'minor',
  makeMelodyAndPad('piano', chnScale(67, [0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),
    [[43,47,50,55],[45,48,52,57],[48,52,55,60],[43,47,50,55]], 0.4, 0.25, 2.0),
  6.0, '#2ECC71'
);

dedupInsert(
  'Nausicaa - Requiem',
  'Nausicaa resurrected in the golden tendrils of the Ohmu. Pure solo piano — a lullaby for a dying world.',
  48, 'C', 'minor',
  makeTrack('piano', [72,71,72,74,72,71,69,67,67,69,71,72,71,69,67,65], 0.6, 0.3),
  5.5, '#F5CBA7'
);

// --- Castle in the Sky ---
dedupInsert(
  'Castle in the Sky - Kimi wo Nosete',
  'The eternal theme of Laputa. Pazu and Sheeta floating through storm clouds, the levistone glowing in the dark.',
  88, 'C', 'minor',
  makeMelodyAndPad('piano', [67,67,67,72,71,69,67,71,72,74,72,71,69,67,65,67],
    [[48,52,55],[45,48,52],[43,47,50],[48,52,55]], 0.35, 0.2, 2.0),
  5.0, '#3498DB'
);

dedupInsert(
  'Castle in the Sky - Sheetas Decision',
  'Sheeta reciting the spell of destruction. Laputa crumbles while the massive tree rises — the most devastating orchestral cue in Ghibli history.',
  76, 'E', 'minor',
  makeChordTrack('orchestra', [[52,55,59],[50,53,57],[47,50,55],[45,48,52],[40,44,47]], 2.5),
  6.5, '#2C3E50'
);

// --- Totoro ---
dedupInsert(
  'My Neighbor Totoro - Sanpo (Stroll)',
  'Satsuki and Mei skipping down the country road. Sunshine, tadpoles, and the promise of a giant furry forest spirit.',
  120, 'F', 'major',
  makeTrack('piano', chnScale(65, [0,2,4,2,0,2,4,5,4,2,0,2,4,5,7,5,4,2]), 0.25, 0.15),
  3.5, '#27AE60'
);

dedupInsert(
  'My Neighbor Totoro - Kaze no Toorimichi',
  'The wind path where Totoro waits. Raindrops on umbrellas, catbus headlights in the distance, and the quiet magic of childhood.',
  96, 'F', 'major',
  makeMelodyAndPad('piano', chnScale(65, [0,2,4,5,7,9,7,5,4,2,0,2,4,5,7,5]),
    [[41,45,48,53],[43,46,50,55],[45,48,53,57],[41,45,48,53]], 0.3, 0.2, 2.0),
  4.5, '#82E0AA'
);

// --- Kiki ---
dedupInsert(
  'Kikis Delivery Service - Umi no Mieru Machi',
  'Kiki flying over the seaside town on her broom. Violin and piano paint Mediterranean sunlight and salt-breeze freedom.',
  104, 'G', 'major',
  makeMelodyAndPad('violin', chnScale(67, [0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]),
    [[43,47,50,55],[45,48,52,57],[47,50,55,59],[43,47,50,55]], 0.3, 0.2, 2.0),
  4.0, '#E67E22'
);

dedupInsert(
  'Kikis Delivery Service - A Town with an Ocean View',
  'Kiki sitting by the window, her magic gone. Piano whispers the loneliness of growing up — before the courage returns.',
  68, 'E', 'minor',
  makeTrack('piano', [76,75,76,72,71,69,67,69,71,72,71,69,67,64,62,64], 0.5, 0.3),
  5.0, '#5D6D7E'
);

// --- Porco Rosso ---
dedupInsert(
  'Porco Rosso - Marco and Gina',
  'The Adriatic at dusk. Porco Rossos red seaplane skimming the waves while Ginas garden waits. Saxophone and accordion — European nostalgia distilled.',
  72, 'C', 'major',
  makeMelodyAndPad('sax', chnScale(60, [0,2,4,0,2,4,5,7,5,4,2,0,2,4,5,4]),
    [[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]], 0.4, 0.25, 2.0),
  5.5, '#C0392B'
);

dedupInsert(
  'Porco Rosso - The Bygone Days',
  'Marco remembering his fallen comrades in the cloud-sea. Solo piano — still, aching, like a Mediterranean sunset that refuses to end.',
  60, 'A', 'minor',
  makeTrack('piano', chnScale(57, [0,2,3,5,3,2,0,2,3,5,7,5,3,2,0,2]), 0.55, 0.3),
  6.0, '#A93226'
);

// --- Princess Mononoke ---
dedupInsert(
  'Princess Mononoke - Main Theme',
  'Ashita riding Yakul through the ancient forest. The sigh of old gods stirring beneath centuries of moss.',
  64, 'E', 'minor',
  makeChordTrack('orchestra', [[40,44,47,52],[43,47,50,55],[45,48,52,57],[40,44,47,52]], 3.0),
  7.0, '#1B4F72'
);

dedupInsert(
  'Princess Mononoke - Ashitakas Legend',
  'Ashita leaving his village to find the source of the curse. A symphonic poem of grief and resolve — humanity meeting nature at the edge of war.',
  72, 'E', 'minor',
  makeMelodyAndPad('erhu', jpnScale(64, [0,1,3,4,2,1,0,1,3,4,6,4,3,1,0,1]),
    [[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]], 0.35, 0.2, 2.5),
  5.5, '#2E4053'
);

dedupInsert(
  'Princess Mononoke - The Women of Tatara',
  'The women of Irontown stamping the bellows. Percussion and brass — the industrial dance that defies the forest.',
  116, 'D', 'minor',
  makeTrack('orchestra', jpnScale(62, [0,1,3,1,0,1,3,4,3,1,0,1,3,4,6,4]), 0.25, 0.15),
  3.0, '#7B241C'
);

// --- Spirited Away ---
dedupInsert(
  'Spirited Away - Itsu mo Nando Demo',
  'End credits of Spirited Away. Chihiro walking back through the tunnel — the spirit world fading but never forgotten.',
  78, 'F', 'major',
  makeMelodyAndPad('piano', [65,67,69,72,74,72,69,67,65,67,69,72,69,67,65,64],
    [[41,45,48,53],[43,47,50,55],[45,48,53,57],[41,45,48,53]], 0.35, 0.2, 2.0),
  5.0, '#E91E63'
);

dedupInsert(
  'Spirited Away - One Summers Day',
  'The iconic opening. Chihiro running through the flower field towards the bathhouse. Piano flows like spring water — summer frozen in a single moment.',
  72, 'C', 'major',
  makeTrack('piano', [72,76,79,76,72,76,79,84,79,76,72,71,72,76,72,71,67,64,60], 0.35, 0.2),
  4.5, '#FF6B6B'
);

dedupInsert(
  'Spirited Away - Futatabi (Reprise)',
  'Chihiro and Haku soaring through the night sky, remembering their true names. Strings push higher and higher — one of Hisaishis most emotionally devastating moments.',
  84, 'C', 'major',
  makeChordTrack('orchestra', [[48,52,55,60,64],[45,48,52,57,62],[43,47,50,55,60],[48,52,55,60,64]], 2.5),
  6.0, '#9B59B6'
);

dedupInsert(
  'Spirited Away - The Sixth Station',
  'The sea-train gliding across still water. No-Face sits quietly beside Chihiro. Minimalist piano and strings — a soundscape of infinite longing.',
  56, 'G', 'major',
  makeTrack('piano', [67,67,71,72,71,67,64,62,60,62,64,67,64,62,60,59], 0.6, 0.4),
  5.5, '#3498DB'
);

// --- Howls Moving Castle ---
dedupInsert(
  'Howls Moving Castle - Merry-Go-Round of Life',
  'The waltz that defines Howls Moving Castle. Sophie and Howl dancing above the rooftops — a promise that outlasts time itself.',
  84, 'G', 'minor',
  makeMelodyAndPad('piano', chnScale(67, [0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),
    [[43,46,50,55],[45,48,52,57],[48,52,55,60],[43,46,50,55]], 0.3, 0.2, 2.0),
  5.0, '#8E44AD'
);

dedupInsert(
  'Howls Moving Castle - The Promise of the World',
  'Young Sophie by the lake, making a promise to child-Howl. Gentle horn and harp — a love story that travels backwards through time.',
  72, 'C', 'major',
  makeMelodyAndPad('horn', [60,64,67,72,71,67,64,62,60,64,67,72,71,67,64,60],
    [[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]], 0.4, 0.25, 2.0),
  5.5, '#F1948A'
);

// --- Ponyo ---
dedupInsert(
  'Ponyo - Main Theme',
  'Ponyo running across the waves on giant fish. Brass, woodwinds, and children chorus — a carnival of the sea.',
  130, 'F', 'major',
  makeTrack('piano', chnScale(65, [0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2,4,5]), 0.2, 0.1),
  3.0, '#E74C3C'
);

dedupInsert(
  'Ponyo - Mother of the Sea',
  'Granmamare — the goddess of the ocean — rising from the deep. Orchestral grandeur depicting the abyss and its maternal tenderness.',
  64, 'C', 'major',
  makeChordTrack('orchestra', [[48,52,55,60,64],[43,47,50,55,59],[45,48,53,57,62],[48,52,55,60,64]], 3.0),
  7.0, '#2980B9'
);

// --- The Wind Rises ---
dedupInsert(
  'The Wind Rises - Hikouki Gumo',
  'Ending of The Wind Rises. Jiro and Naoko meeting and parting in the wind. Piano tells of dreams that never took flight.',
  68, 'A', 'minor',
  makeMelodyAndPad('piano', chnScale(57, [0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),
    [[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]], 0.4, 0.25, 2.0),
  5.0, '#BDC3C7'
);

dedupInsert(
  'The Wind Rises - Naokos Theme',
  'Naoko painting at the mountain sanatorium. String quartet — a brief, incandescent happiness before the snow falls.',
  72, 'D', 'major',
  makeTrack('violin', chnScale(62, [0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]), 0.4, 0.25),
  4.5, '#F7DC6F'
);

// --- The Boy and the Heron ---
dedupInsert(
  'The Boy and the Heron - Ask Me Why',
  'Main theme. The grey heron leading Mahito through the tower between life and death. Minimalist piano and strings — a meditation on letting go.',
  60, 'E', 'minor',
  makeTrack('piano', [64,67,71,72,71,67,64,62,60,59,60,62,64,67,64,62], 0.55, 0.3),
  5.5, '#1C2833'
);

dedupInsert(
  'The Boy and the Heron - The Great Collapse',
  'The tower world collapsing into the sea. Timpani thunder, brass walls of sound — then silence, and the waves.',
  96, 'C', 'minor',
  makeChordTrack('orchestra', [[48,51,55,60],[45,48,52,57],[43,47,50,55],[48,51,55,60]], 2.0),
  5.0, '#4A235A'
);

// =====================================================
//  Takeshi Kitano films
// =====================================================

console.log('\n  Takeshi Kitano...\n');

// --- Kikujiro ---
dedupInsert(
  'Kikujiro - Summer',
  'The definitive summer theme. Piano and strings leap through cicada song — every note a drop of childhood sunlight.',
  90, 'D', 'major',
  makeMelodyAndPad('piano', [66,69,74,73,71,69,66,69,74,73,71,69,71,73,69,66],
    [[42,45,50,54],[44,47,52,56],[46,50,54,57],[42,45,50,54]], 0.3, 0.15, 2.0),
  4.0, '#F39C12'
);

dedupInsert(
  'Kikujiro - The Rain',
  'Kikujiro and Masao sheltering under a roadside pavilion. Piano raindrops and distant string thunder.',
  64, 'B', 'minor',
  makeTrack('piano', [71,71,74,73,71,69,66,69,71,69,66,64,62,64,66,69], 0.5, 0.3),
  5.5, '#5DADE2'
);

dedupInsert(
  'Kikujiro - River Side',
  'Masao running by the river while Kikujiro pretends to fish. Acoustic guitar afternoon.',
  80, 'G', 'major',
  makeTrack('guitar', chnScale(55, [0,2,4,5,4,2,0,2,4,5,7,5,4,2,0,2]), 0.35, 0.2),
  4.0, '#82E0AA'
);

// --- HANA-BI ---
dedupInsert(
  'HANA-BI - Main Theme',
  'Fireworks blooming and dying in the sky. Piano as delicate and violent as Kitano himself — a world of wordless tenderness.',
  72, 'D', 'minor',
  makeMelodyAndPad('piano', jpnScale(62, [0,1,3,4,3,1,0,1,3,4,6,4,3,1,0,1]),
    [[38,41,45,50],[40,43,47,52],[42,45,50,53],[38,41,45,50]], 0.4, 0.25, 2.0),
  5.5, '#2C3E50'
);

dedupInsert(
  'Kids Return',
  'Two boys cycling towards the schoolyard. Youth that never ends — piano chasing the horizon.',
  96, 'C', 'major',
  makeTrack('piano', chnScale(60, [0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.3, 0.15),
  3.5, '#27AE60'
);

// --- A Scene at the Sea ---
dedupInsert(
  'A Scene at the Sea - Silent Love',
  'Deaf garbage collector Shigeru and his girlfriend Takako at the shore with his surfboard. Piano and synth paint a love story without words.',
  60, 'A', 'major',
  makeTrack('piano', chnScale(57, [0,2,4,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.55, 0.35),
  6.0, '#85C1E9'
);

// --- Sonatine ---
dedupInsert(
  'Sonatine - Main Theme',
  'Yakuza playing deadly games on an Okinawan beach. Piano captures the stillness before violence — a lullaby for doomed men.',
  56, 'F', 'minor',
  makeMelodyAndPad('piano', jpnScale(53, [0,1,3,4,6,4,3,1,0,1,3,4,6,8,6,4]),
    [[41,44,48,53],[43,46,49,54],[44,47,51,55],[41,44,48,53]], 0.5, 0.3, 2.5),
  6.5, '#4A4A4A'
);

// --- Dolls ---
dedupInsert(
  'Dolls - Main Theme',
  'Two people bound by a red cord, walking through the four seasons. Strings like thread, piano like tears.',
  66, 'A', 'minor',
  makeMelodyAndPad('violin', chnScale(57, [0,2,3,5,7,5,3,2,0,2,3,5,7,8,7,5]),
    [[45,48,52,57],[43,46,50,55],[41,45,48,53],[45,48,52,57]], 0.4, 0.25, 2.0),
  5.0, '#C0392B'
);

// =====================================================
//  Other film scores
// =====================================================

console.log('\n  Other films...\n');

// --- Departures ---
dedupInsert(
  'Departures - Memory',
  'Theme from Departures (Okuribito). Solo cello — a meditation on the dignity of death and the grace of farewell.',
  52, 'G', 'major',
  makeTrack('cello', chnScale(55, [0,2,4,5,7,5,4,2,0,2,4,5,7,9,7,5]), 0.6, 0.35),
  6.0, '#F5CBA7'
);

dedupInsert(
  'Departures - Okuribito',
  'Daigo discovers the stone-letter in his fathers clenched hand. Piano and strings swell — tears, then release.',
  60, 'C', 'major',
  makeMelodyAndPad('cello', [48,52,55,60,59,55,52,48,48,52,55,60,64,62,60,59],
    [[48,52,55,60],[45,48,52,57],[43,47,50,55],[48,52,55,60]], 0.5, 0.3, 2.5),
  6.5, '#8D6E63'
);

// --- Parasyte ---
dedupInsert(
  'Parasyte - Main Theme',
  'Sci-fi horror meets existential dread. Electronic synths and strings build an alien world inside human skin.',
  128, 'C', 'minor',
  makeTrack('synth', jpnScale(60, [0,1,3,4,6,4,3,1,0,1,3,4,6,8,6,4]), 0.2, 0.1),
  2.5, '#1B1B1B'
);

// =====================================================
//  Concert works & solo albums
// =====================================================

console.log('\n  Concert works & albums...\n');

// --- Minima_Rhythm ---
dedupInsert(
  'MKWAJU 1981-2009 (Minima_Rhythm)',
  'Hisaishis minimalist masterpiece. Repeated figures shifting by a single note — the ecstasy of small change. Philip Glass meets Japan.',
  100, 'C', 'minor',
  makeTrack('piano', [60,60,63,60,60,60,63,58,58,60,63,60,58,60,63,67], 0.25, 0.1),
  3.5, '#212121'
);

// --- Asian Works ---
dedupInsert(
  'Asian Dream Song',
  'Hisaishis exploration of Asian identity. Erhu and orchestra trace the Yangtze, Fuji, and Han rivers — a pan-Asian soundscape.',
  72, 'D', 'minor',
  makeMelodyAndPad('erhu', jpnScale(62, [0,1,3,4,6,4,3,1,0,1,3,4,6,8,6,4]),
    [[38,42,45,50],[40,43,47,52],[42,45,50,54],[38,42,45,50]], 0.35, 0.2, 2.5),
  5.0, '#F39C12'
);

// --- Piano Stories ---
dedupInsert(
  'Piano Stories - Innocent',
  'From the solo album Piano Stories. As simple and profound as a babys breath. Hisaishi at his most naked.',
  66, 'E', 'major',
  makeTrack('piano', chnScale(64, [0,2,4,5,4,2,0,2,4,5,7,9,7,5,4,2]), 0.45, 0.3),
  4.5, '#F5F5F5'
);

dedupInsert(
  'Piano Stories - Fantasia (for NAUSICAA)',
  'Opening track of Piano Stories. A fantasy-variation on the Nausicaa theme — wind howling across the piano keys.',
  84, 'G', 'minor',
  makeTrack('piano', chnScale(67, [0,2,3,5,7,8,7,5,3,2,0,2,3,5,7,8]), 0.3, 0.15),
  4.0, '#A3E4D7'
);

// --- Works III ---
dedupInsert(
  'Works III - Oriental Wind',
  'From the orchestral collection Works III. Taiko drums and full orchestra — thunder and wind from the East.',
  108, 'A', 'minor',
  makeChordTrack('orchestra', [[45,48,52,57],[43,46,50,55],[40,44,47,52],[45,48,52,57]], 2.0),
  4.5, '#D35400'
);

// --- String Quartet ---
dedupInsert(
  'String Quartet No.1 - Movement I',
  'First movement of Hisaishis String Quartet No.1. Classical form meets Japanese melody — reason cradling deep feeling.',
  76, 'D', 'minor',
  makeChordTrack('violin', [[50,54,57,62],[48,52,55,60],[45,49,52,57],[43,47,50,55],[50,54,57,62]], 2.0),
  5.5, '#5B2C6F'
);

// --- World Dreams ---
dedupInsert(
  'World Dreams',
  'Symphonic poem composed for world peace. Childrens choir and orchestra — no borders, only music.',
  72, 'C', 'major',
  makeChordTrack('orchestra', [[48,52,55,60,64],[45,49,52,57,60],[43,47,50,55,59],[48,52,55,60,64]], 3.0),
  8.0, '#3498DB'
);

// --- Melodyphony ---
dedupInsert(
  'Melodyphony - Water Traveller',
  'From the Melodyphony album. Piano and orchestra trace a river from mountain spring to open sea.',
  88, 'E', 'minor',
  makeMelodyAndPad('piano', jpnScale(64, [0,1,3,4,6,8,6,4,3,1,0,1,3,4,6,4]),
    [[40,43,47,52],[42,45,48,53],[44,47,50,54],[40,43,47,52]], 0.3, 0.15, 2.0),
  4.5, '#2980B9'
);

// =====================================================
//  Summary
// =====================================================

const cnt = db.prepare('SELECT COUNT(*) AS cnt FROM compositions WHERE user_id = ?').get(userId);
console.log(`\n  Joe Hisaishi complete works imported!`);
console.log(`  Total compositions: ${cnt.cnt}`);
console.log(`  Test account: hisaishi@music.square / ghibli2024`);
console.log(`  API: http://localhost:3000/api/compositions?userId=${userId}`);
