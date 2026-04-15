# Ketsy Wear — Complete Launch Guide
### From Zero to Live Website with Your GoDaddy Domain

> **Yes, you still need Render** — Render runs your backend server (Node.js).  
> Vercel hosts your frontend (React). GoDaddy domain points to Vercel.  
> Everything works together.

---

## OVERVIEW OF WHAT YOU'LL DO

```
Your Computer  →  GitHub  →  Render (backend API)
                         →  Vercel (frontend website)  ←  GoDaddy Domain
```

**Estimated time: 2–3 hours (most of it is waiting for deployments)**

---

---

# PHASE 1 — INSTALL TOOLS ON YOUR MAC
### (Do this first — only needs to be done once)

---

## Step 1 — Install Homebrew (Mac package manager)

Open **Terminal** (press Cmd+Space, type "Terminal", press Enter).

Paste this and press Enter:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. When it asks for your Mac password, type it (it won't show) and press Enter.

---

## Step 2 — Install Node.js

In Terminal, paste:

```bash
brew install node
```

Verify it worked:

```bash
node --version
npm --version
```

You should see version numbers like `v20.x.x` and `10.x.x`.

---

## Step 3 — Install Git

```bash
brew install git
```

Verify:

```bash
git --version
```

---

## Step 4 — Configure Git with your name and email

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your@email.com"
```

*(Use the same email you'll use for GitHub)*

---

---

# PHASE 2 — SET UP FREE ACCOUNTS
### (You need these services — all have free tiers)

---

## Step 5 — Create a MongoDB Atlas account (FREE database)

1. Go to **https://mongodb.com/atlas**
2. Click **"Try Free"** → Sign up with Google or email
3. Choose **"M0 Free"** tier → Select region closest to Ghana (e.g. `Europe West`)
4. Click **Create**
5. When asked "How are you using MongoDB?" → choose **"I'm learning MongoDB"**

**Create a database user:**
6. Left sidebar → **"Database Access"** → Click **"Add New Database User"**
7. Authentication: **Password**
8. Username: `ketsyadmin`
9. Password: Click **"Autogenerate Secure Password"** → **COPY AND SAVE THIS PASSWORD**
10. Scroll down → Click **"Add User"**

**Allow all connections:**
11. Left sidebar → **"Network Access"** → Click **"Add IP Address"**
12. Click **"Allow Access from Anywhere"** → Click **"Confirm"**

**Get your connection string:**
13. Left sidebar → **"Database"** → Click **"Connect"** on your cluster
14. Choose **"Drivers"**
15. Copy the string — it looks like:
```
mongodb+srv://ketsyadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
16. Replace `<password>` with the password you saved in Step 9
17. Add `/ketsy` before the `?` so it becomes:
```
mongodb+srv://ketsyadmin:YOURPASSWORD@cluster0.xxxxx.mongodb.net/ketsy?retryWrites=true&w=majority
```
**Save this full string — you'll need it soon.**

---

## Step 6 — Create a Cloudinary account (FREE image hosting)

1. Go to **https://cloudinary.com** → Click **"Sign Up For Free"**
2. Fill in the form and verify your email
3. After logging in, you'll see your **Dashboard**
4. Note down:
   - **Cloud Name** (e.g. `dxyz12345`)
   - **API Key** (a long number)
   - **API Secret** (click "reveal" to see it)

**Save all three — you'll need them soon.**

---

## Step 7 — Create a Paystack account (Ghana mobile money + cards)

1. Go to **https://paystack.com** → Click **"Create a free account"**
2. Fill in your details (use your business info for Ketsy Wear)
3. After signing in → Go to **Settings → API Keys**
4. You'll see **Test Secret Key** and **Test Public Key**
5. Copy both — they start with `sk_test_...` and `pk_test_...`

**Save both keys — you'll need them soon.**

> ℹ️ You'll stay in "test mode" until Paystack approves your business account. Test mode works fully for testing.

---

## Step 8 — Set up Gmail for sending emails

1. Log into your Gmail account
2. Go to **https://myaccount.google.com/security**
3. Make sure **"2-Step Verification"** is **ON** (turn it on if not)
4. Go to **https://myaccount.google.com/apppasswords**
5. Select app: **Mail** → Select device: **Mac**
6. Click **Generate**
7. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop`)

**Save this password — you'll need it soon.**

---

---

# PHASE 3 — SET UP THE PROJECT ON YOUR MAC

---

## Step 9 — Open the project folder in Terminal

In Terminal, type:

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR
```

Press Enter. You should now be inside the project folder.

Verify the files are there:

```bash
ls
```

You should see: `backend`, `frontend`, `.gitignore`, `SETUP.md`, `docker-compose.yml`

---

## Step 10 — Create the backend environment file

```bash
cd backend
cp .env.example .env
```

Now open the file to edit it:

```bash
open -a TextEdit .env
```

**Replace EVERY placeholder with your real values:**

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Paste your MongoDB connection string from Step 5
MONGODB_URI=mongodb+srv://ketsyadmin:YOURPASSWORD@cluster0.xxxxx.mongodb.net/ketsy?retryWrites=true&w=majority

# Generate a secret key by pasting this in a new Terminal tab:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=PASTE_THE_64_CHAR_KEY_HERE
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Your Gmail details from Step 8
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=Ketsy Wear <noreply@ketsywear.com>

# Paystack keys from Step 7
PAYSTACK_SECRET_KEY=sk_test_XXXXXXXXXXXX
PAYSTACK_PUBLIC_KEY=pk_test_XXXXXXXXXXXX

# Leave Stripe blank for now (Paystack is enough for Ghana)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary from Step 6
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin account credentials
ADMIN_EMAIL=admin@ketsywear.com
ADMIN_PASSWORD=Admin@Ketsy2024

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Save and close TextEdit.

**Generate your JWT secret** — open a new Terminal tab (Cmd+T) and paste:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as the `JWT_SECRET` value in your `.env` file.

---

## Step 11 — Install backend dependencies

Make sure you're in the backend folder:

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR/backend
npm install
```

This will take 1-3 minutes. Wait until it finishes.

---

## Step 12 — Install frontend dependencies

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR/frontend
npm install
```

This will take 2-5 minutes. Wait until it finishes.

---

## Step 13 — Start both servers (test locally)

**Open 2 Terminal tabs** (press Cmd+T to open a second tab).

**Tab 1 — Start Backend:**
```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR/backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Ketsy server running on port 5000 in development mode
```

**Tab 2 — Start Frontend:**
```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR/frontend
npm start
```

After about 30 seconds, your browser will automatically open at **http://localhost:3000** and you'll see the Ketsy Wear website!

---

## Step 14 — Create the admin account + add sample products

Open a **3rd Terminal tab** (Cmd+T) while both servers are running.

**Create admin account:**
```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR/backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const bcrypt = require('bcryptjs');
  const User = require('./src/models/User');
  try {
    await User.create({
      name: 'Ketsy Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log('✅ Admin account created!');
    console.log('Email:', process.env.ADMIN_EMAIL);
    console.log('Password:', process.env.ADMIN_PASSWORD);
  } catch(e) {
    if (e.code === 11000) console.log('✅ Admin already exists');
    else console.error('Error:', e.message);
  }
  process.exit(0);
});
"
```

**Add sample products:**
```bash
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./src/models/Product');
  const count = await Product.countDocuments();
  if (count > 0) { console.log('Products already exist:', count); process.exit(0); }
  await Product.insertMany([
    { name: 'Classic Custom T-Shirt', description: 'Premium 100% cotton t-shirt. Upload your own design or add custom text. Perfect for teams, events, and personal style.', category: 't-shirts', price: 45, stock: 100, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#000000' }, { name: 'Red', hex: '#e94560' }, { name: 'Navy', hex: '#1a237e' }], availableSizes: ['XS','S','M','L','XL','XXL'] } },
    { name: 'Premium Joggers', description: 'Slim-fit joggers made from soft fleece material. Great for gym, travel, or casual wear. Add your name or logo.', category: 'joggers', price: 80, stock: 50, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: false, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Grey', hex: '#808080' }, { name: 'Navy', hex: '#1a237e' }], availableSizes: ['S','M','L','XL','XXL'] } },
    { name: 'Custom Snapback Cap', description: 'Adjustable snapback cap. Customize with embroidery text or printed design on the front panel.', category: 'caps', price: 35, stock: 75, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#ffffff' }, { name: 'Red', hex: '#e94560' }], availableSizes: ['One Size'] } },
    { name: 'Personalized Ceramic Mug', description: 'High-quality 11oz ceramic mug. Upload your photo, logo, or message. Dishwasher safe.', category: 'cups', price: 25, stock: 200, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: false, availableColors: [{ name: 'White', hex: '#ffffff' }], availableSizes: ['Standard (11oz)', 'Large (15oz)'] } },
    { name: 'Custom Photo Frame', description: 'Elegant personalized photo frame. Add names, dates, or a special message. Available in multiple sizes.', category: 'frames', price: 55, stock: 30, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Gold', hex: '#FFD700' }, { name: 'Silver', hex: '#C0C0C0' }], availableSizes: ['4x6 inch', '5x7 inch', '8x10 inch'] } },
    { name: 'Ladies Crop Top', description: 'Trendy fitted crop top. Comfortable stretch fabric with custom print options. Perfect for everyday wear.', category: 'crop-tops', price: 40, stock: 60, featured: true, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#000000' }, { name: 'Pink', hex: '#ff69b4' }, { name: 'Red', hex: '#e94560' }], availableSizes: ['XS','S','M','L','XL'] } },
    { name: 'Athletic Shorts', description: 'Lightweight training shorts with moisture-wicking fabric. Add your team logo or name on the side.', category: 'shorts', price: 45, stock: 80, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: false, allowColorChange: true, availableColors: [{ name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#1a237e' }, { name: 'Grey', hex: '#808080' }], availableSizes: ['S','M','L','XL','XXL'] } },
    { name: 'Team Bundle — 5 T-Shirts', description: 'Order 5 matching custom t-shirts for your team or group. Same design, different names/numbers on each. Bulk discount applied.', category: 't-shirts', price: 200, discountPrice: 180, stock: 999, featured: false, isCustomizable: true, customizationOptions: { allowTextOverlay: true, allowImageUpload: true, allowColorChange: true, availableColors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#000000' }], availableSizes: ['S','M','L','XL','XXL'] } },
  ]);
  console.log('✅ 8 sample products added!');
  process.exit(0);
});
"
```

Now visit **http://localhost:3000** — you should see products on the homepage!

Visit **http://localhost:3000/admin** and log in with:
- Email: `admin@ketsywear.com`
- Password: `Admin@Ketsy2024`

If everything looks good, your site is working locally. ✅

**Stop both servers** (press Ctrl+C in both terminal tabs).

---

---

# PHASE 4 — PUSH TO GITHUB

---

## Step 15 — Create a GitHub account

1. Go to **https://github.com** → Click **Sign Up**
2. Enter your email, create a password, choose a username
3. Verify your email

---

## Step 16 — Create a new GitHub repository

1. After logging in → Click the **"+"** icon (top right) → **"New repository"**
2. Repository name: `ketsy-wear`
3. Set to **Private** (you can make it public later)
4. **Do NOT** tick any of the "Initialize" checkboxes
5. Click **"Create repository"**

GitHub will show you a page with setup commands — keep this open.

---

## Step 17 — Push the code

In Terminal:

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR
git init
git add .
git commit -m "Initial commit — Ketsy Wear full-stack e-commerce"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ketsy-wear.git
git push -u origin main
```

> Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

GitHub will ask for your username and password:
- Username: your GitHub username
- Password: you need a **Personal Access Token** (not your password)

**Create a Personal Access Token:**
1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token (classic)"**
3. Note: `ketsy-wear deploy`
4. Expiration: **No expiration**
5. Check **"repo"** scope
6. Click **"Generate token"**
7. Copy the token (starts with `ghp_...`) — use this as your "password" when prompted

After pushing, go to `https://github.com/YOUR_USERNAME/ketsy-wear` — you should see all your project files! ✅

---

---

# PHASE 5 — DEPLOY BACKEND ON RENDER

---

## Step 18 — Create a Render account

1. Go to **https://render.com** → Click **"Get Started for Free"**
2. Sign up with your GitHub account (easiest option)
3. Authorize Render to access your GitHub

---

## Step 19 — Deploy the backend

1. In Render dashboard → Click **"New +"** → **"Web Service"**
2. Connect repository → Select **`ketsy-wear`**
3. Fill in the settings:

| Setting | Value |
|---------|-------|
| Name | `ketsy-api` |
| Region | `Frankfurt (EU Central)` |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `node src/server.js` |
| Plan | **Free** |

4. Click **"Add Environment Variables"** — add ALL of these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://www.YOURDOMAIN.com` (your GoDaddy domain — add this now even if not connected yet) |
| `MONGODB_URI` | your full MongoDB connection string from Step 5 |
| `JWT_SECRET` | your 64-char key from Step 10 |
| `JWT_EXPIRE` | `30d` |
| `JWT_COOKIE_EXPIRE` | `30` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | your Gmail |
| `EMAIL_PASS` | your Gmail app password |
| `EMAIL_FROM` | `Ketsy Wear <noreply@ketsywear.com>` |
| `PAYSTACK_SECRET_KEY` | your sk_test_... key |
| `PAYSTACK_PUBLIC_KEY` | your pk_test_... key |
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your API key |
| `CLOUDINARY_API_SECRET` | your API secret |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX` | `100` |

5. Click **"Create Web Service"**

Render will now build and deploy your backend. This takes **5-10 minutes**.

6. When it shows **"Live"** with a green dot, copy your Render URL — it looks like:
```
https://ketsy-api.onrender.com
```

**Test it** — open that URL in your browser and add `/api/health`:
```
https://ketsy-api.onrender.com/api/health
```
You should see: `{"success":true,"message":"Ketsy API is running"}`  ✅

---

## Step 20 — Seed the production database

Once the backend is live, you need to add the admin and products to the production database.

Open Terminal on your Mac:

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR/backend
```

Temporarily change your `.env` to use the production environment (then we'll change it back):

```bash
# Create admin in production
NODE_ENV=production node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  try {
    await User.create({ name: 'Ketsy Admin', email: process.env.ADMIN_EMAIL || 'admin@ketsywear.com', password: process.env.ADMIN_PASSWORD || 'Admin@Ketsy2024', role: 'admin' });
    console.log('✅ Admin created in production');
  } catch(e) { if(e.code===11000) console.log('Already exists'); else console.error(e.message); }
  process.exit(0);
});
"
```

> Since your `.env` already points to MongoDB Atlas, this seeds the same database your production server uses.

---

---

# PHASE 6 — DEPLOY FRONTEND ON VERCEL

---

## Step 21 — Create a Vercel account

1. Go to **https://vercel.com** → Click **"Sign Up"**
2. Continue with **GitHub** (easiest)
3. Authorize Vercel

---

## Step 22 — Deploy the frontend

1. In Vercel dashboard → Click **"Add New..."** → **"Project"**
2. Import your `ketsy-wear` repository
3. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | `Create React App` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |

4. Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://ketsy-api.onrender.com/api` |

5. Click **"Deploy"**

Vercel will build your frontend. This takes **3-5 minutes**.

When done, Vercel gives you a URL like:
```
https://ketsy-wear.vercel.app
```

**Test it** — open the URL, click around, try registering an account. If products show up, you're live! ✅

---

---

# PHASE 7 — CONNECT YOUR GODADDY DOMAIN

---

## Step 23 — Add your domain to Vercel

1. In your Vercel project → Click **"Settings"** tab → **"Domains"**
2. Type in your GoDaddy domain (e.g. `ketsywear.com`) → Click **"Add"**
3. Also add `www.ketsywear.com` → Click **"Add"**
4. Vercel will show you DNS records you need to add. **Keep this page open.**

---

## Step 24 — Update DNS on GoDaddy

1. Log into **https://godaddy.com** → Go to **"My Products"**
2. Find your domain → Click **"DNS"** or **"Manage DNS"**
3. You'll see a table of DNS records

**Delete any existing A records and CNAME for `www`** (click the trash icon next to them).

**Add these new records** (click "Add" for each):

**Record 1 — Root domain (`@`):**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| `A` | `@` | `76.76.21.21` | 600 |

**Record 2 — www subdomain:**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| `CNAME` | `www` | `cname.vercel-dns.com` | 600 |

4. Click **Save**

---

## Step 25 — Wait for DNS to propagate

DNS changes take **15 minutes to 48 hours** to fully propagate.

After about 15-30 minutes, go back to your Vercel project → Settings → Domains. You should see a **green checkmark** next to both domain entries.

**Test your live website:**
- `https://ketsywear.com` ← your custom domain!
- `https://www.ketsywear.com` ← also works

---

## Step 26 — Update the backend CORS to match your domain

Now that you know your exact domain, update Render:

1. Go to Render → your `ketsy-api` service → **"Environment"**
2. Update `CLIENT_URL` to: `https://www.ketsywear.com`
3. Click **"Save Changes"** — Render will auto-redeploy

---

---

# PHASE 8 — FINAL CHECKS ✅

---

## Step 27 — Test everything end to end

Go through this checklist on your live website:

- [ ] Homepage loads with products
- [ ] Can browse the Shop and filter by category
- [ ] Can view a product detail page
- [ ] Can register a new account
- [ ] Can log in
- [ ] Can add products to cart
- [ ] Cart persists (refresh the page)
- [ ] Can go through checkout
- [ ] Admin panel works at `https://ketsywear.com/admin`
- [ ] Admin can see orders and update status

---

## Step 28 — Switch Paystack to LIVE mode (when ready)

When you're ready to accept real payments:

1. Log into **Paystack** → complete business verification
2. Once approved → go to Settings → API Keys
3. Copy the **LIVE Secret Key** (starts with `sk_live_...`) and **LIVE Public Key**
4. In Render → update:
   - `PAYSTACK_SECRET_KEY` to `sk_live_...`
   - `PAYSTACK_PUBLIC_KEY` to `pk_live_...`
5. Render will redeploy automatically

---

---

# QUICK REFERENCE — YOUR URLS

| Service | URL |
|---------|-----|
| Live Website | `https://ketsywear.com` |
| Admin Panel | `https://ketsywear.com/admin` |
| Backend API | `https://ketsy-api.onrender.com/api` |
| GitHub Repo | `https://github.com/YOUR_USERNAME/ketsy-wear` |
| Vercel Dashboard | `https://vercel.com/dashboard` |
| Render Dashboard | `https://dashboard.render.com` |
| MongoDB Atlas | `https://cloud.mongodb.com` |

---

# HOW TO UPDATE YOUR WEBSITE IN THE FUTURE

Whenever you want to make changes:

```bash
# 1. Make your changes to files
# 2. Then push to GitHub:
cd ~/Documents/Claude/Projects/KETSY\ WEAR
git add .
git commit -m "Describe what you changed"
git push
```

**Both Render and Vercel automatically redeploy every time you push to GitHub.** 🎉

---

# TROUBLESHOOTING

**"MongoDB connection error" on Render:**
→ Check your `MONGODB_URI` in Render environment variables — make sure `<password>` was replaced.

**"CORS error" in browser console:**
→ Check that `CLIENT_URL` in Render matches your exact domain (with `https://`).

**Products not loading:**
→ Check if your backend is awake — visit `https://ketsy-api.onrender.com/api/health`  
→ Note: Free Render tier "sleeps" after 15 minutes. First visit may take 30-60 seconds to wake up.

**Domain not connecting:**
→ DNS takes up to 48 hours. Check status at https://dnschecker.org

**Emails not sending:**
→ Make sure you used a Gmail App Password (not your regular Gmail password).
