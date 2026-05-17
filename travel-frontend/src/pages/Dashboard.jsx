import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tripApi, walletApi, bookingApi } from '../api';

const DESTINATION_IMAGES = {
  'manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600',
  'kashmir': 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=600',
  'srinagar': 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=600',
  'shimla': 'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=600',
  'spiti': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600',
  'kasol': 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=600',
  'rishikesh': 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=600',
  'gulmarg': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
  'dharamshala': 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600',
  'leh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'ladakh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'pahalgam': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
};

const SUGGESTED = [
  { name: 'Manali', tag: 'Snow & Adventure', img: DESTINATION_IMAGES.manali },
  { name: 'Kashmir', tag: 'Paradise on Earth', img: DESTINATION_IMAGES.kashmir },
  { name: 'Spiti Valley', tag: 'Moonscape & Monks', img: DESTINATION_IMAGES.spiti },
  { name: 'Kasol', tag: 'Riverside & Chill', img: DESTINATION_IMAGES.kasol },
  { name: 'Rishikesh', tag: 'Rafting & Yoga', img: DESTINATION_IMAGES.rishikesh },
  { name: 'Gulmarg', tag: 'Skiing & Meadows', img: DESTINATION_IMAGES.gulmarg },
  { name: 'Leh Ladakh', tag: 'High Altitude Magic', img: DESTINATION_IMAGES.leh },
  { name: 'Dharamshala', tag: 'Tibetan Vibes', img: DESTINATION_IMAGES.dharamshala },
];

