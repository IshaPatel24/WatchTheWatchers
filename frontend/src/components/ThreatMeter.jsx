import React, { useState } from 'react';
import { Shield, AlertCircle, ArrowUpRight, TrendingUp, Cpu } from 'lucide-react';

const SECTOR_STATS = {
  ALL: {
    score: 8.2,
    rating: 'CRITICAL MONITORING',
    color: 'text-cyber-pink border-cyber-pink',
    bgColor: 'bg-cyber-pink/10',
    cameras: '14,890',
    density: '182 / km²',
    aiProcessing: '78%',
    interceptIndex: 'High',
    trend: [82, 80, 78, 85, 84, 86, 82, 83, 85, 87, 88, 82]
  },
  SEC_07: {
    score: 9.8,
    rating: 'TOTALITARIAN GRID',
    color: 'text-red-500 border-red-500',
    bgColor: 'bg-red-500/10',
    cameras: '4,120',
    density: '412 / km²',
    aiProcessing: '98%',
    interceptIndex: 'Maximum',
    trend: [90, 92, 94, 95, 95, 96, 97, 98, 98, 99, 99, 98]
  },
  SEC_04: {
    score: 7.9,
    rating: 'CORPORATE DOMINANCE',
    color: 'text-amber-500 border-amber-500',
    bgColor: 'bg-amber-500/10',
    cameras: '5,800',
    density: '240 / km²',
    aiProcessing: '82%',
    interceptIndex: 'Moderate',
    trend: [70, 72, 73, 75, 76, 75, 78, 77, 79, 80, 79, 79]
  },
  SEC_09: {
    score: 5.4,
    rating: 'MEDIUM SURVEILLANCE',
    color: 'text-cyber-purple border-cyber-purple',
    bgColor: 'bg-cyber-purple/10',
    cameras: '2,970',
    density: '99 / km²',
    aiProcessing: '42%',
    interceptIndex: 'Low',
    trend: [50, 52, 51, 53, 52, 54, 55, 53, 56, 55, 54, 54]
  },
  SEC_03: {
    score: 6.8,
    rating: 'INDUSTRIAL MONITORING',
    color: 'text-cyber-purple border-cyber-purple',
    bgColor: 'bg-cyber-purple/10',
    cameras: '2,000',
    density: '118 / km²',
    aiProcessing: '60%',
    interceptIndex: 'Moderate',
    trend: [60, 62, 61, 64, 65, 66, 68, 67, 69, 70, 68, 68]
  }
};

