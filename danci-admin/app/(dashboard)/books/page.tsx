"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpenText, FilePenLine, ImageIcon, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import type { Book, BookFormData, BookStatus } from "@/lib/books";
import { formatDate, STAGES } from "@/lib/books";
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

// 兜底解析错误响应：优先拿 { error }，失败则读取纯文本或使用 HTTP 状态
async function parseError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (data?.error) return data.error as string;
  } catch {
    // 继续尝试 text
  }
  try {
    const text = (await res.text()).trim();
    if (text) return text.slice(0, 200);
  } catch {
    // 无视
  }
  return `${fallback}（${res.status}）`;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books ?? []);
      } else {
        const message = await parseError(res, "获取单词书列表失败");
        setErrorMessage(message);
        setBooks([]);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "网络异常，无法加载数据");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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

  async function handleSave(data: BookFormData) {
    if (editing) {
      const res = await fetch(`/api/books/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const message = await parseError(res, "保存失败");
        throw new Error(message);
      }
    } else {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const message = await parseError(res, "创建失败");
        throw new Error(message);
      }
    }
    await fetchBooks();
  }

  async function handleDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/books/${deleting.id}`, { method: "DELETE" });
    if (!res.ok) {
      const message = await parseError(res, "删除失败");
      alert(message);
    }
    setDeleting(null);
    await fetchBooks();
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

      {/* 错误提示条 */}
      {errorMessage && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">加载单词书失败</p>
              <p className="text-sm text-destructive/90">{errorMessage}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={fetchBooks}>
            <RefreshCw className="size-3.5" />
            重新加载
          </Button>
        </div>
      )}

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

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            加载中…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">封面</TableHead>
                <TableHead>单词书</TableHead>
                <TableHead className="hidden sm:table-cell">bookId</TableHead>
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
                    <TableCell>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="size-10 rounded-md border object-cover"
                        />
                      ) : (
                        <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <ImageIcon className="size-4" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[14rem]">
                      <p className="truncate font-medium">{book.title}</p>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                      {book.bookId}
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
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {loading ? "加载中…" : "没有找到匹配的单词书"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
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
        onConfirm={handleDelete}
      />
    </div>
  );
}