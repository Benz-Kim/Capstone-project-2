# AI Future Planner — Development Plan

> Turn future dreams into daily execution.

This document outlines the development roadmap for the Capstone project, based on the product vision in `AI_Future_Planner_for_Students.md` and the current prototype in `ai_future_planner_dashboard.html`.

---

## Current State (As-Is)

| Area | Status |
|------|--------|
| **Codebase** | Single file: `ai_future_planner_dashboard.html` (~940 lines) |
| **Product spec** | `AI_Future_Planner_for_Students.md` |
| **Screens** | Login / Register → Onboarding (6 steps) → Analyzing → Dashboard |
| **Data** | `localStorage` (`afp_users`, `afp_sess`) |
| **AI** | None — analyzing screen and chat use hardcoded / canned responses |
| **Roadmap & tasks** | Static per-track templates (`trackTasks`, `trackMilestones`, etc.) |

### What works well

- End-to-end UX flow (signup → onboarding → dashboard)
- Mobile-first UI shell
- Track-specific presets, subject levels, study hours

### Gaps vs. vision

- Real AI roadmap generation
- Adaptive replanning when tasks are missed
- Backend, security, multi-device persistence
- Calendar / deadlines, long-term progress & streaks

---

## Product Goal

**One-liner:** An AI system that converts a student’s future identity into daily academic actions — the student focuses on execution only.

### Capstone MVP (demo-ready)

1. Personalized weekly/daily plans from onboarding data
2. Next-day plan adjusts when tasks are incomplete (rules-based is OK for v1)
3. Account and plans persist beyond a single browser (backend or structured storage)

---

## Development Phases

### Phase 0 — Foundation (≈1 week)

**Goal:** Move beyond a single HTML file and establish a structure for later features.

| Task | Description |
|------|-------------|
| Project structure | e.g. `frontend/`, `backend/`, `docs/` |
| Data model draft | User, OnboardingProfile, Goal, Milestone, DailyTask, Progress |
| Git workflow | `main` + `develop`, feature branches per feature |
| Environment | `.env.example`, API keys server-side only |

**Decision needed:** React/Vite vs. incremental Vanilla JS module split.

---

### Phase 1 — Auth & Profile (1–2 weeks)

| Task | Priority |
|------|----------|
| Signup / login API | High |
| Password hashing (bcrypt, etc.) | High |
| Persist onboarding to DB | High |
| Social login | Low (post-MVP) |

**Note:** Current prototype stores plaintext passwords in `localStorage` — must be replaced before any production use.

---

### Phase 2 — AI Roadmap Generation (core, 2–3 weeks)

Maps vision **Layer 1 → 2 → 3** to implementation:

```
Onboarding input → AI prompt → JSON roadmap → DB → Dashboard render
```

| Output | Description |
|--------|-------------|
| Capability goals | Required skills from track, goal, subject levels |
| Milestones | At least monthly / weekly granularity |
| Daily tasks | 3–5 per day with estimated duration |
| Prompt + schema | Structured JSON from LLM; retry on parse failure |

**MVP tip:** First version can generate once at onboarding completion. Daily refresh can follow.

**Integration point:** Replace / extend `finalizeOnboarding()` with an API call.

---

### Phase 3 — Daily Execution Dashboard (1–2 weeks)

| Feature | Current | Target |
|---------|---------|--------|
| Today’s tasks | Static `trackTasks` | Per-user AI-generated + persisted completion |
| Progress | Fixed 5% | Computed from completion & milestones |
| Goal details | Expand/collapse | Full roadmap timeline |
| Motivation copy | Partially hardcoded | Tied to user’s goal statement |

Optional: weekly calendar, D-day, deadline reminders.

---

### Phase 4 — Adaptive Planning (1–2 weeks)

Differentiator: **“What should a future X student do today?”** even after missed work.

| Rule (MVP) | Behavior |
|------------|----------|
| Incomplete task | Roll to next day or split |
| Repeated misses | Suggest lowering daily hours from onboarding |
| Exam / deadline input | Bump priority that week |

Can start with a **rules engine**; add LLM for explanations later.

---

### Phase 5 — AI Mentor Chat (≈1 week, optional)

| MVP | Extension |
|-----|-----------|
| Context: goal, today’s tasks, progress | Conversation history |
| Remove canned `replies` | Streaming, safety guardrails |

---

### Phase 6 — Quality & Presentation (≈1 week)

- E2E scenario: signup → onboarding → plan generation → complete task → replan
- README: run instructions, stack, demo account
- One demo narrative (e.g. “Stanford CS” abroad track)

---

## Suggested Tech Stack (Capstone)

| Layer | Recommendation | Rationale |
|-------|----------------|-----------|
| Frontend | React + Vite **or** modular Vanilla from current HTML | Use React if team has experience |
| Backend | Node (Express) or Python (FastAPI) | Simple JSON APIs + AI proxy |
| Database | PostgreSQL (e.g. Supabase free tier) | Fits Goal → Task relationships |
| AI | OpenAI / Gemini API | Structured JSON output |
| Deploy | Vercel + Railway / Render | Public demo URL |

---

## Priority Backlog

### Must (first sprint / month)

- [ ] Repo structure split + README
- [ ] User + OnboardingProfile API
- [ ] Onboarding complete → AI roadmap generation API (once)
- [ ] Dashboard renders from API data
- [ ] Task completion persisted on server

### Should

- [ ] Daily plan refresh (cron or manual “refresh today”)
- [ ] Incomplete-task rollover rules
- [ ] Real progress calculation

### Could (if time allows)

- [ ] Live AI chat
- [ ] Calendar / notifications
- [ ] Social login

---

## Team Roles (reference)

| Role | Examples |
|------|----------|
| Product / UX | Onboarding & dashboard flows, demo story |
| Frontend | Screens, API integration, state |
| Backend | Auth, CRUD, AI proxy |
| AI / Prompt | Prompts, JSON schema, evaluation cases |
| QA / Docs | Scenario tests, README, demo video |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI cost / latency | Cache plans, generate once at onboarding, keep prompts concise |
| Invalid JSON from LLM | Schema validation (Zod, etc.) + fallback templates |
| Scope creep | Lock MVP to daily tasks + roadmap display |
| Security | API keys server-only, password hashing |

---

## Open Decisions

Before locking Week 1–4 tasks, confirm:

1. **Deadline** — Capstone presentation / submission date  
2. **Team size** — headcount and frontend/backend experience  
3. **Stack** — React vs. keep HTML prototype; Node vs. Python  
4. **AI** — API provider and budget (school vs. personal key)  
5. **First priority** — real AI roadmap vs. backend + accounts first  

---

## Screen Map (prototype reference)

| Screen ID | Purpose |
|-----------|---------|
| `s-login` | Login |
| `s-register` | Registration |
| `s-ob1` … `s-ob6` | Onboarding (grade, track, goal, year/sem, levels, hours) |
| `s-analyzing` | Loading / “analysis” animation |
| `s-dashboard` | Daily execution dashboard |

---

*Last updated: June 2026*
