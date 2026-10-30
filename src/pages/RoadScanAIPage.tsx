import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIDetectionService, RoadScanResult, BENCHMARK_SAMPLE_IMAGES, SampleRoadImage } from '../services/aiDetectionService';
import { HazardCategory, HazardSeverity } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Layers,
  ArrowRight,
  Info,
  ShieldAlert,
  HelpCircle,
  Clock
} from 'lucide-react';

export const RoadScanAIPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [currentImageUrl, setCurrentImageUrl] = useState<string>(BENCHMARK_SAMPLE_IMAGES[0].url);
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(BENCHMARK_SAMPLE_IMAGES[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<RoadScanResult | null>(null);
  const [userConfirmedCategory, setUserConfirmedCategory] = useState<HazardCategory>('pothole');

  // Trigger analysis on image load or when new image selected
  const handleAnalyze = async (imgUrl: string) => {
    setIsAnalyzing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;

    img.onload = async () => {
      try {
        const result = await AIDetectionService.analyzeRoadImage(img);
        setScanResult(result);
        setUserConfirmedCategory(result.mappedCategory);
      } catch (err) {
        console.error('AI inspection failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };
  };

  useEffect(() => {
    handleAnalyze(currentImageUrl);
  }, []);

  const handleSelectBenchmark = (sample: SampleRoadImage) => {
    setSelectedBenchmarkId(sample.id);
    setCurrentImageUrl(sample.url);
    handleAnalyze(sample.url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setSelectedBenchmarkId('custom');
        setCurrentImageUrl(url);
        handleAnalyze(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToReport = () => {
    if (!scanResult) return;
    navigate('/app/report', {
      state: {
        aiResult: scanResult,
        imageUrl: currentImageUrl
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-700 mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Computer Vision Road Damage Analysis
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              RoadScan AI Inspector
            </h1>
            <p className="text-sm text-brand-slate mt-1 max-w-2xl">
              Trained on standard international RDD2022 road damage datasets to identify potholes (D40), alligator cracks (D20), longitudinal cracks (D00), and transverse cracks (D10).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all shadow-subtle cursor-pointer"
            >
              <Upload className="w-4 h-4 text-brand-orange" />
              Upload Road Image
            </button>
            <button
              onClick={() => handleAnalyze(currentImageUrl)}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand-neutral-grey text-brand-navy text-xs font-bold hover:bg-brand-soft-blue transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-brand-slate ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-Scan
            </button>
          </div>
        </div>

        {/* Benchmark Test Samples Selector */}
        <div className="bg-white rounded-3xl p-5 border border-brand-neutral-grey shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              RDD2022 Dataset Benchmark Samples (Click to test instantly)
            </span>
            <span className="text-[11px] text-brand-slate">
              Sekilab & Wangbiao RDD benchmark classes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BENCHMARK_SAMPLE_IMAGES.map((sample) => {
              const isSelected = selectedBenchmarkId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectBenchmark(sample)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/30'
                      : 'border-brand-neutral-grey hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="h-20 w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                      Code: {sample.rddCode}
                    </span>
                    <span className="text-xs font-bold text-brand-navy line-clamp-1">
                      {sample.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inspection Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Image Viewport with Bounding Box Overlay */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-brand-neutral-grey shadow-subtle flex flex-col">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-brand-navy uppercase tracking-wider">
                Vision Inspection Viewport
              </span>
              <span className="text-[11px] font-mono text-brand-slate">
                Model: RoadSense-RDD2022-EdgeVision (320x320)
              </span>
            </div>

            {/* Canvas/Image Box */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex-1 min-h-[380px] flex items-center justify-center">
              <img
                ref={imageRef}
                src={currentImageUrl}
                alt="Road Surface"
                className="max-h-[440px] w-full object-contain"
              />

              {/* Bounding Box Render */}
              {scanResult && !isAnalyzing && (
                <div
                  className="absolute border-2 border-brand-orange bg-brand-orange/15 rounded-md pointer-events-none transition-all duration-300 shadow-elevated"
                  style={{
                    top: `${scanResult.boundingBox.ymin * 100}%`,
                    left: `${scanResult.boundingBox.xmin * 100}%`,
                    width: `${(scanResult.boundingBox.xmax - scanResult.boundingBox.xmin) * 100}%`,
                    height: `${(scanResult.boundingBox.ymax - scanResult.boundingBox.ymin) * 100}%`
                  }}
                >
                  {/* Floating Class Tag above Bounding Box */}
                  <div className="absolute -top-7 left-0 bg-brand-orange text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <span>{scanResult.detectedCategory}</span>
                    <span className="bg-white/20 px-1 rounded text-[10px]">
                      {Math.round(scanResult.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Inference Loading Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                  <div className="w-12 h-12 border-3 border-brand-orange border-t-transparent rounded-full animate-spin" />
                  <div className="text-sm font-bold">Scanning Road Surface Aggregate...</div>
                  <div className="text-xs text-brand-slate-light">
                    Calculating luminance gradients & RDD2022 distress vectors
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-brand-slate">
              <span>Bounding box indicates highest probability distress zone.</span>
              <span>Coordinates: [{scanResult?.boundingBox.ymin.toFixed(2)}, {scanResult?.boundingBox.xmin.toFixed(2)}, {scanResult?.boundingBox.ymax.toFixed(2)}, {scanResult?.boundingBox.xmax.toFixed(2)}]</span>
            </div>
          </div>

          {/* Right 5 Columns: Inspection Telemetry & Decision Panel */}
          <div className="lg:col-span-5 space-y-5">
            {/* Detection Card */}
            <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-neutral-grey">
                <div>
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Model Classification
                  </span>
                  <h3 className="text-xl font-extrabold text-brand-navy mt-0.5">
                    {scanResult?.detectedCategory || 'Analyzing...'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-brand-orange">
                    {scanResult ? Math.round(scanResult.confidence * 100) : '--'}%
                  </div>
                  <span className="text-[10px] text-brand-slate font-medium">Model Confidence</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-brand-slate">RDD2022 Code:</span>
                  <span className="font-mono font-bold text-brand-navy">{scanResult?.rddClassCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-brand-slate">Distress Morphology:</span>
                  <span className="font-semibold text-brand-navy">{scanResult?.damageType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-brand-slate">Recommended Severity:</span>
                  <span className="font-bold text-brand-red uppercase">{scanResult?.suggestedSeverity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-brand-slate">Inference Latency:</span>
                  <span className="font-mono text-emerald-600 font-bold">{scanResult?.inferenceTimeMs} ms</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-brand-warm-white p-3.5 rounded-2xl border border-brand-neutral-grey/80 text-xs text-brand-slate space-y-1">
                <div className="font-bold text-brand-navy flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-orange" />
                  Engineering Assessment
                </div>
                <p className="leading-relaxed">{scanResult?.description}</p>
                <div className="pt-2 text-[11px] text-brand-navy font-semibold border-t border-slate-200">
                  Recommendation: {scanResult?.maintenanceRecommendation}
                </div>
              </div>

              {/* User Confirmation / Correction Dropdown */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-brand-navy block">
                  Human Rider Review & Confirmation:
                </label>
                <select
                  value={userConfirmedCategory}
                  onChange={(e) => setUserConfirmedCategory(e.target.value as HazardCategory)}
                  className="w-full p-2.5 rounded-xl border border-brand-neutral-grey bg-white text-xs font-semibold text-brand-navy focus:ring-2 focus:ring-brand-orange/40"
                >
                  <option value="pothole">Pothole (D40)</option>
                  <option value="road_cracks">Road Cracks (D00 / D10 / D20)</option>
                  <option value="uneven_surface">Uneven Road Surface</option>
                  <option value="damaged_edge">Damaged Road Edge</option>
                  <option value="open_manhole">Open Manhole</option>
                  <option value="waterlogging">Waterlogging</option>
                  <option value="road_construction">Road Construction</option>
                  <option value="other">Other Road Hazard</option>
                </select>
                <span className="text-[11px] text-brand-slate block">
                  Human-in-the-loop confirmation ensures AI results are never published blindly.
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToReport}
                disabled={!scanResult || isAnalyzing}
                className="w-full py-3.5 px-4 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm shadow-md shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Attach AI Detection to Hazard Report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
