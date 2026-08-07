"use client";

import { useRef, useState } from "react";

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleFiles(selected: FileList | null) {
    if (!selected) return;

    const selectedFiles = Array.from(selected);

setFiles(selectedFiles);

if (selectedFiles.length > 0) {
  uploadPDF(selectedFiles[0]);
}
  }
  async function uploadPDF(file: File) {
  setUploading(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    alert(data.message);
  } catch (err) {
    alert("Upload failed");
    console.error(err);
  }

  setUploading(false);
}

  return (
    <div className="space-y-8">

      <div className="rounded-xl border-2 border-dashed border-cyan-500 bg-slate-900 p-12 text-center">

        <h2 className="text-3xl font-bold text-white">
          Upload Knowledge Base
        </h2>

        <p className="mt-4 text-slate-400">
          Drag & Drop PDF files here
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <button
          
           disabled={uploading}
           onClick={() => inputRef.current?.click()}
          className="mt-8 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
        >
          {uploading ? "Uploading..." : "Choose File"}
        </button>

      </div>

      {files.length > 0 && (
        <div className="rounded-xl bg-slate-900 p-6">

          <h3 className="mb-4 text-xl font-semibold text-white">
            Selected Files
          </h3>

          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex justify-between rounded-lg bg-slate-800 p-3"
              >
                <span>{file.name}</span>

                <span className="text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
          </ul>

        </div>
      )}

    </div>
  );
}