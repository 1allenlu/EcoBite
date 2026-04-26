import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookmarkIcon,
  PlusIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  TrophyIcon,
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
  Low:        'bg-eco-green/20 text-eco-green',
  Medium:     'bg-eco-yellow/20 text-eco-yellow',
  High:       'bg-orange-500/20 text-orange-400',
  'Very High':'bg-eco-red/20 text-eco-red',
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">

        {/* Back link */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Map
          </Link>
        </div>

        {/* Profile header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-eco-green/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-eco-green text-2xl font-bold">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{user.username || 'User'}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                <span>{savedRestaurants.length} Saved</span>
                <span>{orderedDishes.length} Orders Logged</span>
                <span className="text-eco-green font-medium">{carbonSaved.toFixed(1)} kg CO₂ saved</span>
              </div>
            </div>
            <button
              onClick={() => setShowMenuUpload(true)}
              className="flex items-center gap-2 bg-eco-green text-gray-950 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-400 transition-colors shrink-0"
            >
              <PlusIcon className="h-4 w-4" />
              Scan Menu
            </button>
          </div>
        </div>

        {/* Carbon impact card */}
        <div className="bg-eco-green/10 border border-eco-green/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xs font-semibold text-eco-green uppercase tracking-widest">Carbon Impact</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-eco-green">{carbonSaved.toFixed(1)}</span>
                <span className="text-base text-eco-green/70">kg CO₂ saved</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Based on {ecoRestaurantCount} eco-friendly restaurant{ecoRestaurantCount !== 1 ? 's' : ''} saved vs. the average choice
              </p>
              {carbonSaved >= 1 && (
                <p className="text-xs text-eco-green/70 mt-1">
                  ≈ {(carbonSaved / 0.12).toFixed(0)} km not driven
                </p>
              )}
            </div>
            <div className="shrink-0 ml-4">
              <WateringAvatar carbonSaved={carbonSaved} />
            </div>
          </div>

          {/* Progress bar */}
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
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-eco-green h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Tabs + content */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-eco-green text-eco-green'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <BookmarkIcon className="h-4 w-4" />
              Saved Places ({savedRestaurants.length})
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'uploads'
                  ? 'border-eco-green text-eco-green'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ClipboardDocumentListIcon className="h-4 w-4" />
              My Orders ({orderedDishes.length})
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'leaderboard'
                  ? 'border-eco-green text-eco-green'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <TrophyIcon className="h-4 w-4" />
              Leaderboard
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'saved' && (
              <SavedRestaurants restaurants={savedRestaurants} onUnsave={unsaveRestaurant} onLogOrder={setLogOrderRestaurant} />
            )}
            {activeTab === 'uploads' && <OrderedDishes orders={orderedDishes} />}
            {activeTab === 'leaderboard' && (
              <Leaderboard carbonSaved={carbonSaved} username={user.username} />
            )}
          </div>
        </div>
      </div>

      {showMenuUpload && (
        <MenuUpload onClose={() => setShowMenuUpload(false)} onMenuUploaded={() => setActiveTab('saved')} />
      )}
      {logOrderRestaurant && (
        <LogOrderModal restaurant={logOrderRestaurant} onClose={() => setLogOrderRestaurant(null)} onLog={handleLogOrder} />
      )}
    </div>
  );
};

const FAKE_USERS = [
  { name: 'Maya C.',    kg: 48.3 },
  { name: 'Jordan S.', kg: 41.7 },
  { name: 'Priya P.',  kg: 38.2 },
  { name: 'Alex K.',   kg: 31.5 },
  { name: 'Sam R.',    kg: 27.8 },
  { name: 'Taylor J.', kg: 22.4 },
  { name: 'Morgan L.', kg: 18.9 },
  { name: 'Casey B.',  kg: 14.3 },
  { name: 'Riley D.',  kg: 9.7  },
  { name: 'Avery W.',  kg: 4.2  },
]

