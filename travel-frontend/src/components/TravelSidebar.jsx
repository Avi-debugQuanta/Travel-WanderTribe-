import { useState, useEffect } from 'react';

const DESTINATION_DATA = {
  manali: {
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
      'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400',
    ],
    guidelines: [
      'Carry layered clothing — temperature drops sharply after sunset',
      'Keep cash handy; ATMs beyond Manali town are unreliable',
      'Rohtang Pass requires a permit — book online in advance',
      'Drink boiled/filtered water, avoid roadside ice',
      'Start early for Solang Valley to avoid afternoon crowds',
    ],
    emergency: { police: '100', ambulance: '108', tourism: '0177-2652392' },
    funFacts: [
      'Manali is named after Manu, the mythological father of humanity',
      'Old Manali was a hippie haven in the 70s and still has that vibe',
      'The Hadimba Temple is over 500 years old and built entirely of wood',
    ],
    tips: [
      '🏔️ Pro tip: Jogini Waterfall is a hidden gem — just 3km trek from Vashisht',
      '🍜 Must try: Sidu (steamed wheat bread with walnut filling) from a local dhaba',
      '📸 Best photo spot: Hampta Pass viewpoint at golden hour',
      '💡 Solang Valley is less crowded on weekday mornings',
      '🧥 Night temps can drop to -5°C in winter — carry thermal inners',
      '🚗 Book Rohtang permit at least 1 day early at himachal.gov.in',
    ],
    altitude: '2,050m / 6,726ft',
    bestMonths: 'Oct–Feb (snow), Mar–Jun (pleasant)',
  },
  kashmir: {
    images: [
      'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=400',
      'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=400',
    ],
    guidelines: [
      'Always carry valid ID proof — checkpoints are common',
      'Haggle for shikara and houseboat prices — start at 40% of quoted',
      'Try Kashmiri kahwa and wazwan — must-have local experiences',
      'Avoid venturing to restricted areas without local guidance',
      'Carry warm clothes even in summer — evenings are chilly',
    ],
    emergency: { police: '100', ambulance: '108', tourism: '0194-2452690' },
    funFacts: [
      'Dal Lake has 15,000+ houseboats, some over 100 years old',
      'Saffron from Kashmir is among the most expensive in the world',
      'Gulmarg has Asia\'s highest operating cable car at 3,979m',
    ],
    tips: [
      '🌷 Visit Indira Gandhi Tulip Garden in April for 1.5 million blooming tulips',
      '🛶 Early morning shikara ride on Dal Lake is magical and cheaper',
      '🧶 Buy authentic Pashmina from govt stores — tourist shops often sell blends',
      '💡 Pahalgam is the base for Amarnath Yatra — book ponies in advance',
      '🍗 Try seekh kebabs from the evening food stalls near Lal Chowk',
      '📷 Shankaracharya Temple offers the best panoramic view of Srinagar',
    ],
    altitude: '1,585m (Srinagar) / 2,730m (Gulmarg)',
    bestMonths: 'Mar–May (tulips), Dec–Feb (snow)',
  },
  spiti: {
    images: [
      'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    ],
    guidelines: [
      'AMS (altitude sickness) is real — acclimatize for 1-2 days in Kaza',
      'No fuel pumps after Kaza — carry extra fuel',
      'Roads are open only Jun–Oct; check BRO updates before going',
      'Network coverage is almost zero — inform family before entering',
      'Carry all medicines; nearest hospital is in Reckong Peo (8+ hours)',
    ],
    emergency: { police: '100', ITBP: '01906-222330' },
    funFacts: [
      'Ki Monastery is 1,000+ years old and sits at 4,166m',
      'Chandratal Lake changes color through the day',
      'Spiti has a fossil park with marine fossils from 500 million years ago',
    ],
    tips: [
      '🏔️ Carry Diamox for altitude — start 2 days before reaching Kaza',
      '🌙 Star gazing at Langza village is unforgettable — zero light pollution',
      '🍵 Butter tea in local homestays is the best way to acclimatize',
      '📸 Visit the world\'s highest post office at Hikkim (4,440m)',
      '⛽ Fill up at Reckong Peo — no fuel for 200+ km after that',
      '🦊 Spot blue sheep and the elusive snow leopard in Pin Valley',
    ],
    altitude: '3,800m–4,500m / 12,500–14,800ft',
    bestMonths: 'Jun–Sep (only accessible months)',
  },
  shimla: {
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=400',
    ],
    guidelines: [
      'The Mall Road is vehicle-free — walk or take the lift from Cart Road',
      'Book toy train tickets in advance on IRCTC — they sell out fast',
      'Avoid weekends and holidays — Shimla gets extremely crowded',
      'Carry an umbrella year-round — unexpected rain is common',
    ],
    emergency: { police: '100', ambulance: '108', tourism: '0177-2652394' },
    funFacts: [
      'Shimla was the summer capital of British India',
      'The Kalka–Shimla railway has 102 tunnels and 87 bridges',
      'Christ Church on The Ridge is the second oldest church in North India',
    ],
    tips: [
      '🚂 Take seat on the left side of the toy train for valley views',
      '🍎 Buy Himachali apple cider from Raison or Narkanda orchards',
      '🏛️ Viceregal Lodge (IIAS) tour is free and absolutely stunning',
      '🌲 Jakhoo Temple trek is steep — carry water and start early',
      '📸 The Ridge at sunset with Christ Church is Instagram gold',
      '🛍️ Lakkar Bazaar has authentic wooden handicrafts at half the price',
    ],
    altitude: '2,276m / 7,467ft',
    bestMonths: 'Mar–Jun, Dec–Feb (snowfall)',
  },
  kasol: {
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400',
    ],
    guidelines: [
      'Trek to Kheerganga starts early — allow 5-6 hours one way',
      'Carry your own trash — Kasol has a waste problem',
      'Parvati Valley has no ATMs after Kasol — carry cash',
      'Respect local customs — dress modestly when visiting temples',
    ],
    emergency: { police: '01902-265330', ambulance: '108' },
    funFacts: [
      'Kasol is called "Mini Israel" — road signs are in Hebrew',
      'Malana village nearby has its own parliament and legal system',
      'Parvati River is named after goddess Parvati who meditated here',
    ],
    tips: [
      '🏕️ Camp at Grahan village for an authentic off-grid experience',
      '🍕 Evergreen Cafe\'s wood-fired pizza is legendary among travelers',
      '🌊 The Parvati River trail from Kasol to Chalal is a peaceful 30-min walk',
      '🎒 Start Kheerganga trek by 7 AM to reach hot springs before sunset',
      '💡 Tosh village has better views and fewer tourists than Kasol proper',
      '🧘 Manikaran Gurudwara\'s hot spring langar is a must-visit',
    ],
    altitude: '1,580m / 5,180ft',
    bestMonths: 'Mar–Jun, Sep–Nov',
  },
};

