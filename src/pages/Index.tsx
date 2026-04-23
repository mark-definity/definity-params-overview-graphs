import { PanelLeftClose, Search, RefreshCw, Moon, LayoutList, ChevronDown, ChevronUp, Hourglass } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ParamsTable } from "@/components/ParamsTable";
import { RightToolbar } from "@/components/RightToolbar";
import appLogo from "@/assets/logo.png";

// ── Streamline Ultimate icons (from Design System) ──────────────────────────

// Dashboard tiles — Layers-Grid-Settings--Streamline-Ultimate style
const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="8" height="8" rx="1.5"/>
    <rect x="13.5" y="2.5" width="8" height="8" rx="1.5"/>
    <rect x="2.5" y="13.5" width="8" height="8" rx="1.5"/>
    <rect x="13.5" y="13.5" width="8" height="8" rx="1.5"/>
  </svg>
);

// Construction-Pipe--Streamline-Ultimate
const IconPipelines = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h5"/>
    <path d="M16 6h5"/>
    <path d="M8 6a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4"/>
    <path d="M16 18h5"/>
    <circle cx="8" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);

// Compute — hexagonal module (Science-Chemistry-Molecule style)
const IconCompute = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// Runs — hourglass (Time-Hourglass--Streamline-Ultimate)
const IconRuns = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2h14"/>
    <path d="M5 22h14"/>
    <path d="M5 2c0 6 14 6 14 10S5 16 5 22"/>
    <path d="M19 2c0 6-14 6-14 10s14 6 14 10"/>
  </svg>
);

// Compare Runs — Reflect-Right--Streamline-Ultimate (matches compare button icon)
const IconCompareRuns = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5L9 12L3 19"/>
    <path d="M21 5L15 12L21 19"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

// Datasets — Database-2--Streamline-Ultimate (stacked cylinders)
const IconDatasets = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="8" ry="3"/>
    <path d="M4 5v5c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/>
    <path d="M4 10v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5"/>
  </svg>
);

// Alerts — Alert-Triangle--Streamline-Ultimate
const IconAlerts = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 8v5"/>
    <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none"/>
  </svg>
);

type SidebarPage = "Dashboard" | "Pipelines" | "Compute" | "Runs" | "Compare Runs" | "Datasets" | "Alerts";

const NAV_ITEMS: { icon: () => JSX.Element; label: SidebarPage }[] = [
  { icon: IconDashboard, label: "Dashboard" },
  { icon: IconPipelines, label: "Pipelines" },
  { icon: IconCompute, label: "Compute" },
  { icon: IconRuns, label: "Runs" },
  { icon: IconCompareRuns, label: "Compare Runs" },
  { icon: IconDatasets, label: "Datasets" },
  { icon: IconAlerts, label: "Alerts" },
];

const PIT_LIST = [
  "2025-07-23T08:18:56",
  "2025-07-22T20:48:47",
  "2025-07-22T08:48:37",
  "2025-07-21T20:48:33",
  "2025-07-21T08:48:05",
  "2025-07-20T20:50:25",
  "2025-07-20T08:48:28",
  "2025-07-19T20:48:52",
  "2025-07-19T08:48:50",
  "2025-07-18T20:48:36",
  "2025-07-18T08:48:10",
  "2025-07-17T20:48:34",
  "2025-07-17T08:48:13",
  "2025-07-16T20:48:44",
  "2025-07-16T08:49:03",
  "2025-07-15T19:19:23",
  "2025-07-15T08:48:47",
  "2025-07-14T20:48:24",
  "2025-07-14T08:48:40",
  "2025-07-13T20:48:50",
  "2025-07-13T08:48:53",
  "2025-07-12T20:50:18",
  "2025-07-12T08:48:47",
];

type SidebarPage = "Dashboard" | "Pipelines" | "Compute" | "Runs" | "Compare Runs" | "Datasets" | "Alerts";


