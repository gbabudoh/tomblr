"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-accent/10 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center font-bold text-xs text-foreground">T</div>
            <span className="text-lg font-bold tracking-tight text-foreground">Tomblr</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-foreground/60">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
          
          <div className="text-sm text-foreground/40">
            © {new Date().getFullYear()} Tomblr. Made with ❤️ for Africa.
          </div>
        </div>
      </div>
    </footer>
  );
}
