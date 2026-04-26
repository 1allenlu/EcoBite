import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookmarkIcon, CameraIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import MenuUpload from './MenuUpload';

const UserProfile = () => {
  const { user, savedRestaurants } = useAuth();
  const [uploadedMenus, setUploadedMenus] = useState([]);
  const [activeTab, setActiveTab] = useState('saved');
  const [showMenuUpload, setShowMenuUpload] = useState(false);

  // Mock uploaded menus data
  useEffect(() => {
    setUploadedMenus([
      {
        id: 1,
        title: "Quinoa Buddha Bowl",
        description: "Healthy quinoa bowl with fresh vegetables",
        restaurant: "Green Garden Cafe",
        price: 15.99,
        category: "main",
        uploadedAt: "2024-04-19"
      }
    ]);
  }, []);

  const handleMenuUploaded = (newMenu) => {
    setUploadedMenus(prev => [newMenu, ...prev]);
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
      {/* Back to Map Button */}
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
              <span>{savedRestaurants.length} Saved Restaurants</span>
              <span>{uploadedMenus.length} Menu Uploads</span>
            </div>
          </div>
          <button
            onClick={() => setShowMenuUpload(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Upload Menu</span>
          </button>
        </div>
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
                <CameraIcon className="h-5 w-5" />
                <span>My Uploads ({uploadedMenus.length})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'saved' && <SavedRestaurants restaurants={savedRestaurants} />}
          {activeTab === 'uploads' && <UploadedMenus menus={uploadedMenus} />}
        </div>
      </div>

      {showMenuUpload && (
        <MenuUpload
          onClose={() => setShowMenuUpload(false)}
          onMenuUploaded={handleMenuUploaded}
        />
      )}
    </div>
  );
};

const SavedRestaurants = ({ restaurants }) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No saved restaurants</h3>
        <p className="mt-1 text-sm text-gray-500">Start exploring and save your favorite places!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
            <span className="text-gray-400">Restaurant Image</span>
          </div>
          <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {restaurant.cuisine}
            </span>
            <BookmarkSolid className="h-5 w-5 text-green-600" />
          </div>
        </div>
      ))}
    </div>
  );
};

const UploadedMenus = ({ menus }) => {
  if (menus.length === 0) {
    return (
      <div className="text-center py-8">
        <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No menu uploads yet</h3>
        <p className="mt-1 text-sm text-gray-500">Share your favorite dishes with the community!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menus.map((menu) => (
        <div key={menu.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
            <span className="text-gray-400">Dish Image</span>
          </div>
          <h3 className="font-semibold text-gray-900">{menu.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
          <p className="text-xs text-gray-500 mt-1">{menu.restaurant}</p>
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm font-medium text-green-600">${menu.price}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
              {menu.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
