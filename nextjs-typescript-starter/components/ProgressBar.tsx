export default function ProgressBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-sun transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-bold text-ink/55">
        {pct}%
      </span>
    </div>
  );
}