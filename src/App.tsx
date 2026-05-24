import { useState } from 'react';
import { 
  initialCategories, initialServices, initialOrders, initialTickets, 
  initialProviders, defaultSettings 
} from './data';
import { Category, Service, Order, Ticket, APIProvider, PlatformSettings } from './types';
import UserDashboard from './components/UserDashboard';
import AdminCenter from './components/AdminCenter';
import SourceViewer from './components/SourceViewer';
import { 
  Building2, Users, Layers, ShieldAlert, Sparkles, CreditCard, CheckCircle, 
  Info, Bell, HelpCircle, ArrowRight, Settings, ExternalLink, DownloadCloud
} from 'lucide-react';

export default function App() {
  // Global States synced across dashboard perspectives
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [providers, setProviders] = useState<APIProvider[]>(initialProviders);
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);

  // User Profile details
  const [userBalance, setUserBalance] = useState<number>(142.5080);
  const [userSpent, setUserSpent] = useState<number>(38.1050);
  const [apiKey, setApiKey] = useState<string>('c2d58066fba0401ba0171bd807e3240e');

  // Perspective states: 'user' | 'admin' | 'source'
  const [perspective, setPerspective] = useState<'user' | 'admin' | 'source'>('user');

  // Toast array state for premium real-time notifications
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'info' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleRegenerateApiKey = () => {
    const chars = '0123456789abcdef';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans antialiased relative selection:bg-purple-500/30 selection:text-purple-300">
      
      {/* Dynamic Floating Toast Box */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-xl border shadow-2xl animate-fade-in transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
              : 'bg-purple-950/90 border-purple-500/30 text-purple-300'
          }`}
          id="global-toast-el"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
          )}
          <span className="text-xs font-medium font-sans">{toast.message}</span>
        </div>
      )}

      {/* Background radial glowing ambient grids */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none select-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none select-none"></div>

      <div className="relative flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* PREMIUM UPPER DISCLAIMER WARNING HEADER */}
        <div className="mb-4 p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-purple-400 font-bold shrink-0">🎁 DIRECT PHP DOWNLOAD AVAILABLE:</span>
            <p className="leading-relaxed font-sans text-slate-400">
              The exact cPanel production files you requested (<code>index.php</code>, <code>database.sql</code>, <code>cron.php</code>, <code>api.php</code>) are fully scripted inside the directory.
            </p>
          </div>
          <div className="flex items-center gap-2 block shrink-0">
            <span className="text-slate-400">Click</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-white font-mono border border-slate-700 font-semibold flex items-center gap-1">
              <Settings className="w-3 h-3 text-purple-400" /> Settings → Export to ZIP
            </span>
            <span className="text-slate-400">above.</span>
          </div>
        </div>

        {/* WEBSITE HEADER BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 mb-6 border-b border-slate-850">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-purple-600/20 glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-100 tracking-tight flex items-center gap-2">
                {settings.siteName.split(' ')[0]} 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 font-mono font-medium tracking-wide">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-sans tracking-wider uppercase">High-Speed Downstream SMM API Console</p>
            </div>
          </div>

          {/* Perspective Swapping Navigator tab grids */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-850 rounded-xl select-none">
            <button
              onClick={() => setPerspective('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                perspective === 'user' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="switch-user-mode-btn"
            >
              <span>User Panel</span>
            </button>

            <button
              onClick={() => setPerspective('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                perspective === 'admin' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="switch-admin-mode-btn"
            >
              <span>Admin Panel</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 py-0.2 rounded uppercase">live</span>
            </button>

            <button
              onClick={() => setPerspective('source')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                perspective === 'source' 
                  ? 'bg-purple-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="switch-source-mode-btn"
            >
              <DownloadCloud className="w-3.5 h-3.5 shrink-0 text-purple-400" />
              <span>PHP Code Explorer</span>
            </button>
          </div>

        </header>

        {/* PRIMARY MAIN GRID AND WORKSPACE CARDS */}
        <main className="flex-1">
          {perspective === 'user' && (
            <UserDashboard 
              categories={categories}
              services={services}
              orders={orders}
              tickets={tickets}
              settings={settings}
              userBalance={userBalance}
              userSpent={userSpent}
              apiKey={apiKey}
              onSetUserBalance={setUserBalance}
              onSetUserSpent={setUserSpent}
              onSetOrders={setOrders}
              onSetTickets={setTickets}
              onNotify={triggerNotification}
              onRegenerateKey={handleRegenerateApiKey}
            />
          )}

          {perspective === 'admin' && (
            <AdminCenter 
              categories={categories}
              services={services}
              orders={orders}
              tickets={tickets}
              providers={providers}
              settings={settings}
              onSetCategories={setCategories}
              onSetServices={setServices}
              onSetOrders={setOrders}
              onSetTickets={setTickets}
              onSetProviders={setProviders}
              onSetSettings={setSettings}
              onNotify={triggerNotification}
            />
          )}

          {perspective === 'source' && (
            <SourceViewer onNotify={triggerNotification} />
          )}
        </main>

        {/* WEBSITE FOOTER SECTION */}
        <footer className="mt-12 py-6 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sans gap-4 shrink-0">
          <div className="flex items-center gap-1">
            <span>© 2026 {settings.siteName}. Designed and styled like LuvSMM.</span>
          </div>

          <div className="flex gap-4">
            <span className="text-slate-600">Secure Database Sandboxed</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400 font-medium">PHP 8 Core Standard</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
