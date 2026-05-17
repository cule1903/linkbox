"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { hasDuplicateUrl } from "@/lib/link-utils";
import { shouldCommitTagInput } from "@/lib/links";
import { mockCategories } from "@/lib/mock-links";
import type { LinkDraft, LinkItem, LinkPriority, LinkStatus } from "@/types/link";

type LinkFormProps = {
  existingLinks: LinkItem[];
  isSaving?: boolean;
  link?: LinkItem;
  onCancel: () => void;
  onSave: (draft: LinkDraft, editingId?: string) => void;
};

export function LinkForm({
  existingLinks,
  isSaving = false,
  link,
  onCancel,
  onSave,
}: LinkFormProps) {
  const [formData, setFormData] = useState<LinkDraft>({
    title: link?.title || "",
    url: link?.url || "",
    description: link?.description || "",
    category: link?.category || "",
    tags: link?.tags || [],
    status: link?.status || "unread",
    priority: link?.priority || "medium",
    is_favorite: link?.is_favorite || false,
  });
  const [tagInput, setTagInput] = useState("");

  const duplicateUrl = useMemo(
    () => hasDuplicateUrl(existingLinks, formData.url, link?.id),
    [existingLinks, formData.url, link?.id],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (duplicateUrl) {
      return;
    }

    onSave(
      {
        ...formData,
        category: formData.category || null,
        description: formData.description || null,
        tags: formData.tags.map((tag) => tag.trim()).filter(Boolean),
      },
      link?.id,
    );
  }

  function handleAddTag(event: KeyboardEvent<HTMLInputElement>) {
    if (
      !shouldCommitTagInput({
        input: tagInput,
        isComposing: event.nativeEvent.isComposing,
        key: event.key,
      })
    ) {
      return;
    }

    event.preventDefault();
    const nextTag = tagInput.trim();

    if (!formData.tags.includes(nextTag)) {
      setFormData((current) => ({
        ...current,
        tags: [...current.tags, nextTag],
      }));
    }

    setTagInput("");
  }

  function handleRemoveTag(tagToRemove: string) {
    setFormData((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }));
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">제목 *</span>
        <Input
          onChange={(event) =>
            setFormData({ ...formData, title: event.target.value })
          }
          placeholder="링크 제목을 입력하세요"
          required
          value={formData.title}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">URL *</span>
        <Input
          onChange={(event) =>
            setFormData({ ...formData, url: event.target.value })
          }
          placeholder="https://example.com"
          required
          type="url"
          value={formData.url}
        />
        {duplicateUrl && (
          <span className="text-sm text-red-600">
            이미 저장된 URL입니다.
          </span>
        )}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">메모</span>
        <Textarea
          onChange={(event) =>
            setFormData({ ...formData, description: event.target.value })
          }
          placeholder="이 링크에 대한 짧은 메모를 남겨보세요"
          rows={3}
          value={formData.description ?? ""}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">카테고리</span>
          <Select
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
            value={formData.category ?? ""}
          >
            <option value="">카테고리 선택</option>
            {mockCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">읽기 상태</span>
          <Select
            onChange={(event) =>
              setFormData({
                ...formData,
                status: event.target.value as LinkStatus,
              })
            }
            value={formData.status}
          >
            <option value="unread">읽을 예정</option>
            <option value="reading">읽는 중</option>
            <option value="completed">완료</option>
          </Select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">우선순위</span>
        <Select
          onChange={(event) =>
            setFormData({
              ...formData,
              priority: event.target.value as LinkPriority,
            })
          }
          value={formData.priority}
        >
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </Select>
      </label>

      <div className="space-y-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">태그</span>
          <Input
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleAddTag}
            placeholder="태그를 입력하고 엔터를 누르세요"
            value={tagInput}
          />
        </label>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-sm"
                key={tag}
              >
                #{tag}
                <button
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => handleRemoveTag(tag)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
        <span className="text-sm font-medium">즐겨찾기로 표시</span>
        <input
          checked={formData.is_favorite}
          className="h-4 w-4"
          onChange={(event) =>
            setFormData({ ...formData, is_favorite: event.target.checked })
          }
          type="checkbox"
        />
      </label>

      <div className="flex gap-3 pt-4">
        <Button className="flex-1" disabled={duplicateUrl || isSaving} type="submit">
          {isSaving ? "저장 중..." : link ? "링크 수정" : "링크 저장"}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          취소
        </Button>
      </div>
    </form>
  );
}
