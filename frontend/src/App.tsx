import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Prescriptions from './views/Prescriptions'

const qc = new QueryClient()

export default function App(){
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">RX - Prescriptions</h1>
          <Prescriptions />
        </main>
      </div>
    </QueryClientProvider>
  )
}
