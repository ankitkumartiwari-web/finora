import { initialTransactions, type Transaction } from "../app/lib/finance";
import { useAppStore } from "../app/store/useAppStore";

export function resetAppStore(overrides?: Partial<ReturnType<typeof useAppStore.getState>>) {
  localStorage.clear();
  useAppStore.setState({
    user: {
      id: "user-1",
      name: "Finora Tester",
      email: "tester@example.com",
      initials: "FT",
    },
    authStatus: "authenticated",
    theme: "dark",
    role: "admin",
    transactions: initialTransactions,
    ...overrides,
  });
}

export function setTransactions(transactions: Transaction[]) {
  useAppStore.getState().replaceTransactions(transactions);
}
