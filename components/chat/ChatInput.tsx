"use client";

export default function ChatInput() {
  return (
    <div className="border-t border-slate-800 bg-slate-900 p-5">

      <div className="flex gap-4">

        <input
          type="text"
          placeholder="Ask anything about your uploaded documents..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
        />

        <button className="rounded-lg bg-cyan-500 px-6 font-semibold text-black hover:bg-cyan-400">
          Send
        </button>

      </div>

    </div>
  );
}