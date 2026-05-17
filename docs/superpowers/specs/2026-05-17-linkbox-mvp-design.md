# LinkBox MVP Design

## Context

LinkBox is a personal link manager for saving development references, documentation, tutorials, troubleshooting links, and study notes. The project uses Next.js, React, TypeScript, Tailwind CSS, Supabase, and Vercel.

The product will be built as a multi-user app. Each signed-in user owns their links, and Supabase Row Level Security will keep user data isolated.

The Figma export at `/Users/apple/Downloads/Design LinkBox Web App UI.zip` contains a React/Vite prototype with these screens:

- Auth page with login and sign-up tabs
- Dashboard page with summary cards, recent links, and category counts
- Links page with search, sorting, filters, favorites, and list cards
- Link detail page
- Link add/edit form
- Sidebar navigation

The export is a design and component reference, not the final app architecture. It will be ported into the existing Next.js App Router project.

## MVP Scope

The MVP includes:

- Email/password authentication
- Link create, read, update, and delete
- Tags and category fields
- Search by title, URL, description, category, and tags
- Favorite links
- Reading status: unread, reading, completed
- Priority: low, medium, high
- Dashboard summary
- URL duplicate check per user

## UI Direction

The UI will follow the Figma export closely:

- Auth page before sign-in
- App shell after sign-in with left sidebar and main content area
- Dashboard as the default signed-in page
- Dense list-based link management rather than large visual cards
- Modal or dialog form for adding and editing links
- Badges for status, priority, category, and tags
- Icon buttons for common actions such as favorite, edit, delete, and open link

The first UI implementation will use static mock data. Supabase will be connected after the layout and component structure are stable.

## Data Model

The main table will be `links`.

Fields:

- `id`: uuid primary key
- `user_id`: uuid, references `auth.users(id)`
- `title`: text
- `url`: text
- `description`: text nullable
- `category`: text nullable
- `tags`: text array
- `priority`: text enum-like value, one of `low`, `medium`, `high`
- `status`: text enum-like value, one of `unread`, `reading`, `completed`
- `is_favorite`: boolean
- `created_at`: timestamptz
- `updated_at`: timestamptz

Rules:

- A user can only read and write their own links.
- A user cannot save the same URL twice.
- URL duplicate checks happen in the UI before submit and are also enforced in the database with a unique constraint on `(user_id, url)`.

## Architecture

The app will use the existing Next.js App Router structure.

Planned source structure:

- `src/app/page.tsx`: entry route that renders the current app experience
- `src/components/auth/`: auth page and auth form components
- `src/components/layout/`: sidebar and app shell
- `src/components/links/`: link cards, lists, filters, forms, and detail views
- `src/components/dashboard/`: dashboard summary and recent links
- `src/components/ui/`: reusable UI primitives adapted from the Figma export when needed
- `src/lib/links.ts`: link filtering, sorting, validation, and mapping helpers
- `src/lib/auth.ts`: Supabase client configuration checks and browser client factory
- `src/types/link.ts`: shared LinkBox types

The Figma export uses Vite stateful navigation. The MVP can start with client-side state for the static UI, then replace mock operations with Supabase calls. If route-level URLs become necessary later, the app can split into `/login`, `/dashboard`, `/links`, and `/links/[id]`.

## Data Flow

Initial static UI:

1. Load mock links.
2. Render dashboard and links pages from local state.
3. Apply search, filters, sorting, favorite toggles, add/edit/delete in local state.

Supabase-backed MVP:

1. User signs in with Supabase Auth.
2. App loads links for `auth.user.id`.
3. Create/update/delete actions call Supabase.
4. Successful mutations update local UI state.
5. Duplicate URL errors show a user-facing message.

## Error Handling

The UI should handle:

- Missing Supabase environment variables
- Invalid login or sign-up credentials
- Failed link load
- Failed create/update/delete
- Duplicate URL on create or update
- Empty search/filter result states

Errors should be shown inline or with toast notifications. The user should not see raw Supabase errors.

## Testing And Verification

Verification will be incremental:

- `npm run lint`
- `npm run build`
- Browser verification of the static UI after Figma port
- Manual auth and CRUD checks after Supabase integration

For the static UI stage, success means the app builds and the main Figma-derived screens render with mock data.

For the Supabase stage, success means a signed-in user can manage only their own links and duplicate URLs are blocked.

## Commit Plan

The project will progress in small Git commits:

1. `docs: add LinkBox MVP design`
2. `feat: port static LinkBox UI from Figma export`
3. `feat: add LinkBox Supabase schema`
4. `feat: add Supabase auth flow`
5. `feat: connect links CRUD to Supabase`
6. `feat: add search filters favorites status priority`
7. `feat: add dashboard summaries and duplicate URL checks`

Commit boundaries may be adjusted if a step is too large, but each commit should represent a working checkpoint.
