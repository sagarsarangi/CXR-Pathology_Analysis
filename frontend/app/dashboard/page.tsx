"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  LogOut, User, Shield, Activity, Zap, 
  Upload, Scan, Brain, Crosshair, AlertCircle, 
  CheckCircle2, Info, Loader2, ArrowRight, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface Prediction {
  prob: number;
  positive: boolean;
  uncertainty: string;
}

interface Finding {
  condition: string;
  prob: number;
  normalized_conf: number;
  risk: string;
}

interface YoloBox {
  class: string;
  conf: number;
  xyxy: number[];
}

interface AnalysisResults {
  status: string;
  predictions: Record<string, Prediction>;
  positive_conditions: string[];
  confirmed_findings: Finding[];
  risk_level: string;
  localization_type: Record<string, string>;
  images: {
    original_b64: string;
    heatmap_b64: string;
    boxes_b64: string;
    combined_b64: string;
    individual_heatmaps: Record<string, string>;
  };
  yolo_boxes: YoloBox[];
  model_info: {
    densenet_auc: number;
    yolo_map50: number;
  };
  case_flags: string[];
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const supabase = createClient();

  // --- UI State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"original" | "heatmap" | "boxes">("original");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResults(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResults(null);
      setError(null);
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image. Ensure backend is running.");
      }

      const data = await response.json();
      setResults(data);
      if (data.yolo_boxes.length > 0) setViewMode("boxes");
      else if (Object.keys(data.images.individual_heatmaps).length > 0) setViewMode("heatmap");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Brain className="text-accent h-8 w-8" />
            Neural Diagnostic Terminal
          </h1>
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedFile(null); setPreviewUrl(null); setResults(null); }}
              className="px-6 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-full text-xs font-bold tracking-widest uppercase transition-all"
            >
              Reset
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-full text-xs font-bold tracking-widest uppercase transition-all"
            >
              <LogOut className="h-4 w-4" />
              Terminate
            </button>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Interaction & Preview */}
        <div className="lg:col-span-7 space-y-6">
          
          {!previewUrl ? (
            // Upload Dropzone
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-[500px] border-2 border-dashed border-white/10 hover:border-accent/40 rounded-container flex flex-col items-center justify-center transition-all cursor-pointer bg-surface/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center text-center px-8">
                <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Initialize Scan Data</h3>
                <p className="text-white/40 text-sm max-w-xs font-mono uppercase tracking-wider leading-relaxed">
                  Drop Chest X-Ray DICOM/PNG/JPG or Click to Browse System
                </p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            // Preview & Result Visualization
            <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-container overflow-hidden">
              <div className="relative aspect-square md:aspect-auto md:h-[600px] bg-black flex items-center justify-center">
                
                {/* Layered Display */}
                {results ? (
                  <>
                    <img 
                      src={
                        viewMode === "original" ? previewUrl : 
                        viewMode === "heatmap" ? `data:image/jpeg;base64,${results.images.heatmap_b64}` :
                        `data:image/jpeg;base64,${results.images.boxes_b64}`
                      } 
                      className="max-h-full max-w-full object-contain"
                      alt="Diagnostic view"
                    />
                    
                    {/* View Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 p-x-2">
                        <ViewBtn active={viewMode === "original"} onClick={() => setViewMode("original")} label="Raw" icon={<Eye className="h-3 w-3" />} />
                        {Object.keys(results.images.individual_heatmaps).length > 0 && (
                          <ViewBtn active={viewMode === "heatmap"} onClick={() => setViewMode("heatmap")} label="Heatmap" icon={<Brain className="h-3 w-3" />} />
                        )}
                        {results.yolo_boxes.length > 0 && (
                          <ViewBtn active={viewMode === "boxes"} onClick={() => setViewMode("boxes")} label="Detection" icon={<Crosshair className="h-3 w-3" />} />
                        )}
                    </div>
                  </>
                ) : (
                  <img src={previewUrl} className="max-h-full max-w-full object-contain opacity-50" alt="Preview" />
                )}

                {/* Processing Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 text-accent animate-spin" />
                    <p className="font-mono text-xs text-accent tracking-[0.3em] uppercase animate-pulse">Running Neural Inference...</p>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              {!results && !isAnalyzing && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-white/40 text-[10px] font-mono uppercase truncate max-w-[200px]">
                    File: {selectedFile?.name}
                  </span>
                  <button 
                    onClick={runAnalysis}
                    className="flex items-center gap-2 px-8 py-2 bg-accent text-primary rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all"
                  >
                    <Scan className="h-4 w-4" />
                    Execute Diagnostic
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-container flex items-start gap-3">
              <AlertCircle className="text-red-400 h-5 w-5 mt-0.5" />
              <div className="space-y-1">
                <p className="text-red-400 text-sm font-bold">Inference Error</p>
                <p className="text-red-400/60 text-xs font-mono">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Risk Level Badge */}
          {results && (
            <div className={cn(
              "p-6 rounded-container border transition-all",
              results.risk_level === "CRITICAL" ? "bg-red-500/10 border-red-500/20" :
              results.risk_level === "HIGH" ? "bg-orange-500/10 border-orange-500/20" :
              results.risk_level === "MEDIUM" ? "bg-yellow-500/10 border-yellow-500/20" :
              "bg-green-500/10 border-green-500/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Clinical Risk Index</p>
              </div>
              <p className={cn(
                "text-4xl font-bold tracking-tighter uppercase",
                results.risk_level === "CRITICAL" ? "text-red-500" :
                results.risk_level === "HIGH" ? "text-orange-500" :
                results.risk_level === "MEDIUM" ? "text-yellow-500" :
                "text-green-500"
              )}>
                {results.risk_level}
              </p>
              {results.case_flags.filter(f => !f.startsWith("heatmap_only:")).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {results.case_flags
                    .filter(f => !f.startsWith("heatmap_only:"))
                    .map(flag => (
                      <span key={flag} className="px-2 py-1 bg-white/10 border border-white/10 rounded text-[8px] font-bold uppercase tracking-widest text-white/80">
                        {flag.replace(/_/g, ' ')}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Confirmed Findings */}
          <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-container p-6 space-y-6">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
              <CheckCircle2 className="text-accent h-4 w-4" />
              Confirmed Findings
            </h3>
            
            <div className="space-y-4">
              {!results ? (
                <p className="text-white/20 text-xs font-mono italic">Waiting for analysis sequence...</p>
              ) : (results?.confirmed_findings?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Activity className="text-green-500/40 h-8 w-8 mb-2" />
                  <p className="text-green-500/60 text-[10px] font-mono uppercase tracking-widest">System Clear: No conditions detected</p>
                </div>
              ) : (
                <>
                  {results?.confirmed_findings?.map((item, idx) => (
                    <div key={item.condition} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-white text-xs font-bold tracking-tight">
                          {idx + 1}. {item.condition.replace(/_/g, ' ')}
                        </span>
                        <span className="text-accent text-[10px] font-mono">{(item.normalized_conf * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-1000 ease-out"
                          style={{ width: `${item.normalized_conf * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Technical Note */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
                    <Info className="h-3 w-3 text-white/20 shrink-0" />
                    <p className="text-[9px] leading-relaxed text-white/20 font-mono uppercase tracking-wider">
                      Note: Confidence is normalized relative to clinical thresholds. 
                      Display: (p - thresh) / (1 - thresh).
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Object Detection */}
          <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-container p-6 space-y-6">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
              <Crosshair className="text-accent h-4 w-4" />
              Object Detection
            </h3>
            
            <div className="space-y-4">
              {!results ? (
                <p className="text-white/20 text-xs font-mono italic">Waiting for analysis sequence...</p>
              ) : results.yolo_boxes.length === 0 ? (
                <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest py-2">No localized geometric findings.</p>
                ) : (
                    <>
                {results.yolo_boxes.map((box, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-white text-xs font-bold tracking-tight">
                        {idx + 1}. {box.class}
                      </span>
                      <span className="text-accent text-[10px] font-mono">{(box.conf * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-out"
                        style={{ width: `${box.conf * 100}%` }}
                      />
                    </div>
                  </div>
                  ))}

                  {/* Technical Note */}
                  <div className="pt-4 mt-4 border-t border-white/5 flex gap-2">
                  <Info className="h-3 w-3 text-white/20 shrink-0" />
                  <p className="text-[9px] leading-relaxed text-white/20 font-mono uppercase tracking-wider">
                    Note: Detection confidence represents raw geometric certainty of the bounding box, 
                    independent of the clinical thresholds used in the findings above.
                  </p>
                  </div>
                </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Session Info Footer */}
        <div className="mt-20 pb-10">
          <div className="w-full flex items-center justify-between px-8 py-4 bg-white/[0.02] border border-white/5 rounded-container backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-mono text-accent/50 uppercase tracking-[0.2em]">System Online</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.2em]">
                // Secure Operator: <span className="text-white/60 ml-2">{user?.email}</span>
              </p>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
              <span>Latency: 24ms</span>
              <span>Encrypted: AES-256</span>
            </div>
          </div>
        </div>
    </div>
  );
}

function ViewBtn({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-accent text-primary" : "text-white/40 hover:text-white/70"
            )}
        >
            {icon}
            {label}
        </button>
    )
}

function StatCard({ label, value, status }: { label: string, value: string, status: string }) {
    return (
        <div className="bg-surface/30 border border-white/5 p-4 rounded-container">
            <p className="text-white/40 text-[9px] font-mono uppercase tracking-[0.2em] mb-1">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-white tracking-tight">{value}</p>
                <span className="text-[8px] font-mono text-accent uppercase tracking-widest">{status}</span>
            </div>
        </div>
    )
}
