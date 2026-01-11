"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { registerUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerUser(formData);
      if (result.success) {
        router.push("/login?registered=true");
      } else {
        setError(result.message || "Registration failed.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-foreground">
      <main className="flex-grow flex items-center justify-center px-6 py-24 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[100px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-white/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-accent/20 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                <UserPlus className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Join Tomblr</h1>
              <p className="text-foreground/60">Complete your profile to start your secure journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Company (Optional)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="company"
                      type="text"
                      placeholder="Acme Inc."
                      className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 font-bold text-sm">🇳🇬</div>
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="0801 234 5678"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                  <input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Create Code (6 digits)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="password"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-[0.5em] font-mono text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Confirm Code</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      name="confirmPassword"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-[0.5em] font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-foreground/40">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
