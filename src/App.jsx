import React, { useState, useEffect } from 'react'
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material'
import { theme } from './theme'
import useProfiles from './hooks/useProfiles'
import useSpeech from './hooks/useSpeech'
import MainMenu from './components/MainMenu'
import KidSelector from './components/KidSelector'
import HomeScreen from './components/HomeScreen'
import Quiz from './components/Quiz'
import SpellingQuiz from './components/SpellingQuiz'
import CountTapQuiz from './components/CountTapQuiz'
import CritterMatch from './components/CritterMatch'
import Results from './components/Results'
import { hyphenate } from './utils/flags'

// menu item id -> quiz mode
const MODE_BY_MENU_ID = {
  'sound-trail': 'pronounce',
  'spelling': 'spelling',
  'country-flags': 'flags',
  'country-spelling': 'countrySpelling',
  'counting': 'counting',
}

// quiz mode -> which dataset it draws from
const DATASET_BY_MODE = {
  pronounce: 'words',
  spelling: 'words',
  flags: 'countries',
  countrySpelling: 'countries',
  counting: 'numbers',
}
const SPELLING_MODES = new Set(['spelling', 'countrySpelling'])

function datasetFor(mode, datasets) {
  return datasets[DATASET_BY_MODE[mode]]
}

// Screens worth resuming into after an accidental reload — picking a
// section and being mid-quiz. The main menu, kid picker, and results are
// fine to just land back on fresh.
const RESUMABLE_SCREENS = new Set(['home', 'quiz'])
const SESSION_KEY = 'soundTrail_session_v1'

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

function transformCountries(data) {
  return {
    months: data.sections.map(s => ({
      ...s,
      words: s.countries.map(c => ({
        word: c.name,
        phonetic: hyphenate(c.name),
        code: c.code,
      })),
    })),
  }
}

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState('pronounce')
  const [words, setWords] = useState(null)
  const [countries, setCountries] = useState(null)
  const [numbers, setNumbers] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  // If we reloaded mid-lesson, hold off rendering the menu until we've had
  // a chance to jump back to where the kid was (avoids a menu flash).
  const [restoring, setRestoring] = useState(() => {
    const session = loadSession()
    return !!(session && RESUMABLE_SCREENS.has(session.screen))
  })

  const profiles = useProfiles()
  const speech = useSpeech()

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}words.json`)
      .then(r => r.json())
      .then(data => setWords(data))
      .catch(console.error)
    fetch(`${import.meta.env.BASE_URL}countries.json`)
      .then(r => r.json())
      .then(data => setCountries(transformCountries(data)))
      .catch(console.error)
    fetch(`${import.meta.env.BASE_URL}numbers.json`)
      .then(r => r.json())
      .then(data => setNumbers(data))
      .catch(console.error)
  }, [])

  const dataset = datasetFor(mode, { words, countries, numbers })

  // Resume onto the saved screen once the data + active kid it needs are ready
  useEffect(() => {
    if (!restoring) return
    const session = loadSession()
    if (!session || !profiles.activeKid) { setRestoring(false); return }
    const ds = datasetFor(session.mode, { words, countries, numbers })
    if (!ds) return // wait for the dataset this session needs to finish loading

    if (session.screen === 'home') {
      setMode(session.mode)
      setScreen('home')
    } else if (session.screen === 'quiz') {
      // Quiz needs an actual section object, not just its number
      const month = ds.months.find(m => m.num === session.monthNum)
      if (month) {
        setMode(session.mode)
        setSelectedMonth(month)
        setScreen('quiz')
      } else {
        saveSession(null)
      }
    } else {
      saveSession(null)
    }
    setRestoring(false)
  }, [restoring, words, countries, numbers, profiles.activeKid])

  // Keep the saved session in sync so a reload can resume into it
  useEffect(() => {
    if (restoring) return
    saveSession(RESUMABLE_SCREENS.has(screen) ? { screen, mode, monthNum: selectedMonth?.num } : null)
  }, [restoring, screen, mode, selectedMonth])

  // When a menu item is selected, route into that section
  const handleMenuSelect = (id) => {
    if (id === 'critter-match') {
      setScreen('critter-match')
      return
    }
    const nextMode = MODE_BY_MENU_ID[id]
    if (!nextMode) return
    setMode(nextMode)
    // Skip kid selector if a kid is already active
    setScreen(profiles.activeKid ? 'home' : 'kids')
  }

  const handleSelectKid = () => setScreen('home')

  const handleStartQuiz = (month) => {
    setSelectedMonth(month)
    setScreen('quiz')
  }

  const handleQuizDone = (result) => {
    profiles.saveModeProgress(mode, profiles.activeKid.id, result.monthNum, result.stars, result.score)
    setLastResult(result)
    setScreen('results')
  }

  const handleRetry  = () => setScreen('quiz')
  const handleHome   = () => setScreen('home')
  const handleMenu   = () => setScreen('menu')
  const handleSwitch = () => setScreen('kids')

  if (restoring || (screen !== 'menu' && screen !== 'critter-match' && !dataset)) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
          <CircularProgress color="primary" size={60} thickness={5} />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box minHeight="100vh" bgcolor="background.default">
        {screen === 'menu' && (
          <MainMenu onSelect={handleMenuSelect} />
        )}
        {screen === 'kids' && (
          <KidSelector profiles={profiles} onSelect={handleSelectKid} onBack={handleMenu} />
        )}
        {screen === 'critter-match' && (
          <CritterMatch onBack={handleMenu} />
        )}
        {screen === 'home' && profiles.activeKid && dataset && (
          <HomeScreen
            months={dataset.months}
            kid={profiles.activeKid}
            speech={speech}
            onStartQuiz={handleStartQuiz}
            onSwitchKid={handleSwitch}
            onMenu={handleMenu}
            mode={mode}
          />
        )}
        {screen === 'quiz' && selectedMonth && (
          mode === 'counting' && selectedMonth.problemType === 'tapcount' ? (
            <CountTapQuiz
              month={selectedMonth}
              speech={speech}
              onDone={handleQuizDone}
              onBack={handleHome}
            />
          ) : SPELLING_MODES.has(mode) ? (
            <SpellingQuiz
              month={selectedMonth}
              mode={mode}
              speech={speech}
              onDone={handleQuizDone}
              onBack={handleHome}
            />
          ) : (
            <Quiz
              month={selectedMonth}
              mode={mode}
              speech={speech}
              onDone={handleQuizDone}
              onBack={handleHome}
            />
          )
        )}
        {screen === 'results' && lastResult && (
          <Results
            result={lastResult}
            month={selectedMonth}
            speech={speech}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}
      </Box>
    </ThemeProvider>
  )
}
