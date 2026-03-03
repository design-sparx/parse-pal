"use client";

import { useChat } from "ai/react";
import { useState, useRef } from "react";

type IngestState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "done"; filename: string; pages: number; chunks: number }
  | { status: "error"; message: string };

export default function Home() {
  const [ingest, setIngest] = useState<IngestState>({ status: "idle" });
  const fileRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIngest({ status: "uploading" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIngest({ status: "done", filename: data.filename, pages: data.pages, chunks: data.chunks });
    } catch (err) {
      setIngest({ status: "error", message: (err as Error).message });
    }
  }

  const isReady = ingest.status === "done";

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ParsePal</h1>
        <div className="flex items-center gap-3">
          {ingest.status === "done" && (
            <span className="text-sm text-green-600">
              ✓ {ingest.filename} ({ingest.pages}p, {ingest.chunks} chunks)
            </span>
          )}
          {ingest.status === "uploading" && (
            <span className="text-sm text-gray-500">Processing...</span>
          )}
          {ingest.status === "error" && (
            <span className="text-sm text-red-500">{ingest.message}</span>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={ingest.status === "uploading"}
            className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            Upload PDF
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {isReady ? "Ask anything about your document" : "Upload a PDF to get started"}
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-black text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-900 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          disabled={!isReady || isLoading}
          placeholder={isReady ? "Ask a question..." : "Upload a PDF first"}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isReady || isLoading || !input.trim()}
          className="px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
