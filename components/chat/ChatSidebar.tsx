"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  MessageSquare,
  FileText,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
} from "lucide-react";

interface DocMeta {
  id: string;
  fileName: string;
  pageCount: number;
}

interface ChatSidebarProps {
  onNewChat?: () => void;
  selectedDocId?: string;
  onSelectDocId?: (id: string | undefined) => void;
}

export default function ChatSidebar({
  onNewChat,
  selectedDocId,
  onSelectDocId,
}: ChatSidebarProps) {
  const [docs, setDocs] = useState<DocMeta[]>([]);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/api/upload");
        if (res.ok) {
          const data = await res.json();
          setDocs(data.documents || []);
        }
      } catch (err) {
        console.error("Sidebar docs error:", err);
      }
    }
    loadDocs();
  }, []);

  return (
    <aside className="w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/90 p-5 flex flex-col justify-between h-full">
      <div className="space-y-6">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat Session</span>
        </button>

        {/* Filter Target Document */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Target Document</span>
            <span className="text-[10px] text-cyan-400 font-normal">
              {docs.length} Uploaded
            </span>
          </h2>

          <div className="space-y-1.5">
            <button
              onClick={() => onSelectDocId && onSelectDocId(undefined)}
              className={`w-full rounded-xl p-2.5 text-left text-xs font-medium transition flex items-center justify-between border ${
                !selectedDocId
                  ? "bg-cyan-950/40 text-cyan-300 border-cyan-700/60"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <span className="truncate">All Knowledge Base Files</span>
              {!selectedDocId && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
            </button>

            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocId && onSelectDocId(doc.id)}
                className={`w-full rounded-xl p-2.5 text-left text-xs font-medium transition flex items-center justify-between border ${
                  selectedDocId === doc.id
                    ? "bg-cyan-950/40 text-cyan-300 border-cyan-700/60"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate">{doc.fileName}</span>
                </div>
                {selectedDocId === doc.id && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Topics */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Suggested Audits
          </h2>

          <div className="space-y-2 text-xs">
            <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 text-slate-300 flex items-center justify-between">
              <span>GDPR Compliance</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded">Check</span>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 text-slate-300 flex items-center justify-between">
              <span>SOC2 Access Controls</span>
              <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950 px-2 py-0.5 rounded">Check</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer shortcut */}
      <div className="pt-4 border-t border-slate-800/80">
        <Link
          href="/upload"
          className="flex items-center justify-between rounded-xl bg-slate-900 p-3 text-xs font-semibold text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-cyan-400" />
            <span>Upload New PDF</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </Link>
      </div>
    </aside>
  );
}