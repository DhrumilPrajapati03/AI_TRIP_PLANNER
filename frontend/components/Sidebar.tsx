"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plane, Plus, Trash2 } from "lucide-react";
import { checkHealth } from "@/lib/api";
import { deleteConversation, type Conversation } from "@/lib/conversations";

function BackendStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const poll = () => checkHealth().then((ok) => active && setOnline(ok));
    poll();
    const timer = setInterval(poll, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const label = online === null ? "Connecting…" : online ? "Agent online" : "Agent offline";
  const dot = online === null ? "bg-stone-400" : online ? "bg-emerald-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 px-3 py-3 text-xs text-stone-500 dark:text-stone-400">
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </div>
  );
}

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export function Sidebar({ conversations, activeId, onSelect, onNew }: Props) {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-full flex-col bg-stone-100 dark:bg-stone-900">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white dark:bg-teal-500 dark:text-stone-950">
          <Plane className="size-4" />
        </span>
        <span className="font-semibold tracking-tight text-stone-900 dark:text-stone-100">Trip Planner</span>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
        >
          <Plus className="size-4" />
          New trip
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3" aria-label="Your trips">
        {sorted.length > 0 && (
          <p className="px-2 pb-1 text-xs font-medium text-stone-500 dark:text-stone-400">Recent trips</p>
        )}
        <ul className="space-y-0.5">
          {sorted.map((c) => (
            <li key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={`flex w-full items-center gap-2 rounded-lg py-2 pr-8 pl-2 text-left text-sm transition ${
                  c.id === activeId
                    ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-50"
                    : "text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-stone-800/60"
                }`}
              >
                <MessageSquare className="size-3.5 shrink-0 opacity-60" />
                <span className="truncate">{c.title}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${c.title}`}
                onClick={() => {
                  if (window.confirm(`Delete "${c.title}"?`)) {
                    deleteConversation(c.id);
                    if (c.id === activeId) onNew();
                  }
                }}
                className="absolute top-1/2 right-1 -translate-y-1/2 rounded-md p-1.5 text-stone-400 opacity-0 transition group-hover:opacity-100 hover:bg-stone-200 hover:text-red-600 focus:opacity-100 dark:hover:bg-stone-700"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <BackendStatus />
    </div>
  );
}
