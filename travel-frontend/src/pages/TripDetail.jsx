import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi, cartApi } from '../api';
import ChatBot from '../components/ChatBot';
import IdeasBoard from '../components/IdeasBoard';
import Itinerary from '../components/Itinerary';
import Bookings from '../components/Bookings';
import Cart from '../components/Cart';
import TravelSidebar from '../components/TravelSidebar';
import TripSummary from '../components/TripSummary';
import ToastNotifications from '../components/ToastNotifications';

const TABS = [
  { id: 'chat', label: '💬 Group Chat', shortLabel: '💬 Chat' },
  { id: 'ideas', label: '💡 Ideas Board', shortLabel: '💡 Ideas' },
  { id: 'itinerary', label: '🗓️ Itinerary', shortLabel: '🗓️ Plan' },
  { id: 'bookings', label: '🛒 Bookings', shortLabel: '🛒 Book' },
  { id: 'summary', label: '📋 Trip Summary', shortLabel: '📋 Summary' },
];

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState('chat');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [members, setMembers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tripPassword, setTripPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isMember, setIsMember] = useState(null);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    tripApi.getById(id).then(r => setTrip(r.data)).catch(() => navigate('/dashboard'));
    loadMembers();
  }, [id]);

  useEffect(() => {
    if (membersLoaded && user) {
      if (members.length === 0) {
        setIsMember(true);
      } else {
        const found = members.some(m => m.id === user.id || m.email === user.email);
        setIsMember(found);
      }
    }
  }, [members, user, membersLoaded]);

  const loadMembers = () => {
    tripApi.getMembers(id).then(r => { setMembers(r.data); setMembersLoaded(true); }).catch(() => { setMembersLoaded(true); });
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      const { data } = await tripApi.invite(id, inviteEmail.trim());
      setInviteMsg(data.message || 'Member added!');
      setInviteEmail('');
      loadMembers();
      setTimeout(() => setInviteMsg(''), 3000);
    } catch (err) {
      setInviteMsg(err.response?.data?.error || 'Failed to invite');
    }
  };

  const removeMember = async (userId) => {
    await tripApi.removeMember(id, userId, user?.email);
    loadMembers();
  };

  const refreshCart = () => {
    if (user?.id) cartApi.getItems(parseInt(id), user.id).then(r => setCartCount(r.data.length));
  };

  useEffect(() => { refreshCart(); }, [id]);

  const isLeader = trip?.createdBy === user?.name || trip?.createdBy === user?.email;

  if (!trip) return (
    <div className="pt-28 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white/40">Loading your trip...</p>
      </div>
    </div>
  );

  return (
    <div className="pt-24 sm:pt-28 px-4 sm:px-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-white/40 hover:text-white transition-colors text-sm mb-3 inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to trips
        </button>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-bold">{trip.destination || 'Trip'}</h1>
              {isLeader && (
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium flex items-center gap-1">
                  👑 Leader
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-white/40 text-sm sm:text-base flex-wrap">
              {trip.startDate && <span className="flex items-center gap-1">📅 {trip.startDate} — {trip.endDate}</span>}
              {trip.budget && <span className="flex items-center gap-1">💰 ₹{Number(trip.budget).toLocaleString()}</span>}
              {trip.travelStyle && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                  {trip.travelStyle}
                </span>
              )}
            </div>
            {trip.description && <p className="text-white/50 mt-2 text-sm sm:text-base">{trip.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-3 py-2 bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-xl text-sm text-white/60 hover:text-white transition-colors">
              📍 Guide
            </button>
            <button onClick={() => setCartOpen(true)}
              className="relative px-3 py-2 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-xl text-sm text-white/60 hover:text-white transition-colors">
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setInviteOpen(true)}
              className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-sm text-emerald-400 transition-colors">
              👥 Members ({members.length})
            </button>
          </div>
        </div>

        {/* Member avatars */}
        {members.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {members.slice(0, 6).map(m => (
                <div key={m.id} className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-slate-900 flex items-center justify-center text-sm font-medium" title={m.name}>
                  {m.name?.charAt(0)?.toUpperCase()}
                </div>
              ))}
              {members.length > 6 && (
                <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-slate-900 flex items-center justify-center text-sm">
                  +{members.length - 6}
                </div>
              )}
            </div>
            <span className="text-white/30 text-sm">{members.map(m => m.name).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all ${
              tab === t.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}>
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex gap-6">
        <div className={`flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[500px] ${sidebarOpen ? 'max-w-[calc(100%-320px)]' : ''}`}>
          {tab === 'chat' && <ChatBot tripId={parseInt(id)} members={members} />}
          {tab === 'ideas' && <IdeasBoard tripId={parseInt(id)} />}
          {tab === 'itinerary' && <Itinerary tripId={parseInt(id)} />}
          {tab === 'bookings' && <Bookings tripId={parseInt(id)} trip={trip} onCartUpdate={refreshCart} members={members} />}
          {tab === 'summary' && <TripSummary tripId={parseInt(id)} trip={trip} />}
        </div>

        {sidebarOpen && (
          <div className="hidden lg:block w-[300px] shrink-0 bg-white/5 border border-white/10 rounded-2xl overflow-y-auto max-h-[700px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-emerald-400">📍 Travel Guide</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TravelSidebar destination={trip.destination} />
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <Cart tripId={parseInt(id)} open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => {
        refreshCart();
        if (window.__refreshNavbarWallet) window.__refreshNavbarWallet();
      }} />

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInviteOpen(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              👥 Trip Members
              <span className="text-sm text-white/40 font-normal">({members.length})</span>
            </h3>

            {isLeader && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-300 text-sm font-medium mb-2">🔒 Trip Password</p>
                <div className="flex gap-2">
                  <input type="text" value={tripPassword} onChange={e => setTripPassword(e.target.value)}
                    placeholder={trip?.tripPassword || 'Set a password...'}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:border-amber-500 focus:outline-none" />
                  <button onClick={async () => {
                    await tripApi.setPassword(id, tripPassword);
                    setTrip({ ...trip, tripPassword });
                    setTripPassword('');
                  }} className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
                    Set
                  </button>
                </div>
                {trip?.tripPassword && <p className="text-amber-300/60 text-xs mt-1">Current: {trip.tripPassword}</p>}
              </div>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-medium">
                      {m.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {m.name}
                        {(trip?.createdBy === m.name || trip?.createdBy === m.email) && <span className="text-amber-400 text-xs">👑</span>}
                      </p>
                      <p className="text-xs text-white/30">{m.email}</p>
                    </div>
                  </div>
                  {isLeader && trip?.createdBy !== m.name && trip?.createdBy !== m.email && (
                    <button onClick={() => removeMember(m.id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {members.length === 0 && <p className="text-white/30 text-sm text-center py-4">No members yet</p>}
            </div>

            <div className="flex gap-2">
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="Enter email to invite..."
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:border-emerald-500 focus:outline-none" />
              <button onClick={inviteMember}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-sm font-medium transition-colors">
                Invite
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/40 text-sm mb-2">Share invite link</p>
              <button onClick={() => {
                const link = `${window.location.href.split('#')[0]}#/trip/${id}`;
                const pw = trip?.tripPassword ? `\nPassword: ${trip.tripPassword}` : '';
                const text = `Join my trip to ${trip?.destination || 'an adventure'} on WanderTribe! ${link}${pw}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
                className="w-full py-3 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 rounded-xl text-green-400 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share on WhatsApp {trip?.tripPassword ? '(includes password)' : ''}
              </button>
            </div>

            {inviteMsg && (
              <p className={`text-sm mt-3 ${inviteMsg.includes('Failed') || inviteMsg.includes('No user') ? 'text-red-400' : 'text-emerald-400'}`}>
                {inviteMsg}
              </p>
            )}

            <button onClick={() => setInviteOpen(false)}
              className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/60 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications (real-time) */}
      <ToastNotifications tripId={parseInt(id)} />

      {/* Join Gate for non-members */}
      {isMember === false && !isLeader && trip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-sm mx-4 text-center">
            <span className="text-5xl block mb-4">🔒</span>
            <h3 className="text-2xl font-bold mb-2">Join this Trip</h3>
            <p className="text-white/50 mb-6">Enter the trip password to access <span className="text-emerald-400">{trip.destination}</span></p>
            <input type="text" value={joinPassword} onChange={e => setJoinPassword(e.target.value)}
              placeholder="Enter trip password..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none mb-3" />
            {joinError && <p className="text-red-400 text-sm mb-3">{joinError}</p>}
            <button onClick={async () => {
              try {
                await tripApi.joinTrip(id, user.email, joinPassword);
                setIsMember(true);
                loadMembers();
                setJoinError('');
              } catch (err) {
                setJoinError(err.response?.data?.error || 'Wrong password');
              }
            }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-semibold transition-all">
              Join Trip
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full mt-3 py-2.5 text-white/40 hover:text-white transition-colors text-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
