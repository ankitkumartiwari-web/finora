export type TransactionType = "income" | "expense";
export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionSortOption =
  | "date-desc"
  | "date-asc"
  | "amount-desc"
  | "amount-asc";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
}

export interface TransactionDraft {
  date?: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  status?: TransactionStatus;
}

export interface TransactionFilters {
  query?: string;
  category?: string;
  type?: "all" | TransactionType;
}

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
const transactionDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const transactionTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function createSeedTimestamp(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
) {
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

export const initialTransactions: Transaction[] = [
  { id: "txn-1", date: createSeedTimestamp(2026, 1, 3, 9, 20), description: "Salary Deposit", category: "Income", type: "income", amount: 3200, status: "completed" },
  { id: "txn-2", date: createSeedTimestamp(2026, 1, 8, 19, 10), description: "Grocery Shopping", category: "Food", type: "expense", amount: 132.4, status: "completed" },
  { id: "txn-3", date: createSeedTimestamp(2026, 1, 14, 8, 45), description: "Electricity Bill", category: "Bills", type: "expense", amount: 118.75, status: "completed" },
  { id: "txn-4", date: createSeedTimestamp(2026, 2, 2, 9, 5), description: "Salary Deposit", category: "Income", type: "income", amount: 3200, status: "completed" },
  { id: "txn-5", date: createSeedTimestamp(2026, 2, 10, 21, 25), description: "Movie Night", category: "Entertainment", type: "expense", amount: 46.5, status: "completed" },
  { id: "txn-6", date: createSeedTimestamp(2026, 2, 19, 13, 40), description: "Freelance Project", category: "Income", type: "income", amount: 900, status: "completed" },
  { id: "txn-7", date: createSeedTimestamp(2026, 3, 1, 9, 12), description: "Salary Deposit", category: "Income", type: "income", amount: 3300, status: "completed" },
  { id: "txn-8", date: createSeedTimestamp(2026, 3, 9, 18, 5), description: "Restaurant Dinner", category: "Food", type: "expense", amount: 72.2, status: "completed" },
  { id: "txn-9", date: createSeedTimestamp(2026, 3, 22, 10, 30), description: "Gym Membership", category: "Health", type: "expense", amount: 49.99, status: "pending" },
  { id: "txn-10", date: createSeedTimestamp(2026, 4, 1, 9, 8), description: "Salary Deposit", category: "Income", type: "income", amount: 3400, status: "completed" },
  { id: "txn-11", date: createSeedTimestamp(2026, 4, 7, 14, 50), description: "Online Course", category: "Education", type: "expense", amount: 149, status: "completed" },
  { id: "txn-12", date: createSeedTimestamp(2026, 4, 12, 20, 35), description: "Subscription Renewal", category: "Bills", type: "expense", amount: 19.99, status: "completed" },
];

export function parseTransactionDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return new Date(0);
}

export function normalizeTransactionDate(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  // Date input fields provide YYYY-MM-DD with no time; preserve current local time
  // so newly created/edited entries do not all collapse to 00:00.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const now = new Date();
    const withCurrentTime = new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    );
    return withCurrentTime.toISOString();
  }

  return parseTransactionDate(value).toISOString();
}

export function getTransactionTimestamp(value: string) {
  return parseTransactionDate(value).getTime();
}

