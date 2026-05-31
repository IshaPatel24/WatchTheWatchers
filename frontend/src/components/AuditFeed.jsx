import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Wifi, Play, Pause, RefreshCw } from 'lucide-react';

const AGENCIES = ['NSA-FEDERAL-GW', 'CITY-POLICE-DEPT', 'CORPSEC-PRIVATE-UNIT', 'TRANSIT-AUTHORITY', 'INTERSTATE-INTEL-FED'];
const ACTIONS = [
  'Biometric Match Scan',
  'Live Stream Feed Access',
  'Cellular Tower Dump Query',
  'ALPR History Retroactive Search',
  'Audio Spectrum Voice Analysis',
  'Warrantless Wiretap Hookup',
  'Predictive Riot Profiling Index'
];
const TARGETS = ['SYS-FR-701', 'SYS-ALPR-402', 'SYS-CCTV-903', 'SYS-SR-101', 'SYS-FR-102', 'SYS-CCTV-305'];
const STATUSES = ['AUTHORIZED', 'DENIED', 'BYPASSED', 'AUTHORIZED', 'AUTHORIZED']; // Bypassed represents suspicious/unauthorized overrides

const INITIAL_AUDITS = [
  {
    timestamp: '2026-05-31 16:01:22',
    agency: 'NSA-FEDERAL-GW',
    target: 'SYS-SR-101',
    action: 'Cellular Tower Dump Query',
    status: 'AUTHORIZED',
    id: 'AUD-001'
  },
  {
    timestamp: '2026-05-31 16:03:45',
    agency: 'CITY-POLICE-DEPT',
    target: 'SYS-FR-701',
    action: 'Biometric Match Scan',
    status: 'AUTHORIZED',
    id: 'AUD-002'
  },
  {
    timestamp: '2026-05-31 16:04:10',
    agency: 'CORPSEC-PRIVATE-UNIT',
    target: 'SYS-CCTV-903',
    action: 'Live Stream Feed Access',
    status: 'AUTHORIZED',
    id: 'AUD-003'
  },
  {
    timestamp: '2026-05-31 16:05:01',
    agency: 'INTERSTATE-INTEL-FED',
    target: 'SYS-FR-102',
    action: 'Predictive Riot Profiling Index',
    status: 'BYPASSED',
    id: 'AUD-004'
  },
  {
    timestamp: '2026-05-31 16:07:33',
    agency: 'TRANSIT-AUTHORITY',
    target: 'SYS-CCTV-305',
    action: 'Live Stream Feed Access',
    status: 'DENIED',
    id: 'AUD-005'
  }
];

export default function AuditFeed() {
  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [isLive, setIsLive] = useState(true);
  const feedEndRef = useRef(null);

  // Generate real-time random query access audit
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const date = new Date();
      const timestamp = date.toISOString().replace('T', ' ').substring(0, 19);
      const randomAgency = AGENCIES[Math.floor(Math.random() * AGENCIES.length)];
      const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const randomTarget = TARGETS[Math.floor(Math.random() * TARGETS.length)];
      const randomStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const randomId = `AUD-${Math.floor(Math.random() * 900) + 100}`;

      const newAudit = {
        timestamp,
        agency: randomAgency,
        target: randomTarget,
        action: randomAction,
        status: randomStatus,
        id: randomId
      };

      setAudits((prev) => {
        // Keep last 30 logs in list
        const updated = [...prev, newAudit];
        if (updated.length > 30) {
          updated.shift();
        }
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Scroll to bottom of terminal feed automatically
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [audits]);

  const getStatusColor = (status) => {
    if (status === 'AUTHORIZED') return 'text-cyber-purple font-semibold';
    if (status === 'DENIED') return 'text-red-500 font-bold';
    return 'text-cyber-pink font-bold animate-pulse text-glow-pink'; // BYPASSED
  };

  const getStatusLabel = (status) => {
    if (status === 'AUTHORIZED') return '[OK] AUTHORIZED';
    if (status === 'DENIED') return '[XX] REJECTED';
    return '[!!] SEC-BYPASSED';
  };

  const clearLogs = () => {
    setAudits([]);
  };

  return (
    <div className="flex flex-col h-full cyber-panel rounded-lg overflow-hidden border border-cyber-purple/30 p-4 font-mono">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 border-b border-cyber-purple/20 pb-2 z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyber-pink" />
          <div>
            <h2 className="text-lg font-bold text-cyber-pink tracking-wider">DATA ACCESS AUDIT</h2>
            <p className="text-[10px] text-cyber-purple">LIVE GOVERNMENT/CORP QUERIES FEED</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-cyber-pink' : 'bg-cyber-purple'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-cyber-pink' : 'bg-cyber-purple'}`}></span>
          </span>
          <span className="text-[10px] text-cyber-text/50">{isLive ? 'FEED: LIVE' : 'FEED: PAUSED'}</span>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className="p-1 border border-cyber-purple/30 rounded text-cyber-text/60 hover:text-cyber-pink hover:border-cyber-pink transition-colors cursor-pointer"
            title={isLive ? 'Pause Feed' : 'Resume Feed'}
          >
            {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          
          <button
            onClick={clearLogs}
            className="p-1 border border-cyber-purple/30 rounded text-cyber-text/60 hover:text-cyber-pink hover:border-cyber-pink transition-colors cursor-pointer"
            title="Clear Log Terminal"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="flex-1 bg-black/90 p-3 rounded border border-cyber-purple/20 overflow-y-auto max-h-[300px] flex flex-col gap-2 scrollbar-thin">
        {audits.length === 0 ? (
          <div className="text-cyber-text/30 text-xs text-center my-auto font-mono">
            TERMINAL STANDBY // WAITING FOR INCOMING DATA STREAM...
          </div>
        ) : (
          audits.map((audit) => {
            const isCritical = audit.status === 'BYPASSED';
            return (
              <div
                key={audit.id}
                className={`text-[11px] p-2 rounded border transition-all ${
                  isCritical 
                    ? 'bg-cyber-pink/5 border-cyber-pink/40 animate-pulse' 
                    : 'bg-cyber-dark/40 border-cyber-purple/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-cyber-purple">{audit.timestamp}</span>
                    <span className="text-white font-bold bg-cyber-purple/20 px-1 rounded">{audit.id}</span>
                    <span className="text-cyber-pink font-bold">{audit.agency}</span>
                  </div>
                  <div className={`text-[10px] ${getStatusColor(audit.status)}`}>
                    {getStatusLabel(audit.status)}
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-cyber-text/80">
                  <div>
                    QUERY ACCESS TO: <span className="text-white underline font-bold">{audit.target}</span>
                  </div>
                  <div className="text-[10px] text-cyber-text/60 italic">
                    {audit.action}
                  </div>
                </div>

                {isCritical && (
                  <div className="mt-1 bg-cyber-pink/20 text-cyber-pink px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> CRITICAL ALERT: UNAUTHORIZED CREDENTIAL BYPASS DETECTED
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
