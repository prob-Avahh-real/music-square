const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'music_square.db');

let db;

function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS compositions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      bpm INTEGER DEFAULT 120,
      key_signature TEXT DEFAULT 'C',
      scale TEXT DEFAULT 'major',
      tracks TEXT NOT NULL DEFAULT '[]',
      duration_secs REAL DEFAULT 0,
      audio_url TEXT,
      cover_color TEXT DEFAULT '#6C5CE7',
      play_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      composition_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      parent_id TEXT,
      content TEXT NOT NULL,
      timestamp_secs REAL DEFAULT -1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (composition_id) REFERENCES compositions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL,
      composition_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, composition_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (composition_id) REFERENCES compositions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_compositions_user ON compositions(user_id);
    CREATE INDEX IF NOT EXISTS idx_compositions_created ON compositions(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_composition ON comments(composition_id);
    CREATE INDEX IF NOT EXISTS idx_likes_composition ON likes(composition_id);
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
  `);
}

module.exports = { getDb };
