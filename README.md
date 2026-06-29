# TrueMoney Wallet Top-up API

API สำหรับเติมเงินด้วย TrueMoney Wallet (ซองอังเปา) รองรับการเชื่อมต่อจาก PHP, JavaScript, HTML, และ Python

## วิธีติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
cd c:\xampp\htdocs\topup-api
npm install
```

### 2. เริ่ม Server

```bash
npm start
```

หรือใช้โหมด development (ต้องติดตั้ง nodemon):

```bash
npm run dev
```

Server จะรันที่ `http://localhost:3002`

## API Endpoints

### 1. Health Check
```http
GET /api/health
```

### 2. ดูยอดเงินคงเหลือ
```http
GET /api/balance
```

**Response:**
```json
{
  "success": true,
  "balance": 1000,
  "currency": "THB"
}
```

### 3. สร้างรายการเติมเงิน
```http
POST /api/topup
Content-Type: application/json

{
  "angpao_link": "https://gift.truemoney.com/campaign/?v=example",
  "phone_number": "0812345678",
  "amount": 100
}
```

**Parameters:**
- `angpao_link` (required): ลิงก์ซองอังเปาจาก TrueMoney
- `phone_number` (required): เบอร์โทรศัพท์ (รูปแบบ: 0x xxxxxxxx)
- `amount` (optional): จำนวนเงิน

**Response:**
```json
{
  "success": true,
  "message": "Top-up request created successfully",
  "transaction": {
    "id": "TXN1234567890ABC",
    "phone_number": "0812345678",
    "amount": 100,
    "status": "pending",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. ตรวจสอบสถานะรายการ
```http
GET /api/topup/:id
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "TXN1234567890ABC",
    "angpao_link": "https://gift.truemoney.com/campaign/?v=example",
    "phone_number": "0812345678",
    "amount": 100,
    "status": "completed",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:03.000Z"
  }
}
```

### 5. ดูรายการทั้งหมด
```http
GET /api/transactions?status=completed&limit=50
```

**Query Parameters:**
- `status` (optional): กรองตามสถานะ (pending, completed, failed)
- `limit` (optional): จำนวนรายการสูงสุด (default: 50)

### 6. รีเซ็ตระบบ (สำหรับทดสอบ)
```http
POST /api/reset
```

## ตัวอย่างการใช้งาน

### PHP

ดูไฟล์ `examples/php_example.php`

```php
$api = new TopUpAPI('http://localhost:3002');
$result = $api->createTopUp($angpaoLink, $phoneNumber, $amount);
```

วิธีรัน:
```bash
# วางไฟล์ใน htdocs แล้วเปิดผ่าน browser
http://localhost/topup-api/examples/php_example.php
```

### JavaScript/HTML

ดูไฟล์ `examples/html_example.html`

วิธีรัน:
```bash
# เปิดไฟล์ผ่าน browser
file:///c:/xampp/htdocs/topup-api/examples/html_example.html
```

### Python

ดูไฟล์ `examples/python_example.py`

ติดตั้ง dependencies:
```bash
pip install requests
```

วิธีรัน:
```bash
python examples/python_example.py
```

## โครงสร้างไฟล์

```
topup-api/
├── server.js              # Main API server
├── package.json           # Dependencies
├── transactions.json      # Transaction history (auto-generated)
├── balance.json           # Balance data (auto-generated)
├── examples/
│   ├── php_example.php   # PHP example
│   ├── html_example.html # HTML/JS example
│   └── python_example.py # Python example
└── README.md             # This file
```

## การ Deploy บน Render.com

### วิธีที่ 1: ผ่าน GitHub (แนะนำ)

1. **Push โค้ดไปยัง GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/topup-api.git
   git push -u origin main
   ```

2. **สร้าง Web Service บน Render**
   - ไปที่ [render.com](https://render.com)
   - กด "New +" → "Web Service"
   - เชื่อมต่อ GitHub repository
   - Render จะอ่าน `render.yaml` อัตโนมัติ
   - กด "Create Web Service"

3. **รอ Deploy**
   - Render จะติดตั้ง dependencies และรัน server
   - URL จะเป็นรูปแบบ: `https://topup-api.onrender.com`

### วิธีที่ 2: ผ่าน Render CLI

1. **ติดตั้ง Render CLI**
   ```bash
   npm install -g render-cli
   ```

2. **Login**
   ```bash
   render login
   ```

3. **Deploy**
   ```bash
   render deploy
   ```

### การตั้งค่า Environment Variables

บน Render คุณสามารถเพิ่ม environment variables ได้:
- `PORT`: 10000 (default ของ Render)
- `RENDER`: true (ตั้งค่าอัตโนมัติโดย render.yaml)

### การใช้งานหลัง Deploy

หลังจาก deploy เสร็จ ให้แก้ไข URL ในตัวอย่าง:

**PHP:**
```php
$api = new TopUpAPI('https://topup-api.onrender.com');
```

**JavaScript/HTML:**
```javascript
const API_BASE_URL = 'https://topup-api.onrender.com';
```

**Python:**
```python
api = TopUpAPI('https://topup-api.onrender.com')
```

### ข้อจำกัดของ Render Free Tier

- ข้อมูลจะถูกเก็บใน `/tmp` (จะหายไปเมื่อ redeploy)
- Free tier จะ sleep หลังจากไม่มี activity 15 นาที
- การ wake up อาจใช้เวลา 30-60 วินาที
- สำหรับ production แนะนำให้ใช้ database (PostgreSQL, Redis)

## หมายเหตุ

- API นี้เป็นตัวอย่างการทำงาน ในการใช้งานจริงต้องเชื่อมต่อกับ TrueMoney API อย่างเป็นทางการ
- ข้อมูลรายการและยอดเงินจะถูกบันทึกไว้ในไฟล์ JSON
- ระบบจะจำลองการประมวลผล (90% โอกาสสำเร็จ) ใช้สำหรับทดสอบเท่านั้น
- เมื่อ deploy บน Render ข้อมูลจะถูกเก็บใน `/tmp` และจะหายเมื่อ redeploy

## License

MIT
