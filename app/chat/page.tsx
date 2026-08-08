"use client";

import { useState } from "react";
import ChatMessage, { SourceCitation } from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Bot, Sparkles, AlertTriangle } from "lucide-react";

interface MessageState {
  role: "user" | "assistant";
  message: string;
  modelUsed?: string;
  sources?: SourceCitation[];
}

export default function ChatPage() {
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);

  const [messages, setMessages] = useState<MessageState[]>([
    {
      role: "assistant",
      message:
        "Welcome to KCAI Document Intelligence! I am grounded strictly in your uploaded knowledge base. Ask me any policy question, compliance rule, or procedure details.",
      modelUsed: "Google Gemini 2.5 Flash Engine",
    },
  ]);

  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        message:
          "New chat session started. Ask any question grounded in your uploaded documents.",
        modelUsed: "Google Gemini 2.5 Flash Engine",
      },
    ]);
  };

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

      let clientDocuments: any[] = [];
      try {
        const stored = localStorage.getItem("kcai_documents");
        if (stored) {
          clientDocuments = JSON.parse(stored);
        }
      } catch (e) {
        // silent
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          selectedDocId,
          clientDocuments,
        }),
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
          modelUsed: data.modelUsed,
          sources: data.sources,
        },
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          message:
            error.message ||
            "I encountered an error connecting to the AI services. Please verify that a document has been uploaded.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full flex-1 bg-slate-950 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Navigation & Document Selector */}
      <ChatSidebar
        onNewChat={handleNewChat}
        selectedDocId={selectedDocId}
        onSelectDocId={setSelectedDocId}
      />

      {/* Main Chat Interface */}
      <div className="flex h-full flex-1 flex-col bg-slate-950 min-w-0">
        {/* Chat Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-8 py-3.5 bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Zero-Hallucination Policy Assistant</span>
                <span className="text-[10px] font-normal bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                  Grounded Mode
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {selectedDocId
                  ? "Filtered: Single Target Document"
                  : "Searching all active knowledge base documents"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-800/40">
              <Sparkles className="h-3 w-3" /> Gemini 2.5 Active
            </span>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div className="min-h-0 w-full flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role}
              message={msg.message}
              modelUsed={msg.modelUsed}
              sources={msg.sources}
            />
          ))}

          {loading && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 animate-pulse">
                <Bot className="h-5 w-5" />
              </div>
              <div className="glass-panel rounded-2xl px-5 py-3 text-xs text-cyan-400 flex items-center gap-2 border border-slate-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>Searching knowledge chunks & reasoning...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="w-full">
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </main>
  );
}