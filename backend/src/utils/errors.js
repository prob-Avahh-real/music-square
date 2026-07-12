class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  console.error(`[${status}] ${message}`, err.stack);
  res.status(status).json({ error: message });
}

module.exports = { AppError, errorHandler };
