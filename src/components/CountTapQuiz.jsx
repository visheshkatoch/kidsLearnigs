import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, LinearProgress,
  IconButton, Chip, Fade,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccentPicker from './AccentPicker'
import useStopwatch, { formatTime } from '../hooks/useStopwatch'

const ROUNDS = 10
const AUTO_ADVANCE_MS = 2000
const ROW_SIZE = 5
const HAPPY = ['🥳', '🎉', '⭐', '🌟', '🎊', '🏆', '💪', '👏', '🤩']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Hands-on "tap every object once" counting exercise — teaches 1:1
// correspondence rather than testing recall, so it has no wrong answers:
// completing a round always counts as success (full stars), the same way
// SpellingQuiz's letter tiles stay in place once used (rather than being
// removed and reflowing) so a fast series of taps can't mis-hit a target
// that just moved.
export default function CountTapQuiz({ month, speech, onDone, onBack }) {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [tapped, setTapped]       = useState([])
  const [done, setDone]           = useState(false)
  const [mascot, setMascot]       = useState(month.mascot)
  const elapsed = useStopwatch(month.num)

  useEffect(() => {
    const qs = shuffle([...month.words]).slice(0, ROUNDS)
    setQuestions(qs)
    setCurrent(0)
  }, [month])

  const q = questions[current]
  const quizLength = questions.length

  useEffect(() => {
    if (!q) return
    setTapped([])
    setDone(false)
    setMascot(month.mascot)
  }, [current, q]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback((index) => {
    if (done) return
    setTapped(prev => (prev.includes(index) ? prev : [...prev, index]))
  }, [done])

  const handleNext = useCallback(() => {
    if (current + 1 >= quizLength) {
      onDone({ score: quizLength, total: quizLength, monthNum: month.num, stars: 3 })
    } else {
      setCurrent(c => c + 1)
    }
  }, [current, month, onDone, quizLength])

  // Once every object has been tapped, celebrate and move on. `done` is
  // deliberately not a dependency here — this effect sets it, and
  // depending on it too would make the effect immediately re-run and
  // cancel the timers it just scheduled.
  useEffect(() => {
    if (!q || done || tapped.length !== q.count) return
    setDone(true)
    setMascot(pick(HAPPY))
    const speakTimer = setTimeout(() => speech.speak(`${q.word}! Great counting!`), 200)
    const nextTimer = setTimeout(() => handleNext(), AUTO_ADVANCE_MS)
    return () => { clearTimeout(speakTimer); clearTimeout(nextTimer) }
  }, [tapped, q]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!q) return null

  const progress = (current / quizLength) * 100
  const columns = Math.min(q.count, ROW_SIZE)

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="background.default">
      {/* Sticky header: top bar + progress bar stay visible while scrolling */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10 }}>
        <Box
          sx={{
            background: month.color,
            px: 1.5, py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.8,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onBack} sx={{ color: 'white' }} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography color="white" fontWeight={800} flex={1} minWidth={0} fontSize="0.9rem" noWrap>
              {month.mascot} {month.title}: {month.theme}
            </Typography>
            <Chip
              label={`${current + 1}/${quizLength}`}
              size="small"
              sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 800, flexShrink: 0 }}
            />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Chip
              label={`⏱️ ${formatTime(elapsed)}`}
              size="small"
              sx={{ background: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: 800 }}
            />
            <AccentPicker
              accent={speech.accent}
              availableCodes={speech.availableCodes}
              onChange={speech.changeAccent}
            />
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            bgcolor: 'rgba(0,0,0,0.08)',
            '& .MuiLinearProgress-bar': { background: month.color },
          }}
        />
      </Box>

      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        px={2}
        py={2}
        maxWidth={520}
        mx="auto"
        width="100%"
      >
        {/* Mascot */}
        <Box textAlign="center" mb={1}>
          <Typography
            fontSize="4.5rem"
            lineHeight={1}
            sx={{
              display: 'inline-block',
              animation: 'pop 0.3s ease',
              '@keyframes pop': {
                '0%':   { transform: 'scale(1)' },
                '50%':  { transform: 'scale(1.2)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          >
            {mascot}
          </Typography>
        </Box>

        <Typography textAlign="center" fontWeight={700} color="text.secondary" mb={1.5}>
          👆 Tap each one to count!
        </Typography>

        {/* Tappable objects — each stays in place once tapped (just fades
            and disables) so a quick series of taps never lands on a
            target that has shifted position */}
        <Box
          className="no-select"
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 1,
            width: 'fit-content',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          {Array.from({ length: q.count }, (_, i) => {
            const isTapped = tapped.includes(i)
            const order = tapped.indexOf(i)
            return (
              <Button
                key={i}
                onClick={() => handleTap(i)}
                disabled={done || isTapped}
                sx={{
                  position: 'relative',
                  minWidth: 58,
                  width: 58,
                  height: 58,
                  p: 0,
                  fontSize: '2rem',
                  borderRadius: 3,
                  border: '2.5px solid #D1C4E9',
                  background: isTapped ? '#EDE7F6' : '#fff',
                  opacity: isTapped ? 0.55 : 1,
                  transition: 'all 0.15s',
                  '&:hover:not(:disabled)': {
                    background: '#EDE7F6',
                    borderColor: '#7C4DFF',
                    transform: 'scale(1.06)',
                  },
                  '&.Mui-disabled': {
                    borderColor: isTapped ? '#B39DDB' : '#E0E0E0',
                  },
                }}
              >
                {q.emoji}
                {isTapped && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#7C4DFF',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {order + 1}
                  </Box>
                )}
              </Button>
            )
          })}
        </Box>

        <Typography textAlign="center" fontWeight={800} fontSize="1.1rem" color="primary" mb={1.5}>
          Counted: {tapped.length} {done ? `— it's ${q.word}!` : ''}
        </Typography>

        <Fade in={done}>
          <Typography textAlign="center" fontWeight={800} fontSize="1rem" color="success.main" mb={1.5} minHeight="1.5em">
            🎉 You counted {q.word}!
          </Typography>
        </Fade>

        {/* Next button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={!done}
          onClick={handleNext}
          sx={{
            py: 1.8,
            fontSize: '1.1rem',
            mt: 'auto',
            background: done
              ? 'linear-gradient(135deg, #7C4DFF, #E040FB)'
              : undefined,
            boxShadow: done ? '0 4px 16px rgba(124,77,255,0.4)' : undefined,
          }}
        >
          {current + 1 >= quizLength ? '🏁 See Results' : 'Next →'}
        </Button>
      </Box>
    </Box>
  )
}
