"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for individuals and small projects.",
    features: ["500MB Storage", "Access Anywhere", "Community Support", "Basic Analytics"],
    cta: "Start for Free",
    popular: false,
  },
  {
    name: "Standard",
    price: "1,000",
    period: "/ mo",
    description: "Ideal for growing businesses and professionals.",
    features: ["10GB Storage", "No Ads", "Priority Support", "Email Notifications", "API Access"],
    cta: "Upgrade to Standard",
    popular: true,
  },
  {
    name: "Premium",
    price: "2,500",
    period: "/ mo",
    description: "Advanced features for power users.",
    features: ["50GB Storage", "Tomblr Transfer (5GB/file)", "White-label Links", "Team Collaboration"],
    cta: "Go Premium",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
            No hidden fees. Choose a plan that fits your storage needs. Prices in Naira for the local market.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-[2.5rem] border ${
                tier.popular 
                ? "border-primary bg-background shadow-2xl scale-105" 
                : "border-accent/10 bg-white/50 backdrop-blur-sm"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2 text-foreground">{tier.name}</h3>
              <p className="text-foreground/60 text-sm mb-6">{tier.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-foreground">₦{tier.price}</span>
                <span className="text-foreground/50 ml-1">{tier.period || ""}</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3 text-sm text-foreground/70">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-foreground" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  tier.popular 
                  ? "bg-foreground text-background hover:shadow-xl" 
                  : "bg-primary text-foreground hover:bg-secondary"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
