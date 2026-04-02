import { TrendingDown, TrendingUp, Target, PiggyBank, Utensils } from "lucide-react";
import { motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "./GlassCard";
import { useAppStore } from "../store/useAppStore";
import {
  formatCurrency,
  getFinancialSummary,
  getHighestSpendingCategory,
  getInsightMessage,
  getMonthlyComparison,
  getMonthlyOverview,
} from "../lib/finance";

const tooltipStyle = {
  backgroundColor: "rgba(15,28,42,0.95)",
  borderRadius: "20px",
  border: "none",
  color: "#f8fafc",
  padding: "12px 16px",
  fontSize: "0.85rem",
};

export function InsightsView() {
  const transactions = useAppStore((state) => state.transactions);
  const summary = getFinancialSummary(transactions);
  const highestCategory = getHighestSpendingCategory(transactions);
  const monthlyComparison = getMonthlyComparison(transactions);
  const monthlyOverview = getMonthlyOverview(transactions);
  const insightMessage = getInsightMessage(transactions);

  const cards = [
    {
      title: "Highest Spending Category",
      value: highestCategory?.category ?? "No data",
      detail: highestCategory ? formatCurrency(highestCategory.amount) : "Add expenses to calculate this",
      icon: Utensils,
      color: "bg-orange-600",
    },
    {
      title: "Savings",
      value: formatCurrency(Math.max(summary.balance, 0)),
      detail: `${transactions.length} total transactions`,
      icon: PiggyBank,
      color: "bg-green-600",
    },
    {
      title: "Monthly Comparison",
      value: monthlyComparison
        ? `${monthlyComparison.currentMonth} vs ${monthlyComparison.previousMonth}`
        : "Need two months",
      detail: monthlyComparison
        ? `${monthlyComparison.difference >= 0 ? "+" : "-"}${formatCurrency(Math.abs(monthlyComparison.difference))}`
        : "Not enough monthly history yet",
      icon: Target,
      color: "bg-blue-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <GlassCard className="p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className={`rounded-2xl p-4 ${card.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{card.detail}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Comparison</h3>
            <p className="mt-1 text-sm text-gray-500">Income and expenses are derived from live transactions.</p>
          </div>
          {monthlyComparison && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Difference: {monthlyComparison.difference >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(monthlyComparison.difference))}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 h-80 min-w-0" aria-label="Monthly comparison chart">
          {monthlyOverview.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyOverview}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="expenses" stroke="#ec4899" fill="#ec4899" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyInsightState message="No data available yet. Add transactions to compare months." />
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-green-600 p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Insight Message</h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{insightMessage}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-orange-600 p-3">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Monthly Delta</h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {monthlyComparison
                  ? `${monthlyComparison.currentMonth} expenses are ${
                      monthlyComparison.difference > 0
                        ? "higher"
                        : monthlyComparison.difference < 0
                        ? "lower"
                        : "unchanged"
                    } than ${monthlyComparison.previousMonth}.`
                  : "You need transactions from at least two different months to compute a delta."}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function EmptyInsightState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#f7f9fb] px-6 text-center text-sm text-gray-500 dark:border-[#2a2a3c] dark:bg-[#161620] dark:text-gray-400">
      {message}
    </div>
  );
}
