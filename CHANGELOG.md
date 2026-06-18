# Changelog

All notable changes to **AI Future Planner for Students** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.4.0] - 2026-06-18

### Added

- Supabase backend integration (Postgres + RLS)
- Supabase Auth with Google OAuth and email/password
- Edge Function `ai-coach` — server-side Gemini proxy (API key in secrets)
- Edge Function `generate-roadmap` — AI roadmap generation on onboarding complete
- `js/supabase.js` client module
- Database tables: `profiles`, `onboarding_profiles`, `roadmaps`, `milestones`, `daily_tasks`, `daily_progress`
- `.env.example` for Supabase configuration

### Changed

- Auth migrated from localStorage/GIS to Supabase Auth
- AI Coach calls Edge Function instead of client-side Gemini API key
- Onboarding completion triggers real AI roadmap generation (with static fallback)
- Dashboard tasks and milestones load from Supabase when available
- Progress tab uses DB-backed completion data; removed fixed 5% overall progress
- Profile tab no longer exposes Gemini API key input
- `SOCIAL_LOGIN_SETUP_GUIDE.md` updated for Supabase Google provider

### Removed

- Client-side Gemini API key storage (`afp_gemini_key`)
- Plaintext password storage in `localStorage` (replaced by Supabase Auth)

---

## [0.3.0] - 2026-06-15

### Added

- 5-tab bottom navigation: Home, Roadmap, AI Coach, Progress, Profile
- `js/ai.js` — Gemini 2.0 Flash integration, daily progress & streak tracking
- AI Coach chat UI with fallback canned responses
- Progress tab: today ring chart, 7-day bar chart, streak counter
- Profile tab: user info and Gemini API key settings

### Changed

- `js/dashboard.js` refactored for multi-tab layout
- `js/utils.js` — added `goTab()` helper
- `index.html` and `style.css` — bottom nav and tab pane styles

See also: [work-status/2026-06-15-report_Jo.md](work-status/2026-06-15-report_Jo.md)

---

## [0.2.0] - 2026-06-09

### Added

- Google OAuth via Google Identity Services (`js/auth.js`)
- `SOCIAL_LOGIN_SETUP_GUIDE.md`
- Delete today's task button
- US curriculum presets and chat visibility updates
- Mobile-first centered smartphone viewport on desktop (`style.css`)

### Fixed

- Google OAuth `origin_mismatch` — requires local server instead of `file://`

See also: [work-status/2026-06-09-report_Jo.md](work-status/2026-06-09-report_Jo.md)

---

## [0.1.0] - 2026-06-05

### Added

- Modular JS split: `auth.js`, `onboarding.js`, `dashboard.js`, `data.js`, `utils.js`, `main.js`
- 6-step onboarding flow (grade → track → goal → target date → levels → hours)
- `DEVELOPMENT_PLAN.md` — Capstone MVP roadmap and phased plan
- Analyzing screen with loading animation

### Changed

- Single HTML prototype split into `index.html` + `js/` modules

---

## [0.0.1] - 2026-05-28

### Added

- Initial HTML prototype (`ai_future_planner_dashboard.html`)
- Product vision document `AI_Future_Planner_for_Students.md`
- Login, register, onboarding, and dashboard UX shell
- Track-specific static presets (Science, Medical, Humanities, Arts, Business, Study Abroad)

---

## Notes

- **2026-06-16**: PR #3 reverted some styling from PR #2 merge; 5-tab + `ai.js` features retained. Docs reorganized into `MD_files/` (later `docs/`).
- Daily work reports: [work-status/](work-status/)
