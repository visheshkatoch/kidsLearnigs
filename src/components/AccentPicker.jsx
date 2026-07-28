import React from 'react'
import { Box, Tooltip, Typography, Badge } from '@mui/material'
import { ACCENTS } from '../hooks/useSpeech'

export default function AccentPicker({ accent, availableCodes, onChange }) {
  return (
    <Box display="flex" gap={0.5} alignItems="center">
      {ACCENTS.map(a => {
        const isActive = accent === a.code
        const isAvailable = availableCodes.includes(a.code)

        return (
          <Tooltip key={a.code} title={`${a.label} English${isAvailable ? '' : ' (not on this device)'}`} arrow>
            <Badge
              badgeContent={isAvailable ? null : '⚠️'}
              overlap="circular"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.55rem', minWidth: 14, height: 14, p: 0 } }}
            >
              <Box
                onClick={() => onChange(a.code)}
                sx={{
                  fontSize: '1.4rem',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: isActive ? '2.5px solid white' : '2.5px solid transparent',
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'transparent',
                  opacity: isAvailable ? 1 : 0.65,
                  transition: 'all 0.15s',
                  '&:hover': { background: 'rgba(255,255,255,0.2)' },
                }}
              >
                {a.flag}
              </Box>
            </Badge>
          </Tooltip>
        )
      })}
    </Box>
  )
}
