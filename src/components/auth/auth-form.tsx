"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const actionFn = mode === "login" ? signIn : signUp;

  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    actionFn,
    undefined,
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-up">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-white text-zinc-950 border border-white font-black text-xl mb-2">
          P
        </div>
        <h1 className="font-display text-3xl font-black uppercase tracking-wider text-white">
          {mode === "login" ? "Welcome back" : "Join PLANET PLUTO"}
        </h1>
        <p className="text-sm text-zinc-400">
          {mode === "login"
            ? "Log in to access your tracking list and progress"
            : "Create an account to begin tracking anime and rating series"}
        </p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/50 border border-white/10">
        {/* State Alerts */}
        {state?.error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-st-dropped/10 border border-st-dropped/20 p-3.5 text-xs text-st-dropped">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{state.error}</span>
          </div>
        )}

        {state?.message && (
          <div role="status" className="flex items-start gap-2.5 rounded-2xl bg-st-completed/10 border border-st-completed/20 p-3.5 text-xs text-st-completed">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="auth-username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="auth-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. shadow_monarch"
                  minLength={3}
                  maxLength={24}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                minLength={8}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isPending}
            id="auth-submit-btn"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {mode === "login" ? "Sign In" : "Sign Up"}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center border-t border-white/5">
          {mode === "login" ? (
            <p className="text-xs text-zinc-400">
              Don&apos;t have an account yet?{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent font-semibold hover:underline">
                Create one now
              </Link>
            </p>
          ) : (
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-accent font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
