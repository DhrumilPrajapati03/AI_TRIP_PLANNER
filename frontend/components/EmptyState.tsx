import { Backpack, Landmark, TreePalm, Waves } from "lucide-react";

const SUGGESTIONS = [
  { icon: TreePalm, title: "Goa beaches", prompt: "Plan a 5-day trip to Goa for 2 people on a moderate budget" },
  { icon: Landmark, title: "Jaipur weekend", prompt: "A relaxed weekend in Jaipur with forts, markets and the best local food" },
  { icon: Waves, title: "Kerala in a week", prompt: "7 days in Kerala covering the backwaters, Munnar hills and Varkala beach" },
  { icon: Backpack, title: "Bali on a budget", prompt: "A 10-day budget backpacking trip to Bali, with costs in INR" },
];

export function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
        Where to next?
      </h1>
      <p className="mt-2 max-w-xl text-stone-500 dark:text-stone-400">
        Tell me a destination and I&apos;ll put together a day-by-day plan with live weather, places to
        see and eat, and a full cost breakdown. Ask follow-ups to refine it.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
          <button
            key={title}
            type="button"
            onClick={() => onPick(prompt)}
            className="group flex gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left transition hover:border-teal-600/40 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-400/40"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              <Icon className="size-4.5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">{title}</span>
              <span className="mt-0.5 block text-sm text-stone-500 dark:text-stone-400">{prompt}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
