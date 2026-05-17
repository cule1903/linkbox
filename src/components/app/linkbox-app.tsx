"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AuthPage } from "@/components/auth/auth-page";
import { CategoriesPage } from "@/components/categories/categories-page";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AppPage, AppSidebar } from "@/components/layout/app-sidebar";
import { LinkDetailPage } from "@/components/links/link-detail-page";
import { LinkForm } from "@/components/links/link-form";
import { LinkPageFilters, LinksPage } from "@/components/links/links-page";
import { Dialog } from "@/components/ui/dialog";
import {
  createCategory,
  defaultCategoryNames,
  deleteCategory,
  getCategoryMutationErrorMessage,
  getCategoryOptionNames,
  listCategories,
  updateCategory,
} from "@/lib/categories";
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
import { buildLinksHref, getCurrentPageFromRoute, type AppRoute } from "@/lib/routes";
import { mockUser } from "@/lib/mock-links";
import type { CategoryItem } from "@/types/category";
import type { LinkDraft, LinkItem } from "@/types/link";

const subscribeToHydration = () => () => {};

type LinkBoxAppProps = {
  detailLinkId?: string;
  initialFilters?: LinkPageFilters;
  route: AppRoute;
};

const pageHrefs: Record<AppPage, string> = {
  dashboard: "/dashboard",
  links: "/links",
  favorites: "/favorites",
  categories: "/categories",
};

