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

const WORD_QUIZ_LENGTH = 10
const MAX_ATTEMPTS = 2
const AUTO_ADVANCE_MS = 2000
const HAPPY = ['🥳', '🎉', '⭐', '🌟', '🎊', '🏆', '💪', '👏', '🤩']
const TRY   = ['😅', '🤔', '💪', '😮', '🙈', '🐣', '😬']
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

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

// Breaks a word into its characters, tagging each as a fillable letter slot
// (assigned a slotIndex) or a fixed separator (spaces, hyphens, apostrophes —
// for multi-word names like "Costa Rica" or "Guinea-Bissau")
function splitWord(word) {
  let slotIndex = 0
  return word.split('').map(char => (
    /[a-zA-Z]/.test(char)
      ? { char, isLetter: true, slotIndex: slotIndex++ }
      : { char, isLetter: false, slotIndex: -1 }
  ))
}

function letterCount(word) {
  return (word.match(/[a-zA-Z]/g) || []).length
}

function answerLetters(word) {
  return word.toLowerCase().replace(/[^a-z]/g, '')
}

// Reassembles what the kid has placed so far, with separators shown in place
function assembleAttempt(word, placed) {
  return splitWord(word)
    .map(p => (p.isLetter ? (placed[p.slotIndex]?.letter ?? '_') : p.char))
    .join('')
}

function makeTiles(word) {
  const letters = answerLetters(word).split('')
  const usedLetters = new Set(letters)
  const decoyCount = 3 + Math.floor(Math.random() * 3) // 3-5
  const decoys = shuffle(ALPHABET.filter(c => !usedLetters.has(c))).slice(0, decoyCount)
  const all = [...letters, ...decoys]
  return shuffle(all.map((letter, i) => ({ id: `${i}-${letter}-${Math.random().toString(36).slice(2, 7)}`, letter })))
}

