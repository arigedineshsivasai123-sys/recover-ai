import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag, CreditCard, Lock, ArrowRight, RefreshCw, XCircle, ArrowLeft, X } from 'lucide-react';
import { Transaction, RazorpayOrderResponse, PaymentVerifyResponse } from '../types';
import { api } from '../services/api';
import { RazorpayModal } from '../components/RazorpayModal';

export const CustomerRecoveryPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [initiatingRazorpay, setInitiatingRazorpay] = useState(false);
  const [orderData, setOrderData] = useState<RazorpayOrderResponse | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentVerifyResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNavigateDashboard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOrderData(null);
    setShowConfirmModal(false);
    navigate('/');
  };

  useEffect(() => {
    if (transactionId) {
      api
        .getOpportunityDetail(transactionId)
        .then((data) => setTx(data))
        .catch((e) => setErrorMessage('Transaction link expired or invalid.'))
        .finally(() => setLoading(false));
    }
  }, [transactionId]);

  const handleStartPayment = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!tx) return;
    setInitiatingRazorpay(true);
    setErrorMessage(null);
    try {
      const order = await api.createRazorpayOrder(tx.id);
      setOrderData(order);
      setShowConfirmModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to create Razorpay checkout session.');
    } finally {
      setInitiatingRazorpay(false);
    }
  };

  const handlePaymentSuccess = (res: PaymentVerifyResponse) => {
    setPaymentResult(res);
    setOrderData(null);
    setInitiatingRazorpay(false);
    setShowConfirmModal(false);
    if (tx) {
      api.getOpportunityDetail(tx.id).then((updated) => setTx(updated));
    }
  };

  const handlePaymentFailure = (res: PaymentVerifyResponse) => {
    setPaymentResult(res);
    setOrderData(null);
    setInitiatingRazorpay(false);
    setShowConfirmModal(false);
    setErrorMessage(res.message);
    if (tx) {
      api.getOpportunityDetail(tx.id).then((updated) => setTx(updated));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-md mx-auto mb-8">
          <button
            onClick={handleNavigateDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Merchant Dashboard</span>
          </button>
        </div>
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <div className="text-slate-400 text-xs font-mono">Loading Payment Recovery Portal...</div>
        </div>
      </div>
    );
  }

  if (paymentResult?.success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto mb-4">
          <button
            onClick={handleNavigateDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Merchant Dashboard</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white">Payment Recovered!</h1>
            <p className="text-xs text-slate-400 mt-1">Razorpay Payment Verified Successfully</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID</span>
              <span className="font-mono text-white font-semibold">{tx?.txn_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Paid</span>
              <span className="text-emerald-400 font-bold">₹{tx?.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-semibold">RECOVERED ✅</span>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            Thank you! Your order has been confirmed. A confirmation receipt has been sent to your email.
          </p>

          <button
            onClick={handleNavigateDashboard}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Return to Merchant Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Header Bar with Always-Accessible Back Link */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between">
        <button
          onClick={handleNavigateDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Merchant Dashboard</span>
        </button>

        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono px-2.5 py-1 rounded-full shrink-0">
          Razorpay Test Mode
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">Secure Merchant Checkout</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-2">Payment Recovery</h1>
          <p className="text-xs text-slate-400 mt-1">Your previous payment was unsuccessful.</p>
        </div>

        {/* Order Details */}
        {tx && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400">Order Item</div>
                <div className="text-sm font-bold text-white">{tx.item_name}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Amount Due</span>
              <span className="text-xl font-extrabold text-white">₹{tx.amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Your order is still reserved for you. You can retry safely.</span>
        </div>

        {/* Error Message Handler */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        {tx?.status === 'RECOVERED' ? (
          <div className="text-center py-3 bg-emerald-500/20 text-emerald-300 rounded-xl font-bold text-sm">
            Order Already Recovered!
          </div>
        ) : tx?.status === 'MAX_ATTEMPTS_REACHED' ? (
          <div className="text-center py-3 bg-slate-800 text-rose-300 rounded-xl font-medium text-xs">
            Maximum retry attempts reached for this order link.
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfirmModal(true);
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-500/20 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" /> Retry Payment Now (₹{tx?.amount.toLocaleString()})
          </button>
        )}

        {/* Razorpay Test Mode Options Helper */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2.5 text-slate-300">
          <div className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Supported Razorpay Test Payment Options
          </div>
          <div className="space-y-1.5 text-[11px] leading-relaxed">
            <div>
              <span className="text-slate-400 font-medium">Domestic Card:</span>{' '}
              <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300 font-mono">4111 1111 1111 1111</code>{' '}
              <span className="text-slate-500">(Exp: 12/30, CVV: 123)</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Netbanking:</span>{' '}
              <span className="text-slate-200">Select SBI / HDFC / ICICI → Click Success</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">UPI VPA:</span>{' '}
              <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 font-mono">success@razorpay</code>
            </div>
          </div>
        </div>

        {/* Secondary Return to Merchant Dashboard Button */}
        <button
          onClick={handleNavigateDashboard}
          className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Merchant Dashboard
        </button>

        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-emerald-400" /> Secured by Razorpay Test Gateway — No real money is charged.
        </div>
      </div>

      {/* Confirmation Step Modal */}
      {showConfirmModal && tx && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirmModal(false);
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowConfirmModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-white">Confirm Checkout</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to initiate a test mode payment of <strong className="text-emerald-400">₹{tx.amount.toLocaleString()}</strong> for <strong>{tx.item_name}</strong>.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleStartPayment}
                disabled={initiatingRazorpay}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {initiatingRazorpay ? 'Initiating Razorpay...' : 'Confirm & Pay'}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Modal */}
      {orderData && (
        <RazorpayModal
          orderData={orderData}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => {
            setOrderData(null);
            setInitiatingRazorpay(false);
            setShowConfirmModal(false);
          }}
        />
      )}
    </div>
  );
};
