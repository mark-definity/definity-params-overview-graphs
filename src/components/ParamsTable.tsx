import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, EyeOff, Info, ChevronDown, ChevronRight, X, Hourglass } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const PARAMS = [
  { key: "definity.agent.version", value: "0.70.1", changes: 2, hidden: false },
  { key: "spark.app.id", value: "application_1740744775256_1554594", changes: null, hidden: true },
  { key: "spark.app.name", value: "AmoebaPipeline-IMPRESSION-2025_07_13-1752394624", changes: 81, hidden: false },
  { key: "spark.driver.extraClassPath", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar:libdefinity-spark-agent-2.4-0.70.1.jar:spark-excel_2.12-0.14.0.jar", changes: 2, hidden: false },
  { key: "spark.driver.host", value: "srv-01-34-0230.iad1.nxxn.io", changes: null, hidden: true },
  { key: "spark.driver.port", value: "44990", changes: null, hidden: true },
  { key: "spark.executor.extraClassPath", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar:libdefinity-spark-agent-2.4-0.70.1.jar:spark-excel_2.12-0.14.0.jar", changes: 2, hidden: false },
  { key: "spark.executor.plugins", value: "ai.definity.spark.plugin.executor.DefinityExecutorPlugin", changes: null, hidden: false },
  { key: "spark.org.apache.hadoop.yarn.server.webproxy.amfilter.AmIpFilter.param.PROXY_URI_BA...", value: "http://srv-01-06-0122.iad1.nxxn.io:8088/proxy/application_1740744775256_1554594/history/application_1740744775256_1554594/jobs/", changes: null, hidden: true },
  { key: "spark.yarn.app.container.log.dir", value: "/hadoop11/yarn/container-logs/application_1740744775256_1554594/container_e05_1740744775256_1554594_01_000001", changes: null, hidden: true },
  { key: "spark.yarn.app.id", value: "application_1740744775256_1554594", changes: null, hidden: true },
  { key: "spark.yarn.dist.jars", value: "hdfs://iad-prod-hadoop/amoeba/udf/dmp-udf-1.0.0.jar,hdfs://iad-prod-hadoop/data-platform/definity-spark-agent-2.4-0.70.1.jar", changes: 2, hidden: false },
  { key: "spark.yarn.secondary.jars", value: "dmp-udf-1.0.0.jar,libamoeba-properties.jar,definity-spark-agent-2.4-0.70.1.jar,libdefinity-spark-agent-2.4-0.70.1.jar,spark-excel_2.12-0.14.0.jar", changes: 2, hidden: false },
];

// Mock sidebar history data per param
type RunStatus = "success" | "failed" | "warning" | "partial";

const PARAM_HISTORY: Record<string, { pit: string; date: string; value: string; isCurrent?: boolean; isCompare?: boolean; runsAfter?: number; status?: RunStatus }[]> = {
  "definity.agent.version": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "0.70.1", isCurrent: true, runsAfter: 68, status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "0.69.0", runsAfter: 55, status: "success" },
    { pit: "2025-07-15T09:00:00", date: "Jul 15, 25, 9:00 AM", value: "0.68.5", status: "failed" },
  ],
  "spark.app.name": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_13-1752394624", isCurrent: true, runsAfter: 2, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "AmoebaPipeline-IMPRESSION-2025_07_12-1752308527", runsAfter: 1, status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_11-1752222517", runsAfter: 2, status: "success" },
    { pit: "2025-07-21T08:48:05", date: "Jul 21, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_10-1752136085", runsAfter: 1, status: "failed" },
    { pit: "2025-07-20T20:50:25", date: "Jul 20, 25, 8:50 PM", value: "AmoebaPipeline-IMPRESSION-2025_07_09-1752054625", runsAfter: 2, status: "success" },
    { pit: "2025-07-19T20:48:52", date: "Jul 19, 25, 8:48 PM", value: "AmoebaPipeline-IMPRESSION-2025_07_08-1751968132", runsAfter: 1, status: "warning" },
    { pit: "2025-07-19T08:48:50", date: "Jul 19, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_07-1751881730", runsAfter: 2, status: "success" },
    { pit: "2025-07-18T08:48:10", date: "Jul 18, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_06-1751795290", runsAfter: 1, status: "success" },
    { pit: "2025-07-17T20:48:34", date: "Jul 17, 25, 8:48 PM", value: "AmoebaPipeline-IMPRESSION-2025_07_05-1751709714", runsAfter: 2, status: "partial" },
    { pit: "2025-07-16T20:48:44", date: "Jul 16, 25, 8:48 PM", value: "AmoebaPipeline-IMPRESSION-2025_07_04-1751623124", runsAfter: 1, status: "success" },
    { pit: "2025-07-16T08:49:03", date: "Jul 16, 25, 8:49 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_03-1751536943", runsAfter: 2, status: "failed" },
    { pit: "2025-07-15T08:48:47", date: "Jul 15, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_07_02-1751449727", runsAfter: 1, status: "success" },
    { pit: "2025-07-14T20:48:24", date: "Jul 14, 25, 8:48 PM", value: "AmoebaPipeline-IMPRESSION-2025_07_01-1751363304", runsAfter: 2, status: "success" },
    { pit: "2025-07-13T20:48:50", date: "Jul 13, 25, 8:48 PM", value: "AmoebaPipeline-IMPRESSION-2025_06_30-1751277330", runsAfter: 1, status: "success" },
    { pit: "2025-07-13T08:48:53", date: "Jul 13, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_06_29-1751190933", runsAfter: 2, status: "warning" },
    { pit: "2025-07-12T20:50:18", date: "Jul 12, 25, 8:50 PM", value: "AmoebaPipeline-IMPRESSION-2025_06_28-1751104618", runsAfter: 1, status: "success" },
    { pit: "2025-07-12T08:48:47", date: "Jul 12, 25, 8:48 AM", value: "AmoebaPipeline-IMPRESSION-2025_06_27-1751018527", status: "failed" },
  ],
  "spark.app.id": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "application_1740744775256_1554594", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "application_1740744775256_1554412", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "application_1740744775256_1554231", status: "success" },
    { pit: "2025-07-21T08:48:05", date: "Jul 21, 25, 8:48 AM", value: "application_1740744775256_1553887", status: "failed" },
    { pit: "2025-07-20T20:50:25", date: "Jul 20, 25, 8:50 PM", value: "application_1740744775256_1553644", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "application_1740744775256_1553401", status: "success" },
    { pit: "2025-07-19T20:48:52", date: "Jul 19, 25, 8:48 PM", value: "application_1740744775256_1553102", status: "warning" },
    { pit: "2025-07-19T08:48:50", date: "Jul 19, 25, 8:48 AM", value: "application_1740744775256_1552819", status: "success" },
    { pit: "2025-07-18T08:48:10", date: "Jul 18, 25, 8:48 AM", value: "application_1740744775256_1552501", status: "success" },
    { pit: "2025-07-17T20:48:34", date: "Jul 17, 25, 8:48 PM", value: "application_1740744775256_1552204", status: "partial" },
  ],
  "spark.driver.host": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "srv-01-34-0230.iad1.nxxn.io", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "srv-01-22-0117.iad1.nxxn.io", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "srv-01-18-0304.iad1.nxxn.io", status: "success" },
    { pit: "2025-07-21T08:48:05", date: "Jul 21, 25, 8:48 AM", value: "srv-01-09-0155.iad1.nxxn.io", status: "failed" },
    { pit: "2025-07-20T20:50:25", date: "Jul 20, 25, 8:50 PM", value: "srv-01-41-0088.iad1.nxxn.io", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "srv-01-27-0312.iad1.nxxn.io", status: "success" },
    { pit: "2025-07-19T20:48:52", date: "Jul 19, 25, 8:48 PM", value: "srv-01-05-0201.iad1.nxxn.io", status: "warning" },
    { pit: "2025-07-19T08:48:50", date: "Jul 19, 25, 8:48 AM", value: "srv-01-33-0099.iad1.nxxn.io", status: "success" },
    { pit: "2025-07-18T08:48:10", date: "Jul 18, 25, 8:48 AM", value: "srv-01-12-0274.iad1.nxxn.io", status: "success" },
    { pit: "2025-07-17T20:48:34", date: "Jul 17, 25, 8:48 PM", value: "srv-01-38-0143.iad1.nxxn.io", status: "partial" },
  ],
  "spark.driver.port": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "44990", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "38124", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "41557", status: "success" },
    { pit: "2025-07-21T08:48:05", date: "Jul 21, 25, 8:48 AM", value: "35872", status: "failed" },
    { pit: "2025-07-20T20:50:25", date: "Jul 20, 25, 8:50 PM", value: "43301", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "39648", status: "success" },
    { pit: "2025-07-19T20:48:52", date: "Jul 19, 25, 8:48 PM", value: "46213", status: "warning" },
    { pit: "2025-07-19T08:48:50", date: "Jul 19, 25, 8:48 AM", value: "37790", status: "success" },
    { pit: "2025-07-18T08:48:10", date: "Jul 18, 25, 8:48 AM", value: "42085", status: "success" },
    { pit: "2025-07-17T20:48:34", date: "Jul 17, 25, 8:48 PM", value: "34419", status: "partial" },
  ],
  "spark.yarn.app.id": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "application_1740744775256_1554594", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "application_1740744775256_1554412", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "application_1740744775256_1554231", status: "success" },
    { pit: "2025-07-21T08:48:05", date: "Jul 21, 25, 8:48 AM", value: "application_1740744775256_1553887", status: "failed" },
    { pit: "2025-07-20T20:50:25", date: "Jul 20, 25, 8:50 PM", value: "application_1740744775256_1553644", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "application_1740744775256_1553401", status: "success" },
    { pit: "2025-07-19T20:48:52", date: "Jul 19, 25, 8:48 PM", value: "application_1740744775256_1553102", status: "warning" },
  ],
  "spark.yarn.app.container.log.dir": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "/hadoop11/yarn/container-logs/application_1740744775256_1554594/container_e05_1740744775256_1554594_01_000001", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "/hadoop11/yarn/container-logs/application_1740744775256_1554412/container_e05_1740744775256_1554412_01_000001", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "/hadoop09/yarn/container-logs/application_1740744775256_1554231/container_e05_1740744775256_1554231_01_000001", status: "success" },
    { pit: "2025-07-21T08:48:05", date: "Jul 21, 25, 8:48 AM", value: "/hadoop14/yarn/container-logs/application_1740744775256_1553887/container_e05_1740744775256_1553887_01_000001", status: "failed" },
    { pit: "2025-07-20T20:50:25", date: "Jul 20, 25, 8:50 PM", value: "/hadoop11/yarn/container-logs/application_1740744775256_1553644/container_e05_1740744775256_1553644_01_000001", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "/hadoop07/yarn/container-logs/application_1740744775256_1553401/container_e05_1740744775256_1553401_01_000001", status: "success" },
  ],
  "spark.driver.extraClassPath": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.69.0.jar", status: "success" },
    { pit: "2025-07-15T08:48:47", date: "Jul 15, 25, 8:48 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.68.5.jar", status: "success" },
  ],
  "spark.executor.extraClassPath": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar", status: "success" },
    { pit: "2025-07-22T08:48:37", date: "Jul 22, 25, 8:48 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.70.1.jar", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.69.0.jar", status: "success" },
    { pit: "2025-07-15T08:48:47", date: "Jul 15, 25, 8:48 AM", value: "dmp-udf-1.0.0.jar:libamoeba-properties.jar:definity-spark-agent-2.4-0.68.5.jar", status: "success" },
  ],
  "spark.yarn.dist.jars": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "hdfs://iad-prod-hadoop/amoeba/udf/dmp-udf-1.0.0.jar,hdfs://iad-prod-hadoop/data-platform/definity-spark-agent-2.4-0.70.1.jar", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "hdfs://iad-prod-hadoop/amoeba/udf/dmp-udf-1.0.0.jar,hdfs://iad-prod-hadoop/data-platform/definity-spark-agent-2.4-0.70.1.jar", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "hdfs://iad-prod-hadoop/amoeba/udf/dmp-udf-1.0.0.jar,hdfs://iad-prod-hadoop/data-platform/definity-spark-agent-2.4-0.69.0.jar", status: "success" },
    { pit: "2025-07-15T08:48:47", date: "Jul 15, 25, 8:48 AM", value: "hdfs://iad-prod-hadoop/amoeba/udf/dmp-udf-1.0.0.jar,hdfs://iad-prod-hadoop/data-platform/definity-spark-agent-2.4-0.68.5.jar", status: "success" },
  ],
  "spark.yarn.secondary.jars": [
    { pit: "2025-07-23T08:18:56", date: "Jul 23, 25, 8:18 AM", value: "dmp-udf-1.0.0.jar,libamoeba-properties.jar,definity-spark-agent-2.4-0.70.1.jar", isCurrent: true, status: "success" },
    { pit: "2025-07-22T20:48:47", date: "Jul 22, 25, 8:48 PM", value: "dmp-udf-1.0.0.jar,libamoeba-properties.jar,definity-spark-agent-2.4-0.70.1.jar", status: "success" },
    { pit: "2025-07-20T10:00:00", date: "Jul 20, 25, 10:00 AM", value: "dmp-udf-1.0.0.jar,libamoeba-properties.jar,definity-spark-agent-2.4-0.69.0.jar", status: "success" },
    { pit: "2025-07-15T08:48:47", date: "Jul 15, 25, 8:48 AM", value: "dmp-udf-1.0.0.jar,libamoeba-properties.jar,definity-spark-agent-2.4-0.68.5.jar", status: "success" },
  ],
};

