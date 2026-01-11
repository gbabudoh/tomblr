"use client";

import { motion } from "framer-motion";
import { HardDrive, ShieldCheck, Zap, Globe, Smartphone, BarChart3 } from "lucide-react";

const features = [
  {
    title: "S3-Compatible Storage",
    description: "Industry standard API. Seamlessly migrate your existing data or connect with any S3-compatible tool.",
    icon: HardDrive,
    color: "bg-primary",
  },
  {
    title: "Regional Optimization",
    description: "Low-latency access across Nigeria. Your data stays close to your users for maximum speed.",
    icon: Zap,
    color: "bg-secondary",
  },
  {
    title: "Bank-Grade Security",
    description: "End-to-end encryption and localized compliance. Your data's safety is our top priority.",
    icon: ShieldCheck,
    color: "bg-accent",
  },
  {
    title: "Mobile-First Design",
    description: "Optimized for low-bandwidth networks. Access and manage your files even on 2G/3G connections.",
    icon: Smartphone,
    color: "bg-primary",
  },
  {
    title: "Chunked Uploads",
    description: "Resumable uploads ensure you never lose progress due to frequent network cuts.",
    icon: Globe,
    color: "bg-secondary",
  },
  {
    title: "Insightful Analytics",
    description: "Track your storage usage and costs with detailed, easy-to-read dashboards.",
    icon: BarChart3,
    color: "bg-accent",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need to Scale</h2>
          <p className="text-foreground/60 max-w-2xl mx-auto text-lg">
            Built for Nigeria&apos;s unique digital landscape. Fast, reliable, and localized for your business needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl border border-accent/10 bg-background hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
              <p className="text-foreground/60 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
