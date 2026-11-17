# PrepDost — Client

Next.js 16 · TypeScript · Tailwind v4 · TanStack Query · Zod. Plan: [ARCHITECTURE.md](../ARCHITECTURE.md).

## Run (with the real backend)

```bash
# terminal 1 — server/
npm run dev                       # http://localhost:5000

# terminal 2 — client/
nvm use                           # Node 22 (>= 20.9)
npm install
cp .env.example .env.local        # BACKEND_URL=http://localhost:5000, NEXT_PUBLIC_USE_MOCKS=false
npm run dev                       # http://localhost:3000
```

Offline / no backend: set `NEXT_PUBLIC_USE_MOCKS=true` (demo login `demo@prepdost.dev` / `Demo@1234`).
`NEXT_PUBLIC_*` is inlined at build time, so restart `dev` after changing it.

## First run checklist

1. Server: copy `server/.env.example` to `server/.env`, fill the keys, then `npm run seed` once to load the 12 DSA problems.
2. Client: `npm install` (this also copies the self-hosted Monaco editor into `public/monaco`).
3. Open http://localhost:3000, sign up, connect GitHub / LeetCode on the dashboard, start an interview, solve _Two Sum_.

Deploying (Vercel + Railway + Atlas, or Docker): see `DEPLOYMENT.md` at the repo root.

## Scripts

`npm run dev | build | start | lint | typecheck | test | format` (`npm run validate` runs typecheck + lint + test + build)

## Add a feature

1. `features/<name>/schemas.ts` — zod schema mapped from the backend response
2. `features/<name>/api.ts` — interface + http adapter (+ `mocks/<name>.mock.ts` only if the endpoint isn't ready)
3. `features/<name>/hooks.ts` — query keys + hooks
4. `app/(app)/<route>/page.tsx` — thin page composing the feature's components
