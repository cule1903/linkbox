"use client";

import { useState } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AppPage, AppSidebar } from "@/components/layout/app-sidebar";
import { LinkDetailPage } from "@/components/links/link-detail-page";
import { LinkForm } from "@/components/links/link-form";
import { LinksPage } from "@/components/links/links-page";
import { Dialog } from "@/components/ui/dialog";
import { mockLinks, mockUser } from "@/lib/mock-links";
import type { LinkDraft, LinkItem } from "@/types/link";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(mockUser.email);
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");
  const [links, setLinks] = useState<LinkItem[]>(mockLinks);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | undefined>();

  function handleLogin(email: string) {
    setUserEmail(email);
    setIsAuthenticated(true);
    setCurrentPage("dashboard");
  }

  function handleLogout() {
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

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
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
