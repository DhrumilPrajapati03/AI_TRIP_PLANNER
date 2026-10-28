"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export function Composer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
    requestAnimationFrame(resize);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 rounded-2xl border border-stone-300 bg-white p-2 shadow-sm transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 dark:border-stone-700 dark:bg-stone-900 dark:focus-within:border-teal-400"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          resize();
        }}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter adds a new line
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Where do you want to go?"
        aria-label="Message the trip planner"
        className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send"
        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400 dark:disabled:bg-stone-800 dark:disabled:text-stone-600"
      >
        <ArrowUp className="size-4" />
      </button>
    </form>
  );
}