const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pitOpen, setPitOpen] = useState(false);
  const [pitSearch, setPitSearch] = useState("");
  const [selectedPit, setSelectedPit] = useState(PIT_LIST[0]);
  const pitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pitRef.current && !pitRef.current.contains(e.target as Node)) {
        setPitOpen(false);
        setPitSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredPits = PIT_LIST.filter(p => p.includes(pitSearch));

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top bar */}
      <header className="h-11 border-b border-border flex items-center px-3 shrink-0 bg-white gap-0">
        {/* Hamburger / logo */}
        <button className="p-1.5 mr-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>

        {/* Env dropdown */}
        <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 text-[12px] text-foreground hover:bg-muted/50 transition-colors shrink-0 mr-3">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/70">
            <rect x="1" y="1" width="4" height="4" rx="0.5" fill="currentColor"/>
            <rect x="7" y="1" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
            <rect x="1" y="7" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
            <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.3"/>
          </svg>
          <span className="font-medium">Insights</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[12px] text-muted-foreground min-w-0 flex-1">
          <span className="hover:text-foreground cursor-pointer transition-colors shrink-0">Pipelines</span>
          <span className="text-border mx-0.5">/</span>
          {/* Pipeline icon + name */}
          <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors shrink-0">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/70">
              <circle cx="3" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <circle cx="11" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <line x1="5" y1="7" x2="9" y2="7" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            impression-skew
          </span>
          <span className="text-border mx-0.5">/</span>
          {/* Task name with dropdown */}
          <button className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors shrink-0">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/70">
              <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M4 5.5h6M4 8h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            Impression
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          <span className="text-border mx-0.5">/</span>
          {/* PIT with dropdown */}
          <div className="relative shrink-0" ref={pitRef}>
            <button
              onClick={() => { setPitOpen(!pitOpen); setPitSearch(""); }}
              className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition-colors text-foreground"
            >
              <Hourglass className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-mono">{selectedPit}</span>
              {pitOpen
                ? <ChevronUp className="w-3 h-3 text-muted-foreground" />
                : <ChevronDown className="w-3 h-3 text-muted-foreground" />
              }
            </button>

            {pitOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      autoFocus
                      type="text"
                      value={pitSearch}
                      onChange={e => setPitSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-[13px] border-2 border-teal-400 rounded-md bg-background text-foreground focus:outline-none"
                    />
                  </div>
                </div>
                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredPits.map(pit => (
                    <div
                      key={pit}
                      onClick={() => { setSelectedPit(pit); setPitOpen(false); setPitSearch(""); }}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                        pit === selectedPit ? "bg-teal-50" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="w-1 h-4 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[13px] font-mono text-foreground">{pit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Search */}
          <button className="flex items-center gap-2 px-2.5 py-1 border border-border rounded-md bg-background text-muted-foreground hover:bg-muted/30 transition-colors">
            <Search className="w-3.5 h-3.5" />
            <span className="text-[12px]">search...</span>
            <span className="text-[10px] bg-muted px-1 py-0.5 rounded text-muted-foreground/70 font-mono">⌘K</span>
          </button>

          {/* Time Window */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-muted-foreground/60 leading-none mb-0.5">Time Window</span>
            <button className="flex items-center gap-1.5 px-2 py-1 border border-border rounded-md bg-background text-[12px] text-foreground hover:bg-muted/30 transition-colors">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/70">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Last 1 year
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          <div className="h-5 w-px bg-border" />
          <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          <Moon className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          <LayoutList className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-background text-[12px] font-semibold">M</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className={`${sidebarCollapsed ? "w-12" : "w-44"} border-r border-border bg-background flex flex-col shrink-0 transition-all duration-200`}>
          {!sidebarCollapsed && (
            <div className="px-3 pt-3 pb-1">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground/60 uppercase">Main</span>
            </div>
          )}
          <nav className="flex flex-col gap-0.5 px-2 mt-1">
            {NAV_ITEMS.map(({ icon: Icon, label }) => {
              const isActive = label === "Pipelines";
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] select-none transition-colors ${sidebarCollapsed ? "justify-center" : ""} ${
                    isActive
                      ? "bg-primary/10 text-foreground font-medium cursor-pointer"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                  title={sidebarCollapsed ? label : ""}
                >
                  <span className="shrink-0"><Icon /></span>
                  {!sidebarCollapsed && <span>{label}</span>}
                </div>
              );
            })}
          </nav>
          <div
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mt-auto p-3 flex items-center gap-2 border-t border-border cursor-pointer text-muted-foreground hover:text-foreground transition-colors justify-center"
          >
            <PanelLeftClose className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-[13px]">Collapse</span>}
          </div>
        </aside>

        {/* Main content — always Pipelines / Params */}
        <div className="flex-1 flex overflow-hidden">
          <ParamsTable />
        </div>

        <RightToolbar />
      </div>
    </div>
  );
};

export default Index;
