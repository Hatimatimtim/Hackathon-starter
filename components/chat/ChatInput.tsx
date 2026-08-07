"use client";

import { useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  function handleSend() {
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  }

  return (
    <div className="border-t border-slate-800 bg-slate-900 p-5">
      <div className="flex gap-4">

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask anything about your uploaded documents..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
        />

        <button
          onClick={handleSend}
          className="rounded-lg bg-cyan-500 px-6 font-semibold text-black hover:bg-cyan-400"
        >
          Send
        </button>

      </div>
    </div>
  );
}