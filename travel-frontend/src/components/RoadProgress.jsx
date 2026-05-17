export default function RoadProgress({ currentStep, totalSteps, labels }) {
  const steps = labels || Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`);
  const progress = currentStep / (totalSteps - 1);

  return (
    <div className="relative w-full px-4 py-6">
      <div className="relative flex items-center justify-between">
        {/* Road line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress * 100}%` }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 12px, white 12px, white 24px)',
            backgroundSize: '24px 2px',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center'
          }} />
        </div>

        {/* Checkpoints */}
        {steps.map((label, i) => {
          const isActive = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all duration-500 ${
                isCurrent
                  ? 'bg-sky-500 border-sky-400 scale-125 shadow-lg shadow-sky-500/40'
                  : isActive
                    ? 'bg-sky-500/80 border-sky-500/60'
                    : 'bg-slate-800 border-white/20'
              }`}>
                {isActive ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-white/40 text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-xs font-medium whitespace-nowrap transition-colors ${
                isCurrent ? 'text-sky-400' : isActive ? 'text-white/60' : 'text-white/30'
              }`}>{label}</span>
            </div>
          );
        })}

        {/* Animated jeep */}
        <div className="absolute z-20 transition-all duration-700 ease-out" style={{
          left: `calc(${progress * 100}% - 16px)`,
          top: '-24px'
        }}>
          <div className="animate-bounce" style={{ animationDuration: '2s' }}>
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="drop-shadow-lg">
              <rect x="2" y="8" width="28" height="10" rx="3" fill="#10b981" />
              <rect x="6" y="4" width="16" height="8" rx="2" fill="#059669" />
              <rect x="8" y="5" width="5" height="4" rx="1" fill="#a7f3d0" opacity="0.6" />
              <rect x="15" y="5" width="5" height="4" rx="1" fill="#a7f3d0" opacity="0.6" />
              <circle cx="9" cy="20" r="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <circle cx="23" cy="20" r="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <circle cx="9" cy="20" r="1" fill="#94a3b8" />
              <circle cx="23" cy="20" r="1" fill="#94a3b8" />
              <rect x="26" y="10" width="4" height="2" rx="1" fill="#fbbf24" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
