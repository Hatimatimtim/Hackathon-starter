import FileUpload from "@/components/upload/FileUpload";
import { Sparkles, ShieldAlert, FileText } from "lucide-react";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Title Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 text-xs font-medium text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Document Extraction & Grounding Suite</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
            Knowledge Base Ingestion
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload your corporate policies, HR guidelines, and security handbooks to enable AI RAG queries and compliance audits.
          </p>
        </div>

        {/* Upload Component */}
        <FileUpload />
      </div>
    </main>
  );
}