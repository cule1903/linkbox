import assert from "node:assert/strict";
import test from "node:test";
import {
  getLinkMutationErrorMessage,
  linkDraftToInsert,
  linkRowToItem,
} from "./links.ts";

test("linkRowToItem keeps nullable fields and array tags stable", () => {
  assert.deepEqual(
    linkRowToItem({
      id: "link-id",
      user_id: "user-id",
      title: "React 문서",
      url: "https://react.dev",
      description: null,
      category: null,
      tags: null,
      priority: "high",
      status: "unread",
      is_favorite: false,
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    }),
    {
      id: "link-id",
      user_id: "user-id",
      title: "React 문서",
      url: "https://react.dev",
      description: null,
      category: null,
      tags: [],
      priority: "high",
      status: "unread",
      is_favorite: false,
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    },
  );
});

test("linkDraftToInsert trims tags and attaches the current user id", () => {
  assert.deepEqual(
    linkDraftToInsert(
      {
        title: "React 문서",
        url: "https://react.dev",
        description: "",
        category: "",
        tags: [" react ", "", "docs"],
        priority: "medium",
        status: "reading",
        is_favorite: true,
      },
      "user-id",
    ),
    {
      user_id: "user-id",
      title: "React 문서",
      url: "https://react.dev",
      description: null,
      category: null,
      tags: ["react", "docs"],
      priority: "medium",
      status: "reading",
      is_favorite: true,
    },
  );
});

test("getLinkMutationErrorMessage maps duplicate URL errors to Korean copy", () => {
  assert.equal(
    getLinkMutationErrorMessage('duplicate key value violates unique constraint "links_user_id_url_key"'),
    "이미 저장된 URL입니다.",
  );
  assert.equal(
    getLinkMutationErrorMessage("some unknown database error"),
    "링크 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  );
});
