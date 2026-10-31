import { HazardCategory, HazardSeverity } from '../types';

export interface BoundingBox {
  ymin: number; // 0.0 - 1.0
  xmin: number; // 0.0 - 1.0
  ymax: number; // 0.0 - 1.0
  xmax: number; // 0.0 - 1.0
}

export interface RoadScanResult {
  detectedCategory: string;
  rddClassCode: 'D00' | 'D10' | 'D20' | 'D40' | 'NORMAL';
  isActualModelConnected: boolean;
  inferenceNotice: string;
  confidence: number | null; // null when real calibrated model is not connected
  heuristicScore: number; // Transparent client-side heuristic value (0-100)
  damageType: string;
  mappedCategory: HazardCategory;
  suggestedSeverity: HazardSeverity;
  boundingBox: BoundingBox;
  inferenceTimeMs: number; // Actual measured execution time (no fabricated delay)
  modelIdentifier: string;
  description: string;
  maintenanceRecommendation: string;
}

export interface SampleRoadImage {
  id: string;
  title: string;
  description: string;
  url: string;
  expectedClass: string;
  rddCode: 'D00' | 'D10' | 'D20' | 'D40';
  isIllustration: boolean;
  assetType: 'vector_svg_illustration' | 'real_photograph';
}

export const BENCHMARK_SAMPLE_IMAGES: SampleRoadImage[] = [
  {
    id: 'sample-pothole',
    title: 'Pothole Morphology (D40)',
    description: 'Illustrative vector diagram of a structural depression with aggregate break and shadow cavity.',
    url: '/samples/pothole-d40.svg',
    expectedClass: 'Pothole (D40)',
    rddCode: 'D40',
    isIllustration: true,
    assetType: 'vector_svg_illustration'
  },
  {
    id: 'sample-alligator',
    title: 'Alligator Cracking Morphology (D20)',
    description: 'Illustrative vector diagram of an interconnected polygonal fatigue crack matrix.',
    url: '/samples/alligator-d20.svg',
    expectedClass: 'Alligator Cracks (D20)',
    rddCode: 'D20',
    isIllustration: true,
    assetType: 'vector_svg_illustration'
  },
  {
    id: 'sample-longitudinal',
    title: 'Longitudinal Crack Morphology (D00)',
    description: 'Illustrative vector diagram of a linear fissure parallel to the direction of vehicular travel.',
    url: '/samples/longitudinal-d00.svg',
    expectedClass: 'Longitudinal Crack (D00)',
    rddCode: 'D00',
    isIllustration: true,
    assetType: 'vector_svg_illustration'
  },
  {
    id: 'sample-transverse',
    title: 'Transverse Crack Morphology (D10)',
    description: 'Illustrative vector diagram of a cross-carriageway fracture caused by thermal contraction.',
    url: '/samples/transverse-d10.svg',
    expectedClass: 'Transverse Crack (D10)',
    rddCode: 'D10',
    isIllustration: true,
    assetType: 'vector_svg_illustration'
  }
];

