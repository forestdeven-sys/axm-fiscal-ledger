export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Welcome to AXM Fiscal Ledger — your AI-driven financial control hub.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-medium text-gray-500">Total Balance</h2>
          <p className="mt-2 text-2xl font-semibold">$0.00</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-medium text-gray-500">Monthly Budget</h2>
          <p className="mt-2 text-2xl font-semibold">$0.00</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-medium text-gray-500">Subscriptions</h2>
          <p className="mt-2 text-2xl font-semibold">0 active</p>
        </div>
      </div>
    </div>
  );
}
