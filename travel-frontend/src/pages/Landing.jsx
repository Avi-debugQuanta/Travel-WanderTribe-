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

const snowflakes = [
  { left: 3, size: 2, opacity: 0.35, duration: 14, delay: 0 },
  { left: 8, size: 1, opacity: 0.25, duration: 20, delay: 2 },
  { left: 12, size: 3, opacity: 0.45, duration: 11, delay: 5 },
  { left: 18, size: 2, opacity: 0.3, duration: 16, delay: 1 },
  { left: 24, size: 1, opacity: 0.42, duration: 9, delay: 8 },
  { left: 31, size: 2, opacity: 0.22, duration: 18, delay: 3 },
  { left: 37, size: 3, opacity: 0.38, duration: 12, delay: 7 },
  { left: 44, size: 1, opacity: 0.33, duration: 15, delay: 0.5 },
  { left: 51, size: 2, opacity: 0.28, duration: 10, delay: 11 },
  { left: 56, size: 1, opacity: 0.5, duration: 19, delay: 4 },
  { left: 62, size: 3, opacity: 0.26, duration: 13, delay: 9 },
  { left: 68, size: 2, opacity: 0.4, duration: 8, delay: 6 },
  { left: 74, size: 1, opacity: 0.31, duration: 17, delay: 12 },
  { left: 79, size: 2, opacity: 0.36, duration: 14.5, delay: 2.5 },
  { left: 85, size: 3, opacity: 0.23, duration: 11.2, delay: 10 },
  { left: 91, size: 1, opacity: 0.47, duration: 16.8, delay: 1.2 },
  { left: 95, size: 2, opacity: 0.29, duration: 9.5, delay: 13 },
  { left: 48, size: 1, opacity: 0.39, duration: 12.8, delay: 4.8 },
];

