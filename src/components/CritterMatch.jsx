import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Typography, Button, IconButton, Chip, Dialog, DialogContent,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const EMOJI = ['🦁', '🐵', '🐸', '🦊', '🐢', '🐘', '🦋', '🦉']
const PAIR_COUNT = { easy: 6, hard: 8 }
const BEST_KEY = 'soundTrail_critterMatchBest_v1'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(difficulty) {
  const pairs = PAIR_COUNT[difficulty]
  const chosen = EMOJI.slice(0, pairs)
  return shuffle(chosen.concat(chosen)).map((emoji, id) => ({ id, emoji, open: false, matched: false }))
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function loadBest() {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY)) || {}
  } catch {
    return {}
  }
}

function saveBest(best) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(best))
  } catch {
    // ignore write failures (private browsing, storage full, etc.)
  }
}

// Simple flip-and-match memory game — the one section that isn't built
// from the words/countries/numbers dataset, so it manages its own deck
// state and keeps its best times in localStorage instead of a kid profile.
export default function CritterMatch({ onBack }) {
  const [difficulty, setDifficulty] = useState('easy')
  const [deck, setDeck] = useState(() => buildDeck('easy'))
  const [flipped, setFlipped] = useState([])
  const [locked, setLocked] = useState(false)
  const [wrongIds, setWrongIds] = useState([])
  const [moves, setMoves] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [won, setWon] = useState(false)
  const [isNewBest, setIsNewBest] = useState(false)
  const [best, setBest] = useState(loadBest)
  const startRef = useRef(null)
  const timerRef = useRef(null)

  const startGame = useCallback((diff) => {
    setDifficulty(diff)
    setDeck(buildDeck(diff))
    setFlipped([])
    setLocked(false)
    setWrongIds([])
    setMoves(0)
    setElapsed(0)
    setWon(false)
    setIsNewBest(false)
    startRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const matchedCount = deck.filter(c => c.matched).length

  const handleFlip = (id) => {
    if (locked || won) return
    const card = deck.find(c => c.id === id)
    if (!card || card.open || card.matched) return

    if (!startRef.current) {
      startRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
      }, 500)
    }

    setDeck(prev => prev.map(c => (c.id === id ? { ...c, open: true } : c)))
    const nextFlipped = [...flipped, card]
    setFlipped(nextFlipped)

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1)
      setLocked(true)
      const [a, b] = nextFlipped
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          setDeck(prev => prev.map(c => (c.id === a.id || c.id === b.id) ? { ...c, matched: true } : c))
          setFlipped([])
          setLocked(false)
        }, 350)
      } else {
        setTimeout(() => setWrongIds([a.id, b.id]), 350)
        setTimeout(() => {
          setDeck(prev => prev.map(c => (c.id === a.id || c.id === b.id) ? { ...c, open: false } : c))
          setWrongIds([])
          setFlipped([])
          setLocked(false)
        }, 900)
      }
    }
  }

  // Once every card is matched, stop the clock and record a best time if
  // this run beat it. `won` is deliberately left out of the deps so this
  // only fires the moment the last pair lands.
  useEffect(() => {
    if (!deck.length || matchedCount !== deck.length || won) return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const score = moves * 1000 + elapsed
    const prevBest = best[difficulty]
    const newBest = !prevBest || score < prevBest.score
    if (newBest) {
      const nextBest = { ...best, [difficulty]: { moves, seconds: elapsed, score } }
      setBest(nextBest)
      saveBest(nextBest)
    }
    setIsNewBest(newBest)
    setWon(true)
  }, [matchedCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentBest = best[difficulty]

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="background.default">
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6C4AB6 0%, #FF6F59 100%)',
          px: 1.5, py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: 'white' }} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1} minWidth={0}>
          <Typography color="white" fontWeight={800} fontSize="1.1rem" noWrap>
            🐾 Critter Match
          </Typography>
          <Typography color="rgba(255,255,255,0.85)" fontSize="0.75rem" noWrap>
            Flip two, find the pair, beat your best time
          </Typography>
        </Box>
      </Box>

      <Box flex={1} px={2} py={2} maxWidth={480} mx="auto" width="100%" display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="space-between"
          gap={1.5}
          sx={{ background: 'background.paper', bgcolor: 'background.paper', borderRadius: 4, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
        >
          <Box display="flex" bgcolor="background.default" borderRadius={99} p={0.5} gap={0.5}>
            {['easy', 'hard'].map(diff => (
              <Button
                key={diff}
                size="small"
                onClick={() => difficulty !== diff && startGame(diff)}
                sx={{
                  borderRadius: 99,
                  px: 1.6,
                  py: 0.6,
                  minWidth: 0,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: difficulty === diff ? 'white' : 'text.secondary',
                  background: difficulty === diff ? '#6C4AB6' : 'transparent',
                  '&:hover': { background: difficulty === diff ? '#5B3FA0' : 'rgba(0,0,0,0.04)' },
                }}
              >
                {diff === 'easy' ? 'Easy · 6 pairs' : 'Tricky · 8 pairs'}
              </Button>
            ))}
          </Box>

          <Box display="flex" gap={2}>
            <Box textAlign="center">
              <Typography fontWeight={800} fontSize="1.1rem" lineHeight={1}>{moves}</Typography>
              <Typography fontSize="0.65rem" color="text.secondary" textTransform="uppercase">Moves</Typography>
            </Box>
            <Box textAlign="center">
              <Typography fontWeight={800} fontSize="1.1rem" lineHeight={1} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(elapsed)}
              </Typography>
              <Typography fontSize="0.65rem" color="text.secondary" textTransform="uppercase">Time</Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="contained"
            onClick={() => startGame(difficulty)}
            sx={{ background: '#FFC93C', color: '#5A3D00', fontWeight: 800, boxShadow: 'none', '&:hover': { background: '#FFB800', boxShadow: 'none' } }}
          >
            New Game
          </Button>
        </Box>

        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1.2,
          }}
        >
          {deck.map(card => {
            const isFlipped = card.open || card.matched
            const isWrong = wrongIds.includes(card.id)
            return (
              <Box
                key={card.id}
                onClick={() => handleFlip(card.id)}
                sx={{ aspectRatio: '1 / 1', perspective: 800, cursor: locked || won ? 'default' : 'pointer' }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                    ...(isWrong && {
                      animation: 'critterShake 0.4s',
                      '@keyframes critterShake': {
                        '20%': { transform: 'translateX(-6px) rotateY(180deg)' },
                        '40%': { transform: 'translateX(6px) rotateY(180deg)' },
                        '60%': { transform: 'translateX(-4px) rotateY(180deg)' },
                        '80%': { transform: 'translateX(4px) rotateY(180deg)' },
                        '100%': { transform: 'translateX(0) rotateY(180deg)' },
                      },
                    }),
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '14px',
                      backfaceVisibility: 'hidden',
                      background: 'linear-gradient(155deg, #7A5CD1, #6C4AB6)',
                      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12)',
                      fontSize: '1.3rem',
                      opacity: 0.55,
                    }}
                  >
                    🐾
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '14px',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      bgcolor: card.matched ? '#E3F3E8' : 'background.paper',
                      boxShadow: card.matched ? 'inset 0 0 0 2px #3DA35D' : '0 4px 10px rgba(0,0,0,0.12)',
                      fontSize: 'clamp(1.6rem, 6vw, 2rem)',
                    }}
                  >
                    {card.emoji}
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: 4, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <Typography fontWeight={800} fontSize="0.9rem" color="#6C4AB6" mb={0.5}>
            🏆 Your Best — {difficulty === 'easy' ? 'Easy' : 'Tricky'}
          </Typography>
          {currentBest ? (
            <Typography fontSize="0.85rem" color="text.secondary">
              {currentBest.moves} moves in {formatTime(currentBest.seconds)}
            </Typography>
          ) : (
            <Typography fontSize="0.85rem" color="text.secondary">
              No runs yet — finish a round to set your best!
            </Typography>
          )}
        </Box>
      </Box>

      <Dialog open={won} onClose={() => setWon(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography fontSize="2.5rem">🎉</Typography>
          <Typography variant="h6" fontWeight={800} color="#6C4AB6">Pairs found!</Typography>
          {isNewBest && (
            <Chip label="New best!" sx={{ alignSelf: 'center', background: '#3DA35D', color: 'white', fontWeight: 800 }} />
          )}
          <Box display="flex" justifyContent="center" gap={3}>
            <Box textAlign="center">
              <Typography fontWeight={800} fontSize="1.3rem">{moves}</Typography>
              <Typography fontSize="0.7rem" color="text.secondary" textTransform="uppercase">Moves</Typography>
            </Box>
            <Box textAlign="center">
              <Typography fontWeight={800} fontSize="1.3rem">{formatTime(elapsed)}</Typography>
              <Typography fontSize="0.7rem" color="text.secondary" textTransform="uppercase">Time</Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1.5} mt={1}>
            <Button fullWidth variant="outlined" onClick={onBack}>Menu</Button>
            <Button fullWidth variant="contained" onClick={() => startGame(difficulty)} sx={{ background: '#6C4AB6' }}>
              Play again
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
