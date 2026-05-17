import type { SupabaseClient } from "@supabase/supabase-js";
import type { TagItem } from "@/types/tag";

export type TagRow = TagItem;

export type TagInsert = {
  user_id: string;
  name: string;
};

type LinkTagInsert = {
  link_id: string;
  tag_id: string;
  user_id: string;
};

export function tagRowToItem(row: TagRow): TagItem {
  return row;
}

export function normalizeTagName(name: string) {
  return name.trim().toLowerCase();
}

export function tagDraftToInsert(name: string, userId: string): TagInsert {
  return {
    user_id: userId,
    name: normalizeTagName(name),
  };
}

export function getTagMutationErrorMessage(message?: string) {
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("duplicate") ||
    normalizedMessage.includes("tags_user_id_name_key")
  ) {
    return "이미 있는 태그입니다.";
  }

  return "태그 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export function getTagOptionNames(tags: TagItem[], linkTagNames: string[] = []) {
  const sourceNames = [
    ...tags.map((tag) => tag.name),
    ...linkTagNames,
  ].map(normalizeTagName);

  return Array.from(new Set(sourceNames)).filter(Boolean).sort();
}

export async function listTags(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(getTagMutationErrorMessage(error.message));
  }

  return ((data ?? []) as TagRow[]).map(tagRowToItem);
}

export async function createTag(
  supabase: SupabaseClient,
  name: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("tags")
    .insert(tagDraftToInsert(name, userId))
    .select("*")
    .single();

  if (error) {
    throw new Error(getTagMutationErrorMessage(error.message));
  }

  return tagRowToItem(data as TagRow);
}

export async function renameTag(
  supabase: SupabaseClient,
  id: string,
  name: string,
) {
  const { data, error } = await supabase.rpc("rename_tag", {
    p_name: normalizeTagName(name),
    p_tag_id: id,
  });

  if (error) {
    throw new Error(getTagMutationErrorMessage(error.message));
  }

  return tagRowToItem(data as TagRow);
}

export async function deleteTag(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    throw new Error("태그 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export async function syncLinkTags(
  supabase: SupabaseClient,
  linkId: string,
  tagNames: string[],
  userId: string,
) {
  const normalizedNames = Array.from(
    new Set(tagNames.map(normalizeTagName).filter(Boolean)),
  );

  const tags = await Promise.all(
    normalizedNames.map((name) => upsertTagByName(supabase, name, userId)),
  );

  const { error: deleteError } = await supabase
    .from("link_tags")
    .delete()
    .eq("link_id", linkId);

  if (deleteError) {
    throw new Error(getTagMutationErrorMessage(deleteError.message));
  }

  if (tags.length === 0) {
    return tags;
  }

  const linkTagRows: LinkTagInsert[] = tags.map((tag) => ({
    link_id: linkId,
    tag_id: tag.id,
    user_id: userId,
  }));

  const { error: insertError } = await supabase
    .from("link_tags")
    .insert(linkTagRows);

  if (insertError) {
    throw new Error(getTagMutationErrorMessage(insertError.message));
  }

  return tags;
}

async function upsertTagByName(
  supabase: SupabaseClient,
  name: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("tags")
    .upsert(tagDraftToInsert(name, userId), {
      onConflict: "user_id,name",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(getTagMutationErrorMessage(error.message));
  }

  return tagRowToItem(data as TagRow);
}
