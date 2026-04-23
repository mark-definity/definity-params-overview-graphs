import { useState, useRef, useEffect } from "react";
import { Search, MoreVertical, ChevronDown, X, ChevronRight, Hourglass } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";

// ── Mock data ────────────────────────────────────────────────────────────────

const TASK_RUNS_DATA = [
  { label: "Jun 12, 25", iso: "2025-06-12T00:00:00", completed: 7,  retries: 0, failed: 0, unknown: 1 },
  { label: "Jun 14, 25", iso: "2025-06-14T00:00:00", completed: 4,  retries: 1, failed: 0, unknown: 1 },
  { label: "Jun 16, 25", iso: "2025-06-16T00:00:00", completed: 8,  retries: 1, failed: 7, unknown: 0 },
  { label: "Jun 18, 25", iso: "2025-06-18T00:00:00", completed: 10, retries: 0, failed: 0, unknown: 2 },
  { label: "Jun 20, 25", iso: "2025-06-20T00:00:00", completed: 1,  retries: 0, failed: 0, unknown: 0 },
  { label: "Jun 22, 25", iso: "2025-06-22T00:00:00", completed: 3,  retries: 0, failed: 0, unknown: 1 },
  { label: "Jun 24, 25", iso: "2025-06-24T00:00:00", completed: 6,  retries: 0, failed: 0, unknown: 0 },
  { label: "Jun 26, 25", iso: "2025-06-26T00:00:00", completed: 9,  retries: 2, failed: 0, unknown: 1 },
  { label: "Jun 28, 25", iso: "2025-06-28T00:00:00", completed: 14, retries: 1, failed: 0, unknown: 0 },
  { label: "Jun 30, 25", iso: "2025-06-30T00:00:00", completed: 20, retries: 0, failed: 0, unknown: 1 },
  { label: "Jul 02, 25", iso: "2025-07-02T00:00:00", completed: 18, retries: 2, failed: 0, unknown: 1 },
  { label: "Jul 04, 25", iso: "2025-07-04T00:00:00", completed: 12, retries: 0, failed: 1, unknown: 2 },
  { label: "Jul 06, 25", iso: "2025-07-06T00:00:00", completed: 16, retries: 3, failed: 0, unknown: 1 },
  { label: "Jul 08, 25", iso: "2025-07-08T00:00:00", completed: 18, retries: 1, failed: 0, unknown: 1 },
  { label: "Jul 10, 25", iso: "2025-07-10T00:00:00", completed: 15, retries: 0, failed: 0, unknown: 2 },
  { label: "Jul 12, 25", iso: "2025-07-12T00:00:00", completed: 14, retries: 2, failed: 0, unknown: 1 },
  { label: "Jul 14, 25", iso: "2025-07-14T00:00:00", completed: 11, retries: 0, failed: 0, unknown: 1 },
  { label: "Jul 16, 25", iso: "2025-07-16T00:00:00", completed: 5,  retries: 1, failed: 0, unknown: 2 },
  { label: "Jul 18, 25", iso: "2025-07-18T00:00:00", completed: 7,  retries: 0, failed: 3, unknown: 1 },
];

const KEY_METRICS_DATA = [
  { label: "06-12 02:07", iso: "2025-06-12T02:07:36", duration: 0.80 },
  { label: "06-13 10:01", iso: "2025-06-13T10:01:16", duration: 1.10 },
  { label: "06-14 16:44", iso: "2025-06-14T16:44:35", duration: 0.60 },
  { label: "06-15 03:12", iso: "2025-06-15T03:12:43", duration: 1.40 },
  { label: "06-16 09:11", iso: "2025-06-16T09:11:11", duration: 1.70 },
  { label: "06-17 14:22", iso: "2025-06-17T14:22:00", duration: 0.90 },
  { label: "06-18 03:12", iso: "2025-06-18T03:12:43", duration: 1.40 },
  { label: "06-19 09:12", iso: "2025-06-19T09:12:58", duration: 1.80 },
  { label: "06-20 14:19", iso: "2025-06-20T14:19:06", duration: 0.70 },
  { label: "06-21 04:55", iso: "2025-06-21T04:55:56", duration: 1.20 },
  { label: "06-22 08:06", iso: "2025-06-22T08:06:37", duration: 2.10 },
  { label: "06-24 03:11", iso: "2025-06-24T03:11:22", duration: 0.50 },
  { label: "06-25 09:12", iso: "2025-06-25T09:12:44", duration: 1.50 },
  { label: "06-26 14:19", iso: "2025-06-26T14:19:33", duration: 1.00 },
  { label: "06-27 04:55", iso: "2025-06-27T04:55:11", duration: 2.40 },
  { label: "06-28 08:06", iso: "2025-06-28T08:06:19", duration: 1.70 },
  { label: "06-29 03:11", iso: "2025-06-29T03:11:48", duration: 0.80 },
  { label: "07-01 09:12", iso: "2025-07-01T09:12:07", duration: 3.80 },
  { label: "07-03 14:19", iso: "2025-07-03T14:19:55", duration: 1.30 },
  { label: "07-05 04:55", iso: "2025-07-05T04:55:29", duration: 0.90 },
  { label: "07-07 08:06", iso: "2025-07-07T08:06:02", duration: 1.60 },
  { label: "07-10 03:11", iso: "2025-07-10T03:11:37", duration: 1.10 },
  { label: "07-13 09:12", iso: "2025-07-13T09:12:14", duration: 2.20 },
  { label: "07-15 14:19", iso: "2025-07-15T14:19:51", duration: 1.00 },
  { label: "07-17 04:55", iso: "2025-07-17T04:55:23", duration: 1.40 },
  { label: "07-18 08:06", iso: "2025-07-18T08:06:48", duration: 0.70 },
];

// Historical run data — covers the 52 weeks before the chart range
function generateHistoricalRunsData() {
  let seed = 54321;
  function rng() { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; }
  const points: typeof TASK_RUNS_DATA = [];
  const startMs = new Date("2025-06-11T00:00:00").getTime();
  for (let w = 2; w <= 52; w += 2) {
    const ms = startMs - w * 7 * 24 * 3600 * 1000;
    const date = new Date(ms);
    const mo  = date.toLocaleString("en-US", { month: "short" });
    const d   = String(date.getDate()).padStart(2, "0");
    const yr  = String(date.getFullYear()).slice(2);
    const iso = date.toISOString().slice(0, 19);
    const completed = 3 + Math.round(rng() * 16);
    const retries   = rng() < 0.3 ? Math.round(rng() * 3) : 0;
    const failed    = rng() < 0.2 ? Math.round(rng() * 6) : 0;
    const unknown   = rng() < 0.4 ? Math.round(rng() * 2) : 0;
    points.push({ label: `${mo} ${d}, ${yr}`, iso, completed, retries, failed, unknown });
  }
  return points.sort((a, b) => a.iso.localeCompare(b.iso));
}
const HISTORICAL_RUNS_DATA = generateHistoricalRunsData();

