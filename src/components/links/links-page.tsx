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

type LinksPageProps = {
  links: LinkItem[];
  title?: string;
  onAddLink: () => void;
  onDeleteLink: (id: string) => void;
  onEditLink: (link: LinkItem) => void;
  onToggleFavorite: (id: string) => void;
  onViewLink: (link: LinkItem) => void;
};

export function LinksPage({
  links,
  title = "All Links",
  onAddLink,
  onDeleteLink,
  onEditLink,
  onToggleFavorite,
  onViewLink,
}: LinksPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
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
            {filteredAndSortedLinks.length} link
            {filteredAndSortedLinks.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button onClick={onAddLink}>
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search links by title, URL, memo, or tag..."
            value={search}
          />
        </div>

        <div className="flex gap-2">
          <Select
            className="w-40"
            onChange={(event) => setSortBy(event.target.value as LinkSort)}
            value={sortBy}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="priority">Priority</option>
          </Select>

          <Button
            aria-label="Show favorites only"
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
          <span className="text-sm">Filters:</span>
        </div>

        <Select
          className="w-40"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="">All Categories</option>
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
          <option value="">All Status</option>
          <option value="unread">To Read</option>
          <option value="reading">Reading</option>
          <option value="completed">Completed</option>
        </Select>

        <Select
          className="w-40"
          onChange={(event) => setPriority(event.target.value)}
          value={priority}
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>

        {activeFiltersCount > 0 && (
          <Button onClick={clearFilters} size="sm" variant="ghost">
            Clear filters
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
                ? "No links saved yet. Add your first link to get started."
                : "No links match your filters. Try adjusting your search criteria."}
            </p>
            {links.length === 0 && (
              <Button onClick={onAddLink}>
                <Plus className="h-4 w-4" />
                Add Your First Link
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
