import {
  ArrowLeft,
  Calendar,
  Edit,
  ExternalLink,
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

type LinkDetailPageProps = {
  link: LinkItem;
  onBack: () => void;
  onDelete: (id: string) => void;
  onEdit: (link: LinkItem) => void;
  onToggleFavorite: (id: string) => void;
};

export function LinkDetailPage({
  link,
  onBack,
  onDelete,
  onEdit,
  onToggleFavorite,
}: LinkDetailPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button className="mb-4" onClick={onBack} variant="ghost">
        <ArrowLeft className="h-4 w-4" />
        Back to Links
      </Button>

      <Card>
        <CardContent className="p-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-4 text-3xl font-semibold">{link.title}</h1>
              <a
                className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                href={link.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="break-all">{link.url}</span>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>

            <button
              aria-label="Toggle favorite"
              className="ml-4 text-slate-400 transition-colors hover:text-amber-500"
              onClick={() => onToggleFavorite(link.id)}
            >
              <Star
                className={`h-6 w-6 ${
                  link.is_favorite ? "fill-amber-500 text-amber-500" : ""
                }`}
              />
            </button>
          </div>

          {link.description && (
            <div className="mb-8">
              <h2 className="mb-2 text-lg font-medium">Notes</h2>
              <p className="leading-relaxed text-slate-700">
                {link.description}
              </p>
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium">Status & Priority</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-20 text-sm text-slate-600">Status:</span>
                  <Badge
                    className={getStatusClassName(link.status)}
                    variant="outline"
                  >
                    {getStatusLabel(link.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-sm text-slate-600">Priority:</span>
                  <Badge
                    className={getPriorityClassName(link.priority)}
                    variant="outline"
                  >
                    {getPriorityLabel(link.priority)}
                  </Badge>
                </div>
              </div>
            </div>

            {link.category && (
              <div>
                <h3 className="mb-3 font-medium">Category</h3>
                <Badge
                  className="border-purple-200 bg-purple-50 text-purple-700"
                  variant="outline"
                >
                  {link.category}
                </Badge>
              </div>
            )}
          </div>

          {link.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {link.tags.map((tag) => (
                  <span
                    className="inline-flex items-center rounded bg-slate-100 px-3 py-1 text-sm"
                    key={tag}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 flex items-center gap-2 border-b border-border pb-8 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>Added {formatDate(link.created_at)}</span>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => onEdit(link)}>
              <Edit className="h-4 w-4" />
              Edit Link
            </Button>
            <Button
              onClick={() => {
                onDelete(link.id);
                onBack();
              }}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
