import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { walletApi } from '../api';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      walletApi.getBalance(u.id).then(r => setWallet(r.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = window.location.href.split('#')[0] + '#/';
  };

  const addFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) return;
    setAddingFunds(true);
    try {
      const { data } = await walletApi.addFunds(user.id, amount);
      setWallet(data);
      setFundAmount('');
      setShowAddFunds(false);
    } catch {}
    setAddingFunds(false);
  };

  const refreshWallet = () => {
    if (user) walletApi.getBalance(user.id).then(r => setWallet(r.data)).catch(() => {});
  };

  useEffect(() => {
    window.__refreshNavbarWallet = refreshWallet;
    return () => { delete window.__refreshNavbarWallet; };
  }, [user]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/10' : 'bg-slate-900/80 backdrop-blur-xl'
      } border-b border-white/10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">🏔️</span>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              WanderTribe
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-4">
            <Link to="/" className={`text-sm transition-colors ${location.pathname === '/' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className={`text-sm transition-colors ${location.pathname === '/dashboard' ? 'text-emerald-400' : 'text-white/70 hover:text-white'}`}>My Trips</Link>

                {wallet && (
                  <button onClick={() => setShowAddFunds(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    <span className="text-xs">💰</span>
                    <span className="text-emerald-400 text-sm font-medium">₹{wallet.balance.toLocaleString()}</span>
                  </button>
                )}

                <span className="text-emerald-400 text-sm font-medium">Hi, {user.name}</span>
                <button onClick={logout} className="text-sm text-white/50 hover:text-white transition-colors">Logout</button>
              </>
            ) : (
              <Link to="/login" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-lg text-sm font-medium transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                Get Started
              </Link>
            )}
          </div>

          <div className="sm:hidden flex items-center gap-2">
            {user && wallet && (
              <button onClick={() => setShowAddFunds(true)}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-[10px]">💰</span>
                <span className="text-emerald-400 text-xs font-medium">₹{wallet.balance.toLocaleString()}</span>
              </button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white/70 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-3">
            <Link to="/" className="block py-2 text-white/70 hover:text-white">Home</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-white/70 hover:text-white">My Trips</Link>
                <div className="py-2 text-emerald-400 text-sm">Hi, {user.name}</div>
                <button onClick={logout} className="block py-2 text-white/50 hover:text-white">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-emerald-400 font-medium">Get Started</Link>
            )}
          </div>
        )}
      </nav>

      {showAddFunds && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddFunds(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Add Funds to Wallet</h3>
            <p className="text-white/40 text-sm mb-4">Current balance: <span className="text-emerald-400 font-medium">₹{wallet?.balance?.toLocaleString() || 0}</span></p>

            <div className="space-y-3">
              <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                placeholder="Enter amount (₹)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-emerald-500 focus:outline-none" />

              <div className="flex gap-2">
                {[1000, 2000, 5000, 10000].map(a => (
                  <button key={a} onClick={() => setFundAmount(String(a))}
                    className="flex-1 py-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/20 rounded-lg text-xs text-white/60 hover:text-emerald-400 transition-colors">
                    ₹{a.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAddFunds(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors">Cancel</button>
                <button onClick={addFunds} disabled={addingFunds || !fundAmount}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl text-sm font-medium transition-all">
                  {addingFunds ? 'Adding...' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
