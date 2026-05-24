import React, { useState } from 'react';
import { Category, Service, Order, Ticket, APIProvider, PlatformSettings } from '../types';
import { 
  Building2, Users, Layers, ShoppingBag, DollarSign, Plus, Settings, 
  CheckCircle2, AlertCircle, RefreshCw, Send, Trash2, Edit, Link, Check, ToggleLeft, ToggleRight
} from 'lucide-react';

interface AdminCenterProps {
  categories: Category[];
  services: Service[];
  orders: Order[];
  tickets: Ticket[];
  providers: APIProvider[];
  settings: PlatformSettings;
  onSetCategories: (cats: Category[]) => void;
  onSetServices: (srvs: Service[]) => void;
  onSetOrders: (ords: Order[]) => void;
  onSetTickets: (tks: Ticket[]) => void;
  onSetProviders: (provs: APIProvider[]) => void;
  onSetSettings: (setts: PlatformSettings) => void;
  onNotify: (msg: string, type: 'success' | 'info') => void;
}

export default function AdminCenter({
  categories,
  services,
  orders,
  tickets,
  providers,
  settings,
  onSetCategories,
  onSetServices,
  onSetOrders,
  onSetTickets,
  onSetProviders,
  onSetSettings,
  onNotify
}: AdminCenterProps) {
  
  const [activeTab, setActiveTab] = useState<'stats' | 'services' | 'orders' | 'tickets' | 'configs'>('stats');
  
  // States representing admin edit modals
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editMin, setEditMin] = useState<string>('');
  const [editMax, setEditMax] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedProviderSrvId, setSelectedProviderSrvId] = useState<string>('');
  
  // Ticket replying administrative states
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [adminReplyText, setAdminReplyText] = useState<string>('');

  // SMM Provider parameters admin addition
  const [newProvName, setNewProvName] = useState('');
  const [newProvUrl, setNewProvUrl] = useState('');
  const [newProvKey, setNewProvKey] = useState('');

  // Calculate high-stats metric outputs
  const platformSpendsSum = orders.reduce((acc, current) => acc + current.charge, 0);
  
  // Simulate reseller cost downstream payouts to estimate baseline platform net gains
  const platformProfitsMargin = orders.reduce((acc, current) => {
    const srv = services.find(s => s.id === current.serviceId);
    if (!srv) return acc + current.charge * 0.25; // fallback
    const costPerItem = srv.originalPrice;
    const clientSellingPrice = srv.price;
    const unitProfit = clientSellingPrice - costPerItem;
    const computedProfit = (unitProfit / 1000) * current.quantity;
    return acc + (current.status === 'completed' ? computedProfit : 0);
  }, 0);

  // Status transitions
  const handleOrderStatusChange = (orderId: number, nextStatus: Order['status']) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        onNotify(`Order #${orderId} state shifted to ${nextStatus}`, 'success');
        return { ...ord, status: nextStatus };
      }
      return ord;
    });
    onSetOrders(updated);
  };

  // Simulate pushing manual or pending orders downstream to API Provider
  const triggerProviderApiPlacementSimulation = (orderId: number) => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;
    
    // Check if service is linked to provider
    const srv = services.find(s => s.id === ord.serviceId);
    if (!srv || !srv.apiProviderId) {
      onNotify(`Order #${orderId} is manual. Link to a Provider API first.`, 'info');
      return;
    }

    const linkedProv = providers.find(p => p.id === srv.apiProviderId);
    if (!linkedProv) return;

    onNotify(`cURL: Submitting to ${linkedProv.name}...`, 'info');

    setTimeout(() => {
      const mockDownstreamId = Math.floor(100000 + Math.random() * 900000);
      const updated = orders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'processing' as const,
            apiOrderId: mockDownstreamId,
          };
        }
        return o;
      });
      onSetOrders(updated);
      onNotify(`Success! Downstream order placed. ID: ${mockDownstreamId}`, 'success');
    }, 1200);
  };

  // Toggle Service Activation Active/Inactive
  const handleServiceToggle = (id: number) => {
    const updated = services.map(s => {
      if (s.id === id) {
        const nextState = s.status === 'active' ? 'inactive' : 'active';
        onNotify(`Service "${s.name}" set to ${nextState}`, 'success');
        return { ...s, status: nextState as any };
      }
      return s;
    });
    onSetServices(updated);
  };

  // Trigger service modifications commit
  const handleServiceSave = (id: number) => {
    const priceNum = parseFloat(editPrice);
    const minNum = parseInt(editMin);
    const maxNum = parseInt(editMax);

    if (isNaN(priceNum) || isNaN(minNum) || isNaN(maxNum) || priceNum <= 0 || minNum <= 0 || maxNum <= 0) {
      onNotify('Ensure value params are correct.', 'info');
      return;
    }

    const updated = services.map(s => {
      if (s.id === id) {
        return {
          ...s,
          price: priceNum,
          minQuantity: minNum,
          maxQuantity: maxNum,
          apiProviderId: selectedProvider ? parseInt(selectedProvider) : null,
          apiServiceId: selectedProviderSrvId ? parseInt(selectedProviderSrvId) : null,
        };
      }
      return s;
    });

    onSetServices(updated);
    setEditingServiceId(null);
    onNotify('Service properties successfully administrative updated!', 'success');
  };

  // Support Ticket replying simulator
  const submitAdminReply = (ticketId: number) => {
    if (!adminReplyText.trim()) return;

    const targetTix = tickets.find(t => t.id === ticketId);
    if (!targetTix) return;

    const nextReply = {
      id: targetTix.replies.length + 1,
      author: 'admin' as const,
      message: adminReplyText,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'answered' as const,
          replies: [...t.replies, nextReply]
        };
      }
      return t;
    });

    onSetTickets(updated);
    setAdminReplyText('');
    onNotify('Administrative Ticket reply recorded.', 'success');
  };

  // Add new external provider variables
  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName || !newProvUrl || !newProvKey) {
      onNotify('Please declare all provider parameters.', 'info');
      return;
    }

    const newPrv = {
      id: providers.length + 1,
      name: newProvName,
      apiUrl: newProvUrl,
      apiKey: newProvKey,
      balance: 100.0000,
      status: 'active' as const
    };

    onSetProviders([...providers, newPrv]);
    setNewProvName('');
    setNewProvUrl('');
    setNewProvKey('');
    onNotify(`API Provider "${newProvName}" initialized!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Visual Admin Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-purple-400" />
          <div>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono font-medium">ADMIN MODE</span>
            <h2 className="font-display font-semibold text-lg text-slate-100 mt-0.5">LuvSMM Pro Operations Controller</h2>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1">
          {[
            { id: 'stats', label: 'Overview', icon: DollarSign },
            { id: 'services', label: 'Markup & Services', icon: Layers },
            { id: 'orders', label: 'Monitor Orders', icon: ShoppingBag },
            { id: 'tickets', label: 'Support Queue', icon: Users },
            { id: 'configs', label: 'Config / API Nodes', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setEditingServiceId(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/10' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
                id={`admin-nav-${tab.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ADMIN OVERVIEW PANELS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <span className="text-xs font-medium font-sans text-slate-400 uppercase tracking-wider block">Platform Gross Spends</span>
              <span className="text-2xl font-display font-semibold text-slate-100 block mt-1">
                {settings.siteCurrencySymbol}{platformSpendsSum.toFixed(4)}
              </span>
              <p className="text-xs text-rose-400 inline-flex items-center gap-1 mt-2">
                💵 Across all client accounts
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden glow-purple">
              <span className="text-xs font-medium font-sans text-slate-400 uppercase tracking-wider block">Estimated Net Profit</span>
              <span className="text-2xl font-display font-semibold text-purple-400 block mt-1">
                {settings.siteCurrencySymbol}{platformProfitsMargin.toFixed(4)}
              </span>
              <p className="text-xs text-emerald-400 inline-flex items-center gap-1 mt-2">
                📈 Based on your markup rates
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <span className="text-xs font-medium font-sans text-slate-400 uppercase tracking-wider block">API Orders Submitted</span>
              <span className="text-2xl font-display font-semibold text-white block mt-1">
                {orders.filter(o => o.apiProviderId !== null).length}
              </span>
              <p className="text-xs text-cyan-400 inline-flex items-center gap-1 mt-2">
                ⚡ Linked downstream
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <span className="text-xs font-medium font-sans text-slate-400 uppercase tracking-wider block">Unanswered Tickets</span>
              <span className="text-2xl font-display font-semibold text-rose-400 block mt-1">
                {tickets.filter(t => t.status === 'open' || t.status === 'pending').length}
              </span>
              <p className="text-xs text-slate-400 inline-flex items-center gap-1 mt-2">
                👥 Attention needed
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <h3 className="font-display font-semibold text-lg text-slate-100 mb-2">Operational Insights</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Below are active nodes that coordinate user orders on your SMM platform setup. Changes to margins or API endpoints map instantly across the client frontend.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-lg">
                <h4 className="font-mono text-xs uppercase tracking-widest text-purple-400 mb-2 font-semibold">PROVIDER CONNECT INTEGRITY</h4>
                <div className="space-y-2">
                  {providers.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">${p.balance.toFixed(2)}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">LIVE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-lg">
                <h4 className="font-mono text-xs uppercase tracking-widest text-cyan-400 mb-2 font-semibold">SYSTEM COEFFICIENTS</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">BASE MARGINS</span>
                    <span className="text-slate-200 mt-1 block font-medium">35% markup average</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DATABASE STATUS</span>
                    <span className="text-emerald-400 mt-1 block font-medium">Connected (Active)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SERVICES MANAGER & MARKUP PANEL */}
      {activeTab === 'services' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-100 text-sm">Products & Markup Managers</h3>
              <p className="text-xs text-slate-400 mt-0.5">Control selling prices, toggle active packages, and map downstream services ids.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-850 font-mono text-xs text-slate-400 uppercase">
                  <th className="py-3 px-5">ID / Service</th>
                  <th className="py-3 px-5">Provider Cost</th>
                  <th className="py-3 px-5">Selling Price</th>
                  <th className="py-3 px-5">Profit Margin</th>
                  <th className="py-3 px-5">API Connector</th>
                  <th className="py-3 px-5">State Toggle</th>
                  <th className="py-3 px-5 text-right w-[110px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {services.map(srv => {
                  const srvCategory = categories.find(c => c.id === srv.categoryId);
                  const isEditing = editingServiceId === srv.id;
                  const unitProfit = srv.price - srv.originalPrice;
                  const marginPercent = ((unitProfit / srv.price) * 100).toFixed(0);

                  return (
                    <tr key={srv.id} className="hover:bg-slate-950/20 transition-all duration-150">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-200">{srv.name}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1.5 font-mono">
                          <span>ID: {srv.id}</span>
                          <span>•</span>
                          <span className="text-purple-400 font-sans">{srvCategory?.name || 'Manual Category'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-mono text-slate-400">
                        {settings.siteCurrencySymbol}{srv.originalPrice.toFixed(4)}
                      </td>

                      <td className="py-3.5 px-5 font-mono">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">{settings.siteCurrencySymbol}</span>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              className="w-16 px-1.5 py-1 bg-slate-950 text-slate-100 border border-slate-700 rounded font-mono text-xs"
                              placeholder="Rate"
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            {settings.siteCurrencySymbol}{srv.price.toFixed(4)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                          unitProfit >= 0.50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          +{marginPercent}% ({settings.siteCurrencySymbol}{unitProfit.toFixed(3)} net/K)
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-mono">
                        {isEditing ? (
                          <div className="space-y-1">
                            <select
                              value={selectedProvider}
                              onChange={e => setSelectedProvider(e.target.value)}
                              className="w-full text-[10px] bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-slate-300"
                            >
                              <option value="">Manual (No API)</option>
                              {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            {selectedProvider && (
                              <input
                                type="number"
                                value={selectedProviderSrvId}
                                onChange={e => setSelectedProviderSrvId(e.target.value)}
                                className="w-full px-1.5 py-0.5 bg-slate-950 text-slate-100 border border-slate-700 rounded text-[10px] font-mono"
                                placeholder="Ext. Service ID"
                              />
                            )}
                          </div>
                        ) : srv.apiProviderId ? (
                          <div className="flex items-center gap-1.5 text-purple-400">
                            <Link className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>ID #{srv.apiServiceId} (API)</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Manual Mode</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleServiceToggle(srv.id)}
                          className="focus:outline-none"
                          id={`toggle-srv-${srv.id}`}
                        >
                          {srv.status === 'active' ? (
                            <div className="flex items-center gap-1 text-emerald-400 font-medium">
                              <ToggleLeft className="w-5 h-5 text-emerald-400 transform rotate-180 transition-all" />
                              <span>Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-500">
                              <ToggleLeft className="w-5 h-5 text-slate-700 transition-all" />
                              <span>Inactive</span>
                            </div>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-right font-mono">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleServiceSave(srv.id)}
                              className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                              title="Save Changes"
                              id={`save-srv-${srv.id}`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingServiceId(null)}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                              title="Cancel"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingServiceId(srv.id);
                              setEditPrice(srv.price.toString());
                              setEditMin(srv.minQuantity.toString());
                              setEditMax(srv.maxQuantity.toString());
                              setSelectedProvider(srv.apiProviderId?.toString() || '');
                              setSelectedProviderSrvId(srv.apiServiceId?.toString() || '');
                            }}
                            className="bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded inline-flex items-center gap-1 text-[10px] text-slate-300 transition"
                            id={`edit-srv-${srv.id}`}
                          >
                            <Edit className="w-3 h-3 text-purple-400" />
                            <span>Configure</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MONITOR SYSTEM ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800">
            <h3 className="font-display font-semibold text-slate-100 text-sm">Centralized SMM Orders Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control order execution metrics, mock automatic status sync cron updates, and view client pipelines.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-850 font-mono text-xs text-slate-400">
                  <th className="py-3 px-5">ID / User</th>
                  <th className="py-3 px-5">Service / Target link</th>
                  <th className="py-3 px-5">Total Charge</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">API Provider Response</th>
                  <th className="py-3 px-5 text-right w-[200px]">Interactive override actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {orders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-950/20">
                    <td className="py-3 px-5 font-mono">
                      <div className="text-slate-200">#{ord.id}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ord.username}</div>
                    </td>

                    <td className="py-3 px-5">
                      <div className="font-medium text-slate-300 max-w-[240px] truncate">{ord.serviceName}</div>
                      <div className="text-cyan-400 text-[10px] mt-0.5 truncate max-w-[240px]">
                        <a href={ord.link} target="_blank" rel="noreferrer" className="hover:underline">{ord.link}</a>
                      </div>
                    </td>

                    <td className="py-3 px-5 font-mono">
                      <div className="text-slate-100">{settings.siteCurrencySymbol}{ord.charge.toFixed(4)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ord.quantity.toLocaleString()} quantity</div>
                    </td>

                    <td className="py-3 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                        ord.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        ord.status === 'inprogress' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        ord.status === 'processing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        ord.status === 'canceled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-5 font-mono">
                      {ord.apiOrderId ? (
                        <div className="space-y-0.5 text-[10px]">
                          <div className="text-purple-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>External ID: {ord.apiOrderId}</span>
                          </div>
                          <span className="text-slate-500">Source: {ord.source.toUpperCase()}</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-slate-500 italic block">Local queue</span>
                          {ord.status === 'pending' && (
                            <button
                              onClick={() => triggerProviderApiPlacementSimulation(ord.id)}
                              className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-[9px] rounded font-sans inline-flex items-center gap-1 transition"
                              id={`push-api-${ord.id}`}
                            >
                              <RefreshCw className="w-2.5 h-2.5 animate-spin-hover" />
                              <span>Submit to API</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-5 text-right">
                      {/* State overriding dashboard */}
                      <div className="inline-flex flex-wrap gap-1 justify-end">
                        {['inprogress', 'completed', 'canceled'].map(st => {
                          if (ord.status === st) return null;
                          return (
                            <button
                              key={st}
                              onClick={() => handleOrderStatusChange(ord.id, st as any)}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-mono border border-slate-700 rounded transition"
                              id={`override-ord-${ord.id}-${st}`}
                            >
                              {st.substring(0, 4).toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUPPORT TICKETS WORKSPACE */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="font-display font-semibold text-slate-100 text-sm mb-4">Support Inquiry Tickets</h3>
            <div className="space-y-2.5">
              {tickets.map(tix => {
                const openReplies = tix.status === 'open' || tix.status === 'pending';
                return (
                  <button
                    key={tix.id}
                    onClick={() => setSelectedTicketId(tix.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all duration-200 block ${
                      selectedTicketId === tix.id
                        ? 'bg-purple-500/5 border-purple-500/30'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/20'
                    }`}
                    id={`admin-tix-row-${tix.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400 font-mono text-[10px]">#{tix.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${
                        tix.status === 'answered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        tix.status === 'open' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {tix.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-sans font-medium text-slate-200 text-xs mt-1.5 truncate">{tix.subject}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Submitted by: <strong className="text-slate-300">{tix.username}</strong></p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedTicketId ? (
              (() => {
                const tix = tickets.find(t => t.id === selectedTicketId);
                if (!tix) return null;
                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="font-display font-semibold text-sm text-slate-200">{tix.subject}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Ticket #{tix.id} • Customer Username: <span className="text-purple-400">{tix.username}</span></p>
                      </div>
                      <select
                        value={tix.status}
                        onChange={(e) => {
                          const updated = tickets.map(t => t.id === tix.id ? { ...t, status: e.target.value as any } : t);
                          onSetTickets(updated);
                          onNotify(`Ticket #${tix.id} mark status changed to ${e.target.value}`, 'success');
                        }}
                        className="bg-slate-950 text-slate-300 text-xs py-1 px-2 border border-slate-800 rounded outline-none"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="answered">Answered</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Chat log displays */}
                    <div className="flex-1 p-5 overflow-y-auto bg-slate-950/40 space-y-3">
                      {tix.replies.map(rep => {
                        const isAdmin = rep.author === 'admin';
                        return (
                          <div key={rep.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3.5 max-w-[80%] rounded-xl text-xs space-y-1 ${
                              isAdmin 
                                ? 'bg-purple-600/90 text-white rounded-tr-none' 
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            }`}>
                              <span className="font-mono text-[9px] opacity-60 block">
                                {isAdmin ? 'ADMINISTRATOR' : tix.username.toUpperCase()}
                              </span>
                              <p className="leading-relaxed whitespace-pre-line">{rep.message}</p>
                              <span className="text-[8px] opacity-40 block text-right">
                                {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat replies console inputs */}
                    <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                      <div className="flex gap-2">
                        <textarea
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Type out official support message to customer..."
                          rows={2}
                          className="flex-1 p-2 bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-purple-500/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 outline-none resize-none transition-all"
                          id="admin-reply-input"
                        />
                        <button
                          onClick={() => submitAdminReply(tix.id)}
                          className="px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium text-xs flex items-center justify-center transition"
                          id="admin-reply-submit"
                        >
                          <Send className="w-4 h-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-xl h-[500px] flex flex-col justify-center items-center text-slate-500">
                <Users className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Select support ticket from queue timeline pane to inspect dialogue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PLATFORM CONFIGS / PROVIDERS SETTINGS */}
      {activeTab === 'configs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* General App Properties */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-400" /> Platform Configuration
            </h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Website Banner Title</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={e => onSetSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-lg text-slate-100 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Currency Accent</label>
                  <input
                    type="text"
                    value={settings.siteCurrencySymbol}
                    onChange={e => onSetSettings({ ...settings, siteCurrencySymbol: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-lg text-slate-100 font-mono outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Support Tickets</label>
                  <select
                    value={settings.ticketSystemStatus}
                    onChange={e => onSetSettings({ ...settings, ticketSystemStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-lg text-slate-300 outline-none transition"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block leading-relaxed mt-2 p-3 bg-slate-950 text-[11px] rounded border border-slate-850">
                  ⚠️ Note: These values synchronize instantly across user interfaces. Production system properties write credentials inside your `/config.php` templates file.
                </span>
              </div>
            </div>
          </div>

          {/* Connected API Nodes Providers */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Link className="w-4 h-4 text-cyan-400" /> Connect API Providers
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                {providers.map(p => (
                  <div key={p.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[200px] mt-0.5">{p.apiUrl}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 block">${p.balance.toFixed(4)}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono mt-1 inline-block">connected</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Provider form */}
              <form onSubmit={handleAddProvider} className="p-3 bg-purple-500/5 border border-purple-500/15 rounded-lg space-y-3">
                <h4 className="font-sans font-medium text-purple-300 text-xs">Link Master Downstream Provider</h4>
                
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <input
                    type="text"
                    value={newProvName}
                    onChange={e => setNewProvName(e.target.value)}
                    placeholder="e.g., LuvSMM Sub-reseller Endpoint"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-lg text-slate-100 placeholder-slate-500 outline-none transition"
                  />
                  <input
                    type="text"
                    value={newProvUrl}
                    onChange={e => setNewProvUrl(e.target.value)}
                    placeholder="https://luvsmm.com/api/v2"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-lg text-slate-100 placeholder-slate-500 font-mono outline-none transition"
                  />
                  <input
                    type="text"
                    value={newProvKey}
                    onChange={e => setNewProvKey(e.target.value)}
                    placeholder="Enter Secret Account API Token Key"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-purple-500 rounded-lg text-slate-100 placeholder-slate-500 font-mono outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition"
                >
                  Confirm Mapping
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
