# LinkBox Project Progress

## Current Stage

URL-based app routing, Supabase-backed category management, and normalized tag tables are implemented. Supabase remote table access and authenticated CRUD for links, categories, tags, link-tag relations, and rename RPCs have been verified. Tag storage now normalizes saved and loaded link tags consistently. Legacy eager Supabase client code has been removed. Deployment QA checklist is documented. Vercel deployment URL is recorded. Next stage: run the final manual QA checklist on the deployed URL and add screenshots.

## Project Summary

LinkBox is a multi-user web app for saving and organizing development links, documentation, tutorials, troubleshooting references, and study notes.

Stack:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth and Database
- Vercel

## MVP Features

- Login and sign-up
- Link CRUD
- Tags and categories
- Search
- Favorites
- Reading status
- Priority
- Dashboard summary
- Duplicate URL check per user
- URL-based navigation and browser back/forward support
- Category management backed by a separate `categories` table
- Tag management backed by `tags` and `link_tags` tables

## Important Decisions

- Build as a multi-user app from the start.
- Use Supabase Auth and Row Level Security.
- Keep Git commits small and meaningful for project/assignment history.
- Use the Figma export as the UI reference, but port it into the existing Next.js App Router project rather than copying the Vite app directly.
- Implement the Figma UI with static mock data first, then connect Supabase features.
- Update this file at each major step so future Codex sessions can recover context quickly.
- Current login and sign-up screens are UI-only. They do not call Supabase yet.
- Categories now have their own Supabase table, while links still store the selected category label for a simple MVP-friendly schema.
- Tags are normalized into `tags` and `link_tags`; `links.tags` is still maintained for current UI/search compatibility.

## Reference Files

- MVP design: `docs/superpowers/specs/2026-05-17-linkbox-mvp-design.md`
- Figma export zip: `/Users/apple/Downloads/Design LinkBox Web App UI.zip`
- Temporary extracted Figma export used for analysis: `/private/tmp/linkbox-figma-ui`

## Completed Work

- Initialized LinkBox Next.js project before this log was created.
- Confirmed current repo has base Next.js files, Supabase client, and `LinkItem` type.
- Analyzed the Figma export zip.
- Wrote and committed the MVP design document.
- Created persistent project progress log.
- Wrote the implementation plan for porting the Figma static UI into the Next.js app.
- Installed `lucide-react` and `clsx`.
- Added LinkBox static UI design tokens, mock data, link utilities, UI primitives, and Figma-derived screens.
- Verified the static UI implementation with `npm run lint`, `npm run build`, and local HTTP response checks.
- Committed the static UI feature implementation.
- Localized all user-facing static UI text to Korean.
- Verified Korean UI text with `npm run lint`, `npm run build`, and a local HTTP response check.
- Committed Korean UI localization.
- Added real Supabase Auth client integration for sign up, sign in, sign out, and session detection.
- Added Korean auth error mapping and Supabase config detection tests.
- Added `npm test` script using Node's built-in test runner.
- Verified auth implementation with `npm test`, `npm run lint`, `npm run build`, and local HTTP response checks.
- Fixed a hydration mismatch caused by server/client differences during Supabase session bootstrap.
- Verified the hydration fix with `npm test`, `npm run lint`, `npm run build`, and local HTTP response checks.
- Added `supabase/migrations/20260517000000_create_links.sql` for the `links` table, RLS policies, indexes, and per-user URL uniqueness.
- Replaced mock link state with Supabase-backed list/create/update/delete operations.
- Added link row/draft mapping helpers and tests.
- Verified link CRUD implementation with `npm test`, `npm run lint`, and `npm run build`.
- Investigated a 403 from PostgREST on `links`; added an authenticated role grant migration.
- Fixed Korean IME tag entry so composition Enter does not split tags like `리액` and `트`.
- Verified the fixes with `npm test`, `npm run lint`, and `npm run build`.
- Added Korean success notices for link create/update/delete/favorite actions.
- Updated README with current features, setup, Supabase SQL steps, and verification commands.
- Verified polish changes with `npm test`, `npm run lint`, and `npm run build`.

## Git History Notes

- `5492734 Initial LinkBox setup`
- `f71b54b docs: add LinkBox MVP design`
- `23275bd feat: port static LinkBox UI from Figma export`
- `9fb7ab4 feat: localize LinkBox UI to Korean`

## Next Step

Prepare Vercel deployment settings and final QA checklist.

## Latest Work

- Added dashboard summary card navigation to filtered link pages.
- Added dashboard category navigation to the links page with the selected category filter.
- Clarified that category editing is currently done per link through the edit form because categories are stored as text on links, not as a separate category table.
- Verified dashboard navigation changes with `npm test`, `npm run lint`, and `npm run build`.
- Added real URL routes for `/dashboard`, `/links`, `/links?status=...`, `/favorites`, `/links/[id]`, and `/categories`.
- Added `categories` Supabase migration, category data helpers, and a category management screen for add/rename/delete.
- Updated link creation/editing and link filters to use category options from Supabase-backed categories plus existing link categories.
- Browser back navigation now works because dashboard cards and sidebar navigation push real URLs instead of changing only local React state.
- Pushed `0155ea2 feat: add category management routes` to GitHub.
- Added `tags` and `link_tags` Supabase migration, tag data helpers, and `/tags` management route.
- Link create/update now syncs tag rows and link-tag relation rows while preserving `links.tags` for the existing UI.
- Link form tag input now offers browser datalist suggestions from known saved tags.
- Added tag-driven navigation: `/tags` rows and detail-page tags open `/links?tag=...`, and the links page filters by the selected tag.
- Link card tags can now filter the current link list by tag.
- Confirmed the remote Supabase project has `links`, `categories`, `tags`, and `link_tags` tables available.
- Verified authenticated remote CRUD for categories, tags, links, and link-tag relations with a temporary QA user.
- Cleaned up temporary QA rows after verification.
- Normalized link tags on read, create, update, and form entry with trim/lowercase/dedupe behavior.
- Removed the unused `src/lib/supabase.ts` eager client module and kept the app on the safe browser client factory in `src/lib/auth.ts`.
- Added `supabase/migrations/20260517004000_create_rename_rpcs.sql` with `rename_category` and `rename_tag` transactional RPC functions.
- Replaced client-side category/tag rename multi-update flows with single RPC calls plus local state refresh.
- Applied and verified the rename RPC migration against the remote Supabase project.
- Confirmed remote `rename_category` updates linked `links.category` values and remote `rename_tag` updates linked `links.tags` arrays.
- Added README deployment QA guidance for Vercel environment variables, Supabase checks, and manual end-to-end scenarios.
- Verified local routes `/`, `/dashboard`, `/links?status=reading&tag=react`, `/favorites`, `/categories`, and `/tags` return HTTP 200 from the running Next.js dev server.
- Added deployed Vercel URL `https://linkbox-five.vercel.app/` to README.
- Rewrote README into a full project proposal and implementation summary format covering planning background, core features, architecture, DB design, routes, decisions, local setup, and verification.
- Removed operational Supabase setup and Vercel deployment checklist sections from README to keep it focused as a project explanation document.
