# Syosetu API Backend

Enterprise-grade Fastify TypeScript API chuyên dụng để lấy dữ liệu từ trang web tiểu thuyết Nhật Bản **syosetu.com** sử dụng API chính thức và Cheerio scraping (serverless-ready).

## ✨ Tính năng

- 📊 **Lấy ranking tiểu thuyết** theo thể loại và thời gian
- 📚 **Lấy thông tin chi tiết tiểu thuyết** (metadata, danh sách chapter)
- 📖 **Lấy nội dung chapter đầy đủ** với Cheerio scraping
- 🔍 **Tìm kiếm tiểu thuyết** với nhiều bộ lọc nâng cao
- 🛡️ **Bảo mật enterprise** với Helmet, CORS, Rate Limiting
- ⚡ **Hiệu suất cao** với caching thông minh và Cheerio
- 🚀 **Serverless ready** - tối ưu cho Vercel, Netlify, AWS Lambda
- 📝 **TypeScript** với type safety hoàn toàn
- 📚 **Swagger Documentation** tự động
- 🧪 **Testing** với Jest
- 📊 **Logging** với Pino
- 🏗️ **Architecture** chuẩn enterprise

## 🚀 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd WebDataBackend

# Cài đặt dependencies
npm install

# Copy và cấu hình environment
cp .env.example .env

# Build TypeScript
npm run build

# Chạy ở chế độ development
npm run dev

# Chạy ở chế độ production
npm start
```

## 📋 Scripts

```bash
npm run build          # Build TypeScript to JavaScript
npm start              # Chạy server production
npm run dev            # Chạy server development với hot reload
npm run dev:watch      # Chạy server development với nodemon
npm test               # Chạy tests
npm run test:watch     # Chạy tests với watch mode
npm run test:coverage  # Chạy tests với coverage report
npm run lint           # Kiểm tra code style
npm run lint:fix       # Tự động sửa code style
npm run format         # Format code với Prettier
npm run clean          # Xóa thư mục dist
npm run typecheck      # Kiểm tra TypeScript types
```

## 🌐 API Endpoints

### Health Check

```
GET /health                    # Health check cơ bản
GET /api/syosetu/status       # Status chi tiết với cache stats
```

### Novel Data

```
GET /api/syosetu/novel/:ncode                    # Lấy thông tin tiểu thuyết
GET /api/syosetu/novel/:ncode/chapter/:chapter   # Lấy nội dung chapter
POST /api/syosetu/novel/:ncode/chapters          # Lấy nhiều chapter (max 10)
```

### Search & Ranking

```
GET /api/syosetu/search       # Tìm kiếm tiểu thuyết
GET /api/syosetu/ranking      # Lấy ranking tiểu thuyết
```

### Documentation

```
GET /docs                     # Swagger UI Documentation
```

## 📖 API Documentation

Sau khi chạy server, truy cập:

- **Swagger UI**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`

## 🏗️ Cấu trúc dự án

```
src/
├── config/           # Cấu hình ứng dụng
├── controllers/      # Controllers xử lý request
├── middleware/       # Middleware functions
├── routes/          # Route definitions
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── test/            # Test files
├── app.ts           # Fastify app setup
└── server.ts        # Server entry point
```

## ⚙️ Cấu hình Environment

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# API Settings
API_TIMEOUT=30000
MAX_CONCURRENT_REQUESTS=5

# Puppeteer
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=

# CORS
CORS_ORIGIN=*
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 phút
RATE_LIMIT_MAX=100               # 100 requests/15 phút
CONTENT_RATE_LIMIT_WINDOW_MS=300000  # 5 phút
CONTENT_RATE_LIMIT_MAX=20        # 20 requests/5 phút

# Logging
LOG_LEVEL=info
LOG_PRETTY_PRINT=true

# Cache
METADATA_CACHE_TTL=600           # 10 phút
CONTENT_CACHE_TTL=3600           # 1 giờ

# External APIs
SYOSETU_API_BASE_URL=https://api.syosetu.com/novelapi/api/
SYOSETU_NCODE_BASE_URL=https://ncode.syosetu.com
```

## 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Chạy tests với coverage
npm run test:coverage

# Chạy tests cho file cụ thể
npm test -- health.test.ts
```

## 📊 Monitoring & Logging

- **Health Check**: `/health` và `/api/syosetu/status`
- **Logs**: Sử dụng Pino với pretty printing trong development
- **Cache Stats**: Xem thống kê cache trong status endpoint
- **Browser Status**: Kiểm tra trạng thái Puppeteer browser

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API và content rate limiting riêng biệt
- **Input Validation**: Zod schema validation
- **Error Handling**: Comprehensive error handling
- **Type Safety**: Full TypeScript coverage

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### PM2

```bash
npm run build
pm2 start dist/server.js --name syosetu-api
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm hoặc yarn
- Chrome/Chromium (cho Puppeteer)

### Setup Development Environment

```bash
# Clone và cài đặt
git clone <repo>
cd WebDataBackend
npm install

# Cấu hình environment
cp .env.example .env

# Chạy development server
npm run dev
```

### Code Style

- **ESLint**: Linting với TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled
- **Husky**: Git hooks (nếu cần)

## 📈 Performance

- **Caching**: NodeCache với TTL cho metadata và content
- **Rate Limiting**: Ngăn chặn abuse
- **Connection Pooling**: Tái sử dụng browser instances
- **Request Optimization**: Chặn resources không cần thiết

## 🐛 Troubleshooting

### Lỗi Chromium không khởi động

```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser

# Hoặc set executable path
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Lỗi Memory

```bash
# Tăng memory limit cho Node.js
node --max-old-space-size=4096 dist/server.js
```

### Lỗi Rate Limiting

- Kiểm tra cấu hình rate limit trong .env
- Syosetu.com có thể chậm vào giờ cao điểm

## 📄 License

MIT License

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs` endpoint
- **Health Check**: `/health` endpoint
