# ApplyPilot

**Find Jobs. Apply Smarter. Get Hired.**

International remote job discovery and application assistant.

## Features (Stages 1–7)

| Area | Features |
|------|----------|
| Jobs | Real listings from Jobicy, Remotive, RemoteOK. Guest browsing. Filters, eligibility labels, original apply links |
| Auth | Email/password signup, login, logout, password reset (Supabase free tier) |
| Profile | Name, country, profession, preferred categories |
| Tracker | Saved jobs, application statuses (Interested → Offer), notes, dates |
| CV | Multi-CV builder, templates, preview, Print/PDF, keyword tailoring |
| Letters | Template cover letters from your CV data only |
| Interview | Question bank, practice answers, remote + prep checklists |
| Safety | Public job-safety pattern check + application checklist |
| Alerts | Saved searches, in-app matches on “Check now” (no email/push in free version) |
| PWA | Installable; offline fallback; job APIs not cached as fresh |

**Free only.** No payments, subscriptions, or paid AI APIs.

---

## Beginner setup

### 1. Supabase (free)

1. Create a project at https://supabase.com  
2. **Project Settings → API** → copy **Project URL** and **anon public** key  
3. Create a file named `.env` in the project root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. Open **SQL Editor** → paste the entire contents of `supabase-setup.sql` → **Run**  
5. **Authentication → URL Configuration** → add your site URLs, e.g.:
   - Site URL: `https://your-netlify-site.netlify.app`
   - Redirect URLs: `https://your-netlify-site.netlify.app/**` and `http://localhost:5173/**`

### 2. Run locally (on a computer)

```
npm install
npm run dev
```

Open the URL shown (usually http://localhost:5173).

### 3. Production build

```
npm run build
npm run preview
```

---

## Deploy to Netlify (new site — do not overwrite the old ApplyPilot)

1. Create a **new** GitHub repository and upload this project (without `node_modules` and without `.env`).  
2. On https://netlify.com → **Add new site → Import from Git** → select that repo.  
3. Build settings (also in `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Site settings → Environment variables** → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. After deploy, update Supabase Auth redirect URLs to the new Netlify URL.
6. SPA routing is handled by `netlify.toml` redirects.

**Android tip:** You can use GitHub’s web upload or an app like “GitHub” / “Working Copy” to push files. Netlify is configured in the browser.

---

## Security notes

- Only the **anon** key is used in the browser. Never put the service-role key in frontend code or `.env` that is committed.
- All private tables use Row Level Security (RLS): users only access their own rows.
- Guests can search jobs and use Job Safety; they cannot access CVs, tracker, or profile.
- `.env` is listed in `.gitignore`.

---

## Project structure

```
applypilot/
├── netlify.toml
├── supabase-setup.sql
├── .env.example
├── public/          (icons, offline.html, _redirects)
└── src/
    ├── lib/         (auth, jobs, tracker, cv, alerts, safety, interview)
    ├── pages/
    └── components/
```

## Known limitations

- Job alerts are **in-app only** (no background email/push).
- Cover letters and CV tailoring are **template/keyword-based**, not generative AI.
- PDF export uses the browser Print dialog.
- Full end-to-end tests depend on your Supabase project and a successful `npm install` / `npm run build` on your machine or CI.

ApplyPilot v1.0 — Stage 8
