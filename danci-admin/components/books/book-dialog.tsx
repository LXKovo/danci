"use client";

import { useEffect, useState } from "react";
import { BookOpenText } from "lucide-react";

import type { Book, BookStatus } from "@/lib/books";
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
  onSave: (data: {
    title: string;
    stage: Book["stage"];
    wordCount: number;
    status: BookStatus;
  }) => void;
}

export function BookDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: BookDialogProps) {
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<Book["stage"]>("小学");
  const [wordCount, setWordCount] = useState("");
  const [status, setStatus] = useState<BookStatus>("active");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setStage(initial?.stage ?? "小学");
      setWordCount(initial ? String(initial.wordCount) : "");
      setStatus(initial?.status ?? "active");
      setError(null);
    }
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const count = Number(wordCount);
    if (!title.trim()) return setError("请输入书名");
    if (!Number.isInteger(count) || count <= 0)
      return setError("词数需为大于 0 的整数");
    onSave({ title: title.trim(), stage, wordCount: count, status });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
              <Label>学段</Label>
              <Select
                value={stage}
                onValueChange={(v) => setStage(v as Book["stage"])}
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
            <Label htmlFor="book-count">词数</Label>
            <Input
              id="book-count"
              type="number"
              min={1}
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              placeholder="词汇数量"
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
            >
              取消
            </Button>
            <Button type="submit">{initial ? "保存修改" : "创建"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
