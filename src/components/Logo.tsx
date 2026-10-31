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
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-3xl'
  };

  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Original Vector RoadSense Mark: Curving Road 'R' with Waypoint Apex */}
      <svg
        className={`${iconSizes[size]} flex-shrink-0 transition-transform duration-150 group-hover:scale-[1.03]`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Base container squircle */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          fill={isDark ? '#F8FAFC' : '#142536'}
        />

        {/* Outer road sub-base */}
        <path
          d="M26 78V42C26 30.9543 34.9543 22 46 22H54C65.0457 22 74 30.9543 74 42C74 53.0457 65.0457 62 54 62H42"
          stroke={isDark ? '#E2E8F0' : '#2A3D52'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Sweeping Carriageway */}
        <path
          d="M26 78V42C26 30.9543 34.9543 22 46 22H54C65.0457 22 74 30.9543 74 42C74 53.0457 65.0457 62 54 62H40L68 78"
          stroke={isDark ? '#142536' : '#F8FAFC'}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Road Dynamic Divider Strip in Orange */}
        <path
          d="M26 74V56M26 44C26 34.5 32 28 42 28M54 28C62 28 67 34 67 42C67 50 62 56 54 56M46 62L62 72"
          stroke="#F28C28"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex Waypoint Node */}
        <circle cx="50" cy="22" r="4.5" fill="#F28C28" />
        <circle cx="50" cy="22" r="2" fill={isDark ? '#142536' : '#FFFFFF'} />
      </svg>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center">
            <span
              className={`font-extrabold tracking-tight ${textSizes[size]} ${
                isDark ? 'text-white' : 'text-brand-navy'
              }`}
            >
              Road<span className="text-brand-orange">Sense</span>
            </span>
          </div>
          {size !== 'sm' && (
            <span
              className={`text-[9.5px] tracking-wider mt-0.5 font-bold uppercase ${
                isDark ? 'text-slate-300' : 'text-brand-slate'
              }`}
            >
              Road Safety Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};
