import React, { useState, useEffect } from 'react';
import { Shield, Eye, AlertTriangle, Search, Info, MapPin, Radio, ToggleLeft, ToggleRight } from 'lucide-react';

const INITIAL_NODES = [
  {
    id: 'SYS-FR-701',
    name: 'Sector 7 Bio-Metric Scanner',
    type: 'Facial Recognition',
    x: 150,
    y: 180,
    threatScore: 10,
    owner: 'Municipal Security Dept',
    dataCollected: 'Biometric face-templates, walking gait, thermal profile',
    retention: '30 Days',
    status: 'ACTIVE',
    accessRequests: '1,248 queries/hr',
    location: 'District 7 Main Transit Hub',
    description: 'Real-time AI camera analyzing pedestrian faces to match against federal databases.'
  },
  {
    id: 'SYS-ALPR-402',
    name: 'Highway 4 Transit Tracker',
    type: 'ALPR',
    x: 340,
    y: 290,
    threatScore: 7,
    owner: 'State Transit Bureau',
    dataCollected: 'License plate, vehicle profile, timestamp, speed',
    retention: '90 Days',
    status: 'ACTIVE',
    accessRequests: '450 queries/hr',
    location: 'Highway 4 Interstate Interchange',
    description: 'Automated License Plate Reader recording every vehicle entering and exiting city limits.'
  },
  {
    id: 'SYS-CCTV-903',
    name: 'Slums Sector 9 Junction Cam',
    type: 'CCTV',
    x: 480,
    y: 120,
    threatScore: 4,
    owner: 'CorpSec Private Patrol',
    dataCollected: 'Standard definition video feed',
    retention: '7 Days',
    status: 'ACTIVE',
    accessRequests: '12 queries/hr',
    location: 'Sector 9 Industrial Corridor',
    description: 'Corporation-owned street surveillance dome monitoring workers and residents.'
  },
  {
    id: 'SYS-SR-101',
    name: 'Govt Plaza IMSI Catcher',
    type: 'Stingray',
    x: 220,
    y: 380,
    threatScore: 9,
    owner: 'Federal Intelligence Agency',
    dataCollected: 'Mobile IMSI, IMEI, metadata, voice/SMS intercepts',
    retention: 'Indefinite',
    status: 'ACTIVE',
    accessRequests: '3,120 queries/hr',
    location: 'Federal Plaza Civic Center',
    description: 'Cell site simulator intercepting local mobile traffic under the guise of municipal Wi-Fi.'
  },
  {
    id: 'SYS-FR-102',
    name: 'Sovereign Plaza Facial Tracker',
    type: 'Facial Recognition',
    x: 280,
    y: 420,
    threatScore: 10,
    owner: 'Municipal Security Dept',
    dataCollected: 'Biometric face-templates, gait tracking, group association profiles',
    retention: '30 Days',
    status: 'ACTIVE',
    accessRequests: '8,940 queries/hr',
    location: 'Sovereign Shopping Galleria',
    description: 'High-density crowd scanning terminal used for predictive threat profiling.'
  },
  {
    id: 'SYS-CCTV-305',
    name: 'District 3 Subway Camera 12',
    type: 'CCTV',
    x: 600,
    y: 320,
    threatScore: 5,
    owner: 'Transit Authority',
    dataCollected: 'HD Video feed, audio recording',
    retention: '14 Days',
    status: 'ACTIVE',
    accessRequests: '98 queries/hr',
    location: 'District 3 Underground Station',
    description: 'Stationary dome camera with audio collection capability monitoring train entry.'
  }
];

