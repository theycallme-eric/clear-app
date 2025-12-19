import React from 'react';

// Design Tokens (inline for preview - will be separate file later)
const colors = {
  purple: { 500: '#9966CC', 400: '#AD85FF', 600: '#7A52A3' },
  indigo: { 500: '#4F479A', 400: '#7F77BF', 600: '#3F397B' },
  orange: { 500: '#F17B14', 400: '#FFA733', 600: '#C16210' },
  rose: { 500: '#B62F57', 400: '#E74777', 600: '#922646' },
  lime: { 500: '#8DE937', 400: '#AFE747', 600: '#71BA2C' },
  neutral: { 50: '#FFFEFB', 400: '#AAA9A6', 700: '#4F4E4C', 800: '#31302E', 900: '#161313' }
};

export default function StyleGuide() {
  return (
    <div className="min-h-screen text-white p-8 font-sans relative overflow-hidden">
      {/* CSS Gradient Background - Brighter Version */}
      <div className="fixed inset-0 z-0" style={{
        background: `linear-gradient(180deg, #ff6600 0%, #0066ff 60%, #00ff00 100%)`
      }}></div>
      
      {/* Grain Texture Overlay */}
      <div className="fixed inset-0 -z-10 opacity-[0.08] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }}></div>

      <div className="relative max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="border-b border-neutral-700 pb-6">
          <h1 className="text-6xl font-bold tracking-wider uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Clear
          </h1>
          <p className="text-neutral-400 mt-2 tracking-wide uppercase text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Design System Preview // Cyberpunk Utilitarian
          </p>
        </header>

        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Color Primitives
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(colors).map(([name, shades]) => (
              <div key={name} className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {name}
                </p>
                {Object.entries(shades).map(([shade, hex]) => (
                  <div key={shade} className="space-y-1">
                    <div 
                      className="h-16 rounded border border-neutral-700"
                      style={{ backgroundColor: hex }}
                    ></div>
                    <p className="text-xs text-neutral-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {shade}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Typography
          </h2>
          
          <div className="space-y-8 p-8 rounded-lg border border-neutral-700" style={{
            background: 'rgba(49, 48, 46, 0.3)',
            backdropFilter: 'blur(6px)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.03)'
          }}>
            {/* Display Font */}
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-400 mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Display // Rajdhani
              </p>
              <h3 className="text-5xl font-bold uppercase tracking-wider mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Today's Workout
              </h3>
              <h4 className="text-3xl font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Primary Lift
              </h4>
              <h5 className="text-2xl font-medium uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Warm-Up Complete
              </h5>
            </div>

            {/* Body Font */}
            <div>
              <p className="text-xs uppercase tracking-widest text-lime-400 mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Body // Inter
              </p>
              <p className="text-lg mb-2">
                This is body text at 18px. Clear, readable, and functional for longer content blocks.
              </p>
              <p className="text-base mb-2">
                Default body text at 16px. Used for descriptions, instructions, and general content.
              </p>
              <p className="text-sm text-neutral-400">
                Small text at 14px. Perfect for labels, captions, and secondary information.
              </p>
            </div>

            {/* Technical Font */}
            <div>
              <p className="text-xs uppercase tracking-widest text-rose-400 mb-4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Technical // JetBrains Mono
              </p>
              <p className="text-xl tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                INTENSITY: 08/10
              </p>
              <p className="text-base tracking-wider text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                SESSION_ID: WRK-2025-001
              </p>
              <p className="text-sm tracking-wider text-neutral-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                STATUS: ACTIVE // 00:45:23
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Buttons
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary CTA */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Primary CTA
              </p>
              <button 
                className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
                style={{ 
                  fontFamily: 'Rajdhani, sans-serif',
                  background: `linear-gradient(135deg, ${colors.orange[500]} 0%, ${colors.orange[600]} 100%)`,
                  border: `1px solid ${colors.orange[400]}`,
                  boxShadow: `0 0 8px rgba(241, 123, 20, 0.3)`
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 16px rgba(241, 123, 20, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 8px rgba(241, 123, 20, 0.3)'}
              >
                Start Workout
              </button>
            </div>

            {/* Ghost/Outline */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Ghost / Outline
              </p>
              <button 
                className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200"
                style={{ 
                  fontFamily: 'Rajdhani, sans-serif',
                  background: 'transparent',
                  border: `1px solid ${colors.lime[400]}`,
                  color: colors.lime[400],
                  boxShadow: `inset 0 0 8px rgba(141, 233, 55, 0.1)`
                }}
              >
                Review Plan
              </button>
            </div>

            {/* Alert/High Intensity */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Alert / High Intensity
              </p>
              <button 
                className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200"
                style={{ 
                  fontFamily: 'Rajdhani, sans-serif',
                  background: `linear-gradient(135deg, ${colors.rose[500]} 0%, ${colors.rose[600]} 100%)`,
                  border: `1px solid ${colors.rose[400]}`,
                  boxShadow: `0 0 8px rgba(182, 47, 87, 0.3)`
                }}
              >
                Max Effort
              </button>
            </div>
          </div>
        </section>

        {/* Input Fields */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Input Fields
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Workout Notes
              </label>
              <input 
                type="text"
                placeholder="Enter your notes..."
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(79, 71, 154, 0.05)',
                  border: '1px solid rgba(170, 169, 166, 0.3)',
                  borderLeft: `3px solid ${colors.lime[500]}`,
                  color: colors.neutral[50]
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.lime[500];
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(141, 233, 55, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(170, 169, 166, 0.3)';
                  e.currentTarget.style.borderLeftColor = colors.lime[500];
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Select Dropdown */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Anchor Movement
              </label>
              <select 
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(79, 71, 154, 0.05)',
                  border: '1px solid rgba(170, 169, 166, 0.3)',
                  borderLeft: `3px solid ${colors.orange[500]}`,
                  color: colors.neutral[50]
                }}
              >
                <option>Squat</option>
                <option>Hinge</option>
                <option>Press</option>
                <option>Pull</option>
                <option>Rotation</option>
                <option>Surprise</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Cards / Containers
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard Card */}
            <div 
              className="p-6 rounded-lg relative"
              style={{
                background: 'rgba(79, 71, 154, 0.04)',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(170, 169, 166, 0.15)',
                boxShadow: `
                  inset 0 1px 1px rgba(255, 255, 255, 0.05),
                  0 0 20px rgba(79, 71, 154, 0.15)
                `
              }}
            >
              {/* Corner Accent */}
              <div 
                className="absolute top-0 right-0 w-10 h-10 rounded-tr-lg"
                style={{
                  borderTop: `2px solid ${colors.orange[400]}`,
                  borderRight: `2px solid ${colors.orange[400]}`
                }}
              ></div>
              
              <h3 className="text-2xl font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Workout Summary
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                Your session details and performance metrics.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    Duration
                  </span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    45:23
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    Intensity
                  </span>
                  <span className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.rose[400] }}>
                    08/10
                  </span>
                </div>
              </div>
            </div>

            {/* Intensity Card */}
            <div 
              className="p-6 rounded-lg relative"
              style={{
                background: 'rgba(182, 47, 87, 0.06)',
                backdropFilter: 'blur(6px)',
                border: `1px solid ${colors.rose[600]}`,
                boxShadow: `
                  inset 0 1px 1px rgba(182, 47, 87, 0.1),
                  0 0 24px rgba(182, 47, 87, 0.25)
                `
              }}
            >
              <h3 className="text-2xl font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: 'Rajdhani, sans-serif', color: colors.rose[400] }}>
                High Intensity
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                Maximum effort compound movements with reduced volume.
              </p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: colors.rose[400], boxShadow: `0 0 8px ${colors.rose[400]}` }}
                ></div>
                <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.rose[400] }}>
                  Status: Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Indicators */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Progress Indicators
          </h2>
          
          <div className="space-y-6 p-8 rounded-lg border border-neutral-700" style={{
            background: 'rgba(49, 48, 46, 0.3)',
            backdropFilter: 'blur(6px)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.03)'
          }}>
            {/* Intensity Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.lime[400] }}>
                    Low Intensity (1-3)
                  </span>
                  <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>30%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: '30%', 
                      background: `linear-gradient(90deg, ${colors.lime[600]} 0%, ${colors.lime[400]} 100%)`,
                      boxShadow: `0 0 8px ${colors.lime[400]}`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.orange[400] }}>
                    Medium Intensity (4-6)
                  </span>
                  <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>60%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: '60%', 
                      background: `linear-gradient(90deg, ${colors.orange[600]} 0%, ${colors.orange[400]} 100%)`,
                      boxShadow: `0 0 8px ${colors.orange[400]}`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.rose[400] }}>
                    High Intensity (7-10)
                  </span>
                  <span className="text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>90%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: '90%', 
                      background: `linear-gradient(90deg, ${colors.rose[600]} 0%, ${colors.rose[400]} 100%)`,
                      boxShadow: `0 0 8px ${colors.rose[400]}`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section>
          <h2 className="text-3xl font-semibold mb-6 uppercase tracking-wider" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Status Indicators
          </h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Active */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border" style={{ borderColor: colors.lime[600], background: 'rgba(141, 233, 55, 0.05)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.lime[400], boxShadow: `0 0 6px ${colors.lime[400]}` }}></div>
              <span className="text-sm uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.lime[400] }}>
                Active
              </span>
            </div>

            {/* In Progress */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border" style={{ borderColor: colors.orange[600], background: 'rgba(241, 123, 20, 0.05)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.orange[400], boxShadow: `0 0 6px ${colors.orange[400]}` }}></div>
              <span className="text-sm uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.orange[400] }}>
                In Progress
              </span>
            </div>

            {/* Max Effort */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border" style={{ borderColor: colors.rose[600], background: 'rgba(182, 47, 87, 0.05)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.rose[400], boxShadow: `0 0 8px ${colors.rose[400]}` }}></div>
              <span className="text-sm uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.rose[400] }}>
                Max Effort
              </span>
            </div>

            {/* Idle */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-neutral-700" style={{ background: 'rgba(170, 169, 166, 0.05)' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.neutral[400] }}></div>
              <span className="text-sm uppercase tracking-wider text-neutral-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Idle
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-700 pt-6 mt-12">
          <p className="text-xs uppercase tracking-widest text-neutral-500 text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Clear Design System // Version 1.0 // Cyberpunk Utilitarian
          </p>
        </footer>

      </div>
    </div>
  );
}