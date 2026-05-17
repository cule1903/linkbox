import {
  Bookmark,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Star,
  Tags,
  User,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

export type AppPage = "dashboard" | "links" | "favorites" | "categories" | "tags";

type AppSidebarProps = {
  currentPage: AppPage;
  userEmail: string;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
};

const menuItems = [
  { title: "대시보드", icon: LayoutDashboard, page: "dashboard" as const },
  { title: "전체 링크", icon: Bookmark, page: "links" as const },
  { title: "즐겨찾기", icon: Star, page: "favorites" as const },
  { title: "카테고리", icon: FolderKanban, page: "categories" as const },
  { title: "태그", icon: Tags, page: "tags" as const },
];

export function AppSidebar({
  currentPage,
  userEmail,
  onNavigate,
  onLogout,
}: AppSidebarProps) {
  return (
    <aside className="flex w-full flex-col border-b border-border bg-white md:min-h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">LinkBox</h1>
            <p className="text-xs text-muted-foreground">링크 정리 도구</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        {menuItems.map((item) => (
          <button
            className={clsx(
              "mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
              currentPage === item.page
                ? "bg-blue-50 text-blue-700"
                : "text-slate-700 hover:bg-slate-100",
            )}
            key={item.page}
            onClick={() => onNavigate(item.page)}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </button>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <p className="min-w-0 flex-1 truncate text-sm">{userEmail}</p>
        </div>
        <Button className="w-full justify-start" onClick={onLogout} variant="ghost">
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </aside>
  );
}
