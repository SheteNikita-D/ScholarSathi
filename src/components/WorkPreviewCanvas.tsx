import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Eye,
  EyeOff,
  FileImage,
  PenTool,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnnotationRegion } from '../types/tutor';

interface WorkPreviewCanvasProps {
  imageDataUrl?: string;
  annotationRegion?: AnnotationRegion;
  onImageChange: (dataUrl: string | undefined) => void;
  tutorQuestion?: string;
}

export const WorkPreviewCanvas: React.FC<WorkPreviewCanvasProps> = ({
  imageDataUrl,
  annotationRegion,
  onImageChange,
  tutorQuestion,
}) => {
  const [showAnnotation, setShowAnnotation] = useState(true);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#0F172A');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Unsupported file format. Please upload a PNG, JPG, or WebP image of your work.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image exceeds 10MB. Please upload a smaller or cropped photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageChange(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Camera access is unavailable in this browser frame. You can upload a photo of your handwritten work or use the interactive Scratchpad instead.'
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 680;
    canvas.height = videoRef.current.videoHeight || 440;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onImageChange(dataUrl);
      closeCamera();
    }
  };

  // Scratchpad drawing handlers
  const initScratchpad = () => {
    setIsScratchpadOpen(true);
    setTimeout(() => {
      const canvas = scratchCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#FCFBF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw subtle engineering grid
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }, 30);
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = scratchCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPointerPos(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const drawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const saveScratchpad = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    onImageChange(canvas.toDataURL('image/png'));
    setIsScratchpadOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Student Work & Multimodal Inspection
          </h3>
          <p className="text-xs text-slate-600">
            Upload handwritten notes, equations, or circuit diagrams. GuideWise highlights steps to investigate without writing over your work.
          </p>
        </div>

        {/* Upload / Photo / Scratchpad Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload student work image"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Work
          </button>
          <button
            type="button"
            onClick={openCamera}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5" />
            Take a Photo
          </button>
          <button
            type="button"
            onClick={initScratchpad}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <PenTool className="w-3.5 h-3.5" />
            Scratchpad
          </button>
          {imageDataUrl && (
            <button
              type="button"
              onClick={() => onImageChange(undefined)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap"
              title="Remove uploaded image"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Image
            </button>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {uploadError}
        </div>
      )}

      {/* Camera Modal Inline View */}
      {isCameraOpen && (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Camera Capture — Align Handwritten Work</span>
            <button
              type="button"
              onClick={closeCamera}
              className="p-1 text-slate-300 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {cameraError ? (
            <div className="p-4 rounded-lg bg-slate-800 text-xs text-slate-200 leading-relaxed">
              {cameraError}
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-64 mx-auto">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeCamera}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            {!cameraError && (
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg"
              >
                Capture Photo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Scratchpad Inline View */}
      {isScratchpadOpen && (
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Handwritten Equation & Circuit Scratchpad
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPenColor('#0F172A')}
                className={`px-2.5 py-1 text-xs rounded border ${
                  penColor === '#0F172A'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Dark Ink
              </button>
              <button
                type="button"
                onClick={() => setPenColor('#0284C7')}
                className={`px-2.5 py-1 text-xs rounded border ${
                  penColor === '#0284C7'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Blue Ink
              </button>
              <button
                type="button"
                onClick={initScratchpad}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-hidden bg-[#FCFBF7]">
            <canvas
              ref={scratchCanvasRef}
              width={680}
              height={320}
              onPointerDown={startDrawing}
              onPointerMove={drawMove}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className="w-full h-56 cursor-crosshair touch-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsScratchpadOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveScratchpad}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg"
            >
              Attach Handwritten Work
            </button>
          </div>
        </div>
      )}

      {/* Main Work Preview Area with Socratic Image Annotation Overlay */}
      {imageDataUrl ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800">Uploaded Work Preview</span>
              {annotationRegion && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-800 font-medium flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-amber-600" />
                    Suspicious region highlighted ({annotationRegion.stepReference})
                  </span>
                </>
              )}
            </div>
            {annotationRegion && (
              <button
                type="button"
                onClick={() => setShowAnnotation((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:text-sky-900"
              >
                {showAnnotation ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    Hide AI Highlight
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    Show AI Highlight
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-[#FCFBF7]">
            <img
              src={imageDataUrl}
              alt="Student handwritten work or diagram under Socratic review"
              referrerPolicy="no-referrer"
              className="w-full max-h-[380px] object-contain mx-auto block"
            />

            {/* Socratic Non-Spoiler Annotation Region */}
            {annotationRegion && showAnnotation && (
              <div
                style={{
                  left: `${annotationRegion.x}%`,
                  top: `${annotationRegion.y}%`,
                  width: `${annotationRegion.width}%`,
                  height: `${annotationRegion.height}%`,
                }}
                className="absolute border-2 border-dashed border-amber-600 bg-amber-400/15 rounded-lg pointer-events-none transition-opacity duration-150 flex items-start justify-end p-1"
              >
                <div className="bg-amber-900/95 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm flex items-center gap-1 -mt-6">
                  <Search className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{annotationRegion.label}</span>
                </div>
              </div>
            )}
          </div>

          {annotationRegion && showAnnotation && tutorQuestion && (
            <div className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3.5 py-2.5">
              <Search className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">
                  Visual Inspection ({annotationRegion.stepReference}):{' '}
                </span>
                <span>{tutorQuestion}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          className="border border-dashed border-slate-300 hover:border-sky-600 rounded-xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/20 transition-colors"
        >
          <FileImage className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-800">
            Drop an image of your handwritten math, physics, or circuit diagram here, or click to browse
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supports handwritten equations · circuit schematics · graphs · engineering notes
          </p>
        </div>
      )}
    </div>
  );
};
