import { Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'
import UserProfile from './components/UserProfile'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
