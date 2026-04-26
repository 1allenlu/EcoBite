import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookmarkIcon,
  PlusIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import MenuUpload from './MenuUpload';
import WateringAvatar from './WateringAvatar';

function calcCarbonSaved(orders) {
  return orders.reduce((sum, order) => {
    if (order.restaurantAvgCarbonScore == null || order.carbon_score_kg_co2e == null) return sum;
    return sum + (order.restaurantAvgCarbonScore - order.carbon_score_kg_co2e);
  }, 0);
}

const LABEL_COLORS = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  'Very High': 'bg-red-100 text-red-800',
};

const UserProfile = () => {
  const { user, savedRestaurants, unsaveRestaurant } = useAuth();
  const [orderedDishes, setOrderedDishes] = useState([]);
  const carbonSaved = calcCarbonSaved(orderedDishes);
  const ecoRestaurantCount = savedRestaurants.filter(r => r.green_score > 50).length;
  const [activeTab, setActiveTab] = useState('saved');
  const [showMenuUpload, setShowMenuUpload] = useState(false);
  const [logOrderRestaurant, setLogOrderRestaurant] = useState(null);

  const handleLogOrder = (order) => {
    setOrderedDishes(prev => [order, ...prev]);
    setLogOrderRestaurant(null);
    setActiveTab('uploads');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Please log in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Map</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.username || 'User'}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex space-x-4 mt-2 text-sm text-gray-500">
              <span>{savedRestaurants.length} Saved Places</span>
              <span>{orderedDishes.length} Orders Logged</span>
              <span className="text-green-600 font-medium">{carbonSaved.toFixed(1)} kg CO₂ saved</span>
            </div>
          </div>
          <button
            onClick={() => setShowMenuUpload(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Scan Menu</span>
          </button>
        </div>
      </div>

      {/* Carbon Impact Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide">Carbon Impact</h2>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-bold text-green-700">{carbonSaved.toFixed(1)}</span>
              <span className="text-lg text-green-600">kg CO₂ saved</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Based on {ecoRestaurantCount} eco-friendly restaurant{ecoRestaurantCount !== 1 ? 's' : ''} saved
              {' '}vs. the average choice
            </p>
            {carbonSaved >= 1 && (
              <p className="text-xs text-green-600 mt-1">
                ≈ {(carbonSaved / 0.12).toFixed(0)} km not driven
              </p>
            )}
          </div>

          {/* Watering Avatar — replaces the 🌱 emoji */}
          <div className="flex-shrink-0 ml-4">
            <WateringAvatar />
          </div>
        </div>

        {/* Progress bar toward next milestone */}
        {(() => {
          const milestones = [0, 5, 10, 25, 50];
          const next = milestones.find(m => m > carbonSaved) ?? milestones[milestones.length - 1];
          const prev = milestones[milestones.indexOf(next) - 1] ?? 0;
          const progress = Math.min(((carbonSaved - prev) / (next - prev)) * 100, 100);
          return (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{prev} kg</span>
                <span>Next milestone: {next} kg CO₂</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BookmarkIcon className="h-5 w-5" />
                <span>Saved Places ({savedRestaurants.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'uploads'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="h-5 w-5" />
                <span>My Orders ({orderedDishes.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'saved' && (
            <SavedRestaurants
              restaurants={savedRestaurants}
              onUnsave={unsaveRestaurant}
              onLogOrder={setLogOrderRestaurant}
            />
          )}
          {activeTab === 'uploads' && <OrderedDishes orders={orderedDishes} />}
        </div>
      </div>

      {showMenuUpload && (
        <MenuUpload
          onClose={() => setShowMenuUpload(false)}
          onMenuUploaded={() => setActiveTab('saved')}
        />
      )}

      {logOrderRestaurant && (
        <LogOrderModal
          restaurant={logOrderRestaurant}
          onClose={() => setLogOrderRestaurant(null)}
          onLog={handleLogOrder}
        />
      )}
    </div>
  );
};

const SavedRestaurants = ({ restaurants, onUnsave, onLogOrder }) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No saved places yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Scan a restaurant menu to save it to your places.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((r) =>
        r.source === 'scan' ? (
          <ScannedRestaurantCard key={r.id} restaurant={r} onUnsave={onUnsave} onLogOrder={onLogOrder} />
        ) : (
          <MapRestaurantCard key={r.id} restaurant={r} onUnsave={onUnsave} onLogOrder={onLogOrder} />
        )
      )}
    </div>
  );
};

const MapRestaurantCard = ({ restaurant, onUnsave, onLogOrder }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
      <span className="text-gray-400 text-sm">Restaurant</span>
    </div>
    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
    <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
    <div className="flex justify-between items-center mt-3">
      <button
        onClick={() => onLogOrder(restaurant)}
        className="text-xs text-green-600 font-medium hover:text-green-700"
      >
        + Log Order
      </button>
      <div className="flex items-center gap-2">
        {restaurant.green_score != null && (
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            restaurant.green_score >= 70 ? 'bg-green-100 text-green-700' :
            restaurant.green_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {restaurant.green_score.toFixed(0)}
          </span>
        )}
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          {restaurant.cuisine || restaurant.neighborhood}
        </span>
        <button onClick={() => onUnsave(restaurant.id)}>
          <BookmarkSolid className="h-5 w-5 text-green-600" />
        </button>
      </div>
    </div>
  </div>
);

const ScannedRestaurantCard = ({ restaurant, onUnsave, onLogOrder }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-gray-900 leading-snug">{restaurant.name}</h3>
      <button onClick={() => onUnsave(restaurant.id)} className="ml-2 flex-shrink-0">
        <BookmarkSolid className="h-5 w-5 text-green-600" />
      </button>
    </div>
    <div className="text-center bg-white rounded-md py-3 mb-3 border border-gray-100">
      <p className="text-2xl font-bold text-gray-900">
        {restaurant.avg_carbon_score}
        <span className="text-xs font-normal text-gray-400 ml-1">kg CO₂e avg</span>
      </p>
      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[restaurant.avg_label]}`}>
        {restaurant.avg_label} Impact
      </span>
    </div>
    {restaurant.top5_dishes?.slice(0, 3).map((dish, i) => (
      <p key={i} className="text-xs text-gray-500 truncate">
        {i + 1}. {dish.dish}
      </p>
    ))}
    <button
      onClick={() => onLogOrder(restaurant)}
      className="mt-3 w-full text-xs text-green-600 font-medium border border-green-200 rounded-md py-1.5 hover:bg-green-50 transition-colors"
    >
      + Log What I Ordered
    </button>
  </div>
);

const LogOrderModal = ({ restaurant, onClose, onLog }) => {
  const [selectedDish, setSelectedDish] = useState(null);
  const [customDish, setCustomDish] = useState('');
  const hasDishes = restaurant.top5_dishes?.length > 0;
  const canSubmit = selectedDish || customDish.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dish = selectedDish || { dish: customDish.trim(), carbon_score_kg_co2e: null, label: null };
    onLog({
      id: Date.now(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantAvgCarbonScore: restaurant.avg_carbon_score ?? null,
      dish: dish.dish,
      carbon_score_kg_co2e: dish.carbon_score_kg_co2e,
      label: dish.label,
      orderedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Log Order</h2>
            <p className="text-sm text-gray-500">{restaurant.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {hasDishes && (
          <>
            <p className="text-sm font-medium text-gray-700 mb-2">Select a dish you ordered:</p>
            <div className="space-y-2 mb-4">
              {restaurant.top5_dishes.map((dish, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDish(dish); setCustomDish(''); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors ${
                    selectedDish?.dish === dish.dish
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm text-gray-900">{dish.dish}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-400 font-mono">{dish.carbon_score_kg_co2e} kg</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${LABEL_COLORS[dish.label]}`}>
                      {dish.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-700 mb-2">Or enter a custom dish:</p>
          </>
        )}

        {!hasDishes && (
          <p className="text-sm font-medium text-gray-700 mb-2">What did you order?</p>
        )}

        <input
          type="text"
          value={customDish}
          onChange={(e) => { setCustomDish(e.target.value); setSelectedDish(null); }}
          placeholder="e.g. Grilled Salmon, Caesar Salad..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50"
          >
            Log Order
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderedDishes = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders logged yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Go to Saved Places and tap "Log What I Ordered" to track your meals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{order.dish}</p>
              <p className="text-sm text-gray-500 mt-0.5">{order.restaurantName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{order.orderedAt}</p>
            </div>
            {order.carbon_score_kg_co2e != null && (
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-lg font-bold text-gray-900">
                  {order.carbon_score_kg_co2e}
                  <span className="text-xs font-normal text-gray-400 ml-1">kg CO₂e</span>
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[order.label]}`}>
                  {order.label}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
