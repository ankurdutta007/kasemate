import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Case } from '../data/cases'

interface CasesContextType {
  cases: Case[]
  loading: boolean
  error: Error | null
}

const CasesContext = createContext<CasesContextType>({
  cases: [],
  loading: true,
  error: null,
})

export function CasesProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCases() {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('is_curated', true)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setCases(data as Case[])
        }
      } catch (err: any) {
        console.error('Error fetching cases:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  return (
    <CasesContext.Provider value={{ cases, loading, error }}>
      {children}
    </CasesContext.Provider>
  )
}

export function useCases() {
  return useContext(CasesContext)
}
