import { Sparkles, X } from "lucide-react";
import { useState } from "react";

const insights = [
  "Yesterday: 'etl_orders' pipeline failed 4 times — upstream schema change detected Friday",
  "This week: compute spend up 18% vs last week — 3 jobs ran on oversized instances",
  "Since Monday: 5 redundant transforms duplicating writes to 'analytics_events' table",
  "Last 24h: 8 batch jobs ran during peak hours — shifting to off-peak would save ~$420/wk",
];

export const AiInsights = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mx-6 mt-4 mb-0">
      <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2">
        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[12px] font-medium text-primary shrink-0">Dexter insights</span>
        <span className="text-[12px] text-foreground truncate flex-1">{insights[currentIndex]}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {insights.length > 1 && (
            <button
              onClick={() => setCurrentIndex((currentIndex + 1) % insights.length)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
            >
              {currentIndex + 1}/{insights.length} →
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
