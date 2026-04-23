const kpis = [
  { labelW: 88, subW: 44, values: [{ valW: 28, deltaW: 36 }, { valW: 36, deltaW: 40 }] },
  { labelW: 76, subW: 44, values: [{ valW: 24, deltaW: 38 }, { valW: 36, deltaW: 44 }] },
  { labelW: 64, subW: 44, values: [{ valW: 32, deltaW: 30 }] },
  { labelW: 56, subW: 44, values: [{ valW: 44, deltaW: 38 }] },
  { labelW: 72, subW: 56, values: [{ valW: 44, deltaW: 38 }], highlight: true },
];

const tabs = ["COST", "WORKLOAD", "HEALTH", "COVERAGE"];

const tableRows = [
  { name: "categories-machine-type", runs: "419", cost: "$78,887", waste: "$70,901", util: "10%", utilColor: "text-destructive", opptIcon: 3, savings: "$426,968" },
  { name: "bids-machine-type", runs: "735", cost: "$77,050", waste: "$66,051", util: "14%", utilColor: "text-destructive", opptIcon: 2, savings: "$369,142" },
  { name: "impression-skew", runs: "81", cost: "$47,623", waste: "$44,225", util: "7.1%", utilColor: "text-destructive", opptIcon: 2, savings: "$174,722" },
  { name: "hourly-usage-tracking-cores", runs: "6K", cost: "$16,904", waste: "$15,206", util: "10%", utilColor: "text-destructive", opptIcon: 9, savings: "$109,019" },
];

const chartPoints = "0,90 20,88 40,87 60,85 80,88 100,85 120,80 140,75 160,70 180,60 200,55 220,45 240,30 260,40 280,50 300,55 320,45 340,50 360,40 380,45 400,50 420,45 440,50 460,55 480,60 500,70";

