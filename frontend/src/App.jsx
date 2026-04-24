import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="flex items-center justify-center h-screen text-2xl font-bold text-eco-green">EcoBite 🌿</div>} />
    </Routes>
  )
}

export default App