// Generate ~500 task run rows spanning a full year
function generateTaskRunsTable() {
  const rows: { pit: string; startTime: string; duration: string; status: string }[] = [];
  let seed = 7919;
  function rng() {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  [...HISTORICAL_RUNS_DATA, ...TASK_RUNS_DATA].forEach(day => {
    const total = day.completed + day.retries + day.failed + day.unknown;
    if (total === 0) return;
    const baseMs  = new Date(day.iso).getTime();
    const windowMs = 2 * 24 * 3600 * 1000;

    const statuses: string[] = [
      ...Array(day.failed).fill("Failed"),
      ...Array(day.unknown).fill("Unknown"),
      ...Array(day.retries).fill("Completed"),
      ...Array(day.completed).fill("Completed"),
    ];

    statuses.forEach(status => {
      const runDate = new Date(baseMs + rng() * windowMs);
      const iso = runDate.toISOString().slice(0, 19);
      const mo  = runDate.toLocaleString("en-US", { month: "short" });
      const d   = runDate.getDate();
      const yr  = String(runDate.getFullYear()).slice(2);
      const mins = status === "Failed"
        ? 12 + Math.round(rng() * 28)
        : 35 + Math.round(rng() * 95);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      rows.push({ pit: iso, startTime: `${mo} ${d} ${yr}`, duration: h > 0 ? `${h}h ${m}m` : `${m}m`, status });
    });
  });

  return rows.sort((a, b) => b.pit.localeCompare(a.pit));
}

const TASK_RUNS_TABLE = generateTaskRunsTable();

// ── Unified dataset for v2 (both series on same x-axis) ──────────────────────

const UNIFIED_V2_DATA = TASK_RUNS_DATA.map((bar, i) => {
  const barMs = new Date(bar.iso).getTime();
  let closestDuration = 0, minDiff = Infinity;
  KEY_METRICS_DATA.forEach(p => {
    const diff = Math.abs(new Date(p.iso).getTime() - barMs);
    if (diff < minDiff) { minDiff = diff; closestDuration = p.duration; }
  });
  // Amplify correlation: where failures spike, push duration higher
  const duration = bar.failed >= 5 ? Math.max(closestDuration, 3.2)
                 : bar.failed >= 2 ? Math.max(closestDuration, 2.0)
                 : closestDuration;

  // SLA %: healthy baseline, drops sharply on failure days
  const sla = Math.round(
    bar.failed >= 5 ? 62 + Math.sin(i) * 4
    : bar.failed >= 2 ? 78 + Math.sin(i * 1.2) * 5
    : 94 + Math.sin(i * 0.9) * 4
  );

  // vCore Time (vCore-hours): scales with run count × duration
  const vcoreTime = Math.round(
    ((bar.completed + bar.retries) * duration * 0.38 + bar.failed * 0.9
    + Math.sin(i * 1.1) * 0.8) * 10
  ) / 10;

  // vCore Utilization %: correlated with vcoreTime, capped 25–92
  const vcoreUtil = Math.round(
    Math.min(92, Math.max(25, vcoreTime * 3.8 + Math.sin(i * 0.7) * 8 + 18))
  );

  // Param changes: most runs have them, counts in the 5–500 range
  const PARAM_CHANGE_COUNTS: Record<number,number> = {
    0: 12, 1: 47, 2: 183, 3: 8,
    5: 64, 6: 291, 7: 19,
    8: 500, 9: 37, 10: 142,
    11: 6,
    12: 88, 13: 215,
    14: 33, 15: 7, 16: 412,
    17: 54, 18: 128,
  };
  const paramChanges = PARAM_CHANGE_COUNTS[i] ?? 0;

  return { ...bar, duration, sla, vcoreTime, vcoreUtil, paramChanges };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes >= 60) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const m = Math.floor(totalMinutes);
  const s = Math.round((hours * 3600) % 60);
  return `${m}m ${s}s`;
}

function findClosestRightIndex(leftIndex: number): number {
  const leftMs = new Date(TASK_RUNS_DATA[leftIndex].iso).getTime();
  let closest = 0, minDiff = Infinity;
  KEY_METRICS_DATA.forEach((p, i) => {
    const diff = Math.abs(new Date(p.iso).getTime() - leftMs);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}

function findClosestLeftIndex(rightIndex: number): number {
  const rightMs = new Date(KEY_METRICS_DATA[rightIndex].iso).getTime();
  let closest = 0, minDiff = Infinity;
  TASK_RUNS_DATA.forEach((p, i) => {
    const diff = Math.abs(new Date(p.iso).getTime() - rightMs);
    if (diff < minDiff) { minDiff = diff; closest = i; }
  });
  return closest;
}

// Calculate the pixel x of a bar (left chart) at given index
function barX(index: number, containerWidth: number): number {
  const leftMargin = 5, yAxisW = 24, rightMargin = 5;
  const plotW = containerWidth - leftMargin - yAxisW - rightMargin;
  const n = TASK_RUNS_DATA.length;
  return leftMargin + yAxisW + (index + 0.5) * (plotW / n);
}

// Calculate the pixel x of a line point (right chart) at given index
function lineX(index: number, containerWidth: number): number {
  const leftMargin = 5, yAxisW = 28, rightMargin = 5;
  const plotW = containerWidth - leftMargin - yAxisW - rightMargin;
  const n = KEY_METRICS_DATA.length;
  return leftMargin + yAxisW + index * (plotW / (n - 1));
}

// ── Custom tooltips ───────────────────────────────────────────────────────────

const TASK_RUN_CATEGORIES = [
  { key: "completed", color: "#22c55e", pattern: false },
  { key: "failed",    color: "#ef4444", pattern: false },
  { key: "unknown",   color: "#d1d5db", pattern: false },
  { key: "retries",   color: "#22c55e", pattern: true  },
] as const;

function PatternSquare() {
  return (
    <svg width="12" height="12" className="shrink-0">
      <rect width="12" height="12" rx="2" fill="#22c55e" opacity="0.25" />
      <circle cx="3" cy="3" r="1.4" fill="#22c55e" />
      <circle cx="9" cy="3" r="1.4" fill="#22c55e" />
      <circle cx="3" cy="9" r="1.4" fill="#22c55e" />
      <circle cx="9" cy="9" r="1.4" fill="#22c55e" />
    </svg>
  );
}

// Normal recharts-driven tooltip for the bar chart
function TaskRunsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const iso: string = payload[0]?.payload?.iso ?? "";
  const visibleRows = TASK_RUN_CATEGORIES
    .map(cat => ({ ...cat, value: payload.find((p: any) => p.dataKey === cat.key)?.value ?? 0 }))
    .filter(row => row.value > 0);
  if (!visibleRows.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl px-3 py-2.5 min-w-[140px]">
      {visibleRows.map(row => (
        <div key={row.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
          {row.pattern
            ? <PatternSquare />
            : <span className="w-3 h-3 rounded-sm shrink-0 inline-block" style={{ background: row.color }} />
          }
          <span className="text-[13px] font-medium text-foreground">{row.value}</span>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground mt-2 font-mono border-t border-border pt-1.5">{iso}</p>
    </div>
  );
}

// Forced tooltip for bar chart when driven by right hover
function ForcedBarTooltip({ index }: { index: number }) {
  const data = TASK_RUNS_DATA[index];
  if (!data) return null;
  const visibleRows = TASK_RUN_CATEGORIES
    .map(cat => ({ ...cat, value: (data as any)[cat.key] as number }))
    .filter(row => row.value > 0);
  if (!visibleRows.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl px-3 py-2.5 min-w-[140px]">
      {visibleRows.map(row => (
        <div key={row.key} className="flex items-center gap-2 mb-1.5 last:mb-0">
          {row.pattern
            ? <PatternSquare />
            : <span className="w-3 h-3 rounded-sm shrink-0 inline-block" style={{ background: row.color }} />
          }
          <span className="text-[13px] font-medium text-foreground">{row.value}</span>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground mt-2 font-mono border-t border-border pt-1.5">{data.iso}</p>
    </div>
  );
}

// Normal recharts-driven tooltip for the line chart
function KeyMetricsTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const iso: string = point.payload.iso ?? "";
  const duration: number = point.value;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
      <div className="flex">
        <div className="w-[3px] bg-cyan-500 shrink-0" />
        <div className="px-3 py-2.5">
          <p className="text-[15px] font-semibold text-foreground leading-tight">{formatDuration(duration)}</p>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">{iso}</p>
        </div>
      </div>
    </div>
  );
}

// Forced tooltip for line chart when driven by left hover
function ForcedLineTooltip({ index }: { index: number }) {
  const data = KEY_METRICS_DATA[index];
  if (!data) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
      <div className="flex">
        <div className="w-[3px] bg-cyan-500 shrink-0" />
        <div className="px-3 py-2.5">
          <p className="text-[15px] font-semibold text-foreground leading-tight">{formatDuration(data.duration)}</p>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">{data.iso}</p>
        </div>
      </div>
    </div>
  );
}

// Forced tooltip for param chart when driven by left or right hover
function ForcedParamTooltip({ index }: { index: number }) {
  const data = UNIFIED_V2_DATA[index];
  if (!data) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
      <div className="flex">
        <div className="w-[3px] bg-violet-500 shrink-0" />
        <div className="px-3 py-2.5">
          {data.paramChanges > 0 ? (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 shrink-0" />
              <span className="text-[13px] font-semibold text-foreground">{data.paramChanges} param changes</span>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground mb-1">No param changes</p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 font-mono border-t border-border pt-1.5">{data.iso}</p>
        </div>
      </div>
    </div>
  );
}

// Unified tooltip for v2 — shows duration + run breakdown from one data row
function UnifiedV2Tooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload; // full UNIFIED_V2_DATA row — always has all fields
  if (!row) return null;
  const total = (row.completed ?? 0) + (row.retries ?? 0) + (row.failed ?? 0) + (row.unknown ?? 0);
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
      <div className="flex">
        <div className="w-[3px] bg-cyan-500 shrink-0" />
        <div className="px-3 py-2.5 min-w-[180px]">
          {/* Duration row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
            <span className="text-[13px] font-semibold text-foreground">Duration {formatDuration(row.duration)}</span>
          </div>
          {/* Total tasks */}
          {total > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
              <span className="text-[12px] text-foreground">{row.completed} tasks completed</span>
            </div>
          )}
          {/* Retries */}
          {row.retries > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <svg width="10" height="10" className="shrink-0">
                <rect width="10" height="10" rx="1.5" fill="#22c55e" opacity="0.25"/>
                <circle cx="2.5" cy="2.5" r="1" fill="#22c55e"/>
                <circle cx="7.5" cy="7.5" r="1" fill="#22c55e"/>
              </svg>
              <span className="text-[12px] text-foreground">{row.retries} retries</span>
            </div>
          )}
          {/* Failures */}
          {row.failed > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500 shrink-0" />
              <span className="text-[12px] text-red-600 font-medium">{row.failed} failed</span>
            </div>
          )}
          {/* Unknown */}
          {row.unknown > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-300 shrink-0" />
              <span className="text-[12px] text-muted-foreground">{row.unknown} unknown</span>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-2 font-mono border-t border-border pt-1.5">{row.iso}</p>
        </div>
      </div>
    </div>
  );
}

// ── Param changes Gantt badge ─────────────────────────────────────────────────

function ParamChangeBadge({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold whitespace-nowrap select-none shadow-sm hover:bg-violet-100 transition-colors cursor-pointer">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="shrink-0">
        <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor"/>
        <rect x="7"   y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
        <rect x="0.5" y="7"   width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
        <rect x="7"   y="7"   width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.25"/>
      </svg>
      {count}
    </div>
  );
}

// Tooltip for the v1 Parameter changes chart
function ParamChangesTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row || !row.paramChanges) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
      <div className="flex">
        <div className="w-[3px] bg-violet-500 shrink-0" />
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 shrink-0" />
            <span className="text-[13px] font-semibold text-foreground">{row.paramChanges} param changes</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono border-t border-border pt-1.5">{row.iso}</p>
        </div>
      </div>
    </div>
  );
}

