"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccessPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        phoneNumber,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-foreground">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[100px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-accent/20 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-glow">
                <LogIn className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-foreground/60">Enter your credentials to access your storage.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Phone Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-lg">🇳🇬</span>
                  </div>
                  <input
                    name="phoneNumber"
                    type="tel"
                    placeholder="0801 234 5678"
                    required
                    className="w-full pl-14 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">PIN Code (6 digits)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                  <input
                    name="password"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="••••••"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-background border border-accent/10 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-[0.4em] font-mono text-lg"
                  />
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
                className="group w-full py-4 bg-foreground text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-foreground/40">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-foreground font-bold hover:underline cursor-pointer">Register</Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
