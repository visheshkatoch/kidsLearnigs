import React from 'react'

// Real flag artwork (SVG, bundled offline via the flag-icons package) rather
// than the OS's flag emoji font — Windows in particular often has no color
// flag glyphs and falls back to showing the raw two-letter country code.
export default function FlagIcon({ code, size = '5rem' }) {
  return (
    <span
      className={`fi fi-${code.toLowerCase()}`}
      style={{
        fontSize: size,
        borderRadius: '0.15em',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      }}
    />
  )
}
