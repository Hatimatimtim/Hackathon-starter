"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

type ChatMessageProps = {
  role: "user" | "assistant";
  message: string;
  modelUsed?: string;
};

function formatFormattedLine(line: string) {
  // Parse **bold** text in line
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-cyan-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ChatMessage({
  role,
  message,
  modelUsed,
}: ChatMessageProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.replace(/[*#_\-\[\]]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"} my-4`}>
      {!isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div className={`flex flex-col max-w-3xl ${isUser ? "items-end" : "items-start"}`}>
        {/* Model badge */}
        {!isUser && modelUsed && (
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{modelUsed}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative rounded-2xl px-6 py-4.5 text-[15px] leading-relaxed tracking-normal font-sans ${
            isUser
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-md shadow-cyan-500/10"
              : "glass-panel bg-slate-900/90 text-slate-100 border border-slate-800/90"
          }`}
        >
          {/* Format paragraphs, bold text, and bullet points */}
          <div className="whitespace-pre-wrap space-y-2.5">
            {message.split("\n").map((line, idx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 pl-2">
                    <span className="text-cyan-400 font-extrabold text-base">•</span>
                    <span>{formatFormattedLine(trimmed.substring(2))}</span>
                  </div>
                );
              }
              return <p key={idx}>{formatFormattedLine(line)}</p>;
            })}
          </div>

          {/* Copy button & Voice Speech Actions */}
          {!isUser && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-1.5 transition font-medium ${
                    isSpeaking ? "text-cyan-400 font-semibold" : "hover:text-cyan-400"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-4 w-4 text-cyan-400 animate-pulse" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>Listen Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}