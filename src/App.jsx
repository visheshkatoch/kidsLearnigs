import React, { useState, useEffect } from 'react'
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material'
import { theme } from './theme'
import useProfiles from './hooks/useProfiles'
import useSpeech from './hooks/useSpeech'
import KidSelector from './components/KidSelector'
import HomeScreen from './components/HomeScreen'
import Quiz from './components/Quiz'
import Results from './components/Results'

export default function App() {
  const [screen, setScreen] = useState('kids')
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

  // If a kid is already active when app loads, go straight to home
  useEffect(() => {
    if (profiles.activeKid && screen === 'kids') {
      setScreen('home')
    }
  }, [profiles.activeKid]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectKid = () => setScreen('home')

  const handleStartQuiz = (month) => {
    setSelectedMonth(month)
    setScreen('quiz')
  }

  const handleQuizDone = (result) => {
    profiles.saveProgress(profiles.activeKid.id, result.monthNum, result.stars, result.score)
    setLastResult(result)
    setScreen('results')
  }

  const handleRetry  = () => setScreen('quiz')
  const handleHome   = () => setScreen('home')
  const handleSwitch = () => setScreen('kids')

  if (!words) {
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
        {screen === 'kids' && (
          <KidSelector profiles={profiles} onSelect={handleSelectKid} />
        )}
        {screen === 'home' && profiles.activeKid && (
          <HomeScreen
            months={words.months}
            kid={profiles.activeKid}
            speech={speech}
            onStartQuiz={handleStartQuiz}
            onSwitchKid={handleSwitch}
          />
        )}
        {screen === 'quiz' && selectedMonth && (
          <Quiz
            month={selectedMonth}
            speech={speech}
            onDone={handleQuizDone}
            onBack={handleHome}
          />
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
