import React, { useState, useRef, useEffect } from "react";
import { Search, MoreVertical, ChevronDown, X, ChevronRight, Hourglass, Info } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine, ReferenceArea,
} from "recharts";

// ── Mock data ────────────────────────────────────────────────────────────────

const TASK_RUNS_DATA = [
  { label: "Jul '24", iso: "2024-07-15T00:00:00", completed: 8,  retries: 1, failed: 0, unknown: 2 },
  { label: "Aug '24", iso: "2024-08-14T00:00:00", completed: 12, retries: 0, failed: 2, unknown: 1 },
  { label: "Sep '24", iso: "2024-09-11T00:00:00", completed: 6,  retries: 2, failed: 0, unknown: 1 },
  { label: "Oct '24", iso: "2024-10-09T00:00:00", completed: 4,  retries: 0, failed: 0, unknown: 2 },
  { label: "Nov '24", iso: "2024-11-13T00:00:00", completed: 9,  retries: 1, failed: 0, unknown: 1 },
  { label: "Dec '24", iso: "2024-12-11T00:00:00", completed: 15, retries: 2, failed: 1, unknown: 2 },
  { label: "Jan '25", iso: "2025-01-08T00:00:00", completed: 11, retries: 0, failed: 0, unknown: 1 },
  { label: "Feb '25", iso: "2025-02-12T00:00:00", completed: 7,  retries: 1, failed: 3, unknown: 0 },
  { label: "Mar '25", iso: "2025-03-12T00:00:00", completed: 13, retries: 0, failed: 0, unknown: 2 },
  { label: "Apr '25", iso: "2025-04-09T00:00:00", completed: 10, retries: 2, failed: 0, unknown: 1 },
  { label: "May '25", iso: "2025-05-07T00:00:00", completed: 8,  retries: 1, failed: 1, unknown: 2 },
  { label: "Jun '25", iso: "2025-06-04T00:00:00", completed: 6,  retries: 0, failed: 0, unknown: 1 },
];

const TASK_RUNS_WEEKLY = (() => {
  const result: { label: string; iso: string; completed: number; retries: number; failed: number; unknown: number }[] = [];
  const start = new Date("2024-07-01T00:00:00");
  let seed = 11111;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  const mult = [0.7,1.0,0.65,0.35,0.85,1.4,0.95,0.65,1.1,0.95,0.85,0.55]; // Jul–Jun shape
  for (let w = 0; w < 52; w++) {
    const date = new Date(start.getTime() + w * 7 * 24 * 3600 * 1000);
    const mo = date.toLocaleString("en-US", { month: "short" });
    const label = `${mo} ${date.getDate()}`;
    const iso = date.toISOString().slice(0, 19);
    const m = mult[Math.min(Math.floor(w / (52/12)), 11)];
    result.push({
      label, iso,
      completed: Math.max(0, Math.round(m * 3 + rng() * m * 2)),
      retries:   rng() < 0.2 * m ? 1 : 0,
      failed:    rng() < 0.12 * m ? 1 : 0,
      unknown:   rng() < 0.25 ? 1 : 0,
    });
  }
  return result;
})();

const TASK_RUNS_DAILY = (() => {
  const result: { label: string; iso: string; completed: number; retries: number; failed: number; unknown: number }[] = [];
  const start = new Date("2024-07-01T00:00:00");
  let seed = 22222;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  const mult = [0.7,1.0,0.65,0.35,0.85,1.4,0.95,0.65,1.1,0.95,0.85,0.55];
  for (let d = 0; d < 365; d++) {
    const date = new Date(start.getTime() + d * 24 * 3600 * 1000);
    const mo = date.toLocaleString("en-US", { month: "short" });
    const label = `${mo} ${date.getDate()}`;
    const iso = date.toISOString().slice(0, 19);
    const m = mult[Math.min(Math.floor(d / (365/12)), 11)];
    const active = rng() < (0.35 + 0.4 * m);
    result.push({
      label, iso,
      completed: active ? (rng() < 0.7 ? 1 : 2) : 0,
      retries:   active && rng() < 0.10 ? 1 : 0,
      failed:    active && rng() < 0.08 * m ? 1 : 0,
      unknown:   active && rng() < 0.12 ? 1 : 0,
    });
  }
  return result;
})();

// prettier-ignore
const KEY_METRICS_DATA: { label: string; iso: string; duration: number; sla: number; vcoreTime: number; vcoreUtil: number }[] = [
  // Jul 2024 — FLAT LOW (3 pts, big gaps). Calm baseline, barely moves.
  { label: "Jul 4",  iso: "2024-07-04T06:14:00", duration: 0.90, sla: 92, vcoreTime: 5.0, vcoreUtil: 38 },
  { label: "Jul 14", iso: "2024-07-14T17:22:00", duration: 0.85, sla: 93, vcoreTime: 4.8, vcoreUtil: 36 },
  { label: "Jul 28", iso: "2024-07-28T04:48:00", duration: 0.95, sla: 91, vcoreTime: 5.2, vcoreUtil: 40 },
  // Aug 2024 — VARIED: ramps up fast, spike, recovery (7 pts)
  { label: "Aug 2",  iso: "2024-08-02T11:30:00", duration: 1.40, sla: 84, vcoreTime:  8.5, vcoreUtil: 58 },
  { label: "Aug 3",  iso: "2024-08-03T22:17:00", duration: 2.10, sla: 77, vcoreTime: 10.5, vcoreUtil: 65 },
  { label: "Aug 12", iso: "2024-08-12T22:55:00", duration: 3.40, sla: 63, vcoreTime: 15.8, vcoreUtil: 81 },
  { label: "Aug 13", iso: "2024-08-13T09:44:00", duration: 1.95, sla: 69, vcoreTime: 11.2, vcoreUtil: 73 },
  { label: "Aug 19", iso: "2024-08-19T05:01:00", duration: 2.50, sla: 74, vcoreTime: 12.0, vcoreUtil: 69 },
  { label: "Aug 26", iso: "2024-08-26T16:38:00", duration: 1.80, sla: 78, vcoreTime:  9.8, vcoreUtil: 63 },
  { label: "Aug 30", iso: "2024-08-30T09:14:00", duration: 1.30, sla: 82, vcoreTime:  8.2, vcoreUtil: 59 },
  // Sep 2024 — spike then FLAT quiet (5 pts)
  { label: "Sep 2",  iso: "2024-09-02T04:30:00", duration: 1.20, sla: 83, vcoreTime:  7.8, vcoreUtil: 57 },
  { label: "Sep 4",  iso: "2024-09-04T19:55:00", duration: 3.80, sla: 57, vcoreTime: 16.5, vcoreUtil: 86 },
  { label: "Sep 17", iso: "2024-09-17T08:22:00", duration: 0.88, sla: 92, vcoreTime:  5.0, vcoreUtil: 37 },
  { label: "Sep 22", iso: "2024-09-22T06:18:00", duration: 0.92, sla: 91, vcoreTime:  5.2, vcoreUtil: 39 },
  { label: "Sep 28", iso: "2024-09-28T14:05:00", duration: 0.85, sla: 93, vcoreTime:  4.8, vcoreUtil: 36 },
  // Oct 2024 — FLAT DEAD CALM (3 pts, 11–12 day gaps). Barely a pulse.
  { label: "Oct 6",  iso: "2024-10-06T10:44:00", duration: 0.52, sla: 95, vcoreTime:  3.8, vcoreUtil: 28 },
  { label: "Oct 18", iso: "2024-10-18T23:07:00", duration: 0.55, sla: 94, vcoreTime:  4.0, vcoreUtil: 30 },
  { label: "Oct 29", iso: "2024-10-29T14:31:00", duration: 0.50, sla: 95, vcoreTime:  3.7, vcoreUtil: 27 },
  // Nov 2024 — VARIED: climbs steadily through the month (7 pts)
  { label: "Nov 2",  iso: "2024-11-02T03:15:00", duration: 1.10, sla: 88, vcoreTime:  7.0, vcoreUtil: 50 },
  { label: "Nov 3",  iso: "2024-11-03T16:42:00", duration: 1.90, sla: 82, vcoreTime:  9.5, vcoreUtil: 59 },
  { label: "Nov 8",  iso: "2024-11-08T07:28:00", duration: 1.50, sla: 80, vcoreTime: 10.2, vcoreUtil: 62 },
  { label: "Nov 11", iso: "2024-11-11T22:05:00", duration: 2.60, sla: 73, vcoreTime: 12.5, vcoreUtil: 70 },
  { label: "Nov 18", iso: "2024-11-18T12:37:00", duration: 2.20, sla: 76, vcoreTime: 11.8, vcoreUtil: 67 },
  { label: "Nov 25", iso: "2024-11-25T04:19:00", duration: 2.90, sla: 69, vcoreTime: 13.5, vcoreUtil: 74 },
  { label: "Nov 29", iso: "2024-11-29T17:54:00", duration: 3.10, sla: 66, vcoreTime: 14.2, vcoreUtil: 77 },
  // Dec 2024 — VARIED peak (10 pts, dense). Wild swings at high level.
  { label: "Dec 2",  iso: "2024-12-02T01:07:00", duration: 3.20, sla: 65, vcoreTime: 15.5, vcoreUtil: 80 },
  { label: "Dec 4",  iso: "2024-12-04T14:38:00", duration: 2.70, sla: 69, vcoreTime: 13.8, vcoreUtil: 76 },
  { label: "Dec 5",  iso: "2024-12-05T06:22:00", duration: 3.70, sla: 61, vcoreTime: 17.5, vcoreUtil: 89 },
  { label: "Dec 9",  iso: "2024-12-09T19:45:00", duration: 2.40, sla: 71, vcoreTime: 13.0, vcoreUtil: 74 },
  { label: "Dec 11", iso: "2024-12-11T10:14:00", duration: 3.90, sla: 56, vcoreTime: 18.5, vcoreUtil: 93 },
  { label: "Dec 12", iso: "2024-12-12T03:57:00", duration: 3.30, sla: 62, vcoreTime: 16.2, vcoreUtil: 88 },
  { label: "Dec 17", iso: "2024-12-17T22:08:00", duration: 2.80, sla: 68, vcoreTime: 14.5, vcoreUtil: 82 },
  { label: "Dec 21", iso: "2024-12-21T11:30:00", duration: 3.60, sla: 60, vcoreTime: 17.0, vcoreUtil: 91 },
  { label: "Dec 26", iso: "2024-12-26T05:44:00", duration: 3.00, sla: 67, vcoreTime: 15.2, vcoreUtil: 84 },
  { label: "Dec 30", iso: "2024-12-30T18:22:00", duration: 3.50, sla: 62, vcoreTime: 16.8, vcoreUtil: 87 },
  // Jan 2025 — FLAT gentle plateau (5 pts). Post-peak normalisation, barely drifts.
  { label: "Jan 3",  iso: "2025-01-03T08:15:00", duration: 1.75, sla: 85, vcoreTime:  8.8, vcoreUtil: 56 },
  { label: "Jan 9",  iso: "2025-01-09T23:40:00", duration: 1.70, sla: 86, vcoreTime:  8.5, vcoreUtil: 55 },
  { label: "Jan 15", iso: "2025-01-15T13:07:00", duration: 1.80, sla: 84, vcoreTime:  9.0, vcoreUtil: 57 },
  { label: "Jan 22", iso: "2025-01-22T04:52:00", duration: 1.72, sla: 85, vcoreTime:  8.6, vcoreUtil: 55 },
  { label: "Jan 28", iso: "2025-01-28T18:28:00", duration: 1.78, sla: 84, vcoreTime:  8.9, vcoreUtil: 56 },
  // Feb 2025 — FLAT with single sharp spike anomaly (4 pts)
  { label: "Feb 4",  iso: "2025-02-04T05:44:00", duration: 0.82, sla: 93, vcoreTime:  5.0, vcoreUtil: 38 },
  { label: "Feb 12", iso: "2025-02-12T02:07:00", duration: 3.40, sla: 59, vcoreTime: 16.0, vcoreUtil: 84 },
  { label: "Feb 14", iso: "2025-02-14T17:44:00", duration: 0.88, sla: 92, vcoreTime:  5.2, vcoreUtil: 40 },
  { label: "Feb 27", iso: "2025-02-27T14:39:00", duration: 0.80, sla: 93, vcoreTime:  4.8, vcoreUtil: 37 },
  // Mar 2025 — FLAT medium band (8 pts). Consistent workload, nearly horizontal.
  { label: "Mar 3",  iso: "2025-03-03T07:11:00", duration: 1.45, sla: 87, vcoreTime:  8.0, vcoreUtil: 54 },
  { label: "Mar 4",  iso: "2025-03-04T22:48:00", duration: 1.50, sla: 86, vcoreTime:  8.2, vcoreUtil: 55 },
  { label: "Mar 9",  iso: "2025-03-09T14:25:00", duration: 1.42, sla: 87, vcoreTime:  7.9, vcoreUtil: 53 },
  { label: "Mar 14", iso: "2025-03-14T05:02:00", duration: 1.55, sla: 85, vcoreTime:  8.5, vcoreUtil: 56 },
  { label: "Mar 19", iso: "2025-03-19T19:37:00", duration: 1.48, sla: 86, vcoreTime:  8.1, vcoreUtil: 54 },
  { label: "Mar 24", iso: "2025-03-24T10:14:00", duration: 1.52, sla: 86, vcoreTime:  8.3, vcoreUtil: 55 },
  { label: "Mar 27", iso: "2025-03-27T01:48:00", duration: 1.45, sla: 87, vcoreTime:  8.0, vcoreUtil: 54 },
  { label: "Mar 30", iso: "2025-03-30T16:22:00", duration: 1.50, sla: 86, vcoreTime:  8.2, vcoreUtil: 55 },
  // Apr 2025 — VARIED: ramps up with wide swings (6 pts)
  { label: "Apr 1",  iso: "2025-04-01T08:55:00", duration: 1.90, sla: 81, vcoreTime: 10.0, vcoreUtil: 63 },
  { label: "Apr 8",  iso: "2025-04-08T01:30:00", duration: 2.60, sla: 73, vcoreTime: 13.0, vcoreUtil: 72 },
  { label: "Apr 9",  iso: "2025-04-09T17:44:00", duration: 1.55, sla: 80, vcoreTime: 10.5, vcoreUtil: 64 },
  { label: "Apr 16", iso: "2025-04-16T09:18:00", duration: 3.20, sla: 66, vcoreTime: 15.5, vcoreUtil: 82 },
  { label: "Apr 24", iso: "2025-04-24T23:55:00", duration: 2.80, sla: 70, vcoreTime: 13.8, vcoreUtil: 77 },
  { label: "Apr 28", iso: "2025-04-28T14:07:00", duration: 2.10, sla: 77, vcoreTime: 11.5, vcoreUtil: 68 },
  // May 2025 — CHAOTIC (11 pts). Extreme swings every 1–3 days.
  { label: "May 1",  iso: "2025-05-01T04:22:00", duration: 0.65, sla: 91, vcoreTime:  5.0, vcoreUtil: 42 },
  { label: "May 2",  iso: "2025-05-02T19:07:00", duration: 3.50, sla: 58, vcoreTime: 17.0, vcoreUtil: 89 },
  { label: "May 7",  iso: "2025-05-07T10:44:00", duration: 0.75, sla: 90, vcoreTime:  5.5, vcoreUtil: 44 },
  { label: "May 8",  iso: "2025-05-08T02:18:00", duration: 3.10, sla: 63, vcoreTime: 15.2, vcoreUtil: 84 },
  { label: "May 11", iso: "2025-05-11T17:55:00", duration: 0.55, sla: 93, vcoreTime:  4.5, vcoreUtil: 39 },
  { label: "May 14", iso: "2025-05-14T08:33:00", duration: 3.70, sla: 57, vcoreTime: 17.8, vcoreUtil: 92 },
  { label: "May 17", iso: "2025-05-17T23:07:00", duration: 1.10, sla: 87, vcoreTime:  7.8, vcoreUtil: 55 },
  { label: "May 20", iso: "2025-05-20T13:44:00", duration: 2.80, sla: 68, vcoreTime: 14.0, vcoreUtil: 78 },
  { label: "May 23", iso: "2025-05-23T05:18:00", duration: 0.60, sla: 92, vcoreTime:  4.8, vcoreUtil: 40 },
  { label: "May 27", iso: "2025-05-27T20:52:00", duration: 3.90, sla: 56, vcoreTime: 18.0, vcoreUtil: 93 },
  { label: "May 30", iso: "2025-05-30T11:29:00", duration: 1.80, sla: 79, vcoreTime: 10.2, vcoreUtil: 64 },
  // Jun 2025 — FLAT settling (5 pts). Things quiet back down.
  { label: "Jun 2",  iso: "2025-06-02T12:07:00", duration: 1.05, sla: 90, vcoreTime:  6.5, vcoreUtil: 48 },
  { label: "Jun 9",  iso: "2025-06-09T03:40:00", duration: 1.10, sla: 89, vcoreTime:  6.8, vcoreUtil: 50 },
  { label: "Jun 14", iso: "2025-06-14T18:14:00", duration: 1.00, sla: 91, vcoreTime:  6.3, vcoreUtil: 47 },
  { label: "Jun 21", iso: "2025-06-21T09:48:00", duration: 1.08, sla: 90, vcoreTime:  6.6, vcoreUtil: 49 },
  { label: "Jun 26", iso: "2025-06-26T20:03:00", duration: 1.02, sla: 90, vcoreTime:  6.4, vcoreUtil: 48 },
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

  return rows.sort((a, b) => a.pit.localeCompare(b.pit)); // ascending = oldest first, matches chart left→right
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

  // vCore Time (vCore-hours): scales with run COUNT, independent of duration
  // Shape follows task volume — peaks around index 9-13 (the busy mid-period)
  const vcoreTime = Math.round(Math.max(0.5,
    bar.completed * 0.42 + bar.retries * 0.60 + bar.failed * 0.30
    + Math.sin(i * 1.3 + 1.5) * 1.8
    + 0.8
  ) * 10) / 10;

  // vCore Utilization %: slow arch — low at start, peaks mid-series, low again
  // Completely independent oscillation from both duration and vcoreTime
  const vcoreUtil = Math.round(
    Math.min(92, Math.max(18,
      60 - Math.cos(i * (Math.PI / 6)) * 28   // full arch over the 12-pt span
      + Math.sin(i * 0.7 + 0.8) * 8
      + (bar.failed >= 3 ? -12 : 0)
    ))
  );

  // Param changes: most runs have them, counts in the 5–500 range
  const PARAM_CHANGE_COUNTS: Record<number,number> = {
    0: 47, 1: 183, 2: 64, 3: 8,
    4: 291, 5: 37, 6: 500,
    7: 128, 8: 215, 9: 412,
    10: 88, 11: 54,
  };
  const paramChanges = PARAM_CHANGE_COUNTS[i] ?? 0;

  // AAA: fake throughput-like signal (0–95)
  const aaa = Math.round(Math.max(5, Math.min(95,
    55 + Math.sin(i * 0.85) * 22 + Math.sin(i * 2.3) * 8
    + (bar.failed >= 3 ? -25 : 0)
  )));
  // BBB: fake error-rate-like signal (0–10)
  const bbb = Math.round(Math.max(0,
    3.2 + Math.sin(i * 1.4 + 0.5) * 2.4 + (bar.failed >= 3 ? 3.8 : 0)
  ) * 10) / 10;

  return { ...bar, duration, sla, vcoreTime, vcoreUtil, paramChanges, aaa, bbb };
});

