import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi, chatApi } from '../api';
import RoadProgress from './RoadProgress';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DESTINATIONS = [
  { name: 'Manali', tag: 'Snow & Adventure', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800' },
  { name: 'Kashmir', tag: 'Paradise on Earth', img: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800' },
  { name: 'Spiti Valley', tag: 'Moonscape & Monks', img: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800' },
  { name: 'Kasol', tag: 'Riverside & Chill', img: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800' },
  { name: 'Rishikesh', tag: 'Rafting & Yoga', img: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=800' },
  { name: 'Gulmarg', tag: 'Skiing & Meadows', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
  { name: 'Leh Ladakh', tag: 'High Altitude Magic', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
  { name: 'Shimla', tag: 'Colonial Charm', img: 'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=800' },
  { name: 'Dharamshala', tag: 'Tibetan Vibes', img: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800' },
];

const STYLES = [
  { id: 'adventure', icon: '🏔️', label: 'Adventure', desc: 'Trekking, camping, rafting' },
  { id: 'chill', icon: '☕', label: 'Chill & Relax', desc: 'Cafes, views, slow travel' },
  { id: 'spiritual', icon: '🕉️', label: 'Spiritual', desc: 'Temples, meditation, yoga' },
  { id: 'backpacker', icon: '🎒', label: 'Backpacker', desc: 'Budget, hostels, local food' },
  { id: 'luxury', icon: '✨', label: 'Luxury', desc: 'Resorts, spas, fine dining' },
  { id: 'offroad', icon: '🚙', label: 'Offroad', desc: 'Jeep trails, wild camping' },
];

const FOOD_OPTIONS = [
  { id: 'veg', icon: '🥗', label: 'Vegetarian' },
  { id: 'nonveg', icon: '🍗', label: 'Non-Veg' },
  { id: 'vegan', icon: '🌱', label: 'Vegan' },
  { id: 'jain', icon: '🙏', label: 'Jain' },
  { id: 'eggetarian', icon: '🥚', label: 'Eggetarian' },
  { id: 'streetfood', icon: '🍜', label: 'Street Food' },
  { id: 'anything', icon: '🍽️', label: 'Anything Goes' },
];

const FITNESS_OPTIONS = [
  { id: 'easy', icon: '🚶', label: 'Easy', desc: 'Light walks, scenic drives' },
  { id: 'moderate', icon: '🥾', label: 'Moderate', desc: '2-4 hour treks, some hills' },
  { id: 'active', icon: '⛰️', label: 'Active', desc: 'Full-day treks, passes' },
  { id: 'hardcore', icon: '🧗', label: 'Hardcore', desc: 'High altitude, multi-day' },
];

const VISIT_OPTIONS = [
  { id: 'temples', icon: '🛕', label: 'Temples' },
  { id: 'lakes', icon: '🏞️', label: 'Lakes' },
  { id: 'cafes', icon: '☕', label: 'Cafes' },
  { id: 'viewpoints', icon: '🌄', label: 'Viewpoints' },
  { id: 'waterfalls', icon: '💧', label: 'Waterfalls' },
  { id: 'markets', icon: '🛍️', label: 'Markets' },
  { id: 'monasteries', icon: '🕉️', label: 'Monasteries' },
  { id: 'camping', icon: '⛺', label: 'Camping' },
  { id: 'hotsprings', icon: '♨️', label: 'Hot Springs' },
  { id: 'wildlife', icon: '🦅', label: 'Wildlife' },
  { id: 'snowpoints', icon: '❄️', label: 'Snow Points' },
  { id: 'paragliding', icon: '🪂', label: 'Paragliding' },
];

const GROUP_OPTIONS = [
  { id: 'solo', icon: '🧍', label: 'Solo', desc: 'Just me' },
  { id: 'couple', icon: '💑', label: 'Couple', desc: '2 people' },
  { id: 'small', icon: '👫', label: 'Small Group', desc: '3-5 friends' },
  { id: 'large', icon: '👨‍👩‍👧‍👦', label: 'Large Group', desc: '6+ people' },
  { id: 'family', icon: '👪', label: 'Family', desc: 'With kids/elders' },
];

const SPECIAL_OPTIONS = [
  { id: 'kids', icon: '👶', label: 'Kids' },
  { id: 'elderly', icon: '👴', label: 'Elderly' },
  { id: 'altitude', icon: '🏔️', label: 'Altitude Concern' },
  { id: 'wheelchair', icon: '♿', label: 'Wheelchair' },
  { id: 'pets', icon: '🐕', label: 'Pet-Friendly' },
  { id: 'budget', icon: '💰', label: 'Strict Budget' },
  { id: 'photography', icon: '📸', label: 'Photography' },
  { id: 'nightlife', icon: '🌙', label: 'Nightlife' },
  { id: 'none', icon: '✅', label: 'Nothing Special' },
];

const STEP_LABELS = ['Destination', 'Dates', 'Style', 'Plan Type', 'Details', 'Ready!'];

const BUDGET_MIN = 5000;
const BUDGET_MAX = 100000;
const BUDGET_PRESETS = [
  { label: 'Backpacker', min: 5000, max: 10000 },
  { label: 'Mid Range', min: 10000, max: 25000 },
  { label: 'Premium', min: 25000, max: 50000 },
  { label: 'Luxury', min: 50000, max: 100000 },
];

export default function TripWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    destination: '', startDate: '', endDate: '', budget: '25000',
    travelStyle: '', description: '', vibePreference: '',
  });
  const [budgetRange, setBudgetRange] = useState([10000, 25000]);
  const [bgImg, setBgImg] = useState(DESTINATIONS[0].img);
  const [planType, setPlanType] = useState('');
  const [personal, setPersonal] = useState({
    food: [], fitness: '', mustVisit: [], groupSize: '', special: [], customFood: '', customVisit: '',
  });
  const [tripPassword, setTripPassword] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const selectDestination = (dest) => {
    setForm({ ...form, destination: dest.name });
    setBgImg(dest.img);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange(dates);
    setForm({
      ...form,
      startDate: start ? start.toISOString().split('T')[0] : '',
      endDate: end ? end.toISOString().split('T')[0] : '',
    });
  };

  const next = () => {
    if (step === 3 && planType === 'ready') {
      setStep(5);
      createTrip(true);
    } else {
      setStep(Math.min(step + 1, 5));
    }
  };
  const back = () => setStep(Math.max(step - 1, 0));

  const createTrip = async (autoItinerary = false) => {
    setLoading(true);
    const pw = tripPassword || Math.random().toString(36).slice(2, 8).toUpperCase();
    setTripPassword(pw);
    try {
      const desc = planType === 'personal'
        ? `Food: ${[...personal.food, personal.customFood].filter(Boolean).join(', ')}, Fitness: ${personal.fitness}, Must visit: ${[...personal.mustVisit, personal.customVisit].filter(Boolean).join(', ')}, Group: ${personal.groupSize}, Special: ${personal.special.join(', ') || 'nothing'}`
        : form.description;
      const { data } = await tripApi.create({
        ...form, budget: String(budgetRange[1]), description: desc, createdBy: user?.name, tripPassword: isPublic ? '' : pw, isPublic,
      });
      setCreatedTrip(data);

      if (user?.id) {
        await tripApi.addMember(data.id, user.id).catch(() => {});
      }

      if (autoItinerary && data.id) {
        chatApi.curate(data.id).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to create trip', err);
    }
    setLoading(false);
  };

  const canNext = () => {
    if (step === 0) return form.destination.trim() !== '';
    if (step === 1) return form.startDate && form.endDate;
    if (step === 2) return form.travelStyle !== '';
    if (step === 3) return planType !== '';
    if (step === 4) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 overflow-hidden">
        <img src={bgImg} alt="" className="w-full h-full object-cover animate-kenBurns" key={bgImg} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/95" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-white/80">Plan Your Adventure</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6">
          <RoadProgress currentStep={step} totalSteps={6} labels={STEP_LABELS} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto">

            {step === 0 && (
              <div className="animate-slideRight">
                <h3 className="text-3xl font-bold mb-2">Where do you want to go?</h3>
                <p className="text-white/50 mb-6">Pick a destination or type your own</p>
                <input type="text" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}
                  placeholder="Type a destination..."
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-lg placeholder:text-white/40 focus:border-emerald-500 focus:outline-none mb-6" />
                <div className="grid grid-cols-3 gap-3">
                  {DESTINATIONS.map(d => (
                    <button key={d.name} onClick={() => selectDestination(d)}
                      className={`group relative h-32 rounded-2xl overflow-hidden border-2 transition-all ${
                        form.destination === d.name ? 'border-emerald-500 scale-[1.02]' : 'border-transparent hover:border-white/20'
                      }`}>
                      <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="font-bold text-sm">{d.name}</p>
                        <p className="text-white/60 text-xs">{d.tag}</p>
                      </div>
                      {form.destination === d.name && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-slideRight space-y-6">
                <div>
                  <h3 className="text-3xl font-bold mb-2">When & Budget?</h3>
                  <p className="text-white/50 mb-6">Select your travel dates and budget range</p>
                </div>

                {/* Date Range Picker */}
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Travel Dates</label>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <DatePicker
                      selectsRange
                      startDate={dateRange[0]}
                      endDate={dateRange[1]}
                      onChange={handleDateChange}
                      minDate={new Date()}
                      monthsShown={2}
                      inline
                      calendarClassName="!bg-transparent !border-none !font-sans"
                      dayClassName={() => "!text-white hover:!bg-emerald-500/30 !rounded-lg"}
                    />
                    {form.startDate && form.endDate && (
                      <div className="mt-3 flex items-center gap-3 text-sm">
                        <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
                          {form.startDate}
                        </span>
                        <span className="text-white/30">→</span>
                        <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
                          {form.endDate}
                        </span>
                        <span className="text-white/40 ml-2">
                          ({Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1} days)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="text-white/60 text-sm mb-3 block">Budget per person (range)</label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {BUDGET_PRESETS.map(p => (
                      <button key={p.label} onClick={() => setBudgetRange([p.min, p.max])}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          budgetRange[0] === p.min && budgetRange[1] === p.max
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}>
                        <p className="font-bold text-sm">₹{(p.min / 1000)}K-{(p.max / 1000)}K</p>
                        <p className="text-white/50 text-xs">{p.label}</p>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Min: ₹{budgetRange[0].toLocaleString()}</span>
                      <span className="text-emerald-400 font-bold">₹{budgetRange[0].toLocaleString()} — ₹{budgetRange[1].toLocaleString()}</span>
                      <span className="text-white/60">Max: ₹{budgetRange[1].toLocaleString()}</span>
                    </div>
                    <input type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={1000} value={budgetRange[0]}
                      onChange={e => setBudgetRange([Math.min(Number(e.target.value), budgetRange[1] - 1000), budgetRange[1]])}
                      className="w-full accent-emerald-500" />
                    <input type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={1000} value={budgetRange[1]}
                      onChange={e => setBudgetRange([budgetRange[0], Math.max(Number(e.target.value), budgetRange[0] + 1000)])}
                      className="w-full accent-emerald-500" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slideRight">
                <h3 className="text-3xl font-bold mb-2">What's your vibe?</h3>
                <p className="text-white/50 mb-6">Choose your travel style</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {STYLES.map(s => (
                    <button key={s.id} onClick={() => setForm({ ...form, travelStyle: s.id })}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                        form.travelStyle === s.id
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}>
                      <span className="text-3xl block mb-2">{s.icon}</span>
                      <p className="font-bold text-base">{s.label}</p>
                      <p className="text-white/40 text-sm">{s.desc}</p>
                    </button>
                  ))}
                </div>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Anything specific you want? (optional)" rows={2}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:border-emerald-500 focus:outline-none resize-none" />
              </div>
            )}

            {step === 3 && (
              <div className="animate-slideRight">
                <h3 className="text-3xl font-bold mb-2">How should we plan?</h3>
                <p className="text-white/50 mb-8">Choose your planning style</p>
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => setPlanType('personal')}
                    className={`p-8 rounded-3xl border-2 text-center transition-all hover:scale-[1.02] ${
                      planType === 'personal' ? 'border-violet-500 bg-violet-500/20' : 'border-white/10 bg-white/5'
                    }`}>
                    <span className="text-5xl block mb-4">🎯</span>
                    <p className="text-xl font-bold mb-2">Personalized</p>
                    <p className="text-white/50 text-sm">Answer a few questions and we'll craft a perfect plan</p>
                  </button>
                  <button onClick={() => setPlanType('ready')}
                    className={`p-8 rounded-3xl border-2 text-center transition-all hover:scale-[1.02] ${
                      planType === 'ready' ? 'border-cyan-500 bg-cyan-500/20' : 'border-white/10 bg-white/5'
                    }`}>
                    <span className="text-5xl block mb-4">🤖</span>
                    <p className="text-xl font-bold mb-2">Ready Itinerary</p>
                    <p className="text-white/50 text-sm">AI generates a full itinerary instantly</p>
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-slideRight space-y-6">
                <h3 className="text-3xl font-bold mb-1">Personalize Your Trip</h3>
                <p className="text-white/50 mb-2">Select what suits you — or add your own</p>

                {/* Food Preference */}
                <div>
                  <label className="text-white/70 text-sm font-semibold mb-2 block">🍽️ Food Preference</label>
                  <div className="flex flex-wrap gap-2">
                    {FOOD_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setPersonal(p => ({
                        ...p, food: p.food.includes(f.id) ? p.food.filter(x => x !== f.id) : [...p.food, f.id]
                      }))}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all hover:scale-105 ${
                          personal.food.includes(f.id)
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}>
                        <span className="mr-1.5">{f.icon}</span>{f.label}
                      </button>
                    ))}
                  </div>
                  <input type="text" value={personal.customFood} onChange={e => setPersonal({ ...personal, customFood: e.target.value })}
                    placeholder="+ Add your own (e.g., Rajasthani thali, Maggi lover)"
                    className="mt-2 w-full px-4 py-2.5 bg-white/5 border border-dashed border-white/15 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-emerald-500 focus:outline-none" />
                </div>

                {/* Fitness Level */}
                <div>
                  <label className="text-white/70 text-sm font-semibold mb-2 block">💪 Fitness Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {FITNESS_OPTIONS.map(f => (
                      <button key={f.id} onClick={() => setPersonal({ ...personal, fitness: f.id })}
                        className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                          personal.fitness === f.id
                            ? 'border-cyan-500 bg-cyan-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}>
                        <span className="text-2xl block mb-1">{f.icon}</span>
                        <p className="font-bold text-xs">{f.label}</p>
                        <p className="text-white/40 text-[10px] mt-0.5">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Must Visit */}
                <div>
                  <label className="text-white/70 text-sm font-semibold mb-2 block">📍 Must-Visit Places (select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {VISIT_OPTIONS.map(v => (
                      <button key={v.id} onClick={() => setPersonal(p => ({
                        ...p, mustVisit: p.mustVisit.includes(v.id) ? p.mustVisit.filter(x => x !== v.id) : [...p.mustVisit, v.id]
                      }))}
                        className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 ${
                          personal.mustVisit.includes(v.id)
                            ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}>
                        <span className="mr-1">{v.icon}</span>{v.label}
                      </button>
                    ))}
                  </div>
                  <input type="text" value={personal.customVisit} onChange={e => setPersonal({ ...personal, customVisit: e.target.value })}
                    placeholder="+ Add your own (e.g., Rohtang Pass, Hidimba Temple)"
                    className="mt-2 w-full px-4 py-2.5 bg-white/5 border border-dashed border-white/15 rounded-xl text-white text-sm placeholder:text-white/25 focus:border-violet-500 focus:outline-none" />
                </div>

                {/* Group Size */}
                <div>
                  <label className="text-white/70 text-sm font-semibold mb-2 block">👥 Group Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {GROUP_OPTIONS.map(g => (
                      <button key={g.id} onClick={() => setPersonal({ ...personal, groupSize: g.id })}
                        className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                          personal.groupSize === g.id
                            ? 'border-amber-500 bg-amber-500/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}>
                        <span className="text-xl block mb-1">{g.icon}</span>
                        <p className="font-bold text-[11px]">{g.label}</p>
                        <p className="text-white/40 text-[10px]">{g.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Needs */}
                <div>
                  <label className="text-white/70 text-sm font-semibold mb-2 block">⚡ Special Requirements</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_OPTIONS.map(s => (
                      <button key={s.id} onClick={() => setPersonal(p => ({
                        ...p, special: p.special.includes(s.id) ? p.special.filter(x => x !== s.id) : [...p.special, s.id]
                      }))}
                        className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all hover:scale-105 ${
                          personal.special.includes(s.id)
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}>
                        <span className="mr-1">{s.icon}</span>{s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Setting */}
                <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <label className="text-white/70 text-sm font-semibold mb-3 block">🌍 Trip Privacy</label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => setIsPublic(true)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isPublic ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}>
                      <span className="text-2xl block mb-1">🌍</span>
                      <p className="font-bold text-sm text-emerald-400">Public</p>
                      <p className="text-white/40 text-xs mt-1">Anyone with the link can join instantly</p>
                    </button>
                    <button onClick={() => setIsPublic(false)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        !isPublic ? 'border-amber-500 bg-amber-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}>
                      <span className="text-2xl block mb-1">🔒</span>
                      <p className="font-bold text-sm text-amber-400">Private</p>
                      <p className="text-white/40 text-xs mt-1">Requires a password to join the group</p>
                    </button>
                  </div>

                  {!isPublic && (
                    <div className="animate-slideDown p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mt-3">
                      <label className="text-amber-300 text-xs font-semibold mb-2 block">Set Trip Password</label>
                      <div className="flex gap-2">
                        <input type="text" value={tripPassword} onChange={e => setTripPassword(e.target.value)}
                          placeholder="Auto-generated if left empty"
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-white text-sm placeholder:text-white/25 focus:border-amber-500 focus:outline-none" />
                        <button onClick={() => setTripPassword(Math.random().toString(36).slice(2, 8).toUpperCase())}
                          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium transition-colors">
                          🎲 Generate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="animate-slideRight text-center py-8">
                {loading ? (
                  <div>
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                      <span className="absolute inset-0 flex items-center justify-center text-4xl">🚙</span>
                    </div>
                    <p className="text-xl text-white/60">Creating your trip...</p>
                  </div>
                ) : createdTrip ? (
                  <div>
                    <div className="text-7xl mb-6">🎉</div>
                    <h3 className="text-4xl font-bold mb-3">Trip Created!</h3>
                    <p className="text-white/60 text-lg mb-6">Your adventure to <span className="text-emerald-400 font-semibold">{createdTrip.destination}</span> is ready</p>

                    {!isPublic && (
                      <div className="inline-block p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6">
                        <p className="text-amber-300 text-sm font-medium mb-1">Trip Password</p>
                        <p className="text-2xl font-mono font-bold text-amber-400 tracking-widest">{tripPassword}</p>
                        <p className="text-amber-300/50 text-xs mt-1">Share with friends so they can join</p>
                      </div>
                    )}

                    <div className="flex gap-3 justify-center">
                      <button onClick={() => navigate(`/trip/${createdTrip.id}`)}
                        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 rounded-2xl font-semibold text-lg transition-all hover:scale-105">
                        Enter Group Chat
                      </button>
                      <button onClick={() => {
                        const link = `${window.location.href.split('#')[0]}#/trip/${createdTrip.id}`;
                        const text = `Join my trip to ${createdTrip.destination} on WanderTribe!\n${link}${!isPublic ? `\nPassword: ${tripPassword}` : ''}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                        className="px-6 py-4 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 rounded-2xl text-green-400 font-medium transition-colors">
                        Share on WhatsApp
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {step < 5 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <button onClick={step === 0 ? onClose : back}
              className="px-6 py-3 text-white/50 hover:text-white transition-colors font-medium">
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            <button onClick={() => {
              if (step === 4) {
                setStep(5);
                createTrip(false);
              } else {
                next();
              }
            }}
              disabled={!canNext()}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-semibold transition-all hover:scale-105">
              {step === 3 && planType === 'ready' ? 'Create & Generate' : step === 4 ? 'Create Trip' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
