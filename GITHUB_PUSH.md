# How to Push Ketsy Wear to GitHub

## Step 1 — Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ketsy-wear`
3. Set to **Private** (recommended until ready to launch)
4. Do NOT initialize with README, .gitignore, or license
5. Click **Create repository**

---

## Step 2 — Open Terminal in Your Project Folder

Open Terminal and navigate to your KETSY WEAR folder:

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR
```

---

## Step 3 — Initialize Git and Push

Copy and paste these commands one at a time:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit — Ketsy Wear full-stack e-commerce"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ketsy-wear.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 4 — Verify

Visit `https://github.com/YOUR_USERNAME/ketsy-wear` — you should see all your files!

---

## From This Point On

Every time you make changes:

```bash
cd ~/Documents/Claude/Projects/KETSY\ WEAR
git add .
git commit -m "Describe what you changed"
git push
```

---

## Important — What's NOT pushed (protected by .gitignore)

- `backend/.env` — your secrets (never commit this!)
- `node_modules/` — reinstall with `npm install`
- `frontend/build/` — regenerate with `npm run build`

---

## Next: Deploy to the Web

See SETUP.md for full deployment instructions (Vercel + Render recommended).

**Quick summary:**
1. Push to GitHub ✅ (done above)
2. Backend → Deploy on [Render.com](https://render.com) (free tier available)
3. Frontend → Deploy on [Vercel.com](https://vercel.com) (free tier)
4. Database → [MongoDB Atlas](https://mongodb.com/atlas) (free 512MB)
