# JeJal Card Factory — Production Release Checklist

✅ Use this checklist before committing to GitHub and pushing to production.

---

## 1. Environment & Secrets

- [ ] `.env.local` exists and is **NOT** tracked by git
  ```bash
  git status | grep -i ".env"  # Should show nothing
  ```

- [ ] No hardcoded secrets in source code
  ```bash
  grep -rn "SUPABASE_SERVICE_ROLE_KEY\|API_KEY\|SECRET" \
    app lib --include="*.ts" --include="*.tsx" | grep -v "process.env"
  # Should show nothing
  ```

- [ ] `.env.example` exists and has placeholder values
  ```bash
  cat .env.example
  # Verify: all vars present, all values are placeholders (not real keys)
  ```

- [ ] No `NEXT_PUBLIC_` prefixed secrets
  ```bash
  grep -rn "NEXT_PUBLIC.*ROLE_KEY\|NEXT_PUBLIC.*SECRET" app lib
  # Should show nothing
  ```

---

## 2. Debug & Temporary Code

- [ ] No `console.log()` in production code (only `console.error()` in error handlers)
  ```bash
  grep -rn "console\.log\|console\.warn" app --include="*.ts" --include="*.tsx" | wc -l
  # Should be 0
  ```

- [ ] No `debugger` statements
  ```bash
  grep -rn "debugger" app --include="*.ts" --include="*.tsx"
  # Should show nothing
  ```

- [ ] No `TODO`, `FIXME`, `HACK` comments in critical paths
  ```bash
  grep -rn "TODO\|FIXME\|HACK" app/api app/projects --include="*.ts" --include="*.tsx"
  # Review any results — should be minimal
  ```

- [ ] No test files (`.test.ts`, `.spec.ts`) in `app/`
  ```bash
  find app -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.tmp" -o -name "*.bak"
  # Should show nothing
  ```

---

## 3. Build & Type Safety

- [ ] Build succeeds locally
  ```bash
  npm run build
  # Should complete without errors (warnings are OK)
  ```

- [ ] TypeScript passes
  ```bash
  npm run typecheck
  # Should show no errors
  ```

- [ ] No unused imports
  ```bash
  npm run lint 2>&1 | head -30
  # Review for unused variables/imports
  ```

---

## 4. Security & Access

- [ ] Route protection is active (`proxy.ts` exists)
  ```bash
  ls proxy.ts
  # Should exist
  ```

- [ ] Service role key only used in server routes
  ```bash
  grep -rn "createServiceClient" app/projects app/api --include="*.ts" --include="*.tsx" | head -5
  # All hits should be in /api or async server components
  ```

- [ ] No service role client in browser code
  ```bash
  grep -rn "createServiceClient" app/login app/access-denied --include="*.tsx"
  # Should show nothing
  ```

- [ ] Only browser client in login/auth pages
  ```bash
  grep -rn "createClient\b" app/login app/access-denied --include="*.tsx" | wc -l
  # Should be > 0
  ```

- [ ] Email validation in 2 places: callback + proxy
  ```bash
  grep -n "INTERNAL_ALLOWED_EMAIL" proxy.ts app/api/auth/callback/route.ts
  # Should show 2+ matches
  ```

---

## 5. Git Repository Safety

- [ ] `.gitignore` protects sensitive files
  ```bash
  cat .gitignore
  # Verify: .env*, .next/, node_modules/, .DS_Store
  ```

- [ ] No `.env` files tracked
  ```bash
  git ls-files | grep "\.env"
  # Should show nothing
  ```

- [ ] No build artifacts tracked
  ```bash
  git ls-files | grep -E "\.next|dist|build"
  # Should show nothing
  ```

- [ ] No node_modules tracked
  ```bash
  git ls-files node_modules | head
  # Should show nothing
  ```

- [ ] No IDE or OS files tracked
  ```bash
  git ls-files | grep -E "\.vscode|\.idea|\.DS_Store|thumbs\.db"
  # Should show nothing
  ```

---

## 6. Documentation

- [ ] `README.md` exists and is up-to-date
  ```bash
  cat README.md | head -20
  ```

- [ ] `DEPLOYMENT.md` exists with full instructions
  ```bash
  wc -l DEPLOYMENT.md
  # Should be > 100 lines
  ```

- [ ] `.env.example` exists with all required variables
  ```bash
  cat .env.example
  # Verify all 8 variables present
  ```

- [ ] `CLAUDE.md` or `AGENTS.md` documents project context
  ```bash
  ls -la CLAUDE.md AGENTS.md
  ```

- [ ] `vercel.json` configured for production
  ```bash
  cat vercel.json | grep -i "maxduration\|headers"
  ```

---

## 7. Files Safe to Commit

These files should be in git:

