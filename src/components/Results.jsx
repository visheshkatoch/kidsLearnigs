import React, { useEffect, useMemo } from 'react'
import {
  Box, Typography, Button, Card, CardContent,
} from '@mui/material'
import ReplayIcon from '@mui/icons-material/Replay'
import HomeIcon from '@mui/icons-material/Home'

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C',
  '#4DABF7', '#E599F7', '#FF8CC8', '#A9E34B',
]

function starStr(n) {
  return '⭐'.repeat(n) + '☆'.repeat(3 - n)
}

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left:     `${Math.random() * 100}%`,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      duration: `${1.4 + Math.random() * 2}s`,
      delay:    `${Math.random() * 0.8}s`,
      size:     `${6 + Math.random() * 10}px`,
      round:    Math.random() > 0.5,
    })),
  [])

  return (
    <Box
      sx={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'hidden', zIndex: 999,
      }}
    >
      {pieces.map(p => (
        <Box
          key={p.id}
          sx={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `fall ${p.duration} ${p.delay} linear forwards`,
            '@keyframes fall': {
              to: { transform: 'translateY(110vh) rotate(720deg)', opacity: 0 },
            },
          }}
        />
      ))}
    </Box>
  )
}

const MESSAGES = {
  3: { emoji: '🏆', msg: 'Superstar! You nailed it! 🎉' },
  2: { emoji: '🌟', msg: 'Great job! Keep practising!' },
  1: { emoji: '💪', msg: 'Good try! Listen again and retry!' },
  0: { emoji: '🐣', msg: "Let's try again — you've got this!" },
}

export default function Results({ result, month, speech, onRetry, onHome }) {
  const { score, total, stars } = result
  const { emoji, msg } = MESSAGES[stars]

  useEffect(() => {
    const texts = {
      3: 'Wonderful! You are a superstar!',
      2: 'Great job! Keep practising!',
      1: 'Good try! Let us try again!',
      0: 'Let us try again! You can do it!',
    }
    const timer = setTimeout(() => speech.speak(texts[stars]), 400)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scoreMsg =
    score >= 9 ? 'Expert level! 🎯' :
    score >= 7 ? 'Almost perfect! 🌟' :
    score >= 5 ? 'Getting there! 💪' : 'Keep practising! 📚'

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      sx={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)' }}
    >
      {stars === 3 && <Confetti />}

      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography fontSize="4rem" lineHeight={1} mb={1}>{emoji}</Typography>

          <Typography variant="h4" fontWeight={900} color="primary" mb={0.5}>
            {score} / {total}
          </Typography>

          <Typography fontSize="2rem" mb={1}>{starStr(stars)}</Typography>

          <Typography variant="h6" color="text.secondary" mb={3}>
            {msg}
          </Typography>

          {/* Month summary chip */}
          <Box
            sx={{
              background: month.color + '22',
              border: `2px solid ${month.color}44`,
              borderRadius: 3,
              p: 1.8,
              mb: 3,
            }}
          >
            <Typography fontWeight={800} color={month.color} fontSize="1rem">
              {month.mascot} {month.title}: {month.theme}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.3}>
              {scoreMsg}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1.5}>
            <Button
              variant="contained"
              startIcon={<ReplayIcon />}
              onClick={onRetry}
              fullWidth
              size="large"
              sx={{
                py: 1.8,
                background: 'linear-gradient(135deg, #FF6D00, #FFAB40)',
                '&:hover': { background: 'linear-gradient(135deg, #E65100, #FF9800)' },
              }}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={onHome}
              fullWidth
              size="large"
              sx={{ py: 1.8, borderWidth: 2 }}
            >
              All Months
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
