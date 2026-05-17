import assert from "node:assert/strict";
import test from "node:test";
import {
  getLinkMutationErrorMessage,
  getLinkSuccessMessage,
  linkDraftToInsert,
  linkDraftToUpdate,
  linkRowToItem,
  shouldCommitTagInput,
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

test("linkRowToItem normalizes existing row tags", () => {
  assert.deepEqual(
    linkRowToItem({
      id: "link-id",
      user_id: "user-id",
      title: "React 문서",
      url: "https://react.dev",
      description: null,
      category: null,
      tags: [" React ", "react", "SUPABASE", " supabase "],
      priority: "high",
      status: "unread",
      is_favorite: false,
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    }).tags,
    ["react", "supabase"],
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

test("link draft helpers normalize tags consistently", () => {
  const draft = {
    title: "React 문서",
    url: "https://react.dev",
    description: null,
    category: null,
    tags: [" React ", "react", "SUPABASE", " supabase ", ""],
    priority: "medium" as const,
    status: "reading" as const,
    is_favorite: false,
  };

  assert.deepEqual(linkDraftToInsert(draft, "user-id").tags, [
    "react",
    "supabase",
  ]);
  assert.deepEqual(linkDraftToUpdate(draft).tags, ["react", "supabase"]);
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

test("shouldCommitTagInput ignores Enter while Korean IME is composing", () => {
  assert.equal(
    shouldCommitTagInput({
      input: "리액",
      isComposing: true,
      key: "Enter",
    }),
    false,
  );
  assert.equal(
    shouldCommitTagInput({
      input: "리액트",
      isComposing: false,
      key: "Enter",
    }),
    true,
  );
  assert.equal(
    shouldCommitTagInput({
      input: "   ",
      isComposing: false,
      key: "Enter",
    }),
    false,
  );
});

test("getLinkSuccessMessage returns Korean copy for link actions", () => {
  assert.equal(getLinkSuccessMessage("create"), "링크를 저장했습니다.");
  assert.equal(getLinkSuccessMessage("update"), "링크를 수정했습니다.");
  assert.equal(getLinkSuccessMessage("delete"), "링크를 삭제했습니다.");
  assert.equal(getLinkSuccessMessage("favorite"), "즐겨찾기를 변경했습니다.");
});
