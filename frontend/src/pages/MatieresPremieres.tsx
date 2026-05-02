import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ConfirmModal } from '../components';
import { MatierePremiereAI } from '../components/AIHelpers';

function MatieresPremieres() {
  const [matieres, setMatieres] = useState<any[]>([]);
  const [filteredMatieres, setFilteredMatieres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    unite: 'kg',
    stock: 0,
    stockMin: 0,
    stockMax: 0,
  });

  const categories = ['Céréale', 'Légumineuse', 'Oléagineux', 'Tubercule', 'Autre'];

  useEffect(() => {
    fetchMatieres();
  }, []);

  useEffect(() => {
    let filtered = matieres;

    if (searchTerm) {
      filtered = filtered.filter(mp =>
        mp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mp.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategorie) {
      filtered = filtered.filter(mp => mp.categorie === filterCategorie);
    }

    setFilteredMatieres(filtered);
  }, [searchTerm, filterCategorie, matieres]);

  const fetchMatieres = async () => {
    try {
      const data = await api.getMatieresPremieres();
      setMatieres(data);
      setFilteredMatieres(data);
    } catch (error) {
      console.error('Erreur de récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateMatierePremiere(editingId, formData);
      } else {
        await api.createMatierePremiere(formData);
      }
      fetchMatieres();
      setShowForm(false);
      setEditingId(null);
      setFormData({ nom: '', categorie: '', unite: 'kg', stock: 0, stockMin: 0, stockMax: 0 });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (mp: any) => {
    setFormData({
      nom: mp.nom,
      categorie: mp.categorie,
      unite: mp.unite,
      stock: mp.stock,
      stockMin: mp.stockMin,
      stockMax: mp.stockMax,
    });
    setEditingId(mp.id);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedId) {
      try {
        await api.deleteMatierePremiere(selectedId);
        fetchMatieres();
        setShowDeleteModal(false);
        setSelectedId(null);
      } catch (error) {
        console.error('Erreur de suppression:', error);
      }
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = ['ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'].includes(user.role);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🌾 Matières Premières
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Annuler' : 'Nouvelle matière première'}
          </button>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmModal
          title="Supprimer une matière première"
          message="Êtes-vous sûr de vouloir supprimer cette matière première ?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
        />
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? '✏️ Modifier la matière première' : '➕ Nouvelle matière première'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ nom: '', categorie: '', unite: 'kg', stock: 0, stockMin: 0, stockMax: 0 });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Assistant IA */}
          <MatierePremiereAI
            formData={formData}
            setFormData={setFormData}
            existingMatieres={matieres}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                placeholder="ex: Mil, Maïs, Arachide..."
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Céréale">Céréale</option>
                <option value="Légumineuse">Légumineuse</option>
                <option value="Oléagineux">Oléagineux</option>
                <option value="Tubercule">Tubercule</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité *</label>
              <select
                value={formData.unite}
                onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="kg">kg (Kilogramme)</option>
                <option value="g">g (Gramme)</option>
                <option value="L">L (Litre)</option>
                <option value="unité">unité</option>
                <option value="sac">sac</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
              <input
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock minimum</label>
              <input
                type="number"
                placeholder="0"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock maximum</label>
              <input
                type="number"
                placeholder="0"
                value={formData.stockMax}
                onChange={(e) => setFormData({ ...formData, stockMax: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
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

      {/* Barre de recherche intelligente */}
      <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-indigo-900">Recherche & IA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="Nom ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 border-indigo-200 rounded px-3 py-2 w-full focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par catégorie</label>
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              className="border-2 border-indigo-200 rounded px-3 py-2 w-full focus:border-indigo-400 focus:outline-none"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategorie('');
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => {
                setSearchTerm('stocks bas');
                setFilterCategorie('');
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              ✨ IA: Stocks bas
            </button>
          </div>
        </div>
        
        {/* Suggestions IA */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">💡 Suggestions:</span>
          <button 
            onClick={() => setSearchTerm('mil')}
            className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            🌾 Mil
          </button>
          <button 
            onClick={() => setSearchTerm('maïs')}
            className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            🌽 Maïs
          </button>
          <button 
            onClick={() => setSearchTerm('céréale')}
            className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
          >
            📦 Céréales
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {filteredMatieres.length} résultat(s) sur {matieres.length} au total
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : filteredMatieres.length === 0 ? (
        <p className="text-gray-600">Aucune matière première trouvée</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatieres.map((mp) => (
            <div key={mp.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{mp.nom}</h3>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(mp)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(mp.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{mp.categorie}</p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  mp.stock <= 0 ? 'bg-red-100 text-red-800' :
                  mp.stock <= mp.stockMin ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {mp.stock} {mp.unite}
                </span>
                <span className="text-xs text-gray-500">
                  Min: {mp.stockMin} | Max: {mp.stockMax}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatieresPremieres;
