import assert from "node:assert/strict";
import test from "node:test";
import {
  categoryDraftToInsert,
  categoryDraftToUpdate,
  categoryRowToItem,
  getCategoryMutationErrorMessage,
  getCategoryOptionNames,
  normalizeCategoryName,
} from "./categories.ts";

test("categoryRowToItem maps a database row without changing labels", () => {
  assert.deepEqual(
    categoryRowToItem({
      id: "category-id",
      user_id: "user-id",
      name: "레퍼런스",
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    }),
    {
      id: "category-id",
      user_id: "user-id",
      name: "레퍼런스",
      created_at: "2026-05-17T00:00:00Z",
      updated_at: "2026-05-17T00:00:00Z",
    },
  );
});

test("category draft helpers trim names and attach current user", () => {
  assert.equal(normalizeCategoryName("  튜토리얼  "), "튜토리얼");
  assert.deepEqual(categoryDraftToInsert("  문서  ", "user-id"), {
    user_id: "user-id",
    name: "문서",
  });
  assert.deepEqual(categoryDraftToUpdate("  블로그  "), {
    name: "블로그",
  });
});

test("category errors use Korean messages for duplicate labels", () => {
  assert.equal(
    getCategoryMutationErrorMessage("duplicate key value violates unique constraint categories_user_id_name_key"),
    "이미 있는 카테고리입니다.",
  );
  assert.equal(
    getCategoryMutationErrorMessage("unknown"),
    "카테고리 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  );
});

test("getCategoryOptionNames combines saved and default category names", () => {
  assert.deepEqual(
    getCategoryOptionNames([
      {
        id: "category-id",
        user_id: "user-id",
        name: "레퍼런스",
        created_at: "2026-05-17T00:00:00Z",
        updated_at: "2026-05-17T00:00:00Z",
      },
    ]),
    ["레퍼런스"],
  );

  assert.deepEqual(getCategoryOptionNames([]), [
    "문서",
    "튜토리얼",
    "레퍼런스",
    "블로그",
    "영상",
    "강의",
  ]);
});
