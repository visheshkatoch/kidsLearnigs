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

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [mode, setMode] = useState('pronounce') // 'pronounce' | 'spelling'
  const [words, setWords] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  const profiles = useProfiles()
  const speech = useSpeech()

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}words.json`)
      .then(r => r.json())
      .then(data => setWords(data))
      .catch(console.error)
  }, [])

  // When a menu item is selected, route into that section
  const handleMenuSelect = (id) => {
    if (id === 'sound-trail' || id === 'spelling') {
      setMode(id === 'spelling' ? 'spelling' : 'pronounce')
      // Skip kid selector if a kid is already active
      setScreen(profiles.activeKid ? 'home' : 'kids')
    }
  }

  const handleSelectKid = () => setScreen('home')

  const handleStartQuiz = (month) => {
    setSelectedMonth(month)
    setScreen('quiz')
  }

  const handleQuizDone = (result) => {
    if (mode === 'spelling') {
      profiles.saveSpellingProgress(profiles.activeKid.id, result.monthNum, result.stars, result.score)
    } else {
      profiles.saveProgress(profiles.activeKid.id, result.monthNum, result.stars, result.score)
    }
    setLastResult(result)
    setScreen('results')
  }

  const handleRetry  = () => setScreen('quiz')
  const handleHome   = () => setScreen('home')
  const handleMenu   = () => setScreen('menu')
  const handleSwitch = () => setScreen('kids')

  if (screen !== 'menu' && !words) {
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
        {screen === 'home' && profiles.activeKid && (
          <HomeScreen
            months={words.months}
            kid={profiles.activeKid}
            speech={speech}
            onStartQuiz={handleStartQuiz}
            onSwitchKid={handleSwitch}
            onMenu={handleMenu}
            mode={mode}
          />
        )}
        {screen === 'quiz' && selectedMonth && (
          mode === 'spelling' ? (
            <SpellingQuiz
              month={selectedMonth}
              speech={speech}
              onDone={handleQuizDone}
              onBack={handleHome}
            />
          ) : (
            <Quiz
              month={selectedMonth}
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
