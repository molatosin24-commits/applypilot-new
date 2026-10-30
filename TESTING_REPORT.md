# ApplyPilot – Stage 8 Testing Report

**Date:** Final development stage  
**Environment:** Build agent (limited; npm install often slow/incomplete)

## How to read this report

- **Passed** = verified successfully in this environment  
- **Failed** = attempted and failed  
- **Not tested** = could not run here; must be verified after you deploy or run locally  

---

## Part 1 – Functional tests

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Landing page & navigation | Not tested | Code present; needs browser |
| 2 | Guest job browsing | Not tested | Routes allow public /jobs |
| 3 | Job search (Jobicy, Remotive, RemoteOK) | Not tested | Client APIs; previously curl-checked APIs returned 200 in earlier stages |
| 4 | Keyword search & filters | Not tested | |
| 5 | Job details & original links | Not tested | |
| 6 | Signup / login / logout / password reset | Not tested | Requires live Supabase |
| 7 | Profile create & edit | Not tested | |
| 8 | Dashboard statistics | Not tested | Driven by real saved/applications queries |
| 9 | Save & remove jobs | Not tested | |
| 10 | Application tracker (6 statuses) | Not tested | |
| 11 | CV create / edit / save / preview / print | Not tested | Print uses browser dialog |
| 12 | CV keyword tailoring | Not tested | Rule-based only |
| 13 | Cover letter create / edit / export | Not tested | Template-based only |
| 14 | Interview prep & private notes | Not tested | |
| 15 | Job Safety Check (no login) | Not tested | Public route |
| 16 | Saved searches & alerts | Not tested | In-app only |
| 17 | PWA install & offline | Not tested | Manifest + offline.html present |
| 18 | Privacy page & data controls | Not tested | |

## Part 2 – Security review (static)

| Check | Status | Notes |
|-------|--------|-------|
| Only anon key in frontend | Passed (static) | `supabase.ts` uses `VITE_SUPABASE_ANON_KEY` only |
| No service-role key in repo | Passed (static) | Grep found none |
| `.env` in `.gitignore` | Passed | |
| RLS policies in SQL for all private tables | Passed (static) | profiles, saved_jobs, applications, cvs, cover_letters, interview_notes, saved_searches, job_alerts |
| Protected routes for private pages | Passed (static) | `ProtectedRoute` wraps dashboard, profile, saved, tracker, cvs, letters, interview, alerts |
| Safety & jobs public | Passed (static) | |
| Live RLS isolation between two users | Not tested | Must verify with two accounts after deploy |

## Part 3 – Technical

| Check | Status | Notes |
|-------|--------|-------|
| `npm install` | Not completed successfully | Install process ran long / incomplete in this environment |
| `npm run build` | Not tested | Depends on successful install |
| Production preview | Not tested | |
| TypeScript strict issues fixed when found | Partial | Login/Signup navigate-in-render fixed; Bell imports fixed; build script uses `tsc --noEmit` |
| Mobile responsiveness | Not tested | Tailwind mobile-first used throughout |
| Android Chrome | Not tested | |

## Part 4 – Database SQL

| Check | Status |
|-------|--------|
| Complete schema in `supabase-setup.sql` | Passed (static review) |
| Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS) | Passed (static) |
| Fresh project ready | Yes — run full file once after creating project |

## Part 5 – Deployment readiness

| Item | Status |
|------|--------|
| `netlify.toml` + SPA redirects | Present |
| `public/_redirects` | Present |
| `.env.example` | Present |
| Separate from old Netlify site | Instructions stress **new** site / new repo |
| Supabase redirect URL instructions | In README |

---

## Known limitations (honest)

1. This environment could not complete `npm install` / `npm run build` reliably — **you or CI must run them**.  
2. No live browser tests of auth, tracker, CV, or alerts were executed here.  
3. Job alerts do not send email or push.  
4. Cover letters / tailoring are not generative AI.  
5. PDF is browser Print.  

## Recommended verification after deploy

1. `npm install && npm run build && npm run preview` on a computer.  
2. Create free Supabase project → run `supabase-setup.sql` → set `.env` / Netlify env vars.  
3. Test signup → confirm email (if enabled) → login → profile → save job → tracker → CV → safety → alerts “Check now”.  
4. Open site in a private window as guest: jobs + safety work; /dashboard redirects to login.  
5. Optional: two accounts to confirm RLS isolation.  

**Nothing in this report is marked Passed for end-to-end browser behaviour unless it was actually run successfully.**
