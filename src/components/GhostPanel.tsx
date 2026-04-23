export function GhostPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card ${className}`}>
      <div className="p-4 space-y-3">
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}

export function GhostTable({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card overflow-hidden ${className}`}>
      {/* Header row */}
      <div className="flex gap-4 p-3 border-b border-border bg-muted/30">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-muted" />
        ))}
      </div>
      {/* Data rows */}
      {[...Array(3)].map((_, row) => (
        <div key={row} className="flex gap-4 p-3 border-b border-border last:border-0">
          {[...Array(5)].map((_, col) => (
            <div
              key={col}
              className="h-3 flex-1 rounded bg-muted/50"
              style={{ width: col === 0 ? '20%' : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function GhostChart({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-4 ${className}`}>
      <div className="h-3 w-1/3 rounded bg-muted mb-4" />
      <div className="flex items-end gap-2 h-32">
        {[40, 65, 30, 80, 55, 70, 45, 90, 60, 35, 75, 50].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-primary/15"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* Cost line chart ghost - dashed lines with axis labels */
export function GhostCostChart({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      {/* Y-axis and chart area */}
      <div className="flex gap-3">
        <div className="flex flex-col justify-between text-[11px] text-muted-foreground py-1 w-8 text-right shrink-0">
          <span>200</span>
          <span>200</span>
          <span>0</span>
        </div>
        <div className="flex-1 flex flex-col justify-between py-1 relative" style={{ height: 120 }}>
          {/* Dashed grid lines */}
          {[0, 1, 2].map(i => (
            <div key={i} className="w-full border-t border-dashed border-border" />
          ))}
          {/* Fake line path - solid primary */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 120">
            <polyline
              points="0,90 50,88 100,85 150,80 200,82 250,78 300,75 350,72 400,70"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
            <polyline
              points="0,60 50,58 100,60 150,58 200,60 250,58 300,60 350,58 400,60"
              fill="none"
              stroke="hsl(var(--muted-foreground) / 0.3)"
              strokeWidth="1.5"
              strokeDasharray="6 3"
            />
            {/* Data points */}
            {[0, 100, 200, 350, 400].map(x => (
              <circle key={x} cx={x} cy={60} r="3" fill="hsl(var(--muted-foreground) / 0.2)" stroke="hsl(var(--card))" strokeWidth="1.5" />
            ))}
            {[0, 150, 400].map(x => (
              <circle key={x} cx={x} cy={x === 0 ? 90 : x === 150 ? 80 : 70} r="3" fill="hsl(var(--primary) / 0.4)" stroke="hsl(var(--card))" strokeWidth="1.5" />
            ))}
          </svg>
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 ml-11 text-[11px] text-muted-foreground">
        <span>Aug 01, 25</span>
        <span>Aug 02, 25</span>
        <span>Aug 03</span>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 ml-11">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] bg-primary rounded" />
          <span className="text-xs text-foreground">Cost</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-[2px] bg-muted-foreground/30 rounded" />
          <span className="text-xs text-muted-foreground">Waste</span>
        </div>
      </div>
    </div>
  );
}

/* Cost table with ghost blocks matching the reference */
export function GhostCostTable({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card overflow-hidden ${className}`}>
      {/* Row 1 */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <div className="h-3 w-3 rounded-sm bg-muted/60 shrink-0" />
        <div className="h-3 w-28 rounded bg-muted/50" />
        <div className="flex-1" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 w-10 rounded bg-muted/40" />
          ))}
        </div>
        <div className="h-3 w-4 rounded bg-muted/30" />
        <span className="text-[11px] text-muted-foreground">Cost</span>
        <div className="h-3 w-16 rounded bg-muted/40" />
      </div>
      {/* Row 2 */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="h-3 w-3 rounded-sm bg-muted/60 shrink-0" />
        <div className="h-3 w-40 rounded bg-muted/50" />
        <div className="h-3 w-24 rounded bg-muted/40" />
        <div className="flex-1" />
        <div className="h-3 w-3 rounded bg-muted/30" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-3 w-12 rounded bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Savings donut card */
export function GhostSavingsCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">Savings opportunities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Annualized</p>
        </div>
        <div className="flex gap-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-muted/50" />
              <div className="h-3 w-20 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 items-center">
        {/* Donut chart */}
        <div className="shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="52" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="20" />
            <circle
              cx="70" cy="70" r="52"
              fill="none"
              stroke="hsl(var(--primary) / 0.5)"
              strokeWidth="20"
              strokeDasharray="220 327"
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            <circle
              cx="70" cy="70" r="52"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="20"
              strokeDasharray="80 327"
              strokeDashoffset="-220"
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
            {/* Center text placeholders */}
            <rect x="45" y="58" width="50" height="6" rx="2" fill="hsl(var(--muted))" />
            <rect x="50" y="70" width="40" height="5" rx="2" fill="hsl(var(--muted) / 0.6)" />
          </svg>
        </div>

        {/* Legend items */}
        <div className="flex-1 space-y-3">
          {[0.8, 1, 0.6].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{
                backgroundColor: i === 0 ? 'hsl(var(--primary) / 0.3)' : i === 1 ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--muted))'
              }} />
              <div className="h-3 rounded bg-muted/50" style={{ width: `${w * 140}px` }} />
              <div className="flex-1" />
              <div className="h-3 w-full rounded bg-muted/30" />
              <div className="h-3 w-16 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-sm bg-muted/50 shrink-0" />
          <span className="text-xs text-muted-foreground">Savings opportunities</span>
          <div className="flex-1" />
          <div className="flex gap-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-muted/50" />
                <div className="h-3 w-20 rounded bg-muted/40" />
              </div>
            ))}
          </div>
          <span className="text-lg font-light text-muted-foreground ml-2">2</span>
        </div>
        <div className="mt-2 h-px bg-border" />
      </div>
    </div>
  );
}
