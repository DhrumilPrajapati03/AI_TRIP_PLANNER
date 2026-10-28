"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { sendQuery } from "@/lib/api";
import {
  addMessage,
  createConversation,
  getConversation,
  setThreadId,
  truncateMessages,
  useConversations,
} from "@/lib/conversations";
import { ChatMessage, ThinkingMessage } from "./ChatMessage";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { Sidebar } from "./Sidebar";

export function TripPlanner() {
  const conversations = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  // Conversations waiting on the agent; tracked per conversation so you can switch chats meanwhile
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const isPending = activeId !== null && pending.has(activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages.length, isPending]);

  const setPendingFor = (id: string, value: boolean) =>
    setPending((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });

  const send = async (text: string, conversationId: string | null = activeId) => {
    const id = conversationId ?? createConversation(text);
    setActiveId(id);

    const conversation = getConversation(id)!;
    const history = conversation.messages
      .filter((m) => !m.error)
      .map(({ role, content }) => ({ role, content }));

    addMessage(id, { role: "user", content: text });
    setPendingFor(id, true);
    try {
      const res = await sendQuery({ question: text, thread_id: conversation.threadId, history });
      setThreadId(id, res.thread_id);
      addMessage(id, { role: "assistant", content: res.answer });
    } catch (e) {
      addMessage(id, { role: "assistant", content: (e as Error).message, error: true });
    } finally {
      setPendingFor(id, false);
    }
  };

  const retry = (id: string) => {
    const conversation = getConversation(id);
    if (!conversation) return;
    const lastUser = conversation.messages.findLastIndex((m) => m.role === "user");
    if (lastUser === -1) return;
    const text = conversation.messages[lastUser].content;
    truncateMessages(id, lastUser);
    send(text, id);
  };

  const startNew = () => {
    setActiveId(null);
    setSidebarOpen(false);
  };

  const sidebar = (
    <Sidebar
      conversations={conversations}
      activeId={activeId}
      onSelect={(id) => {
        setActiveId(id);
        setSidebarOpen(false);
      }}
      onNew={startNew}
    />
  );

  return (
    <div className="flex h-dvh bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <aside className="hidden w-72 shrink-0 border-r border-stone-200 md:block dark:border-stone-800">{sidebar}</aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-stone-950/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-xl">
            {sidebar}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 rounded-md p-1.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              <X className="size-4" />
            </button>
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 md:hidden dark:border-stone-800">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            <Menu className="size-5" />
          </button>
          <span className="truncate text-sm font-medium">{active?.title ?? "New trip"}</span>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {active ? (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
              {active.messages.map((m, i) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  onRetry={m.error && i === active.messages.length - 1 && !isPending ? () => retry(active.id) : undefined}
                />
              ))}
              {isPending && <ThinkingMessage />}
              <div ref={bottomRef} />
            </div>
          ) : (
            <EmptyState onPick={(prompt) => send(prompt, null)} />
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl px-4 pb-4">
          <Composer onSend={(text) => send(text)} disabled={isPending} />
          <p className="mt-2 text-center text-xs text-stone-400 dark:text-stone-500">
            AI-generated plans can be wrong. Verify prices, opening hours and travel requirements before you go.
          </p>
        </div>
      </main>
    </div>
  );
}
