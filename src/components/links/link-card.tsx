import {
  Edit,
  ExternalLink,
  MoreVertical,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDate,
  getPriorityClassName,
  getPriorityLabel,
  getStatusClassName,
  getStatusLabel,
} from "@/lib/link-utils";
import type { LinkItem } from "@/types/link";

type LinkCardProps = {
  link: LinkItem;
  onClick: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onEdit: (link: LinkItem) => void;
  onToggleFavorite: (id: string) => void;
};

export function LinkCard({
  link,
  onClick,
  onDelete,
  onEdit,
  onToggleFavorite,
}: LinkCardProps) {
  return (
    <Card className="group cursor-pointer transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1" onClick={() => onClick(link)}>
            <div className="mb-2 flex items-start gap-2">
              <h3 className="flex-1 truncate text-lg font-medium">
                {link.title}
              </h3>
              <button
                aria-label="Toggle favorite"
                className="text-slate-400 transition-colors hover:text-amber-500"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(link.id);
                }}
              >
                <Star
                  className={`h-4 w-4 ${
                    link.is_favorite ? "fill-amber-500 text-amber-500" : ""
                  }`}
                />
              </button>
            </div>

            <a
              className="mb-2 flex items-center gap-1 truncate text-sm text-blue-600 hover:text-blue-800"
              href={link.url}
              onClick={(event) => event.stopPropagation()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="truncate">{link.url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>

            {link.description && (
              <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                {link.description}
              </p>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                className={getStatusClassName(link.status)}
                variant="outline"
              >
                {getStatusLabel(link.status)}
              </Badge>
              <Badge
                className={getPriorityClassName(link.priority)}
                variant="outline"
              >
                {getPriorityLabel(link.priority)}
              </Badge>
              {link.category && (
                <Badge
                  className="border-purple-200 bg-purple-50 text-purple-700"
                  variant="outline"
                >
                  {link.category}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {link.tags.slice(0, 3).map((tag) => (
                <span
                  className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                  key={tag}
                >
                  #{tag}
                </span>
              ))}
              {link.tags.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{link.tags.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
            <Button
              aria-label="Edit link"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(link);
              }}
              size="icon"
              variant="ghost"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Delete link"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(link.id);
              }}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
            <MoreVertical className="hidden h-4 w-4 text-slate-400 md:block" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-slate-500">
            Added {formatDate(link.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
