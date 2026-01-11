"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, Shield, Headphones, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Standard",
    price: "0",
    description: "Perfect for temporary storage and light sharing.",
    features: ["5GB Storage Limit", "Standard Support", "Shared Links expire in 30 days", "Basic File Management"],
    isPopular: false,
    cta: "Current Plan",
    disabled: true
  },
  {
    name: "Pro Explorer",
    price: "2,500",
    description: "For serious creators and professionals who need more space.",
    features: ["500GB Storage Limit", "Priority Support", "Permanent Shared Links", "Advanced Analytics", "Custom Folder Colors", "Password Protected Links"],
    isPopular: true,
    cta: "Upgrade to Pro",
    disabled: false
  },
  {
    name: "Business",
    price: "10,000",
    description: "Scale your organization with collaborative tools.",
    features: ["5TB Storage Limit", "24/7 Dedicated Support", "Team Access Control", "Custom Branding", "API Access", "SSO Integration"],
    isPopular: false,
    cta: "Contact Sales",
    disabled: false
  }
];

export default function UpgradePage() {
  const { data: session } = useSession();

  const handleUpgrade = (tierName: string) => {
    // In a real app, this would redirect to Paystack/Stripe
    alert(`Upgrading ${session?.user?.email} to ${tierName}... (Payment integration coming soon)`);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold text-sm mb-6"
          >
            <Zap className="w-4 h-4" />
            Supercharge your storage
          </motion.div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Choose the perfect plan</h1>
          <p className="text-xl text-foreground/40 max-w-2xl mx-auto">
            Upgrade your Tomblr account to unlock more storage and advanced sharing features tailored for your growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[2.5rem] p-10 border transition-all ${
                tier.isPopular ? "border-primary shadow-2xl scale-105 z-10" : "border-accent/10 hover:shadow-xl"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-foreground font-bold text-sm rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-foreground/40 text-sm leading-relaxed">{tier.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">₦{tier.price}</span>
                <span className="text-foreground/40 font-bold uppercase text-xs">/ month</span>
              </div>

              <button
                onClick={() => !tier.disabled && handleUpgrade(tier.name)}
                disabled={tier.disabled}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-10 transition-all ${
                  tier.disabled 
                    ? "bg-accent/5 text-foreground/20 cursor-not-allowed" 
                    : tier.isPopular
                      ? "bg-primary text-foreground hover:shadow-xl"
                      : "bg-foreground text-background hover:shadow-xl"
                }`}
              >
                {tier.cta}
                {!tier.disabled && <ArrowRight className="w-5 h-5" />}
              </button>

              <div className="space-y-4">
                <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-6">What&apos;s included</p>
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full text-primary mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={4} />
                    </div>
                    <span className="text-sm font-medium text-foreground/70">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* trust indicators */}
        <div className="mt-32 pt-20 border-t border-accent/10 grid md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-accent/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-foreground/40" />
            </div>
            <p className="font-bold">Enterprise Security</p>
            <p className="text-sm text-foreground/40">256-bit AES encryption at rest and in transit.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-accent/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-foreground/40" />
            </div>
            <p className="font-bold">Lightning Fast</p>
            <p className="text-sm text-foreground/40">Optimized routes for African peering networks.</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-accent/10 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-foreground/40" />
            </div>
            <p className="font-bold">Local Support</p>
            <p className="text-sm text-foreground/40">Support team based in Lagos reachable 24/7.</p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link href="/dashboard" className="text-foreground/40 hover:text-foreground font-bold transition-colors">
            Back to My Files
          </Link>
        </div>
      </div>
    </div>
  );
}