export const AIDetectionService = {
  /**
   * Reports whether a real neural inference model runtime (e.g. ONNX Web, TensorFlow.js)
   * is currently loaded and connected.
   */
  isActualModelConnected(): boolean {
    return false; // Honest status: Real ML runtime is disconnected in this client prototype
  },

  /**
   * Analyzes an image element using transparent client-side raster feature heuristics.
   * NOTE: Measures actual elapsed execution time with zero artificial sleep delays.
   * When a real ML model is not loaded, confidence is kept null and an honest disclaimer is returned.
   */
  async analyzeRoadImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<RoadScanResult> {
    const startTime = performance.now();

    // Create analysis canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const width = 320;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    if (!ctx) {
      throw new Error('Canvas context could not be acquired for image analysis.');
    }

    ctx.drawImage(imageElement, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Feature extraction: Compute brightness gradient & dark anomaly concentration
    let darkPixelCount = 0;
    let horizontalEdgeSum = 0;
    let verticalEdgeSum = 0;

    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    // Grid sampling
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Anomaly threshold: darker pavement distress / shadow
        if (lum < 75) {
          darkPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        // Horizontal gradient
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const hGrad = Math.abs(data[rightIdx] - data[leftIdx]);
        horizontalEdgeSum += hGrad;

        // Vertical gradient
        const topIdx = ((y - 1) * width + x) * 4;
        const bottomIdx = ((y + 1) * width + x) * 4;
        const vGrad = Math.abs(data[bottomIdx] - data[topIdx]);
        verticalEdgeSum += vGrad;
      }
    }

    // Default bounded zone if anomaly is too small or uniform
    if (maxX <= minX + 20 || maxY <= minY + 20) {
      minX = Math.round(width * 0.22);
      maxX = Math.round(width * 0.78);
      minY = Math.round(height * 0.32);
      maxY = Math.round(height * 0.75);
    }

    // Clamp coordinates
    const normXmin = Math.max(0.08, minX / width);
    const normXmax = Math.min(0.92, maxX / width);
    const normYmin = Math.max(0.12, minY / height);
    const normYmax = Math.min(0.88, maxY / height);

    const boxWidth = normXmax - normXmin;
    const boxHeight = normYmax - normYmin;
    const aspectRatio = boxWidth / (boxHeight || 0.01);

    // Classification decision rule aligned with RDD2022 taxonomy classes:
    let rddClassCode: 'D00' | 'D10' | 'D20' | 'D40';
    let detectedCategory = '';
    let mappedCategory: HazardCategory = 'pothole';
    let damageType = '';
    let suggestedSeverity: HazardSeverity = 'high';
    let heuristicScore = 80;
    let description = '';
    let maintenanceRecommendation = '';

    if (darkPixelCount > 3500 && (aspectRatio >= 0.7 && aspectRatio <= 1.5)) {
      // Cavity / depression: Pothole (D40)
      rddClassCode = 'D40';
      detectedCategory = 'Pothole (D40)';
      mappedCategory = 'pothole';
      damageType = 'Structural Cavity Depression';
      suggestedSeverity = 'critical';
      heuristicScore = 92;
      description = 'Structural pavement breach exposing sub-base aggregate. Presents immediate rim deformation and swerve risk for two-wheelers.';
      maintenanceRecommendation = 'Requires cold-mix asphalt patch or hot bituminous repair to restore road camber.';
    } else if (horizontalEdgeSum > verticalEdgeSum * 1.35) {
      // Transverse Crack (D10)
      rddClassCode = 'D10';
      detectedCategory = 'Transverse Crack (D10)';
      mappedCategory = 'road_cracks';
      damageType = 'Cross-Carriageway Contraction Fissure';
      suggestedSeverity = 'moderate';
      heuristicScore = 82;
      description = 'Perpendicular fissure running across the lane width caused by sub-base thermal expansion and contraction.';
      maintenanceRecommendation = 'Clean crack channel with compressed air and seal with elastomer-modified bitumen.';
    } else if (verticalEdgeSum > horizontalEdgeSum * 1.35 || aspectRatio < 0.6) {
      // Longitudinal Crack (D00)
      rddClassCode = 'D00';
      detectedCategory = 'Longitudinal Crack (D00)';
      mappedCategory = 'road_cracks';
      damageType = 'Wheelpath Longitudinal Fissure';
      suggestedSeverity = 'high';
      heuristicScore = 86;
      description = 'Linear fissure running parallel to the direction of vehicular traffic along the primary wheel path.';
      maintenanceRecommendation = 'Rout and apply rubberized asphalt crack sealant before rainwater ingress causes edge collapse.';
    } else {
      // Alligator Crack (D20)
      rddClassCode = 'D20';
      detectedCategory = 'Alligator Cracks (D20)';
      mappedCategory = 'road_cracks';
      damageType = 'Interconnected Fatigue Matrix';
      suggestedSeverity = 'high';
      heuristicScore = 88;
      description = 'Interconnected polygonal fatigue fractures resembling reptile skin, indicating structural subgrade fatigue.';
      maintenanceRecommendation = 'Mill top 40mm wearing layer and replace with heavy-duty bituminous concrete overlay.';
    }

    // Actual measured execution time with zero artificial sleep
    const inferenceTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    const isConnected = this.isActualModelConnected();

    return {
      detectedCategory,
      rddClassCode,
      isActualModelConnected: isConnected,
      inferenceNotice: isConnected
        ? 'Real neural network inference executed.'
        : 'Illustrative classification — actual model inference not connected.',
      confidence: isConnected ? 0.94 : null, // Null indicates no actual neural model confidence
      heuristicScore,
      damageType,
      mappedCategory,
      suggestedSeverity,
      boundingBox: {
        ymin: Number(normYmin.toFixed(2)),
        xmin: Number(normXmin.toFixed(2)),
        ymax: Number(normYmax.toFixed(2)),
        xmax: Number(normXmax.toFixed(2))
      },
      inferenceTimeMs,
      modelIdentifier: isConnected
        ? 'RoadSense-RDD2022-EdgeVision (MobileNetV3 ONNX)'
        : 'Illustrative Heuristic Engine (Edge ONNX Disconnected)',
      description,
      maintenanceRecommendation
    };
  }
};