function matchDestination(dest) {
  if (!dest) return null;
  const lower = dest.toLowerCase();
  for (const key of Object.keys(DESTINATION_DATA)) {
    if (lower.includes(key) || key.includes(lower.split(' ')[0]?.toLowerCase())) {
      return DESTINATION_DATA[key];
    }
  }
  if (lower.includes('srinagar') || lower.includes('gulmarg') || lower.includes('dal')) return DESTINATION_DATA.kashmir;
  if (lower.includes('kaza') || lower.includes('lahaul')) return DESTINATION_DATA.spiti;
  if (lower.includes('parvati')) return DESTINATION_DATA.kasol;
  return null;
}

export default function TravelSidebar({ destination }) {
  const data = matchDestination(destination);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!data?.tips) return;
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % data.tips.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) {
    return (
      <div className="p-4 text-center text-white/30 text-sm">
        <p>Travel guide not available for this destination yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {data.images && data.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {data.images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden h-28">
              <img src={img} alt="Destination" loading="lazy" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      {/* Rotating Tips */}
      {data.tips && (
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl transition-all duration-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="animate-pulse text-lg">💡</span>
            <p className="text-emerald-400 text-sm font-semibold">Live Travel Tip</p>
          </div>
          <p className="text-white/70 text-sm leading-relaxed" key={tipIndex}>
            {data.tips[tipIndex]}
          </p>
          <div className="flex gap-1 mt-3">
            {data.tips.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i === tipIndex ? 'bg-emerald-400' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      )}

      {data.altitude && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-lg">⛰️</span>
            <div>
              <p className="text-amber-300 text-sm font-medium">Altitude: {data.altitude}</p>
              {data.bestMonths && <p className="text-amber-300/60 text-xs">Best time: {data.bestMonths}</p>}
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
          📋 Travel Guidelines
        </h4>
        <ul className="space-y-2">
          {data.guidelines.map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
              <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      {data.emergency && (
        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
          <h4 className="text-sm font-semibold text-red-400/80 mb-2">🚨 Emergency Numbers</h4>
          <div className="space-y-1">
            {Object.entries(data.emergency).map(([key, val]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-white/40 capitalize">{key}</span>
                <span className="text-white/60 font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.funFacts && (
        <div>
          <h4 className="text-sm font-semibold text-violet-400 mb-3 flex items-center gap-2">
            💡 Did You Know?
          </h4>
          <div className="space-y-2">
            {data.funFacts.map((f, i) => (
              <div key={i} className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-lg">
                <p className="text-white/60 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
