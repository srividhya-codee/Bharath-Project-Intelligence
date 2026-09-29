import React, { useState } from 'react';
import { Project, StateStats } from '../../types';
import { getStateStatistics } from '../../data/mockData';
import { MapPin, Info, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';

interface IndiaChoroplethMapProps {
  projects: Project[];
  selectedState?: string | null;
  onSelectState?: (stateName: string | null) => void;
  onSelectProject?: (projectCode: string) => void;
}

export const IndiaChoroplethMap: React.FC<IndiaChoroplethMapProps> = ({
  projects,
  selectedState,
  onSelectState,
  onSelectProject
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<'spi' | 'risk' | 'outlay'>('spi');

  const stats = React.useMemo(() => getStateStatistics(projects), [projects]);

  // Major state SVG paths approximating India's state boundaries for interactive choropleth
  const STATE_PATHS: { name: string; path: string; labelX: number; labelY: number }[] = [
    {
      name: 'Jammu and Kashmir',
      path: 'M 250 80 L 290 50 L 330 65 L 340 100 L 320 130 L 270 140 L 245 110 Z',
      labelX: 290,
      labelY: 90
    },
    {
      name: 'Himachal Pradesh',
      path: 'M 290 140 L 330 130 L 350 160 L 330 185 L 295 180 Z',
      labelX: 320,
      labelY: 160
    },
    {
      name: 'Punjab',
      path: 'M 260 170 L 295 170 L 305 210 L 265 220 L 255 190 Z',
      labelX: 280,
      labelY: 195
    },
    {
      name: 'Uttarakhand',
      path: 'M 335 175 L 375 185 L 385 220 L 350 230 L 330 195 Z',
      labelX: 355,
      labelY: 205
    },
    {
      name: 'Haryana',
      path: 'M 295 210 L 335 205 L 340 245 L 305 260 L 290 230 Z',
      labelX: 315,
      labelY: 235
    },
    {
      name: 'Rajasthan',
      path: 'M 180 240 L 260 215 L 295 255 L 285 330 L 240 370 L 175 320 L 160 270 Z',
      labelX: 230,
      labelY: 290
    },
    {
      name: 'Uttar Pradesh',
      path: 'M 335 235 L 410 230 L 480 270 L 465 340 L 385 350 L 335 305 L 340 260 Z',
      labelX: 400,
      labelY: 290
    },
    {
      name: 'Bihar',
      path: 'M 480 270 L 560 280 L 575 340 L 505 350 L 475 320 Z',
      labelX: 525,
      labelY: 310
    },
    {
      name: 'West Bengal',
      path: 'M 565 310 L 585 300 L 600 370 L 570 430 L 545 390 L 565 350 Z',
      labelX: 575,
      labelY: 370
    },
    {
      name: 'Sikkim',
      path: 'M 565 260 L 585 255 L 590 280 L 570 285 Z',
      labelX: 578,
      labelY: 272
    },
    {
      name: 'Assam',
      path: 'M 620 290 L 710 270 L 730 310 L 680 340 L 630 330 Z',
      labelX: 670,
      labelY: 305
    },
    {
      name: 'Arunachal Pradesh',
      path: 'M 680 230 L 760 230 L 775 280 L 720 275 L 680 255 Z',
      labelX: 730,
      labelY: 255
    },
    {
      name: 'Nagaland',
      path: 'M 730 300 L 760 305 L 755 335 L 725 330 Z',
      labelX: 742,
      labelY: 320
    },
    {
      name: 'Manipur',
      path: 'M 725 335 L 755 340 L 750 375 L 720 370 Z',
      labelX: 738,
      labelY: 355
    },
    {
      name: 'Mizoram',
      path: 'M 715 380 L 745 385 L 735 430 L 710 420 Z',
      labelX: 728,
      labelY: 405
    },
    {
      name: 'Tripura',
      path: 'M 690 380 L 715 385 L 710 415 L 685 410 Z',
      labelX: 700,
      labelY: 395
    },
    {
      name: 'Meghalaya',
      path: 'M 630 330 L 680 330 L 675 355 L 625 355 Z',
      labelX: 650,
      labelY: 342
    },
    {
      name: 'Gujarat',
      path: 'M 130 335 L 205 345 L 235 400 L 195 445 L 140 435 L 120 395 Z',
      labelX: 175,
      labelY: 390
    },
    {
      name: 'Madhya Pradesh',
      path: 'M 270 345 L 385 335 L 435 375 L 420 440 L 320 445 L 260 415 Z',
      labelX: 350,
      labelY: 390
    },
    {
      name: 'Jharkhand',
      path: 'M 495 345 L 555 345 L 550 410 L 485 410 Z',
      labelX: 520,
      labelY: 380
    },
    {
      name: 'Chhattisgarh',
      path: 'M 425 375 L 480 390 L 460 490 L 415 470 L 415 420 Z',
      labelX: 445,
      labelY: 435
    },
    {
      name: 'Odisha',
      path: 'M 485 405 L 550 410 L 535 490 L 470 475 Z',
      labelX: 510,
      labelY: 450
    },
    {
      name: 'Maharashtra',
      path: 'M 200 445 L 295 440 L 390 440 L 375 530 L 290 540 L 220 515 Z',
      labelX: 285,
      labelY: 490
    },
    {
      name: 'Telangana',
      path: 'M 335 520 L 405 500 L 420 565 L 360 580 Z',
      labelX: 380,
      labelY: 540
    },
    {
      name: 'Andhra Pradesh',
      path: 'M 375 570 L 460 495 L 440 635 L 370 645 L 385 605 Z',
      labelX: 415,
      labelY: 600
    },
    {
      name: 'Karnataka',
      path: 'M 260 535 L 335 530 L 360 635 L 320 680 L 270 630 Z',
      labelX: 310,
      labelY: 610
    },
    {
      name: 'Goa',
      path: 'M 245 615 L 265 615 L 260 635 L 240 630 Z',
      labelX: 250,
      labelY: 625
    },
    {
      name: 'Kerala',
      path: 'M 285 680 L 320 680 L 325 765 L 305 770 Z',
      labelX: 305,
      labelY: 720
    },
    {
      name: 'Tamil Nadu',
      path: 'M 325 670 L 375 645 L 390 735 L 340 775 L 325 725 Z',
      labelX: 355,
      labelY: 710
    }
  ];

  // Specific Key Projects to Plot with Pins
  const KEY_PINS = [
    { code: 'P-102', name: 'Madurai Highway Corridor', state: 'Tamil Nadu', x: 355, y: 730, status: 'Delayed', spi: 0.78 },
    { code: 'P-101', name: 'Western DFC Rail Corridor', state: 'Maharashtra', x: 235, y: 485, status: 'Active', spi: 0.94 },
    { code: 'P-103', name: 'Dholera Industrial Trunk', state: 'Gujarat', x: 180, y: 405, status: 'Delayed', spi: 0.81 },
    { code: 'P-104', name: 'Bhadla Ultra Mega Solar', state: 'Rajasthan', x: 215, y: 280, status: 'Delayed', spi: 0.73 },
    { code: 'P-105', name: 'Jal Jeevan Bundelkhand', state: 'Madhya Pradesh', x: 385, y: 360, status: 'Delayed', spi: 0.69 },
    { code: 'P-106', name: 'Bengaluru Metro ORR Line', state: 'Karnataka', x: 320, y: 645, status: 'Active', spi: 0.98 }
  ];

  const getColor = (stateName: string) => {
    const s = stats[stateName];
    if (!s || s.totalProjects === 0) return '#334155'; // Slate 700

    if (colorMode === 'spi') {
      if (s.avgSpi >= 0.95) return '#10b981'; // Emerald 500
      if (s.avgSpi >= 0.85) return '#f59e0b'; // Amber 500
      return '#ef4444'; // Red 500
    }

    if (colorMode === 'risk') {
      if (s.highRiskProjects === 0) return '#10b981';
      if (s.highRiskProjects <= 2) return '#f59e0b';
      return '#ef4444';
    }

    // Outlay mode
    if (s.totalOutlayCr > 10000) return '#6366f1'; // Indigo 500
    if (s.totalOutlayCr > 4000) return '#3b82f6'; // Blue 500
    return '#0284c7'; // Sky 600
  };

  const activeStat = hoveredState ? stats[hoveredState] : selectedState ? stats[selectedState] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              Pan-India Strategic Infrastructure GIS Map
            </h3>
            {selectedState && (
              <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold">
                Filter: {selectedState}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Click any state to filter project portfolio. Hover for EVM metrics and regional capital outlay.
          </p>
        </div>

        {/* Color Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setColorMode('spi')}
            className={`px-2.5 py-1 rounded transition ${
              colorMode === 'spi' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            By SPI (Schedule)
          </button>
          <button
            onClick={() => setColorMode('risk')}
            className={`px-2.5 py-1 rounded transition ${
              colorMode === 'risk' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Risk Band
          </button>
          <button
            onClick={() => setColorMode('outlay')}
            className={`px-2.5 py-1 rounded transition ${
              colorMode === 'outlay' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Capital Outlay
          </button>
        </div>
      </div>

      {/* SVG Container with Map and Overlay Stats Card */}
      <div className="relative w-full flex justify-center items-center py-2">
        <svg
          viewBox="100 20 700 780"
          className="w-full max-w-[650px] h-auto drop-shadow-2xl select-none"
        >
          {/* Subtle Background Graticules */}
          <g stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3">
            <line x1="100" y1="200" x2="800" y2="200" />
            <line x1="100" y1="400" x2="800" y2="400" />
            <line x1="100" y1="600" x2="800" y2="600" />
            <line x1="300" y1="20" x2="300" y2="800" />
            <line x1="500" y1="20" x2="500" y2="800" />
            <line x1="700" y1="20" x2="700" y2="800" />
          </g>

          {/* State Polygons */}
          {STATE_PATHS.map(state => {
            const isHovered = hoveredState === state.name;
            const isSelected = selectedState === state.name;
            const baseColor = getColor(state.name);

            return (
              <g key={state.name}>
                <path
                  d={state.path}
                  fill={baseColor}
                  fillOpacity={isSelected ? 1.0 : isHovered ? 0.9 : 0.72}
                  stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#0f172a'}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                  className="cursor-pointer transition-all duration-150 hover:brightness-125"
                  onMouseEnter={() => setHoveredState(state.name)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => {
                    if (onSelectState) {
                      onSelectState(selectedState === state.name ? null : state.name);
                    }
                  }}
                />
              </g>
            );
          })}

          {/* Key Project Location Pins */}
          {KEY_PINS.map(pin => {
            const isHovered = hoveredState === pin.state;
            return (
              <g
                key={pin.code}
                className="cursor-pointer group"
                onClick={e => {
                  e.stopPropagation();
                  if (onSelectProject) onSelectProject(pin.code);
                }}
              >
                {/* Pin Pulse */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r="7"
                  className={pin.status === 'Delayed' ? 'fill-rose-500/40 animate-ping' : 'fill-emerald-500/40'}
                />
                {/* Pin Marker */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r="4.5"
                  fill={pin.status === 'Delayed' ? '#ef4444' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Label Box */}
                <rect
                  x={pin.x + 8}
                  y={pin.y - 12}
                  width="50"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="0.8"
                  className="opacity-90"
                />
                <text
                  x={pin.x + 12}
                  y={pin.y}
                  fill="#f8fafc"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {pin.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating State Telemetry Card */}
        {activeStat && (
          <div className="absolute top-2 right-2 w-72 bg-slate-950/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs animate-in fade-in duration-150 z-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                  STATE REGIONAL NODE
                </span>
                <h4 className="font-bold text-sm text-white">{activeStat.stateName}</h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[11px] border border-slate-700">
                {activeStat.code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Projects</span>
                <span className="text-sm font-bold text-slate-100">{activeStat.totalProjects}</span>
                <span className="text-[10px] text-slate-400 block">
                  {activeStat.delayedProjects} Delayed
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Capital Outlay</span>
                <span className="text-sm font-bold text-emerald-400">
                  ₹{activeStat.totalOutlayCr.toLocaleString()} Cr
                </span>
                <span className="text-[10px] text-slate-400 block">Approved BAC</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Average SPI</span>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-sm font-bold ${
                      activeStat.avgSpi >= 0.95
                        ? 'text-emerald-400'
                        : activeStat.avgSpi >= 0.85
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {activeStat.avgSpi}
                  </span>
                  {activeStat.avgSpi < 0.85 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">High/Critical Risk</span>
                <span
                  className={`text-sm font-bold ${
                    activeStat.highRiskProjects > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {activeStat.highRiskProjects} Projects
                </span>
              </div>
            </div>

            {selectedState === activeStat.stateName ? (
              <button
                onClick={() => onSelectState && onSelectState(null)}
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-center text-xs transition border border-slate-700"
              >
                Clear State Filter
              </button>
            ) : (
              <button
                onClick={() => onSelectState && onSelectState(activeStat.stateName)}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-center text-xs transition flex items-center justify-center gap-1"
              >
                <span>Filter Projects in {activeStat.stateName}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-slate-300">Legend ({colorMode.toUpperCase()}):</span>
          {colorMode === 'spi' && (
            <>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>On Track (SPI ≥ 0.95)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Moderate Warning (0.85 - 0.94)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical Slippage (&lt; 0.85)</span>
              </span>
            </>
          )}
          {colorMode === 'risk' && (
            <>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low Risk (0 High Risk)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium Risk (1-2 High Risk)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical Hotspot (&gt; 2 High Risk)</span>
              </span>
            </>
          )}
          {colorMode === 'outlay' && (
            <>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span>&lt; ₹4,000 Cr</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>₹4,000 - ₹10,000 Cr</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>&gt; ₹10,000 Cr Outlay</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          <span>Interactive Pins indicate Worked Mega-Projects</span>
        </div>
      </div>
    </div>
  );
};
