"use client";

import { useState } from "react";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; message: string }[]
  >([
    {
      role: "assistant",
      message: "Hello! Ask me anything about your uploaded documents.",
    },
  ]);

  async function handleSend(message: string) {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        message,
      },
    ]);

    try {
      setLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: data.answer,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full min-w-0 flex-1 bg-slate-950">
      <div className="flex h-[calc(100vh-64px)] w-full min-w-0 flex-col bg-slate-950">
        
        {/* Chat messages */}
        <div className="min-h-0 w-full flex-1 overflow-y-auto px-8 py-8">
          <div className="w-full space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                message={msg.message}
              />
            ))}

            {loading && (
              <ChatMessage
                role="assistant"
                message="Thinking..."
              />
            )}
          </div>
        </div>

        {/* Chat input */}
        <div className="w-full px-8 pb-6">
          <ChatInput onSend={handleSend} />
        </div>

      </div>
    </main>
  );
}