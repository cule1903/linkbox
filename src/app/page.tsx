"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AppPage, AppSidebar } from "@/components/layout/app-sidebar";
import { LinkDetailPage } from "@/components/links/link-detail-page";
import { LinkForm } from "@/components/links/link-form";
import { LinkPageFilters, LinksPage } from "@/components/links/links-page";
import { Dialog } from "@/components/ui/dialog";
import {
  getAuthErrorMessage,
  getSupabaseBrowserClient,
  hasSupabaseConfig,
} from "@/lib/auth";
import {
  createLink,
  deleteLink,
  getLinkMutationErrorMessage,
  getLinkSuccessMessage,
  listLinks,
  updateLink,
} from "@/lib/links";
import { mockUser } from "@/lib/mock-links";
import type { LinkDraft, LinkItem } from "@/types/link";

const subscribeToHydration = () => () => {};

export default function Home() {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const isSupabaseConfigured = hasSupabaseConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(mockUser.email);
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [linkPageFilters, setLinkPageFilters] = useState<LinkPageFilters>({});
  const [linkPageFiltersKey, setLinkPageFiltersKey] = useState(0);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | undefined>();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSessionChecking, setIsSessionChecking] = useState(Boolean(supabase));
  const [linksError, setLinksError] = useState<string | null>(null);
  const [linksNotice, setLinksNotice] = useState<string | null>(null);
  const [isLinksLoading, setIsLinksLoading] = useState(false);
  const [isLinkSaving, setIsLinkSaving] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      const email = user?.email;
      setIsAuthenticated(Boolean(user));
      setUserId(user?.id ?? null);
      setUserEmail(email ?? mockUser.email);
      setIsSessionChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      const email = user?.email;
      setIsAuthenticated(Boolean(user));
      setUserId(user?.id ?? null);
      setUserEmail(email ?? mockUser.email);
      if (!email) {
        setCurrentPage("dashboard");
        setSelectedLink(null);
        setLinks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !userId) {
      return;
    }

    let isMounted = true;

    async function loadLinks() {
      setIsLinksLoading(true);
      setLinksError(null);

      try {
        const items = await listLinks(supabase!);
        if (isMounted) {
          setLinks(items);
        }
      } catch (error) {
        if (isMounted) {
          setLinksError(error instanceof Error ? error.message : "링크를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLinksLoading(false);
        }
      }
    }

    loadLinks();

    return () => {
      isMounted = false;
    };
  }, [supabase, userId]);

  async function handleLogin(email: string, password: string) {
    setAuthError(null);
    setAuthNotice(null);

    if (!supabase) {
      setAuthError("Supabase 설정을 먼저 완료해 주세요.");
      return;
    }

    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsAuthLoading(false);

    if (error) {
      setAuthError(getAuthErrorMessage(error.message));
    }
  }

  async function handleSignup(name: string, email: string, password: string) {
    setAuthError(null);
    setAuthNotice(null);

    if (!supabase) {
      setAuthError("Supabase 설정을 먼저 완료해 주세요.");
      return;
    }

    setIsAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    setIsAuthLoading(false);

    if (error) {
      setAuthError(getAuthErrorMessage(error.message));
      return;
    }

    if (!data.session) {
      setAuthNotice("가입 확인 메일을 보냈습니다. 이메일 인증 후 로그인해 주세요.");
    }
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(mockUser.email);
    setCurrentPage("dashboard");
    setSelectedLink(null);
    setLinks([]);
  }

  function handleAddLink() {
    setEditingLink(undefined);
    setIsFormOpen(true);
  }

  function handleEditLink(link: LinkItem) {
    setEditingLink(link);
    setIsFormOpen(true);
  }

  async function handleSaveLink(draft: LinkDraft, editingId?: string) {
    if (!supabase || !userId) {
      setLinksError("로그인 후 링크를 저장할 수 있습니다.");
      return;
    }

    setIsLinkSaving(true);
    setLinksError(null);
    setLinksNotice(null);

    try {
      if (editingId) {
        const updatedLink = await updateLink(supabase, editingId, draft);
        setLinks((current) =>
          current.map((link) => (link.id === editingId ? updatedLink : link)),
        );
        setSelectedLink((current) =>
          current?.id === editingId ? updatedLink : current,
        );
        setLinksNotice(getLinkSuccessMessage("update"));
      } else {
        const createdLink = await createLink(supabase, draft, userId);
        setLinks((current) => [createdLink, ...current]);
        setLinksNotice(getLinkSuccessMessage("create"));
      }

      setIsFormOpen(false);
      setEditingLink(undefined);
    } catch (error) {
      setLinksError(
        error instanceof Error
          ? error.message
          : getLinkMutationErrorMessage(),
      );
    } finally {
      setIsLinkSaving(false);
    }
  }

  async function handleDeleteLink(id: string) {
    if (!supabase) {
      setLinksError("로그인 후 링크를 삭제할 수 있습니다.");
      return;
    }

    const previousLinks = links;
    setLinksError(null);
    setLinksNotice(null);
    setLinks((current) => current.filter((link) => link.id !== id));
    setSelectedLink((current) => (current?.id === id ? null : current));

    try {
      await deleteLink(supabase, id);
      setLinksNotice(getLinkSuccessMessage("delete"));
    } catch (error) {
      setLinks(previousLinks);
      setLinksError(
        error instanceof Error
          ? error.message
          : "링크 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }

  async function handleToggleFavorite(id: string) {
    const target = links.find((link) => link.id === id);

    if (!supabase || !target) {
      return;
    }

    const nextDraft: LinkDraft = {
      title: target.title,
      url: target.url,
      description: target.description,
      category: target.category,
      tags: target.tags,
      priority: target.priority,
      status: target.status,
      is_favorite: !target.is_favorite,
    };

    setLinksError(null);
    setLinksNotice(null);

    try {
      const updatedLink = await updateLink(supabase, id, nextDraft);

      setLinks((current) =>
        current.map((link) => (link.id === id ? updatedLink : link)),
      );
      setSelectedLink((current) => (current?.id === id ? updatedLink : current));
      setLinksNotice(getLinkSuccessMessage("favorite"));
    } catch (error) {
      setLinksError(
        error instanceof Error
          ? error.message
          : getLinkMutationErrorMessage(),
      );
    }
  }

  function handleViewLink(link: LinkItem) {
    setSelectedLink(link);
    setCurrentPage("detail");
  }

  function handleNavigate(page: AppPage) {
    setCurrentPage(page);
    if (page !== "detail") {
      setSelectedLink(null);
    }

    if (page === "links") {
      setLinkPageFilters({});
      setLinkPageFiltersKey((current) => current + 1);
    }
  }

  function handleOpenFilteredLinks(filters: LinkPageFilters = {}) {
    setLinkPageFilters(filters);
    setLinkPageFiltersKey((current) => current + 1);
    setSelectedLink(null);
    setCurrentPage("links");
  }

  function handleOpenFavorites() {
    setLinkPageFilters({ favoritesOnly: true });
    setLinkPageFiltersKey((current) => current + 1);
    setSelectedLink(null);
    setCurrentPage("favorites");
  }

  if (!hasHydrated || isSessionChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm text-muted-foreground">로그인 상태를 확인하는 중...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        authError={authError}
        authNotice={authNotice}
        isConfigured={isSupabaseConfigured}
        isLoading={isAuthLoading}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  const favoriteLinks = links.filter((link) => link.is_favorite);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
      <AppSidebar
        currentPage={currentPage}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        userEmail={userEmail}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6 md:p-8">
          {currentPage === "dashboard" && (
            <>
              {linksError && <PageError message={linksError} />}
              {linksNotice && <PageNotice message={linksNotice} />}
              {isLinksLoading ? (
                <PageLoading />
              ) : (
                <DashboardPage
                  links={links}
                  onDeleteLink={handleDeleteLink}
                  onEditLink={handleEditLink}
                  onOpenFavorites={handleOpenFavorites}
                  onOpenFilteredLinks={handleOpenFilteredLinks}
                  onToggleFavorite={handleToggleFavorite}
                  onViewLink={handleViewLink}
                />
              )}
            </>
          )}

          {currentPage === "links" && (
            <>
              {linksError && <PageError message={linksError} />}
              {linksNotice && <PageNotice message={linksNotice} />}
              {isLinksLoading ? (
                <PageLoading />
              ) : (
                <LinksPage
                  key={`links-${linkPageFiltersKey}`}
                  links={links}
                  initialFilters={linkPageFilters}
                  onAddLink={handleAddLink}
                  onDeleteLink={handleDeleteLink}
                  onEditLink={handleEditLink}
                  onToggleFavorite={handleToggleFavorite}
                  onViewLink={handleViewLink}
                />
              )}
            </>
          )}

          {currentPage === "favorites" && (
            <>
              {linksError && <PageError message={linksError} />}
              {linksNotice && <PageNotice message={linksNotice} />}
              {isLinksLoading ? (
                <PageLoading />
              ) : (
                <LinksPage
                  key={`favorites-${linkPageFiltersKey}`}
                  links={favoriteLinks}
                  initialFilters={linkPageFilters}
                  onAddLink={handleAddLink}
                  onDeleteLink={handleDeleteLink}
                  onEditLink={handleEditLink}
                  onToggleFavorite={handleToggleFavorite}
                  onViewLink={handleViewLink}
                  title="즐겨찾기"
                />
              )}
            </>
          )}

          {currentPage === "detail" && selectedLink && (
            <LinkDetailPage
              link={selectedLink}
              onBack={() => handleNavigate("links")}
              onDelete={handleDeleteLink}
              onEdit={handleEditLink}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>
      </main>

      <Dialog
        onClose={() => setIsFormOpen(false)}
        open={isFormOpen}
        title={editingLink ? "링크 수정" : "새 링크 추가"}
      >
        <LinkForm
          existingLinks={links}
          link={editingLink}
          onCancel={() => setIsFormOpen(false)}
          isSaving={isLinkSaving}
          onSave={handleSaveLink}
        />
      </Dialog>
    </div>
  );
}

function PageError({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function PageNotice({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
      {message}
    </div>
  );
}

function PageLoading() {
  return (
    <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-muted-foreground">
      링크를 불러오는 중...
    </div>
  );
}
