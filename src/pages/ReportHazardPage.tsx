import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AIDetectionService, RoadScanResult } from '../services/aiDetectionService';
import { HazardCategory, HazardSeverity } from '../types';
import {
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

const CATEGORIES: { id: HazardCategory; label: string; icon: string; defaultSeverity: HazardSeverity }[] = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️', defaultSeverity: 'critical' },
  { id: 'road_cracks', label: 'Road Cracks', icon: '⚡', defaultSeverity: 'high' },
  { id: 'uneven_surface', label: 'Uneven Surface', icon: '〰️', defaultSeverity: 'moderate' },
  { id: 'open_manhole', label: 'Open Manhole', icon: '⚠️', defaultSeverity: 'critical' },
  { id: 'damaged_manhole', label: 'Damaged Manhole Cover', icon: '🪨', defaultSeverity: 'critical' },
  { id: 'waterlogging', label: 'Waterlogging', icon: '🌊', defaultSeverity: 'high' },
  { id: 'road_construction', label: 'Road Construction', icon: '🚧', defaultSeverity: 'high' },
  { id: 'fallen_tree_debris', label: 'Fallen Tree / Debris', icon: '🪵', defaultSeverity: 'moderate' },
  { id: 'exposed_utility', label: 'Exposed Utility / Drain', icon: '🔌', defaultSeverity: 'high' },
  { id: 'damaged_edge', label: 'Damaged Road Edge', icon: '📉', defaultSeverity: 'high' },
  { id: 'other', label: 'Other Road Hazard', icon: '📍', defaultSeverity: 'moderate' },
];

