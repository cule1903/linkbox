import assert from "node:assert/strict";
import test from "node:test";
import { filterLinks } from "./link-utils.ts";
import type { LinkItem } from "@/types/link";

const baseLink: LinkItem = {
  id: "link-id",
  user_id: "user-id",
  title: "React 문서",
  url: "https://react.dev",
  description: null,
  category: "문서",
  tags: [],
  priority: "medium",
  status: "unread",
  is_favorite: false,
  created_at: "2026-05-17T00:00:00Z",
  updated_at: "2026-05-17T00:00:00Z",
};

test("filterLinks filters by exact normalized tag", () => {
  const links: LinkItem[] = [
    {
      ...baseLink,
      id: "react-link",
      tags: ["React", "hooks"],
    },
    {
      ...baseLink,
      id: "supabase-link",
      title: "Supabase RLS",
      tags: ["supabase", "database"],
    },
  ];

  assert.deepEqual(
    filterLinks(links, {
      category: "",
      favoritesOnly: false,
      priority: "",
      search: "",
      status: "",
      tag: "react",
    }).map((link) => link.id),
    ["react-link"],
  );
});
