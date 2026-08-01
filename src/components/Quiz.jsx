import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Typography, Button, LinearProgress,
  IconButton, Chip, Fade,
} from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccentPicker from './AccentPicker'
import useStopwatch, { formatTime } from '../hooks/useStopwatch'
import FlagIcon from './FlagIcon'
import ObjectGroup from './ObjectGroup'
import ObjectGroupPair from './ObjectGroupPair'

const WORD_QUIZ_LENGTH = 10
const AUTO_ADVANCE_MS = 2000
const SPEAK_GAP_MS = 1200
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

export default function Quiz({ month, mode = 'pronounce', speech, onDone, onBack }) {
  // In flag-matching and counting modes, the picture is the clue —
  // speaking the answer up front would give it away before the kid even
  // looks at it. Counting sections stay a graded, capped ladder like the
  // English lessons though, so the uncapped/"X of Y correct" treatment
  // below stays flags-only.
  const isFlagMode = mode === 'flags'
  const isVisualClueMode = mode === 'flags' || mode === 'counting'
  // Countries & flags aren't a graded difficulty ladder like the English
  // lessons — run through every country in the region instead of a 10-cap.
  const quizLength = isFlagMode ? month.words.length : WORD_QUIZ_LENGTH
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
  const elapsed = useStopwatch(month.num)

  useEffect(() => {
    scoreRef.current = 0
    setDisplayScore(0)
    const words = shuffle([...month.words]).slice(0, quizLength)
    const qs = words.map(w => {
      const distractors = w.distractors && w.distractors.length
        ? w.distractors
        : shuffle(month.words.filter(o => o.word !== w.word).map(o => o.word)).slice(0, 3)
      return { ...w, options: shuffle([w.word, ...distractors]) }
    })
    setQuestions(qs)
    setCurrent(0)
  }, [month, quizLength])

  const q = questions[current]

  useEffect(() => {
    if (!q) return
    setAnswered(false)
    setSelected(null)
    setFeedback('')
    setShowPhonetic(false)
    setMascot(month.mascot)
    if (isVisualClueMode) return
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
    } else {
      setMascot(pick(TRY))
      setFeedback(`The word was "${q.word}"`)
    }

    if (isVisualClueMode) {
      // Pronounce what the kid picked, then the correct answer
      speech.speak(opt)
      if (opt !== q.word) {
        setTimeout(() => speech.speak(q.word, true), SPEAK_GAP_MS)
      }
    } else if (correct) {
      speech.speak('Great job!')
    } else {
      speech.speak(q.word, true)
    }
  }, [answered, q, speech, isVisualClueMode])

  const handleNext = useCallback(() => {
    if (current + 1 >= quizLength) {
      const finalScore = scoreRef.current
      const pct   = finalScore / quizLength
      const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0
      onDone({ score: finalScore, total: quizLength, monthNum: month.num, stars })
    } else {
      setCurrent(c => c + 1)
    }
  }, [current, month, onDone, quizLength])

  // Auto-advance to the next question shortly after a correct answer
  useEffect(() => {
    if (!answered || !q || selected !== q.word) return
    const timer = setTimeout(() => handleNext(), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [answered, selected, q, handleNext])

  if (!q) return null

  const progress = (current / quizLength) * 100
  const counterLabel = isFlagMode ? `${displayScore} of ${quizLength} correct` : `${current + 1}/${quizLength}`

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
              label={counterLabel}
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

        {/* Word/flag/object clue */}
        <Box textAlign="center" mb={1}>
          {q.groups ? (
            <ObjectGroupPair groups={q.groups} operator={q.operator} />
          ) : q.count != null ? (
            <ObjectGroup emoji={q.emoji} count={q.count} crossedOut={q.crossedOut} />
          ) : q.code ? (
            <FlagIcon code={q.code} size="5rem" />
          ) : (
            <Typography fontSize="2rem" lineHeight={1}>{q.emoji}</Typography>
          )}
        </Box>

        {/* Listen button — in flag/counting modes, held back until
            answered so the picture stays the only clue */}
        {(!isVisualClueMode || answered) && (
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
        )}

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
          {current + 1 >= quizLength ? '🏁 See Results' : 'Next Word →'}
        </Button>
      </Box>
    </Box>
  )
}
