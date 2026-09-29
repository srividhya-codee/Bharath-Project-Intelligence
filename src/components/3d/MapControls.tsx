import React from 'react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  ArrowUp,
  ArrowDown,
  RotateCw
} from 'lucide-react';

interface MapControlsProps {
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onTopDownView: () => void;
  onIsoView: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onResetView,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onTopDownView,
  onIsoView,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-1.5 shadow-lg text-slate-700 text-xs">
      <div className="flex items-center space-x-1 border-r border-slate-200 pr-1.5">
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1 border-r border-slate-200 pr-1.5">
        <button
          onClick={onRotateLeft}
          title="Rotate Left"
          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRotateRight}
          title="Rotate Right"
          className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center space-x-1 border-r border-slate-200 pr-1.5">
        <button
          onClick={onIsoView}
          title="3D Isometric Perspective"
          className="px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-blue-700 font-semibold text-[11px] transition flex items-center gap-1"
        >
          <Compass className="w-3.5 h-3.5 text-blue-700" />
          <span>3D View</span>
        </button>
        <button
          onClick={onTopDownView}
          title="2D Top-Down View"
          className="px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-blue-700 font-semibold text-[11px] transition"
        >
          Plan (2D)
        </button>
      </div>

      <button
        onClick={onResetView}
        title="Reset Camera View"
        className="px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-blue-700 font-medium text-[11px] transition flex items-center gap-1"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>

      <button
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-blue-700 transition ml-auto"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
