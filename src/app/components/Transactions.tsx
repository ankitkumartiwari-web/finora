import { GlassCard } from "./GlassCard";
import { Search, ArrowUpDown, Pencil, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppStore } from "../store/useAppStore";
import {
  filterTransactions,
  formatTransactionDateTime,
  getTransactionDateInputValue,
  normalizeTransactionDate,
  sortTransactions,
  type TransactionSortOption,
} from "../lib/finance";

interface TransactionsProps {
  role: "admin" | "viewer";
  createTrigger?: number;
  presetFilterType?: "all" | "income" | "expense";
  resetFiltersTrigger?: number;
  globalSearchQuery?: string;
}

export function Transactions({
  role,
  createTrigger = 0,
  presetFilterType = "all",
  resetFiltersTrigger = 0,
  globalSearchQuery = "",
}: TransactionsProps) {
  const transactions = useAppStore((state) => state.transactions);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const updateTransaction = useAppStore((state) => state.updateTransaction);
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState<TransactionSortOption>("date-desc");
  const [showModal, setShowModal] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: getTransactionDateInputValue(new Date().toISOString()),
    description: "",
    category: "Food",
    type: "expense" as "income" | "expense",
    amount: "",
    status: "completed" as "completed" | "pending" | "failed",
  });
  const [formErrors, setFormErrors] = useState<{
    description?: string;
    amount?: string;
    category?: string;
  }>({});

  const categories = ["All", "Income", "Food", "Shopping", "Bills", "Entertainment", "Transport", "Education", "Health"];

  const filteredTransactions = useMemo(
    () =>
      sortTransactions(
        filterTransactions(transactions, {
          query: globalSearchQuery,
          category: filterCategory,
          type: filterType as "all" | "income" | "expense",
        }),
        sortBy,
      ),
    [transactions, globalSearchQuery, filterCategory, filterType, sortBy],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== "admin") {
      return;
    }

    // Clear previous errors
    const errors: { description?: string; amount?: string; category?: string } = {};

    // Validate description
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    // Validate category
    if (!formData.category.trim() || formData.category === "All") {
      errors.category = "Please select a category";
    }

    // Validate amount
    const parsedAmount = Number.parseFloat(formData.amount);
    if (!formData.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Amount must be a positive number";
    }

    // If there are errors, display them and don't submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      date: normalizeTransactionDate(formData.date),
      description: formData.description,
      category: formData.category,
      type: formData.type,
      amount: parsedAmount,
      status: formData.status,
    };

    if (editingTransactionId) {
      updateTransaction(editingTransactionId, payload);
    } else {
      addTransaction(payload);
    }

    setShowModal(false);
    setEditingTransactionId(null);
    setFormData({
      date: getTransactionDateInputValue(new Date().toISOString()),
      description: "",
      category: "Food",
      type: "expense",
      amount: "",
      status: "completed",
    });
    setFormErrors({});
  };

  const handleEdit = (transaction: (typeof transactions)[number]) => {
    if (role !== "admin") {
      return;
    }

    setEditingTransactionId(transaction.id);
    setFormData({
      date: getTransactionDateInputValue(transaction.date),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount.toString(),
      status: transaction.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  useEffect(() => {
    if (role === "admin" && createTrigger > 0) {
      setEditingTransactionId(null);
      setFormData({
        date: getTransactionDateInputValue(new Date().toISOString()),
        description: "",
        category: "Food",
        type: "expense",
        amount: "",
        status: "completed",
      });
      setFormErrors({});
      setShowModal(true);
    }
  }, [createTrigger, role]);

  useEffect(() => {
    setFilterType(presetFilterType);
    setFilterCategory("all");
  }, [presetFilterType]);

  useEffect(() => {
    setFilterCategory("all");
    setFilterType("all");
    setSortBy("date-desc");
  }, [resetFiltersTrigger]);

  return (
    <div className="space-y-6">
      {/* Mobile Header Actions */}
      <div className="md:hidden space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="justify-start" size="sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent align="start">
              {categories.map((cat) => {
                const value = cat.toLowerCase();
                return (
                  <SelectItem key={cat} value={value}>
                    {cat}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="justify-start" size="sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Header Actions */}
      <div className="hidden xl:flex flex-col 2xl:flex-row gap-4">
        {/* Filters */}
        <div className="flex gap-3 items-center">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="justify-start">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent align="start">
              {categories.map((cat) => {
                const value = cat.toLowerCase();
                return (
                  <SelectItem key={cat} value={value}>
                    {cat}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="justify-start">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tablet Header Actions */}
      <div className="hidden md:flex xl:hidden flex-col gap-3">
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="flex-1 justify-start" size="sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent align="start">
              {categories.map((cat) => {
                const value = cat.toLowerCase();
                return (
                  <SelectItem key={cat} value={value}>
                    {cat}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1 justify-start" size="sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transactions Table */}
      <GlassCard className="overflow-hidden" hover={false}>
        {/* Desktop Table */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() =>
                      setSortBy((current) => (current === "date-desc" ? "date-asc" : "date-desc"))
                    }
                    className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                  >
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                <th className="text-left p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Category</th>
                <th className="text-left p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
                <th className="text-right p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() =>
                      setSortBy((current) => (current === "amount-desc" ? "amount-asc" : "amount-desc"))
                    }
                    className="inline-flex items-center gap-2 hover:text-purple-600 transition-colors"
                  >
                    Amount
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-center p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                {role === "admin" && (
                  <th className="text-right p-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-6 text-sm text-gray-600 dark:text-gray-400">{formatTransactionDateTime(transaction.date)}</td>
                  <td className="p-6 font-medium text-gray-900 dark:text-white">{transaction.description}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      transaction.type === "income"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-pink-500/20 text-pink-600 dark:text-pink-400"
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`p-6 text-right font-semibold ${
                    transaction.type === "income" ? "text-green-500" : "text-gray-900 dark:text-white"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {currency.format(transaction.amount)}
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      transaction.status === "completed"
                        ? "bg-green-500/20 text-green-600"
                        : transaction.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-red-500/20 text-red-600"
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  {role === "admin" && (
                    <td className="p-6">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleEdit(transaction)}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#252525]"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile + Tablet Card View */}
        <div className="xl:hidden space-y-4 p-4 md:p-5">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="p-4 md:p-5 rounded-2xl bg-gray-50 dark:bg-[#1A1A1A]/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatTransactionDateTime(transaction.date)}</p>
                </div>
                <span className={`text-lg font-semibold ${
                  transaction.type === "income" ? "text-green-500" : "text-gray-900 dark:text-white"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {currency.format(transaction.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  {transaction.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  transaction.type === "income"
                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                    : "bg-pink-500/20 text-pink-600 dark:text-pink-400"
                  }`}>
                  {transaction.type}
                </span>
                {role === "admin" && (
                  <button
                    type="button"
                    onClick={() => handleEdit(transaction)}
                    className="ml-auto inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#252525]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center"
          >
            <Search className="w-10 h-10 text-gray-400" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No transactions yet</h3>
          <p className="text-gray-500">
            {transactions.length === 0
              ? "Add your first transaction to get started."
              : "No data matches your current filters."}
          </p>
        </motion.div>
      )}

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Transaction</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowModal(false);
                      setEditingTransactionId(null);
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 border-gray-200 dark:border-gray-800 focus:border-purple-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (formErrors.description) setFormErrors({ ...formErrors, description: undefined });
                      }}
                      className={`w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 transition-all outline-none ${
                        formErrors.description
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 dark:border-gray-800 focus:border-purple-500"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        setFormData({ ...formData, category: value });
                        if (formErrors.category) setFormErrors({ ...formErrors, category: undefined });
                      }}
                    >
                      <SelectTrigger
                        className={formErrors.category ? "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500/20" : ""}
                      >
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {categories.slice(1).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "expense" })}
                        className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                          formData.type === "expense"
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Expense
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "income" })}
                        className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                          formData.type === "income"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Income
                      </motion.button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => {
                        setFormData({ ...formData, amount: e.target.value });
                        if (formErrors.amount) setFormErrors({ ...formErrors, amount: undefined });
                      }}
                      className={`w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1A1A1A] border-2 transition-all outline-none ${
                        formErrors.amount
                          ? "border-red-500 focus:border-red-600"
                          : "border-gray-200 dark:border-gray-800 focus:border-purple-500"
                      }`}
                    />
                    {formErrors.amount && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.amount}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as "completed" | "pending" | "failed",
                        })
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
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    {editingTransactionId ? "Save Changes" : "Add Transaction"}
                  </motion.button>
                </form>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
