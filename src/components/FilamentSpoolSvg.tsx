import React from 'react'

interface FilamentSpoolSvgProps {
  hex: string
  size?: number
  className?: string
}

export const FilamentSpoolSvg: React.FC<FilamentSpoolSvgProps> = ({
  hex,
  size = 56,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer spool rim shadow */}
      <circle cx="32" cy="33" r="27" fill="rgba(24,23,21,0.08)" />
      {/* Outer plastic flange */}
      <circle cx="32" cy="32" r="27" fill="#2A2825" stroke="#181715" strokeWidth="1.5" />
      {/* Wound filament ring */}
      <circle
        cx="32"
        cy="32"
        r="22.5"
        fill={hex}
        stroke="rgba(24,23,21,0.22)"
        strokeWidth="1.2"
      />
      {/* Concentric filament strand texture */}
      <circle cx="32" cy="32" r="19.5" stroke="rgba(255,255,255,0.22)" strokeWidth="0.9" />
      <circle cx="32" cy="32" r="16.8" stroke="rgba(0,0,0,0.14)" strokeWidth="0.9" />
      <circle cx="32" cy="32" r="14.2" stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" />
      {/* Spool flange cutouts (subtle) */}
      <path
        d="M32 7V12M32 52V57M7 32H12M52 32H57"
        stroke="#44403C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Inner hub */}
      <circle cx="32" cy="32" r="10.5" fill="#2A2825" stroke="#181715" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="6.5" fill="#FAF8F4" stroke="#181715" strokeWidth="1.2" />
      {/* Loose filament strand tip */}
      <path
        d="M52.5 22C56 18.5 58.5 14.5 59.5 10"
        stroke={hex}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M52.5 22C56 18.5 58.5 14.5 59.5 10"
        stroke="rgba(24,23,21,0.22)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
