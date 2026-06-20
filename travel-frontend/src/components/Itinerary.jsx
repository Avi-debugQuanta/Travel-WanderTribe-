import { useState, useMemo } from 'react';
import { chatApi, proposalApi, bookingApi, ideaApi } from '../api';
import ReactMarkdown from 'react-markdown';

const DAY_THEMES = [
  { gradient: 'from-emerald-500/20 to-cyan-500/20', border: 'border-emerald-500/30', accent: 'text-emerald-400' },
  { gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', accent: 'text-violet-400' },
  { gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', accent: 'text-amber-400' },
  { gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', accent: 'text-cyan-400' },
  { gradient: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', accent: 'text-rose-400' },
  { gradient: 'from-teal-500/20 to-green-500/20', border: 'border-teal-500/30', accent: 'text-teal-400' },
];

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
  default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
};

function parseDays(itineraryObj) {
  if (!itineraryObj || !itineraryObj.days) return [];
  
  return itineraryObj.days.map(d => {
    const content = `
${d.route ? `**Route:** ${d.route}` : ''}

### 🕰️ Schedule
${(d.schedule || []).map(s => `- ${s}`).join('\n')}

### 🍽️ Food & Dining
${(d.food || []).map(f => `- ${f}`).join('\n')}

### ⚠️ Risks & Tips
${(d.risks || []).map(r => `- ${r}`).join('\n')}

${d.guide ? `**Guide/Expert:** ${d.guide}` : ''}
${d.budget ? `**Day Budget:** ${d.budget}` : ''}

### 💡 Insider Tips
${(d.tips || []).map(t => `- ${t}`).join('\n')}
    `;

    const routeStops = (d.stops || []).map(s => {
      return { km: '-', stop: s, activity: '', duration: '-' };
    });

    return {
      dayNum: d.day || 1,
      title: d.title || `Day ${d.day}`,
      content: content,
      routeStops: routeStops,
      hotelDetails: d.hotel || '',
      totalKm: d.route || '',
      scenic: d.scenicRating || '★★★★☆'
    };
  });
}

function getImgForDay(title) {
  const lower = (title || '').toLowerCase();
  for (const [key, url] of Object.entries(DAY_IMAGES)) {
    if (key !== 'default' && lower.includes(key)) return url;
  }
  return DAY_IMAGES.default;
}

function RouteStopsVisual({ stops }) {
  if (!stops || stops.length === 0) return null;
  return (
    <div className="my-4 relative">
      <div className="absolute left-[22px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-emerald-500 via-cyan-500 to-emerald-500 opacity-40" />
      <div className="space-y-3">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-start gap-3 relative">
            <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold z-10 ${
              i === 0 ? 'bg-emerald-500 text-white' :
              i === stops.length - 1 ? 'bg-cyan-500 text-white' :
              'bg-slate-700 border-2 border-emerald-500/40 text-emerald-400'
            }`}>
              {stop.km}km
            </div>
            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white text-sm">{stop.stop}</span>
                {stop.duration && stop.duration !== '-' && (
                  <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/50">{stop.duration}</span>
                )}
              </div>
              {stop.activity && stop.activity !== '-' && (
                <p className="text-white/50 text-xs mt-0.5">{stop.activity}</p>
              )}
            </div>
            {i === 0 && <span className="text-xs text-emerald-400 pt-2.5">START</span>}
            {i === stops.length - 1 && <span className="text-xs text-cyan-400 pt-2.5">ARRIVE</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CarRoadmap({ days, activeDay, onSelectDay }) {
  if (days.length === 0) return null;
  return (
    <div className="relative mb-8 overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex items-center min-w-max px-4 py-3 bg-slate-800/50 rounded-2xl border border-white/5">
        <div className="flex flex-col items-center mr-3">
          <span className="text-lg">🚩</span>
          <span className="text-[9px] text-white/30 mt-1">Start</span>
        </div>

        {days.map((day, i) => (
          <div key={i} className="flex items-center">
            <button onClick={() => onSelectDay(i)} className="flex flex-col items-center group relative">
              {activeDay === i && (
                <div className="absolute -top-8 animate-bounce">
                  <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/>
                    <circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/>
                  </svg>
                </div>
              )}
              <div className={`w-12 h-12 rounded-full border-[3px] flex items-center justify-center transition-all ${
                activeDay === i ? 'border-emerald-400 bg-emerald-500/20 scale-110 shadow-lg shadow-emerald-500/30' :
                i < (activeDay ?? -1) ? 'border-emerald-600/40 bg-emerald-900/30' :
                'border-white/15 bg-white/5 group-hover:border-white/30 group-hover:scale-105'
              }`}>
                <span className={`font-bold text-sm ${activeDay === i ? 'text-emerald-400' : 'text-white/60'}`}>{day.dayNum}</span>
              </div>
              <span className={`mt-1 text-[9px] max-w-[60px] text-center truncate ${activeDay === i ? 'text-emerald-400' : 'text-white/30'}`}>
                {day.title.replace(/Day\s*\d+\s*[-:–]?\s*/i, '').slice(0, 15)}
              </span>
              {day.totalKm && (
                <span className="text-[8px] text-white/20">{day.totalKm.match(/\d+\s*km/i)?.[0] || ''}</span>
              )}
            </button>
            {i < days.length - 1 && (
              <div className="mx-2 flex items-center">
                <div className={`w-12 sm:w-16 h-[3px] rounded relative ${i < (activeDay ?? -1) ? 'bg-emerald-500/50' : 'bg-white/10'}`}>
                  <div className="absolute inset-0 flex justify-evenly items-center">
                    {[...Array(4)].map((_, j) => <div key={j} className="w-1.5 h-[3px] bg-white/20 rounded" />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col items-center ml-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <span className="text-base">🏁</span>
          </div>
          <span className="text-[9px] text-emerald-400/50 mt-1">Finish</span>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, isActive, theme, ideas }) {
  const [expanded, setExpanded] = useState(isActive);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 interactive-card ${
      isActive ? `${theme.border} shadow-xl shadow-emerald-500/5 bg-slate-800/90` : 'border-white/10 bg-white/5 hover:bg-white/[0.07]'
    }`}>
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img src={getImgForDay(day.title)} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          {day.scenic && (
            <span className="px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] text-amber-300">{day.scenic}</span>
          )}
          {day.totalKm && (
            <span className="px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] text-cyan-300">📏 {day.totalKm.slice(0, 25)}</span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1.5 bg-gradient-to-r ${theme.gradient}`}>
                <span className={theme.accent}>DAY {day.dayNum}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{day.title}</h3>
              {day.route && (
                <p className="text-cyan-400/70 text-xs mt-1 flex items-center gap-1">
                  <span>🗺️</span> {day.route.slice(0, 60)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {day.routeStops.length > 0 && (
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-white/50">🛣️ ROUTE STOPS</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <RouteStopsVisual stops={day.routeStops} />
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <div className="px-5 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-violet-400/70">👥 GROUP IDEAS INCLUDED</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ideas.map((idea, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
                <span className="text-[10px]">👍 {idea.votes}</span>
                {idea.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-5">
        {day.hotelDetails && (
          <div className="mb-4 mt-2 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 relative overflow-hidden group hover:border-violet-500/50 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-400 to-fuchsia-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-violet-300 font-bold text-sm mb-1 flex items-center gap-1.5">
                  <span>🏨</span> WanderTribe Exclusive Stay
                </h4>
                <div className="text-white/80 text-sm leading-relaxed max-w-lg pr-4">
                  <ReactMarkdown className="prose prose-invert prose-sm prose-p:my-1">{day.hotelDetails}</ReactMarkdown>
                </div>
              </div>
              <button className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-violet-500/30 transform transition hover:scale-105">
                Reserve ⚡️
              </button>
            </div>
          </div>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white/80 mb-3 transition-colors w-full">
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {expanded ? 'Collapse Day Details' : 'Expand Full Day Schedule'}
          <div className="flex-1 h-px bg-white/5 ml-2" />
        </button>

        {expanded && (
          <div className="space-y-3 animate-fadeIn">
            <div className="prose prose-invert prose-sm max-w-none
              prose-h3:text-emerald-400 prose-h3:text-base prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-5 prose-h3:border-b prose-h3:border-white/5 prose-h3:pb-2
              prose-h4:text-cyan-300 prose-h4:text-sm
              prose-strong:text-cyan-200
              prose-li:text-white/70 prose-li:text-sm prose-li:leading-relaxed
              prose-p:text-white/70 prose-p:text-sm prose-p:leading-relaxed
              prose-table:text-xs prose-th:text-emerald-400 prose-th:bg-emerald-500/5 prose-th:px-3 prose-th:py-2 prose-th:text-left
              prose-td:px-3 prose-td:py-2 prose-td:border-white/5 prose-td:text-white/70
              prose-em:text-violet-300/80 prose-em:not-italic
              prose-blockquote:border-l-emerald-500/40 prose-blockquote:bg-emerald-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:text-emerald-200/70 prose-blockquote:text-xs prose-blockquote:italic">
              <ReactMarkdown
                components={{
                  td: ({ children, ...props }) => {
                    const text = String(children || '');
                    const phoneMatch = text.match(/(\+91[-\s]?\d{5}[-\s]?\d{5}|\d{10,})/);
                    if (phoneMatch) {
                      const phone = phoneMatch[1].replace(/[-\s]/g, '');
                      return (
                        <td {...props}>
                          <a href={`tel:${phone}`} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all no-underline text-[11px] font-medium">
                            📞 Call to Reserve
                          </a>
                        </td>
                      );
                    }
                    return <td {...props}>{children}</td>;
                  },
                  a: ({ href, children, ...props }) => (
                    <a href={href} target="_blank" rel="noopener" className="text-cyan-400 hover:text-cyan-300 no-underline border-b border-cyan-400/30 hover:border-cyan-400" {...props}>{children}</a>
                  ),
                  li: ({ children, ...props }) => {
                    const text = String(children || '');
                    if (text.match(/📞|call|contact|phone/i)) {
                      const phoneMatch = text.match(/(\+91[-\s]?\d{5}[-\s]?\d{5}|\d{10,})/);
                      if (phoneMatch) {
                        const phone = phoneMatch[1].replace(/[-\s]/g, '');
                        return (
                          <li {...props}>
                            {children}
                            <a href={`tel:${phone}`}
                              className="inline-flex items-center gap-1.5 ml-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/20 transition-all no-underline">
                              📞 Tap to Call
                            </a>
                          </li>
                        );
                      }
                    }
                    return <li {...props}>{children}</li>;
                  }
                }}
              >{day.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function generatePDF(itinerary, days, tripIdeas) {
  if (!itinerary) return;

  const roadmapHTML = days.length > 0 ? `
    <div style="page-break-after:always;padding:40px 0;">
      <h2 style="text-align:center;color:#10b981;font-size:24px;margin-bottom:30px;">🚗 Your Road Trip Route</h2>
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;align-items:center;">
        <div style="padding:8px 16px;background:#ecfdf5;border:2px solid #10b981;border-radius:50%;font-size:20px;">🚩</div>
        ${days.map((d, i) => `
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="text-align:center;padding:12px 18px;background:linear-gradient(135deg,#ecfdf5,#f0fdfa);border:2px solid #10b981;border-radius:14px;min-width:100px;">
              <div style="font-weight:800;color:#10b981;font-size:14px;">Day ${d.dayNum}</div>
              <div style="font-size:10px;color:#555;margin-top:2px;">${d.title.replace(/Day\s*\d+\s*[-:–]?\s*/i, '').slice(0, 25)}</div>
              ${d.totalKm ? `<div style="font-size:9px;color:#0891b2;margin-top:3px;">${d.totalKm.match(/\\d+\\s*km/i)?.[0] || ''}</div>` : ''}
            </div>
            ${i < days.length - 1 ? '<div style="font-size:16px;color:#10b981;">━━🚗━━▶</div>' : ''}
          </div>
        `).join('')}
        <div style="padding:8px 16px;background:#ecfdf5;border:2px solid #10b981;border-radius:50%;font-size:20px;">🏁</div>
      </div>
      ${tripIdeas.length > 0 ? `
        <div style="margin-top:30px;padding:20px;background:#f5f3ff;border:1px solid #8b5cf6;border-radius:12px;">
          <h3 style="color:#7c3aed;margin-bottom:10px;font-size:14px;">👥 Group Voted Ideas Included</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${tripIdeas.map(i => `<span style="padding:4px 12px;background:white;border:1px solid #c4b5fd;border-radius:20px;font-size:11px;color:#6d28d9;">👍 ${i.votes} — ${i.title}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>` : '';

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html><html><head>
    <title>WanderTribe — Trip Roadmap</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Inter',system-ui,sans-serif; line-height:1.8; color:#334155; max-width:900px; margin:0 auto; padding:50px 40px; background-color:#fafaf9; }
      .cover { text-align:center; padding:60px 0; margin-bottom:40px; border-bottom:2px solid #e2e8f0; }
      .cover h1 { font-family:'Playfair Display',serif; font-size:42px; font-weight:600; color:#0f172a; margin-bottom:10px; }
      .cover .subtitle { color:#64748b; font-size:16px; margin-top:8px; font-style:italic; }
      .cover .badge { display:inline-block; margin-top:20px; padding:10px 24px; background:#f43f5e; border-radius:30px; color:white; font-size:13px; font-weight:600; letter-spacing:1px; box-shadow: 0 4px 14px rgba(244,63,94,0.3); }
      h2 { font-family:'Playfair Display',serif; color:#0f172a; font-size:24px; font-weight:600; margin:40px 0 20px; padding-bottom:12px; border-bottom:1px solid #e2e8f0; }
      h3 { color:#f43f5e; font-size:18px; font-weight:600; margin:25px 0 12px; }
      h4 { color:#6366f1; font-size:15px; margin:20px 0 10px; }
      p { margin-bottom:12px; font-size:14px; color:#475569; }
      ul,ol { margin-left:24px; margin-bottom:16px; color:#475569; } li { margin-bottom:6px; font-size:14px; }
      strong { color:#1e293b; font-weight:600; }
      em { color:#8b5cf6; font-style:italic; }
      blockquote { border-left:4px solid #f43f5e; background:#fff1f2; padding:12px 20px; border-radius:0 12px 12px 0; margin:16px 0; font-size:14px; color:#be123c; font-style:italic; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
      table { width:100%; border-collapse:separate; border-spacing:0; margin:20px 0; font-size:13px; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
      th { background:#f8fafc; color:#334155; text-align:left; padding:12px 16px; font-weight:600; border-bottom:1px solid #e2e8f0; }
      td { padding:10px 16px; border-bottom:1px solid #f1f5f9; }
      tr:last-child td { border-bottom:none; }
      .footer { margin-top:60px; padding-top:30px; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:12px; }
      .day-header { background:linear-gradient(to right,#fff1f2,#ffffff); padding:20px 24px; border-radius:16px; margin:40px 0 20px; border-left:6px solid #f43f5e; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
      .day-header h2 { margin:0; border:none; padding:0; font-size:28px; color:#be123c; }
      @media print { body { padding:30px; background-color:white; } .cover { padding:30px 0; } .day-header { box-shadow:none; border:1px solid #e2e8f0; border-left:6px solid #f43f5e; } }
      @page { margin: 1.5cm; }
    </style>
  </head><body>
    <div class="cover">
      <h1>WanderTribe Exclusive</h1>
      <p class="subtitle">A Handcrafted Road Trip Journey</p>
      <p class="subtitle">${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
      <div class="badge">Curated Personally For You ✨</div>
    </div>
    ${roadmapHTML}
    <div id="content"></div>
    <div class="footer">
      <p>Handcrafted by your friends at <strong>WanderTribe</strong></p>
      <p style="margin-top:6px;">Wishing you safe travels and unforgettable memories!</p>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
    <script>
      const content = ${JSON.stringify(itinerary)};
      document.getElementById('content').innerHTML = marked.parse(content);
      document.querySelectorAll('h2').forEach(h => {
        if (h.textContent.match(/Day\\s*\\d/i)) {
          const wrapper = document.createElement('div');
          wrapper.className = 'day-header';
          h.parentNode.insertBefore(wrapper, h);
          wrapper.appendChild(h);
        }
      });
      setTimeout(() => window.print(), 800);
    <\/script>
  </body></html>`);
  printWindow.document.close();
}

export default function Itinerary({ tripId }) {
  const [itinerary, setItinerary] = useState(null);
  const [seasonInfo, setSeasonInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [tripIdeas, setTripIdeas] = useState([]);
  const [progress, setProgress] = useState('');
  const [clarificationQuestions, setClarificationQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const days = useMemo(() => parseDays(itinerary), [itinerary]);

  const generateItinerary = async (clarificationAnswers = null) => {
    setLoading(true);
    setProgress('Fetching group ideas & bookings...');
    try {
      const ideasRes = await ideaApi.getByTrip(tripId).catch(() => ({ data: [] }));
      const ideas = (ideasRes.data || []).sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 8);
      setTripIdeas(ideas.map(i => ({ title: i.title, votes: i.voteCount || 0 })));

      setProgress('AI is crafting your detailed roadmap...');
      const [{ data }, bRes, pRes] = await Promise.all([
        chatApi.curate(tripId, clarificationAnswers),
        bookingApi.getByTrip(tripId).catch(() => ({ data: [] })),
        proposalApi.getAll(tripId).catch(() => ({ data: [] })),
      ]);
      
      if (data.itinerary?.type === 'clarification' && data.itinerary?.questions) {
        setClarificationQuestions(data.itinerary.questions);
        setItinerary(null);
      } else {
        setClarificationQuestions([]);
        setItinerary(data.itinerary);
        setBookings(bRes.data || []);
        setProposals((pRes.data || []).filter(p => p.status === 'APPROVED'));
        setActiveDay(0);
      }
      setProgress('');
    } catch {
      setItinerary('Failed to generate itinerary. Please try again.');
      setProgress('');
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

  const handleClarificationSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([i, a]) => `Q: ${clarificationQuestions[i]}\nA: ${a}`).join('\n\n');
    setClarificationQuestions([]);
    generateItinerary(formattedAnswers);
  };

  return (
    <div className="p-4 sm:p-6 relative">
      {clarificationQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setClarificationQuestions([])} />
          <div className="bg-slate-800 border border-violet-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl shadow-violet-500/20 animate-fadeIn">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-violet-400">🤖</span> Clarify your trip
            </h3>
            <p className="text-white/60 text-sm mb-6">WanderTribe AI needs a few more details to create the perfect itinerary for you.</p>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              {clarificationQuestions.map((q, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <label className="block text-sm font-medium text-violet-300 mb-2">{q}</label>
                  <textarea
                    value={answers[i] || ''}
                    onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
                    placeholder="Type your answer..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all outline-none resize-none"
                    rows="2"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setClarificationQuestions([])} className="px-5 py-2.5 rounded-xl font-medium text-white/50 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleClarificationSubmit} className="px-5 py-2.5 bg-violet-500 hover:bg-violet-400 rounded-xl font-medium text-white transition-all shadow-lg shadow-violet-500/25">
                Generate Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => generateItinerary(null)} disabled={loading}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 text-base shadow-lg shadow-emerald-500/20">
          {loading ? (
            <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> {progress || 'Generating...'}</>
          ) : (
            <><span>🚗</span> Generate Ultimate Roadmap</>
          )}
        </button>
        <button onClick={getSeasonInfo} disabled={loading}
          className="px-5 py-3 bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 rounded-xl font-medium transition-all flex items-center gap-2 text-sm text-cyan-300">
          📅 Best Season Guide
        </button>
        {itinerary && (
          <button onClick={() => generatePDF(itinerary, days, tripIdeas)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 text-base shadow-lg shadow-violet-500/20">
            📄 Download Premium PDF
          </button>
        )}
      </div>

      {!itinerary && !seasonInfo && (
        <div className="text-center py-14">
          <div className="text-6xl mb-5 animate-pulse">🗺️</div>
          <h3 className="text-2xl font-bold text-white/80 mb-2">Your Road Trip Awaits</h3>
          <p className="text-white/40 max-w-lg mx-auto mb-6">
            Our AI plans every kilometer — dhaba stops, scenic viewpoints, km markers, Google-reviewed hotels, hour-by-hour schedule, and your group's voted ideas.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {['🛣️ Km-by-km route', '🍽️ Dhaba & food stops', '🏨 Google-rated stays', '💡 Pro tips', '👥 Group ideas', '📱 App suggestions'].map(f => (
              <span key={f} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50">{f}</span>
            ))}
          </div>
        </div>
      )}

      {itinerary && (
        <div className="mb-6">
          {tripIdeas.length > 0 && (
            <div className="mb-6 p-4 bg-violet-500/5 border border-violet-500/15 rounded-xl">
              <p className="text-xs font-medium text-violet-400/70 mb-2">👥 Your Group's Top Ideas (incorporated in roadmap)</p>
              <div className="flex flex-wrap gap-2">
                {tripIdeas.map((idea, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
                    <span className="font-bold text-violet-400">👍{idea.votes}</span> {idea.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          <CarRoadmap days={days} activeDay={activeDay} onSelectDay={(i) => setActiveDay(activeDay === i ? null : i)} />

          {days.length > 0 ? (
            <div className="space-y-6">
              {activeDay !== null ? (
                <div className="animate-fadeIn">
                  <DayCard
                    day={days[activeDay]}
                    isActive
                    theme={DAY_THEMES[activeDay % DAY_THEMES.length]}
                    ideas={tripIdeas.length > 0 ? tripIdeas.slice(0, 3) : null}
                  />
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {activeDay > 0 && (
                      <button onClick={() => setActiveDay(activeDay - 1)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        ← Day {days[activeDay - 1].dayNum}
                      </button>
                    )}
                    <button onClick={() => setActiveDay(null)}
                      className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      📋 View All Days
                    </button>
                    {activeDay < days.length - 1 && (
                      <button onClick={() => setActiveDay(activeDay + 1)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ml-auto">
                        Day {days[activeDay + 1].dayNum} →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-5">
                  {days.map((day, i) => (
                    <div key={i} onClick={() => setActiveDay(i)} className="cursor-pointer">
                      <DayCard day={day} isActive={false} theme={DAY_THEMES[i % DAY_THEMES.length]} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="prose prose-invert prose-sm max-w-none
                prose-h2:text-emerald-400 prose-h3:text-cyan-300
                prose-table:text-xs prose-th:text-emerald-400 prose-th:bg-emerald-500/5
                prose-blockquote:border-l-emerald-500/40 prose-blockquote:bg-emerald-500/5 prose-blockquote:rounded-r-lg">
                <ReactMarkdown>{itinerary}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {seasonInfo && (
        <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-6 mt-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span>📅</span> Season Guide</h3>
          <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{seasonInfo}</ReactMarkdown></div>
        </div>
      )}
    </div>
  );
}
