# Hướng dẫn Test API với Postman

## 📋 Mục lục

1. [Cài đặt và Chuẩn bị](#cài-đặt-và-chuẩn-bị)
2. [Import Collection](#import-collection)
3. [Environment Variables](#environment-variables)
4. [Test Cases](#test-cases)
5. [Automated Testing](#automated-testing)
6. [Troubleshooting](#troubleshooting)

## 🚀 Cài đặt và Chuẩn bị

### 1. Cài đặt Postman
- Tải và cài đặt [Postman](https://www.postman.com/downloads/)
- Hoặc sử dụng Postman Web tại [web.postman.co](https://web.postman.co)

### 2. Khởi động Server
```bash
# Clone và setup project
git clone <repository-url>
cd WebDataBackend
npm install

# Chạy server development
npm run dev

# Server sẽ chạy tại: http://localhost:3000
```

## 📦 Import Collection

### Tạo Collection mới
1. Mở Postman
2. Click "New" → "Collection"
3. Đặt tên: "Syosetu API Backend v3.0"
4. Thêm description: "Enterprise-grade Fastify TypeScript API for Syosetu.com"

### Hoặc Import JSON Collection
```json
{
  "info": {
    "name": "Syosetu API Backend v3.0",
    "description": "Enterprise-grade Fastify TypeScript API for Syosetu.com",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

## 🌍 Environment Variables

### Tạo Environment
1. Click "Environments" → "Create Environment"
2. Đặt tên: "Development"
3. Thêm variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |
| `apiUrl` | `{{baseUrl}}/api/syosetu` | `{{baseUrl}}/api/syosetu` |
| `testNcode` | `n4754kf` | `n4754kf` |
| `testChapter` | `1` | `1` |

## 🧪 Test Cases

### 1. Health Check Endpoints

#### Basic Health Check
```
GET {{baseUrl}}/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "message": "Syosetu API Backend v3.0 đang hoạt động",
    "version": "3.0.0",
    "services": [...],
    "endpoints": {...},
    "features": [...],
    "timestamp": "2025-06-10T08:35:36.953Z"
  },
  "timestamp": "2025-06-10T08:35:36.953Z"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has correct version", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.version).to.eql("3.0.0");
});
```

#### Detailed Status Check
```
GET {{apiUrl}}/status
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has cache stats", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property("cache");
    pm.expect(jsonData.data.cache).to.have.property("metadata");
    pm.expect(jsonData.data.cache).to.have.property("content");
});

pm.test("Response has browser status", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property("browser");
});
```

### 2. Novel Metadata

#### Get Novel Details
```
GET {{apiUrl}}/novel/{{testNcode}}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has novel data", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("ncode");
    pm.expect(jsonData.data).to.have.property("title");
    pm.expect(jsonData.data).to.have.property("author");
});

pm.test("Ncode matches request", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.ncode.toLowerCase()).to.eql(pm.environment.get("testNcode").toLowerCase());
});
```

#### Invalid Ncode Test
```
GET {{apiUrl}}/novel/invalid123!@#
```

**Tests Script:**
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Response has error message", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.error).to.include("không hợp lệ");
});
```

### 3. Chapter Content

#### Get Single Chapter
```
GET {{apiUrl}}/novel/{{testNcode}}/chapter/{{testChapter}}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has chapter content", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("title");
    pm.expect(jsonData.data).to.have.property("htmlContent");
    pm.expect(jsonData.data).to.have.property("textContent");
    pm.expect(jsonData.data).to.have.property("characterCount");
});

pm.test("Chapter number matches request", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.chapterNumber).to.eql(parseInt(pm.environment.get("testChapter")));
});
```

#### Get Multiple Chapters
```
POST {{apiUrl}}/novel/{{testNcode}}/chapters
Content-Type: application/json

{
  "chapters": [1, 2, 3]
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has multiple chapters", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data.chapters).to.be.an("array");
    pm.expect(jsonData.data.totalRequested).to.eql(3);
});
```

### 4. Search Functionality

#### Basic Search
```
GET {{apiUrl}}/search?keyword=異世界&limit=10&order=new
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has search results", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("keyword");
    pm.expect(jsonData.data).to.have.property("results");
    pm.expect(jsonData.data.results).to.be.an("array");
});

pm.test("Results have required fields", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.results.length > 0) {
        const firstResult = jsonData.data.results[0];
        pm.expect(firstResult).to.have.property("ncode");
        pm.expect(firstResult).to.have.property("title");
        pm.expect(firstResult).to.have.property("author");
    }
});
```

