"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { MessageSquareQuote, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error || "Invalid email or password");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-sky-500/10">
            <MessageSquareQuote className="w-10 h-10 text-sky-400" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center text-white tracking-tight mb-2">
          Sign in to Mashup
        </h1>
        <p className="text-sm text-neutral-400 text-center mb-8">
          Welcome back! Join the conversation.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full bg-sky-500 hover:bg-sky-400 font-bold text-sm text-white flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-sky-400 hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
