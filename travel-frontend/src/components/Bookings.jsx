import { useState, useEffect, useMemo } from 'react';
import { bookingApi, cartApi, proposalApi } from '../api';

const MOCK_HOTELS = [
  { name: 'Mountain View Resort', price: 3500, rating: 4.5, location: 'Manali', type: 'HOTEL',
    desc: 'Valley-facing rooms, bonfire nights, 2 min from Mall Road',
    view: 'Wake up to snow-capped Dhauladhar peaks with the Beas River glimmering below.',
    vibe: 'Cozy & Warm', distance: '2 min walk to Mall Road',
    amenities: ['Mountain View', 'Bonfire', 'Room Service', 'Parking', 'Wi-Fi', 'Hot Water 24/7'],
    payment: 'UPI/Card accepted',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  { name: 'Pine Valley Homestay', price: 1200, rating: 4.2, location: 'Kasol', type: 'HOTEL',
    desc: 'Riverside wooden cottage, home-cooked Himachali food included',
    view: 'Fall asleep to the sound of Parvati River rushing below.',
    vibe: 'Rustic & Authentic', distance: '5 min walk to Kasol market',
    amenities: ['Riverside', 'Home Food', 'Bonfire', 'Garden'],
    payment: 'Cash preferred, limited UPI',
    img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400' },
  { name: 'Snow Peak Lodge', price: 5000, rating: 4.8, location: 'Shimla', type: 'HOTEL',
    desc: 'Heritage property near Ridge, colonial architecture, in-house spa',
    view: 'Grand colonial windows frame the Shimla skyline.',
    vibe: 'Luxury Heritage', distance: '3 min walk to The Ridge',
    amenities: ['Heritage Building', 'Spa', 'Restaurant', 'Room Service', 'Fireplace'],
    payment: 'All cards accepted',
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
  { name: 'Riverside Camp', price: 800, rating: 4.0, location: 'Rishikesh', type: 'HOTEL',
    desc: 'Tent camping by Ganges, rafting packages included',
    view: 'Sit by the bonfire under a billion stars with the Ganges flowing nearby.',
    vibe: 'Adventure & Wild', distance: 'On the Ganges bank',
    amenities: ['Riverside', 'Bonfire', 'Rafting', 'Meals Included'],
    payment: 'Cash only at camp',
    img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400' },
  { name: 'Dal Lake Houseboat', price: 4000, rating: 4.7, location: 'Srinagar', type: 'HOTEL',
    desc: 'Luxury houseboat on Dal Lake, shikara pickup, Kashmiri wazwan dinner',
    view: 'Floating on mirror-still Dal Lake with Pir Panjal reflected in the water.',
    vibe: 'Royal & Serene', distance: 'On Dal Lake',
    amenities: ['Lake View', 'Shikara Ride', 'Wazwan Dinner', 'Heater'],
    payment: 'Cash + UPI',
    img: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=400' },
  { name: 'Apple Orchard Cottage', price: 2000, rating: 4.3, location: 'Naggar', type: 'HOTEL',
    desc: 'Quiet village stay surrounded by apple orchards, organic breakfast',
    view: 'Surrounded by apple and cherry blossoms in spring.',
    vibe: 'Peaceful & Green', distance: '3 km from Naggar Castle',
    amenities: ['Orchard View', 'Organic Food', 'Garden', 'Quiet Zone'],
    payment: 'Cash preferred',
    img: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=400' },
  { name: 'The Village Cafe & Stay', price: 1500, rating: 4.4, location: 'Tosh', type: 'HOTEL',
    desc: 'Hippie vibe cafe with stay options, serves amazing Israeli food',
    view: 'Unobstructed view of the Parvati valley and snow peaks.',
    vibe: 'Hippie & Relaxed', distance: 'Heart of Tosh village',
    amenities: ['Cafe', 'Music', 'Valley View', 'Bonfire'],
    payment: 'Cash preferred',
    img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400' },
  { name: 'Zostel', price: 1000, rating: 4.6, location: 'Spiti', type: 'HOTEL',
    desc: 'Asia highest backpacker hostel, vibrant community',
    view: 'Barren cold desert mountains touching the blue sky.',
    vibe: 'Backpacker & Social', distance: 'In Kaza',
    amenities: ['Dorms', 'Common Room', 'WiFi', 'Cafe'],
    payment: 'Cards/UPI accepted',
    img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' },
  { name: 'Solang Ski Resort', price: 6000, rating: 4.7, location: 'Manali', type: 'HOTEL',
    desc: 'Luxury stay at Solang Valley, perfect for winter sports',
    view: 'Panoramic views of the snow-clad Solang Valley.',
    vibe: 'Luxury & Adventure', distance: '12 km from Mall Road',
    amenities: ['Skiing', 'Spa', 'Restaurant', 'Room Service'],
    payment: 'All cards accepted',
    img: 'https://images.unsplash.com/photo-1512273222628-4daea6e55abb?w=400' },
  { name: 'Backpacker Panda', price: 800, rating: 4.4, location: 'Manali', type: 'HOTEL',
    desc: 'Vibrant hostel in Old Manali, great for solo travelers',
    view: 'Apple orchards and the old Manali village.',
    vibe: 'Backpacker & Social', distance: 'Old Manali, 2 km from Mall Road',
    amenities: ['Dorms', 'Common Room', 'WiFi', 'Cafe'],
    payment: 'Cash/UPI accepted',
    img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
];

const MOCK_CABS = [
  { name: 'Mountain Wheels - Innova Crysta', price: 3000, rating: 4.6, type: 'CAB',
    desc: 'Best for families of 5-6, AC, music system', route: 'Delhi-Manali, Chandigarh-Shimla',
    feel: 'Smooth highway cruiser. Captain seats in middle row.',
    amenities: ['AC', '7-Seater', 'Music System', 'USB Charging'],
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
  { name: 'Hill Taxi - Swift Dzire', price: 1800, rating: 4.3, type: 'CAB',
    desc: 'Budget friendly sedan for 2-3 people', route: 'Airport transfers, local sightseeing',
    feel: 'Nimble on narrow mountain roads.',
    amenities: ['AC', '4-Seater', 'Fuel Efficient'],
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400' },
  { name: 'Valley Rides - Tempo Traveller', price: 4500, rating: 4.5, type: 'CAB',
    desc: 'Perfect for large groups, pushback seats', route: 'Group trips, multi-day tours',
    feel: 'Your gang gets its own bus. Pushback seats for napping.',
    amenities: ['AC', '12-Seater', 'Pushback Seats', 'Luggage Rack'],
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400' },
  { name: 'Adventure Jeep - Thar 4x4', price: 3500, rating: 4.8, type: 'CAB',
    desc: 'Offroad beast for Spiti, Rohtang, unpaved tracks', route: 'Spiti circuit, Leh highway',
    feel: 'Roaring through river crossings, roof off under blue sky.',
    amenities: ['4x4', 'Offroad Ready', 'Roof Open'],
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' },
];

const MOCK_DRIVERS = [
  { name: 'Raju Singh', price: 1500, rating: 4.9, type: 'DRIVER',
    bio: '10 years mountain driving experience', expertise: 'Kullu-Manali specialist',
    languages: 'Hindi, English, Punjabi',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { name: 'Mohan Thakur', price: 1200, rating: 4.7, type: 'DRIVER',
    bio: 'Local Himachali guide + driver', expertise: 'Parvati Valley trails',
    languages: 'Hindi, Pahari, English',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
  { name: 'Vikram Negi', price: 1800, rating: 4.8, type: 'DRIVER',
    bio: 'Spiti Valley specialist, 200+ trips', expertise: 'Spiti/Kinnaur master',
    languages: 'Hindi, English',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
];

const MOCK_FOOD_STALLS = [
  { name: 'Sharma Dhaba - Manali', price: 300, rating: 4.6, type: 'FOOD_STALL', location: 'Manali',
    desc: 'Famous Siddhu & Thukpa, served hot with homemade chutney since 1985',
    signature: 'Siddhu with ghee (₹60), Thukpa (₹120), Momos (₹80)',
    vibe: 'Authentic & Rustic', timing: '7 AM - 10 PM',
    img: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400' },
  { name: 'Evergreen Cafe - Kasol', price: 400, rating: 4.5, type: 'FOOD_STALL', location: 'Kasol',
    desc: 'Israeli-Indian fusion, riverside seating, best shakshouka in Parvati Valley',
    signature: 'Shakshouka (₹180), Falafel Plate (₹200), Banana Pancake (₹120)',
    vibe: 'Hippie & Chill', timing: '8 AM - 11 PM',
    img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400' },
  { name: 'Lhasa Kitchen - McLeodganj', price: 350, rating: 4.7, type: 'FOOD_STALL', location: 'Dharamshala',
    desc: 'Authentic Tibetan cuisine, handmade noodles, monastery view terrace',
    signature: 'Thentuk (₹150), Shapta (₹200), Butter Tea (₹40)',
    vibe: 'Peaceful & Authentic', timing: '9 AM - 9 PM',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
  { name: 'Wazwan House - Srinagar', price: 500, rating: 4.8, type: 'FOOD_STALL', location: 'Srinagar',
    desc: 'Traditional Kashmiri wazwan feast, Rogan Josh & Gushtaba specialists',
    signature: 'Rogan Josh (₹250), Gushtaba (₹200), Noon Chai (₹50)',
    vibe: 'Royal & Traditional', timing: '11 AM - 10 PM',
    img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400' },
  { name: 'Chacha Chai - Spiti', price: 200, rating: 4.4, type: 'FOOD_STALL', location: 'Spiti Valley',
    desc: 'Roadside chai with a view at 13,000ft, maggi & paranthas',
    signature: 'Chai (₹30), Maggi (₹60), Aloo Parantha (₹80)',
    vibe: 'Roadside & Raw', timing: '6 AM - 8 PM',
    img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400' },
];

function getDays(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const s = new Date(startDate), e = new Date(endDate);
  const days = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function Bookings({ tripId, trip, onCartUpdate, members = [] }) {
  const [tab, setTab] = useState('HOTEL');
  const [bookings, setBookings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [adding, setAdding] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const [proposalDate, setProposalDate] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const tripDays = useMemo(() => getDays(trip?.startDate, trip?.endDate), [trip?.startDate, trip?.endDate]);

  useEffect(() => {
    bookingApi.getByTrip(tripId).then(r => setBookings(r.data));
    if (user?.id) cartApi.getItems(tripId, user.id).then(r => setCartItems(r.data));
    proposalApi.getAll(tripId).then(r => setProposals(r.data)).catch(() => {});
  }, [tripId]);

  const bookedNames = new Set(bookings.map(b => b.providerName));
  const cartNames = new Set(cartItems.map(c => c.itemName));
  const proposedNames = new Set(proposals.filter(p => p.status === 'PENDING').map(p => p.itemName));

  const proposeItem = async (item) => {
    const date = proposalDate || tripDays[0] || '';
    setAdding(item.name);
    try {
      await proposalApi.create(tripId, {
        userId: String(user?.id), userName: user?.name, itemType: item.type,
        itemName: item.name, itemDetails: JSON.stringify(item),
        price: String(item.price), proposedDate: date,
      });
      const r = await proposalApi.getAll(tripId);
      setProposals(r.data);
    } catch {}
    setAdding(null);
  };

  const voteOnProposal = async (proposalId, vote) => {
    try {
      await proposalApi.vote(tripId, proposalId, user?.id, user?.name, vote);
      const r = await proposalApi.getAll(tripId);
      setProposals(r.data);
      if (onCartUpdate) onCartUpdate();
    } catch {}
  };

  const TABS = [
    ['HOTEL', '🏨 Hotels'], ['CAB', '🚗 Cabs'], ['DRIVER', '👤 Drivers'],
    ['FOOD_STALL', '🍜 Food Stalls'], ['PROPOSALS', '📋 Proposals'],
  ];

  const allItems = tab === 'HOTEL' ? MOCK_HOTELS : tab === 'CAB' ? MOCK_CABS :
    tab === 'DRIVER' ? MOCK_DRIVERS : tab === 'FOOD_STALL' ? MOCK_FOOD_STALLS : [];

  const items = allItems.filter(item => {
    if (!trip?.destination || !item.location) return true;
    const dest = trip.destination.toLowerCase();
    const loc = item.location.toLowerCase();
    return dest.includes(loc) || loc.includes(dest);
  });

  const pendingProposals = proposals.filter(p => p.status === 'PENDING');
  const approvedProposals = proposals.filter(p => p.status === 'APPROVED');

  return (
    <div className="p-4 sm:p-6">
      {/* Tab Bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setExpanded(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
              tab === key ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}>
            {label}
            {key === 'PROPOSALS' && pendingProposals.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full text-xs flex items-center justify-center text-black font-bold">
                {pendingProposals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date Timeline */}
      {tripDays.length > 0 && tab !== 'PROPOSALS' && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSelectedDate('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedDate === 'all' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50'}`}>
            All Dates
          </button>
          {tripDays.map(d => {
            const dayLabel = new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
            const hasProposal = proposals.some(p => p.proposedDate === d && p.status === 'PENDING');
            return (
              <button key={d} onClick={() => { setSelectedDate(d); setProposalDate(d); }}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all relative ${selectedDate === d ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50'}`}>
                {dayLabel}
                {hasProposal && <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Proposals Tab */}
      {tab === 'PROPOSALS' && (
        <div className="space-y-4">
          {pendingProposals.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 text-amber-400">Pending Proposals - Vote Now!</h3>
              <div className="space-y-3">
                {pendingProposals.map(p => (
                  <ProposalCard key={p.id} proposal={p} members={members} user={user} onVote={voteOnProposal} />
                ))}
              </div>
            </div>
          )}
          {approvedProposals.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-3 text-emerald-400">Approved (Added to Cart)</h3>
              <div className="space-y-3">
                {approvedProposals.map(p => (
                  <ProposalCard key={p.id} proposal={p} members={members} user={user} onVote={voteOnProposal} />
                ))}
              </div>
            </div>
          )}
          {proposals.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <span className="text-5xl block mb-4">📋</span>
              <p className="text-xl">No proposals yet</p>
              <p className="text-sm mt-2">Propose hotels, cabs, or food stalls from the other tabs. All members must approve before it's added to cart.</p>
            </div>
          )}
        </div>
      )}

      {/* Item cards */}
      {tab !== 'PROPOSALS' && (
        <div className="space-y-4 mb-8">
          <div className="mb-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
            <p className="text-violet-300 text-sm">
              <span className="font-semibold">Propose, don't add directly!</span> Click "Propose" and all group members must vote to approve before it gets added to the cart.
            </p>
          </div>
          {items.map((item, i) => {
            const isExpanded = expanded === i;
            const inCart = cartNames.has(item.name);
            const isBooked = bookedNames.has(item.name);
            const isPending = proposedNames.has(item.name);
            return (
              <div key={i} className={`bg-white/5 border rounded-xl transition-all overflow-hidden ${
                isExpanded ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'border-white/10 hover:border-emerald-500/20'
              }`}>
                <div className="flex gap-4 p-4 sm:p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : i)}>
                  <div className="w-24 h-24 sm:w-32 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-white/10">
                    <img src={item.img} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-lg sm:text-xl">{item.name}</h4>
                        {item.location && <p className="text-white/50 text-sm">📍 {item.location}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-emerald-400 font-bold text-xl">₹{item.price.toLocaleString()}</span>
                        <span className="text-white/30 text-xs block">/day</span>
                      </div>
                    </div>
                    <p className="text-white/40 text-sm mt-1 line-clamp-2">{item.desc || item.bio}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-yellow-400 text-sm">★ {item.rating}</span>
                      {item.vibe && <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">{item.vibe}</span>}
                      {isPending && <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full">Proposed</span>}
                      {inCart && <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full">In Cart</span>}
                      {isBooked && <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">Booked</span>}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-white/5 space-y-3 animate-fadeIn">
                    {(item.view || item.feel) && (
                      <div className="p-3 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10 rounded-lg">
                        <p className="text-white/60 text-sm italic">"{item.view || item.feel}"</p>
                      </div>
                    )}
                    {item.signature && (
                      <div className="flex items-start gap-2">
                        <span>🍽️</span>
                        <div>
                          <span className="text-white/40 text-xs block">Signature Dishes</span>
                          <p className="text-white/70 text-sm">{item.signature}</p>
                        </div>
                      </div>
                    )}
                    {item.timing && (
                      <div className="flex items-start gap-2"><span>🕐</span><p className="text-white/70 text-sm">{item.timing}</p></div>
                    )}
                    {item.distance && <div className="flex items-start gap-2"><span>📏</span><p className="text-white/70 text-sm">{item.distance}</p></div>}
                    {item.route && <div className="flex items-start gap-2"><span>🛣️</span><p className="text-white/70 text-sm">{item.route}</p></div>}
                    {item.expertise && <div className="flex items-start gap-2"><span>🎯</span><p className="text-white/70 text-sm">{item.expertise}</p></div>}
                    {item.amenities && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.amenities.map((a, j) => (
                          <span key={j} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs">{a}</span>
                        ))}
                      </div>
                    )}
                    {item.payment && <p className="text-amber-400/70 text-xs">💳 {item.payment}</p>}

                    {tripDays.length > 0 && (item.type === 'HOTEL' || item.type === 'FOOD_STALL') && (
                      <div>
                        <label className="text-white/40 text-xs block mb-1">For which date?</label>
                        <select value={proposalDate} onChange={e => setProposalDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-emerald-500 focus:outline-none">
                          <option value="">Select date</option>
                          {tripDays.map(d => (
                            <option key={d} value={d}>{new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); proposeItem(item); }}
                      disabled={inCart || isBooked || isPending || adding === item.name}
                      className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                        isBooked ? 'bg-emerald-500/20 text-emerald-400 cursor-default' :
                        inCart ? 'bg-cyan-500/20 text-cyan-400 cursor-default' :
                        isPending ? 'bg-amber-500/20 text-amber-400 cursor-default' :
                        adding === item.name ? 'bg-white/10 text-white/50 cursor-wait' :
                        'bg-gradient-to-r from-violet-500 to-emerald-500 hover:from-violet-400 hover:to-emerald-400 hover:scale-[1.01] text-white shadow-lg'
                      }`}>
                      {isBooked ? '✓ Already Booked' :
                       inCart ? '🛒 In Cart' :
                       isPending ? '⏳ Pending Approval' :
                       adding === item.name ? 'Proposing...' :
                       `📋 Propose to Group — ₹${item.price.toLocaleString()}/day`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {bookings.length > 0 && tab !== 'PROPOSALS' && (
        <div>
          <h3 className="text-xl font-bold mb-4">Your Confirmed Bookings</h3>
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <span className="font-medium">{b.providerName}</span>
                  <span className="ml-3 text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">{b.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400 font-bold">₹{b.price?.toLocaleString()}</span>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                    b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProposalCard({ proposal, members, user, onVote }) {
  let details = null;
  try { details = JSON.parse(proposal.itemDetails); } catch {}

  const votes = proposal.votes || [];
  const approves = votes.filter(v => v.vote === 'APPROVE').length;
  const rejects = votes.filter(v => v.vote === 'REJECT').length;
  const total = Math.max(members.length, 1);
  const myVote = votes.find(v => v.userId === user?.id);
  const isPending = proposal.status === 'PENDING';

  return (
    <div className={`p-4 rounded-xl border ${
      proposal.status === 'APPROVED' ? 'border-emerald-500/30 bg-emerald-500/5' :
      proposal.status === 'REJECTED' ? 'border-red-500/30 bg-red-500/5' :
      'border-amber-500/20 bg-white/5'
    }`}>
      <div className="flex gap-3">
        {details?.img && (
          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden">
            <img src={details.img} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-base">{proposal.itemName}</h4>
              <p className="text-white/40 text-xs">
                Proposed by {proposal.proposedByName} {proposal.proposedDate && `for ${proposal.proposedDate}`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">₹{proposal.price?.toLocaleString()}</span>
              <span className={`block text-xs px-2 py-0.5 rounded-full mt-1 ${
                proposal.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                proposal.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>{proposal.status}</span>
            </div>
          </div>

          {/* Vote Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>{approves}/{total} approved</span>
              <span>{rejects} rejected</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 transition-all" style={{ width: `${(approves / total) * 100}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${(rejects / total) * 100}%` }} />
            </div>
          </div>

          {/* Vote buttons */}
          {isPending && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => onVote(proposal.id, 'APPROVE')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  myVote?.vote === 'APPROVE' ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:border-emerald-500/40 hover:text-emerald-400'
                }`}>
                {myVote?.vote === 'APPROVE' ? '✓ Approved' : '👍 Approve'}
              </button>
              <button onClick={() => onVote(proposal.id, 'REJECT')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  myVote?.vote === 'REJECT' ? 'bg-red-500 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:border-red-500/40 hover:text-red-400'
                }`}>
                {myVote?.vote === 'REJECT' ? '✓ Rejected' : '👎 Reject'}
              </button>
            </div>
          )}

          {/* Voter names */}
          {votes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {votes.map((v, i) => (
                <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                  v.vote === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {v.userName} {v.vote === 'APPROVE' ? '👍' : '👎'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
