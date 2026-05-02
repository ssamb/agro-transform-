import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MatieresPremieres from './pages/MatieresPremieres'
import ProduitsFinis from './pages/ProduitsFinis'
import Recettes from './pages/Recettes'
import Transformations from './pages/Transformations'

function App() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAuthenticated = !!token

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600">
                  AgroTransform
                </Link>
                {isAuthenticated && (
                  <div className="hidden md:flex ml-10 space-x-8">
                    <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                      Dashboard
                    </Link>
                    <Link to="/matieres-premieres" className="text-gray-700 hover:text-indigo-600">
                      Matières premières
                    </Link>
                    <Link to="/produits-finis" className="text-gray-700 hover:text-indigo-600">
                      Produits finis
                    </Link>
                    <Link to="/recettes" className="text-gray-700 hover:text-indigo-600">
                      Recettes
                    </Link>
                    <Link to="/transformations" className="text-gray-700 hover:text-indigo-600">
                      Transformations
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-gray-600">
                      {user.nom} ({user.role})
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-indigo-600"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                      Connexion
                    </Link>
                    <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/matieres-premieres" element={isAuthenticated ? <MatieresPremieres /> : <Navigate to="/login" />} />
            <Route path="/produits-finis" element={isAuthenticated ? <ProduitsFinis /> : <Navigate to="/login" />} />
<Route path="/recettes" element={isAuthenticated ? <Recettes /> : <Navigate to="/login" />} />
<Route path="/transformations" element={isAuthenticated ? <Transformations /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Home() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue sur AgroTransform
        </h1>
        <p className="text-gray-600 mb-6">
          Application de gestion des transformations agroalimentaires
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              🌾 Matières Premières
            </h3>
            <p className="text-indigo-700 text-sm">
              Gérez vos stocks de mil, maïs, arachide, etc.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🍞 Produits Finis
            </h3>
            <p className="text-green-700 text-sm">
              Suivez la production de couscous, farine, huile, etc.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              ⚙️ Transformations
            </h3>
            <p className="text-purple-700 text-sm">
              Enregistrez et suivez toutes vos transformations
            </p>
          </div>
        </div>
        <div className="mt-6">
          {!isAuthenticated && (
            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Commencer
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
