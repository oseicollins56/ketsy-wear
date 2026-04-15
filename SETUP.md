# Ketsy Wear — Full Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

---

## 1. Clone & Install Dependencies

```bash
git clone https://github.com/YOUR_USERNAME/ketsy-wear.git
cd ketsy-wear

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

---

## 2. Backend Environment Setup

Copy the example and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Atlas (free tier works fine)
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/ketsy

# JWT - generate a strong secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_64_char_random_string_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email (use Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Ketsy Wear <noreply@ketsywear.com>"

# Paystack (https://paystack.com - Ghana)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Stripe (optional for international cards)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (https://cloudinary.com - free tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 3. Create Admin Account

Start the backend and run:
```bash
cd backend
node -e "
require('dotenv').config();
require('./src/config/db')();
const User = require('./src/models/User');
setTimeout(async () => {
  try {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@ketsywear.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin'
    });
    console.log('✅ Admin created!');
    process.exit(0);
  } catch(e) {
    if (e.code === 11000) console.log('Admin already exists');
    else console.error(e);
    process.exit(0);
  }
}, 2000);
"
```

---

## 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## 5. Seed Sample Products (optional)

```bash
cd backend
node -e "
require('dotenv').config();
require('./src/config/db')();
const Product = require('./src/models/Product');

const products = [
  { name: 'Classic Custom T-Shirt', description: 'Premium 100% cotton t-shirt you can fully customize with your own design or text.', category: 't-shirts', price: 45, stock: 100, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#000000' }, { name: 'Red', hex: '#e94560' }], availableSizes: ['XS','S','M','L','XL','XXL'] } },
  { name: 'Premium Joggers', description: 'Comfortable slim-fit joggers perfect for gym or casual wear. Customizable with your name or logo.', category: 'joggers', price: 80, stock: 50, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: false, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Grey', hex: '#808080' }], availableSizes: ['S','M','L','XL','XXL'] } },
  { name: 'Custom Snapback Cap', description: 'Adjustable snapback cap with embroidery or print customization options.', category: 'caps', price: 35, stock: 75, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#1a237e' }, { name: 'Red', hex: '#e94560' }], availableSizes: ['One Size'] } },
  { name: 'Personalized Mug', description: 'High-quality ceramic mug with your photo, design, or message printed on it.', category: 'cups', price: 25, stock: 200, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: false, availableColors: [{ name: 'White', hex: '#ffffff' }], availableSizes: ['Standard (11oz)', 'Large (15oz)'] } },
  { name: 'Custom Photo Frame', description: 'Elegant customized photo frame to immortalize your memories.', category: 'frames', price: 55, stock: 30, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Gold', hex: '#FFD700' }, { name: 'Silver', hex: '#C0C0C0' }], availableSizes: ['4x6', '5x7', '8x10'] } },
  { name: 'Ladies Crop Top', description: 'Trendy crop top available in various colors with custom print options.', category: 'crop-tops', price: 40, stock: 60, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#000000' }, { name: 'Pink', hex: '#ff69b4' }], availableSizes: ['XS','S','M','L','XL'] } },
  { name: 'Athletic Shorts', description: 'Lightweight athletic shorts perfect for workouts or lounging. Customizable with your team logo.', category: 'shorts', price: 45, stock: 80, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: false, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#1a237e' }, { name: 'Grey', hex: '#808080' }], availableSizes: ['S','M','L','XL','XXL'] } },
];

setTimeout(async () => {
  try {
    await Product.insertMany(products);
    console.log('✅ Sample products seeded!');
  } catch(e) { console.error(e); }
  process.exit(0);
}, 2000);
"
```

---

## 6. Paystack Setup (Ghana Mobile Money)

1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys
3. Copy Test Secret Key and Public Key to your `.env`
4. For Mobile Money: Enable MTN, Vodafone, AirtelTigo in Paystack Dashboard
5. Set webhook URL: `https://yourdomain.com/api/payment/paystack/webhook`

---

## 7. Cloudinary Setup (Image Uploads)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25GB)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `.env`

---

## 8. Gmail App Password (Emails)

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail"
4. Use as `EMAIL_PASS` in `.env`

---

## 9. Production Deployment

### Option A: Vercel (Frontend) + Render (Backend)

**Backend on Render:**
1. Push to GitHub
2. Create account at [render.com](https://render.com)
3. New Web Service → connect your repo → select `/backend`
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add all environment variables
7. Get your Render URL (e.g. `https://ketsy-api.onrender.com`)

**Frontend on Vercel:**
1. Create account at [vercel.com](https://vercel.com)
2. Import your repo → set Root Directory to `frontend`
3. Add env var: `REACT_APP_API_URL=https://ketsy-api.onrender.com/api`
4. Deploy!

### Option B: Docker

```bash
# Copy and fill in environment
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Build and run
docker-compose up -d

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

---

## 10. MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create Free Account
2. Create a free M0 cluster (512MB, always free)
3. Database Access → Add User (remember password)
4. Network Access → Add IP (0.0.0.0/0 for cloud access)
5. Clusters → Connect → Drivers → copy connection string
6. Replace `<password>` in the string and add to `.env`

---

## Project Structure

```
ketsy-wear/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error, upload
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Email helpers
│   │   └── server.js        # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth & Cart contexts
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin pages
│   │   └── utils/           # API client
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── SETUP.md
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | — |
| POST | /api/auth/login | Login | — |
| GET | /api/auth/me | Get current user | ✅ |
| GET | /api/products | Get products (filterable) | — |
| POST | /api/products | Create product | Admin |
| POST | /api/orders | Create order | ✅ |
| POST | /api/payment/paystack/initialize | Init payment | ✅ |
| POST | /api/payment/mobile-money/initiate | Init Momo | ✅ |
| GET | /api/admin/dashboard | Admin stats | Admin |

---

## Security Features

- ✅ JWT in HTTP-only cookies
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Rate limiting (100 req/15min globally, 10 for auth)
- ✅ NoSQL injection prevention (mongo-sanitize)
- ✅ XSS protection (xss-clean + helmet)
- ✅ CORS configured
- ✅ HTTP security headers (helmet)
- ✅ File upload validation (images only, 5MB max)
- ✅ HTTPS enforcement in production
- ✅ Environment variables for all secrets
