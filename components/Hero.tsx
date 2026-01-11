"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[100px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary/30 text-foreground rounded-full">
            Nigeria&apos;s First Localized Cloud
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-foreground">
            Simple, Secure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-foreground">
              Data Storage.
            </span>
          </h1>
          <p className="text-lg text-foreground/70 mb-8 max-w-lg leading-relaxed">
            Store your documents, images, and files securely. Access them from anywhere, anytime. Share instantly with built-in delivery options.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/access" className="bg-foreground text-background px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform cursor-pointer">
              Start Storing
            </Link>
            <button className="border-2 border-accent/20 px-8 py-4 rounded-full font-bold hover:bg-accent/5 transition-colors">
              View Pricing
            </button>
          </div>
          <div className="mt-12 flex items-center gap-4 text-sm text-foreground/50">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-accent border-2 border-background" />
              ))}
            </div>
            <span>Joined by 500+ Nigerian businesses</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 w-full aspect-square rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20">
            <Image
              src="/data.png"
              alt="Tomblr Cloud Storage"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Decorative elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-2xl shadow-lg flex items-center justify-center text-3xl z-20"
          >
            🛡️
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -left-6 w-32 h-16 bg-secondary rounded-2xl shadow-lg flex items-center justify-center font-bold px-4 z-20"
          >
            ₦1,000/mo
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
