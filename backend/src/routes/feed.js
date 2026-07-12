const { Router } = require('express');
const { getDb } = require('../db');
const { authRequired, authOptional } = require('../middleware/auth');

const router = Router();

// GET /api/feed — personalized feed (latest from followed users + popular)
router.get('/', authOptional, (req, res, next) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = Math.min(parseInt(limit), 50);

    if (req.user) {
      // Mix: followed users' compositions + popular
      const rows = db.prepare(`
        SELECT DISTINCT c.*, u.username, u.avatar_url,
          CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END as from_following
        FROM compositions c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN follows f ON f.following_id = c.user_id AND f.follower_id = ?
        WHERE c.is_public = 1
        ORDER BY from_following DESC, c.created_at DESC
        LIMIT ? OFFSET ?
      `).all(req.user.id, lim, offset);

      const count = db.prepare('SELECT COUNT(*) as total FROM compositions WHERE is_public = 1').get();

      const compositions = rows.map(r => ({ ...r, tracks: JSON.parse(r.tracks) }));

      if (compositions.length > 0) {
        const compIds = compositions.map(c => c.id);
        const likedRows = db.prepare(`
          SELECT composition_id FROM likes WHERE user_id = ? AND composition_id IN (${compIds.map(() => '?').join(',')})
        `).all(req.user.id, ...compIds);
        const likedSet = new Set(likedRows.map(r => r.composition_id));
        compositions.forEach(c => { c.is_liked = likedSet.has(c.id); });
      }

      res.json({
        compositions,
        pagination: {
          page: parseInt(page), limit: lim,
          total: count.total, totalPages: Math.ceil(count.total / lim)
        }
      });
    } else {
      // Not logged in: show most popular
      const count = db.prepare('SELECT COUNT(*) as total FROM compositions WHERE is_public = 1').get();
      const rows = db.prepare(`
        SELECT c.*, u.username, u.avatar_url
        FROM compositions c JOIN users u ON c.user_id = u.id
        WHERE c.is_public = 1
        ORDER BY c.play_count DESC, c.created_at DESC
        LIMIT ? OFFSET ?
      `).all(lim, offset);

      const compositions = rows.map(r => ({ ...r, tracks: JSON.parse(r.tracks) }));
      res.json({
        compositions,
        pagination: {
          page: parseInt(page), limit: lim,
          total: count.total, totalPages: Math.ceil(count.total / lim)
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/feed/follow/:userId — follow a user
router.post('/follow/:userId', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: '不能关注自己' });
    }

    const target = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
    if (!target) return res.status(404).json({ error: '用户不存在' });

    const existing = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, req.params.userId);
    if (existing) {
      db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, req.params.userId);
      res.json({ following: false });
    } else {
      db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.user.id, req.params.userId);
      res.json({ following: true });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/feed/following — list users I follow
router.get('/following', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    const following = db.prepare(`
      SELECT u.id, u.username, u.avatar_url, u.bio
      FROM users u JOIN follows f ON u.id = f.following_id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);
    res.json(following);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