export default function SurveillanceMap({ selectedNode, setSelectedNode, onReportClick }) {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showRadar, setShowRadar] = useState(true);
  const [radarAngle, setRadarAngle] = useState(0);

  // Poll for newly reported local items (from state/localStorage)
  useEffect(() => {
    const handleReportsUpdate = () => {
      const stored = localStorage.getItem('wtw_reports');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert reports to map nodes
          const reportNodes = parsed.map((r, index) => ({
            id: r.id || `REP-${index}`,
            name: r.name || 'Citizen Reported Node',
            type: r.type,
            x: r.x || (200 + (index * 80) % 300),
            y: r.y || (150 + (index * 60) % 250),
            threatScore: r.threatScore || (r.type === 'Facial Recognition' ? 10 : r.type === 'Stingray' ? 9 : r.type === 'ALPR' ? 7 : 4),
            owner: r.owner || 'Unknown (Pending Investigation)',
            dataCollected: r.dataCollected || 'Camera stream / wireless metadata',
            retention: 'Unknown',
            status: 'UNVERIFIED',
            accessRequests: 'Under investigation',
            location: r.location || 'Reported Location',
            description: r.description || 'Anonymous citizen report submitted to the database.'
          }));
          
          // Combine initial nodes and citizen reported ones (filtering duplicates by id)
          const combined = [...INITIAL_NODES];
          reportNodes.forEach(rn => {
            if (!combined.some(n => n.id === rn.id)) {
              combined.push(rn);
            }
          });
          setNodes(combined);
        } catch (e) {
          console.error(e);
        }
      }
    };

    handleReportsUpdate();
    window.addEventListener('storage', handleReportsUpdate);
    // Custom event dispatch setup for same window storage changes
    window.addEventListener('wtw_new_report', handleReportsUpdate);
    return () => {
      window.removeEventListener('storage', handleReportsUpdate);
      window.removeEventListener('wtw_new_report', handleReportsUpdate);
    };
  }, []);

  // Radar rotating effect
  useEffect(() => {
    if (!showRadar) return;
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [showRadar]);

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = node.name.toLowerCase().includes(search.toLowerCase()) || 
                          node.id.toLowerCase().includes(search.toLowerCase()) ||
                          node.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'ALL' || node.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getThreatColor = (score) => {
    if (score >= 9) return 'text-cyber-pink stroke-cyber-pink fill-cyber-pink/20';
    if (score >= 7) return 'text-amber-500 stroke-amber-500 fill-amber-500/20';
    return 'text-cyber-purple stroke-cyber-purple fill-cyber-purple/20';
  };

  const getThreatBg = (score) => {
    if (score >= 9) return 'bg-cyber-pink/10 border-cyber-pink text-cyber-pink';
    if (score >= 7) return 'bg-amber-500/10 border-amber-500 text-amber-500';
    return 'bg-cyber-purple/10 border-cyber-purple text-cyber-purple';
  };

  return (
    <div className="flex flex-col h-full cyber-panel rounded-lg overflow-hidden border border-cyber-purple/30 relative">
      {/* Scanner Effect */}
      <div className="cyber-scanner"></div>

      {/* Map Header */}
      <div className="p-4 cyber-panel-header flex flex-col md:flex-row md:items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-cyber-pink animate-pulse" />
          <div>
            <h2 className="text-xl font-bold tracking-wider text-glow-pink text-cyber-pink">LIVE SURVEILLANCE REGISTRY</h2>
            <p className="text-xs font-mono text-cyber-purple">SITUATIONAL MAP // NEO-SOVEREIGN CITY</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-cyber-bg border border-cyber-purple/50 text-cyber-text px-2 py-1 rounded focus:outline-none focus:border-cyber-pink"
          >
            <option value="ALL">ALL TYPES</option>
            <option value="Facial Recognition">FACIAL REC</option>
            <option value="Stingray">IMSI CATCHER</option>
            <option value="ALPR">ALPR</option>
            <option value="CCTV">CCTV</option>
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH SENSORS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-cyber-bg border border-cyber-purple/50 text-cyber-text px-2 py-1 pl-7 rounded focus:outline-none focus:border-cyber-pink placeholder:text-cyber-text/30 w-36 md:w-48"
            />
            <Search className="w-3.5 h-3.5 text-cyber-text/50 absolute left-2.5 top-2" />
          </div>
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`px-2 py-1 border rounded flex items-center gap-1 transition-colors ${
              showRadar ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink' : 'border-cyber-purple/50 text-cyber-text/50'
            }`}
          >
            <Radio className={`w-3 h-3 ${showRadar ? 'animate-pulse' : ''}`} /> RADAR
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-cyber-dark/80 relative overflow-hidden pixel-grid min-h-[350px]">
        {/* SVG City Overlay Map */}
        <svg
          className="absolute inset-0 w-full h-full select-none"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Cyberpunk City Grid Streets */}
          <g stroke="rgba(160, 96, 255, 0.15)" strokeWidth="1" fill="none">
            {/* Grid Coordinates Lines */}
            <line x1="100" y1="0" x2="100" y2="500" />
            <line x1="200" y1="0" x2="200" y2="500" />
            <line x1="300" y1="0" x2="300" y2="500" />
            <line x1="400" y1="0" x2="400" y2="500" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="600" y1="0" x2="600" y2="500" />
            <line x1="700" y1="0" x2="700" y2="500" />

            <line x1="0" y1="100" x2="800" y2="100" />
            <line x1="0" y1="200" x2="800" y2="200" />
            <line x1="0" y1="300" x2="800" y2="300" />
            <line x1="0" y1="400" x2="800" y2="400" />
          </g>

          {/* Futuristic Streets (Diagonal/Geometric blocks) */}
          <g stroke="rgba(160, 96, 255, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
            {/* Diagonal Expressways */}
            <path d="M 0 50 L 800 450" />
            <path d="M 100 500 L 700 0" />
            <path d="M 0 250 H 800" />
            <path d="M 400 0 V 500" />
          </g>

          {/* District Boundary Markings */}
          <g fill="rgba(160, 96, 255, 0.05)" stroke="rgba(255, 110, 176, 0.15)" strokeWidth="1">
            <rect x="20" y="20" width="280" height="200" rx="10" />
            <rect x="320" y="20" width="460" height="240" rx="10" />
            <rect x="20" y="240" width="380" height="240" rx="10" />
            <rect x="420" y="280" width="360" height="200" rx="10" />
          </g>

          {/* District Labels */}
          <g fill="rgba(224, 208, 255, 0.4)" fontFamily="Space Mono" fontSize="9" letterSpacing="2">
            <text x="35" y="40">[SEC-07: GOVERNMENT CTR]</text>
            <text x="335" y="40">[SEC-04: CORPORATE PLAZA]</text>
            <text x="35" y="260">[SEC-09: RESIDENTIAL & DOCKS]</text>
            <text x="435" y="300">[SEC-03: INDUSTRIAL TERMINAL]</text>
          </g>

          {/* Radar Sweep Arc */}
          {showRadar && (
            <g transform="translate(400, 250)">
              <circle r="300" fill="none" stroke="rgba(255, 110, 176, 0.08)" strokeWidth="1" />
              <circle r="150" fill="none" stroke="rgba(255, 110, 176, 0.04)" strokeWidth="1" />
              <line
                x1="0"
                y1="0"
                x2={300 * Math.cos((radarAngle * Math.PI) / 180)}
                y2={300 * Math.sin((radarAngle * Math.PI) / 180)}
                stroke="rgba(255, 110, 176, 0.6)"
                strokeWidth="2"
                box-shadow="0 0 10px var(--color-cyber-pink)"
              />
              <path
                d={`M 0 0 L ${300 * Math.cos((radarAngle * Math.PI) / 180)} ${
                  300 * Math.sin((radarAngle * Math.PI) / 180)
                } A 300 300 0 0 0 ${300 * Math.cos(((radarAngle - 30) * Math.PI) / 180)} ${
                  300 * Math.sin(((radarAngle - 30) * Math.PI) / 180)
                } Z`}
                fill="url(#radar-gradient)"
                opacity="0.25"
              />
            </g>
          )}

          {/* Gradients */}
          <defs>
            <radialGradient id="radar-gradient" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#ff6eb0" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ff6eb0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff6eb0" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Surveillance Node Markers */}
          {filteredNodes.map((node) => {
            const isSelected = selectedNode && selectedNode.id === node.id;
            const size = node.threatScore >= 9 ? 12 : node.threatScore >= 7 ? 10 : 8;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNode(node)}
              >
                {/* Outer pulsing ring for high threat or unverified reports */}
                {node.status === 'UNVERIFIED' ? (
                  <circle
                    r={size + 12}
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ transformOrigin: 'center', animationDuration: '6s' }}
                  />
                ) : node.threatScore >= 9 ? (
                  <circle
                    r={size + 8}
                    fill="none"
                    stroke="#ff6eb0"
                    strokeWidth="1"
                    className="animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                ) : null}

                {/* Main Node Point */}
                <circle
                  r={size}
                  className={`transition-all duration-300 ${getThreatColor(node.threatScore)} ${
                    isSelected ? 'stroke-white stroke-2 scale-125' : 'stroke-1'
                  } ${node.status === 'UNVERIFIED' ? 'text-cyber-green stroke-cyber-green fill-cyber-green/20' : ''}`}
                />

                {/* Eye icon symbol inside core when selected */}
                {isSelected && (
                  <circle r="3" fill="#ffffff" className="animate-pulse" />
                )}

                {/* Label hover trigger zone */}
                <circle r={size + 15} fill="transparent" />
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Stats */}
        <div className="absolute bottom-4 left-4 font-mono text-[10px] cyber-panel p-3 border border-cyber-purple/30 rounded flex flex-col gap-1.5 pointer-events-none select-none z-10">
          <div className="flex items-center gap-1.5 text-cyber-text">
            <span className="w-2 h-2 rounded-full bg-cyber-pink animate-pulse"></span>
            HIGH INVASION SENSORS: {nodes.filter((n) => n.threatScore >= 9).length}
          </div>
          <div className="flex items-center gap-1.5 text-cyber-text">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            MEDIUM SENSORS: {nodes.filter((n) => n.threatScore >= 7 && n.threatScore < 9).length}
          </div>
          <div className="flex items-center gap-1.5 text-cyber-green">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse"></span>
            CITIZEN REPORTS RECEIVED: {nodes.filter((n) => n.status === 'UNVERIFIED').length}
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 font-mono text-[10px] cyber-panel p-3 border border-cyber-purple/30 rounded flex flex-col gap-1.5 z-10 bg-cyber-bg/90">
          <div className="font-bold border-b border-cyber-purple/30 pb-1 text-cyber-pink">MAP LEGEND</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-pink inline-block"></span>
            <span>Facial Rec (10/10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>ALPR Tracker (7/10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-purple inline-block"></span>
            <span>CCTV Dome (4-5/10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green inline-block animate-pulse"></span>
            <span>Citizen Report (New)</span>
          </div>
        </div>

        {/* Floating Quick Action */}
        <button
          onClick={onReportClick}
          className="absolute bottom-4 right-4 bg-cyber-pink/20 hover:bg-cyber-pink/40 border border-cyber-pink text-cyber-pink text-xs font-mono px-3 py-2 rounded flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,110,176,0.3)] hover:scale-105 active:scale-95 z-10"
        >
          <MapPin className="w-3.5 h-3.5" /> REPORT SENSOR
        </button>
      </div>

      {/* Selected Node Drawer */}
      {selectedNode && (
        <div className="border-t border-cyber-purple/30 bg-cyber-dark/95 p-4 z-10 font-mono transition-transform duration-300">
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 border text-xs rounded uppercase font-bold ${getThreatBg(selectedNode.threatScore)}`}>
                {selectedNode.type}
              </span>
              <span className={`px-2 py-0.5 border border-cyber-purple/40 text-cyber-text text-xs rounded uppercase font-bold`}>
                SCORE: {selectedNode.threatScore}/10
              </span>
              {selectedNode.status === 'UNVERIFIED' && (
                <span className="px-2 py-0.5 border border-cyber-green bg-cyber-green/10 text-cyber-green text-xs rounded uppercase font-bold animate-pulse">
                  PENDING VERIFICATION
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-cyber-text/50 hover:text-cyber-pink text-xs"
            >
              [CLOSE]
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-bold text-cyber-pink">{selectedNode.name}</h3>
              <p className="text-xs text-cyber-text/80 mt-1">{selectedNode.description}</p>
            </div>
            <div className="text-xs space-y-1 text-cyber-text/60">
              <div><strong className="text-cyber-text">ID:</strong> {selectedNode.id}</div>
              <div><strong className="text-cyber-text">LOCATION:</strong> {selectedNode.location}</div>
              <div><strong className="text-cyber-text">OPERATOR:</strong> {selectedNode.owner}</div>
            </div>
            <div className="text-xs space-y-1 text-cyber-text/60">
              <div><strong className="text-cyber-text">DATA HARVESTED:</strong> {selectedNode.dataCollected}</div>
              <div><strong className="text-cyber-text">RETENTION POLICY:</strong> {selectedNode.retention}</div>
              <div><strong className="text-cyber-text">AUDIT FREQUENCY:</strong> {selectedNode.accessRequests}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
