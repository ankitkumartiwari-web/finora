import { GlassCard } from "./GlassCard";
import { CalendarDays, ShieldCheck, Target } from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "../store/useAppStore";
import {
  formatCurrency,
  getCategoryBreakdown,
  getFinancialSummary,
  getInsightMessage,
  getMonthlyOverview,
  formatTransactionDateTime,
} from "../lib/finance";

const categoryColors = ["#0b6b45", "#5bbf86", "#95c9ff", "#ffd166", "#ef476f", "#7c3aed"];

const tooltipStyle = {
  backgroundColor: "rgba(15,28,42,0.95)",
  borderRadius: "20px",
  border: "none",
  color: "#f8fafc",
  padding: "12px 16px",
  fontSize: "0.85rem",
};

export function DashboardView() {
  const transactions = useAppStore((state) => state.transactions);
  const summary = getFinancialSummary(transactions);
  const monthlyOverview = getMonthlyOverview(transactions);
  const categoryBreakdown = getCategoryBreakdown(transactions);
  const insightMessage = getInsightMessage(transactions);
  const latestMonth = monthlyOverview[monthlyOverview.length - 1];

  const summaryCards = [
    { label: "Total Balance", value: summary.balance, accent: "text-[#0b6b45] dark:text-[#c78dff]" },
    { label: "Income", value: summary.income, accent: "text-green-600 dark:text-[#8bf6b6]" },
    { label: "Expenses", value: summary.expenses, accent: "text-rose-600 dark:text-rose-300" },
  ];

  return (
    <section className="space-y-8 text-gray-900 dark:text-gray-100">
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12">
        <GlassCard className="xl:col-span-5 p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500">
                Balance Trend
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-[#0b6b45] dark:text-[#c78dff]">
                {formatCurrency(summary.balance)}
              </h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Balance is calculated as Income minus Expenses across all tracked transactions.
              </p>
            </div>
            <div className="rounded-3xl bg-[#f0f7f0] dark:bg-[#1c1c29] px-4 py-3 text-right text-xs font-semibold text-[#0b6b45] dark:text-[#c78dff]">
              <p className="uppercase tracking-[0.3em]">Live Data</p>
              <p className="mt-2 text-gray-400 dark:text-gray-500">
                {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 h-44 min-w-0" aria-label="Balance history chart">
            {monthlyOverview.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyOverview} margin={{ left: 0, top: 5, right: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b6b45" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0b6b45" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#edf2f7" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8" }} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="balance" stroke="#0b6b45" strokeWidth={3} fill="url(#balanceGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyCardState message="No data available yet. Add transactions to view your balance history." />
            )}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:col-span-7">
          {summaryCards.map((card) => (
            <GlassCard key={card.label} className="p-4 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{card.label}</p>
              <h3 className={`mt-3 text-2xl sm:text-3xl font-semibold ${card.accent}`}>{formatCurrency(card.value)}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {card.label === "Total Balance"
                  ? "Income minus expenses"
                  : card.label === "Income"
                  ? "All positive cash flow"
                  : "All outgoing cash flow"}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12">
        <GlassCard className="xl:col-span-7 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Cash Flow</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Income vs Expenses by Month
              </h3>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              <p>{latestMonth ? latestMonth.month : "No data"}</p>
              <p className="mt-1">Responsive chart</p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 h-72 min-w-0" aria-label="Cash flow chart">
            {monthlyOverview.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyOverview}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#a0aec0" }} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="income" stroke="#0b6b45" fill="#0b6b45" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef476f" fill="#ef476f" fillOpacity={0.18} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyCardState message="No data available yet. Monthly cash flow will appear here." />
            )}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-5 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                Expense Categories
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Category Chart
              </h3>
            </div>
            <div className="rounded-2xl bg-[#f4f6f8] px-3 py-1 text-xs text-gray-500 dark:bg-[#1f1f2c] dark:text-gray-300">
              Donut chart
            </div>
          </div>
          <div className="mt-6 h-72 min-w-0" aria-label="Expense category chart">
            {categoryBreakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={68}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={entry.category} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyCardState message="No data available yet. Add expense transactions to populate categories." />
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <GlassCard className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Highlights</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Smart Summary
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#0b6b45] dark:text-[#c78dff]">
              <CalendarDays className="w-4 h-4" />
              Live
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              {
                id: "balance",
                title: "Budget on track",
                description: insightMessage,
                icon: Target,
              },
              {
                id: "coverage",
                title: "Coverage status",
                description: transactions.length
                  ? `Your current balance covers expenses by ${formatCurrency(Math.max(summary.balance, 0))}.`
                  : "No data yet, so there is nothing at risk of over-spending.",
                icon: ShieldCheck,
              },
            ].map((insight) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  whileHover={{ x: 6 }}
                  className="flex items-start gap-4 rounded-3xl bg-[#f7f9fb] p-4 dark:bg-[#1c1c29]"
                >
                  <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-[#15151d]">
                    <Icon className="h-5 w-5 text-[#0b6b45] dark:text-[#c78dff]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{insight.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{insight.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                Recent Activity
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Latest Transactions
              </h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <motion.div
                key={transaction.id}
                whileHover={{ y: -2 }}
                className="flex items-center justify-between rounded-2xl bg-[#f7f9fb] p-4 dark:bg-[#1c1c29]"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatTransactionDateTime(transaction.date)}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    transaction.type === "income"
                      ? "text-[#0b6b45] dark:text-[#c78dff]"
                      : "text-gray-500 dark:text-gray-300"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </motion.div>
            ))}
            {!transactions.length && (
              <EmptyCardState message="No data available yet. Recent activity will appear after your first transaction." />
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function EmptyCardState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#f7f9fb] px-6 text-center text-sm text-gray-500 dark:border-[#2a2a3c] dark:bg-[#161620] dark:text-gray-400">
      {message}
    </div>
  );
}
