import type { LinkItem, LinkPriority, LinkStatus } from "@/types/link";

export type LinkSort = "newest" | "oldest" | "title" | "priority";

const priorityRank: Record<LinkPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getStatusLabel(status: LinkStatus) {
  const labels: Record<LinkStatus, string> = {
    unread: "읽을 예정",
    reading: "읽는 중",
    completed: "완료",
  };

  return labels[status];
}

export function getPriorityLabel(priority: LinkPriority) {
  const labels: Record<LinkPriority, string> = {
    low: "낮음",
    medium: "보통",
    high: "높음",
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
    tag?: string;
  },
) {
  const query = options.search.trim().toLowerCase();
  const tagQuery = options.tag?.trim().toLowerCase() ?? "";

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
      (!options.favoritesOnly || link.is_favorite) &&
      (!tagQuery ||
        link.tags.some((tag) => tag.trim().toLowerCase() === tagQuery))
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