export default function Landing() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pt-20 bg-slate-950">
      <style>{`
        @keyframes snowfall {
          from {
            transform: translateY(-10vh);
          }
          to {
            transform: translateY(110vh);
          }
        }
        .snowfall-dot {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
          animation: snowfall linear infinite;
          background-color: rgb(226 232 240);
          box-shadow: 0 0 4px rgba(56, 189, 248, 0.35);
        }
      `}</style>

      {/* Hero with winter mountain */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549880338-65ddcdfd037b?w=1920')] bg-cover bg-center opacity-35 scale-105 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-slate-900/70 to-[#020617]" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {snowflakes.map((s, i) => (
            <span
              key={i}
              className="snowfall-dot top-[-5vh]"
              style={{
                left: `${s.left}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Ambient icy sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70">
          <div className="absolute top-[18%] left-[11%] w-2 h-2 bg-sky-300/35 rounded-full blur-[1px] animate-pulse" />
          <div className="absolute top-[32%] right-[18%] w-1.5 h-1.5 bg-violet-300/30 rounded-full blur-[0.5px] animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-[48%] left-[35%] w-1 h-1 bg-sky-200/40 rounded-full animate-pulse" style={{ animationDelay: '2.4s' }} />
          <div className="absolute bottom-[38%] right-[28%] w-2.5 h-2.5 bg-fuchsia-300/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>

        <div className="relative text-center px-6 max-w-5xl z-10">
          <div className="inline-block px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sky-400 text-sm mb-8 shadow-lg shadow-sky-500/10 hover:border-sky-500/30 transition-all duration-300 animate-bounce [animation-duration:3s]">
            Himachal Pradesh & Kashmir Specialists
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-violet-400 bg-clip-text text-transparent drop-shadow-lg">
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
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 rounded-xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-sky-500/25"
            >
              Start Planning — It&apos;s Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-white/10 hover:border-sky-500/40 rounded-xl text-lg text-white/90 transition-all duration-300 hover:bg-white/5 backdrop-blur-xl hover:shadow-lg hover:shadow-violet-500/10"
            >
              How It Works
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-sky-500/20 transition-colors duration-300">
                <div className="text-2xl sm:text-3xl font-bold text-sky-400">{s.value}</div>
                <div className="text-white/40 text-xs sm:text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2 backdrop-blur-sm">
            <div className="w-1.5 h-3 bg-sky-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-indigo-950/30 to-[#0f172a]" />
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-center text-white/50 mb-16 text-lg">Four steps to your perfect mountain getaway</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-500/20"
              >
                <div className="text-5xl font-black text-sky-500/20 group-hover:text-sky-400/35 transition-colors mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-sky-400 transition-colors">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'AI Travel Buddy', desc: 'Chat with an AI that knows every chai stall in Kasol, every viewpoint in Spiti, and the best dal in Manali. It plans around YOUR vibe.' },
            { icon: '👥', title: 'Group Decisions Made Easy', desc: 'No more 50-message WhatsApp threads. Everyone adds ideas, votes, and AI builds consensus into one perfect plan.' },
            { icon: '🏔️', title: 'Mountain Experts', desc: 'From Rohtang Pass conditions to Dal Lake houseboats, from Triund trek tips to Pahalgam horse rides — we know the mountains.' },
            { icon: '🏨', title: 'Hotels & Homestays', desc: 'Browse curated stays from ₹800 riverside camps to ₹5000 luxury resorts. Real ratings, real prices.' },
            { icon: '🚗', title: 'Cabs & Drivers', desc: 'Select your vehicle and driver. Innova for families, Thar for offroad, Tempo for big groups. Drivers who know the hairpin bends.' },
            { icon: '💳', title: 'Payment Tips', desc: 'AI tells you where to pay cash vs card, which hotels offer online discounts, and where credit cards work in remote areas.' },
          ].map((f, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/20"
            >
              <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</span>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-sky-400 transition-colors">{f.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="destinations" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-indigo-950/20 to-[#0f172a]" />
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-sky-400 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">
              Explore Destinations
            </span>
          </h2>
          <p className="text-center text-white/50 mb-12 text-lg">Himachal Pradesh & Kashmir — where every road is an adventure</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((d, i) => (
              <Link to="/dashboard" key={i} className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer border border-white/10 hover:border-sky-500/30 transition-all duration-500 shadow-xl shadow-black/40 hover:shadow-sky-500/15">
                <img
                  src={d.img}
                  alt={d.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-colors duration-300" />
                <div className="absolute bottom-0 p-6 w-full">
                  <h3 className="text-2xl font-bold mb-1">{d.name}</h3>
                  <p className="text-white/70 text-sm mb-2">{d.tagline}</p>
                  <p className="text-sky-400 text-xs">{d.season}</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-block px-4 py-2 bg-sky-500 hover:bg-sky-400 rounded-lg text-sm font-medium text-white shadow-lg shadow-sky-500/25 transition-colors">
                      Plan This Trip
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              Travelers Love Us
            </span>
          </h2>

          <div className="relative h-48">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-500 ${
                  i === activeTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <div className="mx-auto max-w-2xl p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <p className="text-xl text-white/70 italic mb-6 leading-relaxed">&quot;{t.text}&quot;</p>
                  <p className="font-semibold text-sky-400">{t.name}</p>
                  <p className="text-white/40 text-sm">{t.trip}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-center mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === activeTestimonial ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.55)] scale-110' : 'bg-white/20 hover:bg-white/35'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-sky-500/10 to-violet-500/10 border border-sky-500/20 backdrop-blur-xl shadow-xl shadow-violet-500/10">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready for the Mountains?</h2>
          <p className="text-white/50 mb-8 text-lg">Start planning your Himachal or Kashmir trip in under 2 minutes. Completely free.</p>
          <Link
            to="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 rounded-xl text-lg font-semibold text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-sky-500/25"
          >
            Create Your Trip Now
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 px-6 bg-[#020617]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏔️</span>
            <span className="font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
              WanderTribe
            </span>
          </div>
          <p className="text-white/30 text-sm">Built with Spring Boot + React + Gemini AI</p>
          <div className="flex gap-6 text-white/30 text-sm">
            <Link to="/dashboard" className="hover:text-sky-400 transition-colors">
              Dashboard
            </Link>
            <a href="#destinations" className="hover:text-sky-400 transition-colors">
              Destinations
            </a>
            <a href="#how-it-works" className="hover:text-sky-400 transition-colors">
              How It Works
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