// ── V4 carpet / heatmap data ──────────────────────────────────────────────────

const V4_PARAMS = [
  "definity.agent.version",
  "definity.server.version",
  "spark.app.name",
  "spark.app.id",
  "spark.definity.enabled",
  "spark.definity.env.name",
  "spark.definity.pipeline.name",
  "spark.definity.server",
  "spark.definity.tags",
  "spark.definity.task.name",
  "spark.driver.cores",
  "spark.driver.extraClassPath",
  "spark.driver.host",
  "spark.driver.memory",
  "spark.driver.memoryOverhead",
  "spark.driver.port",
  "spark.driver.userClassPathFirst",
  "spark.dynamicAllocation.enabled",
  "spark.executor.cores",
  "spark.executor.memory",
  "spark.executor.memoryOverhead",
  "spark.sql.shuffle.partitions",
  "spark.yarn.queue",
  "spark.speculation",
  "spark.serializer",
  "spark.network.timeout",
];

// Params that are "static" — infrastructure values that never change.
// These will always be 0 in the carpet, so "Changed only" hides them.
const V4_STATIC_PARAMS = new Set([
  "spark.driver.host",
  "spark.driver.port",
  "spark.app.id",
  "spark.driver.cores",
  "spark.driver.userClassPathFirst",
  "spark.speculation",
  "spark.serializer",
  "spark.driver.extraClassPath",
  "spark.definity.tags",
  "spark.definity.server",
  "spark.definity.enabled",
  "spark.yarn.queue",
]);

// Weight for dynamic params only
const V4_PARAM_WEIGHTS = [
  0.85, 0.60,           // definity agent/server version
  0.30, 0.00,           // app name / app.id (static)
  0.00, 0.55, 0.70, 0.00, 0.00, 0.62,  // definity.* (enabled, server, tags = static)
  0.00, 0.00, 0.00, 0.95, 0.72, 0.00, 0.00,  // driver.* (cores, extraClassPath, host, port, userClassPathFirst = static)
  0.48,                 // dynamicAllocation
  0.60, 1.00, 0.82, 0.90,  // executor.* + sql.shuffle
  0.00, 0.00, 0.00, 0.55,  // yarn.queue, speculation, serializer = static; network.timeout = dynamic
];

function generateV4Carpet(): number[][] {
  let seed = 31337;
  function rng() {
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  const n = V4_PARAMS.length;
  const carpet: number[][] = Array.from({ length: n }, () => Array(UNIFIED_V2_DATA.length).fill(0));
  const activeWeights = V4_PARAM_WEIGHTS.filter(w => w > 0);
  const totalWeight = activeWeights.reduce((a, b) => a + b, 0);

  UNIFIED_V2_DATA.forEach((d, ti) => {
    if (d.paramChanges === 0) return;
    V4_PARAM_WEIGHTS.forEach((w, pi) => {
      if (w === 0) return; // static param — always stays 0
      const base = d.paramChanges * w / totalWeight;
      const jitter = (rng() - 0.5) * base * 0.65;
      carpet[pi][ti] = Math.max(0, Math.round(base + jitter));
    });
  });
  return carpet;
}

const V4_CARPET = generateV4Carpet();
const V4_MAX_CELL = Math.max(...V4_CARPET.flat().filter(v => v > 0));

function carpetCellBg(count: number): string {
  if (count === 0) return "hsl(180,10%,96%)";
  const t = Math.sqrt(Math.min(1, count / (V4_MAX_CELL * 0.65)));
  const sat = Math.round(20 + t * 58);
  const lit = Math.round(88 - t * 52);
  return `hsl(178,${sat}%,${lit}%)`;
}

function carpetCellTextColor(count: number): string {
  if (count === 0) return "transparent";
  const t = Math.sqrt(Math.min(1, count / (V4_MAX_CELL * 0.65)));
  return t > 0.55 ? "hsl(178,60%,95%)" : "hsl(178,50%,25%)";
}

// Plausible value pools per parameter — used in cell hover tooltips
const V4_PARAM_VALUE_POOLS: Record<string, string[]> = {
  "definity.agent.version":          ["1.2.0","1.2.1","1.3.0","2.0.0","2.1.0"],
  "definity.server.version":         ["3.1.0","3.1.1","3.2.0","4.0.0"],
  "spark.app.name":                  ["categories_offline","categories_offline_v2","cats_job"],
  "spark.app.id":                    ["app-20250612-001","app-20250618-002","app-20250701-003"],
  "spark.definity.enabled":          ["true","false"],
  "spark.definity.env.name":         ["prod","staging","dev"],
  "spark.definity.pipeline.name":    ["categories-pipeline","cats-pipe-v2","cats-pipe-v3"],
  "spark.definity.server":           ["server-01.internal","server-02.internal","server-03.internal"],
  "spark.definity.tags":             ["env:prod","env:prod,team:data","env:staging,debug:true"],
  "spark.definity.task.name":        ["categories_offline","cats_task_v2","offline_cats"],
  "spark.driver.cores":              ["1","2","4"],
  "spark.driver.extraClassPath":     ["/opt/lib/driver.jar","/opt/lib/v2/driver.jar"],
  "spark.driver.host":               ["host-01.internal","host-02.internal","host-03.internal"],
  "spark.driver.memory":             ["2g","4g","8g","16g"],
  "spark.driver.memoryOverhead":     ["512m","1g","2g"],
  "spark.driver.port":               ["7077","7078","7079"],
  "spark.driver.userClassPathFirst": ["true","false"],
  "spark.dynamicAllocation.enabled": ["true","false"],
  "spark.executor.cores":            ["2","4","8"],
  "spark.executor.memory":           ["4g","8g","16g","32g"],
  "spark.executor.memoryOverhead":   ["1g","2g","4g"],
  "spark.sql.shuffle.partitions":    ["200","400","800","1600"],
  "spark.yarn.queue":                ["default","high-priority","batch","low-priority"],
  "spark.speculation":               ["true","false"],
  "spark.serializer":                ["org.apache.spark.serializer.KryoSerializer","org.apache.spark.serializer.JavaSerializer"],
  "spark.network.timeout":           ["120s","300s","600s","900s"],
};

// Generate the list of values set in a cell (deterministic from indices)
function getV4CellValues(pi: number, ti: number, count: number): string[] {
  const pool = V4_PARAM_VALUE_POOLS[V4_PARAMS[pi]] ?? ["—"];
  const out: string[] = [];
  let s = pi * 73 + ti * 37 + 9001;
  for (let i = 0; i < Math.min(count, 6); i++) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    out.push(pool[s % pool.length]);
  }
  return out;
}

// ── Param changes sidebar ─────────────────────────────────────────────────────

type RunStatus = "success" | "failed" | "warning" | "partial";

function RunStatusSquare({ status }: { status?: RunStatus }) {
  if (!status) return null;
  if (status === "success") return <span className="inline-block w-2.5 h-2.5 bg-emerald-500 shrink-0" />;
  if (status === "failed")  return <span className="inline-block w-2.5 h-2.5 bg-red-500 shrink-0" />;
  if (status === "warning") return <span className="inline-block w-2.5 h-2.5 bg-amber-400 shrink-0" />;
  return <span className="inline-block w-2.5 h-2.5 border-2 border-dashed border-emerald-500 shrink-0" />;
}

function generateMockRuns(count: number, afterPit: string, beforePit?: string): { pit: string; status: RunStatus }[] {
  const after  = new Date(afterPit).getTime();
  const before = beforePit ? new Date(beforePit).getTime() : after + count * 12 * 3600 * 1000;
  const cycle: RunStatus[] = ["success","success","success","warning","success","success","failed","success"];
  return Array.from({ length: count }, (_, i) => {
    const t  = after + ((before - after) * (i + 1)) / (count + 1);
    const d  = new Date(t);
    const pit = d.toISOString().slice(0, 19);
    return { pit, status: cycle[i % cycle.length] };
  });
}

