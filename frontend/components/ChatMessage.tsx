"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, Check, Copy, Download, Plane, RotateCcw } from "lucide-react";
import type { Message } from "@/lib/conversations";

function AgentAvatar() {
  return (
    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white dark:bg-teal-500 dark:text-stone-950">
      <Plane className="size-4" />
    </div>
  );
}

function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-semibold prose-table:my-0 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-teal-700 dark:prose-a:text-teal-400 prose-th:bg-stone-100 dark:prose-th:bg-stone-800 prose-th:px-3 prose-td:px-3 prose-th:py-2 prose-td:py-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Itineraries often contain wide cost tables: scroll them instead of the page
          table: (props) => (
            <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
              <table {...props} />
            </div>
          ),
          a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
    >
      {children}
      {label}
    </button>
  );
}

function PlanActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "travel_plan.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-2 flex gap-1">
      <IconButton label={copied ? "Copied" : "Copy"} onClick={copy}>
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </IconButton>
      <IconButton label="Download .md" onClick={download}>
        <Download className="size-3.5" />
      </IconButton>
    </div>
  );
}

export function ChatMessage({ message, onRetry }: { message: Message; onRetry?: () => void }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-stone-900 px-4 py-2.5 text-[15px] text-white dark:bg-stone-100 dark:text-stone-900">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.error) {
    return (
      <div className="flex gap-3">
        <AgentAvatar />
        <div className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{message.content}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-red-800 shadow-sm ring-1 ring-red-200 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-100 dark:ring-red-800"
            >
              <RotateCcw className="size-3.5" />
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <AgentAvatar />
      <div className="min-w-0 flex-1">
        <Markdown>{message.content}</Markdown>
        <PlanActions content={message.content} />
      </div>
    </div>
  );
}

export function ThinkingMessage() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-3">
      <AgentAvatar />
      <div className="flex items-center gap-3 py-1.5 text-sm text-stone-500 dark:text-stone-400">
        <span className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1.5 animate-bounce rounded-full bg-teal-600 dark:bg-teal-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        Checking weather, places and costs… {seconds > 0 && <span className="tabular-nums">{seconds}s</span>}
      </div>
    </div>
  );
}
