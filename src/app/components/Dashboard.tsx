import { GlassCard } from "./GlassCard";
import { ArrowUpRight, CalendarDays, Target, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import {
  filterTransactions,
  formatCurrency,
  getCategoryBreakdown,
  getFinancialSummary,
  getInsightMessage,
  getMonthlyComparison,
  getMonthlyOverview,
  formatTransactionDateTime,
  getTransactionTimestamp,
} from "../lib/finance";

const tooltipStyle = {
  backgroundColor: "rgba(15,28,42,0.95)",
  borderRadius: "20px",
  border: "none",
  color: "#f8fafc",
  padding: "12px 16px",
  fontSize: "0.85rem",
};

const tooltipLabelStyle = {
  color: "#f8fafc",
};

const chartColors = ["#0b6b45", "#4bc687", "#a3f089", "#95c9ff", "#ffd166", "#c78dff"];

// Custom tooltip for pie chart with proper text colors
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div style={tooltipStyle}>
        <p style={tooltipLabelStyle}>{name}</p>
        <p style={tooltipLabelStyle}>{formatCurrency(value)}</p>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  onNavigate?: (page: string, options?: { transactionType?: "all" | "income" | "expense" }) => void;
  globalSearchQuery?: string;
}

export function Dashboard({ onNavigate, globalSearchQuery = "" }: DashboardProps) {
  const transactions = useAppStore((state) => state.transactions);
  const searchableTransactions = useMemo(
    () => filterTransactions(transactions, { query: globalSearchQuery }),
    [transactions, globalSearchQuery],
  );

  const summary = useMemo(() => getFinancialSummary(searchableTransactions), [searchableTransactions]);
  const monthlyOverview = useMemo(() => getMonthlyOverview(searchableTransactions), [searchableTransactions]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(searchableTransactions), [searchableTransactions]);
  const monthlyComparison = useMemo(() => getMonthlyComparison(searchableTransactions), [searchableTransactions]);
  const insightMessage = useMemo(() => getInsightMessage(searchableTransactions), [searchableTransactions]);

  const balanceHistory = monthlyOverview.map((month) => ({ month: month.month, value: month.balance }));
  const moneyFlow = monthlyOverview.map((month) => ({
    month: month.month,
    income: month.income,
    expense: month.expenses,
    savings: Math.max(month.balance, 0),
  }));

  const incomeStreams = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const transaction of searchableTransactions) {
      if (transaction.type !== "income") continue;
      grouped.set(transaction.category, (grouped.get(transaction.category) ?? 0) + transaction.amount);
    }

    return [...grouped.entries()]
      .map(([label, amount], index) => ({ label, amount, color: chartColors[index % chartColors.length] }))
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 3);
  }, [searchableTransactions]);

  const weeklyExpense = useMemo(() => {
    const expenses = searchableTransactions
      .filter((transaction) => transaction.type === "expense")
      .slice()
      .sort((left, right) => getTransactionTimestamp(left.date) - getTransactionTimestamp(right.date))
      .slice(-4);

    return expenses.map((transaction, index) => ({ label: `W${index + 1}`, value: transaction.amount }));
  }, [searchableTransactions]);

  const budgetUsage = useMemo(() => {
    const totalExpense = summary.expenses || 1;
    return categoryBreakdown.slice(0, 3).map((item, index) => {
      const percent = Math.min(100, Math.round((item.amount / totalExpense) * 100));
      const limit = Math.max(item.amount * 1.2, 1);
      return {
        label: item.category,
        percent,
        amount: item.amount,
        limit,
        color: chartColors[index % chartColors.length],
      };
    });
  }, [categoryBreakdown, summary.expenses]);

  const quickInsights = [
    {
      id: 1,
      title: "Budget on track",
      description: insightMessage,
      icon: Target,
    },
    {
      id: 2,
      title: "Usage is safe",
      description: monthlyComparison
        ? `${monthlyComparison.currentMonth} spending is ${
            monthlyComparison.difference > 0
              ? "up"
              : monthlyComparison.difference < 0
              ? "down"
              : "flat"
          } ${formatCurrency(Math.abs(monthlyComparison.difference))} vs ${monthlyComparison.previousMonth}.`
        : "Need at least two months of transactions for month-over-month comparison.",
      icon: ShieldCheck,
    },
  ];

  const activityFeed = searchableTransactions
    .slice()
    .sort((left, right) => getTransactionTimestamp(right.date) - getTransactionTimestamp(left.date))
    .slice(0, 3)
    .map((transaction) => ({
      id: transaction.id,
      label: transaction.description,
      value: `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`,
      time: formatTransactionDateTime(transaction.date),
    }));

  const remainingPercent =
    summary.income > 0 ? Math.max(0, Math.min(100, ((summary.income - summary.expenses) / summary.income) * 100)) : 0;

  if (searchableTransactions.length === 0) {
    return (
      <section className="space-y-8 text-gray-900 dark:text-gray-100">
        <GlassCard className="p-10 text-center" hover={false}>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">No matching results</h3>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Try a different search term to see dashboard totals and charts.
          </p>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="space-y-8 text-gray-900 dark:text-gray-100">
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12">
        <GlassCard className="xl:col-span-5 p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 dark:text-gray-500">Total Balance</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-[#0b6b45] dark:text-[#c78dff]">{formatCurrency(summary.balance)}</h2>
              <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Total income <span className="text-[#0b6b45] font-semibold">+{formatCurrency(summary.income)}</span>
                </span>
                <span>
                  Total expense <span className="text-[#7ccf83] dark:text-[#b9ffb8] font-semibold">-{formatCurrency(summary.expenses)}</span>
                </span>
              </div>
            </div>
            <div className="rounded-3xl bg-[#f0f7f0] dark:bg-[#1c1c29] px-4 py-3 text-right text-xs font-semibold text-[#0b6b45] dark:text-[#c78dff]">
              <p className="uppercase tracking-[0.3em]">All time</p>
              <p className="mt-2 text-gray-400 dark:text-gray-500">Updated • {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 h-36 sm:h-40 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceHistory} margin={{ left: 0, top: 5, right: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b6b45" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0b6b45" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf2f7" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0b6b45"
                  strokeWidth={3}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:contents">
        <GlassCard className="xl:col-span-4 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Income</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(summary.income)}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-[#8bf6b6]">
              <ArrowUpRight className="w-4 h-4" />
              Live
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current totals</p>
          <div className="mt-4 sm:mt-6 space-y-4">
            {incomeStreams.length ? (
              incomeStreams.map((stream) => (
                <div key={stream.label}>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{stream.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(stream.amount)}</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-gray-100 dark:bg-[#1f1f2c]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${summary.income > 0 ? (stream.amount / summary.income) * 100 : 0}%`,
                        background: stream.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No income data available.</p>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Based on categories</span>
            <span className="text-green-600 dark:text-[#8bf6b6]">{searchableTransactions.length} entries</span>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-3 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Expenses</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{formatCurrency(summary.expenses)}</h3>
            </div>
            <div className="rounded-2xl bg-[#f4f6f8] px-3 py-1 text-xs text-gray-500 dark:bg-[#1f1f2c] dark:text-gray-300">Live</div>
          </div>
          <div className="mt-4 sm:mt-6 h-24 sm:h-28 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyExpense} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#cbd5f5" }} />
                <YAxis hide />
                <Bar dataKey="value" fill="#d5f5e3" radius={[8, 8, 8, 8]} barSize={18} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Last 4 expense entries</span>
            <button
              type="button"
              onClick={() => onNavigate?.("transactions", { transactionType: "expense" })}
              className="text-green-600 dark:text-[#8bf6b6] font-semibold hover:opacity-80 transition-opacity"
            >
              {formatCurrency(summary.expenses)}
            </button>
          </div>
        </GlassCard>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-12">
        <GlassCard className="xl:col-span-7 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Money Flow</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Income · Expense · Savings</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto max-w-full">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0b6b45]"></span>Income
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b0e6c2]"></span>Expense
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffd166]"></span>Savings
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 h-64 sm:h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={moneyFlow}
                margin={{ top: 12, right: 24, left: 16, bottom: 8 }}
                barGap={6}
                barCategoryGap="28%"
              >
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a0aec0" }}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#0b6b45" barSize={18} radius={[10, 10, 0, 0]} />
                <Bar dataKey="expense" fill="#b0e6c2" barSize={18} radius={[10, 10, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#ffd166"
                  strokeWidth={3}
                  strokeLinecap="round"
                  connectNulls
                  dot={{ r: 4, fill: "#ffd166", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#ffd166", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-5 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Remaining Monthly</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{remainingPercent.toFixed(0)}%</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Budget setting · Safe zone</p>
            </div>
            <div className="flex flex-col items-end text-right text-sm">
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Live</span>
              <span className="text-green-600 dark:text-[#8bf6b6] font-semibold mt-2">Expense categories</span>
              <span className="text-gray-500 dark:text-gray-400 mt-1">Auto-updated</span>
            </div>
          </div>
          <div className="mt-6 h-40 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={40}
                  outerRadius={64}
                  paddingAngle={2}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-4">
            {budgetUsage.map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-[#f7f9fb] dark:bg-[#1c1c29]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{item.label}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{item.percent}%</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                    <p>{formatCurrency(item.amount)}</p>
                    <p className="text-[11px]">of {formatCurrency(item.limit)}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white dark:bg-[#0f0f16]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percent}%`, background: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <GlassCard className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Highlights</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Remaining Monthly Summary</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#0b6b45] dark:text-[#c78dff]">
              <CalendarDays className="w-4 h-4" />
              This week
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {quickInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  whileHover={{ x: 6 }}
                  className="flex items-start gap-4 p-4 rounded-3xl bg-[#f7f9fb] dark:bg-[#1c1c29]"
                >
                  <div className="p-3 rounded-2xl bg-white shadow-sm dark:bg-[#15151d]">
                    <Icon className="w-5 h-5 text-[#0b6b45] dark:text-[#c78dff]" />
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
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Recent Activity</p>
              <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Budget Actions</h3>
            </div>
            <button 
              onClick={() => onNavigate?.("transactions")}
              className="text-sm font-semibold text-[#0b6b45] dark:text-[#c78dff] hover:opacity-80 transition-opacity cursor-pointer"
            >
              View all
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {activityFeed.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ y: -2 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#f7f9fb] dark:bg-[#1c1c29]"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    activity.value.startsWith("+")
                      ? "text-[#0b6b45] dark:text-[#c78dff]"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {activity.value}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
