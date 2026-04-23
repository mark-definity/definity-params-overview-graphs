import { Info, MessageCircle, AlertTriangle, Workflow, Maximize2, GitCompareArrows, PanelRightClose } from "lucide-react";

const items = [
  { icon: Info, dot: null },
  { icon: MessageCircle, dot: "bg-cyan-400" },
  { icon: AlertTriangle, dot: "bg-red-500" },
  { icon: Workflow, dot: null },
  { icon: Maximize2, dot: null },
  { icon: GitCompareArrows, dot: null },
  { icon: PanelRightClose, dot: null },
];

export const RightToolbar = () => (
  <div className="w-10 border-l border-border bg-card flex flex-col items-center py-3 gap-4 shrink-0">
    {items.map((item, i) => {
      const Icon = item.icon;
      return (
        <button key={i} className="relative p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Icon className="w-4 h-4" />
          {item.dot && (
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${item.dot}`} />
          )}
        </button>
      );
    })}
  </div>
);
