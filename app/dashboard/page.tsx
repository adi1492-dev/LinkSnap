'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { PreviewCard } from '@/components/preview-card';
import { 
  Link as LinkIcon, 
  Search, 
  Settings, 
  History, 
  Code, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Folder, 
  Tag as TagIcon,
  Globe,
  Loader2,
  Terminal,
  Activity,
  Bookmark,
  User as UserIcon,
  Lock,
  Mail,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

// Pure utility helper at module-level to decouple impure time calls from component hooks analysis
function getCurrentTime(): number {
  if (typeof window !== 'undefined' && window.performance) {
    return window.performance.now();
  }
  return Date.now();
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'api'>('home');
  const [isMounted, setIsMounted] = useState(false);
  const currentUser = useAppStore(state => state.currentUser);
  const logoutUser = useAppStore(state => state.logoutUser);

  useEffect(() => {
    // Only run on client after mount to prevent hydration mismatch
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">OG Preview</h1>
        </div>
        
        <nav className="px-4 py-2 space-y-1 flex-1">
          <NavItem 
            icon={<LinkIcon className="w-5 h-5" />} 
            label="Preview Builder" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <NavItem 
            icon={<History className="w-5 h-5" />} 
            label="History & Collections" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
          <NavItem 
            icon={<Terminal className="w-5 h-5" />} 
            label="API Dashboard" 
            active={activeTab === 'api'} 
            onClick={() => setActiveTab('api')} 
          />

          <div className="mt-8">
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                <Bookmark className="w-4 h-4 text-blue-500" />
                Bookmarklet
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Drag this button to your bookmarks bar to quickly preview any page you are on.
              </p>
              {isMounted ? (
                <div 
                  dangerouslySetInnerHTML={{
                    __html: `<a href="javascript:(function(){window.open('${window.location.origin}/dashboard?url='+encodeURIComponent(window.location.href));})();" class="mt-2 block w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-md text-xs font-medium text-center shadow-sm hover:bg-slate-950 transition-colors text-slate-50">Preview OG</a>`
                  }} 
                />
              ) : (
                <a href="#" className="mt-2 block w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-md text-xs font-medium text-center shadow-sm text-slate-50">Preview OG</a>
              )}
            </div>
          </div>
        </nav>

        {currentUser && (
          <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 flex items-center justify-between gap-2">
            <div className="truncate min-w-0">
              <p className="text-xs font-semibold text-slate-50 truncate">{currentUser.name}</p>
              <p className="font-mono text-[9px] text-slate-500 truncate mt-0.5">{currentUser.email}</p>
            </div>
            <button 
              onClick={() => logoutUser()} 
              title="Sign Out"
              className="text-slate-500 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'api' && <ApiDashboardTab />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-500/10 text-blue-400' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function HomeTab() {
  const [url, setUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [batchData, setBatchData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const addToHistory = useAppStore(state => state.addToHistory);

  // Initialize from URL param if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam && urlParam !== url) {
        // Just directly update if needed, but safe state assignment
        const t = setTimeout(() => setUrl(urlParam), 0);
        return () => clearTimeout(t);
      }
    }
  }, [url]);

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'single') {
      if (!url) return;
      setLoading(true);
      setData(null);

      try {
        let inputUrl = url;
        if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
          inputUrl = 'https://' + inputUrl;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/preview?url=${encodeURIComponent(inputUrl)}`);
        if (!res.ok) {
          throw new Error(`Failed with status: ${res.status}`);
        }
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json.data);
        addToHistory(inputUrl, json.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching the preview.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!batchUrls.trim()) return;
      setLoading(true);
      setBatchData([]);
      
      const urlsToProcess = batchUrls.split('\n').map(u => u.trim()).filter(Boolean);
      const results = [];
      
      for (const rawUrl of urlsToProcess) {
        try {
          let inputUrl = rawUrl;
          if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
            inputUrl = 'https://' + inputUrl;
          }
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/preview?url=${encodeURIComponent(inputUrl)}`);
          if (res.ok) {
            const json = await res.json();
            if (!json.error) {
              results.push({ url: inputUrl, data: json.data });
              addToHistory(inputUrl, json.data);
              continue;
            }
          }
          results.push({ url: rawUrl, error: 'Extraction failed' });
        } catch (e) {
          results.push({ url: rawUrl, error: 'Request failed' });
        }
      }
      
      setBatchData(results);
      setLoading(false);
    }
  };

  const codeSnippet = data ? `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed?url=${encodeURIComponent(data.url || url)}" width="100%" height="450" frameborder="0" scrolling="no"></iframe>` : '';

  const handleCopy = () => {
    if (codeSnippet) {
      navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 mb-2">Build a Preview</h2>
          <p className="text-slate-400">Paste any valid URL to extract and visualize its Open Graph metadata.</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setMode('single')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'single' ? 'bg-slate-900 shadow-sm text-slate-50' : 'text-slate-400'}`}>Single</button>
          <button onClick={() => setMode('batch')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'batch' ? 'bg-slate-900 shadow-sm text-slate-50' : 'text-slate-400'}`}>Batch Mode</button>
        </div>
      </div>

      <form onSubmit={handlePreview} className="relative w-full max-w-3xl">
        {mode === 'single' ? (
          <>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="block w-full pl-11 pr-32 py-4 text-base border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all outline-none border focus:ring-2"
              required
            />
            <div className="absolute inset-y-2 right-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center h-full px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
              </button>
            </div>
          </>
        ) : (
          <div className="relative">
            <textarea
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder="https://example.com/1&#10;https://example.com/2&#10;..."
              className="block w-full p-4 pb-16 text-base border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all outline-none border focus:ring-2 min-h-[150px]"
              required
            />
            <div className="absolute bottom-2 right-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center py-2 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Process Batch'}
              </button>
            </div>
          </div>
        )}
      </form>

      {error && mode === 'single' && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg max-w-3xl border border-red-500/20">
          <p className="font-semibold">Extraction Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {mode === 'batch' && batchData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {batchData.map((res, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="text-xs text-slate-400 mb-2 truncate">{res.url}</div>
              {res.error ? (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-lg text-sm">{res.error}</div>
              ) : (
                <div className="scale-90 origin-top-left w-[111%] h-[111%] -mb-4">
                  <PreviewCard data={res.data} url={res.url} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {mode === 'single' && data && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-8">
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Card Preview</h3>
            <div className="bg-slate-950/50 rounded-2xl p-8 border border-dashed border-slate-700 flex justify-center items-center" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
              <PreviewCard data={data} url={url} />
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 pt-6">Detailed Metadata Overview</h3>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden text-sm shadow-sm">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(data).filter(([, v]) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0)).map(([key, value]) => (
                    <tr key={key} className="hover:bg-slate-950 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-400 w-1/4 capitalize align-top whitespace-nowrap">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="py-3 px-4 text-slate-50 break-all align-top">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
             <h3 className="text-lg font-semibold border-b pb-2">Embed Code</h3>
             <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
               <div className="px-4 py-2 border-b border-slate-700 bg-gray-900/50 flex justify-between items-center">
                 <span className="text-xs font-mono text-slate-500">HTML Iframe</span>
                 <button onClick={handleCopy} className="text-slate-500 hover:text-white transition-colors">
                   {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
               <div className="p-4 overflow-x-auto">
                 <pre className="text-xs font-mono text-slate-400 leading-relaxed">
                   <code>{codeSnippet}</code>
                 </pre>
               </div>
             </div>

             <h3 className="text-lg font-semibold border-b pb-2 mt-8">Raw Metadata JSON</h3>
             <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
               <div className="p-4 overflow-x-auto max-h-64 overflow-y-auto">
                 <pre className="text-xs font-mono text-green-400 leading-relaxed">
                   <code>{JSON.stringify(data, null, 2)}</code>
                 </pre>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const history = useAppStore(state => state.history);
  const removeFromHistory = useAppStore(state => state.removeFromHistory);
  const updateHistoryItem = useAppStore(state => state.updateHistoryItem);
  const [search, setSearch] = useState('');
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  // Derive unique collections
  const collections = Array.from(new Set(history.map(h => h.collection).filter(Boolean))) as string[];

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.url.toLowerCase().includes(search.toLowerCase()) || 
      (item.data.title || '').toLowerCase().includes(search.toLowerCase());
    const matchesCollection = activeCollection ? item.collection === activeCollection : true;
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 mb-2">History & Collections</h2>
          <p className="text-slate-400">View and organize all your previously generated previews.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search entries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveCollection(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!activeCollection ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          All
        </button>
        {collections.map(col => (
          <button 
            key={col}
            onClick={() => setActiveCollection(col)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCollection === col ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {col}
          </button>
        ))}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-xl border border-dashed border-slate-700">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-50">No previews found</h3>
          <p className="text-slate-400 mt-1">Generate some previews to see them appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map(item => (
            <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              {item.data.image ? (
                <div className="h-40 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.data.image} alt={item.data.title || 'Preview'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 bg-slate-800 flex items-center justify-center">
                  <Globe className="w-8 h-8 opacity-20 text-slate-50" />
                </div>
              )}
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {item.data.favicon && (
                     /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.data.favicon} alt="" className="w-3 h-3 rounded-sm" />
                  )}
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {item.data.domain || new URL(item.url).hostname}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-50 text-sm line-clamp-2 leading-snug mb-1">
                  {item.data.title || item.url}
                </h4>
                <div className="mt-auto pt-4 flex items-center gap-2 flex-wrap text-xs">
                  {item.collection ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md">
                      <Folder className="w-3 h-3" /> {item.collection}
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        const col = prompt("Enter collection name:");
                        if (col) updateHistoryItem(item.id, col, item.tags);
                      }}
                      className="text-slate-500 hover:text-blue-500 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Collection
                    </button>
                  )}
                  {/* Tags */}
                  {item.tags.map(tag => (
                     <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 rounded-md">
                       <TagIcon className="w-3 h-3" /> {tag}
                     </span>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => removeFromHistory(item.id)}
                  className="bg-white/90 p-1.5 rounded-md text-red-600 hover:bg-red-500/10 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApiDashboardTab() {
  const apiKeys = useAppStore(state => state.apiKeys);
  const createApiKey = useAppStore(state => state.createApiKey);
  const deleteApiKey = useAppStore(state => state.deleteApiKey);
  const incrementUsage = useAppStore(state => state.incrementUsage);
  const currentUser = useAppStore(state => state.currentUser);
  const registerUser = useAppStore(state => state.registerUser);
  const loginUser = useAppStore(state => state.loginUser);
  const logoutUser = useAppStore(state => state.logoutUser);
  const apiLogs = useAppStore(state => state.apiLogs);
  const addApiLog = useAppStore(state => state.addApiLog);
  const clearLogs = useAppStore(state => state.clearLogs);

  // Auth States
  const [isRegistering, setIsRegistering] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard States
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [origin, setOrigin] = useState('https://api.example.com');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Playground States
  const [playgroundKeyId, setPlaygroundKeyId] = useState('');
  const [playgroundUrl, setPlaygroundUrl] = useState('https://stripe.com');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [playgroundLatency, setPlaygroundLatency] = useState<number | null>(null);
  const [playgroundStatusCode, setPlaygroundStatusCode] = useState<number | null>(null);

  // Docs tab state
  const [docsTab, setDocsTab] = useState<'quick' | 'endpoints' | 'snippets' | 'errors'>('quick');
  const [codeLang, setCodeLang] = useState<'curl' | 'js' | 'node' | 'python'>('curl');
  const [copiedCodeCode, setCopiedCodeCode] = useState(false);

  useEffect(() => {
    const originUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
    const timeout = setTimeout(() => {
      setOrigin(originUrl);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  // Filter keys and logs for logged-in user
  const userKeys = useMemo(() => {
    return currentUser ? apiKeys.filter(k => k.userId === currentUser.id) : [];
  }, [apiKeys, currentUser]);

  const userLogs = useMemo(() => {
    return currentUser ? apiLogs.filter(l => l.userId === currentUser.id) : [];
  }, [apiLogs, currentUser]);

  const totalRequests = userKeys.reduce((acc, k) => acc + k.requestsCount, 0);

  // Auto select key in playground when list changes
  useEffect(() => {
    if (userKeys.length > 0 && !playgroundKeyId) {
      const timeout = setTimeout(() => {
        setPlaygroundKeyId(userKeys[0].id);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [userKeys, playgroundKeyId]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (isRegistering) {
      const res = registerUser(authName, authEmail, authPassword);
      if (!res.success) {
        setAuthError(res.error || 'Registration failed.');
      } else {
        // Clear forms
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      }
    } else {
      const res = loginUser(authEmail, authPassword);
      if (!res.success) {
        setAuthError(res.error || 'Authentication failed.');
      } else {
        setAuthEmail('');
        setAuthPassword('');
      }
    }
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createApiKey(newKeyName);
    setNewKeyName('');
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKeyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const triggerPlaygroundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!playgroundKeyId) {
      setPlaygroundError('Please create and select an API Key first.');
      return;
    }

    const selectedKeyObj = userKeys.find(k => k.id === playgroundKeyId);
    if (!selectedKeyObj) {
      setPlaygroundError('Selected API Key is invalid.');
      return;
    }

    // Check rate limit quota
    if (totalRequests >= currentUser.quotaLimit) {
      setPlaygroundStatusCode(429);
      setPlaygroundLatency(12);
      setPlaygroundError('API Account Quota Exceeded (100 / 100). Please upgrade or write to support.');
      addApiLog({
        userId: currentUser.id,
        apiKey: selectedKeyObj.key,
        keyName: selectedKeyObj.name,
        url: playgroundUrl,
        status: 429,
        responseTime: 12,
        method: 'GET'
      });
      return;
    }

    setPlaygroundLoading(true);
    setPlaygroundError(null);
    setPlaygroundResult(null);
    setPlaygroundStatusCode(null);
    setPlaygroundLatency(null);

    const startTime = getCurrentTime();
    let target = playgroundUrl.trim();
    if (target && !target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/preview?url=${encodeURIComponent(target)}`, {
        headers: {
          'Authorization': `Bearer ${selectedKeyObj.key}`
        }
      });
      
      const duration = Math.round(getCurrentTime() - startTime);
      setPlaygroundLatency(duration);
      setPlaygroundStatusCode(res.status);

      const json = await res.json();
      
      // Increment active usage metrics
      incrementUsage(selectedKeyObj.id);

      if (!res.ok || json.error) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      setPlaygroundResult(json.data);

      addApiLog({
        userId: currentUser.id,
        apiKey: selectedKeyObj.key,
        keyName: selectedKeyObj.name,
        url: target,
        status: res.status,
        responseTime: duration,
        method: 'GET'
      });

    } catch (err: any) {
      const duration = Math.round(getCurrentTime() - startTime);
      setPlaygroundLatency(duration);
      setPlaygroundError(err.message || 'API request processed but extraction failed.');
      
      addApiLog({
        userId: currentUser.id,
        apiKey: selectedKeyObj.key,
        keyName: selectedKeyObj.name,
        url: target,
        status: playgroundStatusCode || 400,
        responseTime: duration,
        method: 'GET'
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const getDocCode = () => {
    const selectedKey = userKeys[0]?.key || 'YOUR_API_KEY';
    switch (codeLang) {
      case 'curl':
        return `curl -X GET "${origin}/api/preview?url=${encodeURIComponent(playgroundUrl)}"\n  -H "Authorization: Bearer ${selectedKey}"`;
      case 'js':
        return `// Browser Fetch API\nfetch("${origin}/api/preview?url=${encodeURIComponent(playgroundUrl)}", {\n  headers: {\n    "Authorization": "Bearer ${selectedKey}"\n  }\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
      case 'node':
        return `// Nodejs Axios Example\nconst axios = require('axios');\n\naxios.get('${origin}/api/preview', {\n  params: { url: '${playgroundUrl}' },\n  headers: { 'Authorization': 'Bearer ${selectedKey}' }\n})\n.then(response => {\n  console.log(response.data);\n});`;
      case 'python':
        return `# Python Requests Example\nimport requests\n\nurl = "${origin}/api/preview"\nheaders = {\n    "Authorization": "Bearer ${selectedKey}"\n}\nparams = {\n    "url": "${playgroundUrl}"\n}\n\nresponse = requests.get(url, headers=headers, params=params)\nprint(response.json())`;
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(getDocCode());
    setCopiedCodeCode(true);
    setTimeout(() => setCopiedCodeCode(false), 2000);
  };

  // Switch gate to Auth screen if logged out
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-50">Developer API Portal</h2>
          <p className="text-sm text-slate-400 mt-1">Register or sign in to generate secure API keys, monitor developer request logs, and access developer metrics.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-slate-800/50 bg-slate-950 text-sm font-medium">
            <button
              onClick={() => { setIsRegistering(false); setAuthError(null); }}
              className={`py-3.5 text-center transition-colors ${!isRegistering ? 'bg-slate-900 text-slate-50 border-b-2 border-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-100'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegistering(true); setAuthError(null); }}
              className={`py-3.5 text-center transition-colors ${isRegistering ? 'bg-slate-900 text-slate-50 border-b-2 border-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-100'}`}
            >
              Register Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
            {authError && (
              <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-lg border border-red-500/20 leading-relaxed font-medium">
                {authError}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Aditya Nikam"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all/css"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors mt-6 shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              {isRegistering ? 'Register & Generate API Keys' : 'Sign In To Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          Demo sandbox storage is isolated inside your browser&apos;s localStorage.<br />
          No external tracking is kept, maintaining high confidentiality.
        </p>
      </div>
    );
  }

  // Calculate percentage of quota used
  const quotaPercentage = Math.min((totalRequests / currentUser.quotaLimit) * 100, 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-50 mb-2">API Keys & Controls</h2>
          <p className="text-slate-400">Acquire endpoints, check authentication secrets, and trace interactive calls.</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-semibold text-sm uppercase">
            {currentUser.name[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-50 leading-none">{currentUser.name}</p>
            <p className="font-mono text-[10px] text-blue-500 mt-0.5 leading-none">{currentUser.email}</p>
          </div>
          <button 
            onClick={() => logoutUser()} 
            className="ml-2 text-blue-400 hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quota & Limit Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-slate-400 mb-3">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-50 text-sm tracking-tight">API Request Quota</h3>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-4xl font-extrabold text-slate-50">{totalRequests}</span>
              <span className="text-slate-500 font-medium">/ {currentUser.quotaLimit} queries</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${quotaPercentage >= 90 ? 'bg-red-500' : quotaPercentage >= 75 ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
              <span>{Math.round(quotaPercentage)}% used</span>
              <span>{currentUser.quotaLimit - totalRequests} remaining</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-slate-400 mb-3">
              <Code className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-50 text-sm tracking-tight">Active Access Keys</h3>
            </div>
            <p className="text-4xl font-extrabold text-slate-50 mt-2">{userKeys.length}</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal mt-4">
            Keys are stored offline locally. Revoke or build any key instantly.
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-slate-400 mb-3">
              <Settings className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-slate-50 text-sm tracking-tight">System Global Limits</h3>
            </div>
            <p className="text-2xl font-extrabold text-slate-50 mt-2">60 requests</p>
            <p className="text-xs text-purple-600 mt-0.5 font-medium">per key / minute window</p>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal mt-4">
            Emitted limits handle security thresholds and scrape loops protection.
          </p>
        </div>
      </div>

      {/* Key Manager Box */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-50 text-base">Secret Key Management</h3>
          <span className="text-xs bg-slate-800 text-slate-300 py-1 px-2.5 rounded-full font-medium">Require Bearer Auth</span>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleCreateKey} className="flex gap-3 mb-6">
            <input 
              type="text" 
              placeholder="Key description (e.g. Website Feed Client, Mobile App Dev)" 
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
              required
            />
            <button 
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-sm shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Issue Key
            </button>
          </form>

          {userKeys.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
              <Code className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No active API keys generated. Issue a key above to configure your clients.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800/50 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 w-1/4 font-semibold">Label</th>
                    <th className="pb-3 w-2/5 font-semibold">Key Identifier</th>
                    <th className="pb-3 w-1/5 font-semibold">Registered</th>
                    <th className="pb-3 w-1/10 text-center font-semibold">Calls</th>
                    <th className="pb-3 w-1/10 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {userKeys.map(k => {
                    const isKeyRevealed = revealedKeys[k.id];
                    return (
                      <tr key={k.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-4 font-semibold text-slate-50">{k.name}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <code className="px-2.5 py-1 bg-slate-800 text-slate-100 rounded font-mono text-xs max-w-xs block truncate">
                              {isKeyRevealed ? k.key : `${k.key.substring(0, 6)}••••••••••••••••••••••••`}
                            </code>
                            <button
                              onClick={() => toggleRevealKey(k.id)}
                              className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
                              title={isKeyRevealed ? 'Mask Token' : 'Reveal Token'}
                            >
                              {isKeyRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => copyKeyText(k.id, k.key)}
                              className="text-slate-500 hover:text-blue-500 p-1 rounded transition-colors relative"
                              title="Copy Token"
                            >
                              {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-slate-400 text-xs">{format(k.createdAt, 'MMM d, yyyy')}</td>
                        <td className="py-4 text-center font-semibold text-slate-200">{k.requestsCount}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => deleteApiKey(k.id)}
                            className="bg-transparent hover:bg-red-500/10 hover:text-red-600 text-slate-500 p-2 rounded-lg transition-colors ml-auto flex items-center justify-center"
                            title="Deactivate Secret Key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Interactive Playground (Our Live Scraper Console) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div className="border-b pb-3.5">
            <h3 className="font-semibold text-slate-50 text-base">API Playground (Live Client Scraper)</h3>
            <p className="text-xs text-slate-500 mt-1">Simulate real GET requests to the client metadata endpoints with your active API key secrets.</p>
          </div>

          <form onSubmit={triggerPlaygroundRequest} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Client Key</label>
                <select
                  value={playgroundKeyId}
                  onChange={(e) => setPlaygroundKeyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg text-xs outline-none bg-slate-900 font-mono"
                  required
                >
                  <option value="" disabled>Select API key</option>
                  {userKeys.map(k => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Url Parameter Target</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={playgroundUrl}
                    onChange={(e) => setPlaygroundUrl(e.target.value)}
                    placeholder="https://github.com"
                    className="flex-1 px-3 py-2 border border-slate-700 rounded-lg text-xs outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={playgroundLoading || userKeys.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs px-4 transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1"
                  >
                    {playgroundLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5" /> Scrape
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {playgroundError && (
            <div className="p-3 bg-red-500/10 text-red-400 text-xs rounded-lg border border-red-500/20 font-medium leading-relaxed mt-2 animate-in fade-in">
              {playgroundError}
            </div>
          )}

          {/* Trace metadata indicator */}
          {(playgroundLatency !== null || playgroundStatusCode !== null) && (
            <div className="flex gap-3 text-xs border rounded-lg p-2.5 bg-slate-950 text-slate-400 font-mono animate-in fade-in">
              {playgroundStatusCode !== null && (
                <span>
                  HTTP STATUS:{' '}
                  <span className={playgroundStatusCode === 200 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                    {playgroundStatusCode}
                  </span>
                </span>
              )}
              {playgroundLatency !== null && (
                <span>
                  RESPONSE TIME:{' '}
                  <span className="text-purple-600 font-bold">
                    {playgroundLatency}ms
                  </span>
                </span>
              )}
            </div>
          )}

          {playgroundResult && (
            <div className="space-y-2 mt-4 animate-in fade-in">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Response Meta Object (JSON)</span>
              <div className="bg-gray-950 rounded-xl overflow-hidden border border-slate-700">
                <div className="p-3 overflow-x-auto max-h-56 overflow-y-auto text-[11px] font-mono leading-relaxed text-green-400">
                  <pre>{JSON.stringify(playgroundResult, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Trace Monitor Logging Container */}
        <div className="lg:col-span-2 bg-gray-950 rounded-2xl border border-gray-900 shadow-xl flex flex-col overflow-hidden max-h-[420px]">
          <div className="px-4 py-3 border-b border-gray-900 bg-gray-950 text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-400">Live API Request Stream</span>
            </div>
            {userLogs.length > 0 && (
              <button 
                onClick={clearLogs}
                className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:text-white transition-colors py-1 px-2 rounded text-slate-500"
              >
                Clear Stream
              </button>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2.5 leading-relaxed bg-[#0b0f19]">
            {userLogs.length === 0 ? (
              <div className="text-center text-slate-300 py-16 flex flex-col items-center justify-center space-y-2">
                <Terminal className="w-8 h-8 opacity-25" />
                <p>Waiting for incoming requests...</p>
                <p className="text-[9px] text-slate-200">Submit requests in the playground to stream logs live</p>
              </div>
            ) : (
              userLogs.map(l => (
                <div key={l.id} className="border-b border-gray-900/50 pb-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between text-slate-500 text-[9px] items-center">
                    <span>{format(l.timestamp, 'HH:mm:ss.SSS')}</span>
                    <span className="px-1 py-0.5 rounded bg-gray-900/80 text-slate-400 font-semibold">{l.keyName}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-900/20 py-1 px-1.5 rounded text-white overflow-hidden text-ellipsis whitespace-nowrap">
                    <span className="text-cyan-400 font-bold shrink-0">{l.method}</span>
                    <span className="text-slate-500 truncate shrink min-w-0" title={l.url}>{l.url}</span>
                  </div>
                  <div className="flex gap-2.5 text-slate-400 text-[9px]">
                    <span>
                      STATUS:{' '}
                      <span className={l.status === 200 ? 'text-green-500 font-bold' : l.status === 429 ? 'text-amber-500 font-bold animate-pulse' : 'text-red-500 font-bold'}>
                        {l.status} {l.status === 200 ? 'OK' : l.status === 429 ? 'LIMIT' : 'ERROR'}
                      </span>
                    </span>
                    <span>•</span>
                    <span>LATENCY: <span className="text-purple-400 font-bold">{l.responseTime}ms</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Documentation and Guides Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-800 bg-slate-950">
          <div className="flex border-b border-slate-800 overflow-x-auto">
            <button
              onClick={() => setDocsTab('quick')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${docsTab === 'quick' ? 'border-blue-600 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Quick Start
            </button>
            <button
              onClick={() => setDocsTab('endpoints')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${docsTab === 'endpoints' ? 'border-blue-600 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Endpoints & Params
            </button>
            <button
              onClick={() => setDocsTab('snippets')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${docsTab === 'snippets' ? 'border-blue-600 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Code Snippets
            </button>
            <button
              onClick={() => setDocsTab('errors')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${docsTab === 'errors' ? 'border-blue-600 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Error Standard
            </button>
          </div>
        </div>

        <div className="p-6">
          {docsTab === 'quick' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h4 className="text-base font-bold text-gray-950">Getting Started with Link Preview API</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our ultra-fast Link Preview Scraper lets you easily fetch unified Open Graph tags, Twitter Cards, Article metadata, and domain icons from any webpage. Perfect for populating dashboard chat links, creating preview cards, and automating link indices.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="border border-gray-150 p-4 rounded-xl space-y-1.5 bg-slate-950/50">
                  <div className="font-semibold text-xs text-blue-500 tracking-wider uppercase font-semibold">Step 1</div>
                  <h5 className="font-bold text-sm text-slate-50">Issue Secret Access Key</h5>
                  <p className="text-xs text-slate-400 leading-normal">
                    Generate a key labelled for your specific target client or service under the Key Management block above.
                  </p>
                </div>

                <div className="border border-gray-150 p-4 rounded-xl space-y-1.5 bg-slate-950/50">
                  <div className="font-semibold text-xs text-blue-500 tracking-wider uppercase font-semibold">Step 2</div>
                  <h5 className="font-bold text-sm text-slate-50">Configure Web Authorization</h5>
                  <p className="text-xs text-slate-400 leading-normal">
                    Securely append your key with HTTP requests using the header: <br />
                    <code className="font-mono text-[10px] font-bold bg-slate-800 px-1 py-0.5 rounded text-slate-200 mt-1 block">Authorization: Bearer pk_...</code>
                  </p>
                </div>

                <div className="border border-gray-150 p-4 rounded-xl space-y-1.5 bg-slate-950/50">
                  <div className="font-semibold text-xs text-blue-500 tracking-wider uppercase font-semibold">Step 3</div>
                  <h5 className="font-bold text-sm text-slate-50">Parse Extracted JSON Response</h5>
                  <p className="text-xs text-slate-400 leading-normal">
                    Instantly capture details like standard page title, card description, high-res images, favicons, keywords, and types.
                  </p>
                </div>
              </div>
            </div>
          )}

          {docsTab === 'endpoints' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex gap-2 items-center">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-400 rounded-md">GET</span>
                <code className="font-mono text-xs font-semibold text-slate-50">/api/preview</code>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Send a secure GET payload requesting the metadata profile of any valid webpage. Supported request payload properties:
              </p>

              <div className="overflow-x-auto border border-slate-800 rounded-xl mt-3">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead className="bg-slate-950 text-slate-200 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    <tr>
                      <td className="p-3 font-mono font-semibold text-slate-50">url</td>
                      <td className="p-3 text-slate-500 font-medium">string</td>
                      <td className="p-3 text-red-600 font-semibold">YES</td>
                      <td className="p-3 text-slate-400">The url-encoded webpage URL you want to scrape metadata for. Fully supported schemes comprise both http and https.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold text-slate-50">api_key</td>
                      <td className="p-3 text-slate-500 font-medium">string</td>
                      <td className="p-3 font-medium">No (Header alternative)</td>
                      <td className="p-3 text-slate-400">Your secret API key. Passed alternatively in the URL query string as <code className="bg-slate-800 p-0.5 rounded font-mono text-[10px]">?api_key=pk_...</code>. The HTTP Bearer Header is heavily preferred.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {docsTab === 'snippets' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-slate-950 p-2 border border-slate-800 rounded-xl">
                <div className="flex gap-1.5 overflow-x-auto">
                  {(['curl', 'js', 'node', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`text-xs px-3 py-1.5 font-semibold rounded-md transition-colors ${codeLang === lang ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-50 hover:bg-gray-200/50'}`}
                    >
                      {lang === 'curl' ? 'cURL' : lang === 'js' ? 'Fetch API' : lang === 'node' ? 'Node Axios' : 'Python requests'}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={copyCodeToClipboard}
                  className="text-slate-400 hover:text-slate-50 py-1.5 px-3 rounded-md hover:bg-gray-200/50 text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {copiedCodeCode ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCodeCode ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="bg-gray-950 rounded-2xl border border-gray-900 overflow-hidden shadow-inner pt-4">
                <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-slate-400 select-all max-h-72">
                  <pre>{getDocCode()}</pre>
                </div>
              </div>
            </div>
          )}

          {docsTab === 'errors' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h4 className="text-base font-bold text-gray-950">Standard Errors Response Framework</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Requests fail gracefully with standard JSON payloads describing exactly the error boundary:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-red-500/20 p-4 rounded-xl bg-red-50/20 space-y-1">
                  <div className="font-mono text-xs text-red-600 font-bold">400 Bad Request / Invalid URL</div>
                  <p className="text-xs text-slate-400 leading-normal">
                    This triggers when the <code className="bg-slate-800 px-0.5 rounded text-[10px]">url</code> param is missing or fails formal format validation checks.
                  </p>
                </div>

                <div className="border border-amber-100 p-4 rounded-xl bg-amber-50/20 space-y-1">
                  <div className="font-mono text-xs text-amber-600 font-bold">401 Unauthorized Acccess</div>
                  <p className="text-xs text-slate-400 leading-normal">
                    This triggers when the API key Bearer authorization token is missing or has been revoked.
                  </p>
                </div>

                <div className="border border-purple-100 p-4 rounded-xl bg-purple-50/20 space-y-1">
                  <div className="font-mono text-xs text-purple-600 font-bold">429 Rate Limit / Quota Exceeded</div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Triggers when requesting over the standard per-minute threshold or exceeding user account daily quotas (100 queries).
                  </p>
                </div>

                <div className="border border-slate-800 p-4 rounded-xl bg-slate-950/50 space-y-1">
                  <div className="font-mono text-xs text-slate-200 font-bold">500 Server Scrapping Error</div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Triggers when the scraping parser encounters server errors, unresponsive sites, or cloud protection gates during fetch.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
