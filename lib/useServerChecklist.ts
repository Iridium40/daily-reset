// lib/useServerChecklist.ts
// Custom hook for checklist state that syncs to the server.
// Clients are identified by an anonymous UUID stored in localStorage.
// No login required.

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const TOKEN_KEY = 'dr_client_token'

function getOrCreateClientToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

interface UseServerChecklistOptions {
  orgId:   string
  listKey: string
  total:   number
}

export function useServerChecklist({ orgId, listKey, total }: UseServerChecklistOptions) {
  const [checked,  setChecked]  = useState<boolean[]>(() => Array(total).fill(false))
  const [loading,  setLoading]  = useState(true)
  const clientToken             = useRef<string>('')
  const saveTimeout             = useRef<NodeJS.Timeout | null>(null)

  // ── Load from server on mount ─────────────────────────────────────────────
  useEffect(() => {
    clientToken.current = getOrCreateClientToken()
    if (!clientToken.current || !orgId) return

    fetch(`/api/progress?clientToken=${clientToken.current}&orgId=${orgId}&listKey=${listKey}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.checked)) {
          // Ensure array length matches current total (org may have added items)
          const saved = data.checked as boolean[]
          const merged = Array(total).fill(false).map((_, i) => saved[i] ?? false)
          setChecked(merged)
        }
      })
      .catch(() => {
        // Fall back to localStorage if server is unavailable
        const saved = localStorage.getItem(`cl_${orgId}_${listKey}`)
        if (saved) setChecked(JSON.parse(saved))
      })
      .finally(() => setLoading(false))
  }, [orgId, listKey, total])

  // ── Debounced save to server ───────────────────────────────────────────────
  const saveToServer = useCallback((next: boolean[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      // Optimistic localStorage backup
      localStorage.setItem(`cl_${orgId}_${listKey}`, JSON.stringify(next))
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientToken: clientToken.current,
          orgId,
          listKey,
          checked: next,
        }),
      }).catch(() => {}) // Silent fail — localStorage is the backup
    }, 500)
  }, [orgId, listKey])

  // ── Toggle an item ────────────────────────────────────────────────────────
  const toggle = useCallback((i: number) => {
    setChecked(prev => {
      const next = [...prev]
      next[i] = !next[i]
      saveToServer(next)
      return next
    })
  }, [saveToServer])

  // ── Reset all ─────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    const empty = Array(total).fill(false)
    setChecked(empty)
    saveToServer(empty)
  }, [total, saveToServer])

  const doneCount = checked.filter(Boolean).length
  const allDone   = doneCount === total

  return { checked, toggle, reset, doneCount, allDone, loading }
}
