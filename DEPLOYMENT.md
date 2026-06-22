# JeJal Card Factory — Production Deployment Guide

This guide covers deploying to Vercel with your custom domain and Supabase backend.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [GitHub account](https://github.com) with repository access
- [Supabase project](https://supabase.com) — schema initialized
- Claude Gateway credentials
- Factchat Image Generation API key

## 1. GitHub Setup

### Initial Repository Push

```bash
# From project root, if not already a git repo:
git init
git add .
git commit -m "Initial commit: JeJal Card Factory with auth and Claude integration"

# Create a new repository on GitHub (empty, no README)
# Then push:
git remote add origin https://github.com/YOUR_ORG/jejal-card-factory.git
git branch -M main
git push -u origin main
```

**Important:** Verify `.gitignore` protects sensitive files:
- `.env.local` ✓ (already ignored)
- `design/` files (optional — can commit if shared with team, or keep private)

## 2. Supabase Configuration

### Database Schema

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Copy entire contents of `supabase/schema.sql` from this repo
3. Paste into SQL Editor and execute
4. Verify tables created:
   - `card_projects`
   - `card_drafts`
   - `copy_revisions`
   - `image_prompt_revisions`
   - `generated_character_images`
   - `rendered_cards`
   - `final_card_sets`
   - `approved_examples`
   - `rejected_examples`
   - `figma_exports`

### Auth Configuration

Go to **Authentication → Email** in Supabase dashboard:

1. Enable **Email (Magic Link)**
2. Under **Email Templates**, verify **Magic Link** template is active
3. Go to **Authentication → URL Configuration**
4. Set **Site URL** to your production domain (e.g., `https://card-factory.je-jal.com`)
5. Add **Redirect URLs**:
   ```
   https://card-factory.je-jal.com/api/auth/callback
   https://localhost:3000/api/auth/callback
   ```
   (local testing)

### Get API Keys

1. **Settings → API** in Supabase dashboard
2. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role secret — **keep this private**)

### Row Level Security (RLS)

All tables use service role key for server-side operations. No client-side auth required for Supabase — internal email check happens in middleware.

## 3. Vercel Setup

### Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository**
3. Search for `jejal-card-factory` and import
4. **Framework**: Next.js (auto-detected)
5. **Root Directory**: `.` (default)
6. Click **Deploy** (we'll add env vars next)

### Project Settings

After import, go to **Settings → Environment Variables**:

Add all variables from your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...

SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...

CLAUDE_GATEWAY_BASE_URL = https://factchat-cloud.mindlogic.ai/v1/gateway
CLAUDE_GATEWAY_API_KEY = your_key_here
CLAUDE_MODEL = claude-sonnet-4-6

FACTCHAT_IMAGE_BASE_URL = https://factchat-cloud.mindlogic.ai
FACTCHAT_IMAGE_API_KEY = your_key_here

INTERNAL_ALLOWED_EMAIL = team@je-jal.com
```

**Environment scope:**
- Set each to: **Production**, **Preview**, **Development**
- (Or just Production for now, add others later)

### Redeploy

After adding env vars:
1. Go to **Deployments**
2. Find the initial deployment
3. Click **Redeploy**
4. Wait for build to complete

## 4. Custom Domain Setup

### Connect Domain

1. In Vercel project, go to **Settings → Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `card-factory.je-jal.com`)
4. Vercel shows DNS records to add

### Update DNS

At your domain registrar (e.g., Namecheap, GoDaddy):

1. Go to DNS settings
2. Add Vercel's DNS records:
   - **A record**: `76.76.19.163`
   - **CNAME record** (if provided): `cname.vercel-dns.com`
3. Wait for DNS to propagate (5–15 minutes)

### Verify

Once DNS propagates:
- Visit `https://card-factory.je-jal.com`
- Should load the JeJal login page
- SSL certificate auto-provisioned by Vercel

## 5. Auth Callback Configuration (Critical)

This was already set up in Step 2, but verify it works:

1. Go to **https://your-domain.com/login**
2. Enter `team@je-jal.com`
3. Check email for magic link
4. Click link
5. Should redirect to `/projects` (or `/access-denied` if email doesn't match)

If magic link doesn't arrive:
- Check Supabase **Auth → Users** — verify email shows up
- Check **Email Templates → Magic Link** is active
- Verify **Site URL** is set to your domain

## 6. Environment Variables Security

### What Stays Private

Never expose to client (already protected):

- `SUPABASE_SERVICE_ROLE_KEY` — used only in server routes
- `CLAUDE_GATEWAY_API_KEY` — used only in server routes
- `FACTCHAT_IMAGE_API_KEY` — used only in server routes

Verification: These are **never** prefixed with `NEXT_PUBLIC_`.

### What's Public

These are safe in the browser (already public):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key has no write permissions by default)

## 7. Monitoring & Troubleshooting

### Vercel Logs

1. Go to **Deployments** → latest → **Logs**
2. Check for build errors or runtime errors
3. Common issues:
   - Missing environment variable → 500 error
   - Supabase connection → "Failed to connect to database"
   - Claude API key invalid → Story generation fails

### Supabase Logs

1. Go to **Supabase Dashboard** → **Logs → Query Performance**
2. Check for auth errors or database connection issues

### Test Endpoints

```bash
# Test API health
curl https://your-domain.com/api/health

# Should respond: {"status":"ok"} (if not auth-protected)
# Or 401 if you're not logged in
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` on `/projects` | Not logged in, or wrong email | Go to `/login`, sign in with `team@je-jal.com` |
| `403 Forbidden` | Logged in but email ≠ `team@je-jal.com` | Use correct email; check `INTERNAL_ALLOWED_EMAIL` env var |
| Magic link not arriving | Supabase email not configured | Verify Email Template is active; check spam folder |
| Story generation fails | Claude API key invalid or expired | Check `CLAUDE_GATEWAY_API_KEY` in Vercel env vars |
| Image generation fails | Factchat API key invalid | Check `FACTCHAT_IMAGE_API_KEY` in Vercel env vars |
| `/design/*` files not found | Design docs not in repo | Commit `design/` folder to git, or add to `.env` |

## 8. First Login & Initial Testing

1. **Visit** `https://your-domain.com`
2. **Redirect to** `/login` (no session)
3. **Sign in** with `team@je-jal.com`
4. **Check email** for magic link
5. **Click link** → redirected to `/projects`
6. **Create project** → generate story → approve images
7. **Test export** → download images from Final tab

## 9. CI/CD & Auto-Deployments

Vercel auto-deploys on every push to `main`:

1. Push code to GitHub
2. Vercel detects change
3. Runs `npm run build`
4. Deploys if build succeeds
5. Updates `https://your-domain.com`

No additional setup needed — it's automatic.

## 10. Rollback (If Needed)

1. Go to Vercel **Deployments**
2. Find previous working deployment
3. Click **Promote to Production**
4. Instant rollback

## Quick Commands

```bash
# Local development
npm run dev

# Check for TypeScript errors before committing
npm run typecheck

# Build locally (same as Vercel)
npm run build

# Preview production build
npm run start

# Push to GitHub (triggers Vercel deploy)
git push origin main
```

## Next Steps

- [ ] Push code to GitHub
- [ ] Import to Vercel
- [ ] Add environment variables
- [ ] Redeploy
- [ ] Connect custom domain
- [ ] Test login & story generation
- [ ] Monitor Vercel logs for 24 hours
- [ ] Share domain with team

---

**Questions?** Check Supabase and Vercel docs, or review this guide's Troubleshooting section.
