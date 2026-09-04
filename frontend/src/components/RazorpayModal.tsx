import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, CreditCard, Lock, X } from 'lucide-react';
import { RazorpayOrderResponse, PaymentVerifyResponse } from '../types';
import { api } from '../services/api';

interface RazorpayModalProps {
  orderData: RazorpayOrderResponse;
  onSuccess: (res: PaymentVerifyResponse) => void;
  onFailure: (res: PaymentVerifyResponse) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  orderData,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [useFallbackModal, setUseFallbackModal] = useState(false);

  useEffect(() => {
    // Attempt loading Razorpay Checkout script
    if (window.Razorpay) {
      launchRazorpayStandardCheckout();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => launchRazorpayStandardCheckout();
    script.onerror = () => {
      console.warn('Razorpay JS script unavailable. Enabling interactive test modal.');
      setUseFallbackModal(true);
    };
    document.body.appendChild(script);
  }, [orderData]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(false);
    onClose();
  };

  const launchRazorpayStandardCheckout = () => {
    try {
      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'RecoverAI Revenue Recovery',
        description: `Payment Retry for ${orderData.transaction_id}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          setLoading(true);
          try {
            const verifyRes = await api.verifyRazorpayPayment({
              transaction_id: orderData.transaction_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess(verifyRes);
          } catch (err: any) {
            onFailure({
              success: false,
              message: err.message || 'Signature verification failed',
              status: 'PAYMENT_FAILED',
              transaction_id: orderData.transaction_id,
              recovered_amount: 0,
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email,
          contact: orderData.customer_phone ? orderData.customer_phone.replace(/\s+/g, '') : '9876543210',
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: () => handleClose(),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay Payment Failed Event:', response?.error);
        const errDesc = response?.error?.description || response?.error?.reason || response?.error?.code || 'Payment declined by bank';
        onFailure({
          success: false,
          message: `Razorpay Test Payment Failed: ${errDesc}`,
          status: 'PAYMENT_FAILED',
          transaction_id: orderData.transaction_id,
          recovered_amount: 0,
        });
      });
      rzp.open();
    } catch (e) {
      console.warn('Fallback to interactive test payment modal:', e);
      setUseFallbackModal(true);
    }
  };

  const handleSimulatePayment = async (success: boolean) => {
    setLoading(true);
    try {
      if (success) {
        const verifyRes = await api.verifyRazorpayPayment({
          transaction_id: orderData.transaction_id,
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_rzp_test_${Date.now()}`,
          razorpay_signature: `simulated_sig_${Date.now()}`,
        });
        onSuccess(verifyRes);
      } else {
        const verifyRes = await api.verifyRazorpayPayment({
          transaction_id: orderData.transaction_id,
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_failed_${Date.now()}`,
          razorpay_signature: 'INVALID_SIGNATURE',
          simulate_failure: true,
        });
        onFailure(verifyRes);
      }
    } catch (err: any) {
      onFailure({
        success: false,
        message: err.message || 'Payment simulation error',
        status: 'PAYMENT_FAILED',
        transaction_id: orderData.transaction_id,
        recovered_amount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!useFallbackModal) {
    return null; // Standard Razorpay JS popup handles rendering
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base">Razorpay Test Mode</div>
              <div className="text-xs text-slate-400">Order #{orderData.order_id}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono px-2 py-0.5 rounded">
              TEST MODE
            </span>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Customer</span>
            <span className="text-slate-200 font-medium">{orderData.customer_name}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Amount Due</span>
            <span className="text-emerald-400 font-bold text-base">
              ₹{orderData.amount.toLocaleString()} {orderData.currency}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Security Status</span>
            <span className="text-slate-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> HMAC-SHA256 Encrypted
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-slate-400 text-center">
            Simulate payment gateway response for testing:
          </div>

          <button
            onClick={() => handleSimulatePayment(true)}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">Processing Payment...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Simulate Successful Payment (₹{orderData.amount.toLocaleString()})
              </>
            )}
          </button>

          <button
            onClick={() => handleSimulatePayment(false)}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <XCircle className="w-4 h-4" /> Simulate Failed Payment Retry
          </button>
        </div>

        <button
          onClick={handleClose}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition py-2 rounded-xl hover:bg-slate-800/50 cursor-pointer"
        >
          Cancel Payment Session
        </button>
      </div>
    </div>
  );
};