// Pre-build paramChanges lookup for table rows
// Maps each row's pit → { count, ti } where ti is the UNIFIED_V2_DATA index
const PARAM_CHANGES_BY_PIT: Map<string, { count: number; ti: number }> = (() => {
  const map = new Map<string, { count: number; ti: number }>();
  const u2 = UNIFIED_V2_DATA.map((d, ti) => ({ ms: new Date(d.iso).getTime(), paramChanges: d.paramChanges, ti }));
  TASK_RUNS_TABLE.forEach(row => {
    const rowMs = new Date(row.pit).getTime();
    let best = u2[0], bestDiff = Math.abs(u2[0].ms - rowMs);
    for (const u of u2) {
      const diff = Math.abs(u.ms - rowMs);
      if (diff < bestDiff) { best = u; bestDiff = diff; }
    }
    // Only assign if within ~3 days of nearest UNIFIED_V2_DATA point; else 0
    map.set(row.pit, { count: bestDiff < 3 * 24 * 3600 * 1000 ? best.paramChanges : 0, ti: best.ti });
  });
  return map;
})();

// ── V1 unified dataset — single source of truth for left bars, right dots, table rows ──
// One entry = one task run. Left chart aggregates these. Right chart plots one dot each.
// Table shows one row each. All three are always in sync.
const V1_RUNS = (() => {
  let seed = 55555;
  const rng = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  // Three active bursts separated by long empty gaps — creates the flat-line visual
  // Days are chaotic: tight clusters, odd jumps, uneven rhythm
  const cfg: { y:number; m:number; fr:number; ur:number; d:number[] }[] = [
    // ── BURST 1: Jul–Aug ──────────────────────────────────────────────────────
    { y:2024, m:7,  fr:0.10, ur:0.15, d:[1, 2, 4, 5, 14, 15, 24, 29, 30]  },
    { y:2024, m:8,  fr:0.12, ur:0.10, d:[3, 4, 5, 11, 18, 19, 20, 28, 31]  },
    // ── GAP: Sep · Oct · Nov (3 months empty) ────────────────────────────────
    { y:2024, m:9,  fr:0.08, ur:0.12, d:[8, 21]                             },
    { y:2024, m:10, fr:0.05, ur:0.18, d:[3, 17]                            },
    { y:2024, m:11, fr:0.10, ur:0.10, d:[6, 19, 28]                        },
    // ── BURST 2: Dec–Feb ──────────────────────────────────────────────────────
    { y:2024, m:12, fr:0.15, ur:0.08, d:[1, 2, 7, 8, 9, 16, 23, 24, 30]   },
    { y:2025, m:1,  fr:0.05, ur:0.10, d:[4, 5, 6, 13, 20, 21, 27, 28, 31] },
    { y:2025, m:2,  fr:0.20, ur:0.05, d:[1, 3, 9, 10, 17, 22, 23]         },
    // ── GAP: Mar · Apr (2 months empty) ──────────────────────────────────────
    { y:2025, m:3,  fr:0.08, ur:0.08, d:[5, 22]                             },
    { y:2025, m:4,  fr:0.10, ur:0.12, d:[11, 25]                           },
    // ── BURST 3: May–Jun ──────────────────────────────────────────────────────
    { y:2025, m:5,  fr:0.18, ur:0.10, d:[2, 3, 8, 9, 16, 17, 18, 27, 30]  },
    { y:2025, m:6,  fr:0.05, ur:0.15, d:[1, 6, 7, 14, 20, 21, 28]         },
  ];
  const runs: {
    pit: string; iso: string; label: string; startTime: string;
    status: string; duration: number; sla: number; vcoreTime: number; vcoreUtil: number; paramChanges: number;
  }[] = [];
  cfg.forEach(({ y, m, fr, ur, d: days }) => {
    days.forEach(day => {
      const h   = Math.floor(rng() * 24);
      const min = Math.floor(rng() * 60);
      const dt  = new Date(y, m - 1, day, h, min);
      const pit = dt.toISOString().slice(0, 19);
      const mo  = dt.toLocaleString('en-US', { month: 'short' });
      const yr  = String(dt.getFullYear()).slice(2);
      const r   = rng();
      const status = r < fr ? 'Failed' : r < fr + ur ? 'Unknown' : 'Completed';
      // Very chaotic: 30% big spike, 30% deep dip, 40% wild middle
      const roll = rng();
      const mins = status === 'Failed'
        ? 3 + Math.round(rng() * 25)
        : roll < 0.30 ? 180 + Math.round(rng() * 240)   // big spike: 3–7h
        : roll < 0.60 ?   2 + Math.round(rng() * 12)    // deep dip: 2–14 min
        :                 25 + Math.round(rng() * 130);  // wild middle: 25–155 min
      const dur        = mins / 60;
      const sla        = status === 'Failed' ? Math.round(40 + rng() * 30)
                       : roll < 0.30        ? Math.round(42 + rng() * 22)  // spike → very low SLA
                       : roll < 0.60        ? Math.round(88 + rng() * 11)  // dip → high SLA
                       :                      Math.round(58 + rng() * 38); // wild spread
      const vcoreTime  = Math.round(dur * (2.0 + rng() * 5.0) * 10) / 10;
      const vcoreUtil  = roll < 0.30 ? Math.round(78 + rng() * 20)        // spike → very high
                       : roll < 0.60 ? Math.round(5  + rng() * 18)        // dip → very low
                       :               Math.round(20 + rng() * 72);       // wild spread
      const paramChanges = rng() < 0.45 ? Math.round(Math.pow(rng(), 0.6) * 460 + 4) : 0;
      runs.push({ pit, iso: pit, label: `${mo} ${day}`, startTime: `${mo} ${day} ${yr}`, status, duration: dur, sla, vcoreTime, vcoreUtil, paramChanges });
    });
  });
  return runs.sort((a, b) => a.pit.localeCompare(b.pit));
})();