export function getTransactionMonthKey(value: string) {
  const date = parseTransactionDate(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function getTransactionDateInputValue(value: string) {
  const date = parseTransactionDate(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTransactionDateTime(value: string) {
  const date = parseTransactionDate(value);
  // Legacy values stored as YYYY-MM-DD have no real time information.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return transactionDateFormatter.format(date);
  }
  return `${transactionDateFormatter.format(date)} • ${transactionTimeFormatter.format(date)}`;
}

export function createTransaction(input: TransactionDraft): Transaction {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `txn-${Date.now()}`,
    date: normalizeTransactionDate(input.date),
    description: input.description.trim(),
    category: input.category.trim(),
    type: input.type,
    amount: Number(input.amount),
    status: input.status ?? "completed",
  };
}

export function filterTransactions(
  transactions: Transaction[],
  { query = "", category = "all", type = "all" }: TransactionFilters,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedCategory = category.toLowerCase();

  return transactions.filter((transaction) => {
    const searchable = `${transaction.description} ${transaction.category} ${transaction.type} ${transaction.status} ${transaction.amount} ${transaction.date}`.toLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesCategory =
      normalizedCategory === "all" || transaction.category.toLowerCase() === normalizedCategory;
    const matchesType = type === "all" || transaction.type === type;
    return matchesQuery && matchesCategory && matchesType;
  });
}

export function sortTransactions(
  transactions: Transaction[],
  sortBy: TransactionSortOption = "date-desc",
) {
  return [...transactions].sort((left, right) => {
    if (sortBy === "date-desc") {
      return getTransactionTimestamp(right.date) - getTransactionTimestamp(left.date);
    }
    if (sortBy === "date-asc") {
      return getTransactionTimestamp(left.date) - getTransactionTimestamp(right.date);
    }
    if (sortBy === "amount-desc") {
      return right.amount - left.amount;
    }
    return left.amount - right.amount;
  });
}

export function getFinancialSummary(transactions: Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
}

export function getMonthlyOverview(transactions: Transaction[]) {
  const grouped = new Map<
    string,
    { monthKey: string; month: string; income: number; expenses: number; balance: number }
  >();

  for (const transaction of transactions) {
    const monthKey = getTransactionMonthKey(transaction.date);
    const monthDate = new Date(`${monthKey}-01T00:00:00`);
    const bucket = grouped.get(monthKey) ?? {
      monthKey,
      month: monthFormatter.format(monthDate),
      income: 0,
      expenses: 0,
      balance: 0,
    };

    if (transaction.type === "income") {
      bucket.income += transaction.amount;
    } else {
      bucket.expenses += transaction.amount;
    }

    bucket.balance = bucket.income - bucket.expenses;
    grouped.set(monthKey, bucket);
  }

  return [...grouped.values()].sort((left, right) => left.monthKey.localeCompare(right.monthKey));
}

export function getCategoryBreakdown(transactions: Transaction[]) {
  const grouped = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") continue;
    grouped.set(transaction.category, (grouped.get(transaction.category) ?? 0) + transaction.amount);
  }

  return [...grouped.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount);
}

export function getHighestSpendingCategory(transactions: Transaction[]) {
  return getCategoryBreakdown(transactions)[0] ?? null;
}

export function getMonthlyComparison(transactions: Transaction[]) {
  const overview = getMonthlyOverview(transactions);
  if (overview.length < 2) return null;

  const current = overview[overview.length - 1];
  const previous = overview[overview.length - 2];
  const difference = current.expenses - previous.expenses;

  return {
    currentMonth: current.month,
    previousMonth: previous.month,
    currentExpenses: current.expenses,
    previousExpenses: previous.expenses,
    difference,
  };
}

export function getInsightMessage(transactions: Transaction[]) {
  const summary = getFinancialSummary(transactions);
  const topCategory = getHighestSpendingCategory(transactions);
  const monthlyComparison = getMonthlyComparison(transactions);

  if (!transactions.length) {
    return "Add your first transaction to unlock personalized spending insights.";
  }

  if (!topCategory) {
    return `You have ${formatCurrency(summary.balance)} available with no tracked expenses yet.`;
  }

  if (!monthlyComparison) {
    return `${topCategory.category} is your biggest expense so far at ${formatCurrency(topCategory.amount)}.`;
  }

  const direction = monthlyComparison.difference > 0 ? "up" : monthlyComparison.difference < 0 ? "down" : "flat";
  const movement = Math.abs(monthlyComparison.difference);

  if (direction === "flat") {
    return `${topCategory.category} remains your top spending category, and expenses are flat month over month.`;
  }

  return `${topCategory.category} leads your spending, and ${monthlyComparison.currentMonth} expenses are ${direction} ${formatCurrency(movement)} vs ${monthlyComparison.previousMonth}.`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildTransactionExport(
  transactions: Transaction[],
  format: "csv" | "json",
) {
  if (format === "json") {
    return {
      filename: "finora-transactions.json",
      mimeType: "application/json",
      content: JSON.stringify(transactions, null, 2),
    };
  }

  const header = ["id", "date", "description", "category", "type", "amount", "status"];
  const rows = transactions.map((transaction) =>
    [
      transaction.id,
      transaction.date,
      escapeCsvValue(transaction.description),
      escapeCsvValue(transaction.category),
      transaction.type,
      transaction.amount.toFixed(2),
      transaction.status,
    ].join(","),
  );

  return {
    filename: "finora-transactions.csv",
    mimeType: "text/csv;charset=utf-8",
    content: [header.join(","), ...rows].join("\n"),
  };
}

function escapeCsvValue(value: string) {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}
