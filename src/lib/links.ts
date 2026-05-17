import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinkDraft, LinkItem, LinkPriority, LinkStatus } from "@/types/link";

export type LinkRow = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  priority: LinkPriority;
  status: LinkStatus;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type TagInputCommitCheck = {
  input: string;
  isComposing: boolean;
  key: string;
};

export type LinkSuccessAction = "create" | "delete" | "favorite" | "update";

type LinkInsert = Omit<LinkItem, "created_at" | "id" | "updated_at">;

type LinkUpdate = LinkDraft & {
  updated_at: string;
};

export function linkRowToItem(row: LinkRow): LinkItem {
  return {
    ...row,
    tags: normalizeTags(row.tags ?? []),
  };
}

export function linkDraftToInsert(draft: LinkDraft, userId: string): LinkInsert {
  return {
    user_id: userId,
    title: draft.title.trim(),
    url: draft.url.trim(),
    description: draft.description?.trim() || null,
    category: draft.category?.trim() || null,
    tags: normalizeTags(draft.tags),
    priority: draft.priority,
    status: draft.status,
    is_favorite: draft.is_favorite,
  };
}

export function linkDraftToUpdate(draft: LinkDraft): LinkUpdate {
  return {
    title: draft.title.trim(),
    url: draft.url.trim(),
    description: draft.description?.trim() || null,
    category: draft.category?.trim() || null,
    tags: normalizeTags(draft.tags),
    priority: draft.priority,
    status: draft.status,
    is_favorite: draft.is_favorite,
    updated_at: new Date().toISOString(),
  };
}

export function getLinkMutationErrorMessage(message?: string) {
  const normalizedMessage = message?.toLowerCase() ?? "";

  if (
    normalizedMessage.includes("duplicate") ||
    normalizedMessage.includes("links_user_id_url_key")
  ) {
    return "이미 저장된 URL입니다.";
  }

  return "링크 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export function getLinkSuccessMessage(action: LinkSuccessAction) {
  const messages: Record<LinkSuccessAction, string> = {
    create: "링크를 저장했습니다.",
    update: "링크를 수정했습니다.",
    delete: "링크를 삭제했습니다.",
    favorite: "즐겨찾기를 변경했습니다.",
  };

  return messages[action];
}

export function shouldCommitTagInput({
  input,
  isComposing,
  key,
}: TagInputCommitCheck) {
  return key === "Enter" && !isComposing && Boolean(input.trim());
}

export async function listLinks(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(getLinkMutationErrorMessage(error.message));
  }

  return ((data ?? []) as LinkRow[]).map(linkRowToItem);
}

export async function createLink(
  supabase: SupabaseClient,
  draft: LinkDraft,
  userId: string,
) {
  const { data, error } = await supabase
    .from("links")
    .insert(linkDraftToInsert(draft, userId))
    .select("*")
    .single();

  if (error) {
    throw new Error(getLinkMutationErrorMessage(error.message));
  }

  return linkRowToItem(data as LinkRow);
}

export async function updateLink(
  supabase: SupabaseClient,
  id: string,
  draft: LinkDraft,
) {
  const { data, error } = await supabase
    .from("links")
    .update(linkDraftToUpdate(draft))
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(getLinkMutationErrorMessage(error.message));
  }

  return linkRowToItem(data as LinkRow);
}

export async function deleteLink(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("links").delete().eq("id", id);

  if (error) {
    throw new Error("링크 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

export function normalizeTags(tags: string[]) {
  const normalizedTags = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalizedTags));
}
