import type { AppPage } from "@/components/layout/app-sidebar";
import type { LinkPageFilters } from "@/components/links/links-page";

export type AppRoute = AppPage | "detail";

export function buildLinksHref(filters: LinkPageFilters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.category) {
    searchParams.set("category", filters.category);
  }

  if (filters.priority) {
    searchParams.set("priority", filters.priority);
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.tag) {
    searchParams.set("tag", filters.tag.trim().toLowerCase());
  }

  const queryString = searchParams.toString();
  return queryString ? `/links?${queryString}` : "/links";
}

export function getCurrentPageFromRoute(route: AppRoute): AppPage {
  if (route === "detail") {
    return "links";
  }

  return route;
}
