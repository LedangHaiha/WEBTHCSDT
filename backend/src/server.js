const express = require('express');
const cors = require('cors');
const path = require('path');

const rateLimiter = require('./middleware/rateLimiter');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware Tầng Bảo Mật
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter); // API Gateway Rate Limiting Throttling

// Phân luồng API Routes
app.use('/api', apiRoutes);

// Phục vụ giao diện Frontend tích hợp (nếu có build)
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const frontendPath = path.join(__dirname, '../../public/index.html');
  if (require('fs').existsSync(frontendPath)) {
    return res.sendFile(frontendPath);
  }
  res.send('Cổng thông tin THCS API Backend đang hoạt động!');
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 API Gateway & Server THCS đang khởi chạy tại: http://localhost:${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/posts`);
  console.log(`====================================================`);
});
