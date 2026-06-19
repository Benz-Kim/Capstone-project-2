# Social Login Setup Guide (Supabase Auth)

Google login is handled through **Supabase Auth**, not the Google Identity Services SDK.

## Prerequisites

1. Supabase project: `bcnhmrvylpkocetfqidh`
2. `js/config.js` with your Supabase URL and anon key (copy from `js/config.example.js`)
3. App served from `http://localhost` or HTTPS (not `file://`)

## Step 1. Enable Google in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/bcnhmrvylpkocetfqidh/auth/providers)
2. Go to **Authentication → Providers → Google**
3. Enable Google and paste your **Client ID** and **Client Secret** from Google Cloud Console

## Step 2. Google Cloud Console

1. Create or select a project
2. **APIs & Services → Credentials → Create OAuth client ID** (Web application)
3. **Authorized JavaScript origins:**
   - `http://localhost:5500` (or your local port)
   - `https://bcnhmrvylpkocetfqidh.supabase.co`
4. **Authorized redirect URIs:**
   - `https://bcnhmrvylpkocetfqidh.supabase.co/auth/v1/callback`

## Step 3. Supabase redirect URLs

In **Authentication → URL Configuration**:

- **Site URL:** your production or local URL (e.g. `http://localhost:5500`)
- **Redirect URLs:** add local dev URLs:
  - `http://localhost:5500`
  - `http://127.0.0.1:5500`
  - `http://localhost:3000`

## Step 4. Test

1. Start a local static server (e.g. Live Server on port 5500)
2. Open the app → **Continue with Google**
3. Complete sign-in → app should create a `profiles` row and route to onboarding or dashboard

## Email / password login

Register with email + password uses Supabase `signUp`. Login form uses **email** (not username ID).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redirect loop | Check Site URL matches your origin exactly |
| `Invalid login credentials` | Confirm email confirmation settings in Supabase Auth |
| Popup blocked | Supabase uses redirect flow; allow redirects for localhost |
| AI Coach fails | Set `GEMINI_API_KEY` in Edge Functions → Secrets |

## Edge Function secrets

Set in Dashboard → **Edge Functions → Secrets**:

- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/app/apikey)

Supabase injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` automatically for Edge Functions.