export default function ThreatMeter() {
  const [selectedSector, setSelectedSector] = useState('ALL');
  const stats = SECTOR_STATS[selectedSector];

  // SVG Gauge calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.score / 10) * circumference;

  return (
    <div className="flex flex-col h-full cyber-panel rounded-lg overflow-hidden border border-cyber-purple/30 p-4 font-mono">
      <div className="flex items-center gap-2 mb-4 border-b border-cyber-purple/20 pb-2">
        <Shield className="w-5 h-5 text-cyber-pink" />
        <div>
          <h2 className="text-lg font-bold text-cyber-pink tracking-wider">THREAT LEVEL CORE</h2>
          <p className="text-[10px] text-cyber-purple">REAL-TIME INVASIVENESS METRIC</p>
        </div>
      </div>

      {/* Sector Selection */}
      <div className="grid grid-cols-5 gap-1 mb-4 text-[9px] font-bold text-center">
        {Object.keys(SECTOR_STATS).map((sector) => (
          <button
            key={sector}
            onClick={() => setSelectedSector(sector)}
            className={`py-1 border rounded transition-all cursor-pointer ${
              selectedSector === sector
                ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink shadow-[0_0_8px_rgba(255,110,176,0.3)]'
                : 'border-cyber-purple/30 text-cyber-text/60 hover:border-cyber-purple'
            }`}
          >
            {sector === 'ALL' ? 'GLOBAL' : sector.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Gauge and Score Area */}
      <div className="flex items-center justify-around gap-4 my-2 flex-1">
        {/* SVG Circle Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-cyber-dark/80 fill-none"
              strokeWidth="10"
            />
            {/* Colored Metric Arc */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="fill-none transition-all duration-500 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={selectedSector === 'SEC_07' ? '#ef4444' : selectedSector === 'SEC_04' ? '#f59e0b' : '#ff6eb0'}
              style={{
                filter: `drop-shadow(0 0 6px ${selectedSector === 'SEC_07' ? '#ef4444' : selectedSector === 'SEC_04' ? '#f59e0b' : '#ff6eb0'})`
              }}
            />
          </svg>
          {/* Inner Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white leading-none">{stats.score}</span>
            <span className="text-[9px] text-cyber-purple mt-1 uppercase font-bold tracking-widest">THREAT / 10</span>
          </div>
        </div>

        {/* Rating and Details */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
          <div className={`border px-2 py-1 text-center font-bold text-xs rounded tracking-wider ${stats.color} ${stats.bgColor}`}>
            {stats.rating}
          </div>

          <div className="text-[10px] space-y-1 text-cyber-text/80 mt-1">
            <div className="flex justify-between border-b border-cyber-purple/15 pb-0.5">
              <span className="text-cyber-text/50">TOTAL SENSORS:</span>
              <span className="font-bold text-white">{stats.cameras}</span>
            </div>
            <div className="flex justify-between border-b border-cyber-purple/15 pb-0.5">
              <span className="text-cyber-text/50">DENSITY:</span>
              <span className="font-bold text-white">{stats.density}</span>
            </div>
            <div className="flex justify-between border-b border-cyber-purple/15 pb-0.5">
              <span className="text-cyber-text/50">AI COGNITIVE RATIO:</span>
              <span className="font-bold text-white">{stats.aiProcessing}</span>
            </div>
            <div className="flex justify-between border-b border-cyber-purple/15 pb-0.5">
              <span className="text-cyber-text/50">INTERCEPT INDEX:</span>
              <span className={`font-bold ${stats.interceptIndex === 'Maximum' ? 'text-red-500' : 'text-cyber-pink'}`}>
                {stats.interceptIndex}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trend Line (SVG Chart) */}
      <div className="mt-4 pt-3 border-t border-cyber-purple/20">
        <div className="flex items-center justify-between text-[10px] text-cyber-text/60 mb-2">
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> 12-MONTH DENSITY TREND</span>
          <span className="text-cyber-pink flex items-center gap-0.5">+4.2% YOY <ArrowUpRight className="w-3 h-3" /></span>
        </div>

        <div className="w-full h-12 relative bg-cyber-bg/50 border border-cyber-purple/10 rounded overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 240 50" preserveAspectRatio="none">
            {/* Trend Gradient */}
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6eb0" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff6eb0" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Chart Grid Lines */}
            <line x1="0" y1="12" x2="240" y2="12" stroke="rgba(160, 96, 255, 0.05)" />
            <line x1="0" y1="25" x2="240" y2="25" stroke="rgba(160, 96, 255, 0.05)" />
            <line x1="0" y1="38" x2="240" y2="38" stroke="rgba(160, 96, 255, 0.05)" />

            {/* Filled Area */}
            <path
              d={`
                M 0 50
                L 0 ${50 - (stats.trend[0] - 40)}
                ${stats.trend.map((val, idx) => `L ${(idx * 240) / 11} ${50 - (val - 40)}`).join(' ')}
                L 240 50
                Z
              `}
              fill="url(#chart-glow)"
            />

            {/* Line Path */}
            <path
              d={stats.trend.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx * 240) / 11} ${50 - (val - 40)}`).join(' ')}
              fill="none"
              stroke="#ff6eb0"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 3px #ff6eb0)' }}
            />
          </svg>
        </div>
        <div className="flex justify-between text-[8px] text-cyber-text/40 mt-1 font-mono">
          <span>MAY 2025</span>
          <span>OCT 2025</span>
          <span>MAY 2026</span>
        </div>
      </div>
    </div>
  );
}
