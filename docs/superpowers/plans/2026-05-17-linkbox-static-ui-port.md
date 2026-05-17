# LinkBox Static UI Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Figma-exported LinkBox UI into the existing Next.js App Router project using static mock data.

**Architecture:** Build a client-side app shell under `src/app/page.tsx` that renders auth, dashboard, links, favorites, detail, and add/edit dialog states from local React state. Keep reusable UI primitives small and local, then add LinkBox-specific components around the existing `LinkItem` domain type. Supabase integration is intentionally deferred to the next implementation plan.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, clsx.

---

## File Structure

- Modify `package.json`: add UI dependencies required by the Figma-derived static UI.
- Modify `src/app/globals.css`: add the Figma-inspired design tokens and utility base styles.
- Modify `src/types/link.ts`: align status naming with MVP/Figma UI needs while keeping database-facing field names.
- Create `src/lib/mock-links.ts`: static sample links, categories, and tags.
- Create `src/lib/link-utils.ts`: formatting, filtering, sorting, duplicate URL, status, and priority helpers.
- Create `src/components/ui/button.tsx`: reusable button primitive.
- Create `src/components/ui/card.tsx`: reusable card primitive.
- Create `src/components/ui/badge.tsx`: reusable badge primitive.
- Create `src/components/ui/input.tsx`: reusable input primitive.
- Create `src/components/ui/textarea.tsx`: reusable textarea primitive.
- Create `src/components/ui/select.tsx`: native select wrapper.
- Create `src/components/ui/dialog.tsx`: lightweight dialog wrapper.
- Create `src/components/layout/app-sidebar.tsx`: left navigation and user footer.
- Create `src/components/auth/auth-page.tsx`: static login/sign-up screen.
- Create `src/components/dashboard/dashboard-page.tsx`: dashboard summary and recent links.
- Create `src/components/links/link-card.tsx`: list card for a saved link.
- Create `src/components/links/link-form.tsx`: add/edit form with tags and duplicate URL feedback.
- Create `src/components/links/links-page.tsx`: searchable/filterable/sortable link list.
- Create `src/components/links/link-detail-page.tsx`: detail view for one link.
- Modify `src/app/page.tsx`: compose the static UI app with local state.
- Modify `PROJECT_PROGRESS.md`: mark the plan as written and the static UI port as the active execution stage.

## Task 1: Install Static UI Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `PROJECT_PROGRESS.md`

- [ ] **Step 1: Add dependencies**

Run:

```bash
npm install lucide-react clsx
```

Expected: `package.json` gains `lucide-react` and `clsx`; `package-lock.json` updates.

- [ ] **Step 2: Verify dependency install**

Run:

```bash
npm ls lucide-react clsx
```

Expected: both packages appear under `linkbox@0.1.0`.

- [ ] **Step 3: Update progress log**

Edit `PROJECT_PROGRESS.md` so `Current Stage` says:

```markdown
Static Figma UI port in progress.
```

Add this line under `Completed Work`:

```markdown
- Added static UI dependencies for the Figma UI port.
```

- [ ] **Step 4: Commit**

Run:

```bash
git add package.json package-lock.json PROJECT_PROGRESS.md
git commit -m "chore: add static UI dependencies"
```

Expected: commit succeeds.

## Task 2: Add Design Tokens And Shared Types

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/types/link.ts`
- Create: `src/lib/mock-links.ts`
- Create: `src/lib/link-utils.ts`
- Modify: `PROJECT_PROGRESS.md`

- [ ] **Step 1: Replace global styles**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --border: #e5e7eb;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --destructive: #dc2626;
  --radius: 0.625rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-destructive: var(--destructive);
  --font-sans: Arial, Helvetica, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: var(--background);
  color: var(--foreground);
}

button,
input,
textarea,
select {
  font: inherit;
}
```

- [ ] **Step 2: Update link types**

Replace `src/types/link.ts` with:

```ts
export type LinkPriority = "low" | "medium" | "high";

export type LinkStatus = "unread" | "reading" | "completed";

export type LinkItem = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  tags: string[];
  priority: LinkPriority;
  status: LinkStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type LinkDraft = Omit<
  LinkItem,
  "id" | "user_id" | "created_at" | "updated_at"
>;
```

- [ ] **Step 3: Add mock data**

Create `src/lib/mock-links.ts` with:

