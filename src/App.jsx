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
import Results from './components/Results'
import { hyphenate } from './utils/flags'

// menu item id -> quiz mode
const MODE_BY_MENU_ID = {
  'sound-trail': 'pronounce',
  'spelling': 'spelling',
  'country-flags': 'flags',
  'country-spelling': 'countrySpelling',
}

// quiz mode -> which dataset it draws from, and which quiz component runs it
const DATASET_BY_MODE = {
  pronounce: 'words',
  spelling: 'words',
  flags: 'countries',
  countrySpelling: 'countries',
}
const SPELLING_MODES = new Set(['spelling', 'countrySpelling'])

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
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [lastResult, setLastResult] = useState(null)

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
  }, [])

  const dataset = DATASET_BY_MODE[mode] === 'countries' ? countries : words

  // When a menu item is selected, route into that section
  const handleMenuSelect = (id) => {
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

  if (screen !== 'menu' && !dataset) {
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
          SPELLING_MODES.has(mode) ? (
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