export function LinkBoxApp({
  detailLinkId,
  initialFilters = {},
  route,
}: LinkBoxAppProps) {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const isSupabaseConfigured = hasSupabaseConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(mockUser.email);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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
  const [isCategorySaving, setIsCategorySaving] = useState(false);

  const currentPage = getCurrentPageFromRoute(route);
  const selectedLink = detailLinkId
    ? links.find((link) => link.id === detailLinkId) ?? null
    : null;
  const favoriteLinks = links.filter((link) => link.is_favorite);
  const categoryOptions = useMemo(() => {
    const savedCategoryNames = getCategoryOptionNames(categories);
    const linkCategoryNames = links
      .map((link) => link.category?.trim())
      .filter((category): category is string => Boolean(category));

    return Array.from(new Set([...savedCategoryNames, ...linkCategoryNames]));
  }, [categories, links]);
  const categoryLinkCounts = useMemo(
    () =>
      links.reduce<Record<string, number>>((acc, link) => {
        if (link.category) {
          acc[link.category] = (acc[link.category] ?? 0) + 1;
        }

        return acc;
      }, {}),
    [links],
  );

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
        setLinks([]);
        setCategories([]);
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  useEffect(() => {
    if (!supabase || !userId) {
      return;
    }

    let isMounted = true;
    const currentUserId = userId;

    async function loadWorkspaceData() {
      setIsLinksLoading(true);
      setLinksError(null);

      try {
        const [linkItems, savedCategoryItems] = await Promise.all([
          listLinks(supabase!),
          listCategories(supabase!),
        ]);
        const categoryItems =
          savedCategoryItems.length > 0
            ? savedCategoryItems
            : await Promise.all(
                defaultCategoryNames.map((name) =>
                  createCategory(supabase!, name, currentUserId),
                ),
              );

        if (isMounted) {
          setLinks(linkItems);
          setCategories(categoryItems);
        }
      } catch (error) {
        if (isMounted) {
          setLinksError(
            error instanceof Error
              ? error.message
              : "데이터를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLinksLoading(false);
        }
      }
    }

    loadWorkspaceData();

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
    setLinks([]);
    setCategories([]);
    router.replace("/dashboard");
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
      setLinksNotice(getLinkSuccessMessage("favorite"));
    } catch (error) {
      setLinksError(
        error instanceof Error
          ? error.message
          : getLinkMutationErrorMessage(),
      );
    }
  }

  async function handleCreateCategory(name: string) {
    if (!supabase || !userId) {
      setLinksError("로그인 후 카테고리를 저장할 수 있습니다.");
      return;
    }

    setIsCategorySaving(true);
    setLinksError(null);
    setLinksNotice(null);

    try {
      const category = await createCategory(supabase, name, userId);
      setCategories((current) => [...current, category].sort(sortCategories));
      setLinksNotice("카테고리를 추가했습니다.");
    } catch (error) {
      setLinksError(
        error instanceof Error
          ? error.message
          : getCategoryMutationErrorMessage(),
      );
    } finally {
      setIsCategorySaving(false);
    }
  }

  async function handleRenameCategory(category: CategoryItem, name: string) {
    if (!supabase) {
      setLinksError("로그인 후 카테고리를 수정할 수 있습니다.");
      return;
    }

    const previousCategories = categories;
    const previousLinks = links;
    setIsCategorySaving(true);
    setLinksError(null);
    setLinksNotice(null);

    try {
      const updatedCategory = await updateCategory(supabase, category.id, name);
      const renamedLinks = links.filter((link) => link.category === category.name);

      await Promise.all(
        renamedLinks.map((link) =>
          updateLink(supabase, link.id, {
            title: link.title,
            url: link.url,
            description: link.description,
            category: updatedCategory.name,
            tags: link.tags,
            priority: link.priority,
            status: link.status,
            is_favorite: link.is_favorite,
          }),
        ),
      );

      setCategories((current) =>
        current
          .map((item) => (item.id === category.id ? updatedCategory : item))
          .sort(sortCategories),
      );
      setLinks((current) =>
        current.map((link) =>
          link.category === category.name
            ? { ...link, category: updatedCategory.name }
            : link,
        ),
      );
      setLinksNotice("카테고리 이름을 수정했습니다.");
    } catch (error) {
      setCategories(previousCategories);
      setLinks(previousLinks);
      setLinksError(
        error instanceof Error
          ? error.message
          : getCategoryMutationErrorMessage(),
      );
    } finally {
      setIsCategorySaving(false);
    }
  }

  async function handleDeleteCategory(category: CategoryItem) {
    if (!supabase) {
      setLinksError("로그인 후 카테고리를 삭제할 수 있습니다.");
      return;
    }

    if ((categoryLinkCounts[category.name] ?? 0) > 0) {
      setLinksError("연결된 링크가 있는 카테고리는 삭제할 수 없습니다.");
      return;
    }

    const previousCategories = categories;
    setIsCategorySaving(true);
    setLinksError(null);
    setLinksNotice(null);
    setCategories((current) => current.filter((item) => item.id !== category.id));

    try {
      await deleteCategory(supabase, category.id);
      setLinksNotice("카테고리를 삭제했습니다.");
    } catch (error) {
      setCategories(previousCategories);
      setLinksError(
        error instanceof Error
          ? error.message
          : "카테고리 삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsCategorySaving(false);
    }
  }

  function handleNavigate(page: AppPage) {
    router.push(pageHrefs[page]);
  }

  function handleOpenFilteredLinks(filters: LinkPageFilters = {}) {
    router.push(buildLinksHref(filters));
  }

  function handleOpenFavorites() {
    router.push("/favorites");
  }

  function handleViewLink(link: LinkItem) {
    router.push(`/links/${link.id}`);
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
          {linksError && <PageError message={linksError} />}
          {linksNotice && <PageNotice message={linksNotice} />}

          {isLinksLoading ? (
            <PageLoading />
          ) : (
            <>
              {route === "dashboard" && (
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

              {route === "links" && (
                <LinksPage
                  key={`links-${JSON.stringify(initialFilters)}`}
                  categories={categoryOptions}
                  links={links}
                  initialFilters={initialFilters}
                  onAddLink={handleAddLink}
                  onDeleteLink={handleDeleteLink}
                  onEditLink={handleEditLink}
                  onToggleFavorite={handleToggleFavorite}
                  onViewLink={handleViewLink}
                />
              )}

              {route === "favorites" && (
                <LinksPage
                  key="favorites"
                  categories={categoryOptions}
                  links={favoriteLinks}
                  initialFilters={{ favoritesOnly: true }}
                  onAddLink={handleAddLink}
                  onDeleteLink={handleDeleteLink}
                  onEditLink={handleEditLink}
                  onToggleFavorite={handleToggleFavorite}
                  onViewLink={handleViewLink}
                  title="즐겨찾기"
                />
              )}

              {route === "categories" && (
                <CategoriesPage
                  categories={categories}
                  isSaving={isCategorySaving}
                  linkCounts={categoryLinkCounts}
                  onCreateCategory={handleCreateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onRenameCategory={handleRenameCategory}
                />
              )}

              {route === "detail" &&
                (selectedLink ? (
                  <LinkDetailPage
                    link={selectedLink}
                    onBack={() => router.back()}
                    onDelete={handleDeleteLink}
                    onEdit={handleEditLink}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ) : (
                  <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-muted-foreground">
                    링크를 찾을 수 없습니다.
                  </div>
                ))}
            </>
          )}
        </div>
      </main>

      <Dialog
        onClose={() => setIsFormOpen(false)}
        open={isFormOpen}
        title={editingLink ? "링크 수정" : "새 링크 추가"}
      >
        <LinkForm
          categories={categoryOptions}
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

function sortCategories(a: CategoryItem, b: CategoryItem) {
  return a.name.localeCompare(b.name, "ko-KR");
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
      데이터를 불러오는 중...
    </div>
  );
}
