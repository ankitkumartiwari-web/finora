import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Mail, Lock, User, UploadCloud, Moon, Sun, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { type ThemeMode, useAppStore } from "../../store/useAppStore";
import { SmokeBackground } from "../ui/spooky-smoke-animation";
import { ShaderErrorBoundary } from "../ui/ShaderErrorBoundary";
import { DynamicFallbackBackground } from "../ui/DynamicFallbackBackground";

interface AuthFormState {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
}

type FeedbackTone = "error" | "success";

export function AuthExperience() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formState, setFormState] = useState<AuthFormState>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("error");
  const [loading, setLoading] = useState(false);

  const login = useAppStore((state) => state.login);
  const signup = useAppStore((state) => state.signup);
  const currentTheme = useAppStore((state) => state.theme);
  const { setTheme, resolvedTheme } = useTheme();
  const activeTheme = (resolvedTheme as ThemeMode | undefined) ?? currentTheme ?? "dark";
  const brandLogo = activeTheme === "dark" ? "/images/darkmode.webp" : "/images/lightmode.webp";

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = currentTheme === "dark" ? "light" : "dark";
    console.info("[Finora theme debug] AuthExperience toggle", {
      currentTheme: activeTheme,
      nextTheme,
      resolvedTheme,
    });
    setTheme(nextTheme);
  };

  const handleInputChange = (
    field: keyof AuthFormState,
    value: string,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file?: File) => {
    if (!file) {
      handleInputChange("profileImage", "");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleInputChange("profileImage", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormState({ name: "", email: "", password: "" });
    setFeedback(null);
    setFeedbackTone("error");
    setShowPassword(false);
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback(null);
    setFeedbackTone("error");
    setLoading(true);

    const trimmedEmail = formState.email.trim();
    const trimmedPassword = formState.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setFeedback("Please complete all fields before continuing.");
      setLoading(false);
      return;
    }

    if (mode === "signup" && !formState.name.trim()) {
      setFeedback("A full name helps us personalize your experience.");
      setLoading(false);
      return;
    }

    const action = mode === "login"
      ? () => login(trimmedEmail, trimmedPassword)
      : () =>
          signup({
            name: formState.name,
            email: trimmedEmail,
            password: trimmedPassword,
            profileImage: formState.profileImage,
          });

    const result = await action();
    if (result?.error) {
      setFeedback(result.error);
    } else if (mode === "signup") {
      resetForm();
      setFeedbackTone("success");
      if (result?.requiresEmailConfirmation) {
        setFeedback(`Account created. Your Supabase project still requires email confirmation for ${trimmedEmail}. To remove that waiting step, disable Confirm email in Supabase Auth settings.`);
        setMode("login");
      } else {
        setFeedback(`Welcome to Finora. Your account is ready and you are signed in as ${trimmedEmail}.`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#dfe7f7] dark:bg-[#050509]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-35 sm:opacity-55 dark:opacity-45 sm:dark:opacity-65">
          <ShaderErrorBoundary
            fallback={<DynamicFallbackBackground />}
          >
            <SmokeBackground smokeColor={resolvedTheme === "dark" ? "#9b7bff" : "#1a8f61"} />
          </ShaderErrorBoundary>
        </div>
        <motion.div
          className="absolute -top-20 -right-10 h-64 w-64 sm:-top-28 sm:-right-16 sm:h-96 sm:w-96 rounded-full bg-[#0b6b45]/30 dark:bg-[#b56fff]/25 blur-3xl"
          animate={{ x: [0, -35, 10, 0], y: [0, 28, -16, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-28 -left-16 h-64 w-64 sm:-bottom-44 sm:-left-24 sm:h-[30rem] sm:w-[30rem] rounded-full bg-[#9efac8]/45 dark:bg-[#5a2bb8]/35 blur-[140px]"
          animate={{ x: [0, 26, -14, 0], y: [0, -22, 12, 0], scale: [1, 0.96, 1.06, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-12 h-52 w-52 sm:-left-16 sm:h-72 sm:w-72 rounded-full bg-[#6ac6ff]/25 dark:bg-[#8f6bff]/25 blur-[110px]"
          animate={{ x: [0, 20, -8, 0], y: [0, -30, 12, 0], opacity: [0.45, 0.7, 0.5, 0.45] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 40%", "30% 100%", "0% 0%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 80% 10%, rgba(15,107,69,0.30), transparent 44%), radial-gradient(circle at 60% 85%, rgba(106,198,255,0.24), transparent 40%), radial-gradient(circle at 30% 70%, rgba(199,141,255,0.30), transparent 42%)",
            backgroundSize: "180% 180%",
            opacity: 0.6,
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden w-full max-w-xl rounded-[32px] border border-white/60 bg-white/90 dark:bg-[#0c0c12]/80 dark:border-white/5 shadow-[0_35px_120px_rgba(15,28,42,0.25)] backdrop-blur-2xl p-5 sm:p-8 lg:p-10 space-y-8"
        >
          <div className="relative z-30 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={brandLogo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleThemeToggle}
              className="rounded-2xl border border-gray-200 dark:border-white/10 p-3 text-gray-600 dark:text-gray-200"
            >
              {activeTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>

          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">{mode === "login" ? "Welcome Back" : "Create Account"}</p>
            <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              {mode === "login" ? "Access your premium dashboard" : "Craft your personalized experience"}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-prose">
              Secure authentication with real-time theme sync, profile personalization, and immersive micro-interactions.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                onSubmit={handleAuth}
                className="space-y-5"
              >
                <AuthInput
                  label="Email"
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                  value={formState.email}
                  onChange={(val) => handleInputChange("email", val)}
                />
                <AuthInput
                  label="Password"
                  icon={<Lock className="w-4 h-4" />}
                  type={showPassword ? "text" : "password"}
                  value={formState.password}
                  onChange={(val) => handleInputChange("password", val)}
                  actionButton={
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-gray-400 hover:text-[#0b6b45] dark:hover:text-[#c78dff]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {feedback && (
                  <p
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      feedbackTone === "success"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10"
                    }`}
                  >
                    {feedback}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0px 20px 45px rgba(11,107,69,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b6b45] to-[#4bd68c] py-3.5 text-white font-semibold transition-all disabled:opacity-60 dark:from-[#c78dff] dark:to-[#8f6bff]"
                >
                  {loading ? "Authenticating..." : "Login"}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Don’t have an account?{" "}
                  <button type="button" onClick={() => { setMode("signup"); setFeedback(null); setFeedbackTone("error"); }} className="font-semibold text-[#0b6b45] dark:text-[#c78dff]">
                    Sign up
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                onSubmit={handleAuth}
                className="space-y-5"
              >
                <AuthInput
                  label="Full Name"
                  icon={<User className="w-4 h-4" />}
                  type="text"
                  value={formState.name}
                  onChange={(val) => handleInputChange("name", val)}
                />
                <AuthInput
                  label="Email"
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                  value={formState.email}
                  onChange={(val) => handleInputChange("email", val)}
                />
                <AuthInput
                  label="Password"
                  icon={<Lock className="w-4 h-4" />}
                  type={showPassword ? "text" : "password"}
                  value={formState.password}
                  onChange={(val) => handleInputChange("password", val)}
                  actionButton={
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-gray-400 hover:text-[#0b6b45] dark:hover:text-[#c78dff]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload Profile Image (optional)</label>
                  <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 text-center">
                    {formState.profileImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <img src={formState.profileImage} alt="Preview" className="h-20 w-20 rounded-full object-cover border border-white/70 shadow-inner" />
                        <button type="button" onClick={() => handleInputChange("profileImage", "")} className="text-xs text-red-500">Remove</button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Drop an image, or click to browse</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageUpload(event.target.files?.[0])}
                      className="cursor-pointer text-sm text-gray-500"
                    />
                  </div>
                </div>

                {feedback && (
                  <p
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      feedbackTone === "success"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10"
                    }`}
                  >
                    {feedback}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0px 20px 45px rgba(11,107,69,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b6b45] to-[#4bd68c] py-3.5 text-white font-semibold transition-all disabled:opacity-60 dark:from-[#c78dff] dark:to-[#8f6bff]"
                >
                  {loading ? "Creating profile..." : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <button type="button" onClick={() => { setMode("login"); setFeedback(null); setFeedbackTone("error"); }} className="font-semibold text-[#0b6b45] dark:text-[#c78dff]">
                    Login
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface AuthInputProps {
  label: string;
  icon: ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  actionButton?: ReactNode;
}

function AuthInput({ label, icon, type = "text", value, onChange, actionButton }: AuthInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <div className="group relative flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-gray-900 shadow-[0_15px_35px_rgba(15,28,42,0.08)] transition-all focus-within:border-[#0b6b45] focus-within:shadow-[0_20px_45px_rgba(11,107,69,0.18)] dark:border-white/10 dark:bg-white/5 dark:text-white">
        <span className="text-gray-400 group-focus-within:text-[#0b6b45] dark:group-focus-within:text-[#c78dff]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
        {actionButton}
      </div>
    </label>
  );
}
