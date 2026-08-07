"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  Sparkles,
  FileType,
  Image as ImageIcon,
  Presentation,
  FileSpreadsheet,
} from "lucide-react";

interface DocumentMeta {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  uploadTime: string;
  previewSnippet?: string;
}

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const [uploadedDocs, setUploadedDocs] = useState<DocumentMeta[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<DocumentMeta | null>(null);

  async function fetchUploadedDocs() {
    try {
      const res = await fetch("/api/upload");
      if (res.ok) {
        const data = await res.json();
        setUploadedDocs(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to load documents list", err);
    }
  }

  useEffect(() => {
    fetchUploadedDocs();
  }, []);

  function handleFiles(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const file = selected[0];
    uploadDocument(file);
  }

  async function uploadDocument(file: File) {
    setUploading(true);
    setStatusMessage({ type: null, text: "" });
    setUploadProgress(`Extracting content from ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload processing failed");
      }

      setStatusMessage({
        type: "success",
        text: data.message || `Successfully processed ${file.name}!`,
      });

      await fetchUploadedDocs();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to parse and extract document content.",
      });
      console.error(err);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  }

  async function loadHackathonDemoSuite() {
    setLoadingDemo(true);
    setStatusMessage({ type: null, text: "" });
    try {
      const formData = new FormData();
      formData.append("action", "load_sample");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "Loaded Demo Knowledge Base (Security Policy PDF & HR PPTX presentation)!",
        });
        await fetchUploadedDocs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDemo(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  function getFileIcon(name: string) {
    const ext = name.toLowerCase().split(".").pop() || "";
    if (ext === "pptx" || ext === "ppt") return Presentation;
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) return ImageIcon;
    if (["csv", "xlsx", "json"].includes(ext)) return FileSpreadsheet;
    return FileText;
  }

  return (
    <div className="space-y-10">
      {/* Toast Alert Banner */}
      {statusMessage.type && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-panel relative rounded-3xl p-10 text-center transition-all ${
          dragActive
            ? "border-2 border-cyan-400 bg-cyan-950/30 scale-[1.01]"
            : "border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.csv,.json,.md,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 mb-6 glow-cyan">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Upload Any Knowledge Document
        </h2>

        <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Drag & drop your <strong className="text-cyan-400">PDF, PPTX presentations, Word DOCX, TXT, CSV, or OCR images</strong> to instantly index for AI Q&A.
        </p>

        {uploading && uploadProgress && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-cyan-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            disabled={uploading || loadingDemo}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3.5 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105 transition disabled:opacity-50"
          >
            <UploadCloud className="h-4 w-4" />
            <span>{uploading ? "Extracting..." : "Choose PDF / PPTX / File"}</span>
          </button>

          <button
            disabled={uploading || loadingDemo}
            onClick={loadHackathonDemoSuite}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-6 py-3.5 font-semibold text-indigo-300 hover:bg-indigo-900/50 hover:text-white transition disabled:opacity-50"
          >
            {loadingDemo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-indigo-400" />
            )}
            <span>Load Hackathon Demo Dataset</span>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <FileType className="h-3 w-3 text-cyan-400" /> PDF & Scanned OCR
          </span>
          <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <Presentation className="h-3 w-3 text-amber-400" /> PPTX Slides
          </span>
          <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <FileText className="h-3 w-3 text-blue-400" /> Word DOCX & Text
          </span>
          <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <ImageIcon className="h-3 w-3 text-purple-400" /> Image OCR
          </span>
        </div>
      </div>

      {/* Indexed Knowledge Documents Repository */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              <span>Active Knowledge Base Documents ({uploadedDocs.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Documents currently stored in memory available for grounded AI queries and compliance audits.
            </p>
          </div>

          {uploadedDocs.length > 0 && (
            <div className="flex gap-2">
              <Link
                href="/chat"
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
              >
                <span>Query AI Chat</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/compliance"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-3.5 py-2 text-xs font-semibold text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Run Compliance Scan</span>
              </Link>
            </div>
          )}
        </div>

        {uploadedDocs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <FileText className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No documents indexed in store yet.</p>
            <button
              onClick={loadHackathonDemoSuite}
              className="mt-3 text-xs font-semibold text-cyan-400 hover:underline"
            >
              Click here to load Hackathon demo files
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {uploadedDocs.map((doc) => {
              const IconComponent = getFileIcon(doc.fileName);
              return (
                <div
                  key={doc.id}
                  className="glass-card rounded-xl p-5 border border-slate-800/80 hover:border-cyan-500/40 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                            {doc.fileName}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {(doc.fileSize / 1024).toFixed(1)} KB • {doc.pageCount} Pages/Sections
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Indexed
                      </span>
                    </div>

                    {doc.previewSnippet && (
                      <p className="mt-3 text-xs text-slate-400 line-clamp-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        "{doc.previewSnippet}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Uploaded {new Date(doc.uploadTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>

                    <button
                      onClick={() => setSelectedPreview(doc)}
                      className="flex items-center gap-1 text-cyan-400 hover:underline font-medium"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Content</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Text Content Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <span>{selectedPreview.fileName}</span>
              </h3>
              <button
                onClick={() => setSelectedPreview(null)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-4">
              <p className="text-slate-400 border-b border-slate-800 pb-2">
                Full text content extracted ({selectedPreview.pageCount} pages/slides):
              </p>
              <pre className="whitespace-pre-wrap">{selectedPreview.previewSnippet || "No preview content available."}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}