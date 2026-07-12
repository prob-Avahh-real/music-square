const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authRequired, authOptional } = require('../middleware/auth');
const { AppError } = require('../utils/errors');

const router = Router();

// POST /api/compositions — create a new composition
router.post('/', authRequired, (req, res, next) => {
  try {
    const { title, description, bpm, key_signature, scale, tracks, duration_secs, cover_color, is_public } = req.body;

    if (!title || !tracks) {
      throw new AppError('标题和音轨数据为必填项');
    }
    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new AppError('至少需要一个音轨');
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(`
      INSERT INTO compositions (id, user_id, title, description, bpm, key_signature, scale, tracks, duration_secs, cover_color, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.user.id, title,
      description || '', bpm || 120, key_signature || 'C', scale || 'major',
      JSON.stringify(tracks), duration_secs || 0,
      cover_color || '#6C5CE7', is_public !== undefined ? (is_public ? 1 : 0) : 1
    );

    const comp = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM compositions c JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(id);

    comp.tracks = JSON.parse(comp.tracks);
    res.status(201).json(comp);
  } catch (err) {
    next(err);
  }
});

// PUT /api/compositions/:id — update composition
router.put('/:id', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    const comp = db.prepare('SELECT * FROM compositions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!comp) throw new AppError('作品不存在或无权修改', 404);

    const { title, description, bpm, key_signature, scale, tracks, duration_secs, cover_color, is_public } = req.body;

    const updates = [];
    const params = [];
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (bpm !== undefined) { updates.push('bpm = ?'); params.push(bpm); }
    if (key_signature !== undefined) { updates.push('key_signature = ?'); params.push(key_signature); }
    if (scale !== undefined) { updates.push('scale = ?'); params.push(scale); }
    if (tracks !== undefined) { updates.push('tracks = ?'); params.push(JSON.stringify(tracks)); }
    if (duration_secs !== undefined) { updates.push('duration_secs = ?'); params.push(duration_secs); }
    if (cover_color !== undefined) { updates.push('cover_color = ?'); params.push(cover_color); }
    if (is_public !== undefined) { updates.push('is_public = ?'); params.push(is_public ? 1 : 0); }
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    db.prepare(`UPDATE compositions SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM compositions c JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);
    updated.tracks = JSON.parse(updated.tracks);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/compositions/:id
router.delete('/:id', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    const comp = db.prepare('SELECT * FROM compositions WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!comp) throw new AppError('作品不存在或无权删除', 404);

    db.prepare('DELETE FROM compositions WHERE id = ?').run(req.params.id);
    res.json({ message: '已删除' });
  } catch (err) {
    next(err);
  }
});

// GET /api/compositions — feed / list (public compositions, paginated)
router.get('/', authOptional, (req, res, next) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20, sort = 'latest', userId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = Math.min(parseInt(limit), 50);

    let where = 'WHERE c.is_public = 1';
    const params = [];

    if (userId) {
      where += ' AND c.user_id = ?';
      params.push(userId);
    }

    let orderBy = 'ORDER BY c.created_at DESC';
    if (sort === 'popular') {
      orderBy = 'ORDER BY c.play_count DESC';
    } else if (sort === 'likes') {
      orderBy = 'ORDER BY c.like_count DESC';
    }

    const count = db.prepare(`SELECT COUNT(*) as total FROM compositions c ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM compositions c JOIN users u ON c.user_id = u.id
      ${where} ${orderBy} LIMIT ? OFFSET ?
    `).all(...params, lim, offset);

    const compositions = rows.map(r => ({ ...r, tracks: JSON.parse(r.tracks) }));

    // If authenticated, include whether current user has liked each composition
    if (req.user) {
      const compIds = compositions.map(c => c.id);
      if (compIds.length > 0) {
        const likedRows = db.prepare(`
          SELECT composition_id FROM likes
          WHERE user_id = ? AND composition_id IN (${compIds.map(() => '?').join(',')})
        `).all(req.user.id, ...compIds);
        const likedSet = new Set(likedRows.map(r => r.composition_id));
        compositions.forEach(c => { c.is_liked = likedSet.has(c.id); });
      }
    }

    res.json({
      compositions,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total: count.total,
        totalPages: Math.ceil(count.total / lim)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/compositions/:id — single composition detail
router.get('/:id', authOptional, (req, res, next) => {
  try {
    const db = getDb();
    const comp = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM compositions c JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!comp) throw new AppError('作品不存在', 404);

    comp.tracks = JSON.parse(comp.tracks);

    // Increment play count
    db.prepare('UPDATE compositions SET play_count = play_count + 1 WHERE id = ?').run(req.params.id);
    comp.play_count += 1;

    // Check if current user liked
    if (req.user) {
      const liked = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND composition_id = ?').get(req.user.id, req.params.id);
      comp.is_liked = !!liked;
    }

    res.json(comp);
  } catch (err) {
    next(err);
  }
});

// POST /api/compositions/:id/like — toggle like
router.post('/:id/like', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    const comp = db.prepare('SELECT id FROM compositions WHERE id = ?').get(req.params.id);
    if (!comp) throw new AppError('作品不存在', 404);

    const existing = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND composition_id = ?').get(req.user.id, req.params.id);

    if (existing) {
      db.prepare('DELETE FROM likes WHERE user_id = ? AND composition_id = ?').run(req.user.id, req.params.id);
      db.prepare('UPDATE compositions SET like_count = MAX(0, like_count - 1) WHERE id = ?').run(req.params.id);
      res.json({ liked: false });
    } else {
      db.prepare('INSERT INTO likes (user_id, composition_id) VALUES (?, ?)').run(req.user.id, req.params.id);
      db.prepare('UPDATE compositions SET like_count = like_count + 1 WHERE id = ?').run(req.params.id);
      res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
