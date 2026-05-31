import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Key, LogOut, CheckCircle2, ShieldOff, Cpu, RefreshCw, Smartphone } from 'lucide-react';
import SurveillanceMap from './components/SurveillanceMap';
import ThreatMeter from './components/ThreatMeter';
import AuditFeed from './components/AuditFeed';
import AdminLogin from './components/AdminLogin';
import WhistleblowerPortal from './components/WhistleblowerPortal';

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPortal, setShowPortal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('wtw_admin_token') || null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [blockHeight, setBlockHeight] = useState(148291);
  const [viewReports, setViewReports] = useState([]);
  const [activeTab, setActiveTab] = useState('MAP'); // MAP, REPORTS (Admin only)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Increment local block height to look active
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(h => h + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Sync citizen reports state
  const loadReports = () => {
    const stored = localStorage.getItem('wtw_reports') || '[]';
    try {
      setViewReports(JSON.parse(stored));
    } catch (e) {
      setViewReports([]);
    }
  };

  useEffect(() => {
    loadReports();
    window.addEventListener('wtw_new_report', loadReports);
    return () => window.removeEventListener('wtw_new_report', loadReports);
  }, []);

  const connectWallet = async () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress('');
      return;
    }
    // Simulate Metamask wallet handshake
    setWalletConnected(true);
    setWalletAddress('0x99245eF876a3b2b9101ffC4B924523C4759cb8f1');
  };

  const handleAdminLogin = (token) => {
    setAdminToken(token);
    localStorage.setItem('wtw_admin_token', token);
    setShowLogin(false);
    loadReports();
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('wtw_admin_token');
    setActiveTab('MAP');
  };

  const handleApproveReport = (reportId) => {
    const stored = localStorage.getItem('wtw_reports') || '[]';
    try {
      const parsed = JSON.parse(stored);
      const updated = parsed.map(r => r.id === reportId ? { ...r, status: 'VERIFIED' } : r);
      localStorage.setItem('wtw_reports', JSON.stringify(updated));
      loadReports();
      window.dispatchEvent(new Event('wtw_new_report'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = (reportId) => {
    const stored = localStorage.getItem('wtw_reports') || '[]';
    try {
      const parsed = JSON.parse(stored);
      const updated = parsed.filter(r => r.id !== reportId);
      localStorage.setItem('wtw_reports', JSON.stringify(updated));
      loadReports();
      window.dispatchEvent(new Event('wtw_new_report'));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text scanline relative pb-12">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pixel-grid pointer-events-none z-0"></div>

      {/* Main Navbar */}
      <nav className="relative z-20 border-b border-cyber-purple/30 bg-cyber-dark/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-pink/15 border border-cyber-pink/40 rounded shadow-[0_0_10px_rgba(255,110,176,0.2)]">
              <Eye className="w-6 h-6 text-cyber-pink animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-widest text-glow-pink">
                  WATCH<span className="text-cyber-pink">THE</span>WATCHERS
                </h1>
                <span className="text-[9px] font-mono bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                  v1.0.0-BETA
                </span>
              </div>
              <p className="text-xs font-mono text-cyber-purple tracking-wide">
                "If they're watching you, you're watching them back."
              </p>
            </div>
          </div>

          {/* Blockchain Node / Network Status Bar */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-cyber-text/70">
            <div className="flex items-center gap-1.5 bg-black/50 border border-cyber-purple/20 px-2.5 py-1 rounded">
              <Cpu className="w-3.5 h-3.5 text-cyber-pink animate-spin" style={{ animationDuration: '6s' }} />
              <span>LEDGER HASH: <strong className="text-white">HARDHAT-NODE</strong></span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/50 border border-cyber-purple/20 px-2.5 py-1 rounded">
              <RefreshCw className="w-3 h-3 text-cyber-pink animate-spin" style={{ animationDuration: '10s' }} />
              <span>BLOCK HEIGHT: <strong className="text-white">{blockHeight}</strong></span>
            </div>

            <button
              onClick={connectWallet}
              className={`px-3 py-1 border rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                walletConnected
                  ? 'bg-cyber-green/20 border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                  : 'bg-cyber-purple/10 border-cyber-purple/50 text-cyber-text hover:border-cyber-pink hover:text-cyber-pink'
              }`}
            >
              {walletConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-cyber-green animate-pulse" />
                  CONNECTED: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </>
              ) : (
                <>
                  <Key className="w-3 h-3" /> CONNECT WALLET
                </>
              )}
            </button>

            {adminToken ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'MAP' ? 'REPORTS' : 'MAP')}
                  className="px-3 py-1 bg-cyber-purple/35 border border-cyber-purple text-cyber-text hover:border-cyber-pink hover:text-cyber-pink rounded font-bold cursor-pointer transition-all uppercase"
                >
                  {activeTab === 'MAP' ? 'ADMIN CONSOLE' : 'MAP REGISTRY'}
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="p-1 bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 rounded cursor-pointer transition-colors"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/40 text-cyber-text hover:border-cyber-pink hover:text-cyber-pink rounded font-bold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Key className="w-3 h-3" /> ADMIN GATEWAY
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 mt-6">
        {activeTab === 'REPORTS' && adminToken ? (
          /* Admin Reports Moderation Console */
          <div className="cyber-panel rounded-lg border border-cyber-purple/30 p-6 font-mono">
            <div className="flex items-center justify-between border-b border-cyber-purple/20 pb-3 mb-4">
              <h2 className="text-xl font-bold text-cyber-pink text-glow-pink">PENDING CITIZEN SUBMISSIONS</h2>
              <button
                onClick={() => setActiveTab('MAP')}
                className="text-xs text-cyber-text/60 hover:text-cyber-pink border border-cyber-purple/30 px-2 py-1 rounded cursor-pointer"
              >
                RETURN TO MAP
              </button>
            </div>

            {viewReports.length === 0 ? (
              <div className="text-center py-12 text-cyber-text/30 text-xs">
                NO CITIZEN SUBMISSIONS IN DATA PIPELINE // LEDGER SECURE.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {viewReports.map((report) => (
                  <div key={report.id} className="border border-cyber-purple/30 bg-cyber-dark/60 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink font-bold uppercase rounded">
                          {report.type}
                        </span>
                        <span className="text-xs text-cyber-text font-bold">{report.name}</span>
                        <span className="text-[10px] text-cyber-text/50">({report.id})</span>
                      </div>
                      <div className="text-xs text-cyber-text/80">{report.description}</div>
                      <div className="text-[10px] text-cyber-text/60 space-x-4">
                        <span><strong>LOCATION:</strong> {report.location}</span>
                        <span><strong>THREAT SCORE:</strong> {report.threatScore}/10</span>
                        <span><strong>TIMESTAMP:</strong> {report.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      {report.status !== 'VERIFIED' ? (
                        <button
                          onClick={() => handleApproveReport(report.id)}
                          className="flex-1 md:flex-none px-3 py-1.5 bg-cyber-green/20 border border-cyber-green text-cyber-green text-xs font-bold rounded cursor-pointer transition-all hover:bg-cyber-green/30"
                        >
                          VERIFY & POST
                        </button>
                      ) : (
                        <span className="text-xs px-2.5 py-1.5 bg-cyber-green/15 text-cyber-green border border-cyber-green/45 rounded font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> POSTED ON-CHAIN
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="flex-1 md:flex-none px-3 py-1.5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-bold rounded cursor-pointer transition-all hover:bg-red-500/20"
                      >
                        PURGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Main Dashboard Map View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Map Column (2/3 width on desktop) */}
            <div className="lg:col-span-2 flex flex-col">
              <SurveillanceMap
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                onReportClick={() => setShowPortal(true)}
              />
            </div>

            {/* Sidebar Column (1/3 width on desktop) */}
            <div className="flex flex-col gap-6">
              <div className="flex-1 min-h-[220px]">
                <ThreatMeter />
              </div>
              <div className="flex-1 min-h-[240px]">
                <AuditFeed />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Whistleblower Portal Modal */}
      {showPortal && (
        <WhistleblowerPortal
          onClose={() => setShowPortal(false)}
          onSubmitSuccess={() => {
            setShowPortal(false);
            loadReports();
          }}
        />
      )}

      {/* Admin Login Gateway Modal */}
      {showLogin && (
        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}
