import { desc, eq } from "drizzle-orm";

import { errorResponse } from "@/lib/api-response";
import { getCurrentAdmin, isSameOrigin, isSystemAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

export async function GET() {
  try {
    const current = await getCurrentAdmin();
    if (!current) return errorResponse("请先登录", 401);
    if (!isSystemAdmin(current)) return errorResponse("无权管理单词书", 403);

    const list = await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt))
      .$withCache(false);

    return Response.json({
      books: list.map((book) => ({ ...book, id: book.id.toString() })),
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "查询单词书失败",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return errorResponse("请求来源无效", 403);
    const current = await getCurrentAdmin();
    if (!current) return errorResponse("请先登录", 401);
    if (!isSystemAdmin(current)) return errorResponse("无权管理单词书", 403);

    const body = await request.json().catch(() => null);
    if (!body) return errorResponse("请求体无效", 400);

    if (!body.title?.trim()) return errorResponse("请输入书名", 400);
    if (!body.bookId?.trim()) return errorResponse("请输入 bookId", 400);
    if (typeof body.wordCount !== "number" || body.wordCount <= 0) {
      return errorResponse("词数需为大于 0 的整数", 400);
    }

    // 检查 bookId 是否重复
    const duplicate = await db
      .select({ id: books.id })
      .from(books)
      .where(eq(books.bookId, body.bookId.trim()))
      .limit(1)
      .$withCache(false);
    if (duplicate.length > 0) return errorResponse("该 bookId 已存在", 409);

    const [book] = await db
      .insert(books)
      .values({
        title: body.title.trim(),
        wordCount: body.wordCount,
        coverUrl: body.coverUrl?.trim() || null,
        bookId: body.bookId.trim(),
        tags: body.tags || null,
        status: body.status || "active",
        stage: body.stage || "小学",
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(
      { book: { ...book, id: book.id.toString() } },
      { status: 201 }
    );
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "创建单词书失败",
      500
    );
  }
}
