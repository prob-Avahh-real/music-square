const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authRequired, authOptional } = require('../middleware/auth');
const { AppError } = require('../utils/errors');

const router = Router();

// POST /api/compositions/:compId/comments — add a comment
router.post('/:compId/comments', authRequired, (req, res, next) => {
  try {
    const { content, parent_id, timestamp_secs } = req.body;

    if (!content || content.trim().length === 0) {
      throw new AppError('评论内容不能为空');
    }

    const db = getDb();
    const comp = db.prepare('SELECT id FROM compositions WHERE id = ?').get(req.params.compId);
    if (!comp) throw new AppError('作品不存在', 404);

    if (parent_id) {
      const parent = db.prepare('SELECT id FROM comments WHERE id = ? AND composition_id = ?').get(parent_id, req.params.compId);
      if (!parent) throw new AppError('父评论不存在');
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO comments (id, composition_id, user_id, parent_id, content, timestamp_secs)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, req.params.compId, req.user.id, parent_id || null, content.trim(), timestamp_secs || -1);

    db.prepare('UPDATE compositions SET comment_count = comment_count + 1 WHERE id = ?').run(req.params.compId);

    const comment = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(id);

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// GET /api/compositions/:compId/comments — list comments for a composition
router.get('/:compId/comments', authOptional, (req, res, next) => {
  try {
    const db = getDb();
    const comp = db.prepare('SELECT id FROM compositions WHERE id = ?').get(req.params.compId);
    if (!comp) throw new AppError('作品不存在', 404);

    const { sort = 'latest' } = req.query;
    let orderBy = 'ORDER BY c.created_at DESC';
    if (sort === 'timestamp') {
      orderBy = 'ORDER BY c.timestamp_secs ASC';
    }

    const comments = db.prepare(`
      SELECT c.*, u.username, u.avatar_url
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.composition_id = ?
      ${orderBy}
    `).all(req.params.compId);

    // Build threaded structure
    const rootComments = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);
    const threaded = rootComments.map(root => ({
      ...root,
      replies: replies.filter(r => r.parent_id === root.id)
    }));

    res.json(threaded);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/compositions/:compId/comments/:commentId
router.delete('/:compId/comments/:commentId', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    const comment = db.prepare(
      'SELECT * FROM comments WHERE id = ? AND composition_id = ? AND user_id = ?'
    ).get(req.params.commentId, req.params.compId, req.user.id);

    if (!comment) throw new AppError('评论不存在或无权删除', 404);

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);
    db.prepare('UPDATE compositions SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(req.params.compId);

    res.json({ message: '已删除' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
