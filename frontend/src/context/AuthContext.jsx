import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    username: 'demo_user',
    email: 'demo@ecobite.com'
  }); // Mock user for demo
  const [loading, setLoading] = useState(false);
  const [savedRestaurants, setSavedRestaurants] = useState([
    {
      id: 1,
      name: "Green Garden Cafe",
      address: "123 Eco St, New York",
      cuisine: "Vegetarian",
      neighborhood: "Tribeca",
      savedAt: "2024-04-20"
    },
    {
      id: 2,
      name: "Sustainable Sushi",
      address: "456 Ocean Ave, New York", 
      cuisine: "Japanese",
      neighborhood: "SoHo",
      savedAt: "2024-04-18"
    }
  ]);

  const login = async (email, password) => {
    // Mock login
    const mockUser = { id: 1, username: 'demo_user', email };
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
  };

  const saveRestaurant = (restaurant) => {
    const newSavedRestaurant = {
      ...restaurant,
      savedAt: new Date().toISOString().split('T')[0]
    };
    setSavedRestaurants(prev => [newSavedRestaurant, ...prev]);
  };

  const unsaveRestaurant = (restaurantId) => {
    setSavedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
  };

  const isRestaurantSaved = (restaurantId) => {
    return savedRestaurants.some(r => r.id === restaurantId);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    setUser,
    savedRestaurants,
    saveRestaurant,
    unsaveRestaurant,
    isRestaurantSaved
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