export const DashboardContent = () => {
  return (
    <div className="px-6 py-5 space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`border rounded-lg p-4 ${
              kpi.highlight
                ? "border-primary/30 bg-primary/[0.04]"
                : "border-border bg-card"
            }`}
          >
            <div className="h-3 rounded-sm bg-muted-foreground/15 mb-1.5" style={{ width: kpi.labelW }} />
            <div className="h-2.5 rounded-sm bg-muted-foreground/10 mb-3" style={{ width: kpi.subW }} />
            <div className="flex items-end gap-4">
              {kpi.values.map((v, j) => (
                <div key={j}>
                  <div className="h-6 rounded-sm bg-muted-foreground/20 mb-1.5" style={{ width: v.valW }} />
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-sm bg-emerald-500/30" />
                    <div className="h-2 rounded-sm bg-emerald-500/25" style={{ width: v.deltaW }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-border">
        {[40, 56, 44, 60].map((w, i) => (
          <div key={i} className="px-4 py-2.5 relative">
            <div className={`h-2.5 rounded-sm ${i === 0 ? "bg-primary/50" : "bg-muted-foreground/20"}`} style={{ width: w }} />
            {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
          </div>
        ))}
        {/* Group by dropdown placeholder */}
        <div className="ml-auto flex items-center gap-2 border border-border rounded-md px-3 py-1.5">
          <div className="h-2 w-20 rounded-sm bg-muted-foreground/15" />
          <div className="h-2.5 w-14 rounded-sm bg-muted-foreground/20" />
          <div className="h-2.5 w-2.5 rounded bg-muted/40" />
        </div>
      </div>

      {/* Compute utilization chart */}
      <div className="border border-border rounded-lg bg-card p-5">
        {/* Header with stats */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-3.5 w-36 rounded-sm bg-muted-foreground/20 mb-1.5" />
            <div className="h-2.5 w-12 rounded-sm bg-muted-foreground/12" />
          </div>
          <div className="flex items-center gap-8">
            {[{ vw: 44, lw: 64 }, { vw: 44, lw: 40 }, { vw: 44, lw: 44 }, { vw: 44, lw: 56 }].map((s, i) => (
              <div key={i} className="text-center flex flex-col items-center gap-1.5">
                <div className="h-6 rounded-sm bg-muted-foreground/20" style={{ width: s.vw }} />
                <div className="h-2 rounded-sm bg-muted-foreground/12" style={{ width: s.lw }} />
              </div>
            ))}
            {/* Utilization ring */}
            <div className="flex flex-col items-center">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20" fill="none" stroke="hsl(var(--muted) / 0.6)" strokeWidth="4" />
                <circle cx="26" cy="26" r="20" fill="none" stroke="hsl(var(--destructive))" strokeWidth="4" strokeDasharray="25 126" strokeDashoffset="0" transform="rotate(-90 26 26)" strokeLinecap="round" />
                <rect x="16" y="23" width="20" height="5" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
              </svg>
              <div className="h-2 w-14 rounded-sm bg-muted-foreground/15 mt-1" />
            </div>
          </div>
        </div>

        {/* Y-axis + chart */}
        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-1 w-6 shrink-0 items-end">
            {[14, 14, 14, 10, 8].map((w, i) => (
              <div key={i} className="h-2 rounded-sm bg-muted-foreground/15" style={{ width: w }} />
            ))}
          </div>
          <div className="flex-1 relative" style={{ height: 140 }}>
            {[0, 25, 50, 75, 100].map(pct => (
              <div key={pct} className="absolute left-0 right-0 border-t border-dashed border-border/50" style={{ top: `${pct}%` }} />
            ))}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
              <defs>
                <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <polygon points={chartPoints + " 500,100 0,100"} fill="url(#costFill)" />
              <polyline points={chartPoints} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 ml-8">
          {[20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20].map((w, i) => (
            <div key={i} className="h-1.5 rounded-sm bg-muted-foreground/15" style={{ width: w }} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 ml-8">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-primary" />
            <div className="h-2 w-8 rounded-sm bg-muted-foreground/15" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-[2px] bg-muted-foreground/30" />
            <div className="h-2 w-10 rounded-sm bg-muted-foreground/15" />
          </div>
        </div>
      </div>

      {/* Compute aggregated table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_100px_100px_90px_120px] gap-2 px-5 py-3 border-b border-border items-center">
          <div className="h-2.5 w-36 rounded-sm bg-muted-foreground/20" />
          {[24, 32, 28, 36, 40].map((w, i) => (
            <div key={i} className="flex justify-end">
              <div className="h-2.5 rounded-sm bg-muted-foreground/15" style={{ width: w }} />
            </div>
          ))}
        </div>
        {/* Table rows */}
        {[
          { nameW: 140, runsW: 22, costW: 36, wasteW: 36, savW: 44 },
          { nameW: 112, runsW: 22, costW: 36, wasteW: 36, savW: 44 },
          { nameW: 96,  runsW: 18, costW: 36, wasteW: 36, savW: 44 },
          { nameW: 160, runsW: 18, costW: 36, wasteW: 36, savW: 44 },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_100px_100px_90px_120px] gap-2 px-5 py-3 border-b border-border last:border-b-0 items-center">
            <div>
              <div className="inline-flex items-center px-2 py-0.5 rounded border border-border bg-muted/30 h-5" style={{ width: row.nameW }} />
            </div>
            <div className="flex justify-end">
              <div className="h-2.5 rounded-sm bg-muted-foreground/20" style={{ width: row.runsW }} />
            </div>
            <div className="flex justify-end">
              <div className="h-2.5 rounded-sm bg-muted-foreground/20" style={{ width: row.costW }} />
            </div>
            <div className="flex justify-end">
              <div className="h-2.5 rounded-sm bg-muted-foreground/20" style={{ width: row.wasteW }} />
            </div>
            <div className="flex justify-center">
              <div className="h-5 w-10 rounded-full bg-destructive/10" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="w-6 h-6 rounded bg-amber-500/15" />
              <div className="h-2.5 rounded-sm bg-muted-foreground/20" style={{ width: row.savW }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
