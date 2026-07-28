import { useState, useEffect, useRef, useCallback } from 'react'

const ACCENTS = [
  { code: 'en-US', label: 'American', flag: '🇺🇸' },
  { code: 'en-GB', label: 'British',  flag: '🇬🇧' },
  { code: 'en-IN', label: 'Indian',   flag: '🇮🇳' },
]

export { ACCENTS }

export default function useSpeech() {
  const [accent, setAccent] = useState(
    () => localStorage.getItem('soundTrail_accent') || 'en-US'
  )
  const [availableCodes, setAvailableCodes] = useState([])
  const voicesRef = useRef([])

  useEffect(() => {
    function loadVoices() {
      const voices = window.speechSynthesis?.getVoices() || []
      voicesRef.current = voices
      const found = ACCENTS
        .filter(a => voices.some(v => v.lang === a.code || v.lang.startsWith(a.code.split('-')[0])))
        .map(a => a.code)
      setAvailableCodes(found.length ? found : ['en-US'])
    }

    loadVoices()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const changeAccent = useCallback((code) => {
    setAccent(code)
    localStorage.setItem('soundTrail_accent', code)
  }, [])

  const speak = useCallback((text, slow = false) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const u = new SpeechSynthesisUtterance(text)
    u.lang = accent

    const voices = voicesRef.current
    const exactMatch = voices.find(v => v.lang === accent)
    const prefixMatch = voices.find(v => v.lang.startsWith(accent.split('-')[0]))
    u.voice = exactMatch || prefixMatch || null

    u.rate  = slow ? 0.55 : 0.82
    u.pitch = 1.1

    window.speechSynthesis.speak(u)
  }, [accent])

  return { accent, changeAccent, speak, availableCodes }
}
