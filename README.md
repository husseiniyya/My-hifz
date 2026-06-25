# حلقة التحفيظ القرآن الكريم
## Quran Memorisation Circle Portal

---

## 🔐 Admin Login
| Field    | Value             |
|----------|-------------------|
| Email    | admin@hifz.com    |
| Password | Admin@1234        |

> **Important:** Change these in `src/App.js` — look for `ADMIN_EMAIL` and `ADMIN_PASSWORD` at the top of the file.

---

## 🚀 Deploy to Netlify (Free — 3 Steps)

### Option A: Drag & Drop (No account needed for quick test)
1. Run `npm install && npm run build` in this folder
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag the generated `build/` folder onto the page
4. Done — you get a live URL instantly!

### Option B: Permanent URL with your own domain
1. Create a free account at [netlify.com](https://netlify.com)
2. Click **"Add new site" → "Import an existing project"**
3. Connect GitHub and push this folder to a repo, OR use the CLI:
   ```
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```
4. Netlify gives you a URL like `hifz-portal.netlify.app`
5. You can rename it to anything (e.g. `al-hifd.netlify.app`) in site settings

---

## 💻 Run Locally
```bash
npm install
npm start
```
Opens at http://localhost:3000

---

## 📁 Project Structure
```
hifz-portal/
├── public/
│   └── index.html          # HTML shell
├── src/
│   ├── index.js            # React entry point
│   └── App.js              # Entire portal (single file)
├── netlify.toml            # Netlify deployment config
└── package.json
```

---

## ⚙️ Customise Your Admin Credentials
Open `src/App.js` and edit lines 5–7:
```js
const ADMIN_EMAIL    = "admin@hifz.com";   // ← change this
const ADMIN_PASSWORD = "Admin@1234";        // ← change this
const ADMIN_NAME     = "Administrator";     // ← change this
```

---

## 💾 Data Storage
Data is saved in each user's browser (`localStorage`).  
- Teachers on the same device share a session.  
- For a shared database across all users, a backend (Firebase, Supabase) would be needed — ask for an upgrade if required.

---

## ✨ Features
- 🔐 Teacher self-registration with admin approval
- 👑 Admin panel with full school overview
- 👤 Student profiles & enrolment
- 📖 Quran memorisation tracker (Surah / Juz / Ayah)
- ✓  Daily attendance marking
- £   Weekly dues & payment tracking
- 📊 Per-student reports
- ⬇  PDF export on every page
