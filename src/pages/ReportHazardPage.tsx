import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { AIDetectionService, RoadScanResult } from '../services/aiDetectionService';
import { N8NService } from '../services/n8nService';
import { HazardCategory, HazardSeverity } from '../types';
import { useToast } from '../components/Toast';
import {
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Droplets,
  X,
  RefreshCw,
  FileCheck2,
  Eye,
  Check
} from 'lucide-react';

const CATEGORIES: {
  id: HazardCategory;
  label: string;
  defaultSeverity: HazardSeverity;
  description: string;
}[] = [
  {
    id: 'waterlogged_road',
    label: 'Waterlogged Road',
    defaultSeverity: 'critical',
    description: 'Standing monsoon water concealing road surface depth and obstacles'
  },
  {
    id: 'pothole',
    label: 'Pothole (Cavity)',
    defaultSeverity: 'critical',
    description: 'Deep structural road cavity exposing coarse aggregate'
  },
  {
    id: 'road_cracks',
    label: 'Cracked Road',
    defaultSeverity: 'high',
    description: 'Fatigue alligator matrix or continuous longitudinal fractures'
  },
  {
    id: 'uneven_surface',
    label: 'Uneven Surface',
    defaultSeverity: 'moderate',
    description: 'Sudden road elevation difference, asphalt subsidence, or rut'
  },
  {
    id: 'open_drain',
    label: 'Open Drain',
    defaultSeverity: 'critical',
    description: 'Uncovered culvert, missing roadside stormwater grating'
  },
  {
    id: 'damaged_manhole',
    label: 'Damaged Manhole Cover',
    defaultSeverity: 'critical',
    description: 'Sunken steel lid, cracked concrete frame, or protruding rim'
  },
  {
    id: 'road_construction',
    label: 'Road Construction',
    defaultSeverity: 'high',
    description: 'Unbarricaded trenching, loose gravel mound, or sudden detour'
  },
  {
    id: 'loose_gravel_debris',
    label: 'Debris or Fallen Object',
    defaultSeverity: 'moderate',
    description: 'Scattered stones, tree branches, or spilled construction debris'
  },
  {
    id: 'damaged_edge',
    label: 'Damaged Road Edge',
    defaultSeverity: 'high',
    description: 'Collapsed asphalt shoulder or eroded curb drop-off'
  },
  {
    id: 'other',
    label: 'Other Road Hazard',
    defaultSeverity: 'moderate',
    description: 'Any other dangerous condition affecting two-wheeler safety'
  }
];

