import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Star,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkCard } from "@/components/links/link-card";
import type { LinkPageFilters } from "@/components/links/links-page";
import type { LinkItem } from "@/types/link";

type DashboardPageProps = {
  links: LinkItem[];
  onDeleteLink: (id: string) => void;
  onEditLink: (link: LinkItem) => void;
  onOpenFilteredLinks: (filters?: LinkPageFilters) => void;
  onOpenFavorites: () => void;
  onToggleFavorite: (id: string) => void;
  onViewLink: (link: LinkItem) => void;
};

export function DashboardPage({
  links,
  onDeleteLink,
  onEditLink,
  onOpenFilteredLinks,
  onOpenFavorites,
  onToggleFavorite,
  onViewLink,
}: DashboardPageProps) {
  const stats = {
    total: links.length,
    unread: links.filter((link) => link.status === "unread").length,
    reading: links.filter((link) => link.status === "reading").length,
    completed: links.filter((link) => link.status === "completed").length,
    favorites: links.filter((link) => link.is_favorite).length,
  };

  const recentLinks = [...links]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const categoryCounts = links.reduce<Record<string, number>>((acc, link) => {
    if (!link.category) {
      return acc;
    }

    acc[link.category] = (acc[link.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold">대시보드</h1>
        <p className="text-muted-foreground">
          저장한 링크의 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Bookmark className="h-4 w-4 text-muted-foreground" />}
          label="전체 링크"
          value={stats.total}
          helper="저장된 모든 링크"
          onClick={() => onOpenFilteredLinks()}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
          label="읽을 예정"
          value={stats.unread}
          helper="아직 읽지 않은 링크"
          onClick={() => onOpenFilteredLinks({ status: "unread" })}
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4 text-amber-600" />}
          label="읽는 중"
          value={stats.reading}
          helper="현재 확인 중"
          onClick={() => onOpenFilteredLinks({ status: "reading" })}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          label="완료"
          value={stats.completed}
          helper="읽기를 마친 링크"
          onClick={() => onOpenFilteredLinks({ status: "completed" })}
        />
        <StatCard
          icon={<Star className="h-4 w-4 text-amber-500" />}
          label="즐겨찾기"
          value={stats.favorites}
          helper="중요하게 표시한 링크"
          onClick={onOpenFavorites}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-semibold">최근 저장한 링크</h2>
          {recentLinks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bookmark className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-muted-foreground">아직 저장된 링크가 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onClick={onViewLink}
                  onDelete={onDeleteLink}
                  onEdit={onEditLink}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                아직 카테고리가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {topCategories.map(([category, count]) => (
                  <button
                    className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left transition-colors hover:bg-slate-50"
                    key={category}
                    onClick={() => onOpenFilteredLinks({ category })}
                  >
                    <span className="text-sm">{category}</span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-sm">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  helper,
  icon,
  label,
  value,
  onClick,
}: {
  helper: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent
        className="cursor-pointer rounded-b-lg transition-colors hover:bg-slate-50"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
      >
        <div className="text-2xl font-semibold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
