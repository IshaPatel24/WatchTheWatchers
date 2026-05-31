import React, { useState } from 'react';
import { Key, User, Lock, ArrowRight, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([]);

  const addLog = (msg) => {
    setTerminalLogs((prev) => [...prev, `[LOG] ${new Date().toISOString().substring(11, 19)} // ${msg}`]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('CREDENTIALS REQ: USERNAME AND PASSWORD MANDATORY.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setTerminalLogs([]);

    addLog('INITIATING TRANSIT AUTH-HANDSHAKE...');
    await new Promise((r) => setTimeout(r, 600));

    addLog('SCRUBBING VISITOR DATA ENVELOPE...');
    await new Promise((r) => setTimeout(r, 500));

    addLog('RESOLVING LOCAL AGENT IDENTITY...');
    await new Promise((r) => setTimeout(r, 700));

    // For the hackathon, we allow 'admin' / 'sovereign_citizen_2026' as default credentials
    if (username === 'admin' && password === 'sovereign_citizen_2026') {
      addLog('CREDENTIAL VERIFICATION: COMPLETED SUCCESSFULLY.');
      await new Promise((r) => setTimeout(r, 400));
      
      addLog('GENERATING ACCESS SIGNATURES...');
      await new Promise((r) => setTimeout(r, 500));

      const fakeToken = 'wtw_jwt_token_decrypted_' + Math.random().toString(36).substring(2);
      addLog(`JWT SEC-KEY GENERATED: ${fakeToken.substring(0, 16)}...`);
      await new Promise((r) => setTimeout(r, 500));

      setIsSubmitting(false);
      onLoginSuccess(fakeToken);
    } else {
      addLog('ERROR: IDENTITY REJECTED. CREDENTIAL INSUFFICIENT OR MISMATCH.');
      setError('ACCESS DENIED: IDENTITY UNVERIFIED BY CENTRAL KEYSERVER.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg/90 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-md bg-cyber-dark/95 border border-cyber-pink/40 p-6 rounded-lg shadow-[0_0_30px_rgba(255,110,176,0.2)]">
        {/* Neon scanline */}
        <div className="cyber-scanner"></div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-cyber-pink/15 border border-cyber-pink/50 rounded-full mb-3 shadow-[0_0_15px_rgba(255,110,176,0.2)]">
            <Key className="w-6 h-6 text-cyber-pink animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-cyber-pink text-glow-pink">SECURE AUTH GATEWAY</h2>
          <p className="text-[10px] text-cyber-purple mt-1 uppercase font-bold tracking-widest">ADMINISTRATOR AUDITING ACCESS</p>
        </div>

        {/* Credentials hints for judges */}
        <div className="mb-4 bg-cyber-purple/10 border border-cyber-purple/30 p-2.5 rounded text-[10px] text-cyber-text/80 space-y-1">
          <div className="font-bold text-cyber-pink uppercase flex items-center gap-1">
            <Cpu className="w-3 h-3" /> DEMO PORTAL CREDENTIALS
          </div>
          <div>USERNAME: <code className="text-white bg-black/50 px-1 py-0.5 rounded font-bold">admin</code></div>
          <div>PASSWORD: <code className="text-white bg-black/50 px-1 py-0.5 rounded font-bold">sovereign_citizen_2026</code></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="text-[10px] font-bold text-cyber-purple block mb-1">AGENT IDENTIFICATION (USERNAME)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="ENTER AGENT NAME..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-black/60 border border-cyber-purple/40 text-white placeholder:text-cyber-text/30 pl-10 pr-4 py-2 rounded focus:outline-none focus:border-cyber-pink font-mono text-xs focus:ring-1 focus:ring-cyber-pink/30"
              />
              <User className="w-4 h-4 text-cyber-purple absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-cyber-purple block mb-1">ACCESS DECRYPTION KEY (PASSWORD)</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-black/60 border border-cyber-purple/40 text-white placeholder:text-cyber-text/30 pl-10 pr-4 py-2 rounded focus:outline-none focus:border-cyber-pink font-mono text-xs focus:ring-1 focus:ring-cyber-pink/30"
              />
              <Lock className="w-4 h-4 text-cyber-purple absolute left-3 top-2.5" />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-2.5 rounded text-[10px] font-bold flex items-start gap-1.5 animate-bounce">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Real-time Handshake Logs */}
          {terminalLogs.length > 0 && (
            <div className="bg-black border border-cyber-purple/20 p-2 rounded max-h-[100px] overflow-y-auto text-[9px] text-cyber-purple space-y-1">
              {terminalLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-cyber-purple/10 hover:bg-cyber-purple/25 border border-cyber-purple/40 text-cyber-text text-xs py-2 rounded transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-cyber-pink/20 hover:bg-cyber-pink/30 border border-cyber-pink text-cyber-pink font-bold text-xs py-2 rounded transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,110,176,0.2)] hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>AUTHENTICATING...</>
              ) : (
                <>
                  HANDSHAKE <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
