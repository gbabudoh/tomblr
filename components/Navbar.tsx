"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-foreground">T</div>
          <span className="text-xl font-bold tracking-tight text-foreground">Tomblr</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          <Link href="/register" className="text-sm font-medium hover:text-primary transition-colors">Register</Link>
        </div>

        <Link href="/access" className="bg-primary text-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-secondary transition-all transform hover:scale-105 active:scale-95 cursor-pointer">
          Get Access
        </Link>
      </div>
    </motion.nav>
  );
}
