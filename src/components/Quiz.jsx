import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Typography, Button, LinearProgress,
  IconButton, Chip, Fade,
} from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccentPicker from './AccentPicker'

const QUIZ_LENGTH = 10
const HAPPY  = ['🥳', '🎉', '⭐', '🌟', '🎊', '🏆', '💪', '👏', '🤩']
const TRY    = ['😅', '🤔', '💪', '😮', '🙈', '🐣', '😬']

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

export default function Quiz({ month, speech, onDone, onBack }) {
  const [questions, setQuestions]     = useState([])
  const [current, setCurrent]         = useState(0)
  const [answered, setAnswered]       = useState(false)
  const [selected, setSelected]       = useState(null)
  const [mascot, setMascot]           = useState(month.mascot)
  const [feedback, setFeedback]       = useState('')
  const [showPhonetic, setShowPhonetic] = useState(false)

  // Track score in a ref to avoid stale-closure issues when calling onDone
  const scoreRef = useRef(0)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    scoreRef.current = 0
    setDisplayScore(0)
    const words = shuffle([...month.words]).slice(0, QUIZ_LENGTH)
    const qs = words.map(w => ({
      ...w,
      options: shuffle([w.word, ...w.distractors]),
    }))
    setQuestions(qs)
    setCurrent(0)
  }, [month])

  const q = questions[current]

  useEffect(() => {
    if (!q) return
    setAnswered(false)
    setSelected(null)
    setFeedback('')
    setShowPhonetic(false)
    setMascot(month.mascot)
    const timer = setTimeout(() => speech.speak(q.word), 500)
    return () => clearTimeout(timer)
  }, [current, q]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((opt) => {
    if (answered) return
    setAnswered(true)
    setSelected(opt)
    setShowPhonetic(true)

    const correct = opt === q.word
    if (correct) {
      scoreRef.current += 1
      setDisplayScore(scoreRef.current)
      setMascot(pick(HAPPY))
      setFeedback(`✅ Correct! "${q.word}"`)
      speech.speak('Great job!')
    } else {
      setMascot(pick(TRY))
      setFeedback(`The word was "${q.word}"`)
      speech.speak(q.word, true)
    }
  }, [answered, q, speech])

  const handleNext = useCallback(() => {
    if (current + 1 >= QUIZ_LENGTH) {
      const finalScore = scoreRef.current
      const pct   = finalScore / QUIZ_LENGTH
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0
      onDone({ score: finalScore, total: QUIZ_LENGTH, monthNum: month.num, stars })
    } else {
      setCurrent(c => c + 1)
    }
  }, [current, month, onDone])

  if (!q) return null

  const progress = (current / QUIZ_LENGTH) * 100

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="background.default">
      {/* Top bar */}
      <Box
        sx={{
          background: month.color,
          px: 2, py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: 'white' }} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography color="white" fontWeight={800} flex={1} fontSize="0.9rem" noWrap>
          {month.mascot} {month.title}: {month.theme}
        </Typography>
        <AccentPicker
          accent={speech.accent}
          availableCodes={speech.availableCodes}
          onChange={speech.changeAccent}
        />
        <Chip
          label={`${current + 1}/${QUIZ_LENGTH}`}
          size="small"
          sx={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontWeight: 800, ml: 0.5 }}
        />
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          bgcolor: 'rgba(0,0,0,0.08)',
          '& .MuiLinearProgress-bar': { background: month.color },
        }}
      />

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

        {/* Word emoji clue */}
        <Box textAlign="center" mb={1}>
          <Typography fontSize="2rem">{q.emoji}</Typography>
        </Box>

        {/* Listen button */}
        <Box textAlign="center" mb={2.5}>
          <Button
            variant="contained"
            size="large"
            startIcon={<VolumeUpIcon />}
            onClick={() => speech.speak(q.word)}
            sx={{
              borderRadius: 50,
              px: 3.5,
              py: 1.4,
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #FF6D00, #FFAB40)',
              boxShadow: '0 4px 16px rgba(255,109,0,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #E65100, #FF9800)' },
            }}
          >
            Hear the Word 🔊
          </Button>
          <Typography variant="caption" display="block" mt={0.8} color="text.secondary">
            Tap to hear it again
          </Typography>

          <Fade in={showPhonetic}>
            <Typography
              variant="body1"
              mt={0.6}
              fontWeight={800}
              color="primary"
              letterSpacing={2}
              fontSize="1.05rem"
            >
              {q.phonetic}
            </Typography>
          </Fade>
        </Box>

        {/* Answer buttons */}
        <Box display="flex" flexDirection="column" gap={1.4} mb={2}>
          {q.options.map(opt => {
            const isCorrect = opt === q.word
            const isSelected = opt === selected

            let sxExtra = {}
            if (answered) {
              if (isCorrect) {
                sxExtra = {
                  background: '#E8F5E9',
                  borderColor: '#4CAF50',
                  color: '#2E7D32',
                  borderWidth: 2.5,
                }
              } else if (isSelected) {
                sxExtra = {
                  background: '#FFEBEE',
                  borderColor: '#F44336',
                  color: '#C62828',
                  borderWidth: 2.5,
                }
              }
            }

            return (
              <Button
                key={opt}
                variant="outlined"
                fullWidth
                className="no-select"
                disabled={answered && !isCorrect && !isSelected}
                onClick={() => handleAnswer(opt)}
                sx={{
                  borderRadius: 3,
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  py: 1.8,
                  borderWidth: 2,
                  borderColor: '#D1C4E9',
                  color: '#333',
                  background: '#fff',
                  justifyContent: 'center',
                  letterSpacing: 0.5,
                  transition: 'all 0.15s',
                  '&:hover:not(:disabled)': {
                    background: '#EDE7F6',
                    borderColor: '#7C4DFF',
                    transform: 'scale(1.01)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.35,
                    borderColor: '#E0E0E0',
                    color: '#aaa',
                  },
                  ...sxExtra,
                }}
              >
                {opt}
              </Button>
            )
          })}
        </Box>

        {/* Feedback */}
        <Fade in={!!feedback}>
          <Typography
            textAlign="center"
            fontWeight={800}
            fontSize="1rem"
            color={selected === q?.word ? 'success.main' : 'error.main'}
            mb={1.5}
            minHeight="1.5em"
          >
            {feedback}
          </Typography>
        </Fade>

        {/* Next button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={!answered}
          onClick={handleNext}
          sx={{
            py: 1.8,
            fontSize: '1.1rem',
            mt: 'auto',
            background: answered
              ? 'linear-gradient(135deg, #7C4DFF, #E040FB)'
              : undefined,
            boxShadow: answered ? '0 4px 16px rgba(124,77,255,0.4)' : undefined,
          }}
        >
          {current + 1 >= QUIZ_LENGTH ? '🏁 See Results' : 'Next Word →'}
        </Button>
      </Box>
    </Box>
  )
}
