import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const destinations = [
  { name: 'Manali', tagline: 'Snow-capped peaks & river valleys', season: 'Oct-Feb for snow, Mar-Jun for pleasant', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600' },
  { name: 'Srinagar', tagline: 'Dal Lake & Mughal Gardens', season: 'Apr-Oct for houseboats & shikaras', img: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=600' },
  { name: 'Spiti Valley', tagline: 'Moon-like desert at 12,500ft', season: 'Jun-Sep for clear roads', img: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600' },
  { name: 'Kasol', tagline: 'Mini Israel in the Parvati Valley', season: 'Mar-Jun, Sep-Nov for trekking', img: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=600' },
  { name: 'Gulmarg', tagline: 'Meadow of flowers & skiing paradise', season: 'Dec-Mar for skiing, Jun-Aug for gondola', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' },
  { name: 'Dharamshala', tagline: 'Dalai Lama\'s home in the hills', season: 'Mar-Jun, Sep-Nov for clear skies', img: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600' },
];

const stats = [
  { value: '50+', label: 'Destinations' },
  { value: '1000+', label: 'Trips Planned' },
  { value: '4.9', label: 'User Rating' },
  { value: 'Free', label: 'AI Planner' },
];

const howItWorks = [
  { step: '01', title: 'Create a Trip', desc: 'Set your destination, dates, budget, and travel style. Invite your friends to join the planning.' },
  { step: '02', title: 'Share Ideas', desc: 'Everyone submits ideas — offbeat places, food spots, adventure activities. Vote on the best ones.' },
  { step: '03', title: 'Chat with AI', desc: 'Our AI knows every hidden gem in Himachal & Kashmir. Ask it anything — it curates suggestions based on your group\'s vibe.' },
  { step: '04', title: 'Get Your Itinerary', desc: 'AI generates a day-by-day plan with hotels, transport, food stops, and estimated costs. Book directly from the app.' },
];

const testimonials = [
  { name: 'Priya S.', trip: 'Manali Group Trip', text: 'The AI suggested Sethan Village — we had no idea it existed. Best campsite ever!' },
  { name: 'Rahul K.', trip: 'Kashmir Family Trip', text: 'Planned a 7-day Kashmir trip in 10 minutes. The itinerary was perfect, even found a great houseboat.' },
  { name: 'Ananya M.', trip: 'Spiti Bike Trip', text: 'The AI knew exactly which passes are open in June. Saved us from a wasted day at Rohtang.' },
];

export default function Landing() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-20">
      {/* Hero with parallax-like mountain layers */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')] bg-cover bg-center opacity-30 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-slate-900/70 to-slate-900" />

        {/* Floating mountain particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400/30 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-blue-400/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-emerald-300/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-60 left-1/4 w-2.5 h-2.5 bg-cyan-300/15 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative text-center px-6 max-w-5xl">
          <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
            Himachal Pradesh & Kashmir Specialists
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Plan Together,
            </span>
            <br />
            <span className="text-white drop-shadow-xl">Explore the Mountains</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI-powered group travel planner for Himachal & Kashmir. Share ideas with friends,
            let AI find hidden gems, and get a curated itinerary in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/dashboard" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-xl shadow-emerald-500/30">
              Start Planning — It's Free
            </Link>
            <a href="#how-it-works" className="px-8 py-4 border border-white/20 hover:border-emerald-400/40 rounded-xl text-lg transition-all hover:bg-white/5 backdrop-blur-sm">
              How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{s.value}</div>
                <div className="text-white/40 text-xs sm:text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900" />
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-center text-white/50 mb-16 text-lg">Four steps to your perfect mountain getaway</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="text-5xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'AI Travel Buddy', desc: 'Chat with an AI that knows every chai stall in Kasol, every viewpoint in Spiti, and the best dal in Manali. It plans around YOUR vibe.' },
            { icon: '👥', title: 'Group Decisions Made Easy', desc: 'No more 50-message WhatsApp threads. Everyone adds ideas, votes, and AI builds consensus into one perfect plan.' },
            { icon: '🏔️', title: 'Mountain Experts', desc: 'From Rohtang Pass conditions to Dal Lake houseboats, from Triund trek tips to Pahalgam horse rides — we know the mountains.' },
            { icon: '🏨', title: 'Hotels & Homestays', desc: 'Browse curated stays from ₹800 riverside camps to ₹5000 luxury resorts. Real ratings, real prices.' },
            { icon: '🚗', title: 'Cabs & Drivers', desc: 'Select your vehicle and driver. Innova for families, Thar for offroad, Tempo for big groups. Drivers who know the hairpin bends.' },
            { icon: '💳', title: 'Payment Tips', desc: 'AI tells you where to pay cash vs card, which hotels offer online discounts, and where credit cards work in remote areas.' },
          ].map((f, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5">
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-emerald-400 transition-colors">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-emerald-950/10 to-slate-900" />
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Explore Destinations
            </span>
          </h2>
          <p className="text-center text-white/50 mb-12 text-lg">Himachal Pradesh & Kashmir — where every road is an adventure</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((d, i) => (
              <Link to="/dashboard" key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer">
                <img src={d.img} alt={d.name} loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-colors duration-300" />
                <div className="absolute bottom-0 p-6 w-full">
                  <h3 className="text-2xl font-bold mb-1">{d.name}</h3>
                  <p className="text-white/70 text-sm mb-2">{d.tagline}</p>
                  <p className="text-emerald-400 text-xs">{d.season}</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="px-4 py-2 bg-emerald-500 rounded-lg text-sm font-medium">Plan This Trip</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Travelers Love Us
            </span>
          </h2>

          <div className="relative h-48">
            {testimonials.map((t, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-500 ${
                i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}>
                <p className="text-xl text-white/70 italic mb-6 leading-relaxed">"{t.text}"</p>
                <p className="font-semibold text-emerald-400">{t.name}</p>
                <p className="text-white/40 text-sm">{t.trip}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-center mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeTestimonial ? 'bg-emerald-400' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <h2 className="text-4xl font-bold mb-4">Ready for the Mountains?</h2>
          <p className="text-white/50 mb-8 text-lg">Start planning your Himachal or Kashmir trip in under 2 minutes. Completely free.</p>
          <Link to="/login" className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-xl shadow-emerald-500/30">
            Create Your Trip Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏔️</span>
            <span className="font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">WanderTribe</span>
          </div>
          <p className="text-white/30 text-sm">Built with Spring Boot + React + Gemini AI</p>
          <div className="flex gap-6 text-white/30 text-sm">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="#destinations" className="hover:text-white transition-colors">Destinations</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
