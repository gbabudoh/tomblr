"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { 
  Upload, 
  FolderPlus, 
  File as FileIcon, 
  Folder, 
  Download, 
  Trash2, 
  Share2,
  Grid,
  List,
  Search,
  X,
  Image as ImageIcon,
  Database,
  Crown,
  ArrowUpDown,
  Move,
  Palette,
  Check,
  LogOut
} from "lucide-react";
import { 
  getFilesAction, 
  uploadFileAction, 
  createFolderAction, 
  deleteFileAction, 
  deleteFolderAction,
  getUsageAction
} from "@/lib/file-actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-6 h-6" />;
  if (mimeType.includes("pdf")) return <FileIcon className="w-6 h-6" />;
  if (mimeType.includes("word") || mimeType.includes("document")) return <FileIcon className="w-6 h-6" />;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return <FileIcon className="w-6 h-6" />;
  return <Folder className="w-6 h-6" />;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const [files, setFiles] = useState<Array<{ id: string; name: string; size: number; mimeType: string; createdAt: Date }>>([]);
  const [folders, setFolders] = useState<Array<{ id: string; name: string; color: string | null; createdAt: Date }>>([]);
  const [usage, setUsage] = useState<{ used: number; limit: number; percentage: number; tier: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [selectedFolderColor, setSelectedFolderColor] = useState("#6D28D9");
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);

  const FOLDER_COLORS = [
    "#6D28D9", // Purple
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#3B82F6", // Blue
    "#EC4899", // Pink
    "#6B7280", // Gray
  ];

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const result = await getFilesAction(session.user.id, currentFolderId || undefined);
      if (result.success) {
        setFiles(result.files || []);
        setFolders(result.folders || []);
        
        // If we are in a folder, we might want to find its info to allow "going back"
        // In a real app, getFilesAction would return current folder info too
        if (currentFolderId && result.folders) {
           // We can't easily find parentId from the children folders. 
           // Let's assume we handle navigation by passing parentId when opening.
        }
      }
      const usageRes = await getUsageAction(session.user.id);
      if (usageRes.success) {
        setUsage(usageRes.usage || null);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, currentFolderId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);



  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0 && session?.user?.id) {
      setIsUploading(true);
      for (const file of droppedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadFileAction(formData, session.user.id);
      }
      await fetchDashboardData();
      setIsUploading(false);
    }
  }, [session?.user?.id, fetchDashboardData]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0 && session?.user?.id) {
      setIsUploading(true);
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadFileAction(formData, session.user.id);
      }
      await fetchDashboardData();
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName && session?.user?.id) {
      const result = await createFolderAction(session.user.id, newFolderName, selectedFolderColor, currentFolderId || undefined);
      if (result.success) {
        setNewFolderName("");
        setSelectedFolderColor("#6D28D9");
        setShowNewFolderModal(false);
        await fetchDashboardData();
      } else {
        alert(result.message || "Failed to create folder");
      }
    }
  };

  const handleOpenFolder = (folder: { id: string; name: string; parentId?: string | null }) => {
    setParentFolderId(currentFolderId);
    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.name);
  };

  const handleGoBack = () => {
    // This is simple back. For full breadcrumbs we'd need a stack.
    setCurrentFolderId(parentFolderId);
    setCurrentFolderName(null);
    setParentFolderId(null); // This loses deeper history, but works for 1-level for now
  };

  const handleDeleteFolder = async (id: string) => {
    if (session?.user?.id && confirm("Are you sure? This will delete all files inside this folder.")) {
      await deleteFolderAction(id, session.user.id);
      await fetchDashboardData();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDeleteFile = async (id: string) => {
    if (session?.user?.id && confirm("Are you sure you want to delete this file?")) {
      await deleteFileAction(id, session.user.id);
      await fetchDashboardData();
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFolders = [...filteredFolders].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "size") return b.size - a.size;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Sidebar / Left Column for Stats (Desktop) */}
      <div className="flex flex-col lg:flex-row h-full">
        <aside className="w-full lg:w-72 border-r border-accent/10 p-6 flex flex-col gap-8 bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background font-black text-xl shadow-glow">T</div>
            <span className="font-bold text-xl tracking-tight text-foreground">Tomblr</span>
          </div>

          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl font-bold transition-all cursor-pointer">
              <Database className="w-5 h-5" />
              All Files
            </Link>
          </nav>

          {/* Storage Usage */}
          <div className="mt-auto bg-white rounded-3xl p-6 shadow-sm border border-accent/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-foreground/40">STORAGE</span>
              <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{usage?.tier || "FREE"}</span>
            </div>
            <div className="h-2 w-full bg-accent/10 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${usage?.percentage || 0}%` }}
              />
            </div>
            <p className="text-sm font-medium mb-4">
              {formatFileSize(usage?.used || 0)} <span className="text-foreground/40 font-normal">of {formatFileSize(usage?.limit || 0)} used</span>
            </p>
            <Link href="/dashboard/upgrade" className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background rounded-2xl font-bold hover:scale-[1.02] transition-transform text-sm cursor-pointer">
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all mt-4 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Exit
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-accent/10">
            <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-2xl font-bold text-foreground truncate">My Files</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-accent/5 border border-accent/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all"
                  />
                </div>
                <div className="flex bg-accent/5 rounded-lg p-1 border border-accent/10">
                  <button 
                    onClick={() => setSortBy(sortBy === "name" ? "date" : "name")} 
                    title="Sort Items"
                    className="p-1.5 rounded-md transition-all opacity-40 hover:opacity-100 cursor-pointer"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsRearrangeMode(!isRearrangeMode)} 
                    title="Rearrange Mode"
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${isRearrangeMode ? "bg-primary text-background shadow-sm" : "opacity-40 hover:opacity-100"}`}
                  >
                    <Move className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex bg-accent/5 rounded-lg p-1 border border-accent/10">
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "grid" ? "bg-white shadow-sm" : "opacity-40"}`}><Grid className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "list" ? "bg-white shadow-sm" : "opacity-40"}`}><List className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-10">
              <label className="cursor-pointer">
                <input type="file" multiple className="hidden" onChange={handleFileInput} />
                <div className="flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-2xl font-bold hover:shadow-xl transition-all hover:-translate-y-1">
                  <Upload className="w-5 h-5" />
                  Upload Files
                </div>
              </label>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center gap-2 px-8 py-4 bg-white border border-accent/20 rounded-2xl font-bold hover:bg-accent/5 transition-all cursor-pointer"
              >
                <FolderPlus className="w-5 h-5" />
                New Folder
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-[2.5rem] p-16 mb-12 transition-all group ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-accent/20 hover:border-accent/40 bg-white/50"
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xl font-bold text-foreground/60 animate-pulse">Processing files...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center text-foreground/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold">Drag and drop files here</p>
                    <p className="text-foreground/40">Images, PDFs, Word, Excel up to {usage?.tier === "PRO" ? "20GB" : "100MB"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Display */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="bg-white rounded-3xl p-6 h-40 animate-pulse border border-accent/5" />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {/* Folders */}
                {(filteredFolders.length > 0 || currentFolderId) && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        {currentFolderId && (
                          <button
                            onClick={handleGoBack}
                            className="p-2 hover:bg-accent/10 rounded-xl transition-colors text-foreground/60 cursor-pointer"
                            title="Go Back"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        )}
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          {currentFolderName || "Folders"} <span className="text-foreground/30 font-normal">({filteredFolders.length})</span>
                        </h2>
                      </div>
                    </div>
                    <div className={viewMode === "grid" 
                      ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
                      : "space-y-3"
                    }>
                      {sortedFolders.map((folder) => (
                        <motion.div
                          key={folder.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleOpenFolder(folder)}
                          className={`group cursor-pointer relative ${
                            viewMode === "grid"
                              ? "bg-white rounded-3xl p-6 border border-accent/10 hover:shadow-xl transition-all"
                              : "bg-white rounded-2xl p-4 flex items-center gap-4 border border-accent/10 hover:shadow-lg transition-all"
                          }`}
                        >
                          <div 
                            className={`p-3 rounded-2xl ${viewMode === "grid" ? "mb-4 w-fit" : ""}`}
                            style={{ backgroundColor: `${folder.color}20`, color: folder.color || "#6D28D9" }}
                          >
                            <Folder className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold truncate text-sm block">{folder.name}</span>
                            <span className="text-[10px] text-foreground/30 uppercase font-black tracking-tighter">
                              {new Date(folder.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isRearrangeMode && (
                              <div className="p-2 text-primary opacity-50">
                                <Move className="w-4 h-4" />
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                              }}
                              className="p-2 text-foreground/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Delete Folder"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Files */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        Recent Files <span className="text-foreground/30 font-normal">({sortedFiles.length})</span>
                      </h2>
                    </div>
                  {filteredFiles.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] py-24 border border-accent/10 text-center">
                      <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileIcon className="w-10 h-10 text-foreground/20" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No files here yet</h3>
                      <p className="text-foreground/40 max-w-xs mx-auto">Upload documents or images to see them here.</p>
                    </div>
                  ) : (
                    <div className={viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
                      : "space-y-3"
                    }>
                      {sortedFiles.map((file) => (
                        <motion.div
                          key={file.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`group relative cursor-pointer ${
                            viewMode === "grid"
                              ? "bg-white rounded-3xl p-6 border border-accent/10 hover:shadow-xl hover:-translate-y-1 transition-all"
                              : "bg-white rounded-2xl p-4 flex items-center gap-4 border border-accent/10 hover:shadow-lg transition-all"
                          }`}
                        >
                          <div className={`p-3 bg-accent/5 rounded-2xl text-primary ${viewMode === "grid" ? "mb-6 w-fit" : ""}`}>
                            {getFileIcon(file.mimeType)}
                          </div>
                          
                          <div className={viewMode === "list" ? "flex-1 min-w-0" : "min-w-0"}>
                            <p className="font-bold truncate text-sm mb-1">{file.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground/30">{formatFileSize(file.size)}</span>
                              <span className="text-xs text-foreground/20">•</span>
                              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-tighter">
                                {new Date(file.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                          </div>

                          <div className={`flex items-center gap-1 ${
                            viewMode === "grid" 
                              ? "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                              : ""
                          }`}>
                            <button className="p-2 bg-accent/5 hover:bg-accent/20 rounded-xl text-foreground/40 hover:text-foreground transition-all cursor-pointer"><Download className="w-4 h-4" /></button>
                            <button className="p-2 bg-accent/5 hover:bg-accent/20 rounded-xl text-foreground/40 hover:text-foreground transition-all cursor-pointer"><Share2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteFile(file.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-400 hover:text-red-500 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-accent/20"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">New Folder</h2>
              <button onClick={() => setShowNewFolderModal(false)} className="p-2 hover:bg-accent/10 rounded-full transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">Folder Name</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="My Awesome Folder"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-6 py-4 bg-accent/5 border border-accent/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1 flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  Select Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedFolderColor(color)}
                      className={`w-10 h-10 rounded-full transition-all flex items-center justify-center border-2 cursor-pointer ${
                        selectedFolderColor === color ? "border-foreground scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedFolderColor === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="flex-1 py-4 border border-accent/20 rounded-2xl font-bold hover:bg-accent/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-4 bg-foreground text-background rounded-2xl font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
