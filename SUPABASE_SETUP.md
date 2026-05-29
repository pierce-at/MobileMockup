# Supabase Setup

Project:
- Name: `BETA App`
- Ref: `trriwrhvjylrldqvmhgk`
- URL: `https://trriwrhvjylrldqvmhgk.supabase.co`

## What is already wired

- Browser auth client via magic links
- Repository fallback that uses Supabase when tables exist
- Local schema in [supabase/schema.sql](C:/Users/drago/Downloads/BETA/supabase/schema.sql)
- Local seed data in [supabase/seed.sql](C:/Users/drago/Downloads/BETA/supabase/seed.sql)
- Bootstrap script: `npm run supabase:bootstrap`

## Important key note

`sb_secret_...` is not enough for the Supabase management SQL endpoint.

When me tried remote bootstrap on May 28, 2026:
- `POST https://api.supabase.com/v1/projects/trriwrhvjylrldqvmhgk/database/query` returned `401 Unauthorized`
- body said `JWT could not be decoded`

That means remote schema creation needs a Supabase personal access token in:

```env
SUPABASE_ACCESS_TOKEN=...
```

## Fastest path to operational backend

1. Create a Supabase personal access token in dashboard account settings.
2. Add it to `.env.local` as `SUPABASE_ACCESS_TOKEN=...`
3. Run:

```powershell
npm run supabase:bootstrap
```

4. Start app:

```powershell
npm run dev
```

## Alternative

If you do not want to use a personal access token, paste both SQL files into the Supabase SQL editor:
- [supabase/schema.sql](C:/Users/drago/Downloads/BETA/supabase/schema.sql)
- [supabase/seed.sql](C:/Users/drago/Downloads/BETA/supabase/seed.sql)

After that, the app should start reading live data through the same repository interface.