// Aggregate V1_RUNS into bar-chart buckets for a given granularity
type V1Bar = { label: string; iso: string; completed: number; retries: number; failed: number; unknown: number };
function aggregateV1Bars(granularity: 'month' | 'week' | 'day'): V1Bar[] {
  const map = new Map<string, V1Bar>();

  // Pre-seed all 12 months so empty months still render as zero-height bars
  if (granularity === 'month') {
    [[2024,7],[2024,8],[2024,9],[2024,10],[2024,11],[2024,12],
     [2025,1],[2025,2],[2025,3],[2025,4],[2025,5],[2025,6]].forEach(([y,m]) => {
      const key = `${y}-${String(m).padStart(2,'0')}`;
      const dt  = new Date(y, m - 1, 15);
      const lbl = `${dt.toLocaleString('en-US',{month:'short'})} '${String(y).slice(2)}`;
      map.set(key, { label: lbl, iso: `${key}-15T00:00:00`, completed:0, retries:0, failed:0, unknown:0 });
    });
  }

  V1_RUNS.forEach(run => {
    const dt = new Date(run.pit);
    let key: string, label: string, iso: string;
    if (granularity === 'month') {
      key   = run.pit.slice(0, 7);
      label = `${dt.toLocaleString('en-US',{month:'short'})} '${String(dt.getFullYear()).slice(2)}`;
      iso   = `${key}-15T00:00:00`;
    } else if (granularity === 'week') {
      const wd = new Date(dt); wd.setDate(dt.getDate() - (dt.getDay() === 0 ? 6 : dt.getDay() - 1));
      key   = wd.toISOString().slice(0, 10);
      label = `${wd.toLocaleString('en-US',{month:'short'})} ${wd.getDate()}`;
      iso   = wd.toISOString().slice(0, 19);
    } else {
      key   = run.pit.slice(0, 10);
      label = `${dt.toLocaleString('en-US',{month:'short'})} ${dt.getDate()}`;
      iso   = `${key}T12:00:00`;
    }
    if (!map.has(key)) map.set(key, { label, iso, completed:0, retries:0, failed:0, unknown:0 });
    const b = map.get(key)!;
    if (run.status === 'Completed') b.completed++;
    else if (run.status === 'Failed') b.failed++;
    else b.unknown++;
  });
  return Array.from(map.values()).sort((a, b) => a.iso.localeCompare(b.iso));
}

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

// Returns all KEY_METRICS_DATA indices whose month matches the hovered bar
function findRightIndicesForDay(leftIndex: number): number[] {
  const monthPrefix = TASK_RUNS_DATA[leftIndex]?.iso.slice(0, 7); // "2024-07"
  if (!monthPrefix) return [];
  return KEY_METRICS_DATA.reduce<number[]>((acc, p, i) => {
    if (p.iso.startsWith(monthPrefix)) acc.push(i);
    return acc;
  }, []);
}

