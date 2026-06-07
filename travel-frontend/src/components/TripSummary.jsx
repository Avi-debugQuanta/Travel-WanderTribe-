import { useState, useEffect } from 'react';
import { bookingApi, tripApi, chatApi } from '../api';
import ReactMarkdown from 'react-markdown';

const DESTINATION_IMAGES = {
  'manali': ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  'kashmir': ['https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
  'srinagar': ['https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800'],
  'shimla': ['https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=800'],
  'spiti': ['https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  'kasol': ['https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800'],
  'rishikesh': ['https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800'],
  'gulmarg': ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'],
  'leh': ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800'],
  'ladakh': ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800'],
};

function getDestImages(dest) {
  if (!dest) return ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'];
  const lower = dest.toLowerCase();
  for (const [k, v] of Object.entries(DESTINATION_IMAGES)) {
    if (lower.includes(k)) return v;
  }
  return ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'];
}

export default function TripSummary({ tripId, trip }) {
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const images = getDestImages(trip?.destination);

  useEffect(() => {
    Promise.all([
      bookingApi.getByTrip(tripId).then(r => setBookings(r.data)),
      tripApi.getMembers(tripId).then(r => setMembers(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    if (images.length > 1) {
      const t = setInterval(() => setHeroIdx(i => (i + 1) % images.length), 4000);
      return () => clearInterval(t);
    }
  }, [images.length]);

  const loadAISummary = async () => {
    setAiLoading(true);
    try {
      const { data } = await chatApi.getAISummary(tripId);
      setAiSummary(data.summary);
    } catch {
      setAiSummary('Failed to generate AI summary. Please try again.');
    }
    setAiLoading(false);
  };

  const hotels = bookings.filter(b => b.type === 'HOTEL');
  const cabs = bookings.filter(b => b.type === 'CAB');
  const drivers = bookings.filter(b => b.type === 'DRIVER');
  const foodStalls = bookings.filter(b => b.type === 'FOOD_STALL');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const budget = Number(trip?.budget) || 0;
  const isLeader = trip?.createdBy === user?.name || trip?.createdBy === user?.email;

  const categories = [
    { label: 'Hotels', value: hotels.reduce((s, b) => s + b.price, 0), color: 'bg-emerald-500' },
    { label: 'Cabs', value: cabs.reduce((s, b) => s + b.price, 0), color: 'bg-cyan-500' },
    { label: 'Drivers', value: drivers.reduce((s, b) => s + b.price, 0), color: 'bg-violet-500' },
    { label: 'Food', value: foodStalls.reduce((s, b) => s + b.price, 0), color: 'bg-amber-500' },
  ].filter(c => c.value > 0);

  const tripDays = (() => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    return Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1);
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Gallery */}
      <div className="relative h-56 sm:h-72 overflow-hidden rounded-b-3xl">
        {images.map((img, i) => (
          <img key={i} src={img} alt={trip?.destination}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">{trip?.destination || 'Trip'}</h2>
              <div className="flex items-center gap-4 mt-2 text-white/70 text-base flex-wrap">
                {trip?.startDate && <span>📅 {trip.startDate} — {trip.endDate}</span>}
                {tripDays > 0 && <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">{tripDays} days</span>}
                {trip?.budget && <span>💰 ₹{Number(trip.budget).toLocaleString()}</span>}
                {trip?.travelStyle && <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">{trip.travelStyle}</span>}
              </div>
            </div>
            {isLeader && (
              <div className="px-4 py-2 bg-amber-500/30 backdrop-blur-sm border border-amber-500/40 rounded-2xl flex items-center gap-2">
                <span className="text-xl">👑</span>
                <span className="text-amber-300 text-sm font-semibold">Trip Leader</span>
              </div>
            )}
          </div>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'bg-white w-6' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 space-y-8">
        {/* AI Insights */}
        <div className="p-5 bg-gradient-to-br from-violet-500/10 to-emerald-500/10 border border-violet-500/20 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>🤖</span> AI Trip Insights
            </h3>
            <button onClick={loadAISummary} disabled={aiLoading}
              className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-sm text-violet-300 transition-colors disabled:opacity-50">
              {aiLoading ? 'Analyzing...' : aiSummary ? 'Refresh' : 'Generate Insights'}
            </button>
          </div>
          {aiSummary ? (
            <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0">
              <ReactMarkdown>{aiSummary}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-white/40 text-sm">Click "Generate Insights" for AI-powered analysis of your trip budget, readiness, and recommendations.</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
            <p className="text-3xl font-bold text-emerald-400">{bookings.length}</p>
            <p className="text-white/50 text-sm mt-1">Bookings</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-2xl text-center">
            <p className="text-3xl font-bold text-cyan-400">₹{totalSpent.toLocaleString()}</p>
            <p className="text-white/50 text-sm mt-1">Total Spent</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-2xl text-center">
            <p className="text-3xl font-bold text-violet-400">{members.length}</p>
            <p className="text-white/50 text-sm mt-1">Members</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl text-center">
            <p className={`text-3xl font-bold ${totalSpent > budget ? 'text-red-400' : 'text-amber-400'}`}>
              {budget > 0 ? Math.round((totalSpent / budget) * 100) + '%' : '—'}
            </p>
            <p className="text-white/50 text-sm mt-1">Budget Used</p>
          </div>
        </div>

        {/* Budget Visualization */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span>📊</span> Spending Breakdown</h3>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden flex mb-3">
              {categories.map((c, i) => (
                <div key={i} className={`${c.color} transition-all`}
                  style={{ width: totalSpent > 0 ? `${(c.value / totalSpent) * 100}%` : '0%' }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {categories.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${c.color}`} />
                  <span className="text-sm text-white/60">{c.label}: ₹{c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {members.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span>👥</span> Trip Members</h3>
            <div className="flex flex-wrap gap-3">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-base font-bold">
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      {m.name}
                      {(trip?.createdBy === m.name || trip?.createdBy === m.email) && <span className="text-amber-400">👑</span>}
                    </p>
                    <p className="text-xs text-white/40">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings by Category */}
        {[
          { list: hotels, icon: '🏨', title: 'Hotels & Stays' },
          { list: cabs, icon: '🚗', title: 'Cabs & Vehicles' },
          { list: drivers, icon: '👤', title: 'Drivers' },
          { list: foodStalls, icon: '🍜', title: 'Food Stalls' },
        ].filter(s => s.list.length > 0).map((section, i) => (
          <div key={i}>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>{section.icon}</span> {section.title}
            </h3>
            <div className="space-y-3">
              {section.list.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 text-white/30">
            <span className="text-5xl block mb-4">📋</span>
            <p className="text-xl font-medium">No bookings yet</p>
            <p className="text-sm mt-2">Add items to cart from the Bookings tab and checkout</p>
          </div>
        )}

        {trip?.description && (
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span>📝</span> Trip Notes</h3>
            <p className="text-white/60 text-sm bg-white/5 border border-white/10 rounded-2xl p-4 leading-relaxed">{trip.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }) {
  let details = null;
  try { details = JSON.parse(booking.details); } catch {}

  return (
    <div className="flex gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/20 transition-all">
      {details?.img && (
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden">
          <img src={details.img} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-semibold">{booking.providerName}</h4>
            {details?.location && <p className="text-white/50 text-xs">📍 {details.location}</p>}
            {booking.proposedDate && <p className="text-white/40 text-xs">📅 {booking.proposedDate}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-400 font-bold text-lg">₹{booking.price?.toLocaleString()}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              booking.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
              booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{booking.status}</span>
          </div>
        </div>
        {details?.vibe && <p className="text-white/40 text-xs mt-1">{details.vibe}</p>}
      </div>
    </div>
  );
}
