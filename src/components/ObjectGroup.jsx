import React from 'react'
import { Box } from '@mui/material'

const ROW_SIZE = 5

// Renders `count` copies of `emoji` in a grid capped at 5 per row (the
// "5s and 10s" scaffold used in early-years counting) — deterministic
// wrapping across devices, unlike flex-wrap which breaks at an
// unpredictable count depending on emoji glyph width/font.
// `crossedOut` fades the first N items to represent objects taken away
// (used for subtraction), without a strikethrough — which reads as
// "wrong" rather than "removed" and is fragile at small emoji sizes.
export default function ObjectGroup({ emoji, count, crossedOut = 0, size = '1.9rem' }) {
  const columns = Math.min(count, ROW_SIZE)

  return (
    <Box
      className="no-select"
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 0.5,
        width: 'fit-content',
        mx: 'auto',
      }}
    >
      {Array.from({ length: count }, (_, i) => {
        const removed = i < crossedOut
        return (
          <Box
            key={i}
            sx={{
              fontSize: size,
              lineHeight: 1,
              textAlign: 'center',
              opacity: removed ? 0.28 : 1,
              filter: removed ? 'grayscale(1)' : 'none',
            }}
          >
            {emoji}
          </Box>
        )
      })}
    </Box>
  )
}