#### Search with Invalid Parameters
```
GET {{apiUrl}}/search?keyword=&limit=1000
```

**Tests Script:**
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});
```

### 5. Ranking

#### Get Ranking
```
GET {{apiUrl}}/ranking?order=hyoka&limit=20
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has ranking data", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.have.property("rankings");
    pm.expect(jsonData.data.rankings).to.be.an("array");
});

pm.test("Rankings have rank numbers", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.rankings.length > 0) {
        jsonData.data.rankings.forEach((item, index) => {
            pm.expect(item.rank).to.eql(index + 1);
        });
    }
});
```

## 🤖 Automated Testing

### Collection Runner
1. Click "Collections" → "Syosetu API Backend v3.0"
2. Click "Run" button
3. Select environment: "Development"
4. Click "Run Syosetu API Backend v3.0"

### Newman CLI
```bash
# Cài đặt Newman
npm install -g newman

# Export collection và environment từ Postman
# Chạy tests
newman run syosetu-collection.json -e development-env.json --reporters cli,html
```

### Pre-request Scripts

#### Set Dynamic Variables
```javascript
// Set current timestamp
pm.environment.set("timestamp", new Date().toISOString());

// Set random ncode for testing
const ncodes = ["n4754kf", "n9669bk", "n8611bv"];
const randomNcode = ncodes[Math.floor(Math.random() * ncodes.length)];
pm.environment.set("randomNcode", randomNcode);
```

### Global Tests

#### Response Time Test
```javascript
pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

#### Content Type Test
```javascript
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solution:** Đảm bảo server đang chạy với `npm run dev`

#### 2. Rate Limiting
```json
{
  "success": false,
  "error": "Too many requests"
}
```
**Solution:** Đợi 15 phút hoặc restart server

#### 3. Invalid Ncode
```json
{
  "success": false,
  "error": "Ncode không hợp lệ"
}
```
**Solution:** Sử dụng ncode hợp lệ (ví dụ: n4754kf)

### Debug Tips

1. **Check Server Logs:** Xem terminal chạy `npm run dev`
2. **Verify Environment:** Đảm bảo đang sử dụng đúng environment
3. **Test Health First:** Luôn test `/health` trước
4. **Check Rate Limits:** Không gửi quá nhiều requests liên tiếp

### Performance Testing

#### Load Testing với Newman
```bash
# Chạy collection 10 lần
newman run collection.json -n 10

# Chạy với delay giữa requests
newman run collection.json --delay-request 1000
```

## 📊 Monitoring

### Response Time Tracking
```javascript
// Trong Tests tab
const responseTime = pm.response.responseTime;
console.log(`Response time: ${responseTime}ms`);

// Set thresholds
if (responseTime > 3000) {
    console.warn("Slow response detected!");
}
```

### Error Rate Monitoring
```javascript
// Track success rate
const isSuccess = pm.response.json().success;
pm.globals.set("totalRequests", (pm.globals.get("totalRequests") || 0) + 1);
if (isSuccess) {
    pm.globals.set("successfulRequests", (pm.globals.get("successfulRequests") || 0) + 1);
}
```

## 🎯 Best Practices

1. **Organize Tests:** Sử dụng folders để nhóm related requests
2. **Use Variables:** Tránh hardcode URLs và values
3. **Add Descriptions:** Mô tả rõ ràng cho mỗi request
4. **Test Edge Cases:** Test cả success và error scenarios
5. **Monitor Performance:** Track response times và error rates
6. **Automate:** Sử dụng Newman cho CI/CD pipeline

## 📝 Sample Collection Structure

```
📁 Syosetu API Backend v3.0
├── 📁 Health Checks
│   ├── Basic Health Check
│   └── Detailed Status
├── 📁 Novel Data
│   ├── Get Novel Metadata
│   ├── Invalid Ncode Test
│   ├── Get Single Chapter
│   └── Get Multiple Chapters
├── 📁 Search & Discovery
│   ├── Basic Search
│   ├── Advanced Search
│   └── Search Validation
└── 📁 Rankings
    ├── Default Ranking
    ├── Genre Ranking
    └── Custom Ranking
```
