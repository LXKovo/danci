export type BookStatus = "active" | "draft" | "disabled";

export interface Book {
  id: string;
  title: string;
  stage: "小学" | "初中" | "高中";
  wordCount: number;
  status: BookStatus;
  updatedAt: string;
}

export const STAGES = ["小学", "初中", "高中"] as const;

export const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: "active", label: "启用中" },
  { value: "draft", label: "草稿" },
  { value: "disabled", label: "停用" },
];

export function seedBooks(): Book[] {
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();
  return [
    {
      id: "bk-1001",
      title: "人教版 PEP 小学英语三年级上册",
      stage: "小学",
      wordCount: 186,
      status: "active",
      updatedAt: daysAgo(1),
    },
    {
      id: "bk-1002",
      title: "义务教育英语课程标准核心词汇",
      stage: "小学",
      wordCount: 812,
      status: "active",
      updatedAt: daysAgo(2),
    },
    {
      id: "bk-1003",
      title: "中考高频词汇速记",
      stage: "初中",
      wordCount: 1600,
      status: "active",
      updatedAt: daysAgo(4),
    },
    {
      id: "bk-1004",
      title: "新高考英语 3500 词",
      stage: "高中",
      wordCount: 3500,
      status: "draft",
      updatedAt: daysAgo(6),
    },
    {
      id: "bk-1005",
      title: "人教版 PEP 小学英语四年级下册",
      stage: "小学",
      wordCount: 195,
      status: "disabled",
      updatedAt: daysAgo(12),
    },
  ];
}

export const BOOKS_KEY = "danci:books";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}