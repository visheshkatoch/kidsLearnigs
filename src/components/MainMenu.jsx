import React from 'react'
import {
  Box, Typography, Grid, Card, CardActionArea,
  CardContent, Chip,
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'

const MENU_ITEMS = [
  {
    id: 'sound-trail',
    title: 'Sound Trail',
    subtitle: 'Pronunciation Quiz',
    description: '300 words · 10 levels · Listen & pick the right word',
    icon: '🎵',
    color: '#7C4DFF',
    gradient: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)',
    available: true,
  },
  {
    id: 'counting',
    title: 'Count & Learn',
    subtitle: 'Numbers & Maths',
    description: '7 sections · Count, add, subtract, compare & shapes',
    icon: '🔢',
    color: '#FF6D00',
    gradient: 'linear-gradient(135deg, #FF6D00 0%, #FFD740 100%)',
    available: true,
  },
  {
    id: 'spelling',
    title: 'Learn Spellings',
    subtitle: 'Spelling Practice',
    description: '300 words · 10 levels · Build the spelling, letter by letter',
    icon: '🔤',
    color: '#00897B',
    gradient: 'linear-gradient(135deg, #00897B 0%, #69DB7C 100%)',
    available: true,
  },
  {
    id: 'country-flags',
    title: 'Flag Match',
    subtitle: 'World Flags Quiz',
    description: '193 countries · 6 regions · Match the flag to its country',
    icon: '🚩',
    color: '#2B8A3E',
    gradient: 'linear-gradient(135deg, #2B8A3E 0%, #69DB7C 100%)',
    available: true,
  },
  {
    id: 'country-spelling',
    title: 'Spell the Country',
    subtitle: 'World Geography',
    description: '193 countries · 6 regions · Build the country name, letter by letter',
    icon: '🌍',
    color: '#1971C2',
    gradient: 'linear-gradient(135deg, #1971C2 0%, #4DABF7 100%)',
    available: true,
  },
  {
    id: 'critter-match',
    title: 'Critter Match',
    subtitle: 'Memory Game',
    description: 'Flip two, find the pair — beat your best time!',
    icon: '🐾',
    color: '#6C4AB6',
    gradient: 'linear-gradient(135deg, #6C4AB6 0%, #FF6F59 100%)',
    available: true,
  },
  {
    id: 'stories',
    title: 'Story Time',
    subtitle: 'Short Stories',
    description: 'Read fun mini-stories with pictures — coming soon!',
    icon: '📖',
    color: '#1565C0',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #4DABF7 100%)',
    available: false,
  },
]

export default function MainMenu({ onSelect }) {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      sx={{ background: 'linear-gradient(160deg, #EDE7F6 0%, #F3E5F5 100%)' }}
    >
      {/* Header banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)',
          px: 3,
          pt: 5,
          pb: 4,
          textAlign: 'center',
        }}
      >
        <Typography fontSize="3.5rem" lineHeight={1} mb={1}>🎓</Typography>
        <Typography variant="h4" color="white" fontWeight={900} mb={0.5}>
          Kids Learning
        </Typography>
        <Typography color="rgba(255,255,255,0.85)" fontSize="1rem">
          What do you want to learn today?
        </Typography>
      </Box>

      {/* Menu cards */}
      <Box px={2} py={3} flex={1}>
        <Grid container spacing={2}>
          {MENU_ITEMS.map((item) => (
            <Grid item xs={6} key={item.id}>
              <Card
                sx={{
                  overflow: 'hidden',
                  opacity: item.available ? 1 : 0.72,
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  ...(item.available && {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
                    },
                  }),
                }}
              >
                <CardActionArea
                  onClick={() => item.available && onSelect(item.id)}
                  disabled={!item.available}
                  sx={{ '&.Mui-disabled': { opacity: 1 } }}
                >
                  {/* Coloured icon band */}
                  <Box
                    sx={{
                      background: item.gradient,
                      py: 2.5,
                      px: 1,
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <Typography fontSize="2.8rem" lineHeight={1}>
                      {item.icon}
                    </Typography>
                    {!item.available && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(0,0,0,0.35)',
                          borderRadius: '50%',
                          width: 26,
                          height: 26,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LockIcon sx={{ color: 'white', fontSize: '0.95rem' }} />
                      </Box>
                    )}
                  </Box>

                  {/* Text content */}
                  <CardContent sx={{ py: 1.5, px: 1.8 }}>
                    <Typography fontWeight={800} fontSize="0.9rem" noWrap>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={0.5}
                    >
                      {item.subtitle}
                    </Typography>
                    {item.available ? (
                      <Chip
                        label="Play Now ▶"
                        size="small"
                        sx={{
                          background: item.color + '18',
                          color: item.color,
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          height: 20,
                        }}
                      />
                    ) : (
                      <Chip
                        label="Coming Soon"
                        size="small"
                        sx={{
                          background: '#F5F5F5',
                          color: '#9E9E9E',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 20,
                        }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Typography
        variant="caption"
        color="text.disabled"
        textAlign="center"
        pb={2}
      >
        SKG – Class 1 · Sound Trail v0.1
      </Typography>
    </Box>
  )
}
