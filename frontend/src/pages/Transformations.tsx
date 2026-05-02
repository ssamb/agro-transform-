import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TransformationAI } from '../components/AIHelpers';

function Transformations() {
  const [transformations, setTransformations] = useState<any[]>([]);
  const [filteredTransformations, setFilteredTransformations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [recettes, setRecettes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    recetteId: '',
    quantiteMP: 0,
    quantitePF: 0,
    observations: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = transformations;

    if (searchTerm) {
      filtered = filtered.filter(transfo =>
        transfo.recette?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfo.observations?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransformations(filtered);
    setCurrentPage(1);
  }, [searchTerm, transformations]);

  const fetchData = async () => {
    try {
      const [transfosData, statsData, recettesData] = await Promise.all([
        api.getTransformations(),
        api.getStatsProduction(),
        api.getRecettes(),
      ]);
      setTransformations(transfosData);
      setStats(statsData);
      setRecettes(recettesData);
    } catch (error) {
      console.error('Erreur de récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transfo: any) => {
    setFormData({
      recetteId: transfo.recetteId,
      quantiteMP: transfo.quantiteMP,
      quantitePF: transfo.quantitePF,
      observations: transfo.observations || '',
    });
    setEditingId(transfo.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (editingId) {
        await api.update(editingId, formData);
      } else {
        await api.createTransformation({
          ...formData,
          userId: user.id,
        });
      }
      fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ recetteId: '', quantiteMP: 0, quantitePF: 0, observations: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = ['ADMIN', 'TRANSFORMATEUR'].includes(user.role);

  const totalPages = Math.ceil(filteredTransformations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransformations = filteredTransformations.slice(startIndex, endIndex);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          ⚙️ Transformations
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Annuler' : 'Nouvelle transformation'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? '✏️ Modifier la transformation' : '✨ IA: Nouvelle transformation'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ recetteId: '', quantiteMP: 0, quantitePF: 0, observations: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Assistant IA */}
          <TransformationAI
            formData={formData}
            setFormData={setFormData}
            recettes={recettes}
            transformations={transformations}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Recette *</label>
              <select
                value={formData.recetteId}
                onChange={(e) => setFormData({ ...formData, recetteId: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Sélectionner une recette</option>
                {recettes.map((recette) => (
                  <option key={recette.id} value={recette.id}>{recette.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité de matière première (kg) *</label>
              <input
                type="number"
                placeholder="ex: 50"
                value={formData.quantiteMP}
                onChange={(e) => setFormData({ ...formData, quantiteMP: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
                step="0.1"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité de produit fini (kg) *</label>
              <input
                type="number"
                placeholder="ex: 42.5"
                value={formData.quantitePF}
                onChange={(e) => setFormData({ ...formData, quantitePF: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
                step="0.1"
                min="0"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
              <textarea
                placeholder="Notes sur la transformation (qualité, incident, etc.)"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                rows={2}
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Enregistrer
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700">Total</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalTransformations}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">MP Utilisée</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalMP?.toFixed(2) || 0} kg</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">PF Produit</p>
                <p className="text-2xl font-bold text-green-900">{stats.totalPF?.toFixed(2) || 0} kg</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-700">Rendement</p>
                <p className="text-2xl font-bold text-orange-900">{stats.rendementMoyen || 0}%</p>
              </div>
            </div>
          )}

      {/* Barre de recherche intelligente */}
      <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border-2 border-orange-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-orange-900">Recherche & IA - Transformations</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="🔍 Rechercher (ex: couscous, récent, observations)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-2 border-orange-200 rounded px-3 py-2 focus:border-orange-400 focus:outline-none"
          />
          <button
            onClick={() => setSearchTerm('')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Effacer
          </button>
        </div>
        
        {/* Suggestions IA */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">💡 Suggestions:</span>
          <button 
            onClick={() => setSearchTerm('couscous')}
            className="bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded hover:bg-orange-50 transition-colors"
          >
            🍲 Couscous
          </button>
          <button 
            onClick={() => setSearchTerm('farine')}
            className="bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded hover:bg-orange-50 transition-colors"
          >
            🌾 Farine
          </button>
          <button 
            onClick={() => setSearchTerm('récent')}
            className="bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded hover:bg-orange-50 transition-colors"
          >
            🕒 Récent
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {filteredTransformations.length} résultat(s) sur {transformations.length} au total
        </div>
      </div>

          {filteredTransformations.length === 0 ? (
            <p className="text-gray-600">Aucune transformation trouvée</p>
          ) : (
            <>
              <div className="space-y-3">
                {currentTransformations.map((transfo) => (
                <div key={transfo.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{transfo.recette?.nom}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(transfo.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transfo.observations && (
                        <p className="text-sm text-gray-600 mt-1">{transfo.observations}</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(transfo)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Modifier"
                        >
                          ✏️ Modifier
                        </button>
                      )}
                      <p className="text-lg font-semibold text-green-600">
                        {transfo.quantitePF} kg
                      </p>
                      <p className="text-sm text-gray-600">
                        MP: {transfo.quantiteMP} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        Perte: {transfo.perteReelle?.toFixed(2)} kg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                  >
                    Précédent
                  </button>
                  <span className="text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Transformations;
