import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Original SVG Brand Symbol: Road perspective inside safety pin with radar pulse */}
      <svg
        className={`${iconSizes[size]} flex-shrink-0 transition-transform duration-200 hover:scale-105`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Protective Marker Body */}
        <path
          d="M50 8C31 8 16 23.5 16 43C16 63 46.5 89.5 48.8 91.5C49.5 92.1 50.5 92.1 51.2 91.5C53.5 89.5 84 63 84 43C84 23.5 69 8 50 8Z"
          fill={isDark ? '#F8FAFC' : '#142536'}
        />

        {/* Outer Awareness Pulse Arc (Early Warning Radar) */}
        <path
          d="M32 20C43 14 57 14 68 20"
          stroke="#F28C28"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M38 14C45 10.5 55 10.5 62 14"
          stroke="#F28C28"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Perspective Highway Geometry */}
        <path
          d="M36 68L44 26C44.5 24 47 22.5 49.5 22.5H50.5C53 22.5 55.5 24 56 26L64 68"
          stroke={isDark ? '#142536' : '#F8FAFC'}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Road Dynamic Dashes (Movement) */}
        <path
          d="M50 31V37M50 44V51M50 58V65"
          stroke="#F28C28"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Center Detection Point */}
        <circle cx="50" cy="45" r="3.5" fill="#F28C28" />
      </svg>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span className={`font-extrabold tracking-tight ${textSizes[size]} ${isDark ? 'text-white' : 'text-brand-navy'}`}>
              Road<span className="text-brand-orange">Sense</span>
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-brand-orange/15 text-brand-orange border border-brand-orange/30">
              AI
            </span>
          </div>
          {size !== 'sm' && (
            <span className={`text-[10px] tracking-wide mt-0.5 font-medium ${isDark ? 'text-brand-slate-light' : 'text-brand-slate'}`}>
              Road Safety Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

