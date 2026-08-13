import React from 'react'
import { usePrescriptions } from '../hooks/usePrescriptions'

export default function Prescriptions(){
  const { data, isLoading, error } = usePrescriptions()
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error</div>

  return (
    <div>
      <ul className="space-y-2">
        {data?.map((p:any) => (
          <li key={p.id} className="p-3 bg-white rounded shadow">
            <div className="text-sm font-medium">{p.id}</div>
            <div className="text-xs text-gray-500">Status: {p.status}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
