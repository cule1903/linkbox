"use client";

import { FormEvent, useState } from "react";
import { Edit, FolderKanban, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CategoryItem } from "@/types/category";

type CategoriesPageProps = {
  categories: CategoryItem[];
  isSaving?: boolean;
  linkCounts: Record<string, number>;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (category: CategoryItem) => void;
  onRenameCategory: (category: CategoryItem, name: string) => void;
};

export function CategoriesPage({
  categories,
  isSaving = false,
  linkCounts,
  onCreateCategory,
  onDeleteCategory,
  onRenameCategory,
}: CategoriesPageProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = newName.trim();

    if (!nextName) {
      return;
    }

    onCreateCategory(nextName);
    setNewName("");
  }

  function startEditing(category: CategoryItem) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  function handleRename(category: CategoryItem) {
    const nextName = editingName.trim();

    if (!nextName || nextName === category.name) {
      cancelEditing();
      return;
    }

    onRenameCategory(category, nextName);
    cancelEditing();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold">카테고리 관리</h1>
        <p className="text-muted-foreground">
          링크를 분류하는 카테고리 목록을 추가하고 이름을 수정하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCreate}>
            <Input
              onChange={(event) => setNewName(event.target.value)}
              placeholder="예: 공식문서, 문제해결, 강의"
              value={newName}
            />
            <Button disabled={isSaving || !newName.trim()} type="submit">
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>카테고리 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm text-muted-foreground">
                아직 저장된 카테고리가 없습니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((category) => {
                const isEditing = editingId === category.id;

                return (
                  <div
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={category.id}
                  >
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <Input
                          autoFocus
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleRename(category);
                            }

                            if (event.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                          value={editingName}
                        />
                      ) : (
                        <>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            연결된 링크 {linkCounts[category.name] ?? 0}개
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            disabled={isSaving}
                            onClick={() => handleRename(category)}
                            size="sm"
                          >
                            저장
                          </Button>
                          <Button onClick={cancelEditing} size="icon" variant="ghost">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => startEditing(category)}
                            size="icon"
                            variant="ghost"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteCategory(category)}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