```ts
import type { LinkItem } from "@/types/link";

export const mockUser = {
  email: "student@example.com",
  name: "LinkBox User",
};

export const mockCategories = [
  "Documentation",
  "Tutorial",
  "Reference",
  "Blog Post",
  "Video",
  "Course",
];

export const mockTags = [
  "react",
  "typescript",
  "javascript",
  "css",
  "nodejs",
  "frontend",
  "backend",
  "performance",
  "best-practices",
];

export const mockLinks: LinkItem[] = [
  {
    id: "1",
    user_id: "mock-user",
    title: "React Documentation - Hooks",
    url: "https://react.dev/reference/react",
    description: "Reference for useState, useEffect, and other React hooks",
    category: "Documentation",
    tags: ["react", "hooks", "frontend"],
    status: "completed",
    priority: "high",
    is_favorite: true,
    created_at: "2026-05-10T10:30:00Z",
    updated_at: "2026-05-10T10:30:00Z",
  },
  {
    id: "2",
    user_id: "mock-user",
    title: "TypeScript Deep Dive",
    url: "https://basarat.gitbook.io/typescript",
    description: "Comprehensive TypeScript guide covering advanced patterns",
    category: "Tutorial",
    tags: ["typescript", "programming"],
    status: "reading",
    priority: "high",
    is_favorite: true,
    created_at: "2026-05-09T14:20:00Z",
    updated_at: "2026-05-09T14:20:00Z",
  },
  {
    id: "3",
    user_id: "mock-user",
    title: "Tailwind CSS Documentation",
    url: "https://tailwindcss.com/docs",
    description: "Utility-first CSS framework reference",
    category: "Documentation",
    tags: ["css", "tailwind", "styling"],
    status: "unread",
    priority: "medium",
    is_favorite: false,
    created_at: "2026-05-08T09:15:00Z",
    updated_at: "2026-05-08T09:15:00Z",
  },
  {
    id: "4",
    user_id: "mock-user",
    title: "Web.dev Performance Guide",
    url: "https://web.dev/performance",
    description: "Best practices for web performance optimization",
    category: "Tutorial",
    tags: ["performance", "web", "optimization"],
    status: "unread",
    priority: "medium",
    is_favorite: false,
    created_at: "2026-05-07T16:45:00Z",
    updated_at: "2026-05-07T16:45:00Z",
  },
];
```

- [ ] **Step 4: Add link utilities**

Create `src/lib/link-utils.ts` with:

```ts
import type { LinkItem, LinkPriority, LinkStatus } from "@/types/link";

export type LinkSort = "newest" | "oldest" | "title" | "priority";

const priorityRank: Record<LinkPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getStatusLabel(status: LinkStatus) {
  const labels: Record<LinkStatus, string> = {
    unread: "To Read",
    reading: "Reading",
    completed: "Completed",
  };

  return labels[status];
}

export function getPriorityLabel(priority: LinkPriority) {
  const labels: Record<LinkPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return labels[priority];
}

export function getStatusClassName(status: LinkStatus) {
  const classNames: Record<LinkStatus, string> = {
    unread: "border-blue-200 bg-blue-50 text-blue-700",
    reading: "border-amber-200 bg-amber-50 text-amber-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return classNames[status];
}

export function getPriorityClassName(priority: LinkPriority) {
  const classNames: Record<LinkPriority, string> = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-orange-200 bg-orange-50 text-orange-700",
    low: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return classNames[priority];
}

export function filterLinks(
  links: LinkItem[],
  options: {
    search: string;
    category: string;
    status: string;
    priority: string;
    favoritesOnly: boolean;
  },
) {
  const query = options.search.trim().toLowerCase();

  return links.filter((link) => {
    const searchable = [
      link.title,
      link.url,
      link.description ?? "",
      link.category ?? "",
      ...link.tags,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (!options.category || link.category === options.category) &&
      (!options.status || link.status === options.status) &&
      (!options.priority || link.priority === options.priority) &&
      (!options.favoritesOnly || link.is_favorite)
    );
  });
}

export function sortLinks(links: LinkItem[], sort: LinkSort) {
  return [...links].sort((a, b) => {
    if (sort === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sort === "priority") {
      return priorityRank[b.priority] - priorityRank[a.priority];
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function hasDuplicateUrl(
  links: LinkItem[],
  url: string,
  editingId?: string,
) {
  const normalizedUrl = url.trim().toLowerCase();

  return links.some(
    (link) =>
      link.id !== editingId && link.url.trim().toLowerCase() === normalizedUrl,
  );
}
```

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Update progress log**

