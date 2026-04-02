import { GlassCard } from "./GlassCard";
import { TrendingUp, TrendingDown, ShoppingBag, Utensils, PiggyBank, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useIsMobile } from "./ui/use-mobile";
import { useAppStore } from "../store/useAppStore";
import {
  filterTransactions,
  formatCurrency,
  getFinancialSummary,
  getHighestSpendingCategory,
  getInsightMessage,
  getMonthlyComparison,
  getMonthlyOverview,
  getTransactionMonthKey,
} from "../lib/finance";

interface InsightsProps {
  globalSearchQuery?: string;
}

export function Insights({ globalSearchQuery = "" }: InsightsProps) {
  const isMobile = useIsMobile();
  const transactions = useAppStore((state) => state.transactions);
  const searchableTransactions = useMemo(
    () => filterTransactions(transactions, { query: globalSearchQuery }),
    [transactions, globalSearchQuery],
  );

  const monthlyOverview = useMemo(() => getMonthlyOverview(searchableTransactions), [searchableTransactions]);
  const summary = useMemo(() => getFinancialSummary(searchableTransactions), [searchableTransactions]);
  const topCategory = useMemo(() => getHighestSpendingCategory(searchableTransactions), [searchableTransactions]);
  const monthlyComparison = useMemo(() => getMonthlyComparison(searchableTransactions), [searchableTransactions]);
  const insightMessage = useMemo(() => getInsightMessage(searchableTransactions), [searchableTransactions]);

  const monthlyData = monthlyOverview.map((month) => ({
    month: month.month,
    income: month.income,
    expenses: month.expenses,
  }));

  const categoryTrends = useMemo(() => {
    const monthBuckets = new Map<string, Map<string, number>>();

    for (const transaction of searchableTransactions) {
      if (transaction.type !== "expense") continue;
      const monthKey = getTransactionMonthKey(transaction.date);
      const monthMap = monthBuckets.get(monthKey) ?? new Map<string, number>();
      monthMap.set(transaction.category, (monthMap.get(transaction.category) ?? 0) + transaction.amount);
      monthBuckets.set(monthKey, monthMap);
    }

    const months = [...monthBuckets.keys()].sort();
    const currentMap = monthBuckets.get(months[months.length - 1] ?? "") ?? new Map<string, number>();
    const previousMap = monthBuckets.get(months[months.length - 2] ?? "") ?? new Map<string, number>();

    const categories = new Set<string>([...currentMap.keys(), ...previousMap.keys()]);

    return [...categories].map((category) => {
      const current = currentMap.get(category) ?? 0;
      const previous = previousMap.get(category) ?? 0;
      const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
      return { category, current, previous, change };
    }).sort((left, right) => right.current - left.current);
  }, [searchableTransactions]);

  const topGrowth =
    categoryTrends.filter((item) => item.change > 0).sort((left, right) => right.change - left.change)[0] ?? null;

  const latestMonth = monthlyOverview[monthlyOverview.length - 1];

  const insightCards = [
    {
      title: "Highest Spending",
      value: topCategory?.category ?? "No data",
      amount: topCategory ? formatCurrency(topCategory.amount) : "Add expenses",
      icon: Utensils,
      color: "bg-orange-600",
      description: topCategory 
        ? `You spent the most on ${topCategory.category} this month`
        : "No expense transactions yet",
      trend: monthlyComparison ? `${monthlyComparison.difference >= 0 ? "+" : "-"}${formatCurrency(Math.abs(monthlyComparison.difference))}` : "--",
      isPositive: false,
    },
    {
      title: "Savings This Month",
      value: formatCurrency(Math.max(latestMonth?.balance ?? summary.balance, 0)),
      amount: latestMonth && latestMonth.income > 0 ? `${((Math.max(latestMonth.balance, 0) / latestMonth.income) * 100).toFixed(1)}%` : "0%",
      icon: PiggyBank,
      color: "bg-green-600",
      description: latestMonth && latestMonth.income > 0 
        ? `You saved ${((Math.max(latestMonth.balance, 0) / latestMonth.income) * 100).toFixed(1)}% of your income`
        : "Add transactions to track savings",
      trend: `${searchableTransactions.length} entries`,
      isPositive: true,
    },
    {
      title: "Budget Status",
      value: summary.balance >= 0 ? "On Track" : "Over Budget",
      amount: formatCurrency(Math.abs(summary.balance)),
      icon: Target,
      color: "bg-blue-600",
      description: summary.balance >= 0 
        ? `You have ${formatCurrency(summary.balance)} remaining`
        : `You need ${formatCurrency(Math.abs(summary.balance))} to balance`,
      trend: summary.balance >= 0 ? "Healthy" : "Attention",
      isPositive: summary.balance >= 0,
    },
    {
      title: "Top Category Growth",
      value: topGrowth?.category ?? "No growth",
      amount: topGrowth ? `${topGrowth.change > 0 ? "+" : ""}${topGrowth.change.toFixed(1)}%` : "0%",
      icon: ShoppingBag,
      color: "bg-purple-600",
      description: topGrowth 
        ? `${topGrowth.category} increased by ${topGrowth.change.toFixed(1)}% compared to last month`
        : "Add two months of data for comparison",
      trend: topGrowth ? formatCurrency(topGrowth.current) : "--",
      isPositive: false,
    },
  ];

  if (searchableTransactions.length === 0) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-10 text-center" hover={false}>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">No matching insights found</h3>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Try a different search term to view insight cards and charts.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Top Insight</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{insightCards[0].value}</h3>
              <p className="mt-1 text-xl font-semibold text-purple-600 dark:text-purple-400">{insightCards[0].amount}</p>
              <p className="mt-2 text-sm text-gray-500">{insightCards[0].description}</p>
            </div>
            <div className={`rounded-2xl p-4 ${insightCards[0].color}`}>
              {(() => {
                const TopIcon = insightCards[0].icon;
                return <TopIcon className="w-6 h-6 text-white" />;
              })()}
            </div>
          </div>
          <div className="mt-4 inline-flex rounded-full bg-orange-500/15 px-3 py-1 text-sm font-medium text-orange-600 dark:text-orange-300">
            {insightCards[0].trend}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          {insightCards.slice(1).map((card, index) => {
            const Icon = card.icon;
            return (
              <GlassCard key={card.title} className={`p-4 ${index === 2 ? "col-span-2" : ""}`}>
                <div className="mb-3 flex items-start justify-between">
                  <div className={`rounded-2xl p-3 ${card.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${card.isPositive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                    {card.trend}
                  </div>
                </div>
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{card.value}</h3>
                <p className="mb-1 text-base font-semibold text-purple-600 dark:text-purple-400">{card.amount}</p>
                <p className="text-sm text-gray-500">{card.description}</p>
              </GlassCard>
            );
          })}
        </div>

        <GlassCard className="p-4 sm:p-6" hover={false}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Monthly Comparison</h3>
          <div className="h-64 min-w-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                    color: "#f8fafc",
                  }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6" hover={false}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Category Trends</h3>
          <div className="space-y-4">
            {categoryTrends.map((trend) => {
              const isPositive = trend.change < 0;
              return (
                <div key={trend.category} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-[#1A1A1A]/50">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{trend.category}</span>
                      <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                        {trend.change > 0 ? "+" : ""}{trend.change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${isPositive ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${Math.min((trend.current / Math.max(summary.expenses, 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6" hover={false}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spending Forecast</h3>
          <div className="grid grid-cols-1 gap-4">
            {monthlyOverview.slice(-3).map((item) => (
              <div key={item.month} className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{item.month} 2026</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(item.expenses)}</p>
                <p className="mt-2 text-sm text-green-500">From live transactions</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-4">
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-green-600 p-3"><TrendingUp className="w-6 h-6 text-white" /></div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Great Job!</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{insightMessage}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-orange-600 p-3"><TrendingDown className="w-6 h-6 text-white" /></div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Watch Out</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {monthlyComparison
                    ? `${monthlyComparison.currentMonth} expenses are ${
                        monthlyComparison.difference > 0
                          ? "higher"
                          : monthlyComparison.difference < 0
                          ? "lower"
                          : "unchanged"
                      } than ${monthlyComparison.previousMonth}.`
                    : "Need at least two months of data to compare monthly movement."}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`p-4 rounded-2xl ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${card.isPositive ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                    {card.trend}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</h3>
                <p className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2">{card.amount}</p>
                <p className="text-sm text-gray-500">{card.description}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Comparison</h3>
            <p className="text-sm text-gray-500 mt-1">Income vs Expenses over the last months</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
            </div>
          </div>
        </div>
        <div className="h-80 min-w-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  backdropFilter: "blur(10px)",
                  color: "#f8fafc",
                }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Category Trends</h3>
        <div className="space-y-4">
          {categoryTrends.map((trend, index) => {
            const isPositive = trend.change < 0;
            return (
              <motion.div
                key={trend.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A]/50"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{trend.category}</span>
                    <span className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                      {trend.change > 0 ? "+" : ""}{trend.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPositive ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min((trend.current / Math.max(summary.expenses, 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(trend.current)}</p>
                      <p className="text-xs text-gray-500">vs {formatCurrency(trend.previous)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-3 rounded-2xl bg-green-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Great Job!</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{insightMessage}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-3 rounded-2xl bg-orange-600">
              <TrendingDown className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Watch Out</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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

      <GlassCard className="p-6" hover={false}>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Spending Forecast</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Based on your current spending patterns, here is your recent monthly trend.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {monthlyOverview.slice(-3).map((item) => (
            <motion.div key={item.month} whileHover={{ scale: 1.05, y: -5 }} className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.month} 2026</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(item.expenses)}</p>
              <p className="text-sm text-green-500 mt-2">From live transaction data</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