export const ReportHazardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [category, setCategory] = useState<HazardCategory>('pothole');
  const [severity, setSeverity] = useState<HazardSeverity>('high');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0358, lng: 77.5970 });
  const [address, setAddress] = useState('Hebbal Flyover Descent, Outer Ring Road');
  const [locality, setLocality] = useState('Hebbal');
  const [gpsAcquired, setGpsAcquired] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // AI Assistant State
  const [aiResult, setAiResult] = useState<RoadScanResult | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{ hazardId: string; isDuplicate: boolean } | null>(null);

  // Check if routed with pre-analyzed AI result from /app/roadscan
  useEffect(() => {
    if (location.state?.aiResult) {
      const res = location.state.aiResult as RoadScanResult;
      setAiResult(res);
      setCategory(res.mappedCategory);
      setSeverity(res.suggestedSeverity);
      if (location.state?.imageUrl) {
        setImageUrl(location.state.imageUrl);
        setImagePreview(location.state.imageUrl);
      }
    }
  }, [location.state]);

  // Auto-acquire GPS on mount
  useEffect(() => {
    handleAcquireGps();
  }, []);

  const handleAcquireGps = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsAcquired(true);
          setGpsLoading(false);
          setAddress(`Near current location (±${Math.round(pos.coords.accuracy)}m accuracy)`);
          setLocality('Current Locality');
        },
        () => {
          setGpsLoading(false);
          // Fall back gracefully to seeded Bengaluru coordinates
          setCoords({ lat: 13.0358, lng: 77.5970 });
          setAddress('Hebbal Flyover Descent, Outer Ring Road');
          setLocality('Hebbal');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setImageUrl(url);
        setImagePreview(url);
        // Automatically trigger AI analysis on user uploaded photo
        runAiAnalysis(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiAnalysis = async (imgSrc: string) => {
    setAiAnalyzing(true);
    const img = new Image();
    img.src = imgSrc;
    img.onload = async () => {
      try {
        const result = await AIDetectionService.analyzeRoadImage(img);
        setAiResult(result);
        setCategory(result.mappedCategory);
        setSeverity(result.suggestedSeverity);
      } catch (e) {
        console.warn('AI analysis error', e);
      } finally {
        setAiAnalyzing(false);
      }
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const { hazard, isDuplicateGrouped } = StorageService.createHazardReport({
        latitude: coords.lat,
        longitude: coords.lng,
        address,
        locality,
        category,
        severity,
        description: description || `Reported ${category.replace('_', ' ')} on carriageway.`,
        imageUrl: imageUrl,
        aiClassification: aiResult
          ? {
              detectedCategory: aiResult.detectedCategory,
              confidence: aiResult.confidence,
              boundingBox: [
                aiResult.boundingBox.ymin,
                aiResult.boundingBox.xmin,
                aiResult.boundingBox.ymax,
                aiResult.boundingBox.xmax
              ],
              damageType: aiResult.damageType
            }
          : undefined,
        sensorTriggered: false
      });

      setIsSubmitting(false);
      setSubmittedResult({
        hazardId: hazard.id,
        isDuplicate: isDuplicateGrouped
      });
    }, 400);
  };

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-brand-warm-white py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-neutral-grey shadow-card text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-brand-green-light text-brand-green mx-auto flex items-center justify-center shadow-subtle">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">
              Report Submitted!
            </h2>
            <p className="text-sm text-brand-slate mt-2 leading-relaxed">
              {submittedResult.isDuplicate
                ? 'Your report was automatically grouped into an existing hazard nearby, strengthening its community verification score (+30 trust points)!'
                : 'Your report is now live on the RoadSense hazard map for all fellow two-wheeler commuters (+30 trust points).'}
            </p>
          </div>

          <div className="bg-brand-warm-white p-4 rounded-2xl border border-brand-neutral-grey/80 text-xs text-brand-slate space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="font-semibold text-brand-navy">Incident ID:</span>
              <span className="font-mono">{submittedResult.hazardId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-brand-navy">Category:</span>
              <span className="capitalize">{category.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-brand-navy">Location:</span>
              <span className="truncate max-w-[180px]">{locality}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-brand-navy">Status:</span>
              <span className="text-purple-700 font-bold">Community Verification</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/app/map')}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-sm transition-all"
            >
              View on Live Map
            </button>
            <button
              onClick={() => {
                setSubmittedResult(null);
                setDescription('');
                setAiResult(null);
              }}
              className="py-3 px-4 rounded-xl border border-brand-neutral-grey text-brand-navy hover:bg-brand-soft-blue font-semibold text-sm transition-all"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange mb-1">
            <Clock className="w-3.5 h-3.5" />
            20-Second Fast Reporting Workflow
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Report a Road Hazard
          </h1>
          <p className="text-sm text-brand-slate mt-1">
            Help prevent sudden swerves and crashes for fellow two-wheeler riders. Take a photo and submit in under 20 seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Photograph Section */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-orange" />
                  1. Road Photograph
                </h3>
                <p className="text-xs text-brand-slate">Clear photo showing road surface damage</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-soft-blue text-brand-navy font-semibold text-xs hover:bg-brand-orange/15 hover:text-brand-orange transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload / Camera
              </button>
            </div>

            {/* Photo Preview & AI analysis bar */}
            <div className="relative rounded-2xl overflow-hidden bg-brand-warm-white border border-brand-neutral-grey h-48 sm:h-56 flex items-center justify-center">
              <img
                src={imagePreview || imageUrl}
                alt="Hazard preview"
                className="w-full h-full object-cover"
              />

              {aiAnalyzing && (
                <div className="absolute inset-0 bg-brand-navy/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                  <Sparkles className="w-6 h-6 text-brand-orange animate-spin" />
                  <span className="text-xs font-semibold">Running RoadScan AI Vision Analysis...</span>
                </div>
              )}

              {/* AI Overlay Badge if analyzed */}
              {aiResult && !aiAnalyzing && (
                <div className="absolute top-3 left-3 bg-brand-navy/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2 shadow-card">
                  <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                  <span>
                    AI Detected: <strong>{aiResult.detectedCategory}</strong> ({Math.round(aiResult.confidence * 100)}% match)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Hazard Category Selection */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div>
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-orange" />
                2. Select Hazard Category
              </h3>
              <p className="text-xs text-brand-slate">Choose the primary hazard type encountered</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setSeverity(cat.defaultSeverity);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/30 shadow-sm'
                        : 'border-brand-neutral-grey hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-brand-orange' : 'text-brand-navy'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Severity & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Radio */}
            <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-brand-navy">3. Threat Severity</h3>
              <div className="space-y-2">
                {[
                  { id: 'critical', label: '🔴 Critical Hazard', desc: 'Immediate risk of crash or swerving' },
                  { id: 'high', label: '🟠 High Risk', desc: 'Severe rim damage or loss of balance' },
                  { id: 'moderate', label: '🟡 Moderate', desc: 'Ride discomfort, noticeable bump' }
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      severity === s.id ? 'border-brand-orange bg-brand-soft-blue/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={s.id}
                      checked={severity === s.id}
                      onChange={() => setSeverity(s.id as HazardSeverity)}
                      className="mt-0.5 text-brand-orange focus:ring-brand-orange"
                    />
                    <div>
                      <div className="text-xs font-bold text-brand-navy">{s.label}</div>
                      <div className="text-[11px] text-brand-slate">{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Check */}
            <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  4. GPS Coordinates
                </h3>
                <button
                  type="button"
                  onClick={handleAcquireGps}
                  className="text-xs font-semibold text-brand-orange hover:underline"
                >
                  {gpsLoading ? 'Acquiring...' : 'Refresh GPS'}
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-semibold text-brand-slate">Road / Landmark</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/30 text-brand-navy font-medium"
                    placeholder="Enter landmark or street name"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-brand-slate">Bengaluru Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/30 text-brand-navy font-medium"
                    placeholder="Hebbal, Indiranagar, Whitefield, etc."
                  />
                </div>

                <div className="text-[11px] text-brand-slate flex items-center gap-1.5 pt-1">
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </span>
                  <span className="text-emerald-600 font-semibold">✓ GPS Tagged</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Optional Description */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-brand-navy">5. Optional Notes / Description</h3>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Deep pothole hidden after rain right under flyover curve; two-wheelers are swerving..."
              className="w-full p-3 text-xs rounded-2xl border border-brand-neutral-grey focus:ring-2 focus:ring-brand-orange/30 text-brand-navy"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-base transition-all shadow-md shadow-brand-orange/20 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Submitting Report to Community Network...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Publish Road Hazard Report (Instant Live)
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-brand-slate mt-2">
              All reports are crowd-verified by fellow riders and integrated into early-warning corridors.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
