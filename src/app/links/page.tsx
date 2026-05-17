import { LinkBoxApp } from "@/components/app/linkbox-app";
import type { LinkPageFilters } from "@/components/links/links-page";

type LinksRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LinksRoute({ searchParams }: LinksRouteProps) {
  const params = await searchParams;
  const initialFilters: LinkPageFilters = {
    category: getSingleSearchParam(params.category),
    priority: getSingleSearchParam(params.priority),
    status: getSingleSearchParam(params.status),
    tag: getSingleSearchParam(params.tag),
  };

  return <LinkBoxApp initialFilters={initialFilters} route="links" />;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
