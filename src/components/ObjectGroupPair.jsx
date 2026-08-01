import React from 'react'
import { Box, Typography } from '@mui/material'
import ObjectGroup from './ObjectGroup'

// Two object groups side by side with an operator glyph between them —
// used for addition ("+") and for comparing two quantities (no operator).
export default function ObjectGroupPair({ groups, operator }) {
  const [a, b] = groups
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} flexWrap="wrap">
      <ObjectGroup emoji={a.emoji} count={a.count} />
      {operator && (
        <Typography fontSize="2rem" fontWeight={900} color="primary">
          {operator}
        </Typography>
      )}
      <ObjectGroup emoji={b.emoji} count={b.count} />
    </Box>
  )
}
