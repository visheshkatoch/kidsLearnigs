import { useState, useCallback } from 'react'

const KEY = 'soundTrail_v1'

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
      kids: [...prev.kids, { id, name, avatar, progress: {} }],
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

  const saveProgress = useCallback((kidId, monthNum, stars, score) => {
    update(prev => ({
      ...prev,
      kids: prev.kids.map(k => {
        if (k.id !== kidId) return k
        const existing = k.progress[monthNum] || { stars: 0, bestScore: 0, attempts: 0 }
        return {
          ...k,
          progress: {
            ...k.progress,
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

  return { kids: data.kids, activeKid, addKid, setActiveKid, removeKid, saveProgress }
}
