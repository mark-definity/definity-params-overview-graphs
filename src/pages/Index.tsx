import { PanelLeftClose, Search, RefreshCw, Moon, LayoutList, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { OverviewPage } from "@/components/OverviewPage";
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

const IconPipelines = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip-sidebar-pipelines)">
      <path d="M19.5 18.25V21.375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 7.625H8.875C8.37772 7.625 7.90081 7.82254 7.54917 8.17417C7.19754 8.52581 7 9.00272 7 9.5C7 9.99728 7.19754 10.4742 7.54917 10.8258C7.90081 11.1775 8.37772 11.375 8.875 11.375H13.25C14.5796 11.3766 15.8742 11.8015 16.9462 12.5881C18.0182 13.3747 18.812 14.4821 19.2125 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.875 7.625H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 3.875H18.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.9017 15.75C14.4461 15.3467 13.8585 15.1243 13.25 15.125H8.875C7.38316 15.125 5.95242 14.5324 4.89752 13.4775C3.84263 12.4226 3.25 10.9918 3.25 9.5C3.25 8.00816 3.84263 6.57742 4.89752 5.52252C5.95242 4.46763 7.38316 3.875 8.875 3.875H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.75 21.375V18.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.875 2.625V8.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 2.625V8.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.5 18.25H20.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip-sidebar-pipelines">
        <rect width="20" height="20" fill="white" transform="translate(2 2)"/>
      </clipPath>
    </defs>
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

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeVersion, setActiveVersion] = useState<1 | 2 | 3 | 4>(1);
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
        {/* Logo */}
        <div className="mr-3 shrink-0 flex items-center">
          <svg width="24" height="22" viewBox="0 0 263 246" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="86" height="44" rx="22" fill="#78DBDB"/>
            <rect x="59" y="68" width="183" height="44" rx="22" fill="#3EDACA"/>
            <rect x="59" y="202" width="141" height="44" rx="22" fill="#007C7C"/>
            <rect y="134" width="263" height="44" rx="22" fill="#23AEB1"/>
            <rect x="99" width="44" height="44" rx="22" fill="#78DBDB"/>
            <rect y="68" width="44" height="44" rx="22" fill="#3EDACA"/>
            <rect y="202" width="44" height="44" rx="22" fill="#007C7C"/>
            <rect x="156" width="44" height="44" rx="22" fill="#78DBDB"/>
          </svg>
        </div>

        {/* Env dropdown */}
        <div className="flex flex-col shrink-0 mr-3">
          <span className="text-[9px] text-muted-foreground/60 leading-none mb-0.5 pl-0.5">Env</span>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 text-[12px] text-foreground hover:bg-muted/50 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/70">
              <rect x="1" y="1" width="4" height="4" rx="0.5" fill="currentColor"/>
              <rect x="7" y="1" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
              <rect x="1" y="7" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5"/>
              <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.3"/>
            </svg>
            <span className="font-medium">Insights</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[12px] text-muted-foreground min-w-0 flex-1">
          <span className="hover:text-foreground cursor-pointer transition-colors shrink-0">Pipelines</span>
          <span className="text-border mx-0.5">/</span>
          {/* Pipeline icon + name */}
          <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground/70">
              <g clipPath="url(#clip-breadcrumb-pipelines)">
                <path d="M19.5 18.25V21.375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 7.625H8.875C8.37772 7.625 7.90081 7.82254 7.54917 8.17417C7.19754 8.52581 7 9.00272 7 9.5C7 9.99728 7.19754 10.4742 7.54917 10.8258C7.90081 11.1775 8.37772 11.375 8.875 11.375H13.25C14.5796 11.3766 15.8742 11.8015 16.9462 12.5881C18.0182 13.3747 18.812 14.4821 19.2125 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.875 7.625H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3.875H18.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.9017 15.75C14.4461 15.3467 13.8585 15.1243 13.25 15.125H8.875C7.38316 15.125 5.95242 14.5324 4.89752 13.4775C3.84263 12.4226 3.25 10.9918 3.25 9.5C3.25 8.00816 3.84263 6.57742 4.89752 5.52252C5.95242 4.46763 7.38316 3.875 8.875 3.875H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.75 21.375V18.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.875 2.625V8.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 2.625V8.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5 18.25H20.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip-breadcrumb-pipelines">
                  <rect width="20" height="20" fill="white" transform="translate(2 2)"/>
                </clipPath>
              </defs>
            </svg>
            categories-machine-type
          </span>
          <span className="text-border mx-0.5">/</span>
          {/* Task name with dropdown */}
          <button className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground/70 shrink-0">
              <path d="M7.5 10.51H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 14.26H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 18.01H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.75 4.5H19.5C19.8978 4.5 20.2794 4.65804 20.5607 4.93934C20.842 5.22064 21 5.60218 21 6V21.75C21 22.1478 20.842 22.5294 20.5607 22.8107C20.2794 23.092 19.8978 23.25 19.5 23.25H4.5C4.10218 23.25 3.72064 23.092 3.43934 22.8107C3.15804 22.5294 3 22.1478 3 21.75V6C3 5.60218 3.15804 5.22064 3.43934 4.93934C3.72064 4.65804 4.10218 4.5 4.5 4.5H8.25C8.25 3.50544 8.64509 2.55161 9.34835 1.84835C10.0516 1.14509 11.0054 0.75 12 0.75C12.9946 0.75 13.9484 1.14509 14.6517 1.84835C15.3549 2.55161 15.75 3.50544 15.75 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4.51099C11.7929 4.51099 11.625 4.34309 11.625 4.13599C11.625 3.92888 11.7929 3.76099 12 3.76099" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 4.51099C12.2071 4.51099 12.375 4.34309 12.375 4.13599C12.375 3.92888 12.2071 3.76099 12 3.76099" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            categories_offline
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0 ml-2">

          {/* Version switcher */}
          <div className="inline-flex items-center bg-zinc-200 rounded-lg p-0.5 gap-0.5 shrink-0">
            {([1, 2, 3, 4] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveVersion(v)}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all font-medium ${
                  activeVersion === v
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                v{v}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-border" />

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
          <OverviewPage version={activeVersion} />
        </div>

        <RightToolbar />
      </div>
    </div>
  );
};

export default Index;
