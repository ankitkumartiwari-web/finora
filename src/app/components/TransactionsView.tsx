import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useAppStore } from "../store/useAppStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  buildTransactionExport,
  filterTransactions,
  formatCurrency,
  formatTransactionDateTime,
  getTransactionDateInputValue,
  normalizeTransactionDate,
  sortTransactions,
  type Transaction,
  type TransactionDraft,
  type TransactionSortOption,
} from "../lib/finance";

interface TransactionsViewProps {
  role: "admin" | "viewer";
}

interface FormState {
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: string;
  status: "completed" | "pending" | "failed";
}

const categories = [
  "Income",
  "Food",
  "Shopping",
  "Bills",
  "Entertainment",
  "Transport",
  "Education",
  "Health",
  "Travel",
  "Other",
];

const emptyForm: FormState = {
  date: getTransactionDateInputValue(new Date().toISOString()),
  description: "",
  category: "Food",
  type: "expense",
  amount: "",
  status: "completed",
};

export function TransactionsView({ role }: TransactionsViewProps) {
  const transactions = useAppStore((state) => state.transactions);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const updateTransaction = useAppStore((state) => state.updateTransaction);
  const deleteTransaction = useAppStore((state) => state.deleteTransaction);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [sortBy, setSortBy] = useState<TransactionSortOption>("date-desc");
  const [showModal, setShowModal] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredTransactions = useMemo(
    () =>
      sortTransactions(
        filterTransactions(transactions, {
          query: searchQuery,
          category: filterCategory,
          type: filterType,
        }),
        sortBy,
      ),
    [filterCategory, filterType, searchQuery, sortBy, transactions],
  );

  const openCreateModal = () => {
    setEditingTransactionId(null);
    setFormData({ ...emptyForm, date: getTransactionDateInputValue(new Date().toISOString()) });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setFormData({
      date: getTransactionDateInputValue(transaction.date),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount.toString(),
      status: transaction.status,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAmount = Number(formData.amount);

    if (!formData.description.trim() || !formData.category.trim() || !formData.date) {
      setFormError("Please complete every required field.");
      return;
    }

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      setFormError("Enter a valid amount greater than zero.");
      return;
    }

    const payload: TransactionDraft = {
      date: normalizeTransactionDate(formData.date),
      description: formData.description,
      category: formData.category,
      type: formData.type,
      amount: nextAmount,
      status: formData.status,
    };

    if (editingTransactionId) {
      updateTransaction(editingTransactionId, payload);
    } else {
      addTransaction(payload);
    }

    setShowModal(false);
    setFormData(emptyForm);
    setEditingTransactionId(null);
    setFormError("");
  };

  const handleExport = (format: "csv" | "json") => {
    const { content, filename, mimeType } = buildTransactionExport(filteredTransactions, format);
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-4 sm:p-6" hover={false}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by keyword, category, or date"
              className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 outline-none transition-all duration-300 focus:border-[#0b6b45] dark:border-gray-800 dark:bg-[#1A1A1A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="min-w-[170px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as TransactionSortOption)}>
              <SelectTrigger className="min-w-[170px]">
                <SelectValue placeholder="Sort transactions" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="amount-desc">Highest amount</SelectItem>
                <SelectItem value="amount-asc">Lowest amount</SelectItem>
              </SelectContent>
            </Select>

            {role === "admin" && (
              <>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-[#1A1A1A] dark:text-gray-200"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-[#1A1A1A] dark:text-gray-200"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "income", "expense"] as const).map((value) => {
            const label = value === "all" ? "All" : value === "income" ? "Income" : "Expense";
            const active = filterType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilterType(value)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#0b6b45] text-white dark:bg-[#c78dff] dark:text-[#111]"
                    : "border border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-[#1A1A1A] dark:text-gray-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden" hover={false}>
        {filteredTransactions.length ? (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="p-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    <th className="p-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                    <th className="p-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Category</th>
                    <th className="p-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
                    <th className="p-6 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="p-6 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    {role === "admin" && (
                      <th className="p-6 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-6 text-sm text-gray-600 dark:text-gray-400">{formatTransactionDateTime(transaction.date)}</td>
                      <td className="p-6 font-medium text-gray-900 dark:text-white">{transaction.description}</td>
                      <td className="p-6 text-sm text-gray-600 dark:text-gray-300">{transaction.category}</td>
                      <td className="p-6">
                        <Badge tone={transaction.type === "income" ? "income" : "expense"}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-6 text-right font-semibold text-gray-900 dark:text-white">
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="p-6 text-center">
                        <Badge tone={transaction.status}>{transaction.status}</Badge>
                      </td>
                      {role === "admin" && (
                        <td className="p-6">
                          <div className="flex items-center justify-end gap-2">
                            <ActionButton label={`Edit ${transaction.description}`} onClick={() => openEditModal(transaction)}>
                              <Pencil className="h-4 w-4" />
                            </ActionButton>
                            <ActionButton
                              label={`Delete ${transaction.description}`}
                              onClick={() => deleteTransaction(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionButton>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 p-4 xl:hidden">
              {filteredTransactions.map((transaction, index) => (
                <motion.article
                  key={transaction.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl bg-gray-50 p-4 dark:bg-[#1A1A1A]/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                      <p className="mt-1 text-sm text-gray-500">{formatTransactionDateTime(transaction.date)}</p>
                    </div>
                    <p className="text-right font-semibold text-gray-900 dark:text-white">
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{transaction.category}</Badge>
                    <Badge tone={transaction.type === "income" ? "income" : "expense"}>{transaction.type}</Badge>
                    <Badge tone={transaction.status}>{transaction.status}</Badge>
                  </div>
                  {role === "admin" && (
                    <div className="mt-4 flex gap-2">
                      <ActionButton label={`Edit ${transaction.description}`} onClick={() => openEditModal(transaction)}>
                        <Pencil className="h-4 w-4" />
                      </ActionButton>
                      <ActionButton label={`Delete ${transaction.description}`} onClick={() => deleteTransaction(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          </>
        ) : (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A1A1A]">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No transactions yet</h3>
            <p className="mt-2 text-gray-500">
              No data matches your current filters. Adjust them or add a new transaction.
            </p>
          </div>
        )}
      </GlassCard>

      {role === "admin" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCreateModal}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-[#0b6b45] p-4 text-white shadow-2xl shadow-green-500/40 transition-all duration-300 dark:bg-[#c78dff] dark:text-[#111]"
          aria-label="Add transaction"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-24px)] max-w-lg -translate-x-1/2 -translate-y-1/2"
            >
              <GlassCard className="p-6" hover={false}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {editingTransactionId ? "Edit Transaction" : "Add Transaction"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-[#252525]"
                    aria-label="Close transaction form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field label="Date">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#0b6b45] dark:border-gray-800 dark:bg-[#1A1A1A]"
                    />
                  </Field>

                  <Field label="Description">
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, description: event.target.value }))
                      }
                      className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#0b6b45] dark:border-gray-800 dark:bg-[#1A1A1A]"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Category">
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((current) => ({ ...current, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field label="Status">
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData((current) => ({
                            ...current,
                            status: value as FormState["status"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Type">
                      <div className="flex gap-3">
                        {(["expense", "income"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData((current) => ({ ...current, type }))}
                            className={`flex-1 rounded-2xl py-3 font-medium transition-all ${
                              formData.type === type
                                ? type === "income"
                                  ? "bg-green-600 text-white"
                                  : "bg-rose-600 text-white"
                                : "bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400"
                            }`}
                          >
                            {type[0].toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Amount">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))}
                        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-[#0b6b45] dark:border-gray-800 dark:bg-[#1A1A1A]"
                      />
                    </Field>
                  </div>

                  {formError && <p className="text-sm font-medium text-rose-600">{formError}</p>}

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#0b6b45] py-4 font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-500/40 dark:bg-[#c78dff] dark:text-[#111]"
                  >
                    {editingTransactionId ? "Save Changes" : "Add Transaction"}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "income" | "expense" | "completed" | "pending" | "failed" | "neutral";
}) {
  const styles = {
    income: "bg-green-500/20 text-green-700 dark:text-green-300",
    expense: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
    completed: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    pending: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    failed: "bg-red-500/20 text-red-700 dark:text-red-300",
    neutral: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  } satisfies Record<string, string>;

  return <span className={`rounded-full px-3 py-1 text-sm ${styles[tone]}`}>{children}</span>;
}

function ActionButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#252525]"
    >
      {children}
    </button>
  );
}
