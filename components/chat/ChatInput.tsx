"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, HelpCircle, Mic, MicOff } from "lucide-react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join("");
          setMessage(transcript);
        };

        recog.onend = () => setIsListening(false);
        recog.onerror = () => setIsListening(false);

        setRecognition(recog);
      }
    }
  }, []);

  const samplePrompts = [
    "What is the password complexity requirement?",
    "Summarize the data retention policy",
    "Are remote work downloads allowed?",
    "What happens during a security breach?",
  ];

  function toggleVoiceInput() {
    if (!recognition) {
      alert("Voice input is not supported in this browser. Try Google Chrome or Brave.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  }

  function handleSend(textToSend?: string) {
    const finalMsg = textToSend || message;
    if (!finalMsg.trim() || disabled) return;

    onSend(finalMsg);
    setMessage("");
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/90 p-4 backdrop-blur-md">
      {/* Starter Prompts */}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <HelpCircle className="h-3 w-3 text-cyan-400" /> Starter Questions:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => handleSend(prompt)}
            className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box & voice microphone button */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            disabled={disabled}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isListening
                ? "Listening to your voice..."
                : "Ask any policy question grounded in your uploaded PDFs..."
            }
            className={`w-full rounded-xl border bg-slate-900/90 px-4 py-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition disabled:opacity-50 ${
              isListening
                ? "border-cyan-400 ring-2 ring-cyan-500/40 animate-pulse"
                : "border-slate-700/80 focus:border-cyan-500"
            }`}
          />
        </div>

        {/* Mic Voice Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={toggleVoiceInput}
          title={isListening ? "Stop listening" : "Speak question with microphone"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
            isListening
              ? "bg-rose-500 text-white border-rose-400 animate-bounce"
              : "bg-slate-900 text-slate-400 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/50"
          }`}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Send Button */}
        <button
          disabled={!message.trim() || disabled}
          onClick={() => handleSend()}
          className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
        >
          <span>Send</span>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}