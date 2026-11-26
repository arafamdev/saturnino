import { useContext } from 'react'
import { PwaContext } from '../context/PwaContext'
export function usePwa() {
  const value = useContext(PwaContext)
  if (!value) throw new Error('usePwa must be used within PwaProvider')
  return value
}