function getTripImage(destination) {
  if (!destination) return null;
  const key = destination.toLowerCase().trim();
  for (const [k, v] of Object.entries(DESTINATION_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ destination: '', startDate: '', endDate: '', budget: '', travelStyle: '', description: '' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    tripApi.getAll().then(r => setTrips(r.data));
    walletApi.getBalance(user.id).then(r => setWallet(r.data)).catch(() => {});
  }, []);

  const createTrip = async (e) => {
    e.preventDefault();
    const { data } = await tripApi.create({ ...form, createdBy: user.name });
    setTrips([...trips, data]);
    setShowForm(false);
    setForm({ destination: '', startDate: '', endDate: '', budget: '', travelStyle: '', description: '' });
  };

  const deleteTrip = async (id) => {
    await tripApi.remove(id);
    setTrips(trips.filter(t => t.id !== id));
  };

  return (
    <div className="pt-24 sm:pt-28 px-4 sm:px-6 max-w-7xl mx-auto pb-20">
      {/* Welcome Hero */}
      <div className="mb-10 p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-violet-500/10 border border-emerald-500/20 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/50 text-base sm:text-lg">{getGreeting()},</p>
            <h1 className="text-3xl sm:text-5xl font-bold mt-1">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{user?.name || 'Explorer'}</span>
            </h1>
            <p className="text-white/40 text-base mt-2">Ready for your next mountain adventure?</p>
          </div>
          <div className="flex items-center gap-3">
            {wallet && (
              <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-emerald-400 text-2xl font-bold">₹{wallet.balance?.toLocaleString()}</p>
                <p className="text-white/40 text-sm">Wallet</p>
              </div>
            )}
            <button onClick={() => setShowForm(!showForm)}
              className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-2xl font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
              {showForm ? 'Cancel' : '+ New Trip'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: 'Total Trips', value: trips.length, icon: '🗺️' },
            { label: 'Destinations', value: [...new Set(trips.map(t => t.destination).filter(Boolean))].length, icon: '📍' },
            { label: 'Budget Planned', value: '₹' + trips.reduce((s, t) => s + (Number(t.budget) || 0), 0).toLocaleString(), icon: '💰' },
            { label: 'Wallet Balance', value: wallet ? '₹' + wallet.balance?.toLocaleString() : '₹0', icon: '💳' },
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl text-center hover:bg-white/10 transition-colors">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-white font-bold text-xl sm:text-2xl mt-1">{stat.value}</p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Trip Form */}
      {showForm && (
        <form onSubmit={createTrip} className="mb-10 p-6 sm:p-8 bg-white/5 border border-white/10 rounded-2xl space-y-5 animate-fadeIn">
          <h3 className="text-2xl font-bold mb-2">Plan a New Adventure</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Destination (e.g., Manali, Kashmir, Spiti)" required value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none transition-colors" />
            <select value={form.travelStyle} onChange={e => setForm({ ...form, travelStyle: e.target.value })}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:border-emerald-500 focus:outline-none transition-colors">
              <option value="">Travel Style</option>
              <option value="luxury">Luxury</option>
              <option value="backpacker">Backpacker</option>
              <option value="adventure">Adventure</option>
              <option value="chill">Chill & Relax</option>
              <option value="spiritual">Spiritual</option>
              <option value="offroad">Offroad & Camping</option>
            </select>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:border-emerald-500 focus:outline-none transition-colors" />
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base focus:border-emerald-500 focus:outline-none transition-colors" />
            <input type="text" placeholder="Budget in INR (e.g., 20000)" value={form.budget}
              onChange={e => setForm({ ...form, budget: e.target.value })}
              className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none transition-colors" />
          </div>
          <textarea placeholder="Describe your dream trip... (e.g., Want to see snowfall, try local food, visit temples)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-emerald-500 focus:outline-none resize-none transition-colors" />
          <button type="submit" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl font-semibold text-base transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
            Create Trip
          </button>
        </form>
      )}

      {/* My Trips */}
      <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Your Trips</h2>
        {trips.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <span className="text-7xl block mb-6">🏔️</span>
            <p className="text-2xl font-semibold mb-2">No trips yet</p>
            <p className="text-lg">Create your first mountain adventure!</p>
            <button onClick={() => setShowForm(true)}
              className="mt-6 px-6 py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-colors text-base font-medium">
              + Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="h-44 relative overflow-hidden">
                  {getTripImage(trip.destination) ? (
                    <img src={getTripImage(trip.destination)} alt={trip.destination} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 flex items-center justify-center">
                      <span className="text-5xl">🏔️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-2xl font-bold drop-shadow-lg">{trip.destination || 'Untitled Trip'}</h3>
                    <p className="text-white/60 text-sm mt-1">by {trip.createdBy}</p>
                  </div>
                </div>
                <div className="p-5">
                  {trip.startDate && <p className="text-white/50 text-base mb-3">📅 {trip.startDate} — {trip.endDate}</p>}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {trip.travelStyle && (
                      <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm rounded-full font-medium">
                        {trip.travelStyle}
                      </span>
                    )}
                    {trip.budget && (
                      <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 text-sm rounded-full font-medium">
                        ₹{Number(trip.budget).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {trip.description && (
                    <p className="text-white/40 text-sm mb-4 line-clamp-2">{trip.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Link to={`/trip/${trip.id}`}
                      className="flex-1 text-center py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-base font-medium transition-all hover:scale-105">
                      Open Trip
                    </Link>
                    <button onClick={() => deleteTrip(trip.id)}
                      className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-base transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Destinations */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Explore Destinations</h2>
        <p className="text-white/40 text-base mb-6">Tap to create a trip to any of these incredible places</p>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {SUGGESTED.map((dest, i) => (
            <button key={i} onClick={() => { setForm({ ...form, destination: dest.name }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="shrink-0 w-44 sm:w-52 group">
              <div className="h-32 sm:h-36 rounded-2xl overflow-hidden mb-3 border border-white/10 group-hover:border-emerald-500/30 transition-all">
                <img src={dest.img} alt={dest.name} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-semibold text-base group-hover:text-emerald-400 transition-colors">{dest.name}</h4>
              <p className="text-white/40 text-sm">{dest.tag}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