// Build list of params that changed at a given UNIFIED_V2_DATA index
function getChangesAtTimePoint(ti: number) {
  return V4_PARAMS
    .map((paramName, pi) => ({
      paramName,
      count: V4_CARPET[pi][ti],
      values: getV4CellValues(pi, ti, V4_CARPET[pi][ti]),
    }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

// ── Stacked-bar seam fix ──────────────────────────────────────────────────────
// Recharts renders each stack segment as a separate <rect>. Floating-point y
// positions leave sub-pixel gaps. Extend non-top segments by 1px downward so
// the segment above always overlaps and visually seals the join.
function SeamRect(props: any) {
  const { x, y, width, height, fill, fillOpacity } = props;
  if (!height || height <= 0) return <g />;
  return (
    <rect
      x={x} y={y}
      width={width} height={height + 1}
      fill={fill} fillOpacity={fillOpacity ?? 1}
    />
  );
}

// ── Chart decorations ─────────────────────────────────────────────────────────

const PATTERN_ID = "retriesPattern";
function PatternDef() {
  return (
    <defs>
      <pattern id={PATTERN_ID} patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="#22c55e" opacity="0.25" />
        <circle cx="1" cy="1" r="0.8" fill="#22c55e" opacity="0.9" />
        <circle cx="3" cy="3" r="0.8" fill="#22c55e" opacity="0.9" />
      </pattern>
    </defs>
  );
}

function TaskRunsLegend() {
  return (
    <div className="flex items-center gap-5 mt-3">
      {[
        { color: "#22c55e", label: "Completed" },
        { pattern: true,   label: "With Retries" },
        { color: "#ef4444", label: "Failed" },
        { color: "#d1d5db", label: "Unknown" },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          {(item as any).pattern
            ? <svg width="12" height="12"><rect width="12" height="12" rx="2" fill="#22c55e" opacity="0.25"/><circle cx="3" cy="3" r="1.5" fill="#22c55e"/><circle cx="9" cy="9" r="1.5" fill="#22c55e"/></svg>
            : <span className="w-3 h-3 rounded-sm inline-block shrink-0" style={{ background: (item as any).color }} />
          }
          <span className="text-[11px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-red-300 text-[11px] font-medium text-red-600">
      <span className="w-2 h-2 rounded-sm bg-red-500 shrink-0" />Failed
    </span>
  );
  if (status === "Unknown") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-300 text-[11px] font-medium text-gray-500">
      <span className="w-2 h-2 rounded-sm bg-gray-400 shrink-0" />Unknown
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-300 text-[11px] font-medium text-emerald-700">
      <span className="w-2 h-2 rounded-sm bg-emerald-500 shrink-0" />Completed
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type HoverState = {
  source: 'left' | 'right' | 'param' | null;
  leftIndex: number | null;   // also used as paramIndex (same 19-pt dataset)
  rightIndex: number | null;
};

export function OverviewPage({ version = 1 }: { version?: 1 | 2 | 3 | 4 }) {
  const [activeTab, setActiveTab]     = useState<"OVERVIEW"|"METRICS"|"COST"|"PERFORMANCE">("OVERVIEW");
  const [activeMetric, setActiveMetric] = useState<"Duration"|"SLA"|"vCore Time"|"vCore Utilization">("Duration");
  const [search, setSearch]           = useState("");
  const [hover, setHover]             = useState<HoverState>({ source: null, leftIndex: null, rightIndex: null });

  // Param changes sidebar (opened by clicking a Gantt badge)
  const [sidebarTimeIndex, setSidebarTimeIndex]   = useState<number | null>(null);
  const [sidebarSearch, setSidebarSearch]         = useState("");
  const [openSpacers, setOpenSpacers]             = useState<Set<string>>(new Set());
  function toggleSpacer(key: string) {
    setOpenSpacers(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  // v4 carpet filters + tooltip
  const [v4Search, setV4Search]             = useState("");
  const [v4ChangedOnly, setV4ChangedOnly]   = useState(false);
  const [v4SortByChanges, setV4SortByChanges] = useState(false);
  const [v4Tooltip, setV4Tooltip]           = useState<{ pi: number; ti: number; x: number; y: number } | null>(null);

  // v3 layer toggles (master on/off per layer)
  const [v3Layers, setV3Layers] = useState({ taskRuns: true, keyMetrics: true, paramChanges: true });
  function toggleV3Layer(key: keyof typeof v3Layers) {
    setV3Layers(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // v3 series visibility toggles (fine-grained, within a layer)
  const [v3Series, setV3Series] = useState({ completed: true, retries: true, failed: true, unknown: true, line: true });
  function toggleV3(key: keyof typeof v3Series) {
    setV3Series(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // Effective bar opacity: layer must be on AND series must be on
  function v3BarOp(key: keyof typeof v3Series, base = 0.80) {
    return v3Layers.taskRuns && v3Series[key] ? base : 0;
  }

  // v3 metric config — drives the right Y-axis and line dataKey
  const V3_METRIC_CONFIG = {
    "Duration":          { key: "duration",  domain: [0, 4]   as [number,number], ticks: [0,1,2,3,4],     fmt: (v:number) => `${v}h`,  label: "Duration" },
    "SLA":               { key: "sla",       domain: [50,100] as [number,number], ticks: [50,65,80,95],   fmt: (v:number) => `${v}%`,  label: "SLA"      },
    "vCore Time":        { key: "vcoreTime", domain: [0, 20]  as [number,number], ticks: [0,5,10,15,20],  fmt: (v:number) => `${v}`,   label: "vCore·h"  },
    "vCore Utilization": { key: "vcoreUtil", domain: [0, 100] as [number,number], ticks: [0,25,50,75,100],fmt: (v:number) => `${v}%`,  label: "vCore %"  },
  } as const;
  const metricCfg = V3_METRIC_CONFIG[activeMetric];

  // Inline tooltip for v3 — uses active metric
  function renderV3Tooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload;
    if (!row) return null;
    const total = (row.completed ?? 0) + (row.retries ?? 0) + (row.failed ?? 0) + (row.unknown ?? 0);
    const metricRaw = row[metricCfg.key] as number;
    const metricDisplay = activeMetric === "Duration"
      ? formatDuration(metricRaw)
      : metricCfg.fmt(metricRaw);
    return (
      <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
        <div className="flex">
          <div className="w-[3px] bg-cyan-500 shrink-0" />
          <div className="px-3 py-2.5 min-w-[180px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
              <span className="text-[13px] font-semibold text-foreground">{metricCfg.label} {metricDisplay}</span>
            </div>
            {total > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
                <span className="text-[12px] text-foreground">{row.completed} tasks completed</span>
              </div>
            )}
            {row.retries > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <svg width="10" height="10" className="shrink-0"><rect width="10" height="10" rx="1.5" fill="#22c55e" opacity="0.25"/><circle cx="2.5" cy="2.5" r="1" fill="#22c55e"/><circle cx="7.5" cy="7.5" r="1" fill="#22c55e"/></svg>
                <span className="text-[12px] text-foreground">{row.retries} retries</span>
              </div>
            )}
            {row.failed > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500 shrink-0" />
                <span className="text-[12px] text-red-600 font-medium">{row.failed} failed</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2 font-mono border-t border-border pt-1.5">{row.iso}</p>
          </div>
        </div>
      </div>
    );
  }

  const leftContainerRef   = useRef<HTMLDivElement>(null);
  const rightContainerRef  = useRef<HTMLDivElement>(null);
  const paramV1ContainerRef = useRef<HTMLDivElement>(null);

  // Table hover scroll refs
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Direct table row hover (mouse over the row itself)
  const [directHoverIndex, setDirectHoverIndex] = useState<number | null>(null);

  // Param Gantt strip positioning
  const paramContainerRef = useRef<HTMLDivElement>(null);
  const [paramW, setParamW] = useState(0);
  useEffect(() => {
    const el = paramContainerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setParamW(e.contentRect.width));
    obs.observe(el);
    setParamW(el.offsetWidth);
    return () => obs.disconnect();
  });

  // x-center of bar i in the param strip (mirrors recharts layout)
  // v2 bar chart:  left yAxis=28, right margin=8,  no right axis
  // v3 composed:   left yAxis=24, right yAxis=36,  margin.right=36
  function paramBadgeX(i: number, leftY: number, rightPad: number) {
    const n = UNIFIED_V2_DATA.length;
    const plotW = paramW - leftY - rightPad;
    return leftY + (i + 0.5) * (plotW / n);
  }

  const filteredRuns = TASK_RUNS_TABLE.filter(r =>
    !search || r.pit.includes(search) || r.status.toLowerCase().includes(search.toLowerCase())
  );

  // Map chart hover index → table row index (proportional, across filtered rows)
  const hoveredTableIndex = hover.leftIndex != null && filteredRuns.length > 0
    ? Math.round(hover.leftIndex * (filteredRuns.length - 1) / (UNIFIED_V2_DATA.length - 1))
    : null;

  // Scroll the matched table row to top of the table body on hover change.
  // Each row is h-10 = 40px — use index × height so the row is always the
  // first visible item in the scroll container. Instant so it tracks the mouse.
  const ROW_HEIGHT_PX = 40;
  useEffect(() => {
    if (hoveredTableIndex == null || !tableBodyRef.current) return;
    tableBodyRef.current.scrollTo({ top: hoveredTableIndex * ROW_HEIGHT_PX, behavior: 'instant' as ScrollBehavior });
  }, [hoveredTableIndex]);

  // ── Left chart handlers ──
  function onLeftMouseMove(data: any) {
    const li = data?.activeTooltipIndex;
    if (li == null) return;
    const ri = findClosestRightIndex(li);
    setHover({ source: 'left', leftIndex: li, rightIndex: ri });
  }
  function onLeftMouseLeave() {
    setHover({ source: null, leftIndex: null, rightIndex: null });
  }

  // ── Right chart handlers ──
  function onRightMouseMove(data: any) {
    const ri = data?.activeTooltipIndex;
    if (ri == null) return;
    const li = findClosestLeftIndex(ri);
    setHover({ source: 'right', leftIndex: li, rightIndex: ri });
  }
  function onRightMouseLeave() {
    setHover({ source: null, leftIndex: null, rightIndex: null });
  }

  // ── Param chart handlers (same 19-pt dataset as left → paramIndex === leftIndex) ──
  function onParamMouseMove(data: any) {
    const pi = data?.activeTooltipIndex;
    if (pi == null) return;
    const ri = findClosestRightIndex(pi);
    setHover({ source: 'param', leftIndex: pi, rightIndex: ri });
  }
  function onParamMouseLeave() {
    setHover({ source: null, leftIndex: null, rightIndex: null });
  }

  // ── Position helpers for forced tooltips ──
  function getForcedBarTooltipPos(): { x: number; y: number } | undefined {
    if (hover.leftIndex == null || !leftContainerRef.current) return undefined;
    const w = leftContainerRef.current.getBoundingClientRect().width;
    return { x: barX(hover.leftIndex, w) - 70, y: 20 };
  }

  function getForcedLineTooltipPos(): { x: number; y: number } | undefined {
    if (hover.rightIndex == null || !rightContainerRef.current) return undefined;
    const w = rightContainerRef.current.getBoundingClientRect().width;
    return { x: lineX(hover.rightIndex, w) - 80, y: 20 };
  }

  function getForcedParamTooltipPos(): { x: number; y: number } | undefined {
    if (hover.leftIndex == null || !paramV1ContainerRef.current) return undefined;
    const w = paramV1ContainerRef.current.getBoundingClientRect().width;
    return { x: barX(hover.leftIndex, w) - 70, y: 20 }; // same 19-pt formula as left
  }

  // Whether each chart is in "driven" mode (tooltip forced from another chart)
  const leftDriven  = (hover.source === 'right' || hover.source === 'param') && hover.leftIndex  != null;
  const rightDriven = (hover.source === 'left'  || hover.source === 'param') && hover.rightIndex != null;
  const paramDriven = (hover.source === 'left'  || hover.source === 'right') && hover.leftIndex  != null;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">

      {/* Page header */}
      <div className="px-6 pt-5 pb-0 border-b border-border bg-background shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded border border-border bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 10.51H16.5" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 14.26H16.5" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 18.01H16.5" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.75 4.5H19.5C19.8978 4.5 20.2794 4.65804 20.5607 4.93934C20.842 5.22064 21 5.60218 21 6V21.75C21 22.1478 20.842 22.5294 20.5607 22.8107C20.2794 23.092 19.8978 23.25 19.5 23.25H4.5C4.10218 23.25 3.72064 23.092 3.43934 22.8107C3.15804 22.5294 3 22.1478 3 21.75V6C3 5.60218 3.15804 5.22064 3.43934 4.93934C3.72064 4.65804 4.10218 4.5 4.5 4.5H8.25C8.25 3.50544 8.64509 2.55161 9.34835 1.84835C10.0516 1.14509 11.0054 0.75 12 0.75C12.9946 0.75 13.9484 1.14509 14.6517 1.84835C15.3549 2.55161 15.75 3.50544 15.75 4.5Z" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 4.51099C11.7929 4.51099 11.625 4.34309 11.625 4.13599C11.625 3.92888 11.7929 3.76099 12 3.76099" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5"/>
                <path d="M12 4.51099C12.2071 4.51099 12.375 4.34309 12.375 4.13599C12.375 3.92888 12.2071 3.76099 12 3.76099" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-foreground leading-tight">categories_offline</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Task</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-[12px] text-muted-foreground hover:bg-muted/40 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70">
              <path d="M5 22h14"/><path d="M5 2h14"/>
              <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
              <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
            </svg>
            Select task run (419)
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-0">
          {(["OVERVIEW","METRICS","COST","PERFORMANCE"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12px] font-medium flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === tab ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              {tab}
              {tab === "METRICS" && (
                <>
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="5" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="5" y="3" width="3" height="8" rx="0.5" fill="currentColor"/><rect x="9" y="1" width="3" height="10" rx="0.5" fill="currentColor"/></svg>93
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 6h4M4 8.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>34
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/>2
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 flex flex-col gap-5">

          {/* ── Charts ── */}

          {/* ── V1: side-by-side ── */}
          {version === 1 && (
          <div className="grid grid-cols-3 gap-4">

            {/* LEFT: Task runs bar chart */}
            <div className="border border-border rounded-lg bg-card p-4">
              <p className="text-[13px] font-semibold text-foreground">Task runs</p>
              <p className="text-[11px] text-muted-foreground mb-3">1 year</p>

              {/* Chart + forced overlay tooltip */}
              <div className="relative" ref={leftContainerRef}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={TASK_RUNS_DATA}
                    barSize={14}
                    barCategoryGap="20%"
                    onMouseMove={onLeftMouseMove}
                    onMouseLeave={onLeftMouseLeave}
                  >
                    <PatternDef />
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0,25]} ticks={[0,5,10,15,20,25]} width={24} />

                    {!leftDriven && (
                      <Tooltip content={<TaskRunsTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                    )}
                    {leftDriven && hover.leftIndex != null && (
                      <ReferenceLine x={TASK_RUNS_DATA[hover.leftIndex].label} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={20} />
                    )}

                    <Bar dataKey="completed" stackId="a" fill="#22c55e"  shape={SeamRect} />
                    <Bar dataKey="retries"   stackId="a" fill={`url(#${PATTERN_ID})`} shape={SeamRect} />
                    <Bar dataKey="failed"    stackId="a" fill="#ef4444" shape={SeamRect} />
                    <Bar dataKey="unknown"   stackId="a" fill="#d1d5db" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>

                {leftDriven && hover.leftIndex != null && getForcedBarTooltipPos() && (
                  <div className="absolute pointer-events-none z-10"
                    style={{ left: getForcedBarTooltipPos()!.x, top: getForcedBarTooltipPos()!.y }}>
                    <ForcedBarTooltip index={hover.leftIndex} />
                  </div>
                )}
              </div>
              <TaskRunsLegend />
            </div>

            {/* RIGHT: Key metrics line chart */}
            <div className="border border-border rounded-lg bg-card p-4">
              <p className="text-[13px] font-semibold text-foreground">Key metrics</p>
              <p className="text-[11px] text-muted-foreground mb-3">1 year</p>

              <div className="relative" ref={rightContainerRef}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={KEY_METRICS_DATA}
                    onMouseMove={onRightMouseMove}
                    onMouseLeave={onRightMouseLeave}
                  >
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}h`} domain={[0,4]} ticks={[0,1,2,3,4]} width={28} />

                    {!rightDriven && (
                      <Tooltip content={<KeyMetricsTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                    )}
                    {rightDriven && hover.rightIndex != null && (
                      <ReferenceLine x={KEY_METRICS_DATA[hover.rightIndex].label} stroke="hsl(var(--border))" strokeWidth={1} />
                    )}

                    <Line type="monotone" dataKey="duration" stroke="#06b6d4" strokeWidth={1.5} dot={false}
                      activeDot={rightDriven ? false : { r: 3, fill: "#06b6d4", strokeWidth: 0 }}
                    />
                    {rightDriven && hover.rightIndex != null && (
                      <ReferenceLine x={KEY_METRICS_DATA[hover.rightIndex].label} stroke="transparent"
                        dot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>

                {rightDriven && hover.rightIndex != null && getForcedLineTooltipPos() && (
                  <div className="absolute pointer-events-none z-10"
                    style={{ left: getForcedLineTooltipPos()!.x, top: getForcedLineTooltipPos()!.y }}>
                    <ForcedLineTooltip index={hover.rightIndex} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3">
                {(["Duration","SLA","vCore Time","vCore Utilization"] as const).map(m => (
                  <button key={m} onClick={() => setActiveMetric(m)} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${activeMetric === m ? "border-cyan-500" : "border-muted-foreground/40"}`}>
                      {activeMetric === m && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />}
                    </span>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* THIRD: Parameter changes */}
            <div className="border border-border rounded-lg bg-card p-4">
              <p className="text-[13px] font-semibold text-foreground">Parameter changes</p>
              <p className="text-[11px] text-muted-foreground mb-3">1 year</p>

              <div className="relative" ref={paramV1ContainerRef}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={UNIFIED_V2_DATA}
                    barSize={12}
                    barCategoryGap="25%"
                    onMouseMove={onParamMouseMove}
                    onMouseLeave={onParamMouseLeave}
                  >
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} />

                    {!paramDriven && (
                      <Tooltip content={<ParamChangesTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                    )}
                    {paramDriven && hover.leftIndex != null && (
                      <ReferenceLine x={UNIFIED_V2_DATA[hover.leftIndex].label} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={20} />
                    )}

                    <Bar dataKey="paramChanges" fill="#8b5cf6" fillOpacity={0.82} radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>

                {paramDriven && hover.leftIndex != null && getForcedParamTooltipPos() && (
                  <div className="absolute pointer-events-none z-10"
                    style={{ left: getForcedParamTooltipPos()!.x, top: getForcedParamTooltipPos()!.y }}>
                    <ForcedParamTooltip index={hover.leftIndex} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <span className="w-3 h-3 rounded-sm bg-violet-500 inline-block shrink-0" style={{ opacity: 0.82 }} />
                <span className="text-[11px] text-muted-foreground">Param changes</span>
              </div>
            </div>

          </div>
          )}

          {/* ── V2: unified stacked timeline ── */}
          {version === 2 && (
          <div className="border border-border rounded-lg bg-card p-4">

            {/* Card header */}
            <div className="mb-3">
              <p className="text-[13px] font-semibold text-foreground">Task runs &amp; Key metrics</p>
              <p className="text-[11px] text-muted-foreground">1 year · unified timeline</p>
            </div>

            {/* Y-axis labels strip */}
            <div className="flex text-[10px] text-muted-foreground mb-0.5 pl-7">
              <span className="flex-1 text-cyan-600 font-medium">Duration</span>
              <span className="text-muted-foreground/60">Task runs →</span>
            </div>

            {/* ── Top: Key metrics line ── */}
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={UNIFIED_V2_DATA}
                syncId="v2-timeline"
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                <XAxis dataKey="label" hide={true} />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}h`}
                  domain={[0, 4]} ticks={[0, 1, 2, 3, 4]}
                  width={28}
                />
                {/* Tooltip lives in the top chart — syncId makes it fire for bottom hover too */}
                <Tooltip
                  content={<UnifiedV2Tooltip />}
                  cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                />
                <Line
                  type="monotone" dataKey="duration"
                  stroke="#06b6d4" strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#06b6d4", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Thin divider between chart areas */}
            <div className="mx-7 h-px bg-border/60 -mt-px" />

            {/* ── Bottom: Task runs bars ── */}
            <div ref={paramContainerRef}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart
                  data={UNIFIED_V2_DATA}
                  syncId="v2-timeline"
                  barSize={13}
                  barCategoryGap="20%"
                  margin={{ top: 0, right: 8, left: 0, bottom: 4 }}
                >
                  <PatternDef />
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 25]} ticks={[0, 10, 20]} width={28} />
                  <Tooltip content={() => null} cursor={{ fill: "hsl(var(--muted))", opacity: 0.25 }} />
                  {/* Dashed vertical lines at param-change positions */}
                  {UNIFIED_V2_DATA.map((d, i) => d.paramChanges > 0 && (
                    <ReferenceLine key={i} x={d.label} stroke="#8b5cf6" strokeDasharray="3 3" strokeOpacity={0.45} strokeWidth={1.5} />
                  ))}
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" />
                  <Bar dataKey="retries"   stackId="a" fill={`url(#${PATTERN_ID})`} />
                  <Bar dataKey="failed"    stackId="a" fill="#ef4444" />
                  <Bar dataKey="unknown"   stackId="a" fill="#d1d5db" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Param changes Gantt strip ── */}
            <div className="relative h-9 mt-1">
              {UNIFIED_V2_DATA.map((d, i) => d.paramChanges > 0 && (
                <div key={i} className="absolute -translate-x-1/2 top-0"
                  style={{ left: paramBadgeX(i, 28, 8) }}>
                  <ParamChangeBadge count={d.paramChanges} onClick={() => setSidebarTimeIndex(i)} />
                </div>
              ))}
            </div>

            {/* ── Unified legend ── */}
            <div className="mt-3 flex items-stretch border border-border rounded-lg overflow-hidden text-[11px]">

              {/* Task runs group */}
              <div className="flex items-center gap-1 px-3 py-2 bg-muted/20 shrink-0">
                <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider mr-1.5 shrink-0">Task runs</span>
                {([
                  { color: "#22c55e", label: "Completed",    pattern: false },
                  { color: "#22c55e", label: "With Retries", pattern: true  },
                  { color: "#ef4444", label: "Failed",       pattern: false },
                  { color: "#d1d5db", label: "Unknown",      pattern: false },
                ] as const).map(item => (
                  <div key={item.label} className="flex items-center gap-1.5 px-2 py-1">
                    {item.pattern
                      ? <svg width="11" height="11" className="shrink-0"><rect width="11" height="11" rx="1.5" fill="#22c55e" opacity="0.25"/><circle cx="2.8" cy="2.8" r="1.1" fill="#22c55e"/><circle cx="8.2" cy="8.2" r="1.1" fill="#22c55e"/></svg>
                      : <span className="w-2.5 h-2.5 rounded-sm shrink-0 inline-block" style={{ background: item.color }} />
                    }
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-border shrink-0" />

              {/* Key metrics group */}
              <div className="flex items-center gap-1 px-3 py-2 flex-1">
                <div className="flex items-center gap-1.5 px-2 py-1 mr-1 shrink-0">
                  <span className="w-3.5 h-0.5 bg-cyan-500 rounded inline-block shrink-0" />
                  <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Key metrics</span>
                </div>
                {(["Duration","SLA","vCore Time","vCore Utilization"] as const).map(m => (
                  <button key={m} onClick={() => setActiveMetric(m)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-muted/40 ${activeMetric === m ? "text-cyan-700 font-medium" : "text-muted-foreground"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${activeMetric === m ? "border-cyan-500" : "border-muted-foreground/40"}`}>
                      {activeMetric === m && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />}
                    </span>
                    {m}
                  </button>
                ))}
              </div>

            </div>
          </div>
          )}

          {/* ── V3: truly overlaid — bars + line in one ComposedChart ── */}
          {version === 3 && (
          <div className="border border-border rounded-lg bg-card p-4">

            {/* Card header — title + layer toggles */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] font-semibold text-foreground">Task runs &amp; Key metrics</p>
                <p className="text-[11px] text-muted-foreground">1 year · overlay</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Task runs toggle */}
                <button
                  onClick={() => toggleV3Layer("taskRuns")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    v3Layers.taskRuns
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-muted/20 border-border text-muted-foreground/40 line-through"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" style={{ opacity: v3Layers.taskRuns ? 1 : 0.3 }} />
                  Task runs
                </button>
                {/* Key metrics toggle */}
                <button
                  onClick={() => toggleV3Layer("keyMetrics")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    v3Layers.keyMetrics
                      ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                      : "bg-muted/20 border-border text-muted-foreground/40 line-through"
                  }`}
                >
                  <span className="w-3.5 h-0.5 bg-cyan-500 rounded shrink-0" style={{ opacity: v3Layers.keyMetrics ? 1 : 0.3 }} />
                  Key metrics
                </button>
                {/* Param changes toggle */}
                <button
                  onClick={() => toggleV3Layer("paramChanges")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    v3Layers.paramChanges
                      ? "bg-violet-50 border-violet-300 text-violet-700"
                      : "bg-muted/20 border-border text-muted-foreground/40 line-through"
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="shrink-0" style={{ opacity: v3Layers.paramChanges ? 1 : 0.3 }}>
                    <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor"/>
                    <rect x="7" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                    <rect x="0.5" y="7" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                    <rect x="7" y="7" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.25"/>
                  </svg>
                  Param changes
                </button>
              </div>
            </div>

            {/* Single ComposedChart */}
            <div ref={paramContainerRef}>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={UNIFIED_V2_DATA}
                barSize={13}
                barCategoryGap="20%"
                margin={{ top: 8, right: 36, left: 0, bottom: 4 }}
              >
                <PatternDef />
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  interval={2}
                />
                <YAxis
                  yAxisId="counts"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                  domain={[0, 28]} ticks={[0, 7, 14, 21, 28]}
                  width={24}
                />
                <YAxis
                  yAxisId="metric"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#06b6d4" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={metricCfg.fmt}
                  domain={metricCfg.domain}
                  ticks={metricCfg.ticks}
                  width={36}
                />
                <Tooltip content={renderV3Tooltip} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />

                <Bar yAxisId="counts" dataKey="completed" stackId="a" fill="#22c55e"               fillOpacity={v3BarOp("completed")}      shape={SeamRect} />
                <Bar yAxisId="counts" dataKey="retries"   stackId="a" fill={`url(#${PATTERN_ID})`} fillOpacity={v3BarOp("retries")}        shape={SeamRect} />
                <Bar yAxisId="counts" dataKey="failed"    stackId="a" fill="#ef4444"               fillOpacity={v3BarOp("failed", 0.88)}   shape={SeamRect} />
                <Bar yAxisId="counts" dataKey="unknown"   stackId="a" fill="#d1d5db"               fillOpacity={v3BarOp("unknown")} radius={[2,2,0,0]} />

                <Line
                  key={metricCfg.key}
                  yAxisId="metric"
                  type="monotone"
                  dataKey={metricCfg.key}
                  stroke="#06b6d4" strokeWidth={2}
                  strokeOpacity={v3Layers.keyMetrics && v3Series.line ? 1 : 0}
                  dot={false}
                  activeDot={v3Layers.keyMetrics && v3Series.line ? { r: 4, fill: "#06b6d4", strokeWidth: 0 } : false}
                />

                {/* Dashed vertical lines at param-change positions */}
                {v3Layers.paramChanges && UNIFIED_V2_DATA.map((d, i) => d.paramChanges > 0 && (
                  <ReferenceLine key={i} yAxisId="counts" x={d.label} stroke="#8b5cf6" strokeDasharray="3 3" strokeOpacity={0.45} strokeWidth={1.5} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
            </div>

            {/* ── Param changes Gantt strip ── */}
            {v3Layers.paramChanges && (
            <div className="relative h-9 mt-1 mb-1">
              {UNIFIED_V2_DATA.map((d, i) => d.paramChanges > 0 && (
                <div key={i} className="absolute -translate-x-1/2 top-0"
                  style={{ left: paramBadgeX(i, 24, 72) }}>
                  <ParamChangeBadge count={d.paramChanges} onClick={() => setSidebarTimeIndex(i)} />
                </div>
              ))}
            </div>
            )}

            {/* ── Unified legend ── */}
            <div className="mt-3 flex items-stretch border border-border rounded-lg overflow-hidden text-[11px]">

              {/* Task runs group */}
              <div className={`flex items-center gap-1 px-3 py-2 bg-muted/20 shrink-0 transition-opacity ${v3Layers.taskRuns ? "opacity-100" : "opacity-30"}`}>
                <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider mr-1.5 shrink-0">Task runs</span>
                {([
                  { key: "completed" as const, color: "#22c55e",  label: "Completed",    pattern: false },
                  { key: "retries"   as const, color: "#22c55e",  label: "With Retries", pattern: true  },
                  { key: "failed"    as const, color: "#ef4444",  label: "Failed",       pattern: false },
                  { key: "unknown"   as const, color: "#d1d5db",  label: "Unknown",      pattern: false },
                ]).map(item => (
                  <button
                    key={item.key}
                    onClick={() => toggleV3(item.key)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-muted/40 ${v3Series[item.key] ? "opacity-100" : "opacity-30"}`}
                  >
                    {item.pattern
                      ? <svg width="11" height="11" className="shrink-0"><rect width="11" height="11" rx="1.5" fill="#22c55e" opacity="0.25"/><circle cx="2.8" cy="2.8" r="1.1" fill="#22c55e"/><circle cx="8.2" cy="8.2" r="1.1" fill="#22c55e"/></svg>
                      : <span className="w-2.5 h-2.5 rounded-sm shrink-0 inline-block" style={{ background: item.color }} />
                    }
                    <span className="text-muted-foreground">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-border shrink-0" />

              {/* Key metrics group */}
              <div className={`flex items-center gap-1 px-3 py-2 flex-1 transition-opacity ${v3Layers.keyMetrics ? "opacity-100" : "opacity-30"}`}>
                <button
                  onClick={() => toggleV3("line")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-muted/40 mr-1 shrink-0 ${v3Series.line ? "opacity-100" : "opacity-30"}`}
                >
                  <span className="w-3.5 h-0.5 bg-cyan-500 rounded inline-block shrink-0" />
                  <span className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Key metrics</span>
                </button>
                {(["Duration","SLA","vCore Time","vCore Utilization"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setActiveMetric(m)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-muted/40 ${activeMetric === m ? "text-cyan-700 font-medium" : "text-muted-foreground"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${activeMetric === m ? "border-cyan-500" : "border-muted-foreground/40"}`}>
                      {activeMetric === m && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />}
                    </span>
                    {m}
                  </button>
                ))}
              </div>

            </div>
          </div>
          )}

          {/* ── V4: parameter carpet / heatmap ── */}
          {version === 4 && (() => {
            const maxBar = Math.max(...UNIFIED_V2_DATA.map(d => d.paramChanges));

            // Per-param total changes (for filtering + sorting)
            const paramTotals = V4_PARAMS.map((_, pi) =>
              V4_CARPET[pi].reduce((s, v) => s + v, 0)
            );

            // Build filtered + sorted param index list
            let visibleParamIndices = V4_PARAMS
              .map((p, pi) => ({ p, pi, total: paramTotals[pi] }))
              .filter(({ p, total }) =>
                (!v4Search || p.toLowerCase().includes(v4Search.toLowerCase())) &&
                (!v4ChangedOnly || total > 0)
              );
            if (v4SortByChanges) {
              visibleParamIndices = [...visibleParamIndices].sort((a, b) => b.total - a.total);
            }

            return (
            <div className="border border-border rounded-lg bg-card overflow-hidden">

              {/* ── Header row ── */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
                <div className="shrink-0">
                  <p className="text-[13px] font-semibold text-foreground">Parameter changes</p>
                  <p className="text-[11px] text-muted-foreground">
                    {visibleParamIndices.length} / {V4_PARAMS.length} params · {UNIFIED_V2_DATA.length} runs · 1 year
                  </p>
                </div>
                {/* Color scale */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">fewer</span>
                  <div className="flex rounded overflow-hidden border border-border/50">
                    {[0, 0.1, 0.25, 0.45, 0.65, 0.85, 1.0].map((t, i) => {
                      const sat = Math.round(20 + Math.sqrt(t) * 58);
                      const lit = Math.round(88 - Math.sqrt(t) * 52);
                      return <div key={i} className="w-5 h-3.5"
                        style={{ background: t === 0 ? "hsl(180,10%,96%)" : `hsl(178,${sat}%,${lit}%)` }} />;
                    })}
                  </div>
                  <span className="text-[10px] text-muted-foreground">more</span>
                </div>
              </div>

              {/* ── Filter controls ── */}
              <div className="px-4 py-2.5 border-b border-border bg-muted/10 flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={v4Search}
                    onChange={e => setV4Search(e.target.value)}
                    placeholder="Filter parameters…"
                    className="pl-7 pr-3 py-1.5 text-[11px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 w-52"
                  />
                </div>

                {/* Changed only toggle */}
                <button
                  onClick={() => setV4ChangedOnly(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-all ${
                    v4ChangedOnly
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${v4ChangedOnly ? "bg-teal-500 border-teal-500" : "border-muted-foreground/40"}`}>
                    {v4ChangedOnly && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  Changed only
                </button>

                {/* Sort by changes toggle */}
                <button
                  onClick={() => setV4SortByChanges(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-all ${
                    v4SortByChanges
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                    <path d="M2 3h8M3 6h6M4 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Most changed first
                </button>

                {/* Result count pill */}
                {(v4Search || v4ChangedOnly) && (
                  <span className="text-[10px] text-muted-foreground/60 ml-auto">
                    {visibleParamIndices.length} result{visibleParamIndices.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* ── Body: param labels + carpet ── */}
              <div className="flex overflow-hidden">

                {/* Left: param name column */}
                <div className="shrink-0 w-52 border-r border-border bg-muted/10">
                  <div className="h-[88px] border-b border-border flex items-end px-3 pb-2">
                    <span className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Total changes →</span>
                  </div>
                  <div className="h-10 border-b border-border" />
                  {visibleParamIndices.map(({ p, pi }, row) => (
                    <div key={pi}
                      className="h-7 flex items-center gap-2 px-3 border-b border-border/40 last:border-b-0"
                      style={{ background: row % 2 === 0 ? "transparent" : "hsl(var(--muted)/0.3)" }}
                    >
                      <span className="text-[10px] text-muted-foreground font-mono truncate leading-none flex-1">{p}</span>
                      {paramTotals[pi] > 0 && (
                        <span className="text-[9px] text-teal-600 font-semibold shrink-0">{paramTotals[pi]}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right: carpet */}
                <div className="flex-1 overflow-x-auto">

                  {/* Top bar chart */}
                  <div className="h-[88px] border-b border-border flex items-end gap-px px-px">
                    {UNIFIED_V2_DATA.map((d, ti) => {
                      const barH = maxBar > 0 ? Math.round((d.paramChanges / maxBar) * 64) : 0;
                      return (
                        <div key={ti} className="flex-1 flex flex-col items-center justify-end pb-1 gap-0.5 min-w-[28px]">
                          {d.paramChanges > 0 && (
                            <span className="text-[8px] text-muted-foreground/70 leading-none">{d.paramChanges}</span>
                          )}
                          <div className="w-full rounded-t-sm"
                            style={{ height: barH, background: barH > 0 ? "hsl(178,52%,50%)" : "transparent", minHeight: d.paramChanges > 0 ? 3 : 0 }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Date label row */}
                  <div className="h-10 border-b border-border flex gap-px px-px">
                    {UNIFIED_V2_DATA.map((d, ti) => {
                      const [mo, day] = d.label.replace(", 25", "").split(" ");
                      return (
                        <div key={ti} className="flex-1 flex flex-col items-center justify-center min-w-[28px] gap-0">
                          <span className="text-[8px] text-muted-foreground/50 font-medium leading-tight">{mo}</span>
                          <span className="text-[9px] text-muted-foreground/80 font-semibold leading-tight">{day}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Carpet rows */}
                  {visibleParamIndices.map(({ p, pi }, row) => (
                    <div key={pi}
                      className="flex h-7 border-b border-border/40 last:border-b-0 gap-px px-px"
                      style={{ background: row % 2 === 0 ? "transparent" : "hsl(var(--muted)/0.15)" }}
                    >
                      {UNIFIED_V2_DATA.map((d, ti) => {
                        const count = V4_CARPET[pi][ti];
                        const isHovered = v4Tooltip?.pi === pi && v4Tooltip?.ti === ti;
                        return (
                          <div key={ti}
                            className="flex-1 flex items-center justify-center rounded-sm min-w-[28px] cursor-default transition-all"
                            style={{
                              background: carpetCellBg(count),
                              outline: isHovered ? "2px solid hsl(178,55%,40%)" : "none",
                              outlineOffset: "-1px",
                            }}
                            onMouseEnter={e => {
                              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setV4Tooltip({ pi, ti, x: r.left + r.width / 2, y: r.top });
                            }}
                            onMouseLeave={() => setV4Tooltip(null)}
                          >
                            {count > 0 && (
                              <span className="text-[8px] font-medium leading-none select-none"
                                style={{ color: carpetCellTextColor(count) }}>
                                {count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                </div>
              </div>

              {/* ── Cell hover tooltip (fixed-position so it's never clipped) ── */}
              {v4Tooltip && (() => {
                const { pi, ti } = v4Tooltip;
                const count = V4_CARPET[pi][ti];
                const values = getV4CellValues(pi, ti, count);
                const run = UNIFIED_V2_DATA[ti];
                return (
                  <div
                    className="fixed z-50 pointer-events-none bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left"
                    style={{ left: v4Tooltip.x, top: v4Tooltip.y - 8, transform: "translate(-50%, -100%)", minWidth: 220, maxWidth: 300 }}
                  >
                    <div className="flex">
                      <div className="w-[3px] shrink-0" style={{ background: carpetCellBg(Math.max(count, 1)) }} />
                      <div className="px-3 py-2.5 w-full">
                        {/* Param name */}
                        <p className="text-[11px] font-mono text-foreground font-medium leading-tight mb-1.5 break-all">{V4_PARAMS[pi]}</p>
                        {/* Date + count */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-muted-foreground">{run.label}</span>
                          <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                            {count} change{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {/* Value list */}
                        {values.length > 0 ? (
                          <div className="border-t border-border pt-1.5 flex flex-col gap-1">
                            {values.map((v, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 text-teal-500">
                                  <path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-[11px] font-mono text-foreground truncate">{v}</span>
                              </div>
                            ))}
                            {count > 6 && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">+{count - 6} more…</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground border-t border-border pt-1.5">No changes</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
            );
          })()}

          {/* Table — hidden on v4 (carpet has its own detail layer) */}
          {version !== 4 && <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search in ${TASK_RUNS_TABLE.length} task runs`}
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_0.8fr_40px] px-4 h-10 items-center border-b border-border bg-muted/20">
              {["PIT","Start time","Duration","Transformations","Status","Monitors",""].map((col, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{col}</span>
                  {col === "Start time" && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
                      <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
            {/* Scrollable rows body — syncs with chart hover */}
            <div ref={tableBodyRef} className="overflow-y-auto max-h-[360px]">
              {filteredRuns.map((run, i) => {
                const isActive = hoveredTableIndex === i || directHoverIndex === i;
                return (
                <div
                  key={i}
                  ref={el => { rowRefs.current[i] = el; }}
                  onMouseEnter={() => setDirectHoverIndex(i)}
                  onMouseLeave={() => setDirectHoverIndex(null)}
                  className={`grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_0.8fr_40px] px-4 h-10 items-center border-b border-border last:border-b-0 group transition-colors ${
                    isActive
                      ? "bg-primary/10 border-l-[3px] border-l-primary"
                      : "border-l-[3px] border-l-transparent"
                  }`}
                >
                  <span className={`text-[12px] font-mono truncate ${isActive ? "text-primary font-semibold" : "text-foreground"}`}>{run.pit}</span>
                  <span className="text-[12px] text-muted-foreground">{run.startTime}</span>
                  <span className="text-[12px] text-foreground">{run.duration}</span>
                  <span className="text-[12px] text-muted-foreground/40">—</span>
                  <StatusBadge status={run.status} />
                  <span className="text-[12px] text-muted-foreground/40">—</span>
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted/40 transition-all text-muted-foreground">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
                );
              })}
            </div>
          </div>}

        </div>
      </div>

      {/* ── Param changes sidebar ── */}
      {sidebarTimeIndex != null && (() => {
        const run = UNIFIED_V2_DATA[sidebarTimeIndex];
        const changes = getChangesAtTimePoint(sidebarTimeIndex);
        const filteredChanges = sidebarSearch
          ? changes.filter(c => c.paramName.toLowerCase().includes(sidebarSearch.toLowerCase()))
          : changes;
        const mockRuns = generateMockRuns(9, run.iso);

        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => { setSidebarTimeIndex(null); setSidebarSearch(""); }}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full z-50 w-[420px] bg-background border-l border-border shadow-2xl flex flex-col">

              {/* Header */}
              <div className="px-5 py-4 border-b border-border flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-violet-500 shrink-0">
                      <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor"/>
                      <rect x="7"   y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                      <rect x="0.5" y="7"   width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                      <rect x="7"   y="7"   width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.25"/>
                    </svg>
                    <h2 className="text-[14px] font-semibold text-foreground">Param Changes</h2>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">{run.iso}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {changes.length} param{changes.length !== 1 ? "s" : ""} changed
                    {run.paramChanges > 0 && <> · <span className="text-violet-600 font-medium">{run.paramChanges} total changes</span></>}
                  </p>
                </div>
                <button
                  onClick={() => { setSidebarTimeIndex(null); setSidebarSearch(""); }}
                  className="p-1.5 rounded-md hover:bg-muted/40 text-muted-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-4 py-2.5 border-b border-border shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    placeholder="Search parameters…"
                    className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-400/40"
                  />
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto">

                {/* ── Changed params list ── */}
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
                    Changed parameters
                  </p>

                  {filteredChanges.length === 0 && (
                    <p className="text-[12px] text-muted-foreground py-6 text-center">No matching parameters</p>
                  )}

                  {filteredChanges.map(({ paramName, count, values }) => (
                    <div key={paramName} className="mb-4 last:mb-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-mono text-foreground font-semibold leading-snug break-all">{paramName}</span>
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded shrink-0">
                          {count}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 pl-1 border-l-2 border-teal-100 ml-0.5">
                        {values.map((v, vi) => (
                          <div key={vi} className="flex items-center gap-1.5 py-0.5">
                            <svg width="8" height="8" viewBox="0 0 10 10" className="shrink-0 text-teal-400 ml-1">
                              <path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-[11px] font-mono text-muted-foreground">{v}</span>
                          </div>
                        ))}
                        {count > 6 && (
                          <p className="text-[10px] text-muted-foreground/60 ml-4 mt-0.5">+{count - 6} more…</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mx-4 h-px bg-border my-3" />

                {/* ── Runs timeline ── */}
                <div className="px-4 pb-6">
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
                    Runs around this time
                  </p>

                  <div className="relative">
                    {/* Vertical spine */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

                    {mockRuns.map((r, i) => {
                      const spacerKey = `spacer-${i}`;
                      const isOpen = openSpacers.has(spacerKey);
                      return (
                        <div key={i}>
                          {/* Collapsible spacer between runs */}
                          {i > 0 && (
                            <button
                              onClick={() => toggleSpacer(spacerKey)}
                              className="flex items-center gap-0.5 text-[9px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors mb-1 ml-4"
                            >
                              <ChevronRight className={`w-2.5 h-2.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                              {isOpen ? "collapse" : "gap"}
                            </button>
                          )}

                          {/* Run row */}
                          <div className="flex items-center gap-2.5 mb-2">
                            {/* Status dot on spine */}
                            <div className="relative z-10 shrink-0 flex items-center justify-center w-5 h-5">
                              <RunStatusSquare status={r.status} />
                            </div>
                            {/* PIT */}
                            <span className="text-[11px] font-mono text-foreground flex-1 truncate">{r.pit}</span>
                            {/* Status label */}
                            <span className={`text-[10px] font-medium shrink-0 ${
                              r.status === "success" ? "text-emerald-600" :
                              r.status === "failed"  ? "text-red-500" :
                              r.status === "warning" ? "text-amber-500" :
                              "text-muted-foreground"
                            }`}>
                              {r.status === "success" ? "✓ success" :
                               r.status === "failed"  ? "✕ failed" :
                               r.status === "warning" ? "⚠ warning" : "partial"}
                            </span>
                          </div>

                          {/* Hourglass between runs (shown when spacer is open) */}
                          {isOpen && (
                            <div className="flex items-center gap-2 ml-5 mb-2 text-muted-foreground/40">
                              <Hourglass className="w-2.5 h-2.5" />
                              <span className="text-[9px]">intermediate runs hidden</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </>
        );
      })()}

    </div>
  );
}
