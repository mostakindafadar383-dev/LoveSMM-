import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PaymentModalProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ amount, onSuccess, onClose }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the PaymentIntent client secret from the server
    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'usd' }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment.');
      }
    };
    fetchPaymentIntent();
  }, [amount]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {!clientSecret && !error && (
        <div className="flex flex-col items-center gap-3 bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Initializing secure gateway...</p>
        </div>
      )}

      {error && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
          <h3 className="text-red-400 font-semibold mb-2">Payment Gateway Error</h3>
          <p className="text-slate-300 text-xs mb-4">{error}</p>
          <button 
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      )}

      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <PaymentForm 
            amount={amount} 
            onSuccess={onSuccess} 
            onCancel={onClose} 
          />
        </Elements>
      )}
    </div>
  );
}
