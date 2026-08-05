export default function ChatSidebar() {
  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 p-5">

      <button className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400">
        + New Chat
      </button>

      <div className="mt-8">

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recent Chats
        </h2>

        <div className="space-y-2">

          <button className="w-full rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700">
            Leave Policy Questions
          </button>

          <button className="w-full rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700">
            HR Compliance
          </button>

          <button className="w-full rounded-lg bg-slate-800 p-3 text-left hover:bg-slate-700">
            Security Policies
          </button>

        </div>

      </div>

    </aside>
  );
}