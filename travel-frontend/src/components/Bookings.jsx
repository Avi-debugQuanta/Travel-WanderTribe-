import { useState, useEffect } from 'react';
import { bookingApi, cartApi } from '../api';

const MOCK_HOTELS = [
  { name: 'Mountain View Resort', price: 3500, rating: 4.5, location: 'Manali', type: 'HOTEL',
    desc: 'Valley-facing rooms, bonfire nights, 2 min from Mall Road',
    view: 'Wake up to snow-capped Dhauladhar peaks with the Beas River glimmering below. Balcony rooms offer 180° mountain panorama.',
    vibe: 'Cozy & Warm', distance: '2 min walk to Mall Road, 15 min to Solang Valley by taxi',
    amenities: ['Mountain View', 'Bonfire', 'Room Service', 'Parking', 'Wi-Fi', 'Hot Water 24/7'],
    payment: 'UPI/Card accepted, 10% off on online booking',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  { name: 'Pine Valley Homestay', price: 1200, rating: 4.2, location: 'Kasol', type: 'HOTEL',
    desc: 'Riverside wooden cottage, home-cooked Himachali food included',
    view: 'Fall asleep to the sound of Parvati River rushing below. Morning mist wraps the pine forest around you.',
    vibe: 'Rustic & Authentic', distance: '5 min walk to Kasol market, on the riverbank',
    amenities: ['Riverside', 'Home Food', 'Bonfire', 'Garden', 'Mountain View'],
    payment: 'Cash preferred, limited UPI',
    img: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400' },
  { name: 'Snow Peak Lodge', price: 5000, rating: 4.8, location: 'Shimla', type: 'HOTEL',
    desc: 'Heritage property near Ridge, colonial architecture, in-house spa',
    view: 'Grand colonial windows frame the Shimla skyline. On clear days, see snowfall on distant peaks from the terrace.',
    vibe: 'Luxury Heritage', distance: '3 min walk to The Ridge, 10 min to Mall Road',
    amenities: ['Heritage Building', 'Spa', 'Restaurant', 'Room Service', 'Wi-Fi', 'Fireplace', 'Valet Parking'],
    payment: 'All cards accepted, EMI available',
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
  { name: 'Riverside Camp', price: 800, rating: 4.0, location: 'Rishikesh', type: 'HOTEL',
    desc: 'Tent camping by Ganges, rafting packages included in stay',
    view: 'Sit by the bonfire under a billion stars with the Ganges flowing 10 feet away. Dawn meditation by the river.',
    vibe: 'Adventure & Wild', distance: 'On the Ganges bank, 20 min from Laxman Jhula by auto',
    amenities: ['Riverside', 'Bonfire', 'Rafting', 'Meals Included', 'Campfire Music'],
    payment: 'Cash only at camp, book online for 15% discount',
    img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400' },
  { name: 'Dal Lake Houseboat', price: 4000, rating: 4.7, location: 'Srinagar', type: 'HOTEL',
    desc: 'Luxury houseboat on Dal Lake, shikara pickup, Kashmiri wazwan dinner',
    view: 'Floating on mirror-still Dal Lake with Pir Panjal range reflected in the water. Shikara brings you morning kahwa.',
    vibe: 'Royal & Serene', distance: 'On Dal Lake, 10 min shikara to Mughal Gardens',
    amenities: ['Lake View', 'Shikara Ride', 'Wazwan Dinner', 'Carved Wood Interior', 'Heater'],
    payment: 'Cash + UPI, haggle for 20% off in off-season',
    img: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=400' },
  { name: 'Apple Orchard Cottage', price: 2000, rating: 4.3, location: 'Naggar', type: 'HOTEL',
    desc: 'Quiet village stay surrounded by apple orchards, organic breakfast',
    view: 'Surrounded by apple and cherry blossoms in spring. Unobstructed views of Kullu Valley from your window.',
    vibe: 'Peaceful & Green', distance: '3 km from Naggar Castle, 25 km from Manali',
    amenities: ['Orchard View', 'Organic Food', 'Garden', 'Quiet Zone', 'Mountain Trails'],
    payment: 'Cash preferred, PhonePe works',
    img: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=400' },
  { name: 'Zostel Spiti', price: 600, rating: 4.4, location: 'Spiti Valley', type: 'HOTEL',
    desc: 'Backpacker hostel at 12,500ft, bonfire, stargazing, community vibes',
    view: 'Sit on the rooftop at 12,500ft with the Milky Way overhead. Barren moonscape mountains glow golden at sunset.',
    vibe: 'Backpacker & Social', distance: 'In Kaza town, 5 min walk to market',
    amenities: ['Rooftop', 'Stargazing', 'Bonfire', 'Common Room', 'Dorm + Private'],
    payment: 'Book online only, no card machines in Spiti',
    img: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400' },
  { name: 'Hotel Highlands Park', price: 6000, rating: 4.9, location: 'Gulmarg', type: 'HOTEL',
    desc: 'Ski-in/ski-out luxury, gondola view rooms, heated pools',
    view: 'Floor-to-ceiling windows framing Gulmarg\'s snow meadows. Watch skiers glide past while sipping kahwa by the fireplace.',
    vibe: 'Luxury & Sporty', distance: '2 min walk to Gondola station, on the slopes',
    amenities: ['Ski Access', 'Heated Pool', 'Spa', 'Restaurant', 'Fireplace', 'Room Service', 'Gondola View'],
    payment: 'All payment modes, 15% off on credit card prepay',
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' },
];

const MOCK_CABS = [
  { name: 'Mountain Wheels - Innova Crysta', price: 3000, rating: 4.6, type: 'CAB',
    desc: 'Best for families of 5-6, AC, music system, spacious boot',
    route: 'Delhi-Manali, Chandigarh-Shimla, all highway routes',
    feel: 'Smooth highway cruiser. Captain seats in middle row. Kids love the legroom. AC handles both summer heat and defogging.',
    amenities: ['AC', '7-Seater', 'Music System', 'USB Charging', 'Spacious Boot'],
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
  { name: 'Hill Taxi - Swift Dzire', price: 1800, rating: 4.3, type: 'CAB',
    desc: 'Budget friendly sedan, ideal for couples or 2-3 people',
    route: 'Airport transfers, local sightseeing, short trips',
    feel: 'Nimble on narrow mountain roads. Great mileage keeps costs low. Best for quick hops between nearby towns.',
    amenities: ['AC', '4-Seater', 'Fuel Efficient', 'Easy Parking'],
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400' },
  { name: 'Valley Rides - Tempo Traveller 12-seater', price: 4500, rating: 4.5, type: 'CAB',
    desc: 'Perfect for large groups, pushback seats, massive luggage space',
    route: 'Group trips, multi-day tours, wedding parties',
    feel: 'Your gang gets its own bus. Pushback seats for napping on long drives. Luggage space for 12 backpacks easily.',
    amenities: ['AC', '12-Seater', 'Pushback Seats', 'Luggage Rack', 'Curtains', 'Music System'],
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400' },
  { name: 'Adventure Jeep - Mahindra Thar 4x4', price: 3500, rating: 4.8, type: 'CAB',
    desc: 'Offroad beast for Spiti, Rohtang, and unpaved mountain tracks',
    route: 'Spiti circuit, Leh highway, offroad tracks, snow routes',
    feel: 'Roaring through river crossings, crawling over boulder-strewn tracks, roof off under blue sky. This is THE mountain vehicle.',
    amenities: ['4x4', 'Offroad Ready', 'Roof Open', '4-Seater', 'Snorkel Kit'],
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' },
  { name: 'Royal Ride - Toyota Fortuner', price: 5000, rating: 4.7, type: 'CAB',
    desc: 'Premium SUV with leather seats, perfect for luxury trips',
    route: 'All routes, VIP transfers, corporate trips',
    feel: 'Leather seats, climate control, premium audio. Handles mountain roads with authority. Arrive in style at every hotel.',
    amenities: ['Leather Seats', 'Climate Control', '7-Seater', 'Premium Audio', 'Boot Space'],
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400' },
];

const MOCK_DRIVERS = [
  { name: 'Raju Singh', price: 1500, rating: 4.9, type: 'DRIVER',
    bio: '10 years mountain driving experience. Knows every shortcut in Kullu-Manali.',
    expertise: 'Kullu-Manali specialist, night driving expert, knows all dhabas',
    reviews: '"Raju bhai found us a secret waterfall that wasn\'t on any map!" — Priya, Mumbai',
    languages: 'Hindi, English, Punjabi',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { name: 'Mohan Thakur', price: 1200, rating: 4.7, type: 'DRIVER',
    bio: 'Local Himachali guide + driver. Takes you to hidden waterfalls and untouristy dhabas.',
    expertise: 'Born in Manali, knows Parvati Valley trails, arranges home-stays in remote villages',
    reviews: '"Mohan took us to his grandmother\'s house for authentic Siddhu. Best meal of the trip!" — Rahul, Delhi',
    languages: 'Hindi, Pahari, English',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
  { name: 'Vikram Negi', price: 1800, rating: 4.8, type: 'DRIVER',
    bio: 'Spiti Valley specialist. Has driven the Spiti circuit 200+ times. Mechanic skills for emergencies.',
    expertise: 'Spiti/Kinnaur master, knows which passes are open, can fix flat tires and engine issues at 15,000ft',
    reviews: '"Vikram fixed our car at Kunzum Pass when no mechanic was available for 100km." — Ananya, Bangalore',
    languages: 'Hindi, English',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { name: 'Abdul Rashid', price: 1600, rating: 4.9, type: 'DRIVER',
    bio: 'Kashmir expert. Former army driver, safest on Srinagar-Leh highway. Arranges best local food stops.',
    expertise: 'Kashmir/Ladakh expert, knows army checkpoints, best houseboat deals, Wazwan restaurant connections',
    reviews: '"Abdul negotiated our houseboat from ₹6000 to ₹3500. Legend!" — Vikram, Pune',
    languages: 'Hindi, Urdu, Kashmiri, English',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
];

export default function Bookings({ tripId, onCartUpdate }) {
  const [tab, setTab] = useState('HOTEL');
  const [bookings, setBookings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [adding, setAdding] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    bookingApi.getByTrip(tripId).then(r => setBookings(r.data));
    if (user?.id) cartApi.getItems(tripId, user.id).then(r => setCartItems(r.data));
  }, [tripId]);

  const bookedNames = new Set(bookings.map(b => b.providerName));
  const cartNames = new Set(cartItems.map(c => c.itemName));

  const addToCart = async (item) => {
    setAdding(item.name);
    try {
      await cartApi.add({
        tripId,
        userId: user?.id,
        itemType: item.type,
        itemName: item.name,
        originalPrice: item.price,
        itemDetails: JSON.stringify(item),
      });
      const r = await cartApi.getItems(tripId, user.id);
      setCartItems(r.data);
      if (onCartUpdate) onCartUpdate();
    } catch {}
    setAdding(null);
  };

  const items = tab === 'HOTEL' ? MOCK_HOTELS : tab === 'CAB' ? MOCK_CABS : MOCK_DRIVERS;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['HOTEL', '🏨 Hotels & Stays'], ['CAB', '🚗 Cabs & Vehicles'], ['DRIVER', '👤 Local Drivers']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setExpanded(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === key ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}>{label}</button>
        ))}
      </div>

      <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-amber-300 text-sm">
          <span className="font-semibold">💡 Tip:</span> {
            tab === 'HOTEL' ? 'Add hotels to cart and negotiate prices! Most Himachal hotels accept 10-20% off.' :
            tab === 'CAB' ? 'Add cabs to cart. You can negotiate up to 20% off the listed rate before checkout.' :
            'Add drivers to cart. Negotiate daily rates before confirming your trip.'
          }
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item, i) => {
          const isExpanded = expanded === i;
          const inCart = cartNames.has(item.name);
          const isBooked = bookedNames.has(item.name);
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
                      {item.location && <p className="text-white/50 text-base">📍 {item.location}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-emerald-400 font-bold text-xl sm:text-2xl">₹{item.price.toLocaleString()}</span>
                      <span className="text-white/30 text-xs block">/day</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-base mt-1 line-clamp-2">{item.desc || item.bio}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-yellow-400 text-sm">★ {item.rating}</span>
                    {item.vibe && <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">{item.vibe}</span>}
                    {inCart && <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full">In Cart</span>}
                    {isBooked && <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">Booked</span>}
                    <span className="text-white/30 text-xs">{isExpanded ? '▲ Less' : '▼ View Details'}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-white/5 space-y-4 animate-fadeIn">
                  {(item.view || item.feel) && (
                    <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/10 rounded-lg">
                      <h5 className="text-emerald-400 font-medium text-sm mb-2">
                        {tab === 'HOTEL' ? '🌄 The View & Feel' : tab === 'CAB' ? '🚗 The Ride Experience' : '👤 What to Expect'}
                      </h5>
                      <p className="text-white/60 text-sm italic leading-relaxed">"{item.view || item.feel}"</p>
                    </div>
                  )}
                  {item.distance && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📏</span>
                      <div>
                        <span className="text-white/40 text-xs block">Distance & Location</span>
                        <p className="text-white/70 text-sm">{item.distance}</p>
                      </div>
                    </div>
                  )}
                  {item.route && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🛣️</span>
                      <div>
                        <span className="text-white/40 text-xs block">Routes Covered</span>
                        <p className="text-white/70 text-sm">{item.route}</p>
                      </div>
                    </div>
                  )}
                  {item.expertise && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🎯</span>
                      <div>
                        <span className="text-white/40 text-xs block">Expertise</span>
                        <p className="text-white/70 text-sm">{item.expertise}</p>
                      </div>
                    </div>
                  )}
                  {item.reviews && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💬</span>
                      <div>
                        <span className="text-white/40 text-xs block">Traveler Review</span>
                        <p className="text-white/60 text-sm italic">{item.reviews}</p>
                      </div>
                    </div>
                  )}
                  {item.languages && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🗣️</span>
                      <div>
                        <span className="text-white/40 text-xs block">Languages</span>
                        <p className="text-white/70 text-sm">{item.languages}</p>
                      </div>
                    </div>
                  )}
                  {item.amenities && (
                    <div>
                      <span className="text-white/40 text-xs block mb-2">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {item.amenities.map((a, j) => (
                          <span key={j} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.payment && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💳</span>
                      <div>
                        <span className="text-white/40 text-xs block">Payment Options</span>
                        <p className="text-amber-400/70 text-sm">{item.payment}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                    disabled={inCart || isBooked || adding === item.name}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
                      isBooked ? 'bg-emerald-500/20 text-emerald-400 cursor-default' :
                      inCart ? 'bg-cyan-500/20 text-cyan-400 cursor-default' :
                      adding === item.name ? 'bg-white/10 text-white/50 cursor-wait' :
                      'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 hover:scale-[1.01] text-white shadow-lg shadow-emerald-500/20'
                    }`}>
                    {isBooked ? '✓ Already Booked' :
                     inCart ? '🛒 Added to Cart' :
                     adding === item.name ? 'Adding...' :
                     `🛒 Add to Cart — ₹${item.price.toLocaleString()}/day`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {bookings.length > 0 && (
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