Add this line under `Completed Work`:

```markdown
- Added LinkBox design tokens, shared link types, mock data, and link utility helpers.
```

- [ ] **Step 7: Commit**

Run:

```bash
git add src/app/globals.css src/types/link.ts src/lib/mock-links.ts src/lib/link-utils.ts PROJECT_PROGRESS.md
git commit -m "feat: add LinkBox static UI foundation"
```

Expected: commit succeeds.

## Task 3: Add Reusable UI Primitives

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/dialog.tsx`
- Modify: `PROJECT_PROGRESS.md`

- [ ] **Step 1: Create button primitive**

Create `src/components/ui/button.tsx` with:

```tsx
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-blue-700",
  outline: "border border-border bg-white hover:bg-slate-50",
  ghost: "hover:bg-slate-100",
  destructive: "bg-destructive text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-sm",
  icon: "h-9 w-9",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Create card primitive**

Create `src/components/ui/card.tsx` with:

```tsx
import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-5 pb-2", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx("font-medium", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-5", className)} {...props} />;
}
```

- [ ] **Step 3: Create badge primitive**

Create `src/components/ui/badge.tsx` with:

```tsx
import type { HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "secondary";
};

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  outline: "border-border bg-white text-foreground",
  secondary: "border-transparent bg-slate-100 text-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Create form primitives**

Create `src/components/ui/input.tsx` with:

```tsx
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
        className,
      )}
      {...props}
    />
  );
}
```

Create `src/components/ui/textarea.tsx` with:

```tsx
import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "flex min-h-24 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
        className,
      )}
      {...props}
    />
  );
}
```

Create `src/components/ui/select.tsx` with:

```tsx
import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "h-10 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
```

- [ ] **Step 5: Create dialog primitive**

Create `src/components/ui/dialog.tsx` with:

```tsx
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Dialog({ open, title, children, onClose }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-medium">{title}</h2>
          <Button aria-label="Close dialog" onClick={onClose} size="icon" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Update progress log**

Add this line under `Completed Work`:

```markdown
- Added reusable UI primitives for the static Figma UI port.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/ui PROJECT_PROGRESS.md
git commit -m "feat: add reusable UI primitives"
```

Expected: commit succeeds.

## Task 4: Port LinkBox Screens And App State

**Files:**
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/auth/auth-page.tsx`
- Create: `src/components/dashboard/dashboard-page.tsx`
- Create: `src/components/links/link-card.tsx`
- Create: `src/components/links/link-form.tsx`
- Create: `src/components/links/links-page.tsx`
- Create: `src/components/links/link-detail-page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `PROJECT_PROGRESS.md`

- [ ] **Step 1: Implement sidebar**

Create `src/components/layout/app-sidebar.tsx` with:

```tsx
import { Bookmark, LayoutDashboard, LogOut, Star, User } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

export type AppPage = "dashboard" | "links" | "favorites" | "detail";

type AppSidebarProps = {
  currentPage: AppPage;
  userEmail: string;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
};

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, page: "dashboard" as const },
  { title: "All Links", icon: Bookmark, page: "links" as const },
  { title: "Favorites", icon: Star, page: "favorites" as const },
];

export function AppSidebar({
  currentPage,
  userEmail,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-border bg-white">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">LinkBox</h1>
            <p className="text-xs text-muted-foreground">Link Organizer</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        {menuItems.map((item) => (
          <button
            className={clsx(
              "mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
              currentPage === item.page
                ? "bg-blue-50 text-blue-700"
                : "text-slate-700 hover:bg-slate-100",
            )}
            key={item.page}
            onClick={() => onNavigate(item.page)}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </button>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm">{userEmail}</p>
        </div>
        <Button className="w-full justify-start" onClick={onLogout} variant="ghost">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Implement auth page**

Create `src/components/auth/auth-page.tsx` with:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthPageProps = {
  onLogin: (email: string) => void;
};

export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin(email);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Bookmark className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-semibold">LinkBox</h1>
          <p className="text-muted-foreground">
            Your personal link organizer for learning resources
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-md px-3 py-2 text-sm ${mode === "login" ? "bg-white shadow-sm" : "text-slate-600"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm ${mode === "signup" ? "bg-white shadow-sm" : "text-slate-600"}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "login" ? "Welcome back" : "Create an account"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your links"
                : "Get started with LinkBox in seconds"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Name</span>
                  <Input
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                    type="text"
                    value={name}
                  />
                </label>
              )}
              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <Input
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Password</span>
                <Input
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="password"
                  required
                  type="password"
                  value={password}
                />
              </label>
              <Button className="w-full" type="submit">
                {mode === "login" ? "Login" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Implement remaining screens**

Port the screen components from the Figma export using the helpers and primitives defined in earlier tasks. The implementation must preserve these interactions:

- Dashboard shows totals for all links, unread, reading, completed, and favorites.
- Links page supports search, category filter, status filter, priority filter, favorites-only filter, and sorting.
- Link cards expose favorite, open URL, edit, delete, and view detail actions.
- Link form supports title, URL, description, category, status, priority, favorite, and tag entry.
- Duplicate URL warning appears before saving a new or edited link with an existing URL.
- Detail page shows full link metadata and a back button.

Create these exact files:

- `src/components/dashboard/dashboard-page.tsx`
- `src/components/links/link-card.tsx`
- `src/components/links/link-form.tsx`
- `src/components/links/links-page.tsx`
- `src/components/links/link-detail-page.tsx`

Use the already extracted Figma files as the source reference:

- `/private/tmp/linkbox-figma-ui/src/app/pages/DashboardPage.tsx`
- `/private/tmp/linkbox-figma-ui/src/app/components/LinkCard.tsx`
- `/private/tmp/linkbox-figma-ui/src/app/components/LinkForm.tsx`
- `/private/tmp/linkbox-figma-ui/src/app/pages/LinksPage.tsx`
- `/private/tmp/linkbox-figma-ui/src/app/pages/LinkDetailPage.tsx`

Required field mapping:

- `memo` becomes `description`
- `isFavorite` becomes `is_favorite`
- `createdAt` becomes `created_at`
- `to-read` becomes `unread`
- `Link` becomes `LinkItem`

Required import mapping:

- Figma UI imports from `../components/ui/*` become imports from `@/components/ui/*`.
- Figma helpers from `../lib/utils` become imports from `@/lib/link-utils`.
- Figma mock category imports become imports from `@/lib/mock-links`.

- [ ] **Step 4: Compose app state**

Replace `src/app/page.tsx` with a client component that:

- Starts unauthenticated and renders `AuthPage`.
- Stores `links` from `mockLinks`.
- Stores `currentPage`, `selectedLink`, `isFormOpen`, and `editingLink`.
- Handles add, edit, delete, favorite toggle, detail navigation, and logout.
- Renders `Dialog` around `LinkForm`.

- [ ] **Step 5: Run lint and build**

Run:

```bash
npm run lint
```

Expected: PASS.

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Verify in browser**

Run:

```bash
npm run dev
```

Expected: dev server starts.

Open `http://localhost:3000` and verify:

- Auth page renders.
- Submitting mock login enters the app.
- Sidebar navigation works.
- Dashboard renders summary cards and recent links.
- Links page filters and search work.
- Add/edit dialog opens and saves local mock state.
- Duplicate URL warning blocks save.
- Favorite toggles update UI.
- Detail page opens and returns to links.

- [ ] **Step 7: Update progress log**

Set `Current Stage` to:

```markdown
Static Figma UI port complete. Next stage: Supabase schema and auth.
```

Add this line under `Completed Work`:

```markdown
- Ported the Figma-exported LinkBox UI into the Next.js app with static mock data.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/app/page.tsx src/components src/lib src/types PROJECT_PROGRESS.md
git commit -m "feat: port static LinkBox UI from Figma export"
```

Expected: commit succeeds.

## Self-Review

Spec coverage:

- Figma static UI port is covered by Tasks 1 through 4.
- MVP auth, dashboard, links list, link detail, add/edit/delete, favorites, status, priority, category, tags, search, filters, sorting, and duplicate URL checks are represented in static UI state.
- Supabase schema, real auth, RLS, and database-backed CRUD are intentionally deferred to the next plan because this plan is scoped to the static Figma UI port.

Placeholder scan:

- No TBD, TODO, or deferred implementation placeholders remain. Large Figma-derived screens are specified by exact source files, destination files, field mappings, and required interactions.

Type consistency:

- The plan consistently uses `LinkItem`, snake_case database-facing fields, and `unread | reading | completed` status values.
