import { useState } from 'react'
import NeighborhoodMap from '../components/NeighborhoodMap'

export default function MapPage() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="relative w-screen h-screen bg-gray-950 overflow-hidden">
      <NeighborhoodMap onNeighborhoodSelect={setSelected} />

      {/* Logo / hint */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-eco-green tracking-tight">EcoBite</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {selected ? selected.name : 'Click a neighborhood to explore'}
        </p>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 z-10 flex flex-col transition-transform duration-300 ${
          selected ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selected && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-eco-green uppercase tracking-widest">
                    {selected.borough}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1 leading-tight">
                    {selected.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-white transition-colors ml-3 mt-0.5 text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Restaurant list placeholder */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
                Top 5 Greenest Restaurants
              </p>

              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-eco-green/20 flex items-center justify-center text-eco-green text-xs font-bold shrink-0">
                        {i}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-700 rounded w-3/4 animate-pulse" />
                        <div className="h-2 bg-gray-700 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-600 text-center mt-6">
                Restaurant scoring coming soon
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