export const ReportHazardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  // Form State
  const [category, setCategory] = useState<HazardCategory>('waterlogged_road');
  const [isWaterlogHiddenHazard, setIsWaterlogHiddenHazard] = useState(true);
  const [severity, setSeverity] = useState<HazardSeverity>('critical');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0358, lng: 77.597 });
  const [address, setAddress] = useState('Outer Ring Road, Hebbal Flyover Descent');
  const [locality, setLocality] = useState('Hebbal');
  const [gpsAcquired, setGpsAcquired] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Field Errors
  const [errors, setErrors] = useState<{ category?: string; address?: string; photo?: string }>({});

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    hazardId: string;
    reportId: string;
    isDuplicate: boolean;
    title: string;
    status: string;
  } | null>(null);

  // Optional AI suggestion if forwarded from Photo Inspection
  const [aiResult, setAiResult] = useState<RoadScanResult | null>(null);

  useEffect(() => {
    if (location.state?.aiResult) {
      const res = location.state.aiResult as RoadScanResult;
      setAiResult(res);
      setCategory(res.mappedCategory);
      setSeverity(res.suggestedSeverity);
      if (location.state?.imageUrl) {
        setImagePreview(location.state.imageUrl);
      }
    }
  }, [location.state]);

  // Request GPS on mount
  useEffect(() => {
    handleAcquireGps();
  }, []);

  const handleAcquireGps = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      setGpsError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsAcquired(true);
          setGpsLoading(false);
          setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          setGpsLoading(false);
          setGpsError('Location access was denied or is unavailable. You can enter or confirm coordinates manually below.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsError('Geolocation is not supported by your browser.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setErrors((prev) => ({ ...prev, photo: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Select category
  const handleCategorySelect = (catId: HazardCategory) => {
    setCategory(catId);
    const item = CATEGORIES.find((c) => c.id === catId);
    if (item) {
      setSeverity(item.defaultSeverity);
    }
    if (catId === 'waterlogged_road') {
      setIsWaterlogHiddenHazard(true);
    } else {
      setIsWaterlogHiddenHazard(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validationErrors: { category?: string; address?: string } = {};
    if (!category) validationErrors.category = 'Please select a hazard category.';
    if (!address.trim()) validationErrors.address = 'Please specify the street or locality.';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      addToast('Please complete the required hazard information.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const isWaterlog = category === 'waterlogged_road';
      const currentUser = StorageService.getCurrentUser();

      const result = StorageService.addReport({
        latitude: coords.lat,
        longitude: coords.lng,
        address: address.trim(),
        locality: locality.trim() || 'Bengaluru',
        category: category,
        additionalLabel: isWaterlog && isWaterlogHiddenHazard ? 'POTENTIALLY_HIDDEN_SURFACE_HAZARD' : undefined,
        severity: severity,
        description:
          description.trim() ||
          (isWaterlog
            ? 'Waterlogged road surface. Depth and surface condition cannot be seen; proceed cautiously.'
            : `Reported ${category.replace('_', ' ')} on carriageway.`),
        imageUrl: imagePreview || '/samples/pothole-d40.svg',
        aiClassification: aiResult
          ? {
              detectedCategory: aiResult.detectedCategory,
              confidence: aiResult.confidence ?? 0.88,
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

      // Dispatch to n8n automation service
      if (result.hazard) {
        N8NService.dispatchReportEvent(result.hazard).catch((err) =>
          console.warn('n8n background dispatch notification:', err)
        );
      }

      setSubmittedResult({
        hazardId: result.hazard.id,
        reportId: result.report.id,
        isDuplicate: result.isDuplicate,
        title: result.hazard.title,
        status: result.hazard.canonicalStatus || 'UNDER_REVIEW'
      });

      addToast('Hazard report saved to community network.', 'success');
    } catch (err: any) {
      console.error('Error saving hazard report:', err);
      addToast('Failed to save hazard report: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================================
     SUCCESS SCREEN
     ========================================================================= */
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-brand-warm-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-brand-neutral-grey shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-brand-navy">Hazard Report Submitted</h1>
            <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
              Thank you for keeping fellow two-wheeler commuters safe. Your report has been broadcast to the Bengaluru hazard intelligence grid.
            </p>
          </div>

          {/* Submission Audit Details */}
          <div className="p-4 rounded-2xl bg-brand-warm-white border border-brand-neutral-grey text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-brand-neutral-grey">
              <span className="text-brand-slate">Hazard ID:</span>
              <span className="font-mono font-bold text-brand-navy">{submittedResult.hazardId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-brand-neutral-grey">
              <span className="text-brand-slate">Report ID:</span>
              <span className="font-mono font-bold text-brand-navy">{submittedResult.reportId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-brand-neutral-grey">
              <span className="text-brand-slate">Current Status:</span>
              <span className="font-bold text-brand-orange uppercase">{submittedResult.status}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-brand-slate">Duplicate Handling:</span>
              <span className="font-semibold text-brand-navy">
                {submittedResult.isDuplicate ? 'Merged into existing cluster' : 'New corridor record created'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/app/map"
              className="flex-1 py-3 px-4 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all text-center"
            >
              View on Live Map
            </Link>
            <Link
              to="/app/my-reports"
              className="flex-1 py-3 px-4 rounded-xl bg-white border border-brand-neutral-grey hover:bg-slate-50 text-brand-navy text-xs font-bold transition-all text-center"
            >
              My Reports
            </Link>
          </div>

          <button
            onClick={() => {
              setSubmittedResult(null);
              setImagePreview(null);
              setImageFile(null);
              setDescription('');
            }}
            className="text-xs text-brand-slate hover:text-brand-navy underline pt-2 block mx-auto cursor-pointer"
          >
            Report another road hazard
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================================
     MAIN REPORT FORM
     ========================================================================= */
  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-slate">
            <span className="w-2 h-2 rounded-full bg-brand-orange" />
            <span>Stationary Reporting Protocol • Pull Over Safely First</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            Report a Road Hazard
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate">
            Provide the road condition and location to alert riders on this route.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Select Hazard Category */}
          <div className="bg-white rounded-2xl p-5 border border-brand-neutral-grey shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-navy uppercase tracking-wider block">
                1. Select Road Hazard Type <span className="text-brand-red">*</span>
              </label>
              <span className="text-[11px] text-brand-slate">Choose primary condition</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-orange bg-amber-50/60 ring-2 ring-brand-orange/20'
                        : 'border-brand-neutral-grey hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-brand-navy">{cat.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-brand-orange" />}
                    </div>
                    <span className="text-[11px] text-brand-slate mt-1 line-clamp-1">{cat.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Special waterlogged hidden hazard option */}
            {category === 'waterlogged_road' && (
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-2 mt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWaterlogHiddenHazard}
                    onChange={(e) => setIsWaterlogHiddenHazard(e.target.checked)}
                    className="mt-0.5 rounded text-brand-orange focus:ring-brand-orange cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-brand-navy block">
                      Potentially Hidden Surface Hazard (Depth Unknown)
                    </span>
                    <span className="text-[11px] text-brand-slate block mt-0.5">
                      Represents honest uncertainty. Warns commuters that water obscures road depth without asserting an unverified pothole.
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* STEP 2: Photo Capture or Upload */}
          <div className="bg-white rounded-2xl p-5 border border-brand-neutral-grey shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-navy uppercase tracking-wider block">
                2. Hazard Photograph
              </label>
              <span className="text-[11px] text-brand-slate">Stationary evidence proof</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-brand-neutral-grey bg-slate-900 max-h-64 flex items-center justify-center">
                <img src={imagePreview} alt="Road Hazard Preview" className="max-h-64 w-full object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1 rounded-lg bg-brand-red text-white hover:bg-red-700 transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-neutral-grey hover:border-brand-orange rounded-xl p-6 text-center cursor-pointer transition-colors bg-brand-warm-white"
              >
                <Camera className="w-8 h-8 text-brand-slate mx-auto mb-2" />
                <div className="text-xs font-bold text-brand-navy">Click to capture or upload photo</div>
                <div className="text-[11px] text-brand-slate mt-0.5">Supports smartphone camera or local image files</div>
              </div>
            )}
          </div>

          {/* STEP 3: Confirm GPS Location */}
          <div className="bg-white rounded-2xl p-5 border border-brand-neutral-grey shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-navy uppercase tracking-wider block">
                3. Road Location & Locality <span className="text-brand-red">*</span>
              </label>
              <button
                type="button"
                onClick={handleAcquireGps}
                disabled={gpsLoading}
                className="text-[11px] font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Acquiring GPS...' : 'Re-acquire GPS'}</span>
              </button>
            </div>

            {gpsError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                {gpsError}
              </div>
            )}

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-semibold text-brand-slate block mb-1">
                  Street / Landmark Description
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  placeholder="e.g. Outer Ring Road, near Hebbal Flyover descent"
                  className="w-full p-2.5 rounded-xl border border-brand-neutral-grey text-xs font-medium text-brand-navy focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange bg-white"
                />
                {errors.address && <p className="text-[11px] text-brand-red mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-brand-slate block mb-1">
                    Bengaluru Locality / Ward
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-brand-neutral-grey text-xs font-semibold text-brand-navy bg-white focus:ring-2 focus:ring-brand-orange/40"
                  >
                    <option value="Hebbal">Hebbal</option>
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Outer Ring Road">Outer Ring Road</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="Marathahalli">Marathahalli</option>
                    <option value="KR Puram">KR Puram</option>
                    <option value="Electronic City">Electronic City</option>
                    <option value="Koramangala">Koramangala</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-brand-slate block mb-1">
                    GPS Coordinates
                  </label>
                  <div className="p-2.5 rounded-xl bg-brand-warm-white border border-brand-neutral-grey text-xs font-mono text-brand-slate truncate">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Optional Rider Note */}
          <div className="bg-white rounded-2xl p-5 border border-brand-neutral-grey shadow-subtle space-y-3">
            <label className="text-xs font-bold text-brand-navy uppercase tracking-wider block">
              4. Additional Details (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Center lane depression, water has been stagnant for 3 hours, rim strike hazard."
              className="w-full p-2.5 rounded-xl border border-brand-neutral-grey text-xs font-medium text-brand-navy focus:ring-2 focus:ring-brand-orange/40 bg-white"
            />
          </div>

          {/* STEP 5: Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Hazard Report...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Hazard Report (Broadcast to Network)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
