import { BookOpenText, GraduationCap, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full lg:grid lg:grid-cols-[minmax(0,42fr)_minmax(0,58fr)]">
      {/* 品牌面板 */}
      <aside className="relative hidden overflow-hidden bg-sidebar lg:flex">
        <div
          className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--sidebar-primary) 32%, transparent), transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-48 -left-24 size-[26rem] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, color-mix(in oklab, var(--accent) 50%, transparent), transparent 65%)",
          }}
        />

        <div className="relative flex w-full flex-col justify-between p-12">
          <Brand variant="dark" />

          <div className="max-w-md">
            <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-1 text-xs text-sidebar-accent-foreground">
              <Sparkles className="size-3.5" />
              单词 · 词典 · 学习管理系统
            </p>
            <h1 className="font-heading text-5xl font-semibold leading-[1.15] tracking-tight text-sidebar-accent-foreground">
              记下每一个单词，
              <br />
              通往更远的世界。
            </h1>
            <p className="mt-6 text-base leading-relaxed text-sidebar-foreground/75">
              管理你的《单词书》，维护团队的每一位管理员。干净、专注，让知识有条不紊地沉淀。
            </p>

            <div className="mt-10 flex gap-3">
              {[
                { icon: BookOpenText, label: "单词书管理" },
                { icon: GraduationCap, label: "管理员管理" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3.5 py-2 text-sm text-sidebar-accent-foreground"
                >
                  <Icon className="size-4 text-sidebar-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-sidebar-foreground/50">
            © 2026 词海 Lexicon · 面向教育一线的词汇系统
          </p>
        </div>
      </aside>

      {/* 表单区 */}
      <main className="flex min-h-dvh flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mb-10 lg:hidden">
          <Brand variant="light" />
        </div>
        {children}
      </main>
    </div>
  );
}