```
✓ app/                    — Application code
✓ lib/                    — Shared libraries
✓ public/                 — Static assets
✓ proxy.ts                — Route protection
✓ supabase/schema.sql     — Database schema
✓ design/                 — Design docs (add to repo)
✓ .env.example            — Template for env vars
✓ .gitignore              — Git ignore rules
✓ package.json            — Dependencies
✓ tsconfig.json           — TypeScript config
✓ next.config.ts          — Next.js config
✓ vercel.json             — Vercel deployment config
✓ DEPLOYMENT.md           — Deployment guide
✓ RELEASE_CHECKLIST.md    — This file
✓ README.md               — Project documentation
✓ CLAUDE.md               — Claude Code context
✓ AGENTS.md               — Agent instructions
```

---

## 8. Files to NOT Commit

These should be ignored:

```
✗ .env                    — Local secrets (in .gitignore)
✗ .env.local              — Local secrets (in .gitignore)
✗ .env.*.local            — Local secrets (in .gitignore)
✗ node_modules/           — Dependencies installed locally (in .gitignore)
✗ .next/                  — Build artifacts (in .gitignore)
✗ .vercel/                — Vercel cache (in .gitignore)
✗ .DS_Store               — macOS files (in .gitignore)
✗ *.log                   — Log files (in .gitignore)
✗ .vscode/                — IDE settings (in .gitignore)
✗ .idea/                  — IDE settings (not committed)
```

---

## 9. Final Pre-Push Checks

```bash
# Run all checks
npm run typecheck
npm run build
git status
git log --oneline -5
```

Expected results:
- ✅ TypeScript: no errors
- ✅ Build: success
- ✅ Git status: all files staged or clean
- ✅ Git log: shows Previous commits

---

## 10. Git Commit Commands

### If this is a brand new repository (first time):

```bash
# Initialize git (if not done)
git init

# Add all safe files
git add .

# Commit with message
git commit -m "Initial commit: JeJal Card Factory with Supabase + Claude integration"

# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_ORG/jejal-card-factory.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If repository already exists:

```bash
# Check what will be committed
git status

# Stage new files
git add RELEASE_CHECKLIST.md DEPLOYMENT.md vercel.json proxy.ts \
         app/ lib/ supabase/ design/ .env.example

# Stage modified files
git add app/globals.css app/layout.tsx app/page.tsx \
        package.json package-lock.json

# Commit
git commit -m "feat: add auth, deployment config, and export features

- Implement Supabase magic link auth (team@je-jal.com only)
- Add proxy.ts for route protection (Next.js 16 style)
- Add image export buttons (Images & Final pages)
- Configure vercel.json with function timeouts
- Add comprehensive deployment guide (DEPLOYMENT.md)
- Add release checklist (RELEASE_CHECKLIST.md)
- Add environment template (.env.example)"

# Push to GitHub
git push origin main
```

---

## 11. Verify Before Pushing

```bash
# View what will be pushed
git log --oneline origin/main..HEAD

# Check file list
git diff --cached --name-only

# Verify no secrets
git diff --cached | grep -i "api_key\|secret\|password"
# Should show nothing

# Final check
git status
# Should show "nothing to commit, working tree clean" or only untracked files
```

---

## 12. Post-Push Actions

Once pushed to GitHub:

1. **Verify on GitHub:**
   - Visit `https://github.com/YOUR_ORG/jejal-card-factory`
   - Confirm files are visible
   - Confirm `.env.local` is NOT present
   - Confirm `node_modules/` is NOT present

2. **Import to Vercel:**
   - Visit `https://vercel.com/new`
   - Select "Import Git Repository"
   - Search for repository
   - Follow DEPLOYMENT.md § 3

3. **Monitor first deploy:**
   - Check Vercel logs for errors
   - Test login with `team@je-jal.com`
   - Verify story generation works

---

## Quick Verification Script

Run this before pushing:

```bash
#!/bin/bash
echo "🔍 Pre-push safety check..."

# Check for secrets
if grep -rn "SUPABASE_SERVICE_ROLE_KEY\|CLAUDE_GATEWAY_API_KEY" app lib \
   | grep -v "process.env" | grep -v ".env.example"; then
  echo "❌ SECRETS FOUND IN CODE"
  exit 1
fi

# Check .gitignore
if git ls-files | grep -E "\.env|node_modules|\.next"; then
  echo "❌ PROTECTED FILES TRACKED IN GIT"
  exit 1
fi

# Check build
if ! npm run build > /dev/null 2>&1; then
  echo "❌ BUILD FAILED"
  exit 1
fi

# Check types
if ! npm run typecheck > /dev/null 2>&1; then
  echo "❌ TYPESCRIPT ERRORS"
  exit 1
fi

echo "✅ All checks passed! Safe to push."
```

Save as `.git/hooks/pre-push` and run `chmod +x .git/hooks/pre-push`

---

## Summary

- ✅ No secrets exposed
- ✅ No debug code
- ✅ Build & types pass
- ✅ Git ignores sensitive files
- ✅ Ready for production
- ✅ Follow commands in § 10 to commit & push
