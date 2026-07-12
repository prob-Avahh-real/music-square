const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { generateToken, authRequired } = require('../middleware/auth');
const { AppError } = require('../utils/errors');

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError('用户名、邮箱和密码为必填项');
    }
    if (username.length < 2 || username.length > 24) {
      throw new AppError('用户名长度需在 2-24 个字符之间');
    }
    if (password.length < 6) {
      throw new AppError('密码至少需要 6 个字符');
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
      throw new AppError('用户名或邮箱已被注册');
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
    ).run(id, username, email, passwordHash);

    const user = { id, username, email };
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('邮箱和密码为必填项');
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      throw new AppError('邮箱或密码不正确', 401);
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      throw new AppError('邮箱或密码不正确', 401);
    }

    const token = generateToken(user);
    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, bio: user.bio },
      token
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare(
      'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) throw new AppError('用户不存在', 404);

    const compCount = db.prepare('SELECT COUNT(*) as count FROM compositions WHERE user_id = ?').get(req.user.id);
    const followerCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(req.user.id);
    const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(req.user.id);

    res.json({
      ...user,
      composition_count: compCount.count,
      follower_count: followerCount.count,
      following_count: followingCount.count
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile
router.put('/profile', authRequired, (req, res, next) => {
  try {
    const { username, bio, avatar_url } = req.body;
    const db = getDb();

    if (username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
      if (existing) throw new AppError('用户名已被占用');
    }

    const updates = [];
    const params = [];
    if (username) { updates.push('username = ?'); params.push(username); }
    if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); params.push(avatar_url); }
    updates.push("updated_at = datetime('now')");
    params.push(req.user.id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const user = db.prepare(
      'SELECT id, username, email, avatar_url, bio, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
