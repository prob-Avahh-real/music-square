const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./utils/errors');
const authRoutes = require('./routes/auth');
const compositionRoutes = require('./routes/compositions');
const commentRoutes = require('./routes/comments');
const feedRoutes = require('./routes/feed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/compositions', compositionRoutes);
app.use('/api/compositions', commentRoutes);
app.use('/api/feed', feedRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: '音悦广场 API', version: '1.0.0' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎵 音悦广场 API 运行中 → http://localhost:${PORT}`);
  console.log(`   健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;
