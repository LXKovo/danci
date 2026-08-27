export type BookStatus = "active" | "draft" | "disabled";

export interface Book {
  id: string;
  title: string;
  wordCount: number;
  coverUrl: string | null;
  bookId: string;
  tags: string | null;
  status: BookStatus;
  stage: "小学" | "初中" | "高中";
  createdAt: string;
  updatedAt: string;
}

export interface BookFormData {
  title: string;
  wordCount: number;
  coverUrl: string;
  bookId: string;
  tags: string;
  status: BookStatus;
  stage: "小学" | "初中" | "高中";
}

export const STAGES = ["小学", "初中", "高中"] as const;

export const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "active", label: "启用中" },
  { value: "draft", label: "草稿" },
  { value: "disabled", label: "停用" },
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
