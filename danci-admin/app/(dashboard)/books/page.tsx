"use client";

import { useMemo, useState } from "react";
import { BookOpenText, FilePenLine, Pencil, Plus, Search, Trash2 } from "lucide-react";

import type { Book, BookStatus } from "@/lib/books";
import { BOOKS_KEY, formatDate, seedBooks, STAGES } from "@/lib/books";
import { usePersistedState } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookDialog } from "@/components/books/book-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";

const statusTone: Record<BookStatus, { label: string; className: string }> = {
  active: { label: "启用中", className: "bg-primary/10 text-primary" },
  draft: { label: "草稿", className: "bg-secondary text-secondary-foreground" },
  disabled: { label: "停用", className: "bg-muted text-muted-foreground" },
};

export default function BooksPage() {
  const [books, setBooks] = usePersistedState<Book[]>(BOOKS_KEY, seedBooks);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  const stats = useMemo(
    () => ({
      total: books.length,
      words: books.reduce((s, b) => s + b.wordCount, 0),
      active: books.filter((b) => b.status === "active").length,
      draft: books.filter((b) => b.status === "draft").length,
    }),
    [books]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books
      .filter((b) => stageFilter === "all" || b.stage === stageFilter)
      .filter((b) => !q || b.title.toLowerCase().includes(q))
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [books, query, stageFilter]);

  function handleSave(data: { title: string; stage: Book["stage"]; wordCount: number; status: BookStatus }) {
    const now = new Date().toISOString();
    if (editing) {
      setBooks((prev) =>
        prev.map((b) => (b.id === editing.id ? { ...b, ...data, updatedAt: now } : b))
      );
    } else {
      setBooks((prev) => [
        { id: `bk-${Date.now()}`, ...data, updatedAt: now },
        ...prev,
      ]);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 页头 */}
      <header className="mb-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <BookOpenText className="size-3.5" />
          词库管理
        </span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              单词书管理
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              维护系统中所有的单词书，支持创建、编辑与删除。
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            新建单词书
          </Button>
        </div>
      </header>

      {/* 统计 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "单词书", value: stats.total, icon: BookOpenText },
          { label: "词汇总量", value: stats.words.toLocaleString(), icon: FilePenLine },
          { label: "启用中", value: stats.active, icon: null },
          { label: "草稿", value: stats.draft, icon: null },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3 p-4">
            {Icon && (
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4.5" />
              </span>
            )}
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-heading text-xl font-semibold">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* 工具栏 + 表格 */}
      <Card className="overflow-visible p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索书名…"
              className="pl-8"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="全部学段" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部学段</SelectItem>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>单词书</TableHead>
              <TableHead className="hidden sm:table-cell">学段</TableHead>
              <TableHead>词数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="hidden md:table-cell">更新于</TableHead>
              <TableHead className="w-20 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((book) => {
              const tone = statusTone[book.status];
              return (
                <TableRow key={book.id}>
                  <TableCell className="max-w-[16rem]">
                    <p className="truncate font-medium">{book.title}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {book.stage}
                  </TableCell>
                  <TableCell className="tabular-nums">{book.wordCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-medium", tone.className)} variant="outline">
                      <span className="size-1.5 rounded-full bg-current" />
                      {tone.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(book.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="编辑"
                        onClick={() => {
                          setEditing(book);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="删除"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleting(book)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  没有找到匹配的单词书
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <BookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={handleSave}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => {
          if (!o) setDeleting(null);
        }}
        title="删除单词书"
        description={`确定要删除「${deleting?.title ?? ""}」吗？该操作无法撤销。`}
        onConfirm={() => {
          if (deleting) setBooks((prev) => prev.filter((b) => b.id !== deleting.id));
        }}
      />
    </div>
  );
}