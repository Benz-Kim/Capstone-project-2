# docs — 프로젝트 문서

이 폴더에는 AI Future Planner 캡스톤 프로젝트의 기획·개발·설정 문서를 모아 둡니다.

---

## 문서 목록

| 문서 | 설명 |
|------|------|
| [PROJECT_FLOW.md](./PROJECT_FLOW.md) | **현재 프로젝트 흐름 정리** — 사용자 플로우, 코드 구조, 구현 현황, 다음 단계 |
| [AI_Future_Planner_for_Students.md](./AI_Future_Planner_for_Students.md) | 제품 비전 및 핵심 컨셉 (3-Layer Goal Hierarchy) |
| [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) | 개발 로드맵, Phase별 계획, 기술 스택, 백로그 |
| [SOCIAL_LOGIN_SETUP_GUIDE.md](./SOCIAL_LOGIN_SETUP_GUIDE.md) | Google OAuth (Supabase Auth) 설정 가이드 |
| [../CHANGELOG.md](../CHANGELOG.md) | 버전별 변경 이력 (커밋 기반) |

---

## 읽는 순서 (권장)

1. **PROJECT_FLOW.md** — 지금 앱이 어떻게 동작하는지 빠르게 파악
2. **AI_Future_Planner_for_Students.md** — 제품이 무엇을 해결하려는지 이해
3. **DEVELOPMENT_PLAN.md** — 앞으로 무엇을 만들지 로드맵 확인
4. **SOCIAL_LOGIN_SETUP_GUIDE.md** — Google 로그인 로컬 테스트 시 참고

---

## 빠른 시작 (Supabase)

1. `js/config.example.js` → `js/config.js` 복사 후 **anon key** 입력 (Dashboard → Settings → API)
2. Supabase에서 Google Provider 활성화 — [SOCIAL_LOGIN_SETUP_GUIDE.md](./SOCIAL_LOGIN_SETUP_GUIDE.md)
3. Edge Functions Secrets에 `GEMINI_API_KEY` 설정
4. Live Server 등으로 `http://localhost:5500` 에서 `index.html` 실행

## Cloudflare Pages 배포 (main merge 시 자동)

GitHub Actions가 [`.github/workflows/deploy-cloudflare-pages.yml`](../.github/workflows/deploy-cloudflare-pages.yml) 를 실행합니다.

**Repository Secrets** (Haeun-Jo-09/Capstone-project-2):

| Secret | 설명 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token (Pages Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `SUPABASE_URL` | (선택) 기본값: `https://bcnhmrvylpkocetfqidh.supabase.co` |

Supabase Auth redirect URL에 Cloudflare Pages 도메인(`*.pages.dev`)도 등록하세요.

변경 이력: [CHANGELOG.md](../CHANGELOG.md)

---

## 기타 문서 위치

| 폴더 | 내용 |
|------|------|
| `work-status/` | 일별 작업 보고서 (Jo, Ben 등) |
