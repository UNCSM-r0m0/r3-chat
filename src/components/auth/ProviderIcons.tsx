import React from "react"

export const MoonshotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

export const DeepSeekIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16c2-1 4-3 6-2s4 3 6 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 12c2-1 4-3 6-2s4 3 6 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 8c2-1 4-3 6-2s4 3 6 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const OllamaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3c-3 0-5 2-5 5v3c0 2-1 3-2 4s-1 3 1 4 3 2 6 2 4-1 6-2 2-3 1-4-2-2-2-4V8c0-3-2-5-5-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.5" cy="10" r="1" fill="currentColor" />
    <circle cx="14.5" cy="10" r="1" fill="currentColor" />
    <path d="M10 14c.5.5 1.5.5 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
