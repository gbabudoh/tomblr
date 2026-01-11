"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Files, 
  Database, 
  Key, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Plus,
  RefreshCcw,
  Search
} from "lucide-react";
import { getAdminStats, getUsersAction, getAccessCodesAction, generateAccessCodes } from "@/lib/admin-actions";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "users", label: "Users", icon: Users },
  { id: "codes", label: "Access Codes", icon: Key },
] as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ totalUsers: number; totalFiles: number; totalStorageUsed: number } | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; email: string | null; role: string; tier: string; createdAt: Date; _count: { files: number } }>>([]);
  const [codes, setCodes] = useState<Array<{ id: string; code: string; isUsed: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "codes">("overview");

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [statsRes, usersRes, codesRes] = await Promise.all([
        getAdminStats(),
        getUsersAction(),
        getAccessCodesAction()
      ]);

      if (statsRes.success) setStats(statsRes.stats || null);
      if (usersRes.success) setUsers((usersRes.users || []) as typeof users);
      if (codesRes.success) setCodes(codesRes.codes || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(false); // don't set loading back to true synchronously
  }, [loadData]);

  const handleGenerateCodes = async () => {
    await generateAccessCodes(5);
    loadData(true);
  };

  if (loading && !stats) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-white border-r border-accent/10 flex flex-col p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center font-bold text-xl">A</div>
          <span className="font-bold text-xl">Admin Control</span>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === item.id ? "bg-accent/5 text-foreground" : "text-foreground/40 hover:bg-accent/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 bg-accent/5 rounded-[2rem] text-center">
          <Settings className="w-8 h-8 mx-auto mb-3 text-foreground/20" />
          <p className="text-sm font-bold opacity-60">System Version</p>
          <p className="text-xs font-medium opacity-30 italic">v1.2.4-stable</p>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2 capitalize">{activeTab}</h1>
            <p className="text-foreground/40 font-medium">Manage your platform and monitor growth.</p>
          </div>
          <button onClick={() => loadData(true)} className="p-3 bg-white border border-accent/10 rounded-xl hover:shadow-lg transition-all">
            <RefreshCcw className="w-5 h-5" />
          </button>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "bg-blue-50 text-blue-500" },
                { label: "Total Files", value: stats?.totalFiles, icon: Files, color: "bg-green-50 text-green-500" },
                { label: "Storage Capacity", value: formatFileSize(stats?.totalStorageUsed || 0), icon: Database, color: "bg-purple-50 text-purple-500" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm"
                >
                  <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <card.icon className="w-7 h-7" />
                  </div>
                  <p className="text-foreground/40 font-bold uppercase text-xs tracking-widest mb-1">{card.label}</p>
                  <p className="text-3xl font-black">{card.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-accent/10 shadow-sm">
              <h2 className="text-xl font-bold mb-8 italic text-foreground/40">Recent Registration Activity</h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-accent/10 rounded-3xl">
                <p className="text-foreground/20 font-bold italic">Chart visualization coming soon (Redis/Analytics integration)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-[2.5rem] overflow-hidden border border-accent/10 shadow-sm">
            <div className="p-8 border-b border-accent/10 flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input type="text" placeholder="Search users by email..." className="pl-12 pr-4 py-3 bg-accent/5 rounded-xl text-sm focus:outline-none w-80" />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-accent/5 text-xs font-black uppercase tracking-widest opacity-40">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Files</th>
                  <th className="px-8 py-5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-sm">{user.name}</div>
                      <div className="text-xs text-foreground/40">{user.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.tier === "PRO" ? "bg-primary/20 text-primary" : "bg-accent/10 text-foreground/40"
                      }`}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-xs">{user.role}</td>
                    <td className="px-8 py-6 font-bold text-xs">{user._count.files}</td>
                    <td className="px-8 py-6 text-xs text-foreground/40">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "codes" && (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button 
                onClick={handleGenerateCodes}
                className="flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-2xl font-bold hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Bundle Generate (5 Codes)
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {codes.map((code) => (
                <div key={code.id} className="bg-white p-6 rounded-3xl border border-accent/10 flex flex-col items-center gap-4 text-center group hover:border-primary transition-all">
                  <div className="text-xl font-black tracking-widest font-mono text-primary">{code.code}</div>
                  <div className="flex items-center gap-2">
                    {code.isUsed ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 bg-red-50 px-2 py-1 rounded-full uppercase">
                        <XCircle className="w-3 h-3" /> Used
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
