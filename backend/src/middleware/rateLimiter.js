// TẦNG BẢO MẬT & MIDDLEWARE - API Gateway & Rate Limiting
const requestCounts = new Map();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút
const MAX_REQUESTS_PER_WINDOW = 120;     // Tối đa 120 requests / phút

function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  const record = requestCounts.get(ip);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  record.count += 1;

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Cảnh báo API Gateway: Đã vượt quá giới hạn lượt truy cập (Rate Limit). Vui lòng thử lại sau ít phút!'
    });
  }

  next();
}

module.exports = rateLimiter;
