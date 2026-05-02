import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ConfirmModal } from '../components';
import { RecetteAI } from '../components/AIHelpers';

function Recettes() {
  const [recettes, setRecettes] = useState<any[]>([]);
  const [filteredRecettes, setFilteredRecettes] = useState<any[]>([]);
  const [matieresPremieres, setMatieresPremieres] = useState<any[]>([]);
  const [produitsFinis, setProduitsFinis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    rendementPercent: 0,
    pertePercent: 0,
    matierePremiereId: '',
    produitFiniId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = recettes;

    if (searchTerm) {
      filtered = filtered.filter(recette =>
        recette.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recette.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recette.matierePremiere?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recette.produitFini?.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecettes(filtered);
  }, [searchTerm, recettes]);

  const fetchData = async () => {
    try {
      const [recettesData, matieresData, produitsData] = await Promise.all([
        api.getRecettes(),
        api.getMatieresPremieres(),
        api.getProduitsFinis(),
      ]);
      setRecettes(recettesData);
      setMatieresPremieres(matieresData);
      setProduitsFinis(produitsData);
    } catch (error) {
      console.error('Erreur de récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (editingId) {
        await api.updateRecette(editingId, formData);
      } else {
        await api.createRecette({
          ...formData,
          userId: user.id,
          etapes: [],
        });
      }
      fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ nom: '', description: '', rendementPercent: 0, pertePercent: 0, matierePremiereId: '', produitFiniId: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (recette: any) => {
    setFormData({
      nom: recette.nom,
      description: recette.description || '',
      rendementPercent: recette.rendementPercent,
      pertePercent: recette.pertePercent,
      matierePremiereId: recette.matierePremiereId,
      produitFiniId: recette.produitFiniId,
    });
    setEditingId(recette.id);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedId) {
      try {
        await api.deleteRecette(selectedId);
        fetchData();
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
          ⚙️ Recettes de Transformation
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Annuler' : 'Nouvelle recette'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? '✏️ Modifier la recette' : '✨ IA: Créez votre recette'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ nom: '', description: '', rendementPercent: 0, pertePercent: 0, matierePremiereId: '', produitFiniId: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Assistant IA */}
          <RecetteAI
            formData={formData}
            setFormData={setFormData}
            matieresPremieres={matieresPremieres}
            produitsFinis={produitsFinis}
            existingRecettes={recettes}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la recette *</label>
              <input
                type="text"
                placeholder="ex: Couscous traditionnel, Farine de maïs..."
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Description du processus de transformation..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière première *</label>
              <select
                value={formData.matierePremiereId}
                onChange={(e) => setFormData({ ...formData, matierePremiereId: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Sélectionner une matière première</option>
                {matieresPremieres.map((mp) => (
                  <option key={mp.id} value={mp.id}>{mp.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produit fini *</label>
              <select
                value={formData.produitFiniId}
                onChange={(e) => setFormData({ ...formData, produitFiniId: e.target.value })}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Sélectionner un produit fini</option>
                {produitsFinis.map((pf) => (
                  <option key={pf.id} value={pf.id}>{pf.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rendement théorique (%) *</label>
              <input
                type="number"
                placeholder="ex: 85"
                value={formData.rendementPercent}
                onChange={(e) => setFormData({ ...formData, rendementPercent: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
                step="0.1"
                min="0"
                max="100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Pourcentage de la matière première transformée en produit fini</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perte (%)</label>
              <input
                type="number"
                placeholder="ex: 5"
                value={formData.pertePercent}
                onChange={(e) => setFormData({ ...formData, pertePercent: parseFloat(e.target.value) || 0 })}
                className="border rounded px-3 py-2 w-full"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">Pourcentage de perte pendant la transformation</p>
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

      {showDeleteModal && (
        <ConfirmModal
          title="Supprimer la recette"
          message="Êtes-vous sûr de vouloir supprimer cette recette ?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedId(null);
          }}
        />
      )}

      {/* Barre de recherche intelligente */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-purple-900">Recherche & IA - Recettes</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="🔍 Rechercher (ex: couscous, mil, rendement)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-2 border-purple-200 rounded px-3 py-2 focus:border-purple-400 focus:outline-none"
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
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">💡 Suggestions:</span>
          <button 
            onClick={() => setSearchTerm('couscous')}
            className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded hover:bg-purple-50 transition-colors"
          >
            🍲 Couscous
          </button>
          <button 
            onClick={() => setSearchTerm('farine')}
            className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded hover:bg-purple-50 transition-colors"
          >
            🌾 Farine
          </button>
          <button 
            onClick={() => setSearchTerm('huile')}
            className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded hover:bg-purple-50 transition-colors"
          >
            🫒 Huile
          </button>
          <button 
            onClick={() => setSearchTerm('rendement')}
            className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded hover:bg-purple-50 transition-colors"
          >
            📊 Haut rendement
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {filteredRecettes.length} résultat(s) sur {recettes.length} au total
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : filteredRecettes.length === 0 ? (
        <p className="text-gray-600">Aucune recette trouvée</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecettes.map((recette) => (
            <div key={recette.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{recette.nom}</h3>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recette)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(recette.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              {recette.description && (
                <p className="text-sm text-gray-600 mb-2">{recette.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Matière première:</span>
                  <p className="font-medium">{recette.matierePremiere?.nom}</p>
                </div>
                <div>
                  <span className="text-gray-500">Produit fini:</span>
                  <p className="font-medium">{recette.produitFini?.nom}</p>
                </div>
                <div>
                  <span className="text-gray-500">Rendement:</span>
                  <p className="font-medium text-green-600">{recette.rendementPercent}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Perte:</span>
                  <p className="font-medium text-orange-600">{recette.pertePercent}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recettes;
