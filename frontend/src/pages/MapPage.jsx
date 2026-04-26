import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCircleIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../context/AuthContext'
import NeighborhoodMap from '../components/NeighborhoodMap'

export default function MapPage() {
  const [selected, setSelected] = useState(null)
  const { saveRestaurant, unsaveRestaurant, isRestaurantSaved } = useAuth()

  // Mock restaurant data for each neighborhood
  const getRestaurantsForNeighborhood = (neighborhood) => {
    const allRestaurants = [
      { id: 1, name: "Green Garden Cafe", address: "123 Eco St", cuisine: "Vegetarian", rating: 4.8, neighborhood: "Mission" },
      { id: 2, name: "Sustainable Sushi", address: "456 Ocean Ave", cuisine: "Japanese", rating: 4.6, neighborhood: "Castro" },
      { id: 3, name: "Farm Fresh Bistro", address: "789 Organic Way", cuisine: "Farm-to-Table", rating: 4.9, neighborhood: "Mission" },
      { id: 4, name: "Zero Waste Kitchen", address: "321 Green St", cuisine: "American", rating: 4.7, neighborhood: "Castro" },
      { id: 5, name: "Plant Power Cafe", address: "654 Vegan Ave", cuisine: "Vegan", rating: 4.5, neighborhood: "Mission" }
    ]
    
    return allRestaurants
      .filter(r => r.neighborhood === neighborhood?.name)
      .slice(0, 5)
  }

  const restaurants = selected ? getRestaurantsForNeighborhood(selected) : []

  const handleSaveToggle = (restaurant) => {
    if (isRestaurantSaved(restaurant.id)) {
      unsaveRestaurant(restaurant.id)
    } else {
      saveRestaurant(restaurant)
    }
  }

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

      {/* User Profile Button */}
      <div className="absolute top-4 right-4 z-10">
        <Link 
          to="/profile"
          className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-800/80 transition-all duration-200 group"
        >
          <UserCircleIcon className="h-5 w-5 text-eco-green group-hover:text-green-400" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
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

            {/* Restaurant list */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
                Top {restaurants.length} Greenest Restaurants
              </p>

              <div className="space-y-3">
                {restaurants.map((restaurant, i) => (
                  <div key={restaurant.id} className="bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-eco-green/20 flex items-center justify-center text-eco-green text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-sm">{restaurant.name}</h3>
                            <p className="text-gray-400 text-xs">{restaurant.address}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                {restaurant.cuisine}
                              </span>
                              <span className="text-xs text-eco-green">★ {restaurant.rating}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveToggle(restaurant)}
                            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                            title={isRestaurantSaved(restaurant.id) ? 'Remove from saved' : 'Save restaurant'}
                          >
                            {isRestaurantSaved(restaurant.id) ? (
                              <BookmarkSolid className="h-5 w-5 text-eco-green" />
                            ) : (
                              <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-eco-green" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {restaurants.length === 0 && (
                <p className="text-xs text-gray-600 text-center mt-6">
                  No restaurants found in this area
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
