import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, 
      },
      redirect: 'if_required', 
    });

    if (submitError) {
      setError(submitError.message || 'An error occurred during payment.');
      setProcessing(false);
    } else {
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl max-w-md w-full relative animate-in zoom-in-95 duration-200">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 font-display">
        Complete Payment (${amount.toFixed(2)})
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6 p-1 rounded-lg">
           <PaymentElement options={{ 
              layout: 'tabs'
           }} />
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 min-w-[100px]"
          >
            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  );
}
