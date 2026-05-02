import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SmartSearch } from '../components/SmartSearch';

interface Stats {
  totalTransformations: number;
  totalMP: number;
  totalPF: number;
  totalPerte: number;
  rendementMoyen: string;
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState<Stats | null>(null);
  const [matieresPremieres, setMatieresPremieres] = useState<any[]>([]);
  const [produitsFinis, setProduitsFinis] = useState<any[]>([]);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'mp' | 'pf' | 'recettes'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filtrage basé sur la recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      setMatieresPremieres(prev => 
        prev.filter(mp => mp.nom.toLowerCase().includes(term) || mp.categorie?.toLowerCase().includes(term))
      );
      setProduitsFinis(prev => 
        prev.filter(pf => pf.nom.toLowerCase().includes(term) || pf.categorie?.toLowerCase().includes(term))
      );
    }
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const [matieres, produits, transfos, statsData] = await Promise.all([
        api.getMatieresPremieres(),
        api.getProduitsFinis(),
        api.getTransformations(),
        api.getStatsProduction(),
      ]);

      setMatieresPremieres(matieres);
      setProduitsFinis(produits);
      setTransformations(transfos);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur de récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockAlert = (stock: number, stockMin: number) => {
    if (stock <= 0) return 'bg-red-100 text-red-800';
    if (stock <= stockMin) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  // Limiter l'affichage à 6 éléments maximum par section
  const displayedMatieres = matieresPremieres.slice(0, 6);
  const displayedProduits = produitsFinis.slice(0, 6);
  const displayedTransformations = transformations.slice(0, 5);

  const handleSmartSearch = (query: string, filters: any) => {
    setSearchTerm(query);
    // Ici on pourrait filtrer intelligemment
  };

  return (
    <div className="space-y-6">
      {/* Barre de recherche intelligente */}
      <div className="bg-white shadow rounded-lg p-4">
        <SmartSearch
          onSearch={handleSmartSearch}
          placeholder="🔍 Recherche intelligente (ex: 'stocks bas', 'couscous', 'rendement > 80%')..."
          className="max-w-3xl mx-auto"
        />
        
        {/* Astuces de recherche */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 justify-center">
          <span className="bg-gray-100 px-2 py-1 rounded">💡 Astuces:</span>
          <button 
            onClick={() => setSearchTerm('stocks bas')}
            className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
          >
            stocks bas
          </button>
          <button 
            onClick={() => setSearchTerm('rendement')}
            className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
          >
            rendement
          </button>
          <button 
            onClick={() => setSearchTerm('mil')}
            className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100"
          >
            mil
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Dashboard
        </h2>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">
            Connecté en tant que : <strong>{user.nom}</strong> ({user.email})
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Rôle : {user.role}
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600">Chargement des données...</p>
        ) : (
          <>
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-900 mb-1">
                  Total Transformations
                </h3>
                <p className="text-3xl font-bold text-purple-700">
                  {stats?.totalTransformations || 0}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  MP Utilisée
                </h3>
                <p className="text-3xl font-bold text-blue-700">
                  {stats?.totalMP ? stats.totalMP.toFixed(2) : '0'} kg
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-1">
                  PF Produit
                </h3>
                <p className="text-3xl font-bold text-green-700">
                  {stats?.totalPF ? stats.totalPF.toFixed(2) : '0'} kg
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-orange-900 mb-1">
                  Rendement Moyen
                </h3>
                <p className="text-3xl font-bold text-orange-700">
                  {stats?.rendementMoyen ? `${stats.rendementMoyen}%` : '0%'}
                </p>
              </div>
            </div>

            {/* Matières premières */}
            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-indigo-900">
                  🌾 Matières Premières
                </h3>
                <div className="flex gap-2">
                  <span className="text-indigo-700 text-sm">
                    {matieresPremieres.length} référence(s)
                  </span>
                  {matieresPremieres.length > 6 && (
                    <Link to="/matieres-premieres" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Voir tout →
                    </Link>
                  )}
                </div>
              </div>
              {displayedMatieres.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedMatieres.map((mp) => (
                    <div key={mp.id} className="bg-white p-3 rounded shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{mp.nom}</p>
                          <p className="text-sm text-gray-600">{mp.categorie}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStockAlert(mp.stock, mp.stockMin)}`}>
                          {mp.stock} {mp.unite}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-indigo-600 text-sm">Aucune matière première</p>
              )}
            </div>

            {/* Produits finis */}
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-green-900">
                  🍞 Produits Finis
                </h3>
                <div className="flex gap-2">
                  <span className="text-green-700 text-sm">
                    {produitsFinis.length} référence(s)
                  </span>
                  {produitsFinis.length > 6 && (
                    <Link to="/produits-finis" className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Voir tout →
                    </Link>
                  )}
                </div>
              </div>
              {displayedProduits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedProduits.map((pf) => (
                    <div key={pf.id} className="bg-white p-3 rounded shadow-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{pf.nom}</p>
                        <p className="text-sm text-gray-600">{pf.categorie}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 text-sm">Aucun produit fini</p>
              )}
            </div>

            {/* Dernières transformations */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-purple-900">
                  ⚙️ Dernières Transformations
                </h3>
                <div className="flex gap-2">
                  <span className="text-purple-700 text-sm">
                    {transformations.length} transformation(s)
                  </span>
                  {transformations.length > 5 && (
                    <Link to="/transformations" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Voir tout →
                    </Link>
                  )}
                </div>
              </div>
              {displayedTransformations.length > 0 ? (
                <div className="space-y-2">
                  {displayedTransformations.map((transfo) => (
                    <div key={transfo.id} className="bg-white p-3 rounded shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transfo.recette?.nom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(transfo.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {transfo.quantitePF} kg
                          </p>
                          <p className="text-xs text-gray-600">
                            MP: {transfo.quantiteMP} kg
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-600 text-sm">Aucune transformation</p>
              )}
            </div>

            {/* Alertes stocks bas */}
            {matieresPremieres.filter(mp => mp.stock <= mp.stockMin).length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  ⚠️ Alertes Stocks Bas
                </h3>
                <div className="space-y-2">
                  {matieresPremieres
                    .filter(mp => mp.stock <= mp.stockMin)
                    .map((mp) => (
                      <div key={mp.id} className="flex justify-between items-center bg-white p-2 rounded">
                        <span className="text-red-800 font-medium">{mp.nom}</span>
                        <span className="text-red-600 text-sm">
                          Stock: {mp.stock} {mp.unite} (Min: {mp.stockMin})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
