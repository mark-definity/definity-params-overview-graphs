import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Clock, MessageSquarePlus, Copy, RotateCcw, Pencil, ChevronDown, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import dexterAvatar from "@/assets/dexter-icon.svg";
import { Button } from "@/components/ui/button";

interface ContextTag {
  label: string;
  value: string;
}

interface FunctionCall {
  name: string;
  status: "running" | "done" | "pending";
  input?: string;
  output?: string;
}

interface LoadedSource {
  type: "context" | "asset" | "memory";
  label: string;
  detail?: string;
}

interface ThinkingBlock {
  durationLabel: string;
  skillBadge?: string;
  functionCalls: FunctionCall[];
  loadedSources?: LoadedSource[];
}

interface MessageContent {
  text?: string;
  thinking?: ThinkingBlock;
  codeBlock?: string;
  table?: { headers: string[]; rows: string[][] };
}

interface Message {
  id: string;
  role: "user" | "ai" | "context_change";
  content: string;
  richContent?: MessageContent[];
  contextLabel?: string;
  contextDetails?: { from: string; to: string }[];
  attachedContext?: ContextTag[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "what costs $226k?",
  },
  {
    id: "2",
    role: "ai",
    content: "",
    richContent: [
      {
        thinking: {
          durationLabel: "2m 14s",
          skillBadge: "/optimize",
          functionCalls: [
            {
              name: "get_pipeline_cost_breakdown()",
              status: "done",
              input: `{\n  "pipeline": "labeled-spill-partitions",\n  "environment": "insights",\n  "time_range": "2025-08-01 - 2025-08-31"\n}`,
              output: `{\n  "total_cost": 226950,\n  "tasks": [\n    {\n      "task_name": "labeled_presentation_explicit_view",\n      "cost": 113475,\n      "hours": 1513\n    },\n    {\n      "task_name": "labeled_presentation_explicit_view_fix_date",\n      "cost": 113475,\n      "hours": 1514\n    }\n  ]\n}`,
            },
            {
              name: "get_insights()",
              status: "done",
              input: `{\n  "pipeline": "labeled-spill-partitions",\n  "category": "code_improvements"\n}`,
              output: `{\n  "insights": [\n    {\n      "type": "duplicate_task",\n      "severity": "critical",\n      "estimated_savings": 226950,\n      "description": "Two tasks execute identical business logic"\n    }\n  ]\n}`,
            },
          ],
          loadedSources: [
            { type: "context", label: "Page", detail: "Pipelines" },
            { type: "context", label: "Pipeline", detail: "labeled-spill-partitions" },
            { type: "context", label: "Environment", detail: "Insights" },
            { type: "context", label: "Time Range", detail: "2025-08-01 – 2025-08-31" },
            { type: "asset", label: "Pipeline schema", detail: "labeled-spill-partitions.yaml" },
            { type: "memory", label: "Previous optimization", detail: "Session from Aug 12" },
          ],
        },
      },
      {
        text: `The $226,950 figure comes from the Code Improvements insight on the \`labeled_presentation_explicit_view\` task in the \`labeled-spill-partitions\` pipeline.

---

What's happening:

\`labeled_presentation_explicit_view\` is a complete duplicate of \`labeled_presentation_explicit_view_fix_date\` in the same pipeline. Definity's deep analysis confirms they execute identical business logic — same SQL, same 6 Delta input tables (reading ~219 TB total), same 70+ output columns, same window functions and joins — and write to two different S3 paths. The only difference is the output destination; despite the \`_fix_date\` suffix implying different logic, the transformations are identical.

The cost:

• ~3,027 hours of combined execution time (~1,513 hours per task)
• ~219 TB of data read per run (identical sources read twice)
• 73.4 billion rows written per destination (146.8B total)
• $226,950 burned entirely on duplicate compute`,
      },
      {
        text: "Recommended fix options (ranked by effort):",
        table: {
          headers: ["Option", "Approach", "Effort"],
          rows: [
            [
              "1. Compute once, write twice",
              "Cache the result DataFrame, write to both destinations in one task",
              "Low — single code change",
            ],
            [
              "2. Eliminate one task",
              "Migrate downstream consumers of _fix_date to the original table, deprecate the duplicate",
              "Medium — requires consumer audit",
            ],
            [
              "3. Intermediate table",
              "Write to a shared temp table, fan out via lightweight downstream tasks",
              "Low-Medium — if memory allows",
            ],
          ],
        },
      },
      {
        text: "Option 1 is the quickest win:",
        codeBlock: `result = spark.read.format("delta") \\
    .join(...) \\
    .select(...) \\
    .cache()

result.count()   # Materialize

result.write.format("delta").mode("overwrite") \\
    .save("s3://orange-datalake/...path_a")

result.write.format("delta").mode("overwrite") \\
    .save("s3://orange-datalake/...path_b")

result.unpersist()`,
      },
      {
        text: "Before committing, verify whether downstream consumers actually need both tables or if they can be consolidated onto the original. If they can, Option 2 gets you the full $226K back plus eliminates the 331 GB duplicate storage.",
      },
    ],
  },
  {
    id: "3",
    role: "context_change",
    content: "Context changed",
    contextDetails: [
      { from: "Tab: cost", to: "Tab: params" },
      { from: "Task: labeled_presentation_explicit_view", to: "Task: feature_generation_daily" },
    ],
  },
  {
    id: "4",
    role: "user",
    content: "why is this task using 3x more compute than last month?",
  },
  {
    id: "5",
    role: "ai",
    content: "",
    richContent: [
      {
        thinking: {
          durationLabel: "47s",
          functionCalls: [
            {
              name: "get_task_history()",
              status: "done",
              input: `{\n  "task": "feature_generation_daily",\n  "months": ["2025-07", "2025-08"]\n}`,
              output: `{\n  "2025-07": { "hours": 412, "cost": 30900 },\n  "2025-08": { "hours": 1247, "cost": 93525 }\n}`,
            },
          ],
          loadedSources: [
            { type: "context", label: "Tab", detail: "params" },
            { type: "context", label: "Task", detail: "feature_generation_daily" },
            { type: "asset", label: "Schema changelog", detail: "raw_events_v2.diff" },
          ],
        },
      },
      {
        text: `The \`feature_generation_daily\` task jumped from 412 hours ($30.9K) in July to 1,247 hours ($93.5K) in August — a 3× increase.

Root cause: a schema change on \`raw_events\` added 14 new columns on Aug 3rd. The downstream \`SELECT *\` in this task now reads ~40% more data per scan, and the window functions over \`user_id\` partitions are doing significantly more work per row.

Quick fix: pin the column list explicitly instead of using \`SELECT *\`, dropping the 14 unused columns. Estimated savings: ~$60K/month.`,
      },
    ],
  },
];

