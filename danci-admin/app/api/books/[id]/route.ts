import { eq } from "drizzle-orm";

import { errorResponse } from "@/lib/api-response";
import { getCurrentAdmin, isSameOrigin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { books, words } from "@/lib/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// 更新单词书
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
    const current = await getCurrentAdmin();
    if (!current) return errorResponse("请先登录", 401);
    if (!isSystemAdmin(current)) return errorResponse("无权管理单词书", 403);

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("请求体无效", 400);

    const { id } = await params;
    const numericId = BigInt(id);

    if (!body.title?.trim()) return errorResponse("请输入书名", 400);
    if (!body.bookId?.trim()) return errorResponse("请输入 bookId", 400);
    if (typeof body.wordCount !== "number" || body.wordCount <= 0) {
      return errorResponse("词数需为大于 0 的整数", 400);
    }

    // 先确认目标存在
    const [target] = await db
      .select({ id: books.id, bookId: books.bookId })
      .from(books)
      .where(eq(books.id, numericId))
      .limit(1)
      .$withCache(false);
    if (!target) return errorResponse("单词书不存在", 404);

    // 如果修改了 bookId，检查是否与其他冲突
    if (body.bookId.trim() !== target.bookId) {
      const duplicate = await db
        .select({ id: books.id })
        .from(books)
        .where(eq(books.bookId, body.bookId.trim()))
        .limit(1)
        .$withCache(false);
      if (duplicate.length > 0 && duplicate[0].id !== numericId) {
        return errorResponse("该 bookId 已存在", 409);
      }
    }

    const [updated] = await db
      .update(books)
      .set({
        title: body.title.trim(),
        wordCount: body.wordCount,
        coverUrl: body.coverUrl?.trim() || null,
        bookId: body.bookId.trim(),
        tags: body.tags || null,
        status: body.status || "active",
        stage: body.stage || "小学",
        updatedAt: new Date(),
      })
      .where(eq(books.id, numericId))
      .returning();

    return Response.json({
      book: { ...updated, id: updated.id.toString() },
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "更新单词书失败",
      500
    );
  }
}

// 删除单词书
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
    const current = await getCurrentAdmin();
    if (!current) return errorResponse("请先登录", 401);
    if (!isSystemAdmin(current)) return errorResponse("无权管理单词书", 403);

    const { id } = await params;
    const numericId = BigInt(id);

    const [target] = await db
      .select({ id: books.id, bookId: books.bookId })
      .from(books)
      .where(eq(books.id, numericId))
      .limit(1)
      .$withCache(false);
    if (!target) return errorResponse("单词书不存在", 404);

    await db.delete(words).where(eq(words.bookId, target.bookId));
    await db.delete(books).where(eq(books.id, numericId));

    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "删除单词书失败",
      500
    );
  }
}