const Leaderboard = ({ carbonSaved, username }) => {
  const me = { name: username || 'You', kg: carbonSaved, isMe: true }
  const all = [...FAKE_USERS.map(u => ({ ...u, isMe: false })), me]
    .sort((a, b) => b.kg - a.kg)

  const myRank = all.findIndex(u => u.isMe) + 1

  const medal = { 1: '🌳', 2: '🪴', 3: '🌱' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">CO₂ Saved Rankings</p>
        <span className="text-xs text-gray-500">Your rank: <span className="text-eco-green font-bold">#{myRank}</span></span>
      </div>

      <div className="space-y-2">
        {all.map((entry, i) => {
          const rank = i + 1
          const isTop3 = rank <= 3
          return (
            <div
              key={entry.name}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                entry.isMe
                  ? 'bg-eco-green/10 border-eco-green/40'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              <div className="w-7 text-center shrink-0">
                {isTop3
                  ? <span className="text-base">{medal[rank]}</span>
                  : <span className="text-xs text-gray-500 font-medium">#{rank}</span>
                }
              </div>
              <p className={`flex-1 text-sm font-medium ${entry.isMe ? 'text-eco-green' : 'text-white'}`}>
                {entry.name} {entry.isMe && <span className="text-xs text-gray-400 font-normal">(you)</span>}
              </p>
              <span className={`text-sm font-bold ${entry.isMe ? 'text-eco-green' : 'text-gray-300'}`}>
                {entry.kg.toFixed(1)} kg
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SavedRestaurants = ({ restaurants, onUnsave, onLogOrder }) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <BookmarkIcon className="mx-auto h-10 w-10 text-gray-600" />
        <p className="mt-3 text-sm text-gray-400">No saved places yet</p>
        <p className="text-xs text-gray-600 mt-1">Bookmark restaurants from the map to save them here.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
    <div className="flex items-start justify-between gap-2 mb-2">
      <h3 className="font-semibold text-white text-sm leading-tight">{restaurant.name}</h3>
      <button onClick={() => onUnsave(restaurant.id)} className="shrink-0">
        <BookmarkSolid className="h-5 w-5 text-eco-green" />
      </button>
    </div>
    <p className="text-xs text-gray-400 mb-3">{restaurant.address}</p>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {restaurant.green_score != null && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            restaurant.green_score >= 70 ? 'bg-eco-green/20 text-eco-green' :
            restaurant.green_score >= 50 ? 'bg-eco-yellow/20 text-eco-yellow' :
            'bg-eco-red/20 text-eco-red'
          }`}>
            {restaurant.green_score.toFixed(0)}
          </span>
        )}
        <span className="text-xs bg-eco-green/10 text-eco-green px-2 py-0.5 rounded-full">
          {restaurant.cuisine || restaurant.neighborhood}
        </span>
      </div>
      <button onClick={() => onLogOrder(restaurant)} className="text-xs text-gray-400 hover:text-eco-green transition-colors font-medium">
        + Log Order
      </button>
    </div>
  </div>
);

const ScannedRestaurantCard = ({ restaurant, onUnsave, onLogOrder }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-white text-sm leading-snug">{restaurant.name}</h3>
      <button onClick={() => onUnsave(restaurant.id)} className="ml-2 shrink-0">
        <BookmarkSolid className="h-5 w-5 text-eco-green" />
      </button>
    </div>
    <div className="text-center bg-gray-900 rounded-xl py-3 mb-3 border border-gray-700">
      <p className="text-2xl font-bold text-white">
        {restaurant.avg_carbon_score}
        <span className="text-xs font-normal text-gray-500 ml-1">kg CO₂e avg</span>
      </p>
      <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[restaurant.avg_label]}`}>
        {restaurant.avg_label} Impact
      </span>
    </div>
    {restaurant.top5_dishes?.slice(0, 3).map((dish, i) => (
      <p key={i} className="text-xs text-gray-500 truncate">{i + 1}. {dish.dish}</p>
    ))}
    <button
      onClick={() => onLogOrder(restaurant)}
      className="mt-3 w-full text-xs text-eco-green font-medium border border-gray-700 rounded-lg py-2 hover:bg-gray-700 transition-colors"
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Log Order</h2>
            <p className="text-xs text-gray-400 mt-0.5">{restaurant.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {hasDishes && (
          <>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Select a dish</p>
            <div className="space-y-2 mb-4">
              {restaurant.top5_dishes.map((dish, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDish(dish); setCustomDish(''); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    selectedDish?.dish === dish.dish
                      ? 'border-eco-green bg-eco-green/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span className="text-sm text-white">{dish.dish}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-xs text-gray-500 font-mono">{dish.carbon_score_kg_co2e} kg</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${LABEL_COLORS[dish.label]}`}>
                      {dish.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Or type a dish</p>
          </>
        )}
        {!hasDishes && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">What did you order?</p>
        )}

        <input
          type="text"
          value={customDish}
          onChange={(e) => { setCustomDish(e.target.value); setSelectedDish(null); }}
          placeholder="e.g. Grilled Salmon, Caesar Salad…"
          className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-eco-green"
        />

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-700 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 px-4 py-2.5 bg-eco-green text-gray-950 rounded-xl text-sm font-semibold hover:bg-green-400 transition-colors disabled:opacity-40"
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
      <div className="text-center py-12">
        <ClipboardDocumentListIcon className="mx-auto h-10 w-10 text-gray-600" />
        <p className="mt-3 text-sm text-gray-400">No orders logged yet</p>
        <p className="text-xs text-gray-600 mt-1">Go to Saved Places and tap "Log What I Ordered".</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm">{order.dish}</p>
              <p className="text-xs text-gray-400 mt-0.5">{order.restaurantName}</p>
              <p className="text-xs text-gray-600 mt-0.5">{order.orderedAt}</p>
            </div>
            {order.carbon_score_kg_co2e != null && (
              <div className="text-right shrink-0 ml-4">
                <p className="text-lg font-bold text-white">
                  {order.carbon_score_kg_co2e}
                  <span className="text-xs font-normal text-gray-500 ml-1">kg CO₂e</span>
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
