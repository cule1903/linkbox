"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LinkCard } from "@/components/links/link-card";
import { filterLinks, sortLinks, type LinkSort } from "@/lib/link-utils";
import { mockCategories } from "@/lib/mock-links";
import type { LinkItem } from "@/types/link";

export type LinkPageFilters = {
  category?: string;
  favoritesOnly?: boolean;
  priority?: string;
  status?: string;
};

type LinksPageProps = {
  initialFilters?: LinkPageFilters;
  links: LinkItem[];
  title?: string;
  onAddLink: () => void;
  onDeleteLink: (id: string) => void;
  onEditLink: (link: LinkItem) => void;
  onToggleFavorite: (id: string) => void;
  onViewLink: (link: LinkItem) => void;
};

export function LinksPage({
  initialFilters,
  links,
  title = "전체 링크",
  onAddLink,
  onDeleteLink,
  onEditLink,
  onToggleFavorite,
  onViewLink,
}: LinksPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialFilters?.category ?? "");
  const [status, setStatus] = useState(initialFilters?.status ?? "");
  const [priority, setPriority] = useState(initialFilters?.priority ?? "");
  const [favoritesOnly, setFavoritesOnly] = useState(
    initialFilters?.favoritesOnly ?? false,
  );
  const [sortBy, setSortBy] = useState<LinkSort>("newest");

  const filteredAndSortedLinks = useMemo(
    () =>
      sortLinks(
        filterLinks(links, {
          search,
          category,
          status,
          priority,
          favoritesOnly,
        }),
        sortBy,
      ),
    [category, favoritesOnly, links, priority, search, sortBy, status],
  );

  const activeFiltersCount =
    [category, status, priority].filter(Boolean).length +
    (favoritesOnly ? 1 : 0);

  function clearFilters() {
    setCategory("");
    setStatus("");
    setPriority("");
    setFavoritesOnly(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">
            {filteredAndSortedLinks.length}개의 링크를 찾았습니다
          </p>
        </div>
        <Button onClick={onAddLink}>
          <Plus className="h-4 w-4" />
          링크 추가
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="제목, URL, 메모, 태그로 검색..."
            value={search}
          />
        </div>

        <div className="flex gap-2">
          <Select
            className="w-40"
            onChange={(event) => setSortBy(event.target.value as LinkSort)}
            value={sortBy}
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
            <option value="priority">우선순위순</option>
          </Select>

          <Button
            aria-label="즐겨찾기만 보기"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            size="icon"
            variant={favoritesOnly ? "default" : "outline"}
          >
            <Star
              className={`h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">필터:</span>
        </div>

        <Select
          className="w-40"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="">전체 카테고리</option>
          {mockCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Select
          className="w-40"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="">전체 상태</option>
          <option value="unread">읽을 예정</option>
          <option value="reading">읽는 중</option>
          <option value="completed">완료</option>
        </Select>

        <Select
          className="w-40"
          onChange={(event) => setPriority(event.target.value)}
          value={priority}
        >
          <option value="">전체 우선순위</option>
          <option value="high">높음</option>
          <option value="medium">보통</option>
          <option value="low">낮음</option>
        </Select>

        {activeFiltersCount > 0 && (
          <Button onClick={clearFilters} size="sm" variant="ghost">
            필터 초기화
            <Badge className="ml-1" variant="secondary">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {filteredAndSortedLinks.length === 0 ? (
          <div className="rounded-lg bg-slate-50 py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              {links.length === 0
                ? "아직 저장된 링크가 없습니다. 첫 링크를 추가해보세요."
                : "조건에 맞는 링크가 없습니다. 검색어나 필터를 조정해보세요."}
            </p>
            {links.length === 0 && (
              <Button onClick={onAddLink}>
                <Plus className="h-4 w-4" />
                첫 링크 추가
              </Button>
            )}
          </div>
        ) : (
          filteredAndSortedLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onClick={onViewLink}
              onDelete={onDeleteLink}
              onEdit={onEditLink}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
}