const PAGE_CONTEXT: Record<string, ContextTag[]> = {
  Dashboard: [
    { label: "Env", value: "Insights" },
    { label: "Time", value: "Last 1 year" },
  ],
  Pipelines: [
    { label: "Env", value: "Insights" },
    { label: "Pipeline", value: "labeled-spill-partitions" },
    { label: "Time", value: "2025-08-01 - 2025-08-31" },
  ],
  Compute: [
    { label: "Env", value: "Insights" },
    { label: "Resource", value: "Compute clusters" },
  ],
  Runs: [
    { label: "Env", value: "Insights" },
    { label: "View", value: "All runs" },
  ],
  "Compare Runs": [
    { label: "Env", value: "Insights" },
    { label: "Run A", value: "run-2025-08-14" },
    { label: "Run B", value: "run-2025-08-13" },
  ],
  Datasets: [
    { label: "Env", value: "Insights" },
    { label: "View", value: "All datasets" },
  ],
  Alerts: [
    { label: "Env", value: "Insights" },
    { label: "Filter", value: "Active alerts" },
  ],
};

const CONTEXT_TAGS: ContextTag[] = [
  { label: "Page", value: "Pipelines" },
  { label: "Environment", value: "Insights" },
  { label: "Pipeline", value: "labeled-spill-partitions" },
  { label: "Time", value: "2025-08-01 - 2025-08-31" },
  { label: "Tab", value: "cost" },
  { label: "Task Name", value: "labeled_presentation_explicit_v..." },
];

function copyContextToClipboard(tags: ContextTag[]) {
  const params = new URLSearchParams();
  tags.forEach((t) => params.set(t.label.toLowerCase().replace(/\s+/g, "_"), t.value));
  const deepLink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(deepLink);
}

