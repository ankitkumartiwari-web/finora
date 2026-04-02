import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  createTransaction,
  initialTransactions,
  normalizeTransactionDate,
  type Transaction,
  type TransactionDraft,
} from "../lib/finance";
import { supabase } from "../lib/supabase";

export type ThemeMode = "light" | "dark";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  initials: string;
}

interface AuthResult {
  error?: string;
}

interface SignupResult extends AuthResult {
  requiresEmailConfirmation?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  authStatus: "unauthenticated" | "authenticated";
  theme: ThemeMode;
  role: "admin" | "viewer";
  transactions: Transaction[];
  setTheme: (theme: ThemeMode) => void;
  setRole: (role: "admin" | "viewer") => void;
  addTransaction: (transaction: TransactionDraft) => void;
  updateTransaction: (id: string, updates: Partial<TransactionDraft>) => void;
  deleteTransaction: (id: string) => void;
  replaceTransactions: (transactions: Transaction[]) => void;
  initializeAuth: () => Promise<void>;
  syncAuthUser: (user: SupabaseUser | null) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    profileImage?: string;
  }) => Promise<SignupResult>;
  logout: () => Promise<void>;
}

const getInitials = (name: string) => {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return "PF";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const mapSupabaseUserToProfile = (supabaseUser: SupabaseUser): UserProfile => {
  const metadata = supabaseUser.user_metadata as Record<string, unknown> | null;
  const rawName = typeof metadata?.name === "string" ? metadata.name : "";
  const fallbackName = supabaseUser.email?.split("@")[0] ?? "Finora User";
  const name = (rawName || fallbackName).trim() || "Finora User";
  const profileImage =
    typeof metadata?.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata?.profileImage === "string"
      ? metadata.profileImage
      : undefined;

  return {
    id: supabaseUser.id,
    name,
    email: supabaseUser.email ?? "",
    profileImage,
    initials: getInitials(name),
  };
};

export const useAppStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      authStatus: "unauthenticated",
      theme: "dark",
      role: "admin",
      transactions: initialTransactions,
      setTheme: (theme) => set({ theme }),
      setRole: (role) => set({ role }),
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [createTransaction(transaction), ...state.transactions],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? {
                  ...transaction,
                  ...updates,
                  date: updates.date ? normalizeTransactionDate(updates.date) : transaction.date,
                  description: updates.description?.trim() ?? transaction.description,
                  category: updates.category?.trim() ?? transaction.category,
                  amount:
                    updates.amount !== undefined ? Number(updates.amount) : transaction.amount,
                }
              : transaction,
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
        })),
      replaceTransactions: (transactions) => set({ transactions }),
      syncAuthUser: (user) => {
        if (!user) {
          set({ authStatus: "unauthenticated", user: null });
          return;
        }

        set({
          authStatus: "authenticated",
          user: mapSupabaseUserToProfile(user),
        });
      },
      initializeAuth: async () => {
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error || !data.session?.user) {
            set({ authStatus: "unauthenticated", user: null });
            return;
          }

          set({
            authStatus: "authenticated",
            user: mapSupabaseUserToProfile(data.session.user),
          });
        } catch {
          set({ authStatus: "unauthenticated", user: null });
        }
      },
      login: async (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
          return { error: "Please enter both email and password." };
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: trimmedPassword,
          });

          if (error || !data.user) {
            return { error: error?.message ?? "Unable to login. Please try again." };
          }

          set({
            authStatus: "authenticated",
            user: mapSupabaseUserToProfile(data.user),
          });

          return {};
        } catch {
          return { error: "Unable to reach the authentication service. Check your Supabase URL and key." };
        }
      },
      signup: async ({ name, email, password, profileImage }) => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
          return { error: "Please complete all required fields." };
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: trimmedPassword,
            options: {
              data: {
                name: trimmedName,
                avatar_url: profileImage,
              },
            },
          });

          if (error) {
            return { error: error.message };
          }

          const nextUser = data.user ? mapSupabaseUserToProfile(data.user) : null;
          const isAuthenticated = Boolean(data.session?.user);

          set({
            user: nextUser,
            authStatus: isAuthenticated ? "authenticated" : "unauthenticated",
          });

          return {
            requiresEmailConfirmation: !isAuthenticated,
          };
        } catch {
          return { error: "Unable to reach the authentication service. Check your Supabase URL and key." };
        }
      },
      logout: async () => {
        try {
          await supabase.auth.signOut();
        } finally {
          set({
            authStatus: "unauthenticated",
            user: null,
          });
        }
      },
    }),
    {
      name: "premium-finance-app",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any) => ({
        ...persistedState,
        transactions: initialTransactions,
      }),
      partialize: (state) => ({
        user: state.user,
        authStatus: state.authStatus,
        theme: state.theme,
        role: state.role,
        transactions: state.transactions,
      }),
    },
  ),
);
