import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mapDbPothole } from '../lib/mapPothole'
import type { Pothole } from '../types'
import type { DbPothole } from '../types/database'

type State = {
  items: Pothole[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function usePotholes(): State {
  const [items, setItems] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: qErr } = await supabase
      .from('potholes')
      .select('*')
      .order('detection_timestamp', { ascending: false })
      .limit(1000)

    if (qErr) {
      setError(qErr.message)
      setItems([])
      setLoading(false)
      return
    }

    setItems((data as DbPothole[]).map(mapDbPothole))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { items, loading, error, refresh }
}
