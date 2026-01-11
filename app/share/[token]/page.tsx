"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Image as ImageIcon, FileSpreadsheet, File } from "lucide-react";
import { useParams } from "next/navigation";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-16 h-16" />;
  if (mimeType.includes("pdf")) return <FileText className="w-16 h-16" />;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return <FileSpreadsheet className="w-16 h-16" />;
  return <File className="w-16 h-16" />;
}

interface SharedFile {
  name: string;
  size: number;
  mimeType: string;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState<SharedFile | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    async function fetchFile() {
      try {
        const res = await fetch(`/api/share/${token}`);
        const data = await res.json();
        
        if (data.success) {
          setFile(data.file);
          setDownloadUrl(data.downloadUrl);
        } else {
          setError(data.error || "File not found");
        }
      } catch {
        setError("Failed to load file");
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      fetchFile();
    }
  }, [token]);

  const handleDownload = () => {
    if (downloadUrl && file) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <File className="w-20 h-20 mx-auto mb-4 text-foreground/20" />
          <h1 className="text-2xl font-bold mb-2">File Not Found</h1>
          <p className="text-foreground/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-accent/10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-accent/10 rounded-2xl mb-4 text-primary">
            {file && getFileIcon(file.mimeType)}
          </div>
          <h1 className="text-xl font-bold mb-1 truncate">{file?.name}</h1>
          <p className="text-foreground/60">{file && formatFileSize(file.size)}</p>
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-3 py-4 bg-foreground text-background rounded-2xl font-bold hover:scale-[1.02] transition-transform"
        >
          <Download className="w-5 h-5" />
          Download File
        </button>

        <p className="text-center text-sm text-foreground/40 mt-6">
          Shared via Tomblr Cloud Storage
        </p>
      </motion.div>
    </div>
  );
}
