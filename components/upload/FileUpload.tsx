"use client";

export default function FileUpload() {
  return (
    <div className="rounded-xl border-2 border-dashed border-cyan-500 bg-slate-900 p-12 text-center">

      <h2 className="text-2xl font-semibold text-white">
        Upload Knowledge Base
      </h2>

      <p className="mt-3 text-slate-400">
        Drag & Drop PDF files here
      </p>

      <button className="mt-8 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400">
        Choose File
      </button>

    </div>
  );
}