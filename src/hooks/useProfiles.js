import { useState, useCallback } from 'react'

const KEY = 'soundTrail_v1'

// Maps a quiz mode to the field on a kid's profile where its progress lives
export const PROGRESS_FIELD = {
  pronounce: 'progress',
  spelling: 'spellingProgress',
  flags: 'flagProgress',
  countrySpelling: 'countrySpellingProgress',
  counting: 'countingProgress',
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { kids: [], activeId: null }
  } catch {
    return { kids: [], activeId: null }
  }
}

function persist(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export default function useProfiles() {
  const [data, setData] = useState(load)

  const update = useCallback((updater) => {
    setData(prev => {
      const next = updater(prev)
      persist(next)
      return next
    })
  }, [])

  const addKid = useCallback((name, avatar) => {
    const id = Date.now().toString()
    update(prev => ({
      ...prev,
      kids: [...prev.kids, { id, name, avatar, progress: {}, spellingProgress: {} }],
      activeId: id,
    }))
    return id
  }, [update])

  const setActiveKid = useCallback((id) => {
    update(prev => ({ ...prev, activeId: id }))
  }, [update])

  const removeKid = useCallback((id) => {
    update(prev => {
      const kids = prev.kids.filter(k => k.id !== id)
      const activeId = prev.activeId === id ? (kids[0]?.id ?? null) : prev.activeId
      return { ...prev, kids, activeId }
    })
  }, [update])

  const saveModeProgress = useCallback((mode, kidId, monthNum, stars, score) => {
    const field = PROGRESS_FIELD[mode]
    update(prev => ({
      ...prev,
      kids: prev.kids.map(k => {
        if (k.id !== kidId) return k
        const bucket = k[field] || {}
        const existing = bucket[monthNum] || { stars: 0, bestScore: 0, attempts: 0 }
        return {
          ...k,
          [field]: {
            ...bucket,
            [monthNum]: {
              stars: Math.max(existing.stars, stars),
              bestScore: Math.max(existing.bestScore, score),
              attempts: existing.attempts + 1,
            },
          },
        }
      }),
    }))
  }, [update])

  const activeKid = data.kids.find(k => k.id === data.activeId) ?? null

  return { kids: data.kids, activeKid, addKid, setActiveKid, removeKid, saveModeProgress }
}
