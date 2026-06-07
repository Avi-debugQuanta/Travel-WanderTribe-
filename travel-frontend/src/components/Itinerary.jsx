import { useState, useMemo } from 'react';
import { chatApi, proposalApi, bookingApi } from '../api';
import ReactMarkdown from 'react-markdown';

const DAY_IMAGES = {
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=200',
  kashmir: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=200',
  shimla: 'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?w=200',
  spiti: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=200',
  kasol: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=200',
  rishikesh: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=200',
  dharamshala: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=200',
  leh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
  ladakh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
  gulmarg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200',
  default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
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
      current = { dayNum: parseInt(dayNum), title, content: '', places: [] };
    } else if (current) {
      current.content += line + '\n';
      const placeMatch = line.match(/[-*]\s*\*\*(.+?)\*\*/);
      if (placeMatch && current.places.length < 3) current.places.push(placeMatch[1]);
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

function VisualRoadmap({ days, activeDay, onSelectDay }) {
  if (days.length === 0) return null;
  return (
    <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex items-start gap-0 min-w-max px-4">
        {days.map((day, i) => (
          <div key={i} className="flex items-start">
            <button onClick={() => onSelectDay(i)}
              className={`flex flex-col items-center transition-all group ${activeDay === i ? 'scale-110' : 'hover:scale-105'}`}>
              <div className={`relative w-16 h-16 rounded-2xl overflow-hidden border-3 transition-all ${
                activeDay === i ? 'border-emerald-400 shadow-lg shadow-emerald-500/30' : 'border-white/20 group-hover:border-white/40'
              }`}>
                <img src={getImgForDay(day.title)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Day {day.dayNum}</span>
                </div>
              </div>
              <span className={`mt-1.5 text-xs max-w-[80px] truncate ${activeDay === i ? 'text-emerald-400' : 'text-white/40'}`}>
                {day.title.replace(/Day\s*\d+\s*[-:–]?\s*/i, '').slice(0, 20)}
              </span>
            </button>
            {i < days.length - 1 && (
              <div className="flex items-center h-16 px-1">
                <div className="w-8 h-0.5 bg-gradient-to-r from-emerald-500/60 to-white/10 relative">
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-emerald-500/60" />
                </div>
              </div>
            )}
          </div>
        ))}
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
      setActiveDay(null);
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
        <h2 style="text-align:center;color:#10b981;margin-bottom:10px;">Trip Roadmap</h2>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
          ${days.map(d => `<div style="text-align:center;padding:8px 14px;background:#f0fdf4;border:1px solid #10b981;border-radius:12px;">
            <strong style="color:#10b981;">Day ${d.dayNum}</strong><br/>
            <span style="font-size:11px;color:#555;">${d.title.replace(/Day\s*\d+\s*[-:–]?\s*/i, '').slice(0, 30)}</span>
          </div>`).join('<div style="display:flex;align-items:center;padding:0 2px;"><span style="color:#10b981;">&rarr;</span></div>')}
        </div>
      </div>` : '';

    const bookingsHTML = (bookings.length > 0 || proposals.length > 0) ? `
      <div style="page-break-before:always;margin-top:30px;">
        <h2 style="color:#10b981;border-bottom:2px solid #10b981;padding-bottom:8px;">Booked Items</h2>
        <table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:12px;">
          <thead><tr style="background:#f0fdf4;">
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Item</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Type</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Date</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Price</th>
          </tr></thead>
          <tbody>
            ${bookings.map(b => `<tr>
              <td style="padding:6px;border:1px solid #ddd;">${b.providerName}</td>
              <td style="padding:6px;border:1px solid #ddd;">${b.type}</td>
              <td style="padding:6px;border:1px solid #ddd;">${b.proposedDate || '-'}</td>
              <td style="padding:6px;border:1px solid #ddd;">&nbsp;${b.price?.toLocaleString()}</td>
            </tr>`).join('')}
            ${proposals.map(p => `<tr style="background:#f0fdf4;">
              <td style="padding:6px;border:1px solid #ddd;">${p.itemName} (approved)</td>
              <td style="padding:6px;border:1px solid #ddd;">${p.itemType}</td>
              <td style="padding:6px;border:1px solid #ddd;">${p.proposedDate || '-'}</td>
              <td style="padding:6px;border:1px solid #ddd;">&nbsp;${p.price?.toLocaleString()}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    const transportRef = `
      <div style="margin-top:30px;">
        <h2 style="color:#10b981;border-bottom:2px solid #10b981;padding-bottom:8px;">Transport Quick Reference</h2>
        <table style="width:100%;border-collapse:collapse;margin:15px 0;font-size:12px;">
          <thead><tr style="background:#f0fdf4;">
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Route</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Mode</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Cost</th>
            <th style="padding:8px;text-align:left;border:1px solid #ddd;">Duration</th>
          </tr></thead>
          <tbody>
            <tr><td style="padding:6px;border:1px solid #ddd;">Delhi &rarr; Manali</td><td style="padding:6px;border:1px solid #ddd;">Volvo Bus</td><td style="padding:6px;border:1px solid #ddd;">&nbsp;1200-1800</td><td style="padding:6px;border:1px solid #ddd;">12-14 hrs</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Delhi &rarr; Shimla</td><td style="padding:6px;border:1px solid #ddd;">Volvo Bus</td><td style="padding:6px;border:1px solid #ddd;">&nbsp;800-1200</td><td style="padding:6px;border:1px solid #ddd;">8-9 hrs</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Delhi &rarr; Srinagar</td><td style="padding:6px;border:1px solid #ddd;">Flight</td><td style="padding:6px;border:1px solid #ddd;">&nbsp;3000-7000</td><td style="padding:6px;border:1px solid #ddd;">1.5 hrs</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Delhi &rarr; Leh</td><td style="padding:6px;border:1px solid #ddd;">Flight</td><td style="padding:6px;border:1px solid #ddd;">&nbsp;4000-10000</td><td style="padding:6px;border:1px solid #ddd;">1.5 hrs</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Delhi &rarr; Haridwar</td><td style="padding:6px;border:1px solid #ddd;">Train</td><td style="padding:6px;border:1px solid #ddd;">&nbsp;300-800</td><td style="padding:6px;border:1px solid #ddd;">4-5 hrs</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Kalka &rarr; Shimla</td><td style="padding:6px;border:1px solid #ddd;">Toy Train</td><td style="padding:6px;border:1px solid #ddd;">&nbsp;300-600</td><td style="padding:6px;border:1px solid #ddd;">5-6 hrs</td></tr>
          </tbody>
        </table>
      </div>`;

    const emergencySection = `
      <div style="margin-top:20px;padding:15px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;">
        <h3 style="color:#92400e;margin-bottom:8px;">Emergency Numbers</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#78350f;">
          <span>Police: <strong>100</strong></span>
          <span>Ambulance: <strong>102 / 108</strong></span>
          <span>HRTC Helpline: <strong>0177-2658765</strong></span>
          <span>HP Tourism: <strong>0177-2652369</strong></span>
          <span>J&K Tourism: <strong>0194-2452690</strong></span>
          <span>Disaster: <strong>1077</strong></span>
        </div>
      </div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WanderTribe - Trip Itinerary</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            line-height: 1.7; color: #1a1a2e; padding: 40px;
            max-width: 800px; margin: 0 auto;
          }
          .header {
            text-align: center; margin-bottom: 20px; padding-bottom: 20px;
            border-bottom: 3px solid #10b981;
          }
          .header h1 { color: #10b981; font-size: 28px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          h1, h2, h3 { color: #1a1a2e; margin: 20px 0 10px; }
          h2 { color: #10b981; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          h3 { color: #059669; }
          ul, ol { margin-left: 20px; margin-bottom: 10px; }
          li { margin-bottom: 5px; }
          strong { color: #10b981; }
          p { margin-bottom: 10px; }
          .footer {
            margin-top: 40px; padding-top: 15px; border-top: 2px solid #10b981;
            text-align: center; color: #999; font-size: 12px;
          }
          .download-badge {
            text-align: center; margin-bottom: 15px; padding: 10px;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            border-radius: 8px; color: white; font-weight: bold;
          }
          @media print { body { padding: 20px; } .download-badge { display: none; } }
        </style>
      </head>
      <body>
        <div class="download-badge">WanderTribe AI-Curated Itinerary</div>
        <div class="header">
          <h1>WanderTribe</h1>
          <p>AI-Curated Travel Itinerary &bull; Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        ${roadmapHTML}
        <div id="content"></div>
        ${bookingsHTML}
        ${transportRef}
        ${emergencySection}
        <div class="footer">
          <p>Generated by WanderTribe AI &bull; wandertribe.app</p>
          <p>Prices are estimates and may vary by season. Always confirm before booking.</p>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
        <script>
          document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(content)});
          setTimeout(() => window.print(), 500);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap gap-3 mb-8">
        <button onClick={generateItinerary} disabled={loading}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2 text-base shadow-lg shadow-emerald-500/20">
          {loading ? '⏳ Generating...' : '🤖 Generate AI Itinerary'}
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

      <p className="text-white/30 text-sm mb-6">
        The AI uses your group chat discussions, approved bookings, and food stall preferences to craft the perfect plan.
      </p>

      {!itinerary && !seasonInfo && (
        <div className="text-center py-16 text-white/30">
          <span className="text-6xl block mb-4">🗓️</span>
          <p className="text-2xl mb-2">No itinerary yet</p>
          <p className="max-w-md mx-auto text-base">Click "Generate AI Itinerary" to create a personalized day-by-day plan based on your group's chat, ideas, and approved bookings.</p>
          <p className="mt-3 text-sm text-emerald-400/60">Includes bus timings, trains, flights, hotels, food stalls, and local transport.</p>
        </div>
      )}

      {itinerary && (
        <div className="mb-6">
          {days.length > 0 && <VisualRoadmap days={days} activeDay={activeDay} onSelectDay={(i) => setActiveDay(activeDay === i ? null : i)} />}

          {days.length > 0 && activeDay !== null ? (
            <div className="animate-fadeIn">
              <div className="bg-white/5 border border-emerald-500/20 rounded-2xl overflow-hidden">
                <div className="relative h-32 overflow-hidden">
                  <img src={getImgForDay(days[activeDay].title)} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50 flex items-center px-6">
                    <div>
                      <span className="text-emerald-400 text-sm font-medium">Day {days[activeDay].dayNum}</span>
                      <h3 className="text-2xl font-bold">{days[activeDay].title}</h3>
                      {days[activeDay].places.length > 0 && (
                        <div className="flex gap-2 mt-1">
                          {days[activeDay].places.map((p, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6 prose prose-invert prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown>{days[activeDay].content}</ReactMarkdown>
                </div>
                <div className="px-6 pb-4 flex gap-2">
                  {activeDay > 0 && (
                    <button onClick={() => setActiveDay(activeDay - 1)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
                      ← Day {days[activeDay - 1].dayNum}
                    </button>
                  )}
                  <button onClick={() => setActiveDay(null)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
                    View Full
                  </button>
                  {activeDay < days.length - 1 && (
                    <button onClick={() => setActiveDay(activeDay + 1)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors ml-auto">
                      Day {days[activeDay + 1].dayNum} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <span>🗺️</span> Your AI-Curated Itinerary
                </h3>
                {days.length > 0 && (
                  <span className="text-sm text-white/40">Click day nodes above to navigate</span>
                )}
              </div>

              {days.length > 0 ? (
                <div className="space-y-6">
                  {days.map((day, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <button onClick={() => setActiveDay(i)}
                          className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                          {day.dayNum}
                        </button>
                        {i < days.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-emerald-500/40 to-white/5 min-h-[60px]" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="font-bold text-lg text-emerald-400 mb-2">{day.title}</h4>
                        <div className="prose prose-invert prose-sm max-w-none text-white/70">
                          <ReactMarkdown>{day.content.slice(0, 500) + (day.content.length > 500 ? '...' : '')}</ReactMarkdown>
                        </div>
                        {day.content.length > 500 && (
                          <button onClick={() => setActiveDay(i)} className="text-emerald-400 text-sm mt-2 hover:underline">
                            Read full day →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="prose prose-invert prose-sm sm:prose-lg max-w-none">
                  <ReactMarkdown>{itinerary}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {seasonInfo && (
        <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-5 sm:p-8">
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
