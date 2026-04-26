import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ScorePill({ score }) {
  const bg = score >= 70 ? 'bg-eco-green/20 text-eco-green'
    : score >= 50 ? 'bg-eco-yellow/20 text-eco-yellow'
    : 'bg-eco-red/20 text-eco-red'
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bg}`}>
      {score.toFixed(0)}
    </span>
  )
}

export default function SearchBar({ onSelectNeighborhood, onSelectRestaurant }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = (q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    setLoading(true)
    fetch(`${API}/neighborhoods/search?q=${encodeURIComponent(q)}&limit=8`)
      .then(r => r.json())
      .then(data => {
        setResults(data.results || [])
        setOpen(true)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 300)
  }

  const handleSelect = (r) => {
    setQuery(r.name)
    setOpen(false)
    onSelectNeighborhood?.({ name: r.neighborhood, borough: '' })
    onSelectRestaurant?.(r)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-80">
      {/* Input */}
      <div className="flex items-center bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl px-3 py-2 gap-2 focus-within:border-eco-green transition-colors">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search restaurants…"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        {query && (
          <button onClick={handleClear} className="text-gray-500 hover:text-white text-lg leading-none">
            ×
          </button>
        )}
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-eco-green border-t-transparent rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl z-50">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.name}</p>
                <p className="text-xs text-gray-400 truncate">{r.neighborhood} · {r.cuisine}</p>
              </div>
              <ScorePill score={r.green_score} />
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-500 shadow-xl z-50">
          No restaurants found for "{query}"
        </div>
      )}
    </div>
  )
}
