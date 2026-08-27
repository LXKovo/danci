"use client";

import { useEffect, useState } from "react";
import { BookOpenText } from "lucide-react";

import type { Book, BookFormData, BookStatus } from "@/lib/books";
import { STAGES } from "@/lib/books";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Book | null;
  onSave: (data: BookFormData) => Promise<void>;
}

export function BookDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: BookDialogProps) {
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<"小学" | "初中" | "高中">("小学");
  const [wordCount, setWordCount] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [bookId, setBookId] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<BookStatus>("active");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setStage(initial?.stage ?? "小学");
      setWordCount(initial ? String(initial.wordCount) : "");
      setCoverUrl(initial?.coverUrl ?? "");
      setBookId(initial?.bookId ?? "");
      setTags(initial?.tags ?? "");
      setStatus(initial?.status ?? "active");
      setError(null);
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = Number(wordCount);

    if (!title.trim()) return setError("请输入书名");
    if (!bookId.trim()) return setError("请输入 bookId");
    if (!Number.isInteger(count) || count <= 0) return setError("词数需为大于 0 的整数");

    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        wordCount: count,
        coverUrl: coverUrl.trim(),
        bookId: bookId.trim(),
        tags: tags.trim(),
        status,
        stage,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpenText className="size-4 text-primary" />
            {initial ? "编辑单词书" : "新建单词书"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "修改这本书的元信息。"
              : "填写书名与基本信息以创建一本单词书。"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="book-title">书名</Label>
            <Input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：人教版 PEP 小学英语三年级上册"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="book-bookId">bookId</Label>
              <Input
                id="book-bookId"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                placeholder="例如：PEPXiaoXue3_1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-count">单词数量</Label>
              <Input
                id="book-count"
                type="number"
                min={1}
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
                placeholder="词汇数量"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="book-cover">封面 URL</Label>
            <Input
              id="book-cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg（可选）"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>学段</Label>
              <Select
                value={stage}
                onValueChange={(v) => setStage(v as "小学" | "初中" | "高中")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择学段" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>状态</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as BookStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用中</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="disabled">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="book-tags">标签（逗号分隔）</Label>
            <Input
              id="book-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如：小学, PEP, 三年级"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "保存中…" : initial ? "保存修改" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}