import React from 'react'
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent,
  Chip, AppBar, Toolbar, Button, IconButton,
} from '@mui/material'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import AppsIcon from '@mui/icons-material/Apps'
import AccentPicker from './AccentPicker'

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

export default function HomeScreen({ months, kid, speech, onStartQuiz, onSwitchKid, onMenu }) {
  const totalStars = Object.values(kid.progress).reduce((s, p) => s + p.stars, 0)

  return (
    <Box>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)' }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton onClick={onMenu} sx={{ color: 'white', mr: 0.5 }} size="small" title="Main Menu">
            <AppsIcon />
          </IconButton>
          <Typography fontSize="2rem" lineHeight={1}>{kid.avatar}</Typography>
          <Box flex={1}>
            <Typography variant="h6" color="white" lineHeight={1.2} fontSize="1rem">
              {kid.name}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.8)">
              {totalStars} ⭐ earned
            </Typography>
          </Box>

          <AccentPicker
            accent={speech.accent}
            availableCodes={speech.availableCodes}
            onChange={speech.changeAccent}
          />

          <Button
            onClick={onSwitchKid}
            startIcon={<SwapHorizIcon />}
            size="small"
            sx={{
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              ml: 0.5,
              fontSize: '0.75rem',
              py: 0.6,
              px: 1.2,
            }}
          >
            Switch
          </Button>
        </Toolbar>
      </AppBar>

      <Box px={2} py={3}>
        <Typography variant="h5" textAlign="center" mb={0.5}>
          🗺️ Choose a Month
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Tap a month to start the quiz!
        </Typography>

        <Grid container spacing={2}>
          {months.map(month => {
            const progress = kid.progress[month.num]
            const stars = progress?.stars || 0
            const chipStyle = STAGE_CHIP[month.stage] || STAGE_CHIP['Expert']

            return (
              <Grid item xs={6} key={month.num}>
                <Card
                  sx={{
                    overflow: 'hidden',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardActionArea onClick={() => onStartQuiz(month)}>
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
                        Month {month.num}
                      </Typography>
                    </Box>

                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography fontWeight={700} fontSize="0.85rem" noWrap>
                        {month.theme}
                      </Typography>
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
                      <Typography fontSize="0.95rem" mt={0.5}>
                        {starStr(stars)}
                      </Typography>
                      {progress?.attempts > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Best: {progress.bestScore}/10
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
