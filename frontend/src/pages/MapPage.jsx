import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCircleIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext'
import NeighborhoodMap from '../components/NeighborhoodMap'
import SearchBar from '../components/SearchBar'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'text-eco-green' : score >= 50 ? 'text-eco-yellow' : 'text-eco-red'
  return <span className={`text-sm font-bold ${color}`}>{score.toFixed(0)}</span>
}

function RestaurantCard({ rank, restaurant, onBookmark, saved }) {
  const gradeColor = {
    A: 'bg-eco-green/20 text-eco-green',
    B: 'bg-eco-yellow/20 text-eco-yellow',
    C: 'bg-eco-red/20 text-eco-red',
  }[restaurant.grade] ?? 'bg-gray-700 text-gray-400'

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-eco-green/20 flex items-center justify-center text-eco-green text-xs font-bold shrink-0 mt-0.5">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white leading-tight truncate">{restaurant.name}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <ScoreBadge score={restaurant.green_score} />
              <button
                onClick={() => onBookmark(restaurant)}
                className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {saved ? (
                  <BookmarkSolid className="h-4 w-4 text-eco-green" />
                ) : (
                  <BookmarkIcon className="h-4 w-4 text-gray-500 hover:text-eco-green" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{restaurant.cuisine}</p>
          <div className="flex items-center gap-2 mt-2">
            {restaurant.grade && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeColor}`}>
                {restaurant.grade}
              </span>
            )}
            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-eco-green rounded-full"
                style={{ width: `${Math.min(100, restaurant.green_score)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-700 rounded w-3/4" />
          <div className="h-2 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

const CATEGORIES = [
  { key: 'restaurant',   label: 'Restaurants' },
  { key: 'cafe_dessert', label: 'Sips & Sweets' },
]

function RestaurantDetail({ restaurant, onBack }) {
  const gradeColor = {
    A: 'bg-eco-green/20 text-eco-green',
    B: 'bg-eco-yellow/20 text-eco-yellow',
    C: 'bg-eco-red/20 text-eco-red',
  }[restaurant.grade] ?? 'bg-gray-700 text-gray-400'

  const scoreColor = restaurant.green_score >= 70 ? 'text-eco-green'
    : restaurant.green_score >= 50 ? 'text-eco-yellow' : 'text-eco-red'

  const components = [
    { label: 'Energy Efficiency', value: restaurant.components.energy, max: 50 },
    { label: 'Water Efficiency',  value: restaurant.components.water,  max: 20 },
    { label: 'Cuisine',           value: restaurant.components.cuisine, max: 20 },
    { label: 'Health Grade',      value: restaurant.components.health,  max: 10 },
  ]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-white mb-3 flex items-center gap-1">
          ← {restaurant.neighborhood}
        </button>
        <h2 className="text-lg font-bold text-white leading-tight">{restaurant.name}</h2>
        <p className="text-xs text-gray-400 mt-1">{restaurant.address}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">{restaurant.cuisine}</span>
          {restaurant.grade && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeColor}`}>
              {restaurant.grade}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Big score */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Eco Score</span>
          <span className={`text-4xl font-black ${scoreColor}`}>
            {restaurant.green_score.toFixed(0)}
            <span className="text-lg font-normal text-gray-500">/100</span>
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          {components.map(({ label, value, max }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{value.toFixed(0)}/{max}</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-eco-green rounded-full transition-all"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [selected, setSelected] = useState(null)
  const [focusedRestaurant, setFocusedRestaurant] = useState(null)
  const [category, setCategory] = useState('restaurant')
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { saveRestaurant, unsaveRestaurant, isRestaurantSaved } = useAuth()

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    setError(null)
    setRestaurants([])

    const params = new URLSearchParams({ limit: 5 })
    if (category) params.set('category', category)

    fetch(`${API}/neighborhoods/${encodeURIComponent(selected.name)}/restaurants?${params}`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(data => setRestaurants(data.restaurants))
      .catch(() => setError('Could not load restaurants.'))
      .finally(() => setLoading(false))
  }, [selected?.name, category])

  const handleBookmark = (restaurant) => {
    if (isRestaurantSaved(restaurant.id)) {
      unsaveRestaurant(restaurant.id)
    } else {
      saveRestaurant(restaurant)
    }
  }

  return (
    <div className="relative w-screen h-screen bg-gray-950 overflow-hidden">
      <NeighborhoodMap
        onNeighborhoodSelect={(n) => { setSelected(n); setFocusedRestaurant(null) }}
        highlightName={selected?.name}
      />

      {/* Logo */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h1 className="text-2xl font-bold text-eco-green tracking-tight">EcoBite</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {selected ? selected.name : 'Click a neighborhood to explore'}
        </p>
      </div>

      {/* Search bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <SearchBar
          onSelectNeighborhood={(n) => { setSelected(n); setFocusedRestaurant(null) }}
          onSelectRestaurant={(r) => { setFocusedRestaurant(r); setSelected({ name: r.neighborhood, borough: '' }) }}
        />
      </div>

      {/* Profile button */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          to="/profile"
          className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-800/80 transition-colors group"
        >
          <UserCircleIcon className="h-5 w-5 text-eco-green" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute top-16 right-4 bottom-4 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl z-10 flex flex-col overflow-hidden transition-transform duration-300 ${
          selected ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selected && (
          <>
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
                  onClick={() => { setSelected(null); setFocusedRestaurant(null) }}
                  className="text-gray-500 hover:text-white transition-colors ml-3 mt-0.5 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {focusedRestaurant ? (
              <RestaurantDetail
                restaurant={focusedRestaurant}
                onBack={() => setFocusedRestaurant(null)}
              />
            ) : (
              <>
                {/* Category tabs */}
                <div className="flex gap-1 px-4 pt-4 pb-2 border-b border-gray-800">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setCategory(c.key)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors flex-1 text-center ${
                        category === c.key
                          ? 'bg-eco-green text-gray-950'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
                    Top 5 Greenest
                  </p>
                  <div className="space-y-3">
                    {loading && [1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
                    {!loading && error && (
                      <p className="text-xs text-red-400 text-center py-4">{error}</p>
                    )}
                    {!loading && !error && restaurants.map((r, i) => (
                      <RestaurantCard
                        key={r.id}
                        rank={i + 1}
                        restaurant={r}
                        saved={isRestaurantSaved(r.id)}
                        onBookmark={handleBookmark}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
