import { useState, useEffect } from 'react';
import { cartApi, walletApi } from '../api';

export default function Cart({ tripId, open, onClose, onCheckout }) {
  const [items, setItems] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [negotiating, setNegotiating] = useState(null);
  const [offerInput, setOfferInput] = useState('');
  const [negotiateResult, setNegotiateResult] = useState({});
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const load = async () => {
    if (!user?.id) return;
    const [cartRes, walletRes] = await Promise.all([
      cartApi.getItems(tripId, user.id),
      walletApi.getBalance(user.id),
    ]);
    setItems(cartRes.data);
    setWallet(walletRes.data);
  };

  useEffect(() => { if (open) load(); }, [open, tripId]);

  const total = items.reduce((sum, it) => sum + it.negotiatedPrice, 0);

  const removeItem = async (id) => {
    await cartApi.remove(id);
    load();
  };

  const negotiate = async (item) => {
    const offered = parseFloat(offerInput);
    if (!offered || offered <= 0) return;
    try {
      const { data } = await cartApi.negotiate(item.id, offered);
      setNegotiateResult(prev => ({ ...prev, [item.id]: data }));
      if (data.accepted) {
        setNegotiating(null);
        setOfferInput('');
        load();
      }
    } catch {}
  };

  const checkout = async () => {
    setCheckingOut(true);
    try {
      const { data } = await cartApi.checkout(tripId, user.id);
      setCheckoutResult(data);
      if (data.success && onCheckout) onCheckout();
      load();
    } catch (err) {
      const errData = err.response?.data;
      setCheckoutResult(errData || { error: 'Checkout failed' });
    }
    setCheckingOut(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border-l border-white/10 h-full overflow-y-auto animate-slideIn">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🛒 Your Cart
            <span className="text-sm text-white/40 font-normal">({items.length} items)</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {wallet && (
          <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <span className="text-white/60 text-sm">Wallet Balance</span>
            <span className="text-emerald-400 font-bold">₹{wallet.balance.toLocaleString()}</span>
          </div>
        )}

        <div className="p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl block mb-4">🛒</span>
              <p className="text-white/40">Your cart is empty</p>
              <p className="text-white/30 text-sm mt-1">Add hotels, cabs, or drivers from the Bookings tab</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50 rounded-full">{item.itemType}</span>
                    <h4 className="font-medium mt-1">{item.itemName}</h4>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-400/50 hover:text-red-400 p-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {item.negotiated && item.negotiatedPrice < item.originalPrice ? (
                    <>
                      <span className="text-white/30 line-through text-sm">₹{item.originalPrice.toLocaleString()}</span>
                      <span className="text-emerald-400 font-bold">₹{item.negotiatedPrice.toLocaleString()}</span>
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">
                        Saved ₹{(item.originalPrice - item.negotiatedPrice).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-bold">₹{item.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                {negotiateResult[item.id] && !negotiateResult[item.id].accepted && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-amber-300 text-sm">{negotiateResult[item.id].message}</p>
                  </div>
                )}

                {negotiating === item.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={offerInput}
                      onChange={e => setOfferInput(e.target.value)}
                      placeholder={`Min ₹${Math.round(item.originalPrice * 0.8).toLocaleString()}`}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:border-emerald-500 focus:outline-none"
                    />
                    <button onClick={() => negotiate(item)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm font-medium transition-colors">
                      Offer
                    </button>
                    <button onClick={() => { setNegotiating(null); setOfferInput(''); }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setNegotiating(item.id); setOfferInput(''); setNegotiateResult(prev => ({ ...prev, [item.id]: null })); }}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-all">
                    💰 Negotiate Price
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total</span>
              <span className="text-xl font-bold text-emerald-400">₹{total.toLocaleString()}</span>
            </div>
            {wallet && wallet.balance < total && (
              <p className="text-red-400 text-xs">Insufficient balance. Add ₹{(total - wallet.balance).toLocaleString()} more to your wallet.</p>
            )}

            {checkoutResult && (
              <div className={`p-3 rounded-lg text-sm ${checkoutResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {checkoutResult.success
                  ? `Booked ${checkoutResult.bookingsCreated} items! ₹${checkoutResult.totalPaid?.toLocaleString()} deducted. New balance: ₹${checkoutResult.newBalance?.toLocaleString()}`
                  : checkoutResult.error}
              </div>
            )}

            <button onClick={checkout} disabled={checkingOut || !wallet || wallet.balance < total}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all text-sm">
              {checkingOut ? 'Processing...' : `Pay ₹${total.toLocaleString()} from Wallet`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
