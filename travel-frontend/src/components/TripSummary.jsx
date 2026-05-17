import { useState, useEffect } from 'react';
import { bookingApi, tripApi } from '../api';

const DESTINATION_IMAGES = {
  'manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
  'kashmir': 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800',
  'srinagar': 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800',
  'shimla': 'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=800',
  'spiti': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800',
  'kasol': 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800',
  'rishikesh': 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800',
  'gulmarg': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  'leh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'ladakh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
};

function getDestImage(dest) {
  if (!dest) return null;
  const lower = dest.toLowerCase();
  for (const [k, v] of Object.entries(DESTINATION_IMAGES)) {
    if (lower.includes(k)) return v;
  }
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
}

export default function TripSummary({ tripId, trip }) {
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    Promise.all([
      bookingApi.getByTrip(tripId).then(r => setBookings(r.data)),
      tripApi.getMembers(tripId).then(r => setMembers(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [tripId]);

  const hotels = bookings.filter(b => b.type === 'HOTEL');
  const cabs = bookings.filter(b => b.type === 'CAB');
  const drivers = bookings.filter(b => b.type === 'DRIVER');
  const totalSpent = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const isLeader = trip?.createdBy === user?.name || trip?.createdBy === user?.email;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative h-56 sm:h-72 overflow-hidden rounded-b-3xl">
        <img src={getDestImage(trip?.destination)} alt={trip?.destination} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">{trip?.destination || 'Trip'}</h2>
              <div className="flex items-center gap-4 mt-2 text-white/70 text-base flex-wrap">
                {trip?.startDate && <span>📅 {trip.startDate} — {trip.endDate}</span>}
                {trip?.budget && <span>💰 ₹{Number(trip.budget).toLocaleString()}</span>}
                {trip?.travelStyle && <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">{trip.travelStyle}</span>}
              </div>
            </div>
            {isLeader && (
              <div className="px-4 py-2 bg-amber-500/30 backdrop-blur-sm border border-amber-500/40 rounded-2xl flex items-center gap-2">
                <span className="text-xl">👑</span>
                <span className="text-amber-300 text-base font-semibold">Trip Leader</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
            <p className="text-4xl font-bold text-emerald-400">{bookings.length}</p>
            <p className="text-white/50 text-base mt-1">Bookings</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-2xl text-center">
            <p className="text-4xl font-bold text-cyan-400">₹{totalSpent.toLocaleString()}</p>
            <p className="text-white/50 text-base mt-1">Total Spent</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-2xl text-center">
            <p className="text-4xl font-bold text-violet-400">{members.length}</p>
            <p className="text-white/50 text-base mt-1">Members</p>
          </div>
        </div>

        {/* Members */}
        {members.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span> Trip Members
            </h3>
            <div className="flex flex-wrap gap-4">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center text-lg font-bold">
                    {m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold flex items-center gap-1.5">
                      {m.name}
                      {(trip?.createdBy === m.name || trip?.createdBy === m.email) && <span className="text-amber-400">👑</span>}
                    </p>
                    <p className="text-sm text-white/40">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {hotels.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏨</span> Hotels & Stays
            </h3>
            <div className="space-y-4">
              {hotels.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Cabs */}
        {cabs.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🚗</span> Cabs & Vehicles
            </h3>
            <div className="space-y-4">
              {cabs.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Drivers */}
        {drivers.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span> Drivers
            </h3>
            <div className="space-y-4">
              {drivers.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="text-center py-16 text-white/30">
            <span className="text-6xl block mb-4">📋</span>
            <p className="text-xl font-medium">No bookings yet</p>
            <p className="text-base mt-2">Add items to cart from the Bookings tab and checkout</p>
          </div>
        )}

        {trip?.description && (
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Trip Notes
            </h3>
            <p className="text-white/60 text-base bg-white/5 border border-white/10 rounded-2xl p-5 leading-relaxed">{trip.description}</p>
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
    <div className="flex gap-4 p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-500/20 transition-all">
      {details?.img && (
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden">
          <img src={details.img} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-lg font-semibold">{booking.providerName}</h4>
            {details?.location && <p className="text-white/50 text-base">📍 {details.location}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-emerald-400 font-bold text-xl">₹{booking.price?.toLocaleString()}</p>
            <span className={`text-sm px-3 py-1 rounded-full ${
              booking.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
              booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{booking.status}</span>
          </div>
        </div>
        {details?.vibe && <p className="text-white/40 text-sm mt-1">{details.vibe}</p>}
        {details?.amenities && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {details.amenities.slice(0, 4).map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-xs">{a}</span>
            ))}
            {details.amenities.length > 4 && <span className="text-white/30 text-xs">+{details.amenities.length - 4} more</span>}
          </div>
        )}
      </div>
    </div>
  );
}
