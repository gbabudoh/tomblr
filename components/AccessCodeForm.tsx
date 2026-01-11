"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { verifyAccessCode } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, ArrowRight } from "lucide-react";

export default function AccessCodeForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await verifyAccessCode(code);
      if (result.success) {
        router.push("/register");
      } else {
        setError(result.message || "Something went wrong.");
      }
    } catch {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-accent/20 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-glow">
            <KeyRound className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Tomblr</h1>
          <p className="text-foreground/60">Enter your exclusive invite code to begin your secure storage journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Access Code"
              required
              className="w-full px-6 py-4 bg-background border border-accent/10 rounded-2xl text-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all uppercase tracking-widest text-center font-mono"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100"
            >
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading || !code}
            className="group relative w-full py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                Verify Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground/40 leading-relaxed">
          Don&apos;t have a code? <br />
          Join the waitlist to get your invitation.
        </p>
      </motion.div>
    </div>
  );
}
