import assert from "node:assert/strict";
import test from "node:test";
import {
  getTagMutationErrorMessage,
  getTagOptionNames,
  normalizeTagName,
  tagDraftToInsert,
  tagDraftToUpdate,
  tagRowToItem,
} from "./tags.ts";

test("tagRowToItem maps a database row", () => {
  assert.deepEqual(
    tagRowToItem({
      id: "tag-id",
      user_id: "user-id",
      name: "react",
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    }),
    {
      id: "tag-id",
      user_id: "user-id",
      name: "react",
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    },
  );
});

test("tag helpers trim, lowercase, dedupe, and attach current user", () => {
  assert.equal(normalizeTagName("  React  "), "react");
  assert.deepEqual(tagDraftToInsert("  TypeScript  ", "user-id"), {
    user_id: "user-id",
    name: "typescript",
  });
  assert.deepEqual(tagDraftToUpdate("  NextJS  "), {
    name: "nextjs",
  });
  assert.deepEqual(getTagOptionNames([], [" React ", "react", "supabase"]), [
    "react",
    "supabase",
  ]);
});

test("tag errors use Korean messages for duplicate labels", () => {
  assert.equal(
    getTagMutationErrorMessage("duplicate key value violates unique constraint tags_user_id_name_key"),
    "이미 있는 태그입니다.",
  );
  assert.equal(
    getTagMutationErrorMessage("unknown"),
    "태그 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  );
});
