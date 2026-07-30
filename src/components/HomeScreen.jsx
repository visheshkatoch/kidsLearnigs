import React from 'react'
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent,
  Chip, AppBar, Button, IconButton,
} from '@mui/material'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import AppsIcon from '@mui/icons-material/Apps'
import LockIcon from '@mui/icons-material/Lock'
import AccentPicker from './AccentPicker'
import { PROGRESS_FIELD } from '../hooks/useProfiles'

const HEADINGS = {
  pronounce:       { heading: '🗺️ Choose a Section',           subheading: 'Tap a section to start the quiz!' },
  spelling:        { heading: '🔤 Choose a Section to Spell',  subheading: 'Tap a section to start spelling!' },
  flags:           { heading: '🚩 Choose a Region',            subheading: 'Tap a region to match flags!' },
  countrySpelling: { heading: '🌍 Choose a Region to Spell',   subheading: 'Tap a region to spell countries!' },
}

// The English lessons build up in difficulty section by section, so they
// stay gated behind finishing the previous one. Countries & flags are just
// a big shuffled bucket of world geography — no natural difficulty order —
// so those modes are left open for kids to jump around freely.
const LOCKABLE_MODES = new Set(['pronounce', 'spelling'])

const STAGE_CHIP = {
  'Beginner':  { bg: '#E8F5E9', color: '#2E7D32' },
  'Beginner+': { bg: '#F1F8E9', color: '#558B2F' },
  'Easy':      { bg: '#FFFDE7', color: '#F57F17' },
  'Easy+':     { bg: '#FFF8E1', color: '#EF6C00' },
  'Medium':    { bg: '#FFF3E0', color: '#E65100' },
  'Medium+':   { bg: '#FCE4EC', color: '#AD1457' },
  'Hard':      { bg: '#F3E5F5', color: '#6A1B9A' },
  'Hard+':     { bg: '#EDE7F6', color: '#4527A0' },
  'Expert':    { bg: '#E8EAF6', color: '#283593' },
}

function starStr(n) {
  return '⭐'.repeat(n) + '☆'.repeat(3 - n)
}

export default function HomeScreen({ months, kid, speech, onStartQuiz, onSwitchKid, onMenu, mode = 'pronounce' }) {
  const progress = kid[PROGRESS_FIELD[mode]] || {}
  const totalStars = Object.values(progress).reduce((s, p) => s + p.stars, 0)
  const { heading, subheading } = HEADINGS[mode]

  return (
    <Box>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)' }}
      >
        <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onMenu} sx={{ color: 'white' }} size="small" title="Main Menu">
              <AppsIcon />
            </IconButton>
            <Typography fontSize="1.7rem" lineHeight={1}>{kid.avatar}</Typography>
            <Box flex={1} minWidth={0}>
              <Typography variant="h6" color="white" lineHeight={1.2} fontSize="0.95rem" noWrap>
                {kid.name}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)" noWrap>
                {totalStars} ⭐ earned
              </Typography>
            </Box>
            <Button
              onClick={onSwitchKid}
              startIcon={<SwapHorizIcon />}
              size="small"
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                py: 0.6,
                px: 1.2,
                flexShrink: 0,
              }}
            >
              Switch
            </Button>
          </Box>

          <Box display="flex" justifyContent="center">
            <AccentPicker
              accent={speech.accent}
              availableCodes={speech.availableCodes}
              onChange={speech.changeAccent}
            />
          </Box>
        </Box>
      </AppBar>

      <Box px={2} py={3}>
        <Typography variant="h5" textAlign="center" mb={0.5}>
          {heading}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          {subheading}
        </Typography>

        <Grid container spacing={2}>
          {months.map((month, idx) => {
            const monthProgress = progress[month.num]
            const stars = monthProgress?.stars || 0
            const chipStyle = STAGE_CHIP[month.stage] || STAGE_CHIP['Expert']
            const prevDone = idx === 0 || (progress[months[idx - 1].num]?.attempts || 0) > 0
            const locked = LOCKABLE_MODES.has(mode) && !prevDone

            return (
              <Grid item xs={6} key={month.num}>
                <Card
                  sx={{
                    overflow: 'hidden',
                    opacity: locked ? 0.65 : 1,
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    ...(!locked && {
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                      },
                    }),
                  }}
                >
                  <CardActionArea
                    onClick={() => !locked && onStartQuiz(month)}
                    disabled={locked}
                    sx={{ '&.Mui-disabled': { opacity: 1 } }}
                  >
                    {/* Coloured header band */}
                    <Box
                      sx={{
                        background: month.color,
                        py: 2,
                        px: 1,
                        textAlign: 'center',
                        minHeight: 90,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        filter: locked ? 'grayscale(0.6)' : 'none',
                      }}
                    >
                      <Typography fontSize="2.4rem" lineHeight={1}>{month.mascot}</Typography>
                      <Typography
                        fontWeight={800}
                        color="white"
                        fontSize="0.78rem"
                        mt={0.5}
                        sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.35)' }}
                      >
                        Section {month.num}
                      </Typography>
                      {locked && (
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

                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography fontWeight={700} fontSize="0.85rem" noWrap>
                        {month.theme}
                      </Typography>
                      {locked ? (
                        <Chip
                          label="Complete previous section"
                          size="small"
                          sx={{
                            background: '#F5F5F5',
                            color: '#9E9E9E',
                            fontWeight: 700,
                            fontSize: '0.6rem',
                            height: 20,
                            mt: 0.5,
                            maxWidth: '100%',
                          }}
                        />
                      ) : (
                        <Chip
                          label={month.stage}
                          size="small"
                          sx={{
                            background: chipStyle.bg,
                            color: chipStyle.color,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20,
                            mt: 0.5,
                          }}
                        />
                      )}
                      <Typography fontSize="0.95rem" mt={0.5}>
                        {starStr(stars)}
                      </Typography>
                      {monthProgress?.attempts > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Best: {monthProgress.bestScore}/10
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Box>
  )
}