function RunStatusSquare({ status }: { status?: RunStatus }) {
  if (!status) return null;
  if (status === "success") return (
    <span className="inline-block w-2.5 h-2.5 rounded-none bg-emerald-500 shrink-0" title="Success" />
  );
  if (status === "failed") return (
    <span className="inline-block w-2.5 h-2.5 rounded-none bg-red-500 shrink-0" title="Failed" />
  );
  if (status === "warning") return (
    <span className="inline-block w-2.5 h-2.5 rounded-none bg-amber-400 shrink-0" title="Warning" />
  );
  if (status === "partial") return (
    <span className="inline-block w-2.5 h-2.5 rounded-none border-2 border-dashed border-emerald-500 shrink-0" title="Partial" />
  );
  return null;
}

function ChangesBadge({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 transition-colors cursor-pointer"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0">
        <rect x="1" y="1" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="7" y="1" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="1" y="7" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
        <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
      </svg>
      {count}
    </button>
  );
}

export function ParamsTable() {
  const [showHidden, setShowHidden] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedParam, setSelectedParam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PARAMS" | "METRICS" | "SPARK OVERVIEW">("PARAMS");
  const [distinctOpen, setDistinctOpen] = useState(false);
  const [openSpacers, setOpenSpacers] = useState<Set<string>>(new Set());
  const [changedOnly, setChangedOnly] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [basePit, setBasePit] = useState("2025-07-23T08:18:56");
  const [basePitOpen, setBasePitOpen] = useState(false);
  const [basePitSearch, setBasePitSearch] = useState("");
  const [comparePit, setComparePit] = useState<string | null>(null);
  const [comparePitOpen, setComparePitOpen] = useState(false);
  const [comparePitSearch, setComparePitSearch] = useState("");
  const basePitRef = useRef<HTMLDivElement>(null);
  const comparePitRef = useRef<HTMLDivElement>(null);
  const [justSwitched, setJustSwitched] = useState(false);

  // All unique PITs across all history, sorted newest first
  const allPits = Array.from(
    new Map(
      Object.values(PARAM_HISTORY)
        .flat()
        .sort((a, b) => b.pit.localeCompare(a.pit))
        .map(e => [e.pit, e])
    ).values()
  );

  const CURRENT_PIT = "2025-07-23T08:18:56";

  function getValueAtPit(paramKey: string, pit: string, fallback: string): string | null {
    const history = PARAM_HISTORY[paramKey];
    if (!history) return pit === CURRENT_PIT ? fallback : null;
    return history.find(e => e.pit === pit)?.value ?? null;
  }

  function getStatusAtPit(pit: string): RunStatus | undefined {
    for (const entries of Object.values(PARAM_HISTORY)) {
      const e = entries.find(e => e.pit === pit);
      if (e?.status) return e.status;
    }
    return undefined;
  }

  function isCurrentPit(pit: string): boolean {
    return Object.values(PARAM_HISTORY).some(entries => entries.find(e => e.pit === pit && e.isCurrent));
  }

  function formatPitDate(pit: string): string {
    try {
      const d = new Date(pit.replace("T", " "));
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    } catch { return pit; }
  }

  function toggleSpacer(key: string) {
    setOpenSpacers(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function generateMockRuns(count: number, afterPit: string, beforePit?: string): { pit: string; status: RunStatus }[] {
    const after = new Date(afterPit).getTime();
    const before = beforePit ? new Date(beforePit).getTime() : after + count * 12 * 3600 * 1000;
    const statusCycle: RunStatus[] = ["success", "success", "success", "success", "warning", "success", "success", "failed"];
    return Array.from({ length: count }, (_, i) => {
      const t = after + ((before - after) * (i + 1)) / (count + 1);
      const d = new Date(t);
      const pit = d.toISOString().replace(/\.\d{3}Z$/, "").replace("Z", "");
      return { pit, status: statusCycle[i % statusCycle.length] };
    });
  }
  const distinctRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (distinctRef.current && !distinctRef.current.contains(e.target as Node)) setDistinctOpen(false);
      if (basePitRef.current && !basePitRef.current.contains(e.target as Node)) setBasePitOpen(false);
      if (comparePitRef.current && !comparePitRef.current.contains(e.target as Node)) setComparePitOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const visibleParams = PARAMS.filter((p) => {
    if (!showHidden && p.hidden) return false;
    if (changedOnly) {
      if (comparisonMode && comparePit) {
        // Only show rows where both PITs have a known value AND they differ
        const base = getValueAtPit(p.key, basePit, p.value);
        const cmp = getValueAtPit(p.key, comparePit, p.value);
        if (base === null || cmp === null || base === cmp) return false;
      } else if (!comparisonMode) {
        // Normal mode: only show rows with historical changes
        if (!p.changes) return false;
      }
    }
    if (search && !p.key.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedHistory = selectedParam ? (PARAM_HISTORY[selectedParam] ?? []) : [];

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      {/* Task run header */}
      <div className="px-6 pt-5 pb-0 border-b border-border bg-background">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded border border-border bg-muted/30 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" />
                <path d="M5 6h6M5 9h4" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-foreground leading-tight">Impression</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Task run</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0">
          {(["OVERVIEW", "PARAMS", "METRICS", "SPARK OVERVIEW"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12px] font-medium relative flex items-center gap-1.5 transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              {tab}
              {tab === "METRICS" && (
                <>
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="5" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="5" y="3" width="3" height="8" rx="0.5" fill="currentColor"/><rect x="9" y="1" width="3" height="10" rx="0.5" fill="currentColor"/></svg>
                    88
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 6h4M4 8.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    30
                  </span>
                </>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* Main content area: table + optional sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Params table area */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div className="px-6 py-4 w-full min-w-0">
            {/* Controls row */}
            <div className="flex items-center gap-3 mb-4">
              {/* Normal | Compare segmented control */}
              <div className="inline-flex items-center bg-zinc-200 rounded-lg p-0.5 gap-0.5 shrink-0">
                <button
                  onClick={() => { setComparisonMode(false); setComparePit(null); }}
                  className={`px-3 py-1 text-[11px] rounded-md transition-all ${
                    !comparisonMode ? "bg-white shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Single PIT
                </button>
                <button
                  onClick={() => setComparisonMode(true)}
                  className={`px-3 py-1 text-[11px] rounded-md transition-all flex items-center gap-1.5 ${
                    comparisonMode
                      ? `bg-white shadow-sm text-foreground font-medium ${justSwitched ? "ring-2 ring-violet-400 ring-offset-1 scale-110" : ""}`
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16.2801 12.2193L21.2201 17.1593C21.325 17.2642 21.4587 17.3355 21.6042 17.3644C21.7497 17.3932 21.9004 17.3783 22.0374 17.3214C22.1744 17.2646 22.2915 17.1684 22.3739 17.045C22.4562 16.9217 22.5001 16.7767 22.5001 16.6283V6.75034C22.5001 6.60201 22.4562 6.457 22.3739 6.33363C22.2915 6.21026 22.1744 6.11408 22.0374 6.05724C21.9004 6.00041 21.7497 5.98547 21.6042 6.01433C21.4587 6.04318 21.325 6.11452 21.2201 6.21934L16.2801 11.1593C16.2104 11.2289 16.1551 11.3115 16.1174 11.4025C16.0797 11.4934 16.0603 11.5909 16.0603 11.6893C16.0603 11.7878 16.0797 11.8853 16.1174 11.9762C16.1551 12.0672 16.2104 12.1498 16.2801 12.2193Z" />
                    <path d="M7.72 12.2193L2.78 17.1593C2.67505 17.2642 2.54138 17.3355 2.39589 17.3644C2.2504 17.3932 2.09962 17.3783 1.96261 17.3214C1.82561 17.2646 1.70854 17.1684 1.62619 17.045C1.54385 16.9217 1.49993 16.7767 1.5 16.6283V6.75034C1.49993 6.60201 1.54385 6.457 1.62619 6.33363C1.70854 6.21026 1.82561 6.11408 1.96261 6.05724C2.09962 6.00041 2.2504 5.98547 2.39589 6.01433C2.54138 6.04318 2.67505 6.11452 2.78 6.21934L7.72 11.1593C7.78966 11.2289 7.84493 11.3115 7.88264 11.4025C7.92035 11.4934 7.93975 11.5909 7.93975 11.6893C7.93975 11.7878 7.92035 11.8853 7.88264 11.9762C7.84493 12.0672 7.78966 12.1498 7.72 12.2193Z" />
                    <path d="M12 18.5V5" />
                  </svg>
                  Compare PITs
                </button>
              </div>

              {/* Search */}
              <div className="relative flex-none w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search in 13 params"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Filters */}
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-muted-foreground border border-border rounded-md hover:bg-muted/40 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                FILTERS
              </button>

              <div className="flex-1" />

              {/* Changed only toggle — visible in comparison mode only */}
              {comparisonMode && (
                <div className="flex items-center gap-2">
                  <Switch checked={changedOnly} onCheckedChange={setChangedOnly} />
                  <span className="text-[12px] text-foreground">Changed only</span>
                </div>
              )}

              {/* Divider between toggles */}
              <div className="w-px h-5 bg-border" />

              {/* Hidden params toggle */}
              <div className="flex items-center gap-2">
                <Switch checked={showHidden} onCheckedChange={setShowHidden} />
                <span className="text-[12px] text-foreground">Hidden params</span>
              </div>

            </div>

            {/* Table */}
            <div className="w-full border border-border rounded-lg overflow-hidden bg-card">

              {/* ── COMPARISON MODE header with inline PIT pickers ── */}
              {comparisonMode ? (
                <div className="w-full grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-muted/20 h-[40px] items-center">
                  {/* Key header */}
                  <div className="px-4 flex items-center h-full">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Key</span>
                  </div>

                  {[
                    { label: "Base PIT", pit: basePit, setPit: setBasePit, open: basePitOpen, setOpen: setBasePitOpen, ref: basePitRef, search: basePitSearch, setSearch: setBasePitSearch },
                    { label: "Comparison PIT", pit: comparePit, setPit: (v: string) => setComparePit(v), open: comparePitOpen, setOpen: setComparePitOpen, ref: comparePitRef, search: comparePitSearch, setSearch: setComparePitSearch },
                  ].map(({ label, pit, setPit, open, setOpen, ref, search, setSearch }) => {
                    const filtered = allPits.filter(e => e.pit.includes(search));
                    return (
                    <div key={label} className="px-4 border-l border-border flex items-center h-full animate-in slide-in-from-right-8 duration-700">
                      <div className="relative flex items-center gap-1.5" ref={ref}>
                        {/* Label + picker inline */}
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide shrink-0">{label}</span>
                        <button
                          onClick={() => { setOpen(o => !o); setSearch(""); }}
                          className="flex items-center gap-1 hover:text-foreground transition-colors text-foreground ml-0.5"
                        >
                          <RunStatusSquare status={getStatusAtPit(pit ?? "")} />
                          <span className="text-[11px] font-mono text-muted-foreground">{pit ? pit : "—"}</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                        </button>
                        {open && (
                          <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                            {/* Search */}
                            <div className="px-2 py-2 border-b border-border">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                <input
                                  autoFocus
                                  type="text"
                                  value={search}
                                  onChange={e => setSearch(e.target.value)}
                                  placeholder="Search…"
                                  className="w-full pl-7 pr-2 py-1 text-[12px] border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                                />
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {filtered.map((entry) => (
                                <button
                                  key={entry.pit}
                                  onClick={() => { setPit(entry.pit); setOpen(false); setSearch(""); }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-muted/40 transition-colors ${pit === entry.pit ? "bg-muted/30" : ""}`}
                                >
                                  <RunStatusSquare status={entry.status} />
                                  <span className="text-[12px] font-mono text-foreground flex-1">{entry.pit}</span>
                                  {pit === entry.pit && (
                                    <span className="text-[10px] font-medium text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded shrink-0">Selected</span>
                                  )}
                                </button>
                              ))}
                              {filtered.length === 0 && (
                                <div className="px-3 py-3 text-[12px] text-muted-foreground text-center">No matches</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                /* ── NORMAL MODE header ── */
                <div className="grid grid-cols-[1fr_1.4fr_100px] gap-0 border-b border-border bg-muted/20 px-4 h-[40px] items-center">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Key</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Value</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Changes</span>
                    <Info className="w-3 h-3 text-muted-foreground/60" />
                  </div>
                </div>
              )}

              {/* Rows */}
              {visibleParams.map((param) => {
                const baseValue = comparisonMode ? getValueAtPit(param.key, basePit, param.value) : null;
                const cmpValue = comparisonMode && comparePit ? getValueAtPit(param.key, comparePit, param.value) : null;
                const isDifferent = comparisonMode && baseValue !== null && cmpValue !== null && baseValue !== cmpValue;

                return (
                  <div
                    key={param.key}
                    className={`w-full grid gap-0 px-4 h-[40px] items-center border-b border-border last:border-b-0 transition-colors ${
                      comparisonMode ? "grid-cols-[1fr_1fr_1fr]" : "grid-cols-[1fr_1.4fr_100px]"
                    } ${
                      selectedParam === param.key ? "bg-violet-50/50" :
                      isDifferent ? "bg-amber-50/50 hover:bg-amber-50" :
                      "hover:bg-muted/10"
                    }`}
                  >
                    {/* Key */}
                    <div className="flex items-center gap-2 min-w-0 pr-4">
                      {param.hidden && <EyeOff className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
                      <span className={`text-[12px] truncate ${param.hidden ? "text-muted-foreground/60" : "text-foreground"}`} title={param.key}>
                        {param.key}
                      </span>
                    </div>

                    {/* Base / Current value */}
                    <div className={`min-w-0 pr-4 flex items-center ${comparisonMode ? "border-l border-border pl-4" : ""}`}>
                      <span
                        className={`text-[12px] truncate ${param.hidden ? "text-muted-foreground/50" : isDifferent ? "font-medium text-foreground" : "text-foreground"}`}
                        title={comparisonMode ? (baseValue ?? "—") : param.value}
                      >
                        {comparisonMode ? (baseValue ?? <span className="text-muted-foreground/30">—</span>) : param.value}
                      </span>
                    </div>

                    {/* Comparison value or Changes */}
                    {comparisonMode ? (
                      <div className="min-w-0 pr-4 flex items-center border-l border-border pl-4 animate-in slide-in-from-right-8 duration-700">
                        {cmpValue !== null ? (
                          <span
                            className={`text-[12px] truncate ${isDifferent ? "font-medium text-amber-700" : "text-muted-foreground/60"}`}
                            title={cmpValue}
                          >
                            {cmpValue}
                          </span>
                        ) : (
                          <span className="text-[12px] text-muted-foreground/30">{comparePit ? "—" : <span className="italic text-muted-foreground/40 text-[11px]">pick a PIT ↑</span>}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {param.changes !== null && (
                          <ChangesBadge
                            count={param.changes}
                            onClick={() => setSelectedParam(selectedParam === param.key ? null : param.key)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Changes overlay sidebar — full screen height, covers everything */}
        {selectedParam && (
          <div className="fixed top-0 right-0 bottom-0 w-96 bg-white border-l border-border shadow-xl flex flex-col z-50">
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
                  <span className="text-[15px] font-semibold text-foreground">Parameter changes over time</span>
                </div>
                <button
                  onClick={() => setSelectedParam(null)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] font-medium text-foreground truncate" title={selectedParam}>
                {selectedParam}
              </p>
              {(() => {
                const distinct = [...new Set(selectedHistory.map(e => e.value))];
                const totalRuns = 5 + selectedHistory.length + selectedHistory.reduce((s, e) => s + (e.runsAfter ?? 0), 0);
                return (
                  <div className="mt-1.5 flex items-center gap-x-2">
                    <span className="text-[12px] text-muted-foreground">1 year</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[12px] text-muted-foreground">{totalRuns} runs</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[12px] text-muted-foreground">{selectedHistory.length} changes</span>
                    <span className="text-muted-foreground/40">·</span>
                    <div className="relative flex items-center gap-1" ref={distinctRef}>
                      <span className="text-[12px] text-muted-foreground">{distinct.length} distinct values</span>
                      <button
                        onClick={() => setDistinctOpen(o => !o)}
                        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                      {distinctOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                          <div className="px-3 py-2 border-b border-border">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Distinct values · {distinct.length}</span>
                          </div>
                          <div className="px-3 py-2 flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                            {distinct.map((v, i) => (
                              <span key={i} className="text-[11px] font-mono text-foreground bg-muted/30 border border-border/60 rounded px-2 py-1 truncate" title={v}>
                                {v}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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


            {/* History list */}
            <div className="flex-1 overflow-auto px-4 pb-4 pt-1">
              <div className="relative">
                <>
                    {/* Vertical timeline line */}
                    <div className="absolute left-[5px] top-3 bottom-3 w-px bg-border" />
                    {/* Spacer above current PIT */}
                    {(() => {
                      const key = "top";
                      const isOpen = openSpacers.has(key);
                      const firstEntry = selectedHistory[0];
                      const mockRuns = generateMockRuns(5, firstEntry.pit);
                      return (
                        <div className="mb-1">
                          <button
                            onClick={() => toggleSpacer(key)}
                            className="relative flex gap-4 py-0.5 px-0 w-full group/spacer rounded-md hover:bg-muted/40 transition-colors"
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
                </>

                {selectedHistory.map((entry, i) => (
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

                    {/* Content */}
                    <div className={`flex-1 rounded-md px-3 py-2.5 transition-colors border ${
                      entry.isCurrent ? "bg-background border-border shadow-sm" : "border-transparent hover:bg-muted/50"
                    }`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <RunStatusSquare status={entry.status} />
                          <span className="text-[12px] font-mono text-foreground">{entry.pit}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {entry.isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <Hourglass className="w-2.5 h-2.5" />
                              Current PIT
                            </span>
                          )}
                          {comparePit && entry.pit === comparePit ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded">
                              Compare PIT
                            </span>
                          ) : !entry.isCurrent && (
                            <button
                              onClick={() => {
                                setComparePit(entry.pit);
                                setComparisonMode(true);
                                setSelectedParam(null);
                                setJustSwitched(true);
                                setTimeout(() => setJustSwitched(false), 1200);
                              }}
                              className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded hover:bg-violet-100 transition-all"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                <path d="M16.2801 12.2193L21.2201 17.1593C21.325 17.2642 21.4587 17.3355 21.6042 17.3644C21.7497 17.3932 21.9004 17.3783 22.0374 17.3214C22.1744 17.2646 22.2915 17.1684 22.3739 17.045C22.4562 16.9217 22.5001 16.7767 22.5001 16.6283V6.75034C22.5001 6.60201 22.4562 6.457 22.3739 6.33363C22.2915 6.21026 22.1744 6.11408 22.0374 6.05724C21.9004 6.00041 21.7497 5.98547 21.6042 6.01433C21.4587 6.04318 21.325 6.11452 21.2201 6.21934L16.2801 11.1593C16.2104 11.2289 16.1551 11.3115 16.1174 11.4025C16.0797 11.4934 16.0603 11.5909 16.0603 11.6893C16.0603 11.7878 16.0797 11.8853 16.1174 11.9762C16.1551 12.0672 16.2104 12.1498 16.2801 12.2193Z" />
                                <path d="M7.72 12.2193L2.78 17.1593C2.67505 17.2642 2.54138 17.3355 2.39589 17.3644C2.2504 17.3932 2.09962 17.3783 1.96261 17.3214C1.82561 17.2646 1.70854 17.1684 1.62619 17.045C1.54385 16.9217 1.49993 16.7767 1.5 16.6283V6.75034C1.49993 6.60201 1.54385 6.457 1.62619 6.33363C1.70854 6.21026 1.82561 6.11408 1.96261 6.05724C2.09962 6.00041 2.2504 5.98547 2.39589 6.01433C2.54138 6.04318 2.67505 6.11452 2.78 6.21934L7.72 11.1593C7.78966 11.2289 7.84493 11.3115 7.88264 11.4025C7.92035 11.4934 7.93975 11.5909 7.93975 11.6893C7.93975 11.7878 7.92035 11.8853 7.88264 11.9762C7.84493 12.0672 7.78966 12.1498 7.72 12.2193Z" />
                                <path d="M12 18.5V5" />
                              </svg>
                              Compare
                            </button>
                          )}
                        </div>
                      </div>
                      <span
                        className="inline-block text-[12px] text-foreground bg-background border border-border rounded px-2 py-1 max-w-[280px] truncate group-hover:border-muted-foreground/30 transition-colors"
                        title={entry.value}
                      >
                        {entry.value === "undefined" ? (
                          <span className="text-muted-foreground italic">undefined</span>
                        ) : (
                          entry.value.length > 45 ? entry.value.slice(0, 45) + "…" : entry.value
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Between-change spacer */}
                  {i < selectedHistory.length - 1 && entry.runsAfter && (() => {
                    const key = String(i);
                    const isOpen = openSpacers.has(key);
                    const nextEntry = selectedHistory[i + 1];
                    const mockRuns = generateMockRuns(entry.runsAfter, nextEntry.pit, entry.pit);
                    return (
                      <div className="mt-1 mb-5">
                        <button
                          onClick={() => toggleSpacer(key)}
                          className="relative flex gap-4 w-full group/spacer rounded-md hover:bg-muted/40 transition-colors px-0.5"
                        >
                          <div className="relative z-10 w-3 shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                          </div>
                          <div className="flex items-center gap-1 ml-1 py-1">
                            {isOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground/50" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                            <span className="text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap">
                              {entry.runsAfter} runs · no change
                            </span>
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
          </div>
        )}
      </div>
    </div>
  );
}
