import { useState, useMemo } from 'react';
import { chatApi, proposalApi, bookingApi } from '../api';
import ReactMarkdown from 'react-markdown';

const DAY_IMAGES = {
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
  kashmir: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=400',
  shimla: 'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=400',
  spiti: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400',
  kasol: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=400',
  rishikesh: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400',
  dharamshala: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400',
  leh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  ladakh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  gulmarg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400',
  default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
};

function parseDays(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const days = [];
  let current = null;

  for (const line of lines) {
    const dayMatch = line.match(/^#{1,3}\s*(?:Day\s*(\d+)|(\d+)\.\s*Day)/i);
    if (dayMatch) {
      if (current) days.push(current);
      const dayNum = dayMatch[1] || dayMatch[2] || days.length + 1;
      const title = line.replace(/^#{1,3}\s*/, '').trim();
      current = { dayNum: parseInt(dayNum), title, content: '', route: '', roadCondition: '', stay: '', dayCost: '', proTip: '' };
    } else if (current) {
      current.content += line + '\n';
      const routeMatch = line.match(/\*\*Route[:\*]*\*?\*?\s*(.*)/i);
      if (routeMatch) current.route = routeMatch[1].replace(/\*\*/g, '').trim();
      const roadMatch = line.match(/\*\*Road\s*Condition[s]?[:\*]*\*?\*?\s*(.*)/i);
      if (roadMatch) current.roadCondition = roadMatch[1].replace(/\*\*/g, '').trim();
      const stayMatch = line.match(/\*\*Stay[:\*]*\*?\*?\s*(.*)/i);
      if (stayMatch) current.stay = stayMatch[1].replace(/\*\*/g, '').trim();
      const costMatch = line.match(/\*\*Day\s*Cost[:\*]*\*?\*?\s*(.*)/i);
      if (costMatch) current.dayCost = costMatch[1].replace(/\*\*/g, '').trim();
      const tipMatch = line.match(/\*\*Pro\s*Tip[:\*]*\*?\*?\s*(.*)/i);
      if (tipMatch) current.proTip = tipMatch[1].replace(/\*\*/g, '').trim();
    }
  }
  if (current) days.push(current);
  return days;
}

function getImgForDay(title) {
  const lower = (title || '').toLowerCase();
  for (const [key, url] of Object.entries(DAY_IMAGES)) {
    if (key !== 'default' && lower.includes(key)) return url;
  }
  return DAY_IMAGES.default;
}

function CarIcon({ active }) {
  return (
    <div className={`relative transition-all duration-500 ${active ? 'scale-125 -translate-y-1' : 'scale-100'}`}>
      <svg className={`w-8 h-8 ${active ? 'text-emerald-400' : 'text-white/40'}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
        <circle cx="7.5" cy="14.5" r="1.5"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
      </svg>
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-emerald-400/30 rounded-full blur-sm animate-pulse" />
      )}
    </div>
  );
}

function RoadmapVisual({ days, activeDay, onSelectDay }) {
  if (days.length === 0) return null;

  return (
    <div className="relative mb-10 overflow-x-auto pb-6 scrollbar-hide">
      <div className="flex items-center min-w-max px-6 py-4">
        {days.map((day, i) => (
          <div key={i} className="flex items-center">
            <button onClick={() => onSelectDay(i)} className="flex flex-col items-center group relative">
              {activeDay === i && (
                <div className="absolute -top-10">
                  <CarIcon active />
                </div>
              )}
              <div className={`relative w-14 h-14 rounded-full border-[3px] transition-all duration-300 overflow-hidden ${
                activeDay === i
                  ? 'border-emerald-400 shadow-lg shadow-emerald-500/40 scale-110'
                  : i < (activeDay ?? -1)
                    ? 'border-emerald-600/50 opacity-80'
                    : 'border-white/20 group-hover:border-white/40 group-hover:scale-105'
              }`}>
                <img src={getImgForDay(day.title)} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 flex items-center justify-center ${
                  activeDay === i ? 'bg-emerald-900/40' : 'bg-black/50'
                }`}>
                  <span className="text-white font-bold text-sm">{day.dayNum}</span>
                </div>
              </div>
              <span className={`mt-2 text-[11px] max-w-[80px] text-center leading-tight ${
                activeDay === i ? 'text-emerald-400 font-medium' : 'text-white/40'
              }`}>
                {day.title.replace(/Day\s*\d+\s*[-:–]?\s*/i, '').slice(0, 25)}
              </span>
              {day.route && activeDay === i && (
                <span className="mt-1 text-[9px] text-cyan-400/70 max-w-[90px] truncate">{day.route}</span>
              )}
            </button>

            {i < days.length - 1 && (
              <div className="flex items-center mx-1 relative">
                <div className={`w-16 sm:w-24 h-[3px] rounded-full relative overflow-hidden ${
                  i < (activeDay ?? -1) ? 'bg-emerald-500/60' : 'bg-white/10'
                }`}>
                  {i < (activeDay ?? -1) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-evenly opacity-30">
                    <div className="w-2 h-full bg-white/40" />
                    <div className="w-2 h-full bg-white/40" />
                    <div className="w-2 h-full bg-white/40" />
                  </div>
                </div>
                {activeDay === i && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <CarIcon active />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="ml-3 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-xl">🏁</span>
          </div>
          <span className="mt-2 text-[11px] text-emerald-400/60">Finish</span>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, isActive }) {
  const [expanded, setExpanded] = useState(true);
  const [showHotelTip, setShowHotelTip] = useState(false);

  const hotelInfo = useMemo(() => {
    const content = day.content || '';
    const lines = content.split('\n');
    const info = { name: '', rating: '', reviews: '', price: '', location: '', why: '', watchOut: '', bookingTip: '' };

    let inStaySection = false;
    for (const line of lines) {
      if (line.match(/\*\*🏨\s*Stay/i) || line.match(/\*\*Stay/i)) {
        inStaySection = true;
        const nameMatch = line.match(/\*\*[^*]*\*\*\s*\[?([^\]—\n]+)/);
        if (nameMatch) info.name = nameMatch[1].replace(/[[\]]/g, '').trim();
        const ratingMatch = line.match(/([\d.]+)\s*\/\s*5/);
        if (ratingMatch) info.rating = ratingMatch[1];
        const reviewsMatch = line.match(/\((\d+[^\)]*)\s*(?:Google\s*)?Reviews?\)/i);
        if (reviewsMatch) info.reviews = reviewsMatch[1];
        continue;
      }
      if (inStaySection) {
        if (line.match(/^\*\*[^S]/i) && !line.match(/Price|Location|Why|Watch|Book/i)) {
          inStaySection = false;
          continue;
        }
        const priceMatch = line.match(/Price[:\s]*₹([\d,]+)/i);
        if (priceMatch) info.price = priceMatch[1];
        const locMatch = line.match(/Location[:\s]*(.*)/i);
        if (locMatch) info.location = locMatch[1].replace(/[*📍]/g, '').trim();
        const whyMatch = line.match(/(?:Why|recommend)[:\s]*"?([^""\n]+)"?/i);
        if (whyMatch) info.why = whyMatch[1].trim();
        const watchMatch = line.match(/(?:Watch out|Con)[:\s]*(.*)/i);
        if (watchMatch) info.watchOut = watchMatch[1].replace(/[*❌]/g, '').trim();
        const bookMatch = line.match(/(?:Booking tip|Book via)[:\s]*(.*)/i);
        if (bookMatch) info.bookingTip = bookMatch[1].replace(/[*🔗]/g, '').trim();
      }
    }
    if (!info.name && day.stay) info.name = day.stay;
    return info;
  }, [day]);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
      isActive ? 'border-emerald-500/40 shadow-xl shadow-emerald-500/10 bg-slate-800/80' : 'border-white/10 bg-white/5'
    }`}>
      <div className="relative h-44 sm:h-52 overflow-hidden">
        <img src={getImgForDay(day.title)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-sm">{day.dayNum}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{day.title}</h3>
              {day.route && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-cyan-400/80 text-xs">{day.route}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {day.roadCondition && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/20">
                🛣️ {day.roadCondition.slice(0, 40)}
              </span>
            )}
            {day.dayCost && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/20">
                💰 {day.dayCost.slice(0, 30)}
              </span>
            )}
          </div>
        </div>
      </div>

      {hotelInfo.name && (
        <div className="mx-5 mt-4 relative">
          <div
            className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl cursor-pointer hover:border-violet-500/40 transition-all group"
            onMouseEnter={() => setShowHotelTip(true)}
            onMouseLeave={() => setShowHotelTip(false)}
            onClick={() => setShowHotelTip(!showHotelTip)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <span className="text-lg">🏨</span>
                </div>
                <div>
                  <p className="text-violet-200 font-semibold text-sm">{hotelInfo.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {hotelInfo.rating && (
                      <span className="text-amber-400 text-xs font-medium">⭐ {hotelInfo.rating}/5</span>
                    )}
                    {hotelInfo.reviews && (
                      <span className="text-white/40 text-[10px]">({hotelInfo.reviews} reviews)</span>
                    )}
                    {hotelInfo.price && (
                      <span className="text-emerald-400 text-xs">₹{hotelInfo.price}/night</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-white/30 group-hover:text-violet-400 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {showHotelTip && (hotelInfo.why || hotelInfo.watchOut || hotelInfo.bookingTip || hotelInfo.location) && (
              <div className="mt-3 pt-3 border-t border-violet-500/20 space-y-2 animate-fadeIn">
                {hotelInfo.location && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs">📍</span>
                    <p className="text-white/60 text-xs">{hotelInfo.location}</p>
                  </div>
                )}
                {hotelInfo.why && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs">✅</span>
                    <p className="text-emerald-300/80 text-xs italic">"{hotelInfo.why}"</p>
                  </div>
                )}
                {hotelInfo.watchOut && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs">⚠️</span>
                    <p className="text-amber-300/80 text-xs">{hotelInfo.watchOut}</p>
                  </div>
                )}
                {hotelInfo.bookingTip && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs">💡</span>
                    <p className="text-cyan-300/80 text-xs">{hotelInfo.bookingTip}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-4 transition-colors">
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {expanded ? 'Hide details' : 'Show full day details'}
        </button>

        {expanded && (
          <div className="space-y-4 animate-fadeIn">
            <div className="prose prose-invert prose-sm max-w-none
              prose-h3:text-emerald-400 prose-h3:text-sm prose-h3:font-bold prose-h3:mb-2 prose-h3:mt-4
              prose-strong:text-cyan-300
              prose-li:text-white/70 prose-li:text-sm
              prose-p:text-white/70 prose-p:text-sm
              prose-table:text-xs prose-th:text-emerald-400 prose-th:bg-emerald-500/10 prose-th:px-3 prose-th:py-1.5
              prose-td:px-3 prose-td:py-1.5 prose-td:border-white/5 prose-td:text-white/70
              prose-em:text-violet-300/80">
              <ReactMarkdown>{day.content}</ReactMarkdown>
            </div>

            {day.proTip && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-amber-300 text-sm font-medium">Pro Tip</p>
                  <p className="text-white/70 text-sm">{day.proTip}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Itinerary({ tripId }) {
  const [itinerary, setItinerary] = useState('');
  const [seasonInfo, setSeasonInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [proposals, setProposals] = useState([]);

  const days = useMemo(() => parseDays(itinerary), [itinerary]);

  const generateItinerary = async () => {
    setLoading(true);
    try {
      const [{ data }, bRes, pRes] = await Promise.all([
        chatApi.curate(tripId),
        bookingApi.getByTrip(tripId).catch(() => ({ data: [] })),
        proposalApi.getAll(tripId).catch(() => ({ data: [] })),
      ]);
      setItinerary(data.itinerary);
      setBookings(bRes.data || []);
      setProposals((pRes.data || []).filter(p => p.status === 'APPROVED'));
      setActiveDay(0);
    } catch {
      setItinerary('Failed to generate itinerary. Please try again.');
    }
    setLoading(false);
  };

  const getSeasonInfo = async () => {
    setLoading(true);
    try {
      const { data } = await chatApi.getSeason(tripId);
      setSeasonInfo(data.recommendation);
    } catch {
      setSeasonInfo('Failed to get season info.');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const content = itinerary || seasonInfo;
    if (!content) return;

    const roadmapHTML = days.length > 0 ? `
      <div class="roadmap">
        <h2 style="text-align:center;color:#10b981;margin-bottom:10px;">🚗 Trip Roadmap</h2>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
          ${days.map((d, i) => `<div style="display:flex;align-items:center;">
            <div style="text-align:center;padding:10px 16px;background:#f0fdf4;border:2px solid #10b981;border-radius:12px;">
              <strong style="color:#10b981;font-size:16px;">Day ${d.dayNum}</strong><br/>
              <span style="font-size:11px;color:#555;">${d.title.replace(/Day\s*\d+\s*[-:–]?\s*/i, '').slice(0, 30)}</span>
              ${d.route ? `<br/><span style="font-size:10px;color:#0891b2;">${d.route}</span>` : ''}
            </div>
            ${i < days.length - 1 ? '<span style="font-size:20px;margin:0 6px;">🚗➜</span>' : ''}
          </div>`).join('')}
          <div style="display:flex;align-items:center;"><span style="font-size:24px;margin-left:6px;">🏁</span></div>
        </div>
      </div>` : '';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>WanderTribe - Trip Roadmap</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,sans-serif; line-height:1.7; color:#1a1a2e; padding:40px; max-width:850px; margin:0 auto; }
        .header { text-align:center; margin-bottom:20px; padding-bottom:20px; border-bottom:3px solid #10b981; }
        .header h1 { color:#10b981; font-size:28px; }
        .header p { color:#666; font-size:14px; }
        h2 { color:#10b981; border-bottom:1px solid #e5e7eb; padding-bottom:5px; margin:25px 0 12px; }
        h3 { color:#059669; margin:15px 0 8px; }
        ul,ol { margin-left:20px; margin-bottom:10px; } li { margin-bottom:5px; }
        strong { color:#059669; } p { margin-bottom:10px; }
        .footer { margin-top:40px; padding-top:15px; border-top:2px solid #10b981; text-align:center; color:#999; font-size:12px; }
        @media print { body { padding:20px; } }
      </style></head><body>
        <div class="header"><h1>🏔️ WanderTribe</h1><p>AI-Curated Travel Roadmap &bull; ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p></div>
        ${roadmapHTML}
        <div id="content"></div>
        <div class="footer"><p>Generated by WanderTribe AI</p><p>Prices are estimates. Always confirm before booking.</p></div>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
        <script>document.getElementById('content').innerHTML=marked.parse(${JSON.stringify(content)});setTimeout(()=>window.print(),500);<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={generateItinerary} disabled={loading}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 text-base shadow-lg shadow-emerald-500/20">
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Generating Roadmap...
            </>
          ) : (
            <><span>🚗</span> Generate Trip Roadmap</>
          )}
        </button>
        <button onClick={getSeasonInfo} disabled={loading}
          className="px-5 py-3 bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 rounded-xl font-medium transition-all flex items-center gap-2 text-sm text-cyan-300">
          {loading ? '⏳ Loading...' : '📅 Best Season Guide'}
        </button>
        {(itinerary || seasonInfo) && (
          <button onClick={downloadPDF}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 text-base shadow-lg shadow-violet-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download PDF
          </button>
        )}
      </div>

      <p className="text-white/30 text-sm mb-8">
        🗺️ AI generates a detailed roadmap with routes, distances, road conditions, stays, food spots, costs & pro tips based on your group's discussions.
      </p>

      {!itinerary && !seasonInfo && (
        <div className="text-center py-16 text-white/30">
          <div className="text-7xl mb-4 animate-bounce">🚗</div>
          <p className="text-2xl mb-2">Ready for the road?</p>
          <p className="max-w-md mx-auto text-base">Click "Generate Trip Roadmap" for a detailed day-by-day plan with driving routes, distances, hotels, food spots & costs.</p>
          <div className="mt-6 flex justify-center gap-4 text-sm text-emerald-400/60">
            <span>🛣️ Routes</span>
            <span>🏨 Stays</span>
            <span>🍽️ Food</span>
            <span>💰 Costs</span>
            <span>💡 Tips</span>
          </div>
        </div>
      )}

      {itinerary && (
        <div className="mb-6">
          {days.length > 0 && (
            <RoadmapVisual
              days={days}
              activeDay={activeDay}
              onSelectDay={(i) => setActiveDay(activeDay === i ? null : i)}
            />
          )}

          {days.length > 0 ? (
            <div className="space-y-6">
              {activeDay !== null ? (
                <div className="animate-fadeIn">
                  <DayCard day={days[activeDay]} isActive />
                  <div className="flex gap-3 mt-4">
                    {activeDay > 0 && (
                      <button onClick={() => setActiveDay(activeDay - 1)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                        Day {days[activeDay - 1].dayNum}
                      </button>
                    )}
                    <button onClick={() => setActiveDay(null)}
                      className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      View All Days
                    </button>
                    {activeDay < days.length - 1 && (
                      <button onClick={() => setActiveDay(activeDay + 1)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ml-auto">
                        Day {days[activeDay + 1].dayNum}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-5">
                  {days.map((day, i) => (
                    <div key={i} onClick={() => setActiveDay(i)} className="cursor-pointer">
                      <DayCard day={day} isActive={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
                <span>🗺️</span> Your AI-Curated Roadmap
              </h3>
              <div className="prose prose-invert prose-sm sm:prose-lg max-w-none">
                <ReactMarkdown>{itinerary}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {seasonInfo && (
        <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-5 sm:p-8 mt-6">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📅</span> Season Guide
          </h3>
          <div className="prose prose-invert prose-sm sm:prose-lg max-w-none">
            <ReactMarkdown>{seasonInfo}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