function StepAccordion({ label, done, spinning, children }: { label: string; done: boolean; spinning: boolean; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => done && setOpen((o) => !o)}
        className={`flex items-center gap-1.5 w-full py-1.5 px-2 -mx-2 rounded text-[11px] text-muted-foreground/60 transition-colors ${done ? 'hover:bg-muted/60 hover:text-muted-foreground cursor-pointer' : 'cursor-default'}`}
      >
        {spinning ? (
          <svg className="w-3 h-3 animate-spin shrink-0" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="#00B4A6" strokeWidth="4" strokeDasharray="25 75" strokeLinecap="round" />
          </svg>
        ) : (
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronDown className="w-3 h-3 shrink-0 opacity-40" style={{ transform: 'rotate(-90deg)' }} />
          </motion.div>
        )}
        <span>{label}</span>
      </button>
      <AnimatePresence>
        {open && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-[9px]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThinkingIndicator({ phase }: { phase: "reasoning" | "loading" | "thinking" | "done" }) {
  const reasoningDone = phase !== "reasoning";
  const loadingDone = phase !== "loading" && phase !== "reasoning";
  const thinkingDone = phase === "done";




  const loadingFunctionCalls: FunctionCall[] = [
    {
      name: "get_pipeline_cost_breakdown()",
      status: "done",
      input: `{\n  "pipeline": "labeled-spill-partitions",\n  "environment": "insights",\n  "time_range": "2025-08-01 - 2025-08-31"\n}`,
      output: `{\n  "total_cost": 226950,\n  "tasks": [\n    { "task_name": "labeled_presentation_explicit_view", "cost": 113475, "hours": 1513 },\n    { "task_name": "labeled_presentation_explicit_view_fix_date", "cost": 113475, "hours": 1514 }\n  ]\n}`,
    },
    {
      name: "get_insights()",
      status: "done",
      input: `{\n  "pipeline": "labeled-spill-partitions",\n  "category": "code_improvements"\n}`,
      output: `{\n  "insights": [\n    {\n      "type": "duplicate_task",\n      "severity": "critical",\n      "estimated_savings": 226950\n    }\n  ]\n}`,
    },
  ];

  const thinkingSteps = [
    "Comparing task execution patterns across July and August",
    "Evaluating duplicate compute paths for consolidation",
    "Ranking optimization options by effort and savings impact",
  ];

  return (
    <div className="space-y-0.5">
      <StepAccordion
        label={phase === "reasoning" ? "Reasoning…" : "Reasoning · 2m 14s"}
        done={reasoningDone}
        spinning={phase === "reasoning"}
      >
        <div className="relative">
          <div className="absolute left-0 top-0 h-[14px] w-px bg-border" />
          <div className="absolute left-0 top-[14px] w-3 h-px bg-border" />
          <div className="ml-5 py-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Loaded skill <code className="font-mono">/optimize</code>
            </span>
          </div>
        </div>
      </StepAccordion>

      {phase !== "reasoning" && (
        <StepAccordion
          label={phase === "loading" ? "Loading Sources…" : "Loaded Sources · 2"}
          done={loadingDone}
          spinning={phase === "loading"}
        >
          {loadingFunctionCalls.map((fn, i) => (
            <FunctionCallAccordion key={i} fn={fn} isLast={i === loadingFunctionCalls.length - 1} />
          ))}
        </StepAccordion>
      )}

      {(phase === "thinking" || phase === "done") && (
        <StepAccordion
          label={phase === "thinking" ? "Thinking…" : "Thinking · 1.2s"}
          done={thinkingDone}
          spinning={phase === "thinking"}
        >
          {thinkingSteps.map((step, i) => (
            <div key={i} className="relative">
              <div className="absolute left-0 top-[14px] w-3 h-px bg-border" />
              {i < thinkingSteps.length - 1 && <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />}
              {i === thinkingSteps.length - 1 && <div className="absolute left-0 top-0 h-[14px] w-px bg-border" />}
              <div className="ml-5 py-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {step}
              </div>
            </div>
          ))}
        </StepAccordion>
      )}
    </div>
  );
}

function ContextPreamble() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        className="group flex items-center gap-1.5 w-full py-2 px-2 -mx-2 rounded text-[11px] text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown className="h-3 w-3" style={{ transform: 'rotate(-90deg)' }} />
        </motion.div>
        <span className="flex-1">Context loaded · {CONTEXT_TAGS.length} items</span>
        <button
          onClick={(e) => { e.stopPropagation(); copyContextToClipboard(CONTEXT_TAGS); }}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          title="Copy context deep link"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); window.open(window.location.href, '_blank'); }}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          title="Open in new tab"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-[9px] border-l border-border">
              {CONTEXT_TAGS.map((tag, i) => (
                <div key={tag.label} className="relative pl-4 py-0.5 text-[11px] text-muted-foreground/70">
                  <div className="absolute left-0 top-1/2 w-3 h-px bg-border" />
                  <span className="text-foreground/40">{tag.label}</span>
                  <span className="mx-1">=</span>
                  <span className="text-foreground/60">"{tag.value}"</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContextTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShow((s) => !s)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        ✎ Context
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full right-0 mb-2 w-64 rounded-lg bg-foreground text-background p-3 text-[11px] space-y-0.5 shadow-xl z-10"
          >
            <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-foreground" />
            {CONTEXT_TAGS.map((tag) => (
              <div key={tag.label}>
                <span className="opacity-60">{tag.label}</span>
                <span className="mx-1">=</span>
                <span>"{tag.value}"</span>
              </div>
            ))}
            <div className="pt-1.5 mt-1.5 border-t border-background/20">
              <button className="text-[10px] opacity-70 hover:opacity-100 transition-opacity">
                Open original page
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function ContextChangeSection({ msg }: { msg: Message }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        className="group flex items-center gap-1.5 w-full py-2 px-2 -mx-2 rounded text-[11px] text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronDown className="h-3 w-3" style={{ transform: 'rotate(-90deg)' }} />
        </motion.div>
        <span className="flex-1">Context changed · {msg.contextDetails?.length} updates</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const contextStr = msg.contextDetails?.map((d) => `${d.to}`).join("\n") || "";
            const deepLink = `${window.location.origin}${window.location.pathname}?context=${encodeURIComponent(contextStr)}`;
            navigator.clipboard.writeText(deepLink);
          }}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          title="Copy context deep link"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); window.open(window.location.href, '_blank'); }}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          title="Open in new tab"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mx-auto w-fit ml-[9px] border-l border-border">
              {msg.contextDetails?.map((d, i) => (
                <div key={i} className="relative pl-4 py-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  <div className="absolute left-0 top-1/2 w-3 h-px bg-border" />
                  <span className="text-foreground/40">{d.from.split(": ")[0]}:</span>
                  <span className="line-through opacity-50">{d.from.split(": ")[1]}</span>
                  <span className="opacity-40">→</span>
                  <span className="text-foreground/60">{d.to.split(": ")[1]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttachedContextAccordion({ context }: { context: ContextTag[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <div
        className="group flex items-center gap-1.5 w-full py-1.5 px-2 rounded text-[11px] text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="h-3 w-3" style={{ transform: 'rotate(-90deg)' }} />
        </motion.div>
        <span className="flex-1">Chat context · {context.length} items</span>
        <button
          onClick={(e) => { e.stopPropagation(); copyContextToClipboard(context); }}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-[9px] border-l border-border">
              {context.map((tag) => (
                <div key={tag.label + tag.value} className="relative pl-4 py-0.5 text-[11px] text-muted-foreground/70">
                  <div className="absolute left-0 top-1/2 w-3 h-px bg-border" />
                  <span className="text-foreground/60">{tag.label}:</span>
                  <span className="text-foreground/80 ml-0.5">{tag.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputContextBar({ context, open, onToggle }: { context: ContextTag[]; open: boolean; onToggle: () => void }) {
  return (
    <div>
      <div
        className="group flex items-center gap-1.5 w-full py-1.5 px-2 rounded text-[11px] text-muted-foreground/60 hover:bg-muted/40 hover:text-muted-foreground transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="h-3 w-3" />
        </motion.div>
        <span className="flex-1">Chat context · {context.length} items</span>
        <button
          onClick={(e) => { e.stopPropagation(); copyContextToClipboard(context); }}
          className="p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-0.5">
              {context.map((tag) => (
                <div key={tag.label + tag.value} className="flex items-center gap-1 text-[11px] text-muted-foreground/70 pl-2">
                  <span className="text-foreground/60">{tag.label}:</span>
                  <span className="text-foreground/80">{tag.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RichMessage({ msg }: { msg: Message }) {
  if (msg.role === "context_change") {
    return <ContextChangeSection msg={msg} />;
  }

  if (msg.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        {msg.attachedContext && msg.attachedContext.length > 0 && (
          <AttachedContextAccordion context={msg.attachedContext} />
        )}
        <div className="max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed text-foreground" style={{ backgroundColor: 'hsl(195, 53%, 95%)' }}>
          <p>{msg.content}</p>
          <div className="flex items-center justify-end gap-1 mt-2 -mb-1">
            <button className="text-foreground/50 hover:text-foreground p-0.5 transition-colors">
              <Copy className="h-3 w-3" />
            </button>
            <button className="text-foreground/50 hover:text-foreground p-0.5 transition-colors">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI message with rich content
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground">
      {msg.richContent?.map((block, i) => (
        <RichBlock key={i} block={block} />
      ))}
      {/* Copy / Retry footer */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
        <button className="text-muted-foreground hover:text-foreground p-1">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button className="text-muted-foreground hover:text-foreground p-1">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FunctionCallAccordion({ fn, isLast }: { fn: FunctionCall; isLast?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {/* Tree branch: horizontal connector */}
      <div className="absolute left-0 top-[14px] w-3 h-px bg-border" />
      {/* Tree branch: vertical continuation (hide on last item) */}
      {!isLast && <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />}
      {isLast && <div className="absolute left-0 top-0 h-[14px] w-px bg-border" />}
      <div className="ml-5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 w-full py-1.5 px-2 -mx-2 rounded text-[11px] font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0"
          >
            <ChevronDown className="h-3 w-3 opacity-40" style={{ transform: 'rotate(-90deg)' }} />
          </motion.div>
          {fn.status === "done" ? (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          )}
          <code className="font-mono truncate">{fn.name}</code>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="ml-1 border-l border-border space-y-1.5 py-1">
                {fn.input && (
                  <div className="relative pl-4">
                    <div className="absolute left-0 top-[10px] w-3 h-px bg-border" />
                    <span className="font-medium text-muted-foreground/70 text-[10px]">Input</span>
                    <div className="mt-0.5 rounded-lg overflow-hidden border" style={{ backgroundColor: 'hsl(var(--code-inline-bg))', borderColor: 'hsl(var(--code-inline-border))' }}>
                      <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre" style={{ color: 'hsl(var(--code-inline-text))' }}>{fn.input}</pre>
                      <div className="flex justify-end px-3 pb-2">
                        <button onClick={() => navigator.clipboard.writeText(fn.input || "")} className="p-0.5 transition-colors" style={{ color: 'hsl(var(--code-inline-text) / 0.6)' }} onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--code-inline-text))'} onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--code-inline-text) / 0.6)'}>
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {fn.output && (
                  <div className="relative pl-4">
                    <div className="absolute left-0 top-[10px] w-3 h-px bg-border" />
                    <span className="font-medium text-muted-foreground/70 text-[10px]">Output</span>
                    <div className="mt-0.5 rounded-lg overflow-hidden border" style={{ backgroundColor: 'hsl(var(--code-inline-bg))', borderColor: 'hsl(var(--code-inline-border))' }}>
                      <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre" style={{ color: 'hsl(var(--code-inline-text))' }}>{fn.output}</pre>
                      <div className="flex justify-end px-3 pb-2">
                        <button onClick={() => navigator.clipboard.writeText(fn.output || "")} className="p-0.5 transition-colors" style={{ color: 'hsl(var(--code-inline-text) / 0.6)' }} onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--code-inline-text))'} onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--code-inline-text) / 0.6)'}>
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReasoningSection({ thinking }: { thinking: ThinkingBlock }) {
  const [open, setOpen] = useState(false);
  if (!thinking.skillBadge) return null;
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 w-full py-2 px-2 -mx-2 rounded text-[11px] text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground transition-colors"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="h-3 w-3" style={{ transform: 'rotate(-90deg)' }} />
        </motion.div>
        <span>Reasoning · {thinking.durationLabel}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-[9px]">
              <div className="relative">
                <div className="absolute left-0 top-[14px] w-3 h-px bg-border" />
                <div className="absolute left-0 top-0 h-[14px] w-px bg-border" />
                <div className="ml-5 py-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Loaded skill <code className="font-mono">{thinking.skillBadge}</code>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadedSourcesSection({ thinking }: { thinking: ThinkingBlock }) {
  const [open, setOpen] = useState(false);
  if (!thinking.functionCalls.length) return null;
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 w-full py-2 px-2 -mx-2 rounded text-[11px] text-muted-foreground/60 hover:bg-muted/60 hover:text-muted-foreground transition-colors"
      >
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="h-3 w-3" style={{ transform: 'rotate(-90deg)' }} />
        </motion.div>
        <span>Loaded Sources · {thinking.functionCalls.length}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-[9px]">
              {thinking.functionCalls.map((fn, i) => (
                <FunctionCallAccordion key={i} fn={fn} isLast={i === thinking.functionCalls.length - 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RichBlock({ block }: { block: MessageContent }) {
  return (
    <>
      {block.thinking && (
        <>
          <ReasoningSection thinking={block.thinking} />
          <LoadedSourcesSection thinking={block.thinking} />
        </>
      )}

      {block.text && (
        <div className="whitespace-pre-wrap">
          {block.text.split(/(`[^`]+`)/).map((part, i) =>
            part.startsWith("`") && part.endsWith("`") ? (
              <code
                key={i}
                className="px-1.5 py-0.5 rounded text-xs font-mono border"
                style={{ backgroundColor: 'hsl(var(--code-inline-bg))', borderColor: 'hsl(var(--code-inline-border))', color: 'hsl(var(--code-inline-text))' }}
              >
                {part.slice(1, -1)}
              </code>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      )}

      {block.table && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted">
                {block.table.headers.map((h, i) => (
                  <th key={i} className="text-left px-3 py-2 font-semibold text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-border">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2.5 text-foreground align-top">
                      {cell.split(/(`[^`]+`)/).map((part, i) =>
                        part.startsWith("`") && part.endsWith("`") ? (
                          <code key={i} className="px-1 py-0.5 rounded bg-muted text-xs font-mono">
                            {part.slice(1, -1)}
                          </code>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {block.codeBlock && (
        <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: 'hsl(var(--code-inline-bg))', borderColor: 'hsl(var(--code-inline-border))' }}>
          <pre className="p-3 text-xs font-mono overflow-x-auto whitespace-pre" style={{ color: 'hsl(var(--code-inline-text))' }}>
            {block.codeBlock}
          </pre>
          <div className="flex justify-end px-3 pb-2">
            <button
              onClick={() => navigator.clipboard.writeText(block.codeBlock || "")}
              className="p-0.5 transition-colors" style={{ color: 'hsl(var(--code-inline-text) / 0.6)' }} onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--code-inline-text))'} onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--code-inline-text) / 0.6)'}
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const PAGE_CHIPS: Record<string, { subtitle: string; chips: string[] }> = {
  Dashboard: { subtitle: "Ask me anything about your pipelines, costs, or optimizations.", chips: ["What costs the most?", "What failed today?", "Where are my biggest savings?", "What's my SLA status?", "What's my projected spend this month?"] },
  Pipelines: { subtitle: "Ask me anything about your pipelines.", chips: ["Show failing pipelines", "Which pipeline is slowest?", "Which pipeline costs the most?", "Where is there data skew?", "What should I fix first?"] },
  Compute: { subtitle: "Ask me anything about your compute resources.", chips: ["Show compute usage", "Which clusters are underutilized?", "Right-size my instances", "Which jobs are spilling to disk?", "What's my potential saving?"] },
  Runs: { subtitle: "Ask me anything about your runs.", chips: ["Show failed runs", "What's the average run duration?", "Which runs are slowest?", "Any retries spiking?", "Show runs with data quality issues"] },
  "Compare Runs": { subtitle: "Ask me anything about these runs.", chips: ["Compare last two runs", "What changed between runs?", "Show performance diff", "Highlight regressions", "Was there any schema drift?"] },
  Datasets: { subtitle: "Ask me anything about your datasets.", chips: ["List largest datasets", "Which datasets are stale?", "Show storage costs", "Any unused datasets?", "Where is there schema drift?"] },
  Alerts: { subtitle: "Ask me anything about your alerts.", chips: ["Show active alerts", "What triggered recently?", "Mute noisy alerts", "Alert trend this month", "What's my most critical alert?"] },
};

export function AiChatPanel({
  open,
  onClose,
  empty = false,
  activePage = "Pipelines",
}: {
  open: boolean;
  onClose: () => void;
  empty?: boolean;
  activePage?: string;
}) {
  const [messages, setMessages] = useState<Message[]>(empty ? [] : INITIAL_MESSAGES);

  // Reset messages when empty prop changes
  useEffect(() => {
    setMessages(empty ? [] : INITIAL_MESSAGES);
  }, [empty]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState<"reasoning" | "loading" | "thinking" | "done">("reasoning");
  const [lastUserMessageId, setLastUserMessageId] = useState<string | null>(null);
  const [showHintPlaceholder, setShowHintPlaceholder] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChat, setActiveChat] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const CHAT_HISTORY = [
    { title: "Debug pipeline partition error", date: "Today" },
    { title: "Optimize query performance", date: "Today" },
    { title: "Refactor spill handlers", date: "Yesterday" },
    { title: "Add retry logic to ingestion", date: "Yesterday" },
    { title: "Schema migration for v2.4", date: "Mar 24" },
    { title: "Fix memory leak in workers", date: "Mar 23" },
    { title: "Dashboard latency metrics", date: "Mar 22" },
    { title: "Cost estimation formulas", date: "Mar 21" },
    { title: "Review partition labeling", date: "Mar 20" },
    { title: "Set up staging environment", date: "Mar 19" },
    { title: "Audit task scheduling logic", date: "Mar 18" },
    { title: "Integrate Slack notifications", date: "Mar 17" },
  ];

  const [liveContext, setLiveContext] = useState<ContextTag[]>([
    { label: "Page", value: activePage },
    ...(PAGE_CONTEXT[activePage] || PAGE_CONTEXT.Dashboard),
  ]);

  // Track page navigation — add new context items when page changes
  useEffect(() => {
    setLiveContext(prev => {
      const newTags: ContextTag[] = [
        { label: "Page", value: activePage },
        ...(PAGE_CONTEXT[activePage] || PAGE_CONTEXT.Dashboard),
      ];
      // Merge: keep existing unique items, add new ones
      const existing = new Map(prev.map(t => [`${t.label}:${t.value}`, t]));
      newTags.forEach(t => {
        const key = `${t.label}:${t.value}`;
        if (!existing.has(key)) {
          existing.set(key, t);
        }
      });
      // Always update the Page value
      const result = Array.from(existing.values()).map(t =>
        t.label === "Page" ? { ...t, value: activePage } : t
      );
      return result;
    });
  }, [activePage]);

  const [inputContextOpen, setInputContextOpen] = useState(false);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setShowHintPlaceholder(false);
    idleTimerRef.current = setTimeout(() => setShowHintPlaceholder(true), 1000);
  };

  const endRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isThinking, scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => scrollToBottom("auto"));
    return () => cancelAnimationFrame(frame);
  }, [open, isFullscreen, scrollToBottom]);

  const DEMO_RESPONSES: Record<string, { text: string }[]> = {
    "What costs the most?": [
      { text: "Based on the last 12 months of data, your **top cost driver** is `pipeline: categories-machine-type` at **$78,887** estimated cost with only **10% utilization**. This pipeline alone accounts for ~20% of your total compute spend." },
      { text: "The next highest is `pipeline: bids-machine-type` at **$77,050** (14% utilization). Together, these two pipelines represent **$155K** in annual compute cost with significant waste." },
      { text: "I'd recommend reviewing the machine type configurations on both — right-sizing could save an estimated **$796K annualized**." },
    ],
    "Show idle resources": [
      { text: "I found **3 categories** of idle resources contributing to **$2.4M** in unused capacity:" },
      { text: "1. **Orphaned vCores in Machine** — 3 opportunities, **$762K** savings potential\n2. **Over Provisioned Executors** — 19 opportunities, **$309K** savings\n3. **Off-Heap executors memory over provisioning** — 5 opportunities, **$117K** savings" },
      { text: "The orphaned vCores are the biggest win. Want me to drill into specific pipelines?" },
    ],
    "Where are my biggest savings opportunities?": [
      { text: "Your total annualized savings opportunity is **$1.5M** across **50 open opportunities**." },
      { text: "The top 3 areas are:\n- **Waste: unused resources** — $1.25M across 32 opportunities\n- **Task retries & failures** — $95.8K across 12 opportunities\n- **High spill overhead** — $75.9K across 1 opportunity" },
      { text: "I'd suggest starting with the unused resource waste — it's 83% of your total savings potential and mostly involves right-sizing configurations." },
    ],
    "Why is utilization so low?": [
      { text: "Your overall compute utilization is at **20%**, meaning 80% of provisioned resources are sitting idle." },
      { text: "The main culprits:\n- `categories-machine-type`: **10%** utilization, $70.9K waste\n- `bids-machine-type`: **14%** utilization, $66K waste\n- `impression-skew`: **7.1%** utilization, $44.2K waste" },
      { text: "These pipelines are over-provisioned relative to their actual workload. The machine types and executor counts were likely set for peak loads that rarely occur. Consider enabling **auto-scaling** or reducing the base allocation." },
    ],
    "Which pipelines have the most waste?": [
      { text: "Here are your top pipelines by waste (annualized):" },
      { text: "| Pipeline | Est. Cost | Waste | Utilization |\n|---|---|---|---|\n| categories-machine-type | $78,887 | $70,901 | 10% |\n| bids-machine-type | $77,050 | $66,051 | 14% |\n| impression-skew | $47,623 | $44,225 | 7.1% |\n| hierarchies-dynamic | $28,137 | $20,909 | 26% |" },
      { text: "The first three pipelines have **waste ratios above 85%** — they're spending most of their budget on idle compute." },
    ],
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, attachedContext: [...liveContext] };
    setMessages((m) => [...m, userMsg]);
    setLastUserMessageId(userMsg.id);
    setInput("");
    setIsThinking(true);
    setThinkingPhase("reasoning");
    setTimeout(() => {
      setThinkingPhase("loading");
      setTimeout(() => {
        setThinkingPhase("thinking");
        setTimeout(() => {
          setThinkingPhase("done");
          const responseContent = DEMO_RESPONSES[text] || [
            { text: "I've analyzed your request across your pipeline data. Based on the current metrics, I can see several areas worth investigating. Would you like me to go deeper into any specific pipeline or cost category?" },
          ];
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "",
            richContent: responseContent,
          };
          setMessages((m) => [...m, aiMsg]);
        }, 1500);
      }, 1500);
    }, 2000);
  };

  const send = () => sendMessage(input);

  return (
    <AnimatePresence>
      {open && (
          <motion.div
            key={isFullscreen ? 'fullscreen' : 'panel'}
            initial={isFullscreen ? { opacity: 0 } : { width: 0 }}
            animate={isFullscreen ? { opacity: 1, width: '100%' } : { width: 420 }}
            exit={isFullscreen ? { opacity: 0 } : { width: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`ai-chat-panel flex flex-col border-l border-border bg-card overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full shrink-0'}`}
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            {/* Header - full width */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <img src={dexterAvatar} alt="Dexter" className="w-6 h-6 object-contain" />
                <span className="text-sm font-semibold text-foreground tracking-tight">Dexter</span>
                <span className="text-sm text-muted-foreground">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                {!isFullscreen && (
                  <div className="relative">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className={`p-1.5 rounded hover:bg-muted transition-colors ${showHistory ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {showHistory && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-border">
                            <span className="text-xs font-medium text-muted-foreground">Chat History</span>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {CHAT_HISTORY.map((chat, i) => (
                              <button
                                key={i}
                                className="w-full text-left px-3 py-2.5 hover:bg-muted transition-colors flex items-center justify-between gap-2 group"
                              >
                                <span className="text-sm text-foreground truncate">{chat.title}</span>
                                <span className="text-[10px] text-muted-foreground shrink-0">{chat.date}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {!isFullscreen && (
                  <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <MessageSquarePlus className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => { setIsFullscreen(!isFullscreen); setShowHistory(false); }}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button onClick={() => { setIsFullscreen(false); onClose(); }} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex min-h-0">
              {/* Fullscreen history sidebar */}
              {isFullscreen && (
                <div className="w-64 border-r border-border flex flex-col shrink-0 bg-background">
                  <button className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors w-full text-left">
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>New Chat</span>
                  </button>
                  <div className="flex items-center px-4 py-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">History</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {CHAT_HISTORY.map((chat, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveChat(i)}
                        className={`w-full text-left px-4 py-2.5 transition-colors flex flex-col gap-0.5 ${activeChat === i ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      >
                        <span className={`text-sm truncate ${activeChat === i ? 'text-foreground font-medium' : 'text-foreground'}`}>{chat.title}</span>
                        <span className="text-[10px] text-muted-foreground">{chat.date}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat column */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                  <div className="flex-1" />
                  {messages.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-full text-center ${isFullscreen ? 'max-w-2xl mx-auto w-full' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                        <img src={dexterAvatar} alt="Dexter" className="h-10 w-10 object-contain" />
                      </div>
                      
                      <p className="text-sm text-muted-foreground max-w-[260px]">
                        {(PAGE_CHIPS[activePage] || PAGE_CHIPS.Dashboard).subtitle}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-5 justify-center max-w-[320px]">
                        {(PAGE_CHIPS[activePage] || PAGE_CHIPS.Dashboard).chips.map((q) => (
                          <button
                            key={q}
                            onClick={() => { sendMessage(q); }}
                            className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : isFullscreen ? (
                    <div className="max-w-2xl mx-auto w-full">
                      <ContextPreamble />
                      {messages.map((msg) => (
                        <>
                          <RichMessage key={msg.id} msg={msg} />
                          {msg.id === lastUserMessageId && <ThinkingIndicator phase={thinkingPhase} />}
                        </>
                      ))}
                      <div ref={endRef} />
                    </div>
                  ) : (
                    <>
                      <ContextPreamble />
                      {messages.map((msg) => (
                        <>
                          <RichMessage key={msg.id} msg={msg} />
                          {msg.id === lastUserMessageId && <ThinkingIndicator phase={thinkingPhase} />}
                        </>
                      ))}
                      <div ref={endRef} />
                    </>
                  )}
                </div>

                <div className={`pb-2 shrink-0 ${isFullscreen ? 'max-w-2xl mx-auto w-full' : ''}`}>
                  <div className="bg-white overflow-hidden">
                    <div className="px-3 pt-2">
                      <InputContextBar context={liveContext} open={inputContextOpen} onToggle={() => setInputContextOpen(o => !o)} />
                    </div>
                    <div className="relative px-3 py-2">
                      <input
                        value={input}
                        onChange={(e) => { setInput(e.target.value); resetIdleTimer(); }}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        onFocus={resetIdleTimer}
                        onBlur={() => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); setShowHintPlaceholder(false); }}
                        placeholder={!input && showHintPlaceholder ? "" : "Type a message..."}
                        className="w-full bg-gray-100 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-3 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 pr-10"
                      />
                      {!input && showHintPlaceholder && (
                        <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-[10px] text-muted-foreground">
                          Press <kbd className="mx-1 px-1 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">Enter</kbd> to send, <kbd className="mx-1 px-1 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">Shift</kbd> + <kbd className="mx-1 px-1 py-0.5 rounded bg-muted border border-border text-[9px] font-mono">Enter</kbd> for new line
                        </div>
                      )}
                      <Button size="icon" variant="ghost" onClick={send} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground p-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}
