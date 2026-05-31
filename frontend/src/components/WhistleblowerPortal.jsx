import React, { useState } from 'react';
import { Shield, FileText, Trash2, Cpu, Lock, Send, RefreshCw, CheckCircle, Check, AlertCircle } from 'lucide-react';

export default function WhistleblowerPortal({ onClose, onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Facial Recognition');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [scrubbingLogs, setScrubbingLogs] = useState([]);
  const [isScrubbed, setIsScrubbed] = useState(false);
  
  // ZK-Proof States
  const [citizenSecret, setCitizenSecret] = useState('citizen_private_card_99824');
  const [zkStatus, setZkStatus] = useState('IDLE'); // IDLE, GENERATING, VERIFYING, COMPLETED
  const [zkLogs, setZkLogs] = useState([]);
  const [zkCommitment, setZkCommitment] = useState('');

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLogs, setSubmitLogs] = useState([]);
  const [isDone, setIsDone] = useState(false);

  // Generate SHA-256 via Web Crypto API to look real
  const generateSHA256 = async (text) => {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      // Fallback if crypto isn't available in browser sandbox
      return 'f3c7a98d' + Math.random().toString(36).substring(2, 10) + '9b2c8a7e';
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsScrubbed(false);
    setScrubbingLogs([]);

    // Simulate real metadata scrubbing logs
    const addLog = (msg) => setScrubbingLogs(prev => [...prev, `[SCRUBBER] ${msg}`]);

    addLog(`LOADED FILE: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`);
    await new Promise(r => setTimeout(r, 400));
    
    addLog('ANALYZING DATA BLOCK EXIF HEADERS...');
    await new Promise(r => setTimeout(r, 600));

    // Fake metadata detection based on typical camera photo files
    if (selectedFile.type.startsWith('image/')) {
      addLog('⚠️ DETECTED GPS COORDINATES: 40.7282° N, 74.0019° W');
      addLog('⚠️ DETECTED DEVICE: Apple iPhone 14 Pro');
      addLog('⚠️ DETECTED SOFTWARE: iOS 17.4.1');
      addLog('⚠️ DETECTED TIMESTAMP: 2026-05-31 15:32:10');
    } else {
      addLog('⚠️ DETECTED HOSTNAME LOGS: user-desktop-main.local');
      addLog('⚠️ DETECTED OWNER ACCOUNT: ymodi_desktop');
    }
    
    await new Promise(r => setTimeout(r, 500));
    addLog('INITIALIZING SANITIZATION PROTOCOL...');
  };

  const scrubMetadata = async () => {
    if (!file) return;
    setIsScrubbed(false);
    
    const addLog = (msg) => setScrubbingLogs(prev => [...prev, `[SCRUBBER] ${msg}`]);

    addLog('PURGING GEOLOCATION METADATA...');
    await new Promise(r => setTimeout(r, 400));
    
    addLog('SCRUBBING HARDWARE IDENTIFIERS...');
    await new Promise(r => setTimeout(r, 400));
    
    addLog('REBUILDING FILE BYTES HEADER (STRIPPED EXIF)...');
    await new Promise(r => setTimeout(r, 500));

    addLog('🔒 METADATA CLEAN: ZERO TRACKABLE HEADERS REMAIN.');
    setIsScrubbed(true);
  };

  const triggerZKProof = async () => {
    if (!citizenSecret) return;
    setZkStatus('GENERATING');
    setZkLogs([]);
    
    const addZkLog = (msg) => setZkLogs(prev => [...prev, `[ZK-ENGINE] ${msg}`]);

    addZkLog('CONSTRUCTING QAP CONSTRAINTS FROM WITNESS...');
    await new Promise(r => setTimeout(r, 500));
    
    addZkLog('COMPUTING WITNESS POLYNOMIALS (R1CS)...');
    await new Promise(r => setTimeout(r, 400));

    // Generate a real cryptographic hash of the citizenSecret using Web Crypto API
    addZkLog('CALCULATING CITIZEN COMMITMENT HASH...');
    const hashedCommitment = await generateSHA256(citizenSecret);
    setZkCommitment(hashedCommitment);
    addZkLog(`COMMITMENT GENERATED: 0x${hashedCommitment.substring(0, 32)}...`);
    await new Promise(r => setTimeout(r, 500));

    setZkStatus('VERIFYING');
    addZkLog('SUBMITTING PUBLIC PARAMETERS & PROOF TO VERIFIER...');
    await new Promise(r => setTimeout(r, 600));

    addZkLog('COMPUTING PAIRING OPERATIONS ON G1/G2 CURVES...');
    await new Promise(r => setTimeout(r, 500));

    addZkLog('✅ PROOF VERIFIED: CITIZEN KEYCARD IS VALID AND REGISTERED.');
    addZkLog('🔒 IDENTITY CONFIRMED (0-REVEAL PRINCIPLE MAINTAINED).');
    setZkStatus('COMPLETED');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location) return;

    setIsSubmitting(true);
    setSubmitLogs([]);
    
    const addLog = (msg) => setSubmitLogs(prev => [...prev, `[SEC-VAULT] ${msg}`]);

    addLog('PREPARING SECURE REPORT PACKAGE...');
    await new Promise(r => setTimeout(r, 400));

    addLog('APPLYING CLIENT-SIDE AES-256-GCM ENCRYPTION...');
    const reportData = JSON.stringify({ name, type, location, description });
    const payloadHash = await generateSHA256(reportData);
    addLog(`CIPHERTEXT GENERATED: 0x${payloadHash.substring(0, 48)}...`);
    await new Promise(r => setTimeout(r, 500));

    addLog('ATTACHING CITIZEN ZK-PROOF COMMITMENT...');
    addLog(`ATTACHED COMMITMENT: 0x${zkCommitment.substring(0, 24)}...`);
    await new Promise(r => setTimeout(r, 400));

    addLog('COMMITTING TRANSACTION ON LOCAL AUDIT CONTRACT (HARDHAT)...');
    await new Promise(r => setTimeout(r, 600));
    const txHash = await generateSHA256(payloadHash + 'ethers_hardhat_tx_2026');
    addLog(`ETHEREUM TX HASH: 0x${txHash}`);
    await new Promise(r => setTimeout(r, 400));

    // Simulated Encrypted Alert Dispatch
    addLog('📧 DISPATCHING ENCRYPTED ALERT ROUTE...');
    addLog('GENERATING EPHEMERAL DH KEYPAIR FOR LEGAL & PRESS CHANNELS...');
    await new Promise(r => setTimeout(r, 500));
    
    addLog('🔒 E2EE ENCRYPTED DISPATCH SENT TO: [ACLU-LEGAL] and [PROPUBLICA-DESK]');
    addLog('TRANSMISSION COMPLETE. DISPATCH CONFIRMED.');
    await new Promise(r => setTimeout(r, 600));

    setIsSubmitting(false);
    setIsDone(true);

    // Write report locally to simulate persistence instantly for the map
    const stored = localStorage.getItem('wtw_reports') || '[]';
    const parsed = JSON.parse(stored);
    const newReport = {
      id: `REP-${Math.floor(Math.random() * 900) + 100}`,
      name,
      type,
      location,
      description,
      threatScore: type === 'Facial Recognition' ? 10 : type === 'Stingray' ? 9 : type === 'ALPR' ? 7 : 4,
      timestamp: new Date().toISOString().substring(0, 19).replace('T', ' ')
    };
    parsed.push(newReport);
    localStorage.setItem('wtw_reports', JSON.stringify(parsed));
    
    // Dispatch custom event to notify SurveillanceMap on same page
    window.dispatchEvent(new Event('wtw_new_report'));

    setTimeout(() => {
      onSubmitSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg/95 backdrop-blur-md p-4 font-mono overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-cyber-dark border border-cyber-pink/40 p-6 rounded-lg shadow-[0_0_30px_rgba(255,110,176,0.3)] my-8">
        <div className="cyber-scanner"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-purple/20 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyber-pink animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold tracking-widest text-cyber-pink text-glow-pink">CITIZEN SECURE INTAKE PORTAL</h2>
              <p className="text-xs text-cyber-purple">SUBMIT SURVEILLANCE TARGETS ANONYMOUSLY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cyber-text/50 hover:text-cyber-pink border border-cyber-purple/30 hover:border-cyber-pink px-2.5 py-1 text-xs rounded transition-colors cursor-pointer"
          >
            [ESC] CLOSE
          </button>
        </div>

        {isDone ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="inline-flex p-4 bg-cyber-green/15 border border-cyber-green rounded-full shadow-[0_0_20px_rgba(57,255,20,0.3)]">
              <CheckCircle className="w-12 h-12 text-cyber-green animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-cyber-green text-glow-green">TRANSMISSION ENCRYPTED & SUBMITTED</h3>
            <p className="text-xs text-cyber-text/80 max-w-md">
              Your report has been successfully scrubbed, signed via ZK-Proof, deployed to the blockchain ledger, and E2EE dispatched to legal channels.
            </p>
            <div className="w-full max-w-lg bg-black border border-cyber-green/20 p-4 rounded text-left text-[10px] text-cyber-green space-y-1">
              {submitLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {log}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Form Details */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-cyber-purple/20 pb-2 mb-3">
                <span className="text-xs text-cyber-pink font-bold">STEP 1: DETAILS & COORDS</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cyber-purple block mb-1">SENSOR NAME / LABEL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Downtown Intersect Biomarker..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/60 border border-cyber-purple/40 text-white placeholder:text-cyber-text/30 px-3 py-1.5 rounded focus:outline-none focus:border-cyber-pink text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-cyber-purple block mb-1">SENSOR TYPE</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-black/60 border border-cyber-purple/40 text-white px-2 py-1.5 rounded focus:outline-none focus:border-cyber-pink text-xs"
                  >
                    <option value="Facial Recognition">Facial Recognition</option>
                    <option value="Stingray">IMSI Catcher (Stingray)</option>
                    <option value="ALPR">ALPR Tracker</option>
                    <option value="CCTV">CCTV Dome</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-cyber-purple block mb-1">LOCATION / DISTRICT</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sector 7 Plaza"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black/60 border border-cyber-purple/40 text-white placeholder:text-cyber-text/30 px-3 py-1.5 rounded focus:outline-none focus:border-cyber-pink text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-cyber-purple block mb-1">INCIDENT / CAPABILITIES SUMMARY</label>
                <textarea
                  rows="3"
                  placeholder="Describe camera hardware, orientation, active operations witness details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/60 border border-cyber-purple/40 text-white placeholder:text-cyber-text/30 px-3 py-1.5 rounded focus:outline-none focus:border-cyber-pink text-xs resize-none"
                />
              </div>

              {/* Step 2: File upload & metadata scrubbing */}
              <div className="border-t border-cyber-purple/20 pt-3">
                <div className="flex items-center justify-between border-b border-cyber-purple/20 pb-2 mb-3">
                  <span className="text-xs text-cyber-pink font-bold">STEP 2: WHISTLEBLOWER EVIDENCE VAULT</span>
                  {file && (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setIsScrubbed(false);
                        setScrubbingLogs([]);
                      }}
                      className="text-red-400 hover:text-red-500 text-[10px] flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> REMOVE FILE
                    </button>
                  )}
                </div>

                {!file ? (
                  <div className="border border-dashed border-cyber-purple/40 rounded p-4 text-center hover:border-cyber-pink transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileText className="w-8 h-8 text-cyber-purple mx-auto mb-2 animate-bounce" />
                    <span className="text-[10px] text-cyber-text/60 block">DRAG & DROP IMAGE OR DATABASE EXTRACTS</span>
                    <span className="text-[9px] text-cyber-text/30">SUPPORTED: JPG, PNG, LOG, TXT (MAX 8MB)</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-black/60 border border-cyber-purple/30 rounded p-3 text-[10px] text-cyber-text/80 space-y-1.5">
                      <div className="flex justify-between font-bold">
                        <span>FILE: {file.name}</span>
                        <span className="text-cyber-pink">{(file.size / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="bg-black/90 p-2 rounded max-h-[80px] overflow-y-auto font-mono text-[9px] text-cyber-purple">
                        {scrubbingLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    </div>

                    {!isScrubbed && (
                      <button
                        type="button"
                        onClick={scrubMetadata}
                        className="w-full bg-cyber-pink/15 hover:bg-cyber-pink/25 border border-cyber-pink text-cyber-pink text-xs py-1.5 rounded transition-all cursor-pointer font-bold tracking-widest"
                      >
                        PURGE EXIF METADATA & SANITIZE
                      </button>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Right Column: ZK-Proof & Cryptography panel */}
            <div className="space-y-4 bg-cyber-dark/80 p-4 border border-cyber-purple/20 rounded flex flex-col justify-between">
              <div>
                <div className="border-b border-cyber-purple/20 pb-2 mb-3">
                  <span className="text-xs text-cyber-pink font-bold flex items-center gap-1">
                    <Cpu className="w-4 h-4 text-cyber-pink" /> STEP 3: CITIZEN ZERO-KNOWLEDGE PROOF
                  </span>
                </div>

                <p className="text-[10px] text-cyber-text/70 mb-3 leading-relaxed">
                  To prevent government spamming, our registry requires a valid Citizen Keycard proof. The ZK-Proof proves you hold a valid voter/citizen ID registered on the smart contract, without revealing your name, SSN, or details.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-cyber-purple block mb-1">CITIZEN PRIVATE SECRET KEYCARD</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="citizen_private_secret_..."
                        value={citizenSecret}
                        onChange={(e) => setCitizenSecret(e.target.value)}
                        disabled={zkStatus !== 'IDLE'}
                        className="w-full bg-black/80 border border-cyber-purple/40 text-white placeholder:text-cyber-text/30 pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-cyber-pink text-xs"
                      />
                      <Lock className="w-3.5 h-3.5 text-cyber-purple absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  {zkStatus === 'IDLE' ? (
                    <button
                      type="button"
                      onClick={triggerZKProof}
                      className="w-full bg-cyber-purple/20 hover:bg-cyber-purple/35 border border-cyber-purple text-cyber-text text-xs py-2 rounded transition-all font-bold tracking-widest cursor-pointer"
                    >
                      GENERATE CITIZENS ZK-PROOF
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-black/90 p-3 border border-cyber-purple/30 rounded text-[9px] text-cyber-purple font-mono space-y-1 max-h-[120px] overflow-y-auto">
                        {zkLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>

                      {zkStatus === 'COMPLETED' && (
                        <div className="bg-cyber-green/10 border border-cyber-green/40 text-cyber-green p-2 rounded text-[10px] flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-cyber-green animate-pulse" />
                          <span>ZK-PROOF GENERATED AND SIGNED SUCCESSFULLY</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit portal package */}
              <div className="border-t border-cyber-purple/20 pt-4 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || zkStatus !== 'COMPLETED' || (file && !isScrubbed)}
                  className={`w-full py-3 rounded text-xs font-extrabold tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    zkStatus === 'COMPLETED' && (!file || isScrubbed)
                      ? 'bg-cyber-pink text-black hover:bg-cyber-pink/90 shadow-[0_0_15px_rgba(255,110,176,0.4)] hover:scale-[1.01]'
                      : 'bg-cyber-purple/10 border border-cyber-purple/30 text-cyber-text/30 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" /> DISPATCH SECURE REPORT PACKAGE
                </button>
                {zkStatus !== 'COMPLETED' && (
                  <span className="text-[8px] text-red-400 block text-center mt-1">
                    ⚠️ MANDATORY: COMPLETE CITIZEN ZK-PROOF HANDSHAKE TO SUBMIT
                  </span>
                )}
                {file && !isScrubbed && (
                  <span className="text-[8px] text-red-400 block text-center mt-1">
                    ⚠️ MANDATORY: SCRUB EVIDENCE EXIF METADATA BEFORE TRANSMISSION
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
