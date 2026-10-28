"use client";

import { useSyncExternalStore } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  threadId: string | null; // backend conversation id, assigned on the first reply
  messages: Message[];
  updatedAt: number;
};

// Conversations live in localStorage so they survive reloads. This is a tiny external
// store read through useSyncExternalStore, so components re-render on every change.
const STORAGE_KEY = "trip-planner:conversations";
const EMPTY: Conversation[] = [];

let conversations: Conversation[] | null = null;
const listeners = new Set<() => void>();

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function getSnapshot(): Conversation[] {
  if (conversations === null) conversations = load();
  return conversations;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: Conversation[]) {
  conversations = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked: keep working in memory
  }
  listeners.forEach((listener) => listener());
}

function update(id: string, change: (c: Conversation) => Conversation) {
  commit(getSnapshot().map((c) => (c.id === id ? { ...change(c), updatedAt: Date.now() } : c)));
}

export function useConversations(): Conversation[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function getConversation(id: string): Conversation | undefined {
  return getSnapshot().find((c) => c.id === id);
}

export function createConversation(firstMessage: string): string {
  const id = crypto.randomUUID();
  const title = firstMessage.length > 48 ? `${firstMessage.slice(0, 47).trimEnd()}…` : firstMessage;
  commit([{ id, title, threadId: null, messages: [], updatedAt: Date.now() }, ...getSnapshot()]);
  return id;
}

export function addMessage(id: string, message: Omit<Message, "id">) {
  update(id, (c) => ({ ...c, messages: [...c.messages, { ...message, id: crypto.randomUUID() }] }));
}

export function truncateMessages(id: string, keep: number) {
  update(id, (c) => ({ ...c, messages: c.messages.slice(0, keep) }));
}

export function setThreadId(id: string, threadId: string) {
  update(id, (c) => ({ ...c, threadId }));
}

export function deleteConversation(id: string) {
  commit(getSnapshot().filter((c) => c.id !== id));
}
