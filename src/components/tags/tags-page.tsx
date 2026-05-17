"use client";

import { FormEvent, useState } from "react";
import { Edit, Plus, Tag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { TagItem } from "@/types/tag";

type TagsPageProps = {
  isSaving?: boolean;
  linkCounts: Record<string, number>;
  onCreateTag: (name: string) => void;
  onDeleteTag: (tag: TagItem) => void;
  onOpenTagLinks: (tag: TagItem) => void;
  onRenameTag: (tag: TagItem, name: string) => void;
  tags: TagItem[];
};

export function TagsPage({
  isSaving = false,
  linkCounts,
  onCreateTag,
  onDeleteTag,
  onOpenTagLinks,
  onRenameTag,
  tags,
}: TagsPageProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = newName.trim();

    if (!nextName) {
      return;
    }

    onCreateTag(nextName);
    setNewName("");
  }

  function startEditing(tag: TagItem) {
    setEditingId(tag.id);
    setEditingName(tag.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  function handleRename(tag: TagItem) {
    const nextName = editingName.trim();

    if (!nextName || nextName === tag.name) {
      cancelEditing();
      return;
    }

    onRenameTag(tag, nextName);
    cancelEditing();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-semibold">태그 관리</h1>
        <p className="text-muted-foreground">
          링크에 붙이는 태그를 관리하고 태그별 사용 현황을 확인하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 태그</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCreate}>
            <Input
              onChange={(event) => setNewName(event.target.value)}
              placeholder="예: react, supabase, css"
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
          <CardTitle>태그 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm text-muted-foreground">
                아직 저장된 태그가 없습니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tags.map((tag) => {
                const isEditing = editingId === tag.id;

                return (
                  <div
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={tag.id}
                  >
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <Input
                          autoFocus
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleRename(tag);
                            }

                            if (event.key === "Escape") {
                              cancelEditing();
                            }
                          }}
                          value={editingName}
                        />
                      ) : (
                        <button
                          className="block rounded-md px-2 py-1 text-left transition-colors hover:bg-slate-50"
                          onClick={() => onOpenTagLinks(tag)}
                          type="button"
                        >
                          <p className="font-medium">#{tag.name}</p>
                          <p className="text-sm text-muted-foreground">
                            연결된 링크 {linkCounts[tag.name] ?? 0}개
                          </p>
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            disabled={isSaving}
                            onClick={() => handleRename(tag)}
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
                            onClick={() => startEditing(tag)}
                            size="icon"
                            variant="ghost"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteTag(tag)}
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
