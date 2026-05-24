import React, { useState, useEffect } from 'react';
import { Category, Service, Order, Ticket, APIProvider, PlatformSettings } from '../types';
import { 
  PlusCircle, RefreshCw, ShoppingCart, ListFilter, CreditCard, Ticket as TicketIcon, Terminal,
  Coins, HelpCircle, CheckCircle2, ChevronRight, Download, Send, Search, Code, Lock, Copy
} from 'lucide-react';
import PaymentModal from './PaymentModal';

interface UserDashboardProps {
  categories: Category[];
  services: Service[];
  orders: Order[];
  tickets: Ticket[];
  settings: PlatformSettings;
  userBalance: number;
  userSpent: number;
  apiKey: string;
  onSetUserBalance: (bal: number) => void;
  onSetUserSpent: (spt: number) => void;
  onSetOrders: (ords: Order[]) => void;
  onSetTickets: (tks: Ticket[]) => void;
  onNotify: (msg: string, type: 'success' | 'info') => void;
  onRegenerateKey: () => void;
}

export default function UserDashboard({
  categories,
  services,
  orders,
  tickets,
  settings,
  userBalance,
  userSpent,
  apiKey,
  onSetUserBalance,
  onSetUserSpent,
  onSetOrders,
  onSetTickets,
  onNotify,
  onRegenerateKey
}: UserDashboardProps) {

  // Visual Nav Tabs
  const [activeTab, setActiveTab] = useState<'order' | 'mass_order' | 'history' | 'add_funds' | 'tickets' | 'api'>('order');

  // NEW ORDER PANEL STATE
  const [selectedCatId, setSelectedCatId] = useState<number>(categories[0]?.id || 0);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [orderLink, setOrderLink] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [calculatedCharge, setCalculatedCharge] = useState<number>(0.0000);
  const [dripFeed, setDripFeed] = useState(false);
  const [dripRuns, setDripRuns] = useState('5');
  const [dripInterval, setDripInterval] = useState('60');

  // MASS ORDER STATE
  const [massOrderText, setMassOrderText] = useState('');

  // HISTORY FILTERS
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'pending' | 'inprogress' | 'completed' | 'canceled'>('all');

  // ADD FUNDS FORM STATE
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'crypto'>('credit_card');
  const [depositAmount, setDepositAmount] = useState('25');
  const [processingDeposit, setProcessingDeposit] = useState(false);

  // TICKETS FORM STATE
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [activeTicketChatId, setActiveTicketChatId] = useState<number | null>(null);
  const [clientReplyText, setClientReplyText] = useState('');

  // API SANDBOX TEST CONSOLE
  const [apiMethod, setApiMethod] = useState<'balance' | 'services' | 'add_order' | 'check_status'>('balance');
  const [sandboxServiceId, setSandboxServiceId] = useState('101');
  const [sandboxLink, setSandboxLink] = useState('https://instagram.com/p/Example');
  const [sandboxQty, setSandboxQty] = useState('1000');
  const [sandboxOrderId, setSandboxOrderId] = useState('34105');
  const [apiTerminalOutput, setApiTerminalOutput] = useState<string>('');
  const [apiSDKTab, setApiSDKTab] = useState<'curl' | 'php' | 'node'>('curl');

  // Get active services matching current category
  const filteredServices = services.filter(s => s.categoryId === selectedCatId && s.status === 'active');
  const activeService = services.find(s => s.id === selectedServiceId) || filteredServices[0];

  useEffect(() => {
    if (filteredServices.length > 0 && (!activeService || activeService.categoryId !== selectedCatId)) {
      setSelectedServiceId(filteredServices[0].id);
    }
  }, [selectedCatId, services]);

  // Handle total price dynamic logic
  useEffect(() => {
    if (!activeService) {
      setCalculatedCharge(0.0000);
      return;
    }
    const qty = parseFloat(orderQty);
    if (isNaN(qty) || qty <= 0) {
      setCalculatedCharge(0.00);
      return;
    }

    let multiplier = 1;
    if (dripFeed) {
      const runs = parseInt(dripRuns);
      if (!isNaN(runs) && runs > 0) multiplier = runs;
    }

    const calculated = (activeService.price / 1000) * qty * multiplier;
    setCalculatedCharge(calculated);
  }, [orderQty, selectedServiceId, dripFeed, dripRuns, activeService]);

  const [unpaidOrderIntent, setUnpaidOrderIntent] = useState<any>(null);

  // Place Single Order Submission Handler
  const handleSingleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService) return;

    const qty = parseInt(orderQty);
    if (!orderLink.trim()) {
      onNotify('Please provide your social channel link pathway.', 'info');
      return;
    }
    if (isNaN(qty) || qty < activeService.minQuantity) {
      onNotify(`Minimum order limit is ${activeService.minQuantity}`, 'info');
      return;
    }
    if (qty > activeService.maxQuantity) {
      onNotify(`Maximum order limit is ${activeService.maxQuantity}`, 'info');
      return;
    }

    const priceCharge = calculatedCharge;
    if (userBalance < priceCharge) {
      setUnpaidOrderIntent({ activeService, orderLink, qty, priceCharge });
      setActualDepositAmount(priceCharge);
      setShowPaymentModal(true);
      return;
    }

    // Deduct and Place Order
    const nextBal = userBalance - priceCharge;
    onSetUserBalance(nextBal);
    onSetUserSpent(userSpent + priceCharge);

    const isApiProviderLinked = activeService.apiProviderId !== null;
    const initialStatus = isApiProviderLinked ? 'pending' : 'inprogress';

    const newOrd: Order = {
      id: Math.floor(34100 + Math.random() * 5000),
      username: 'demo_user',
      serviceId: activeService.id,
      serviceName: activeService.name,
      categoryName: categories.find(c => c.id === activeService.categoryId)?.name || 'General',
      link: orderLink,
      quantity: qty,
      charge: priceCharge,
      startCount: Math.floor(100 + Math.random() * 1000),
      remains: qty,
      status: initialStatus as any,
      apiProviderId: activeService.apiProviderId,
      apiOrderId: isApiProviderLinked ? Math.floor(520000 + Math.random() * 200000) : null,
      source: 'web',
      createdAt: new Date().toISOString()
    };

    onSetOrders([newOrd, ...orders]);
    setOrderLink('');
    setOrderQty('');
    setDripFeed(false);
    onNotify('Order registered successfully! Pushing downstream...', 'success');
  };

  // Mass Order submits
  const handleMassOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!massOrderText.trim()) {
      onNotify('Text container cannot be empty.', 'info');
      return;
    }

    const lines = massOrderText.split('\n');
    let placedCount = 0;
    let chargeSum = 0;
    const newItems: Order[] = [];

    lines.forEach(line => {
      const parts = line.split('|');
      if (parts.length >= 3) {
        const srvId = parseInt(parts[0]);
        const qty = parseInt(parts[1]);
        const targetLink = parts[2]?.trim();

        const service = services.find(s => s.id === srvId && s.status === 'active');
        if (service && qty >= service.minQuantity && qty <= service.maxQuantity && targetLink) {
          const cost = (service.price / 1000) * qty;
          chargeSum += cost;
          placedCount++;

          newItems.push({
            id: Math.floor(34100 + Math.random() * 5000),
            username: 'demo_user',
            serviceId: service.id,
            serviceName: service.name,
            categoryName: categories.find(c => c.id === service.categoryId)?.name || 'General',
            link: targetLink,
            quantity: qty,
            charge: cost,
            startCount: 0,
            remains: qty,
            status: 'pending',
            apiProviderId: service.apiProviderId,
            apiOrderId: service.apiProviderId ? Math.floor(520000 + Math.random() * 200000) : null,
            source: 'web',
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    if (placedCount === 0) {
      onNotify('No valid lines detected. Pattern template: service_id|quantity|link', 'info');
      return;
    }

    if (userBalance < chargeSum) {
      onNotify('Your balance count is insufficient for mass order sum total.', 'info');
      return;
    }

    onSetUserBalance(userBalance - chargeSum);
    onSetUserSpent(userSpent + chargeSum);
    onSetOrders([...newItems, ...orders]);
    setMassOrderText('');
    onNotify(`Successfully logged ${placedCount} mass order requests!`, 'success');
  };

  // Simulated Deposit Pipeline
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [actualDepositAmount, setActualDepositAmount] = useState(0);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 0.5) {
      onNotify('Minimum deposit amount is $0.50.', 'info');
      return;
    }

    if (paymentMethod === 'credit_card') {
      setActualDepositAmount(amount);
      setShowPaymentModal(true);
    } else {
      // For PayPal / Crypto, mock it
      setProcessingDeposit(true);
      onNotify(`Contacting ${paymentMethod} portal...`, 'info');
      setTimeout(() => {
        onSetUserBalance(userBalance + amount);
        setProcessingDeposit(false);
        onNotify(`Success! Account credited with +${settings.siteCurrencySymbol}${amount.toFixed(2)}`, 'success');
      }, 1500);
    }
  };

  // Submit support ticket
  const handleTicketCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      onNotify('Declare subject matter and details info.', 'info');
      return;
    }

    const nTix: Ticket = {
      id: Math.floor(1005 + Math.random() * 200),
      username: 'demo_user',
      subject: ticketSubject,
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: 1,
          author: 'user',
          message: ticketMessage,
          createdAt: new Date().toISOString()
        }
      ]
    };

    onSetTickets([nTix, ...tickets]);
    setTicketSubject('');
    setTicketMessage('');
    onNotify('Ticket submitted to administrative review.', 'success');
  };

  // Client messages back into ticked dialog replies state
  const handleClientReplySubmit = (ticketId: number) => {
    if (!clientReplyText.trim()) return;

    const targetTix = tickets.find(t => t.id === ticketId);
    if (!targetTix) return;

    const nextRep = {
      id: targetTix.replies.length + 1,
      author: 'user' as const,
      message: clientReplyText,
      createdAt: new Date().toISOString()
    };

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'pending' as const,
          replies: [...t.replies, nextRep]
        };
      }
      return t;
    });

    onSetTickets(updated);
    setClientReplyText('');
    onNotify('Message posted successfully.', 'success');

    // MOCKBOT BOT AUTO ANSWER IN 2 SECONDS FOR INTERACTIVE JOY!
    setTimeout(() => {
      const liveTicket = updated.find(t => t.id === ticketId);
      if (liveTicket && liveTicket.status === 'pending') {
        const botReply = {
          id: liveTicket.replies.length + 1,
          author: 'admin' as const,
          message: "SYSTEM BOT ACK: Hello! An advisor is currently assessing your cURL order query logs. We will notify you here directly as soon as provider details update.",
          createdAt: new Date().toISOString()
        };
        onSetTickets(updated.map(t => t.id === ticketId ? { ...t, status: 'answered', replies: [...t.replies, botReply] } : t));
        onNotify('New update inside active technical support ticket!', 'info');
      }
    }, 3000);
  };

  // API SANDBOX SIMULATOR CONTROLLERS
  const executeSandboxWebRequest = () => {
    onNotify('Running local terminal simulation API query...', 'info');

    setTimeout(() => {
      if (apiMethod === 'balance') {
        setApiTerminalOutput(JSON.stringify({
          status: 'success',
          username: 'demo_user',
          balance: userBalance.toFixed(4),
          currency_symbol: settings.siteCurrencySymbol,
          api_token_hash: apiKey
        }, null, 2));
      } else if (apiMethod === 'services') {
        setApiTerminalOutput(JSON.stringify(
          services.map(s => ({
            service_id: s.id,
            name: s.name,
            min: s.minQuantity,
            max: s.maxQuantity,
            price_per_k: settings.siteCurrencySymbol + s.price.toFixed(4),
            provider: s.apiProviderId ? 'CONNECTED-API' : 'MANUAL-QUEUE'
          })), null, 2));
      } else if (apiMethod === 'add_order') {
        const selectedSrv = services.find(s => s.id === parseInt(sandboxServiceId));
        if (!selectedSrv) {
          setApiTerminalOutput(JSON.stringify({ error: 'Service invalid' }, null, 2));
          return;
        }
        const qty = parseInt(sandboxQty);
        const cost = (selectedSrv.price / 1000) * qty;

        setApiTerminalOutput(JSON.stringify({
          status: 'success',
          order_id: Math.floor(40000 + Math.random() * 5000),
          charged: settings.siteCurrencySymbol + cost.toFixed(4),
          submitted_link: sandboxLink,
          quantity: qty,
          remains: qty,
          operational_status: 'PROCESSING'
        }, null, 2));
      } else if (apiMethod === 'check_status') {
        const loggedOrd = orders.find(o => o.id === parseInt(sandboxOrderId));
        if (!loggedOrd) {
          setApiTerminalOutput(JSON.stringify({ error: 'Order not found in DB logs' }, null, 2));
          return;
        }

        setApiTerminalOutput(JSON.stringify({
          order_id: loggedOrd.id,
          status: loggedOrd.status.toUpperCase(),
          start_count: loggedOrd.startCount,
          remains: loggedOrd.remains,
          net_charge: settings.siteCurrencySymbol + loggedOrd.charge.toFixed(4)
        }, null, 2));
      }
    }, 600);
  };

  // API SDK sample codes
  const generateSDKCode = () => {
    if (apiSDKTab === 'curl') {
      return `curl --location --request POST '${window.location.protocol}//${window.location.host}/api.php' \\
--form 'key="${apiKey}"' \\
--form 'action="add"' \\
--form 'service="${sandboxServiceId}"' \\
--form 'link="${sandboxLink}"' \\
--form 'quantity="${sandboxQty}"'`;
    } else if (apiSDKTab === 'php') {
      return `<?php
// Simple PHP SMM SDK Integration for LuvSMM
$api_url = "${window.location.protocol}//${window.location.host}/api.php";
$post_data = [
    'key' => '${apiKey}',
    'action' => 'add',
    'service' => ${sandboxServiceId},
    'link' => '${sandboxLink}',
    'quantity' => ${sandboxQty}
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
$response = curl_exec($ch);
curl_close($ch);

$res = json_decode($response, true);
print_r($res);
?>`;
    } else {
      return `// SMM Node Service integration
const axios = require('axios');

async function placeSMMOrder() {
  const payload = {
    key: '${apiKey}',
    action: 'add',
    service: ${sandboxServiceId},
    link: '${sandboxLink}',
    quantity: ${sandboxQty}
  };
  
  try {
    const res = await axios.post('${window.location.protocol}//${window.location.host}/api.php', null, { params: payload });
    console.log("Placed downstream. Order ID: " + res.data.order);
  } catch(err) {
    console.error(err.response?.data || err.message);
  }
}

placeSMMOrder();`;
    }
  };

  // Order filters filtering
  const filteredOrders = orders.filter(ord => {
    const matchSearch = ord.serviceName.toLowerCase().includes(historySearch.toLowerCase()) || 
                        ord.link.toLowerCase().includes(historySearch.toLowerCase()) ||
                        ord.id.toString().includes(historySearch);
    if (!matchSearch) return false;
    if (historyStatusFilter === 'all') return true;
    return ord.status === historyStatusFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* LEFT SIDEBAR: Visual Sub navigation & Stats widget */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* User Balance visual cards */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 glow-purple">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-500 font-sans text-xs tracking-wider block">Available Balance</span>
              <span className="text-2xl font-display font-semibold text-slate-100 block mt-0.5">
                {settings.siteCurrencySymbol}{userBalance.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-850 my-4 pt-4 flex justify-between text-xs text-slate-400">
            <span>Total Spent</span>
            <span className="font-mono text-slate-200 mt-0.5 font-medium">{settings.siteCurrencySymbol}{userSpent.toFixed(4)}</span>
          </div>

          <button
            onClick={() => setActiveTab('add_funds')}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-purple-600/10 transition duration-200 flex items-center justify-center gap-1.5"
            id="deposit-quick-btn"
          >
            <CreditCard className="w-3.5 h-3.5" /> Deposit Funds
          </button>
        </div>

        {/* Dynamic sub navigation buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          {[
            { id: 'order', label: 'Single Order', icon: PlusCircle },
            { id: 'mass_order', label: 'Mass Orders', icon: ShoppingCart },
            { id: 'history', label: 'Orders Timeline', icon: ListFilter },
            { id: 'add_funds', label: 'Deposit Cash', icon: CreditCard },
            { id: 'tickets', label: 'Technical Tickets', icon: TicketIcon },
            { id: 'api', label: 'API Developer Gateway', icon: Terminal },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setActiveTicketChatId(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isSelected 
                    ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
                id={`user-nav-${tab.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${isSelected ? 'translate-x-0.5 text-purple-400' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Interactive stats logs alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
          <h4 className="font-display font-medium text-slate-300 uppercase tracking-widest text-[10px]">active activity indicators</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
              <span>Pending Orders</span>
              <span className="text-amber-400 font-medium font-mono">{orders.filter(o => o.status === 'pending').length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
              <span>Delivering now</span>
              <span className="text-purple-400 font-medium font-mono">{orders.filter(o => o.status === 'inprogress' || o.status === 'processing').length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
              <span>Pending Support Case</span>
              <span className="text-rose-400 font-medium font-mono">{tickets.filter(t => t.status === 'open' || t.status === 'pending').length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* CORE FORM SCREENS RENDERING WORKSPACE */}
      <div className="lg:col-span-3">
        
        {/* TAB 1: SINGLE ORDER FLOWS */}
        {activeTab === 'order' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 glow-purple animate-fade-in">
            <h3 className="font-display font-semibold text-slate-100 text-lg mb-2">Configure Social Marketing Order</h3>
            <p className="text-xs text-slate-400 mb-6">Select from premium worldwide API networks to boost organic engagement instantly.</p>

            <form onSubmit={handleSingleOrderSubmit} className="space-y-4">
              
              {/* Category Picker Select */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="order-cat-picker">Vertical Category Segment</label>
                  <select
                    id="order-cat-picker"
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(parseInt(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 hover:border-slate-705 h-10 px-3.5 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outlines-none transiton"
                  >
                    {categories.filter(c => c.status === 'active').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Service Picker Select */}
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="order-srv-picker">Select Package Service</label>
                  <select
                    id="order-srv-picker"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(parseInt(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 hover:border-slate-705 h-10 px-3.5 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outlines-none truncate font-sans"
                  >
                    {filteredServices.map(srv => (
                      <option key={srv.id} value={srv.id}>
                        [{srv.id}] {srv.name} - {settings.siteCurrencySymbol}{srv.price.toFixed(2)}/1K
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Package description visualization card */}
              {activeService && (
                <div className="bg-slate-950 text-xs p-4.5 rounded-lg border border-slate-850 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <span className="text-purple-300 font-mono uppercase tracking-widest text-[10px] font-semibold">service descriptions variables</span>
                    <span className="text-slate-500 font-mono">ID: {activeService.id}</span>
                  </div>
                  
                  <p className="whitespace-pre-line leading-relaxed text-slate-300 font-sans text-xs">
                    {activeService.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-850 text-slate-400 font-mono text-[11px]">
                    <div>MIN QTY: <strong className="text-slate-200">{activeService.minQuantity.toLocaleString()}</strong></div>
                    <div>MAX QTY: <strong className="text-slate-200">{activeService.maxQuantity.toLocaleString()}</strong></div>
                  </div>
                </div>
              )}

              {/* Target Links input */}
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="order-link-input">Destination Post / Profile URL Link</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs select-none">🌐</span>
                  <input
                    id="order-link-input"
                    type="url"
                    value={orderLink}
                    onChange={(e) => setOrderLink(e.target.value)}
                    placeholder="https://instagram.com/p/yourPostId"
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 hover:border-slate-705 h-10 pl-9 pr-4.5 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Quantity dynamic inputs fields mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="order-qty-input">Submit Volume Quantity</label>
                  <input
                    id="order-qty-input"
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    placeholder={`e.g. 1000`}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 hover:border-slate-705 h-10 px-3.5 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                  />
                </div>

                {/* Sub Total dynamic calculation labels */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col justify-center items-center">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Auto Calculating Charge</span>
                  <span className="text-xl font-display font-bold text-slate-100 mt-1">
                    {settings.siteCurrencySymbol}{calculatedCharge.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* DRIP FEED OPTIONS PANEL */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dripFeed}
                    onChange={(e) => {
                      setDripFeed(e.target.checked);
                      if (e.target.checked) setOrderQty('100');
                    }}
                    className="rounded border-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 focus:ring-offset-2"
                  />
                  <span className="text-xs font-medium text-slate-300">Enable Drip-Feed Increments</span>
                </label>

                {dripFeed && (
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-850">
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase font-mono font-medium mb-1">Interval Runs</label>
                      <input
                        type="number"
                        value={dripRuns}
                        onChange={(e) => setDripRuns(e.target.value)}
                        className="w-full bg-slate-900 text-slate-300 text-xs border border-slate-800 rounded px-2 py-1 outline-none focus:border-purple-500"
                        min="2"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase font-mono font-medium mb-1">Gap Time Delay (Minutes)</label>
                      <input
                        type="number"
                        value={dripInterval}
                        onChange={(e) => setDripInterval(e.target.value)}
                        className="w-full bg-slate-900 text-slate-300 text-xs border border-slate-800 rounded px-2 py-1 outline-none focus:border-purple-500"
                        min="10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Placing order execution submit buttons  */}
              <button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-purple-600/15 focus:outline-none transition active:scale-99"
                id="place-order-submit-btn"
              >
                {userBalance < calculatedCharge 
                  ? `Pay ${settings.siteCurrencySymbol}${calculatedCharge.toFixed(2)} via Stripe`
                  : 'Place SMM Social Campaign Order'}
              </button>

            </form>
          </div>
        )}

        {/* TAB 2: MASS SECTOR ORDER SUBMISSIONS */}
        {activeTab === 'mass_order' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in">
            <h3 className="font-display font-semibold text-slate-100 text-lg mb-2">Mass Reseller Bulk Booking</h3>
            <p className="text-xs text-slate-400 mb-6">Process hundreds of client links simultaneously downstream using our standard split arrays schema.</p>

            <form onSubmit={handleMassOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="mass-text-area">Insert Bulk SMM Arrays</label>
                <textarea
                  id="mass-text-area"
                  rows={8}
                  value={massOrderText}
                  onChange={(e) => setMassOrderText(e.target.value)}
                  placeholder={`format rules: service_id|quantity|link\ne.g:\n101|1000|https://instagram.com/myaccount\n104|5000|https://instagram.com/myphotos`}
                  className="w-full p-4 bg-slate-950 text-slate-300 text-xs font-mono border border-slate-800 hover:border-slate-705 rounded-xl placeholder-slate-650 outline-none focus:border-purple-500"
                />
              </div>

              <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-lg text-xs leading-relaxed text-slate-400 space-y-1">
                <span className="text-purple-300 font-medium uppercase font-mono block text-[10px]">formatting logic syntax criteria</span>
                <p>• Verify you declare active service IDs accurately.</p>
                <p>• Deducts funds automatically from available balances per calculated rows variables.</p>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg shadow-lg transition"
                id="mass-order-submit-btn"
              >
                Execute Mass Order Batch
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PERSONAL HISTORY TIMELINE */}
        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="p-6 bg-slate-900 border-b border-slate-805 space-y-4">
              <div>
                <h3 className="font-display font-semibold text-slate-100 text-lg">My Orders History Timeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track, review, or investigate your social promotional logistics in real-time.</p>
              </div>

              {/* Search filter interfaces */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by ID, link, or service name..."
                    className="w-full bg-slate-950 text-slate-300 text-xs border border-slate-800 h-9 pl-9 pr-3 rounded-lg focus:border-purple-500 outline-none transition"
                  />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'inprogress', label: 'In Delivery' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'canceled', label: 'Canceled' },
                  ].map(filter => {
                    const isSelected = historyStatusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setHistoryStatusFilter(filter.id as any)}
                        className={`text-xs px-3 h-9 rounded-lg border font-medium transition ${
                          isSelected 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        id={`filter-history-${filter.id}`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Render items list grid or rows */}
            {filteredOrders.length > 0 ? (
              <div className="divide-y divide-slate-805 text-xs select-none">
                {filteredOrders.map(ord => (
                  <div key={ord.id} className="p-4 bg-slate-950/20 hover:bg-slate-950/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono font-semibold">#{ord.id}</span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-slate-300 font-medium truncate max-w-[260px] block">{ord.serviceName}</span>
                      </div>

                      <div className="text-cyan-400 text-[11px] truncate max-w-[340px] font-mono hover:underline">
                        <a href={ord.link} target="_blank" rel="noreferrer">{ord.link}</a>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-[10px] font-mono">
                        <span>Quantity: {ord.quantity.toLocaleString()}</span>
                        <span>•</span>
                        <span>Start count: {ord.startCount}</span>
                        <span>•</span>
                        <span>Remains: {ord.remains}</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-2 min-w-[120px] font-mono">
                      <div className="text-slate-100 font-medium">{settings.siteCurrencySymbol}{ord.charge.toFixed(4)}</div>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        ord.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        ord.status === 'inprogress' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        ord.status === 'processing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                        ord.status === 'canceled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p className="text-xs">No order registers matching current search filters are available.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADD FUNDS / DEPOSIT */}
        {activeTab === 'add_funds' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in space-y-6">
            <div>
              <h3 className="font-display font-semibold text-slate-100 text-lg">Deposit Manual Balance Credits</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">Funds are added instantly to explore local order placements in sandbox environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'credit_card', title: 'Stripe API Gateway', log: '💳 Credit/Debit Cards Visa/MC' },
                { id: 'paypal', title: 'PayPal Pro System', log: '🅿️ Verified instant balances fallback' },
                { id: 'crypto', title: 'Coinbase Commerce API', log: '🪙 BTC, ETH, LTC, USDT, USDC' }
              ].map(method => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 rounded-xl border text-left transition ${
                      isSelected 
                        ? 'bg-purple-500/10 border-purple-500 text-purple-300 z-10' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-350 hover:bg-slate-950/70'
                    }`}
                    id={`pay-method-${method.id}`}
                  >
                    <span className="font-semibold text-xs block">{method.title}</span>
                    <p className="text-[10px] text-slate-550 mt-1.5 leading-relaxed">{method.log}</p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="deposit-amount-input">Deposit Amount ({settings.siteCurrencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono text-xs text-slate-500">{settings.siteCurrencySymbol}</span>
                  <input
                    id="deposit-amount-input"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-slate-800 hover:border-slate-705 h-10 pl-8 pr-4.5 rounded-lg focus:border-purple-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processingDeposit}
                className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                id="deposit-confirm-submit"
              >
                {processingDeposit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorizing payment gateways...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Authorize Simulated Invoice Deposit</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: TICKETS CLIENT PORTALS */}
        {activeTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Submit ticket form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 h-fit">
              <h3 className="font-display font-semibold text-slate-100 text-sm">Create New Ticket</h3>
              
              <form onSubmit={handleTicketCreate} className="space-y-3">
                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1 uppercase tracking-wider">Subject Title</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g., Payment issue on order #34106"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-purple-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-medium mb-1 uppercase tracking-wider">Describe details inquiry</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Please specify transaction hashes or order logs links clearly..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 hover:border-slate-750 focus:border-purple-500 rounded-lg text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs rounded-lg transition"
                >
                  Submit Support Ticket
                </button>
              </form>
            </div>

            {/* List and open chat */}
            <div className="lg:col-span-2 space-y-4">
              {activeTicketChatId ? (
                (() => {
                  const activeTix = tickets.find(t => t.id === activeTicketChatId);
                  if (!activeTix) return null;
                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
                      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
                        <div>
                          <h4 className="font-display font-medium text-slate-200 text-xs truncate max-w-[200px]">{activeTix.subject}</h4>
                          <span className="text-[9px] text-slate-500">Ticket ref: #{activeTix.id}</span>
                        </div>
                        <button
                          onClick={() => setActiveTicketChatId(null)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          Back to list
                        </button>
                      </div>

                      {/* Chat dialog logs */}
                      <div className="flex-1 p-4 overflow-y-auto bg-slate-950/40 space-y-2.5">
                        {activeTix.replies.map(rep => {
                          const isAdmin = rep.author === 'admin';
                          return (
                            <div key={rep.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                              <div className={`p-3 rounded-xl text-xs space-y-1 ${
                                isAdmin 
                                  ? 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none' 
                                  : 'bg-purple-600 text-white rounded-tr-none'
                              }`}>
                                <span className="text-[8px] opacity-60 block font-mono">
                                  {isAdmin ? 'SUPPORT AGENT / ADMIN' : 'CUSTOMER'}
                                </span>
                                <p className="leading-relaxed whitespace-pre-line">{rep.message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Msg bottom bar */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={clientReplyText}
                            onChange={(e) => setClientReplyText(e.target.value)}
                            placeholder="Type out message response..."
                            className="flex-1 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 outline-none focus:border-purple-500"
                            id="ticket-client-input"
                          />
                          <button
                            onClick={() => handleClientReplySubmit(activeTix.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs text-medium"
                            id="ticket-client-send"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="font-display font-semibold text-slate-100 text-sm">Active Technical Tickets Logs</h4>
                  
                  <div className="space-y-2">
                    {tickets.map(tix => (
                      <div
                        key={tix.id}
                        onClick={() => setActiveTicketChatId(tix.id)}
                        className="p-3 bg-slate-950 rounded-lg border border-slate-850 hover:border-slate-800 cursor-pointer flex justify-between items-center text-xs transition-colors"
                        id={`ticket-row-${tix.id}`}
                      >
                        <div>
                          <span className="font-medium text-slate-200 block max-w-[280px] truncate">{tix.subject}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">ID Check: #{tix.id} • {tix.replies.length} replies</span>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none ${
                            tix.status === 'answered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            tix.status === 'open' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                            'bg-slate-800 text-slate-400 border border-slate-705'
                          }`}>
                            {tix.status.toUpperCase()}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: API GATEWAYS SPECIFICATION & SANDBOX SCREEN */}
        {activeTab === 'api' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-semibold text-slate-100 text-lg">Developer API Integration Console</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automate and submit user orders downstream using standard HTTP REST queries protocols.</p>
              </div>

              {/* API and regenerate wrapper */}
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-10">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#93c5fd] font-semibold font-mono block">personal Secret API Token Key</span>
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="font-mono text-xs text-slate-300 tracking-wider">
                      {apiKey.slice(0, 10)}...{apiKey.slice(-5)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey);
                      onNotify('API Key copied to clipboard!', 'success');
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
                    title="Copy Key"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onRegenerateKey();
                      onNotify('Token security Key regenerated! Update your scripts constants.', 'success');
                    }}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
                    title="Regenerate Security Token"
                    id="regenerate-api-key-btn"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* API Console Testing widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <span className="text-[#a78bfa] font-mono uppercase tracking-widest text-[10px] block font-semibold">1. Sandbox Request Parameters Builder</span>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Action Method</label>
                    <select
                      value={apiMethod}
                      onChange={(e) => setApiMethod(e.target.value as any)}
                      className="w-full bg-slate-950 text-slate-300 border border-slate-800 px-3 py-2 rounded-lg"
                    >
                      <option value="balance">Fetch Available Balance [action='balance']</option>
                      <option value="services">Fetch Platform Rates List [action='services']</option>
                      <option value="add_order">Submit Downstream Order [action='add']</option>
                      <option value="check_status">Query Order Details Log [action='status']</option>
                    </select>
                  </div>

                  {apiMethod === 'add_order' && (
                    <div className="space-y-3 p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                      <div>
                        <label className="block text-slate-450 font-medium mb-1">Service Target ID</label>
                        <input
                          type="number"
                          value={sandboxServiceId}
                          onChange={(e) => setSandboxServiceId(e.target.value)}
                          className="w-full bg-slate-950 text-slate-300 border border-slate-800 rounded px-2 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-450 font-medium mb-1">Target Link Pathway</label>
                        <input
                          type="text"
                          value={sandboxLink}
                          onChange={(e) => setSandboxLink(e.target.value)}
                          className="w-full bg-slate-900 text-slate-350 border border-slate-800 rounded px-2 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-450 font-medium mb-1">Target Quantity</label>
                        <input
                          type="number"
                          value={sandboxQty}
                          onChange={(e) => setSandboxQty(e.target.value)}
                          className="w-full bg-slate-900 text-slate-350 border border-slate-800 rounded px-2 py-1.5 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {apiMethod === 'check_status' && (
                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                      <label className="block text-slate-450 font-medium mb-1">Database order reference ID</label>
                      <input
                        type="number"
                        value={sandboxOrderId}
                        onChange={(e) => setSandboxOrderId(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded px-2 py-1.5 font-mono"
                      />
                    </div>
                  )}

                  <button
                    onClick={executeSandboxWebRequest}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs rounded-lg shadow-lg"
                    id="run-api-sandbox-btn"
                  >
                    Execute Sandbox API Request
                  </button>
                </div>
              </div>

              {/* Visual HTTP responses and SDK wrappers tabs */}
              <div className="flex flex-col bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-450">
                  <span className="font-mono text-[10px] text-[#22d3ee] font-semibold">2. SANDBOX RESPONSE LOGGER</span>
                  <span className="font-mono">JSON OK</span>
                </div>

                <div className="flex-1 p-4 overflow-auto max-h-[180px] font-mono text-xs text-slate-300 leading-relaxed bg-[#0b0f19]">
                  {apiTerminalOutput ? (
                    <pre className="whitespace-pre">
                      <code>{apiTerminalOutput}</code>
                    </pre>
                  ) : (
                    <span className="text-slate-600 italic">Push Request button above to capture cURL mock console responses payloads...</span>
                  )}
                </div>

                {/* API SDK Wrapper snippets code selection */}
                <div className="border-t border-slate-800">
                  <div className="px-4 py-2.5 bg-slate-900/60 flex gap-2 border-b border-slate-800 shrink-0 select-none">
                    {[
                      { id: 'curl', label: 'cURL' },
                      { id: 'php', label: 'PHP Script' },
                      { id: 'node', label: 'Node.js' }
                    ].map(sdk => (
                      <button
                        key={sdk.id}
                        onClick={() => setApiSDKTab(sdk.id as any)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                          apiSDKTab === sdk.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        id={`api-sdk-tab-${sdk.id}`}
                      >
                        {sdk.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-950 overflow-auto max-h-[180px] font-mono text-[10px] text-slate-300 leading-relaxed">
                    <pre className="whitespace-pre">
                      <code>{generateSDKCode()}</code>
                    </pre>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
        
        {showPaymentModal && (
          <PaymentModal
            amount={actualDepositAmount}
            onSuccess={() => {
              setShowPaymentModal(false);
              if (unpaidOrderIntent) {
                 const { activeService, orderLink, qty, priceCharge } = unpaidOrderIntent;
                 
                 onSetUserSpent(userSpent + priceCharge);
                 
                 const isApiProviderLinked = activeService.apiProviderId !== null;
                 const initialStatus = isApiProviderLinked ? 'pending' : 'inprogress';

                 const newOrd: Order = {
                   id: Math.floor(34100 + Math.random() * 5000),
                   username: 'demo_user',
                   serviceId: activeService.id,
                   serviceName: activeService.name,
                   categoryName: categories.find(c => c.id === activeService.categoryId)?.name || 'General',
                   link: orderLink,
                   quantity: qty,
                   charge: priceCharge,
                   startCount: Math.floor(100 + Math.random() * 1000),
                   remains: qty,
                   status: initialStatus as any,
                   apiProviderId: activeService.apiProviderId,
                   apiOrderId: isApiProviderLinked ? Math.floor(520000 + Math.random() * 200000) : null,
                   source: 'web',
                   createdAt: new Date().toISOString()
                 };

                 onSetOrders([newOrd, ...orders]);
                 setOrderLink('');
                 setOrderQty('');
                 setDripFeed(false);
                 setUnpaidOrderIntent(null);
                 onNotify('Direct Payment successful! Order registered.', 'success');
              } else {
                onSetUserBalance(userBalance + actualDepositAmount);
                onNotify(`Success! Account credited with +${settings.siteCurrencySymbol}${actualDepositAmount.toFixed(2)} automatically.`, 'success');
              }
            }}
            onClose={() => {
              setShowPaymentModal(false);
              setUnpaidOrderIntent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
