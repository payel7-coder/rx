import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export function usePrescriptions(){
  return useQuery(['prescriptions'], async ()=>{
    const { data } = await api.get('/prescriptions')
    return data
  })
}
