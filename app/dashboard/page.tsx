import StatCard from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-8 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">
          Welcome back 👋
        </h1>

        <p className="mt-2 text-slate-400">
          Here's an overview of your Knowledge & Compliance platform.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Documents"
            value="12"
            description="Knowledge files uploaded"
          />

          <StatCard
            title="AI Queries"
            value="84"
            description="Questions answered"
          />

          <StatCard
            title="Compliance"
            value="98%"
            description="Policy compliance score"
          />

          <StatCard
            title="Active Users"
            value="4"
            description="Currently using the platform"
          />
        </div>

        <section className="mt-12 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-semibold">
            Recent Activity
          </h2>

          <ul className="mt-6 space-y-4 text-slate-300">
            <li>📄 HR Policy.pdf uploaded</li>
            <li>🤖 AI answered 24 employee questions</li>
            <li>🛡 Compliance scan completed successfully</li>
            <li>📚 Information Security Policy updated</li>
          </ul>
        </section>
      </div>
    </main>
  );
}