export default function SpellingQuiz({ month, mode = 'spelling', speech, onDone, onBack }) {
  const isCountryMode = mode === 'countrySpelling'
  // Countries & flags aren't a graded difficulty ladder like the English
  // lessons — run through every country in the region instead of a 10-cap.
  const quizLength = isCountryMode ? month.words.length : WORD_QUIZ_LENGTH
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [tiles, setTiles]         = useState([])
  const [placed, setPlaced]       = useState([])
  const [attempts, setAttempts]   = useState(0)
  const [phase, setPhase]         = useState('active') // 'active' | 'done'
  const [status, setStatus]       = useState(null)      // null | 'correct' | 'wrong'
  const [mascot, setMascot]       = useState(month.mascot)
  const [feedback, setFeedback]   = useState('')

  const scoreRef = useRef(0)
  const [displayScore, setDisplayScore] = useState(0)
  const elapsed = useStopwatch(month.num)

  useEffect(() => {
    scoreRef.current = 0
    setDisplayScore(0)
    const words = shuffle([...month.words]).slice(0, quizLength)
    setQuestions(words)
    setCurrent(0)
  }, [month, quizLength])

  const q = questions[current]

  useEffect(() => {
    if (!q) return
    setTiles(makeTiles(q.word))
    setPlaced([])
    setAttempts(0)
    setPhase('active')
    setStatus(null)
    setFeedback('')
    setMascot(month.mascot)
    const timer = setTimeout(() => speech.speak(q.word), 500)
    return () => clearTimeout(timer)
  }, [current, q]) // eslint-disable-line react-hooks/exhaustive-deps

  // Evaluate once every letter slot is filled
  useEffect(() => {
    if (!q || phase !== 'active' || placed.length !== letterCount(q.word)) return

    const attempt = placed.map(t => t.letter).join('')
    const displayAttempt = assembleAttempt(q.word, placed)
    if (attempt === answerLetters(q.word)) {
      scoreRef.current += 1
      setDisplayScore(scoreRef.current)
      setStatus('correct')
      setMascot(pick(HAPPY))
      setFeedback(`✅ Correct! "${q.word}"`)
      setPhase('done')
      const timer = setTimeout(() => speech.speak(q.word, true), 300)
      return () => clearTimeout(timer)
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    setStatus('wrong')
    setMascot(pick(TRY))

    if (nextAttempts >= MAX_ATTEMPTS) {
      setFeedback(`You spelled "${displayAttempt}" — the word was "${q.word}"`)
      setPhase('done')
      const timer = setTimeout(() => speech.speak(q.word, true), 300)
      return () => clearTimeout(timer)
    } else {
      setFeedback(`Not quite — you spelled "${displayAttempt}". Tap a letter to fix it!`)
    }
  }, [placed]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tiles stay put once placed — only their "used" state toggles — so the
  // remaining tiles never reflow and steal the kid's next tap.
  const handlePlace = useCallback((tile) => {
    if (phase !== 'active' || !q || placed.length >= letterCount(q.word)) return
    if (placed.some(p => p.id === tile.id)) return
    setPlaced(ps => [...ps, tile])
  }, [phase, q, placed])

  const handleRemove = useCallback((index) => {
    if (phase !== 'active') return
    const removed = placed[index]
    if (!removed) return
    setPlaced(placed.filter((_, i) => i !== index))
  }, [phase, placed])

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

  // Auto-advance to the next word shortly after a correct spelling
  useEffect(() => {
    if (phase !== 'done' || status !== 'correct') return
    const timer = setTimeout(() => handleNext(), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [phase, status, handleNext])

  if (!q) return null

  const progress = (current / quizLength) * 100
  const counterLabel = isCountryMode ? `${displayScore} of ${quizLength} correct` : `${current + 1}/${quizLength}`

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

        {/* Word/flag clue */}
        <Box textAlign="center" mb={1}>
          {q.code ? (
            <FlagIcon code={q.code} size="5rem" />
          ) : (
            <Typography fontSize="2rem" lineHeight={1}>{q.emoji}</Typography>
          )}
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
            🔊 Hear the Word
          </Button>
          <Typography variant="caption" display="block" mt={0.8} color="text.secondary">
            Tap to hear it again
          </Typography>
        </Box>

        {/* Letter slots */}
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mb={2.5}>
          {splitWord(q.word).map((part, i) => {
            if (!part.isLetter) {
              return (
                <Box
                  key={i}
                  sx={{
                    width: part.char === ' ' ? 14 : 20,
                    height: 48,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#9575CD',
                    pb: 0.5,
                  }}
                >
                  {part.char === ' ' ? '' : part.char}
                </Box>
              )
            }

            const tile = placed[part.slotIndex]
            let sxExtra = {}
            if (status === 'correct' && phase === 'done') {
              sxExtra = { background: '#E8F5E9', borderColor: '#4CAF50', color: '#2E7D32' }
            } else if (status === 'wrong' && phase === 'done') {
              sxExtra = { background: '#FFEBEE', borderColor: '#F44336', color: '#C62828' }
            }
            return (
              <Box
                key={i}
                onClick={() => tile && handleRemove(part.slotIndex)}
                className="no-select"
                sx={{
                  width: 42,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderRadius: 2,
                  border: tile ? '2.5px solid #7C4DFF' : '2.5px dashed #D1C4E9',
                  background: tile ? '#EDE7F6' : 'transparent',
                  cursor: tile && phase === 'active' ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  ...sxExtra,
                }}
              >
                {tile?.letter}
              </Box>
            )
          })}
        </Box>

        {/* Letter tile pool — tiles keep a fixed position once placed so the
            remaining tiles never shift under the kid's next tap */}
        <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mb={2}>
          {tiles.map(tile => {
            const used = placed.some(p => p.id === tile.id)
            return (
              <Button
                key={tile.id}
                variant="outlined"
                className="no-select"
                disabled={phase !== 'active' || used}
                onClick={() => handlePlace(tile)}
                sx={{
                  minWidth: 42,
                  width: 42,
                  height: 48,
                  p: 0,
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  borderRadius: 2,
                  borderWidth: 2,
                  borderColor: '#D1C4E9',
                  color: '#333',
                  background: '#fff',
                  transition: 'all 0.15s',
                  visibility: used ? 'hidden' : 'visible',
                  '&:hover:not(:disabled)': {
                    background: '#EDE7F6',
                    borderColor: '#7C4DFF',
                    transform: 'scale(1.05)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.35,
                    borderColor: '#E0E0E0',
                    color: '#aaa',
                  },
                }}
              >
                {tile.letter}
              </Button>
            )
          })}
        </Box>

        {/* Feedback */}
        <Fade in={!!feedback}>
          <Typography
            aria-live="polite"
            textAlign="center"
            fontWeight={800}
            fontSize="1rem"
            color={status === 'correct' ? 'success.main' : 'error.main'}
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
          disabled={phase !== 'done'}
          onClick={handleNext}
          sx={{
            py: 1.8,
            fontSize: '1.1rem',
            mt: 'auto',
            background: phase === 'done'
              ? 'linear-gradient(135deg, #7C4DFF, #E040FB)'
              : undefined,
            boxShadow: phase === 'done' ? '0 4px 16px rgba(124,77,255,0.4)' : undefined,
          }}
        >
          {current + 1 >= quizLength ? '🏁 See Results' : 'Next Word →'}
        </Button>
      </Box>
    </Box>
  )
}
