"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { hasDuplicateUrl } from "@/lib/link-utils";
import { mockCategories } from "@/lib/mock-links";
import type { LinkDraft, LinkItem, LinkPriority, LinkStatus } from "@/types/link";

type LinkFormProps = {
  existingLinks: LinkItem[];
  link?: LinkItem;
  onCancel: () => void;
  onSave: (draft: LinkDraft, editingId?: string) => void;
};

export function LinkForm({
  existingLinks,
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
    if (event.key !== "Enter" || !tagInput.trim()) {
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
        <span className="text-sm font-medium">Title *</span>
        <Input
          onChange={(event) =>
            setFormData({ ...formData, title: event.target.value })
          }
          placeholder="Enter link title"
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
            This URL is already saved in your LinkBox.
          </span>
        )}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Memo</span>
        <Textarea
          onChange={(event) =>
            setFormData({ ...formData, description: event.target.value })
          }
          placeholder="Add a short note about this link"
          rows={3}
          value={formData.description ?? ""}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Category</span>
          <Select
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value })
            }
            value={formData.category ?? ""}
          >
            <option value="">Select category</option>
            {mockCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Reading Status</span>
          <Select
            onChange={(event) =>
              setFormData({
                ...formData,
                status: event.target.value as LinkStatus,
              })
            }
            value={formData.status}
          >
            <option value="unread">To Read</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </Select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Priority</span>
        <Select
          onChange={(event) =>
            setFormData({
              ...formData,
              priority: event.target.value as LinkPriority,
            })
          }
          value={formData.priority}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </label>

      <div className="space-y-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Tags</span>
          <Input
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type and press Enter to add tags"
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
        <span className="text-sm font-medium">Mark as favorite</span>
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
        <Button className="flex-1" disabled={duplicateUrl} type="submit">
          {link ? "Update Link" : "Save Link"}
        </Button>
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
