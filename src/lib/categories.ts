import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryItem } from "@/types/category";

export const defaultCategoryNames = [
  "문서",
  "튜토리얼",
  "레퍼런스",
  "블로그",
  "영상",
  "강의",
];

export type CategoryRow = CategoryItem;

export type CategoryInsert = {
  user_id: string;
  name: string;
};

export type CategoryUpdate = {
  name: string;
};

export function categoryRowToItem(row: CategoryRow): CategoryItem {
  return row;
}

export function normalizeCategoryName(name: string) {
  return name.trim();
}

export function categoryDraftToInsert(
  name: string,
  userId: string,
): CategoryInsert {
  return {
    user_id: userId,
    name: normalizeCategoryName(name),
  };
}

export function categoryDraftToUpdate(name: string): CategoryUpdate {
  return {
    name: normalizeCategoryName(name),
  };
}

export function getCategoryMutationErrorMessage(message?: string) {
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("duplicate") ||
    normalizedMessage.includes("categories_user_id_name_key")
  ) {
    return "이미 있는 카테고리입니다.";
  }

  return "카테고리 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export function getCategoryOptionNames(categories: CategoryItem[]) {
  const sourceNames =
    categories.length > 0
      ? categories.map((category) => category.name)
      : defaultCategoryNames;

  return Array.from(new Set(sourceNames.map(normalizeCategoryName))).filter(
    Boolean,
  );
}

export async function listCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(getCategoryMutationErrorMessage(error.message));
  }

  return ((data ?? []) as CategoryRow[]).map(categoryRowToItem);
}

export async function createCategory(
  supabase: SupabaseClient,
  name: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("categories")
    .insert(categoryDraftToInsert(name, userId))
    .select("*")
    .single();

  if (error) {
    throw new Error(getCategoryMutationErrorMessage(error.message));
  }

  return categoryRowToItem(data as CategoryRow);
}

export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  name: string,
) {
  const { data, error } = await supabase
    .from("categories")
    .update({
      ...categoryDraftToUpdate(name),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(getCategoryMutationErrorMessage(error.message));
  }

  return categoryRowToItem(data as CategoryRow);
}

export async function deleteCategory(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw new Error("카테고리 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
}
