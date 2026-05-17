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
