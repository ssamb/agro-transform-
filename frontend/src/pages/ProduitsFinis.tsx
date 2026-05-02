import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ProduitFiniAI } from '../components/AIHelpers';

function ProduitsFinis() {
  const [produits, setProduits] = useState<any[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    categorie: '',
    unite: 'kg',
  });

  useEffect(() => {
    fetchProduits();
  }, []);

  useEffect(() => {
    let filtered = produits;
    if (searchTerm) {
      filtered = produits.filter(pf =>
        pf.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pf.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProduits(filtered);
  }, [searchTerm, produits]);

  const fetchProduits = async () => {
    try {
      const data = await api.getProduitsFinis();
      setProduits(data);
      setFilteredProduits(data);
    } catch (error) {
      console.error('Erreur de récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pf: any) => {
    setFormData({
      nom: pf.nom,
      categorie: pf.categorie,
      unite: pf.unite,
    });
    setEditingId(pf.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateProduitFini(editingId, formData);
      } else {
        await api.createProduitFini(formData);
      }
      fetchProduits();
      setShowForm(false);
      setEditingId(null);
      setFormData({ nom: '', categorie: '', unite: 'kg' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit fini ?')) {
      try {
        await api.deleteProduitFini(id);
        fetchProduits();
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
          🍞 Produits Finis
        </h2>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Annuler' : 'Nouveau produit fini'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? '✏️ Modifier le produit fini' : '➕ Nouveau produit fini'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ nom: '', categorie: '', unite: 'kg' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Assistant IA */}
          <ProduitFiniAI
            formData={formData}
            setFormData={setFormData}
            existingProduits={produits}
            recettes={[]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                placeholder="ex: Couscous, Farine, Huile..."
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
                <option value="Céréale transformée">Céréale transformée</option>
                <option value="Farine">Farine</option>
                <option value="Huile">Huile</option>
                <option value="Condiment">Condiment</option>
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
      <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-green-900">Recherche & IA - Produits Finis</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit (ex: couscous, farine, huile)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-2 border-green-200 rounded px-3 py-2 focus:border-green-400 focus:outline-none"
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
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">💡 Suggestions:</span>
          <button 
            onClick={() => setSearchTerm('couscous')}
            className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
          >
            🍞 Couscous
          </button>
          <button 
            onClick={() => setSearchTerm('farine')}
            className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
          >
            🌾 Farine
          </button>
          <button 
            onClick={() => setSearchTerm('huile')}
            className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
          >
            🫒 Huile
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          {filteredProduits.length} résultat(s) sur {produits.length} au total
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Chargement...</p>
      ) : filteredProduits.length === 0 ? (
        <p className="text-gray-600">Aucun produit fini trouvé</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProduits.map((pf) => (
            <div key={pf.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{pf.nom}</h3>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pf)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(pf.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{pf.categorie}</p>
              <p className="text-xs text-gray-500 mt-2">Unité: {pf.unite}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProduitsFinis;