function findRightIndicesForBar(barIso: string, granularity: 'month' | 'week' | 'day'): number[] {
  if (!barIso) return [];
  if (granularity === 'month') {
    const p = barIso.slice(0, 7);
    return V1_RUNS.reduce<number[]>((acc, r, i) => { if (r.pit.startsWith(p)) acc.push(i); return acc; }, []);
  }
  if (granularity === 'week') {
    const s = new Date(barIso).getTime(), e = s + 7 * 24 * 3600 * 1000;
    return V1_RUNS.reduce<number[]>((acc, r, i) => {
      const t = new Date(r.pit).getTime(); if (t >= s && t < e) acc.push(i); return acc;
    }, []);
  }
  const p = barIso.slice(0, 10);
  return V1_RUNS.reduce<number[]>((acc, r, i) => { if (r.pit.startsWith(p)) acc.push(i); return acc; }, []);
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
function ForcedBarTooltip({ data }: { data?: V1Bar & { iso: string } }) {
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
  const duration: number = point.payload.duration ?? point.value;
  const pcCount: number = point.payload.paramChanges ?? 0;
  return (
    <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden text-left">
      <div className="flex">
        <div className="w-[3px] bg-cyan-500 shrink-0" />
        <div className="px-3 py-2.5 min-w-[140px]">
          <p className="text-[15px] font-semibold text-foreground leading-tight">{formatDuration(duration)}</p>
          {pcCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" className="text-violet-400 shrink-0">
                <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor"/>
                <rect x="7" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                <rect x="0.5" y="7" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                <rect x="7" y="7" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.25"/>
              </svg>
              <span className="text-[12px] text-violet-600 font-medium">{pcCount} param changes</span>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5 font-mono border-t border-border pt-1.5">{iso}</p>
        </div>
      </div>
    </div>
  );
}

// Forced tooltip for line chart when driven by left hover
function ForcedLineTooltip({ data }: { data?: { duration: number; iso: string } }) {
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

function ParamChangeBadge({ count, onClick, highlighted }: { count: number; onClick?: () => void; highlighted?: boolean }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap select-none shadow-sm transition-colors cursor-pointer ${highlighted ? "bg-violet-200 border-violet-400 text-violet-800 scale-110" : "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100"}`}>
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

// Build a per-param change timeline for the sidebar drill-down view
function generateParamTimeline(paramName: string, currentTi: number): {
  pit: string; date: string; value: string; isCurrent?: boolean; runsAfter?: number; status?: RunStatus;
}[] {
  const pi = V4_PARAMS.indexOf(paramName);
  if (pi === -1) return [];
  const pool = V4_PARAM_VALUE_POOLS[paramName] ?? ["—"];
  const statusCycle: RunStatus[] = ["success","success","success","warning","success","success","failed","success"];
  const changeTis: number[] = [];
  for (let ti = currentTi; ti >= 0 && changeTis.length < 12; ti--) {
    if (V4_CARPET[pi][ti] > 0 || ti === currentTi) changeTis.push(ti);
  }
  return changeTis.map((ti, i) => {
    const d = UNIFIED_V2_DATA[ti];
    let s = (pi * 73 + ti * 37 + 9001) | 0;
    s = ((s * 1664525 + 1013904223) & 0x7fffffff);
    const value = pool[s % pool.length];
    const prevTi = changeTis[i + 1];
    const runsAfter = prevTi !== undefined ? Math.max(1, Math.round((ti - prevTi) / 2)) : undefined;
    return { pit: d.iso, date: d.label, value, isCurrent: ti === currentTi, runsAfter, status: statusCycle[(pi + ti) % statusCycle.length] };
  });
}

// ── Stacked-bar seam fix ──────────────────────────────────────────────────────
// Extend each segment 1px upward (y-1) so it bleeds into the gap above it.
// The next segment renders on top and covers the bleed — no visible artifacts.
function SeamRect(props: any) {
  const { x, y, width, height, fill, fillOpacity } = props;
  if (!height || height <= 0) return <g />;
  return <rect x={x} y={y - 1} width={width} height={height + 2} fill={fill} fillOpacity={fillOpacity ?? 1} />;
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
    <span className="inline-flex items-center gap-1 px-1.5 py-px rounded border border-red-200 bg-red-50 text-[11px] font-medium text-red-600 whitespace-nowrap w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />Failed
    </span>
  );
  if (status === "Unknown") return (
    <span className="inline-flex items-center gap-1 px-1.5 py-px rounded border border-gray-200 bg-gray-50 text-[11px] font-medium text-gray-500 whitespace-nowrap w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />Unknown
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-px rounded border border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700 whitespace-nowrap w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Completed
    </span>
  );
}

// ── V3 metric catalog ─────────────────────────────────────────────────────────
type V3MetricDef = {
  id: string; label: string; color: string; unit: string;
  type: "bar-stacked" | "bar-single" | "line" | "gantt";
  dataKey?: string;
  domain?: [number, number]; ticks?: number[];
  fmt?: (v: number) => string;
};

const V3_METRIC_CATALOG: V3MetricDef[] = [
  { id: "taskRuns",     label: "Task runs",     color: "#22c55e", unit: "runs",  type: "bar-stacked" },
  { id: "duration",     label: "Duration",      color: "#06b6d4", unit: "h",     type: "line",       dataKey: "duration",     domain: [0, 4],    ticks: [0,1,2,3,4],       fmt: v => formatDuration(v) },
  { id: "sla",          label: "SLA",           color: "#f59e0b", unit: "%",     type: "line",       dataKey: "sla",          domain: [50, 100], ticks: [50,65,80,95],     fmt: v => `${v}%` },
  { id: "vcoreTime",    label: "vCore Time",    color: "#8b5cf6", unit: "vC·h",  type: "line",       dataKey: "vcoreTime",    domain: [0, 25],   ticks: [0,5,10,20,25],   fmt: v => String(v) },
  { id: "vcoreUtil",    label: "vCore Util",    color: "#ec4899", unit: "%",     type: "line",       dataKey: "vcoreUtil",    domain: [0, 100],  ticks: [0,25,50,75,100], fmt: v => `${v}%` },
  { id: "paramChanges", label: "Param changes", color: "#8b5cf6", unit: "chg",   type: "gantt",      dataKey: "paramChanges" },
  { id: "aaa",          label: "AAA",           color: "#f97316", unit: "aaa",   type: "line",       dataKey: "aaa",          domain: [0, 100],  ticks: [0,25,50,75,100], fmt: v => String(v) },
  { id: "bbb",          label: "BBB",           color: "#14b8a6", unit: "bbb",   type: "line",       dataKey: "bbb",          domain: [0, 10],   ticks: [0,2,4,6,8,10],   fmt: v => v.toFixed(1) },
];

// ── PanBar scrollbar ──────────────────────────────────────────────────────────

function PanBar({ zoom, setZoom }: { zoom: [number,number]; setZoom: (z:[number,number]) => void }) {
  const range = zoom[1] - zoom[0];
  if (range >= 0.999) return null;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ on: boolean; startX: number; startZoom: [number,number] }>({ on: false, startX: 0, startZoom: [0,1] });
  const thumbLeft = zoom[0] * 100;       // % position
  const thumbWidth = range * 100;        // % width
  function onThumbDown(e: React.PointerEvent) {
    e.stopPropagation();
    dragRef.current = { on: true, startX: e.clientX, startZoom: zoom };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onThumbMove(e: React.PointerEvent) {
    if (!dragRef.current.on || !trackRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) / trackRef.current.clientWidth;
    const newStart = Math.max(0, Math.min(1 - range, dragRef.current.startZoom[0] + dx));
    setZoom([newStart, newStart + range]);
  }
  function onThumbUp() { dragRef.current.on = false; }
  function onTrackClick(e: React.MouseEvent) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newStart = Math.max(0, Math.min(1 - range, ratio - range / 2));
    setZoom([newStart, newStart + range]);
  }
  return (
    <div ref={trackRef} className="relative w-full h-[5px] bg-muted/40 rounded-full mt-1.5 cursor-pointer select-none" onClick={onTrackClick}>
      <div
        className="absolute h-full bg-muted-foreground/35 hover:bg-muted-foreground/55 rounded-full cursor-grab active:cursor-grabbing transition-colors"
        style={{ left: `${thumbLeft}%`, width: `${thumbWidth}%` }}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type HoverState = {
  source: 'left' | 'right' | 'param' | null;
  leftIndex: number | null;   // also used as paramIndex (same 19-pt dataset)
  rightIndex: number | null;
};

export function OverviewPage({ version = 1, showParamChanges = false }: { version?: 1 | 2 | 3 | 4 | 5; showParamChanges?: boolean }) {
  const [activeTab, setActiveTab]     = useState<"OVERVIEW"|"METRICS"|"COST"|"PERFORMANCE">("OVERVIEW");
  const [activeMetric, setActiveMetric] = useState<"Duration"|"SLA"|"vCore Time"|"vCore Utilization">("vCore Time");
  const [search, setSearch]           = useState("");
  const [hover, setHover]             = useState<HoverState>({ source: null, leftIndex: null, rightIndex: null });

  // Param changes sidebar (opened by clicking a Gantt badge)
  const [sidebarTimeIndex, setSidebarTimeIndex]   = useState<number | null>(null);
  const [sidebarSearch, setSidebarSearch]         = useState("");
  const [openSpacers, setOpenSpacers]             = useState<Set<string>>(new Set());
  const [selectedSidebarParam, setSelectedSidebarParam] = useState<string | null>(null);
  const [sidebarDistinctOpen, setSidebarDistinctOpen]   = useState(false);
  const sidebarDistinctRef = useRef<HTMLDivElement>(null);
  function toggleSpacer(key: string) {
    setOpenSpacers(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }
  // Jump directly to Level 2 (per-param timeline) for the top-changed param at a given time index
  function openSidebarAt(ti: number) {
    setSidebarTimeIndex(ti);
    setSidebarSearch("");
    setSidebarDistinctOpen(false);
    setOpenSpacers(new Set());
    const top = getChangesAtTimePoint(ti)[0];
    setSelectedSidebarParam(top?.paramName ?? null);
  }

  // v1 param changes chart filters
  const [v1ParamChangedOnly, setV1ParamChangedOnly] = useState(false);
  const [v1ShowHiddenParams, setV1ShowHiddenParams] = useState(false);

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

  // ── v1 drag-to-zoom ──────────────────────────────────────────────────────
  const [v1Zoom, setV1Zoom] = useState<[number, number]>([0, 1]); // fractional [start, end]
  const [v1DragStart, setV1DragStart] = useState<number | null>(null);
  const [v1DragEnd, setV1DragEnd]     = useState<number | null>(null);
  const [v1Dragging, setV1Dragging]   = useState(false);
  const v1DragRef = useRef<{ on: boolean; s: number; e: number; len: number }>({ on: false, s: 0, e: 0, len: 0 });

  // Sliced data driven by zoom domain — all derived from V1_RUNS (one source of truth)
  const v1ZoomRange = v1Zoom[1] - v1Zoom[0];
  const v1Granularity: 'month' | 'week' | 'day' =
    v1ZoomRange > 0.30 ? 'month' : v1ZoomRange > 0.065 ? 'week' : 'day';
  const V1_ALL_BARS = aggregateV1Bars(v1Granularity);
  const v1Left = (() => {
    const n = V1_ALL_BARS.length;
    const s = Math.round(v1Zoom[0] * (n - 1));
    const e = Math.min(n, Math.round(v1Zoom[1] * (n - 1)) + 1);
    return s === 0 && e === n ? V1_ALL_BARS : V1_ALL_BARS.slice(s, e);
  })();
  const v1Right = (() => {
    const n = V1_RUNS.length;
    const s = Math.round(v1Zoom[0] * (n - 1));
    const e = Math.min(n, Math.round(v1Zoom[1] * (n - 1)) + 1);
    return s === 0 && e === n ? V1_RUNS : V1_RUNS.slice(s, e);
  })();
  const v1Param = v1Zoom[0] === 0 && v1Zoom[1] === 1 ? UNIFIED_V2_DATA
    : UNIFIED_V2_DATA.slice(Math.round(v1Zoom[0] * (UNIFIED_V2_DATA.length - 1)),
                            Math.round(v1Zoom[1] * (UNIFIED_V2_DATA.length - 1)) + 1);

  // Dynamic Y axis for left bar chart — scales to visible data
  const v1LeftRawMax = v1Left.length > 0
    ? Math.max(...v1Left.map(b => b.completed + b.retries + b.failed + b.unknown))
    : 5;
  const v1LeftYMax  = Math.max(5, Math.ceil(v1LeftRawMax / 5) * 5);
  const v1LeftYTicks = Array.from({ length: v1LeftYMax / 5 + 1 }, (_, i) => i * 5);

  // Build v1RightPlot: same as v1Right but with null-value gap entries injected
  // wherever consecutive runs are >30 days apart (matching the empty months in V1_RUNS).
  // recharts breaks the line at null y values (connectNulls=false by default).
  type V1RunOrGap = typeof v1Right[0] & { _gap?: boolean };
  const v1RightPlot: V1RunOrGap[] = [];
  const runToPlotIdx: number[] = []; // v1Right local idx → v1RightPlot idx
  const plotToRunIdx: number[] = []; // v1RightPlot idx → v1Right local idx (-1 for gaps)
  const GAP_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  for (let i = 0; i < v1Right.length; i++) {
    runToPlotIdx.push(v1RightPlot.length);
    plotToRunIdx.push(i);
    v1RightPlot.push(v1Right[i]);
    if (i < v1Right.length - 1) {
      const t1 = new Date(v1Right[i].pit).getTime();
      const t2 = new Date(v1Right[i + 1].pit).getTime();
      if (t2 - t1 > GAP_MS) {
        const midDt = new Date((t1 + t2) / 2);
        const mo = midDt.toLocaleString('en-US', { month: 'short' });
        v1RightPlot.push({
          pit: midDt.toISOString().slice(0, 19), iso: midDt.toISOString().slice(0, 19),
          label: `${mo} ${midDt.getDate()}`,
          startTime: '', status: '',
          duration: null as any, sla: null as any, vcoreTime: null as any, vcoreUtil: null as any,
          paramChanges: 0,
          _gap: true,
        });
        plotToRunIdx.push(-1);
      }
    }
  }

  function startV1Drag(idx: number, len: number) {
    v1DragRef.current = { on: true, s: idx, e: idx, len };
    setV1Dragging(true); setV1DragStart(idx); setV1DragEnd(idx);
  }
  function moveV1Drag(idx: number) {
    if (!v1DragRef.current.on) return;
    v1DragRef.current.e = idx;
    setV1DragEnd(idx);
  }

  // ── v3 stacked customizable charts ──────────────────────────────────────────
  const [v3Selection, setV3Selection] = useState<string[]>(["taskRuns", "duration", "paramChanges"]);
  const [v3DropdownOpen, setV3DropdownOpen] = useState(false);
  const [v3Zoom, setV3Zoom] = useState<[number, number]>([0, 1]);
  const [v3HoverIdx, setV3HoverIdx] = useState<number | null>(null);
  const [v3HoverChartX, setV3HoverChartX] = useState<number | null>(null);
  const [v3DragStart, setV3DragStart] = useState<number | null>(null);
  const [v3DragEnd, setV3DragEnd] = useState<number | null>(null);
  const [v3Dragging, setV3Dragging] = useState(false);
  const v3DragRef = useRef<{ on: boolean; s: number; e: number; len: number }>({ on: false, s: 0, e: 0, len: 0 });
  const v3ScrollDragRef = useRef<{ on: boolean; startX: number; startZoom: [number,number]; trackW: number } | null>(null);
  const v3ScrollTrackRef = useRef<HTMLDivElement>(null);

  const v3Data = v3Zoom[0] === 0 && v3Zoom[1] === 1 ? UNIFIED_V2_DATA
    : UNIFIED_V2_DATA.slice(
        Math.round(v3Zoom[0] * (UNIFIED_V2_DATA.length - 1)),
        Math.round(v3Zoom[1] * (UNIFIED_V2_DATA.length - 1)) + 1
      );

  function startV3Drag(idx: number, len: number) {
    v3DragRef.current = { on: true, s: idx, e: idx, len };
    setV3Dragging(true); setV3DragStart(idx); setV3DragEnd(idx);
  }
  function moveV3Drag(idx: number) {
    if (!v3DragRef.current.on) return;
    v3DragRef.current.e = idx;
    setV3DragEnd(idx);
  }

  function v3ZoomIn() {
    setV3Zoom(prev => {
      const center = (prev[0] + prev[1]) / 2;
      const half = (prev[1] - prev[0]) / 4;
      return [Math.max(0, center - half), Math.min(1, center + half)];
    });
  }
  function v3ZoomOut() {
    setV3Zoom(prev => {
      const center = (prev[0] + prev[1]) / 2;
      const half = (prev[1] - prev[0]);
      return [Math.max(0, center - half), Math.min(1, center + half)];
    });
  }
  function v1ZoomIn() {
    setV1Zoom(prev => {
      const center = (prev[0] + prev[1]) / 2;
      const half = (prev[1] - prev[0]) / 4;
      return [Math.max(0, center - half), Math.min(1, center + half)] as [number, number];
    });
  }
  function v1ZoomOut() {
    setV1Zoom(prev => {
      const center = (prev[0] + prev[1]) / 2;
      const half = (prev[1] - prev[0]);
      return [Math.max(0, center - half), Math.min(1, center + half)] as [number, number];
    });
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
    "Duration":          { key: "duration",  color: "#06b6d4", domain: [0, 4]   as [number,number], ticks: [0,1,2,3,4],     fmt: (v:number) => `${v}h`,  label: "Duration" },
    "SLA":               { key: "sla",       color: "#f59e0b", domain: [50,100] as [number,number], ticks: [50,65,80,95],   fmt: (v:number) => `${v}%`,  label: "SLA"      },
    "vCore Time":        { key: "vcoreTime", color: "#8b5cf6", domain: [0, 20]  as [number,number], ticks: [0,5,10,15,20],  fmt: (v:number) => `${v}`,   label: "vCore·h"  },
    "vCore Utilization": { key: "vcoreUtil", color: "#ec4899", domain: [0, 100] as [number,number], ticks: [0,25,50,75,100],fmt: (v:number) => `${v}%`,  label: "vCore %"  },
  } as const;
  const metricCfg = V3_METRIC_CONFIG[activeMetric];

  // Dynamic Y axis for right line chart — scales to visible data, fixed for % metrics
  const v1RightRawMax = v1Right.length > 0
    ? Math.max(...v1Right.map(r => Number((r as any)[metricCfg.key]) || 0))
    : 10;
  const isFixedPct = metricCfg.key === 'vcoreUtil' || metricCfg.key === 'sla';
  const v1RightYMax  = isFixedPct ? (metricCfg.domain[1] as number)
    : Math.max(metricCfg.domain[1] as number, Math.ceil(v1RightRawMax * 1.15 / 5) * 5);
  const v1RightDomain: [number, number] = [metricCfg.domain[0] as number, v1RightYMax];
  const v1RightTicks = isFixedPct ? [...metricCfg.ticks]
    : Array.from({ length: v1RightYMax / 5 + 1 }, (_, i) => i * 5);

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

  // Commit zoom on global mouseup (so releasing outside the chart still works)
  useEffect(() => {
    function onUp() {
      const d = v1DragRef.current;
      if (!d.on) return;
      d.on = false;
      setV1Dragging(false);
      const [s, e] = [Math.min(d.s, d.e), Math.max(d.s, d.e)];
      if (e - s >= 1 && d.len > 1) {
        const f0 = s / (d.len - 1);
        const f1 = e / (d.len - 1);
        setV1Zoom(prev => [
          prev[0] + f0 * (prev[1] - prev[0]),
          prev[0] + f1 * (prev[1] - prev[0]),
        ]);
      }
      setV1DragStart(null); setV1DragEnd(null);
    }
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []); // ref-based — no stale closures

  // Commit v3 zoom on mouseup; pan scrollbar thumb on mousemove
  useEffect(() => {
    function onUp() {
      // commit chart drag-to-zoom
      const d = v3DragRef.current;
      if (d.on) {
        d.on = false;
        setV3Dragging(false);
        const [s, e] = [Math.min(d.s, d.e), Math.max(d.s, d.e)];
        if (e - s >= 1 && d.len > 1) {
          const f0 = s / (d.len - 1);
          const f1 = e / (d.len - 1);
          setV3Zoom(prev => [
            prev[0] + f0 * (prev[1] - prev[0]),
            prev[0] + f1 * (prev[1] - prev[0]),
          ]);
        }
        setV3DragStart(null); setV3DragEnd(null);
      }
      // end scrollbar drag
      if (v3ScrollDragRef.current) v3ScrollDragRef.current.on = false;
    }
    function onMove(e: MouseEvent) {
      const sd = v3ScrollDragRef.current;
      if (!sd?.on) return;
      const delta = (e.clientX - sd.startX) / sd.trackW;
      const span  = sd.startZoom[1] - sd.startZoom[0];
      const newStart = Math.max(0, Math.min(1 - span, sd.startZoom[0] + delta));
      setV3Zoom([newStart, newStart + span]);
    }
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  // x-center of bar i in the param strip (mirrors recharts layout)
  // v2 bar chart:  left yAxis=28, right margin=8,  no right axis
  // v3 composed:   left yAxis=24, right yAxis=36,  margin.right=36
  function paramBadgeX(i: number, leftY: number, rightPad: number) {
    const n = UNIFIED_V2_DATA.length;
    const plotW = paramW - leftY - rightPad;
    return leftY + (i + 0.5) * (plotW / n);
  }

  // Table rows come directly from V1_RUNS — same data as the charts
  const filteredRuns = V1_RUNS.filter(r =>
    !search || r.pit.includes(search) || r.status.toLowerCase().includes(search.toLowerCase())
  );

  // Close sidebarDistinctOpen popover on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (sidebarDistinctRef.current && !sidebarDistinctRef.current.contains(e.target as Node)) {
        setSidebarDistinctOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Map chart hover → set of matching table row indices
  const hoveredTableIndices = (() => {
    // Left bar hovered → all rows in that bar's time bucket (consecutive in the table)
    if (hover.source === 'left' && hover.leftIndex != null) {
      const barIso = v1Left[hover.leftIndex]?.iso;
      if (!barIso) return new Set<number>();
      const result = new Set<number>();
      filteredRuns.forEach((run, i) => {
        let matches = false;
        if (v1Granularity === 'month') {
          matches = run.pit.startsWith(barIso.slice(0, 7));
        } else if (v1Granularity === 'week') {
          const barMs = new Date(barIso).getTime();
          const runMs = new Date(run.pit).getTime();
          matches = runMs >= barMs && runMs < barMs + 7 * 24 * 3600 * 1000;
        } else {
          matches = run.pit.startsWith(barIso.slice(0, 10));
        }
        if (matches) result.add(i);
      });
      return result;
    }
    // Right dot hovered → exact row match (dot IS the run)
    if (hover.source === 'right' && hover.rightIndex != null) {
      const dotPit = v1Right[hover.rightIndex]?.pit;
      if (!dotPit || filteredRuns.length === 0) return new Set<number>();
      const idx = filteredRuns.findIndex(r => r.pit === dotPit);
      return idx >= 0 ? new Set<number>([idx]) : new Set<number>();
    }
    return new Set<number>();
  })();

  // Scroll to the first matching row when hover changes
  const ROW_HEIGHT_PX = 40;
  useEffect(() => {
    if (hoveredTableIndices.size === 0 || !tableBodyRef.current) return;
    const firstIdx = Math.min(...hoveredTableIndices);
    tableBodyRef.current.scrollTo({ top: firstIdx * ROW_HEIGHT_PX, behavior: 'instant' as ScrollBehavior });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover.leftIndex]);

  // ── Left chart handlers ──
  function onLeftMouseMove(data: any) {
    const li = data?.activeTooltipIndex;
    if (li == null) return;
    setHover({ source: 'left', leftIndex: li, rightIndex: null });
  }
  function onLeftMouseLeave() {
    setHover({ source: null, leftIndex: null, rightIndex: null });
  }

  // ── Right chart handlers ──
  function onRightMouseMove(data: any) {
    const pi = data?.activeTooltipIndex; // index into v1RightPlot
    if (pi == null) return;
    const ri = plotToRunIdx[pi]; // v1Right local index
    if (ri < 0) return; // gap entry — ignore
    const rightMs = new Date(v1Right[ri]?.iso ?? "").getTime();
    let li = 0, minDiff = Infinity;
    v1Left.forEach((p, i) => {
      const diff = Math.abs(new Date(p.iso).getTime() - rightMs);
      if (diff < minDiff) { minDiff = diff; li = i; }
    });
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
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 p-6 flex flex-col gap-5">

          {/* ── Charts ── */}

          {/* ── V1: side-by-side ── */}
          {version === 1 && (
          <div className="flex flex-col gap-4 shrink-0">

          {/* Zoom range label — only shown when zoomed */}
          {(v1Zoom[0] !== 0 || v1Zoom[1] !== 1) && (
            <span className="text-[11px] font-mono text-muted-foreground">
              {v1Left[0]?.label ?? ""} — {v1Left.at(-1)?.label ?? ""}
            </span>
          )}

          <div className="grid gap-4 grid-cols-2">

            {/* LEFT: Task runs bar chart */}
            <div className="border border-border rounded-lg bg-card p-4 relative">
              <p className="text-[13px] font-semibold text-foreground">Task runs</p>
              <p className="text-[11px] text-muted-foreground mb-3">
                {v1Granularity === 'month' ? '1 year' : v1Granularity === 'week' ? 'weekly' : 'daily'}
              </p>
              <div className="absolute top-3 right-3 z-10 flex items-center border border-border rounded-md overflow-hidden bg-background/80 backdrop-blur-sm">
                <button onClick={() => setV1Zoom([0, 1])} disabled={v1Zoom[0] === 0 && v1Zoom[1] === 1} title="Reset zoom" className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2L2 7h2v7h4v-4h2v4h4V7h2L8 2z" fill="currentColor"/></svg>
                </button>
                <button onClick={v1ZoomIn} disabled={(v1Zoom[1] - v1Zoom[0]) < 0.025} title="Zoom in" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">+</button>
                <button onClick={v1ZoomOut} disabled={v1Zoom[0] === 0 && v1Zoom[1] === 1} title="Zoom out" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors">−</button>
              </div>

              {/* Chart + forced overlay tooltip */}
              <div className="relative cursor-crosshair" ref={leftContainerRef}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={v1Left}
                    barSize={14}
                    barCategoryGap="20%"
                    onMouseDown={(data) => { const i = data?.activeTooltipIndex; if (i != null) startV1Drag(i, v1Left.length); }}
                    onMouseMove={(data) => { if (v1DragRef.current.on) { const i = data?.activeTooltipIndex; if (i != null) moveV1Drag(i); } else onLeftMouseMove(data); }}
                    onMouseLeave={() => { if (!v1DragRef.current.on) onLeftMouseLeave(); }}
                  >
                    <PatternDef />
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.ceil(v1Left.length / 10) - 1)} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, v1LeftYMax]} ticks={v1LeftYTicks} width={24} />

                    {!leftDriven && !v1Dragging && (
                      <Tooltip content={<TaskRunsTooltip />} cursor={{ fill: "#e5e7eb", opacity: 0.6 }} />
                    )}
                    {/* Tooltip+cursor when no external hover */}
                    {/* (cursor rect is rendered natively by recharts) */}

                    {v1Dragging && v1DragStart !== null && v1DragEnd !== null && (
                      <ReferenceArea
                        x1={v1Left[Math.min(v1DragStart, v1DragEnd)]?.label}
                        x2={v1Left[Math.max(v1DragStart, v1DragEnd)]?.label}
                        fill="hsl(262 80% 60% / 1)" fillOpacity={0.12}
                        stroke="hsl(262 80% 60%)" strokeOpacity={0.5} strokeWidth={1}
                      />
                    )}

                    <Bar dataKey="completed" stackId="a" fill="#22c55e"  shape={SeamRect} />
                    <Bar dataKey="retries"   stackId="a" fill={`url(#${PATTERN_ID})`} shape={SeamRect} />
                    <Bar dataKey="failed"    stackId="a" fill="#ef4444" shape={SeamRect} />
                    <Bar dataKey="unknown"   stackId="a" fill="#d1d5db" shape={SeamRect} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Column highlight overlay — same visual as recharts native cursor */}
                {leftDriven && hover.leftIndex != null && leftContainerRef.current && (() => {
                  const w = leftContainerRef.current!.getBoundingClientRect().width;
                  const yAxisW = 24, leftM = 5, rightM = 5;
                  const plotW = w - leftM - yAxisW - rightM;
                  const colW = plotW / v1Left.length;
                  const x = leftM + yAxisW + hover.leftIndex * colW;
                  return (
                    <div className="absolute pointer-events-none"
                      style={{ left: x, width: colW, top: 5, bottom: 35,
                               background: '#e5e7eb', opacity: 0.6 }} />
                  );
                })()}
                {leftDriven && hover.leftIndex != null && getForcedBarTooltipPos() && (
                  <div className="absolute pointer-events-none z-10"
                    style={{ left: getForcedBarTooltipPos()!.x, top: getForcedBarTooltipPos()!.y }}>
                    <ForcedBarTooltip data={v1Left[hover.leftIndex]} />
                  </div>
                )}
              </div>
              <PanBar zoom={v1Zoom} setZoom={setV1Zoom} />
              <TaskRunsLegend />
            </div>

            {/* RIGHT: Key metrics line chart */}
            <div className="border border-border rounded-lg bg-card p-4 relative">
              <div className="flex items-center gap-1">
                <select
                  value={activeMetric}
                  onChange={e => setActiveMetric(e.target.value as typeof activeMetric)}
                  className="text-[13px] font-semibold text-foreground bg-transparent border-none cursor-pointer focus:outline-none appearance-none"
                >
                  {(["vCore Time","vCore Utilization","Duration","SLA"] as const).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="text-muted-foreground shrink-0 pointer-events-none -ml-1" />
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">1 year</p>
              <div className="absolute top-3 right-3 z-10 flex items-center border border-border rounded-md overflow-hidden bg-background/80 backdrop-blur-sm">
                <button onClick={() => setV1Zoom([0, 1])} disabled={v1Zoom[0] === 0 && v1Zoom[1] === 1} title="Reset zoom" className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2L2 7h2v7h4v-4h2v4h4V7h2L8 2z" fill="currentColor"/></svg>
                </button>
                <button onClick={v1ZoomIn} disabled={(v1Zoom[1] - v1Zoom[0]) < 0.025} title="Zoom in" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">+</button>
                <button onClick={v1ZoomOut} disabled={v1Zoom[0] === 0 && v1Zoom[1] === 1} title="Zoom out" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors">−</button>
              </div>

              {(() => {
                // Compute which zoomed indices to highlight when a left bar is hovered
                // highlightedSet uses v1RightPlot indices (di from recharts dot renderer)
                const zoomOffset = Math.round(v1Zoom[0] * (V1_RUNS.length - 1));
                const highlightedPlotIndices: number[] = hover.source === 'left' && hover.leftIndex != null
                  ? findRightIndicesForBar(v1Left[hover.leftIndex]?.iso ?? '', v1Granularity)
                      .map(ri => ri - zoomOffset)
                      .filter(zi => zi >= 0 && zi < v1Right.length)
                      .map(zi => runToPlotIdx[zi])
                  : [];
                const highlightedSet = new Set<number>(highlightedPlotIndices);
                // Labels for ReferenceArea — leftmost to rightmost highlighted dot
                const highlightX1 = highlightedPlotIndices.length > 0
                  ? v1RightPlot[Math.min(...highlightedPlotIndices)]?.label : null;
                const highlightX2 = highlightedPlotIndices.length > 0
                  ? v1RightPlot[Math.max(...highlightedPlotIndices)]?.label : null;
                return (
              <div className="relative cursor-crosshair" ref={rightContainerRef}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={v1RightPlot}
                    onMouseDown={(data) => {
                      const pi = data?.activeTooltipIndex;
                      if (pi == null) return;
                      const ri = plotToRunIdx[pi];
                      if (ri >= 0) startV1Drag(ri, v1Right.length);
                    }}
                    onMouseMove={(data) => {
                      if (v1DragRef.current.on) {
                        const pi = data?.activeTooltipIndex;
                        if (pi != null) { const ri = plotToRunIdx[pi]; if (ri >= 0) moveV1Drag(ri); }
                      } else onRightMouseMove(data);
                    }}
                    onMouseLeave={() => { if (!v1DragRef.current.on) onRightMouseLeave(); }}
                  >
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.ceil(v1RightPlot.length / 10) - 1)} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={metricCfg.fmt} domain={v1RightDomain} ticks={v1RightTicks} width={28} />

                    {/* Gray rect backdrop spanning highlighted dots (left-bar hover) */}
                    {highlightX1 && highlightX2 && (
                      <ReferenceArea x1={highlightX1} x2={highlightX2}
                        fill="#e5e7eb" fillOpacity={0.6} stroke="none" isFront={false} />
                    )}

                    {/* Normal hover tooltip — only when right chart drives itself */}
                    {(!rightDriven || hover.source === 'left') && !v1Dragging && highlightedSet.size === 0 && (
                      <Tooltip content={<KeyMetricsTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                    )}
                    {/* Single-dot crosshair — driven by left-bar or param hover */}
                    {rightDriven && hover.source !== 'left' && hover.rightIndex != null && (() => {
                      const ri = hover.rightIndex; // v1Right local idx
                      const pi = ri >= 0 && ri < runToPlotIdx.length ? runToPlotIdx[ri] : -1;
                      return pi >= 0 && pi < v1RightPlot.length
                        ? <ReferenceLine x={v1RightPlot[pi].label} stroke="hsl(var(--border))" strokeWidth={1} />
                        : null;
                    })()}

                    {v1Dragging && v1DragStart !== null && v1DragEnd !== null && (
                      <ReferenceArea
                        x1={v1Right[Math.min(v1DragStart, v1DragEnd)]?.label}
                        x2={v1Right[Math.max(v1DragStart, v1DragEnd)]?.label}
                        fill="hsl(262 80% 60% / 1)" fillOpacity={0.12}
                        stroke="hsl(262 80% 60%)" strokeOpacity={0.5} strokeWidth={1}
                      />
                    )}

                    <Line key="v1-metric-line" type="linear" dataKey={metricCfg.key} stroke={metricCfg.color} strokeWidth={1.5}
                      connectNulls={false}
                      isAnimationActive={false}
                      dot={(dotProps: any) => {
                        const { cx, cy, index: di, payload } = dotProps;
                        if (cy == null || isNaN(cy)) return <g key={`gap-${di}`} />;
                        const hasParams = (payload?.paramChanges ?? 0) > 0;
                        if (highlightedSet.has(di)) {
                          // dots inside the highlighted rect render normally (rect provides context)
                          if (hasParams) {
                            return (
                              <g key={`dot-h-pc-${di}`}>
                                <circle cx={cx} cy={cy} r={3.5} fill="#8b5cf6" />
                                <circle cx={cx} cy={cy} r={5}   fill="none" stroke="white" strokeWidth={2} />
                                <circle cx={cx} cy={cy} r={6}   fill="none" stroke="#8b5cf6" strokeWidth={1.5} />
                              </g>
                            );
                          }
                          return <circle key={`dot-h-${di}`} cx={cx} cy={cy} r={2.5} fill={metricCfg.color} />;
                        }
                        if (hasParams) {
                          return (
                            <g key={`dot-pc-${di}`}>
                              {/* filled centre */}
                              <circle cx={cx} cy={cy} r={3.5} fill="#8b5cf6" />
                              {/* white gap */}
                              <circle cx={cx} cy={cy} r={5}   fill="none" stroke="white" strokeWidth={2} />
                              {/* outer purple ring */}
                              <circle cx={cx} cy={cy} r={6}   fill="none" stroke="#8b5cf6" strokeWidth={1.5} />
                            </g>
                          );
                        }
                        return <circle key={`dot-${di}`} cx={cx} cy={cy} r={2.5} fill={metricCfg.color} />;
                      }}
                      activeDot={rightDriven ? false : { r: 4, fill: metricCfg.color, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {rightDriven && hover.source !== 'left' && hover.rightIndex != null && getForcedLineTooltipPos() && (
                  <div className="absolute pointer-events-none z-10"
                    style={{ left: getForcedLineTooltipPos()!.x, top: getForcedLineTooltipPos()!.y }}>
                    <ForcedLineTooltip data={v1Right[hover.rightIndex]} />
                  </div>
                )}
              </div>
                ); // end return
              })(/* end IIFE */)}
              <PanBar zoom={v1Zoom} setZoom={setV1Zoom} />

            </div>

            {/* THIRD: Parameter changes — hidden in v1 */}
            {false && showParamChanges && (() => {
              // Apply filters to v1Param
              const paramScale = v1ParamChangedOnly ? 100 : 1;
              const paramChartData = (v1ParamChangedOnly
                ? v1Param.filter(d => d.paramChanges > 0)
                : v1Param
              ).map(d => ({
                ...d,
                visibleChanges: Math.round(d.paramChanges * 0.72) / paramScale,
                hiddenChanges:  (d.paramChanges - Math.round(d.paramChanges * 0.72)) / paramScale,
              }));

              return (
              <div className="border border-border rounded-lg bg-card p-4 relative">
                <p className="text-[13px] font-semibold text-foreground">Parameter changes</p>
                <p className="text-[11px] text-muted-foreground mb-3">1 year</p>
                <div className="absolute top-3 right-3 z-10 flex items-center border border-border rounded-md overflow-hidden bg-background/80 backdrop-blur-sm">
                  <button onClick={() => setV1Zoom([0, 1])} disabled={v1Zoom[0] === 0 && v1Zoom[1] === 1} title="Reset zoom" className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2L2 7h2v7h4v-4h2v4h4V7h2L8 2z" fill="currentColor"/></svg>
                  </button>
                  <button onClick={v1ZoomIn} disabled={(v1Zoom[1] - v1Zoom[0]) < 0.025} title="Zoom in" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">+</button>
                  <button onClick={v1ZoomOut} disabled={v1Zoom[0] === 0 && v1Zoom[1] === 1} title="Zoom out" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors">−</button>
                </div>

                <div className="relative cursor-crosshair" ref={paramV1ContainerRef}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={paramChartData}
                      barSize={12}
                      barCategoryGap="25%"
                      onMouseDown={(data) => { if (!v1ParamChangedOnly) { const i = data?.activeTooltipIndex; if (i != null) startV1Drag(i, paramChartData.length); } }}
                      onMouseMove={(data) => { if (v1DragRef.current.on) { const i = data?.activeTooltipIndex; if (i != null) moveV1Drag(i); } else onParamMouseMove(data); }}
                      onMouseLeave={() => { if (!v1DragRef.current.on) onParamMouseLeave(); }}
                      onClick={(data) => {
                        if (!v1DragRef.current.on && data?.activePayload?.[0]) {
                          const iso = data.activePayload[0].payload.iso;
                          const ti = UNIFIED_V2_DATA.findIndex(d => d.iso === iso);
                          if (ti !== -1) openSidebarAt(ti);
                        }
                      }}
                    >
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={Math.max(0, Math.ceil(paramChartData.length / 10) - 1)} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={28} tickFormatter={v1ParamChangedOnly ? (v: number) => String(Math.round(v)) : undefined} allowDecimals={!v1ParamChangedOnly} />

                      {!paramDriven && !v1Dragging && (
                        <Tooltip content={<ParamChangesTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />
                      )}
                      {paramDriven && hover.leftIndex != null && (() => {
                        const zoomedIdx = hover.leftIndex - Math.round(v1Zoom[0] * (UNIFIED_V2_DATA.length - 1));
                        const refItem = v1Param[zoomedIdx];
                        const found = refItem ? paramChartData.find(d => d.label === refItem.label) : null;
                        return found
                          ? <ReferenceLine x={found.label} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={20} />
                          : null;
                      })()}

                      {!v1ParamChangedOnly && v1Dragging && v1DragStart !== null && v1DragEnd !== null && (
                        <ReferenceArea
                          x1={paramChartData[Math.min(v1DragStart, v1DragEnd)]?.label}
                          x2={paramChartData[Math.max(v1DragStart, v1DragEnd)]?.label}
                          fill="hsl(262 80% 60% / 1)" fillOpacity={0.12}
                          stroke="hsl(262 80% 60%)" strokeOpacity={0.5} strokeWidth={1}
                        />
                      )}

                      {v1ShowHiddenParams ? (
                        <>
                          <Bar dataKey="visibleChanges" stackId="pc" fill="#8b5cf6" fillOpacity={0.85} shape={SeamRect} />
                          <Bar dataKey="hiddenChanges"  stackId="pc" fill="#c4b5fd" fillOpacity={0.65} radius={[2,2,0,0]} />
                        </>
                      ) : (
                        <Bar dataKey="visibleChanges" fill="#8b5cf6" fillOpacity={0.82} radius={[2,2,0,0]} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>

                  {!v1ParamChangedOnly && paramDriven && hover.leftIndex != null && getForcedParamTooltipPos() && (
                    <div className="absolute pointer-events-none z-10"
                      style={{ left: getForcedParamTooltipPos()!.x, top: getForcedParamTooltipPos()!.y }}>
                      <ForcedParamTooltip index={hover.leftIndex} />
                    </div>
                  )}
                </div>

                {/* Legend + toggles */}
                <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-violet-500 inline-block shrink-0" style={{ opacity: 0.82 }} />
                      <span className="text-[11px] text-muted-foreground">Param changes</span>
                    </div>
                    {v1ShowHiddenParams && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-violet-300 inline-block shrink-0" style={{ opacity: 0.7 }} />
                        <span className="text-[11px] text-muted-foreground">Hidden params</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Changed only — pill toggle */}
                    <button onClick={() => setV1ParamChangedOnly(v => !v)}
                      className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className={`relative inline-flex w-7 h-4 rounded-full transition-colors duration-200 ${v1ParamChangedOnly ? "bg-violet-500" : "bg-muted-foreground/25"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${v1ParamChangedOnly ? "translate-x-3" : "translate-x-0"}`} />
                      </span>
                      Changed only
                    </button>
                    {/* Hidden params — pill toggle */}
                    <button onClick={() => setV1ShowHiddenParams(v => !v)}
                      className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className={`relative inline-flex w-7 h-4 rounded-full transition-colors duration-200 ${v1ShowHiddenParams ? "bg-violet-500" : "bg-muted-foreground/25"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${v1ShowHiddenParams ? "translate-x-3" : "translate-x-0"}`} />
                      </span>
                      Hidden params
                    </button>
                  </div>
                </div>
              </div>
              );
            })()}

          </div>
          </div>
          )}

          {/* ── V3: unified stacked timeline ── */}
          {version === 3 && (
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
                  <Bar dataKey="unknown"   stackId="a" fill="#d1d5db" shape={SeamRect} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Param changes Gantt strip ── */}
            {showParamChanges && (
            <div className="relative h-9 mt-1">
              {UNIFIED_V2_DATA.map((d, i) => d.paramChanges > 0 && (
                <div key={i} className="absolute -translate-x-1/2 top-0"
                  style={{ left: paramBadgeX(i, 28, 8) }}>
                  <ParamChangeBadge count={d.paramChanges} onClick={() => openSidebarAt(i)} />
                </div>
              ))}
            </div>
            )}

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
                {(["vCore Time","vCore Utilization","Duration","SLA"] as const).map(m => (
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

          {/* ── V2: stacked customizable charts ── */}
          {version === 2 && (() => {
            const v3SelectedDefs = V3_METRIC_CATALOG.filter(m => v3Selection.includes(m.id));
            // Original index of v3Data[0] — needed to map zoomed slot → sidebar index
            const v3ZoomStartIdx = v3Zoom[0] === 0 && v3Zoom[1] === 1 ? 0
              : Math.round(v3Zoom[0] * (UNIFIED_V2_DATA.length - 1));
            return (
            <div className="flex flex-col gap-4">

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                {/* Metric selector */}
                <div className="relative">
                  <button
                    onClick={() => setV3DropdownOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-[12px] text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-muted-foreground shrink-0">
                      <rect x="1" y="1" width="5" height="5" rx="0.8" fill="currentColor" fillOpacity="0.7"/>
                      <rect x="8" y="1" width="5" height="5" rx="0.8" fill="currentColor" fillOpacity="0.4"/>
                      <rect x="1" y="8" width="5" height="5" rx="0.8" fill="currentColor" fillOpacity="0.4"/>
                      <rect x="8" y="8" width="5" height="5" rx="0.8" fill="currentColor" fillOpacity="0.2"/>
                    </svg>
                    <span>{v3SelectedDefs.length} chart{v3SelectedDefs.length !== 1 ? "s" : ""}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {v3DropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setV3DropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-1 z-30 bg-background border border-border rounded-lg shadow-xl py-1 min-w-[210px]">
                        {V3_METRIC_CATALOG.map(metric => {
                          const selected = v3Selection.includes(metric.id);
                          return (
                            <button
                              key={metric.id}
                              onClick={() => setV3Selection(prev =>
                                prev.includes(metric.id) ? prev.filter(x => x !== metric.id) : [...prev, metric.id]
                              )}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-muted/40 text-[12px] text-left transition-colors"
                            >
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                                {selected && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </span>
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: metric.color }} />
                              <span className="text-foreground">{metric.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Zoom info */}
                <div className="flex items-center">
                  {v3Zoom[0] !== 0 || v3Zoom[1] !== 1 ? (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {v3Data[0]?.label ?? ""} — {v3Data.at(-1)?.label ?? ""}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50 italic select-none">drag on any panel to zoom all</span>
                  )}
                </div>
              </div>

              {/* Chart stack */}
              <div className="border border-border rounded-lg bg-card overflow-hidden relative">
                {v3SelectedDefs.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-[13px] text-muted-foreground">
                    Select metrics above to display charts
                  </div>
                ) : (
                  v3SelectedDefs.map((def, panelIdx) => {
                    const isLast = panelIdx === v3SelectedDefs.length - 1;
                    const panelH = def.type === "gantt" ? 60 : isLast ? 160 : 130;
                    const commonChartHandlers = {
                      onMouseDown: (d: any) => { const i = d?.activeTooltipIndex; if (i != null) startV3Drag(i, v3Data.length); },
                      onMouseMove: (d: any) => {
                        if (v3DragRef.current.on) { const i = d?.activeTooltipIndex; if (i != null) moveV3Drag(i); return; }
                        if (d?.activeTooltipIndex != null) {
                          setV3HoverIdx(d.activeTooltipIndex);
                          if (d.chartX != null) setV3HoverChartX(d.chartX);
                          // Sync table: map zoomed index → global UNIFIED_V2_DATA index
                          const globalIdx = v3ZoomStartIdx + d.activeTooltipIndex;
                          setHover({ source: 'left', leftIndex: globalIdx, rightIndex: findClosestRightIndex(globalIdx) });
                        }
                      },
                      onMouseLeave: () => {
                        if (!v3DragRef.current.on) {
                          setV3HoverIdx(null);
                          setV3HoverChartX(null);
                          setHover({ source: null, leftIndex: null, rightIndex: null });
                        }
                      },
                    };
                    const crosshairLine = v3HoverIdx !== null && !v3Dragging && v3Data[v3HoverIdx] && (
                      <ReferenceLine x={v3Data[v3HoverIdx].label} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.35} strokeWidth={1} />
                    );
                    const dragArea = v3Dragging && v3DragStart !== null && v3DragEnd !== null && (
                      <ReferenceArea
                        x1={v3Data[Math.min(v3DragStart, v3DragEnd)]?.label}
                        x2={v3Data[Math.max(v3DragStart, v3DragEnd)]?.label}
                        fill="hsl(262 80% 60% / 1)" fillOpacity={0.12}
                        stroke="hsl(262 80% 60%)" strokeOpacity={0.5} strokeWidth={1}
                      />
                    );
                    const xAxisInterval = Math.max(0, Math.ceil(v3Data.length / 8) - 1);

                    return (
                      <div key={def.id} className={panelIdx > 0 ? "border-t border-border" : ""}>
                        <div className="relative cursor-crosshair">
                          {/* Panel label */}
                          <div className="absolute left-10 top-1.5 z-10 pointer-events-none flex items-baseline gap-1">
                            <span className="text-[10px] font-semibold" style={{ color: def.color }}>{def.label}</span>
                            <span className="text-[9px] text-muted-foreground/50">· {def.unit}</span>
                          </div>
                          {/* Per-panel zoom controls */}
                          {def.type !== "gantt" && (
                            <div className="absolute top-1.5 right-2 z-10 flex items-center border border-border rounded-md overflow-hidden bg-background/80 backdrop-blur-sm">
                              <button onClick={() => setV3Zoom([0, 1])} disabled={v3Zoom[0] === 0 && v3Zoom[1] === 1} title="Reset zoom" className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">
                                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2L2 7h2v7h4v-4h2v4h4V7h2L8 2z" fill="currentColor"/></svg>
                              </button>
                              <button onClick={v3ZoomIn} disabled={(v3Zoom[1] - v3Zoom[0]) < 0.08} title="Zoom in" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors border-r border-border">+</button>
                              <button onClick={v3ZoomOut} disabled={v3Zoom[0] === 0 && v3Zoom[1] === 1} title="Zoom out" className="w-6 h-6 flex items-center justify-center text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-25 disabled:cursor-not-allowed transition-colors">−</button>
                            </div>
                          )}

                          {def.type === "gantt" ? (
                            /* ── Gantt badge strip — no recharts ── */
                            <div
                              className="relative flex items-center"
                              style={{ height: panelH, paddingLeft: 32, paddingRight: 8 }}
                              onMouseLeave={() => {
                                setV3HoverIdx(null);
                                setV3HoverChartX(null);
                                setHover({ source: null, leftIndex: null, rightIndex: null });
                              }}
                            >
                              {v3Data.map((d, slotIdx) => {
                                const count = (d as any)[def.dataKey!] as number;
                                const origIdx = v3ZoomStartIdx + slotIdx;
                                const isHovered = slotIdx === v3HoverIdx;
                                return (
                                  <div
                                    key={slotIdx}
                                    className="flex-1 flex items-center justify-center min-w-0 relative h-full"
                                    onMouseEnter={() => {
                                      setV3HoverIdx(slotIdx);
                                      setHover({ source: 'left', leftIndex: origIdx, rightIndex: findClosestRightIndex(origIdx) });
                                    }}
                                  >
                                    {/* Crosshair line — matches recharts panels above */}
                                    {isHovered && (
                                      <div className="absolute inset-0 pointer-events-none flex justify-center">
                                        <div className="w-px h-full bg-muted-foreground/35" />
                                      </div>
                                    )}
                                    {/* Slot background tint */}
                                    {isHovered && (
                                      <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
                                    )}
                                    {count > 0 && (
                                      <ParamChangeBadge
                                        count={count}
                                        onClick={() => openSidebarAt(origIdx)}
                                        highlighted={isHovered}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                          <ResponsiveContainer width="100%" height={panelH}>
                            {def.type === "bar-stacked" ? (
                              <BarChart data={v3Data} barSize={14} barCategoryGap="20%"
                                margin={{ top: 8, right: 8, left: 0, bottom: 0 }} {...commonChartHandlers}>
                                <PatternDef />
                                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                                <XAxis dataKey="label" hide={!isLast} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={xAxisInterval} />
                                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 25]} ticks={[0, 10, 20]} width={32} />
                                <Tooltip content={() => null} cursor={false} />
                                {crosshairLine}{dragArea}
                                <Bar dataKey="completed" stackId="a" fill="#22c55e" shape={SeamRect} />
                                <Bar dataKey="retries"   stackId="a" fill={`url(#${PATTERN_ID})`} shape={SeamRect} />
                                <Bar dataKey="failed"    stackId="a" fill="#ef4444" shape={SeamRect} />
                                <Bar dataKey="unknown"   stackId="a" fill="#d1d5db" shape={SeamRect} />
                              </BarChart>
                            ) : def.type === "bar-single" ? (
                              <BarChart data={v3Data} barSize={12} barCategoryGap="25%"
                                margin={{ top: 8, right: 8, left: 0, bottom: 0 }} {...commonChartHandlers}>
                                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                                <XAxis dataKey="label" hide={!isLast} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={xAxisInterval} />
                                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={32} />
                                <Tooltip content={() => null} cursor={false} />
                                {crosshairLine}{dragArea}
                                <Bar dataKey={def.dataKey!} fill={def.color} fillOpacity={0.82} radius={[2,2,0,0]} />
                              </BarChart>
                            ) : (
                              <LineChart data={v3Data}
                                margin={{ top: 8, right: 8, left: 0, bottom: 0 }} {...commonChartHandlers}>
                                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                                <XAxis dataKey="label" hide={!isLast} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={xAxisInterval} />
                                <YAxis
                                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                                  axisLine={false} tickLine={false}
                                  domain={def.domain ?? ["auto","auto"]}
                                  ticks={def.ticks}
                                  tickFormatter={def.fmt ? (v: number) => def.fmt!(v) : undefined}
                                  width={32}
                                />
                                <Tooltip content={() => null} cursor={false} />
                                {crosshairLine}{dragArea}
                                <Line type="monotone" dataKey={def.dataKey!}
                                  stroke={def.color} strokeWidth={1.5}
                                  dot={{ r: 2.5, fill: def.color, strokeWidth: 0 }}
                                  activeDot={false}
                                />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Grouped crosshair tooltip */}
                {v3HoverIdx !== null && v3HoverChartX !== null && !v3Dragging && (() => {
                  const row = v3Data[v3HoverIdx];
                  if (!row || v3SelectedDefs.length === 0) return null;
                  return (
                    <div
                      className="absolute pointer-events-none z-20 bg-white border border-border rounded-lg shadow-xl overflow-hidden"
                      style={{ left: v3HoverChartX + 12, top: 8 }}
                    >
                      <div className="flex">
                        <div className="w-[3px] shrink-0" style={{ background: v3SelectedDefs[0].color }} />
                        <div className="px-3 py-2.5 min-w-[170px]">
                          <p className="text-[10px] text-muted-foreground font-mono mb-2 pb-1.5 border-b border-border">{row.iso}</p>
                          {v3SelectedDefs.map(def => {
                            if (def.type === "gantt") return null;
                            let displayVal: string;
                            if (def.type === "bar-stacked") {
                              const total = (row.completed ?? 0) + (row.retries ?? 0) + (row.failed ?? 0) + (row.unknown ?? 0);
                              displayVal = `${total} runs`;
                            } else {
                              const raw = (row as any)[def.dataKey!] as number;
                              displayVal = def.fmt ? def.fmt(raw) : String(raw ?? "—");
                            }
                            return (
                              <div key={def.id} className="flex items-center gap-2 mb-1 last:mb-0">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: def.color }} />
                                <span className="text-[11px] text-muted-foreground flex-1">{def.label}</span>
                                <span className="text-[12px] font-semibold text-foreground">{displayVal}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Scrollbar — shown only when zoomed */}
                {(v3Zoom[0] !== 0 || v3Zoom[1] !== 1) && (
                  <div
                    ref={v3ScrollTrackRef}
                    className="relative mx-3 mb-3 mt-1 h-2.5 bg-muted/40 rounded-full cursor-pointer select-none"
                    onMouseDown={e => {
                      // click on track (outside thumb) — jump to that position
                      const rect = v3ScrollTrackRef.current!.getBoundingClientRect();
                      const frac = (e.clientX - rect.left) / rect.width;
                      const span = v3Zoom[1] - v3Zoom[0];
                      const newStart = Math.max(0, Math.min(1 - span, frac - span / 2));
                      setV3Zoom([newStart, newStart + span]);
                    }}
                  >
                    {/* Thumb */}
                    <div
                      className="absolute top-0 h-full bg-muted-foreground/40 hover:bg-muted-foreground/60 rounded-full cursor-grab active:cursor-grabbing transition-colors"
                      style={{
                        left:  `${v3Zoom[0] * 100}%`,
                        width: `${(v3Zoom[1] - v3Zoom[0]) * 100}%`,
                      }}
                      onMouseDown={e => {
                        e.stopPropagation();
                        const rect = v3ScrollTrackRef.current!.getBoundingClientRect();
                        v3ScrollDragRef.current = {
                          on: true,
                          startX: e.clientX,
                          startZoom: [v3Zoom[0], v3Zoom[1]],
                          trackW: rect.width,
                        };
                      }}
                    />
                  </div>
                )}

              </div>
            </div>
            );
          })()}

          {/* ── V4: truly overlaid — bars + line in one ComposedChart ── */}
          {version === 4 && (
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
                <Bar yAxisId="counts" dataKey="unknown"   stackId="a" fill="#d1d5db"               fillOpacity={v3BarOp("unknown")} shape={SeamRect} />

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
            {showParamChanges && v3Layers.paramChanges && (
            <div className="relative h-9 mt-1 mb-1">
              {UNIFIED_V2_DATA.map((d, i) => d.paramChanges > 0 && (
                <div key={i} className="absolute -translate-x-1/2 top-0"
                  style={{ left: paramBadgeX(i, 24, 72) }}>
                  <ParamChangeBadge count={d.paramChanges} onClick={() => openSidebarAt(i)} />
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
                {(["vCore Time","vCore Utilization","Duration","SLA"] as const).map(m => (
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

          {/* ── V5: parameter carpet / heatmap ── */}
          {version === 5 && (() => {
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

          {/* Table — hidden on v5 (carpet has its own detail layer) */}
          {version !== 5 && <div className="border border-border rounded-lg bg-card overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-border">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search in ${V1_RUNS.length} task runs`}
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_0.55fr_0.8fr_40px] px-4 h-10 items-center border-b border-border bg-muted/20">
              {["PIT","Start time","Duration","Transformations","Status","Param changes","Monitors",""].map((col, i) => (
                <div key={i} className="flex items-center gap-1">
                  {col === "Param changes" ? (
                    <div className="flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-violet-400 shrink-0">
                        <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor"/>
                        <rect x="7"   y="0.5" width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                        <rect x="0.5" y="7"   width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.55"/>
                        <rect x="7"   y="7"   width="4.5" height="4.5" rx="1" fill="currentColor" opacity="0.25"/>
                      </svg>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Param changes</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{col}</span>
                      {col === "Start time" && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
                          <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* Scrollable rows body — syncs with chart hover */}
            <div ref={tableBodyRef} className="overflow-y-auto flex-1">
              {filteredRuns.map((run, i) => {
                const isActive = hoveredTableIndices.has(i) || directHoverIndex === i;
                const pcCount = run.paramChanges;
                return (
                <div
                  key={i}
                  ref={el => { rowRefs.current[i] = el; }}
                  onMouseEnter={() => setDirectHoverIndex(i)}
                  onMouseLeave={() => setDirectHoverIndex(null)}
                  className={`grid grid-cols-[2fr_1.2fr_0.8fr_1fr_1fr_0.55fr_0.8fr_40px] px-4 h-10 items-center border-b border-border last:border-b-0 group transition-colors ${
                    isActive
                      ? "bg-primary/10 border-l-[3px] border-l-primary"
                      : "border-l-[3px] border-l-transparent"
                  }`}
                >
                  <span className={`text-[12px] font-mono truncate ${isActive ? "text-primary font-semibold" : "text-foreground"}`}>{run.pit}</span>
                  <span className="text-[12px] text-muted-foreground">{run.startTime}</span>
                  <span className="text-[12px] text-foreground">{formatDuration(run.duration)}</span>
                  <span className="text-[12px] text-muted-foreground/40">—</span>
                  <StatusBadge status={run.status} />
                  <div>
                    {pcCount > 0 ? (
                      <ParamChangeBadge count={pcCount} onClick={() => {}} />
                    ) : (
                      <span className="text-[12px] text-muted-foreground/30">—</span>
                    )}
                  </div>
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

        function closeSidebar() { setSidebarTimeIndex(null); setSidebarSearch(""); setSelectedSidebarParam(null); setSidebarDistinctOpen(false); }

        return (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/20" onClick={closeSidebar} />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full z-50 w-96 bg-white border-l border-border shadow-xl flex flex-col">

              {selectedSidebarParam === null ? (
                /* ── LEVEL 1: params changed at this time point ── */
                <>
                  {/* Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="text-foreground/70 shrink-0">
                          <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.8" />
                          <rect x="7" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.8" />
                          <rect x="0.5" y="7" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.4" />
                          <rect x="7" y="7" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.4" />
                        </svg>
                        <span className="text-[15px] font-semibold text-foreground">Parameter changes</span>
                      </div>
                      <button onClick={closeSidebar} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/40">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[13px] font-mono text-muted-foreground">{run.iso}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {changes.length} param{changes.length !== 1 ? "s" : ""} changed
                      {run.paramChanges > 0 && <> · <span className="text-violet-600 font-medium">{run.paramChanges} total changes</span></>}
                    </p>
                  </div>

                  {/* Search */}
                  <div className="px-4 py-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={sidebarSearch}
                        onChange={e => setSidebarSearch(e.target.value)}
                        placeholder="Search parameters…"
                        className="w-full pl-8 pr-3 py-2 text-[13px] border-2 border-teal-400 rounded-md bg-background text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Param list */}
                  <div className="flex-1 overflow-auto px-4 pb-4">
                    {filteredChanges.length === 0 && (
                      <p className="text-[12px] text-muted-foreground py-8 text-center">No matching parameters</p>
                    )}
                    {filteredChanges.map(({ paramName, count, values }) => (
                      <button
                        key={paramName}
                        onClick={() => { setSelectedSidebarParam(paramName); setOpenSpacers(new Set()); }}
                        className="w-full text-left mb-2 last:mb-0 p-3 rounded-md border border-border hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[12px] font-mono text-foreground font-medium leading-snug break-all">{paramName}</span>
                          <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded shrink-0">{count}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {values.slice(0, 3).map((v, vi) => (
                            <span key={vi} className="text-[11px] font-mono text-muted-foreground bg-muted/40 rounded px-2 py-0.5 truncate">{v}</span>
                          ))}
                          {count > 3 && <p className="text-[10px] text-muted-foreground/60 mt-0.5">+{count - 3} more…</p>}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/50">View history</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* ── LEVEL 2: per-param timeline (ParamsTable style) ── */
                (() => {
                  const paramTimeline = generateParamTimeline(selectedSidebarParam, sidebarTimeIndex);
                  const distinct = [...new Set(paramTimeline.map(e => e.value))];
                  const totalRuns = 5 + paramTimeline.length + paramTimeline.reduce((s, e) => s + (e.runsAfter ?? 0), 0);
                  return (
                    <>
                      {/* Header */}
                      <div className="px-5 pt-5 pb-4 border-b border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              onClick={() => { setSelectedSidebarParam(null); setSidebarDistinctOpen(false); }}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/40 shrink-0 -ml-1"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <div className="flex items-center gap-2 min-w-0">
                              <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="text-foreground/70 shrink-0">
                                <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.8" />
                                <rect x="7" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.8" />
                                <rect x="0.5" y="7" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.4" />
                                <rect x="7" y="7" width="4.5" height="4.5" rx="0.75" fill="currentColor" opacity="0.4" />
                              </svg>
                              <span className="text-[15px] font-semibold text-foreground truncate">Parameter changes over time</span>
                            </div>
                          </div>
                          <button onClick={closeSidebar} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/40 shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[13px] font-medium text-foreground truncate" title={selectedSidebarParam}>{selectedSidebarParam}</p>
                        <div className="mt-1.5 flex items-center gap-x-2 flex-wrap">
                          <span className="text-[12px] text-muted-foreground">1 year</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-[12px] text-muted-foreground">{totalRuns} runs</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-[12px] text-muted-foreground">{paramTimeline.length} changes</span>
                          <span className="text-muted-foreground/40">·</span>
                          <div className="relative flex items-center gap-1" ref={sidebarDistinctRef}>
                            <span className="text-[12px] text-muted-foreground">{distinct.length} distinct values</span>
                            <button
                              onClick={() => setSidebarDistinctOpen(o => !o)}
                              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                            {sidebarDistinctOpen && (
                              <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                                <div className="px-3 py-2 border-b border-border">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Distinct values · {distinct.length}</span>
                                </div>
                                <div className="px-3 py-2 flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                                  {distinct.map((v, i) => (
                                    <span key={i} className="text-[11px] font-mono text-foreground bg-muted/30 border border-border/60 rounded px-2 py-1 truncate" title={v}>{v}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="px-4 py-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className="w-full pl-8 pr-3 py-2 text-[13px] border-2 border-teal-400 rounded-md bg-background text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 overflow-auto px-4 pb-4 pt-1">
                        <div className="relative">
                          {/* Vertical timeline line */}
                          <div className="absolute left-[5px] top-3 bottom-3 w-px bg-border" />

                          {/* Spacer above first entry */}
                          {paramTimeline[0] && (() => {
                            const key = "sidebar-top";
                            const isOpen = openSpacers.has(key);
                            const mockRuns = generateMockRuns(5, paramTimeline[0].pit);
                            return (
                              <div className="mb-1">
                                <button
                                  onClick={() => toggleSpacer(key)}
                                  className="relative flex gap-4 py-0.5 px-0 w-full rounded-md hover:bg-muted/40 transition-colors"
                                >
                                  <div className="relative z-10 w-3 shrink-0 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                  </div>
                                  <div className="flex items-center gap-1 ml-1 py-1">
                                    {isOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground/50" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                                    <span className="text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap">5 runs · no change</span>
                                  </div>
                                </button>
                                {isOpen && (
                                  <div className="ml-7 mt-0.5 mb-1 flex flex-col gap-0.5">
                                    {mockRuns.map((run, ri) => (
                                      <div key={ri} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/40 transition-colors">
                                        <RunStatusSquare status={run.status} />
                                        <span className="text-[11px] font-mono text-muted-foreground">{run.pit}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {paramTimeline.map((entry, i) => (
                            <div key={i}>
                              <div className={`relative flex items-start gap-4 mb-2 ${entry.isCurrent ? "cursor-default" : "group cursor-pointer"}`}>
                                {/* Timeline dot */}
                                <div className="relative z-10 w-3 shrink-0 flex justify-center pt-[13px]">
                                  <div className={`rounded-full border-2 transition-colors ${
                                    entry.isCurrent
                                      ? "w-3 h-3 bg-foreground/70 border-foreground/70"
                                      : "w-2.5 h-2.5 bg-white border-muted-foreground/30 group-hover:border-muted-foreground/60"
                                  }`} />
                                </div>

                                {/* Content card */}
                                <div className={`flex-1 rounded-md px-3 py-2.5 transition-colors border ${
                                  entry.isCurrent ? "bg-background border-border shadow-sm" : "border-transparent hover:bg-muted/50"
                                }`}>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <RunStatusSquare status={entry.status} />
                                      <span className="text-[12px] font-mono text-foreground truncate">{entry.pit}</span>
                                    </div>
                                    {entry.isCurrent && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                                        <Hourglass className="w-2.5 h-2.5" />
                                        Current PIT
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className="inline-block text-[12px] text-foreground bg-background border border-border rounded px-2 py-1 max-w-[240px] truncate group-hover:border-muted-foreground/30 transition-colors"
                                    title={entry.value}
                                  >
                                    {entry.value.length > 38 ? entry.value.slice(0, 38) + "…" : entry.value}
                                  </span>
                                </div>
                              </div>

                              {/* Between-change spacer */}
                              {i < paramTimeline.length - 1 && entry.runsAfter && (() => {
                                const spacerKey = `sidebar-param-${i}`;
                                const isOpen = openSpacers.has(spacerKey);
                                const nextEntry = paramTimeline[i + 1];
                                const mockRuns = generateMockRuns(entry.runsAfter, nextEntry.pit, entry.pit);
                                return (
                                  <div className="mt-1 mb-5">
                                    <button
                                      onClick={() => toggleSpacer(spacerKey)}
                                      className="relative flex gap-4 w-full rounded-md hover:bg-muted/40 transition-colors px-0.5"
                                    >
                                      <div className="relative z-10 w-3 shrink-0 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                      </div>
                                      <div className="flex items-center gap-1 ml-1 py-1">
                                        {isOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground/50" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                                        <span className="text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap">{entry.runsAfter} runs · no change</span>
                                      </div>
                                    </button>
                                    {isOpen && (
                                      <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                                        {mockRuns.map((run, ri) => (
                                          <div key={ri} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/40 transition-colors">
                                            <RunStatusSquare status={run.status} />
                                            <span className="text-[11px] font-mono text-muted-foreground">{run.pit}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          </>
        );
      })()}

    </div>
  );
}
