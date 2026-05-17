"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AppPage, AppSidebar } from "@/components/layout/app-sidebar";
import { LinkDetailPage } from "@/components/links/link-detail-page";
import { LinkForm } from "@/components/links/link-form";
import { LinksPage } from "@/components/links/links-page";
import { Dialog } from "@/components/ui/dialog";
import {
  getAuthErrorMessage,
  getSupabaseBrowserClient,
  hasSupabaseConfig,
} from "@/lib/auth";
import { mockLinks, mockUser } from "@/lib/mock-links";
import type { LinkDraft, LinkItem } from "@/types/link";

export default function Home() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const isSupabaseConfigured = hasSupabaseConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(mockUser.email);
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [links, setLinks] = useState<LinkItem[]>(mockLinks);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | undefined>();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSessionChecking, setIsSessionChecking] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email;
      setIsAuthenticated(Boolean(email));
      setUserEmail(email ?? mockUser.email);
      setIsSessionChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email;
      setIsAuthenticated(Boolean(email));
      setUserEmail(email ?? mockUser.email);
      if (!email) {
        setCurrentPage("dashboard");
        setSelectedLink(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
    setUserEmail(mockUser.email);
    setCurrentPage("dashboard");
    setSelectedLink(null);
  }

  function handleAddLink() {
    setEditingLink(undefined);
    setIsFormOpen(true);
  }

  function handleEditLink(link: LinkItem) {
    setEditingLink(link);
    setIsFormOpen(true);
  }

  function handleSaveLink(draft: LinkDraft, editingId?: string) {
    const now = new Date().toISOString();

    if (editingId) {
      setLinks((current) =>
        current.map((link) =>
          link.id === editingId
            ? {
                ...link,
                ...draft,
                updated_at: now,
              }
            : link,
        ),
      );
      setSelectedLink((current) =>
        current?.id === editingId
          ? {
              ...current,
              ...draft,
              updated_at: now,
            }
          : current,
      );
    } else {
      setLinks((current) => [
        {
          ...draft,
          id: crypto.randomUUID(),
          user_id: "mock-user",
          created_at: now,
          updated_at: now,
        },
        ...current,
      ]);
    }

    setIsFormOpen(false);
    setEditingLink(undefined);
  }

  function handleDeleteLink(id: string) {
    setLinks((current) => current.filter((link) => link.id !== id));
    setSelectedLink((current) => (current?.id === id ? null : current));
  }

  function handleToggleFavorite(id: string) {
    setLinks((current) =>
      current.map((link) =>
        link.id === id
          ? { ...link, is_favorite: !link.is_favorite }
          : link,
      ),
    );
    setSelectedLink((current) =>
      current?.id === id
        ? { ...current, is_favorite: !current.is_favorite }
        : current,
    );
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
  }

  if (isSessionChecking) {
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
            <DashboardPage
              links={links}
              onDeleteLink={handleDeleteLink}
              onEditLink={handleEditLink}
              onToggleFavorite={handleToggleFavorite}
              onViewLink={handleViewLink}
            />
          )}

          {currentPage === "links" && (
            <LinksPage
              links={links}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onEditLink={handleEditLink}
              onToggleFavorite={handleToggleFavorite}
              onViewLink={handleViewLink}
            />
          )}

          {currentPage === "favorites" && (
            <LinksPage
              links={favoriteLinks}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onEditLink={handleEditLink}
              onToggleFavorite={handleToggleFavorite}
              onViewLink={handleViewLink}
              title="즐겨찾기"
            />
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
          onSave={handleSaveLink}
        />
      </Dialog>
    </div>
  );
}
