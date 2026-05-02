import { useState, useEffect } from 'react';

interface ProduitFiniAIProps {
  formData: any;
  setFormData: (data: any) => void;
  existingProduits: any[];
  recettes: any[];
}

export function ProduitFiniAI({ formData, setFormData, existingProduits, recettes }: ProduitFiniAIProps) {
  const [aiMessage, setAiMessage] = useState('');
  const [marketTrends, setMarketTrends] = useState({
    demand: 'high',
    price: 0,
    competition: 'medium',
  });

  useEffect(() => {
    if (formData.nom) {
      analyzeProduct();
    }
  }, [formData.nom, formData.categorie]);

  const analyzeProduct = () => {
    const nom = formData.nom.toLowerCase();
    
    // Analyse de marché (contexte Sénégal)
    if (nom.includes('couscous')) {
      setMarketTrends({ demand: 'high', price: 800, competition: 'high' });
      setAiMessage('🇸🇳 Couscous: Forte demande (mariages, fêtes). Prix: 700-900 FCFA/kg. Concurrence: Marchés (Sandaga, Tilène). Astuce: Emballage 1kg = +200 FCFA');
    } else if (nom.includes('farine') && nom.includes('maïs')) {
      setMarketTrends({ demand: 'high', price: 600, competition: 'medium' });
      setAiMessage('🇸🇳 Farine de maïs: Demande urbaine (Dakar, Thiès). Prix: 500-700 FCFA/kg. Concurrence: Moulins modernes. Astuce: Farine tamisée = +100 FCFA');
    } else if (nom.includes('huile') && nom.includes('arachide')) {
      setMarketTrends({ demand: 'high', price: 1100, competition: 'medium' });
      setAiMessage('🇸🇳 Huile d\'arachide locale: Forte demande (marchés, boutiques). Prix: 1000-1200 FCFA/L (vrac). Concurrence: Huiles importées. Astuce: Bouteille 1.5L = 1800 FCFA, 5L = 5500 FCFA');
    } else if (nom.includes('beignet') || nom.includes('accara')) {
      setMarketTrends({ demand: 'high', price: 50, competition: 'medium' });
      setAiMessage('🇸🇳 Accra/Beignet niébé: Vente rapide (matin, soir). Prix: 50 FCFA/pièce. Marge: 70%. Astuce: Sachet 10 = 500 FCFA');
    } else if (nom.includes('bouillie')) {
      setMarketTrends({ demand: 'high', price: 100, competition: 'low' });
      setAiMessage('🇸🇳 Bouillie (mil, maïs): Petit-déjeuner. Prix: 100 FCFA le litre. Fabrication: 5h matin. Astuce: Abonnement semaine = 600 FCFA');
    } else {
      setMarketTrends({ demand: 'medium', price: 1000, competition: 'medium' });
      setAiMessage('🇸🇳 Produit standard. Prix selon qualité. Astuce: Marché Sandaga (Dakar) = références prix. Export: Gambie, Mauritanie');
    }
  };

  // Vérifier produits similaires
  const similarProducts = existingProduits.filter(item => 
    item.nom.toLowerCase().includes(formData.nom.toLowerCase()) ||
    formData.nom.toLowerCase().includes(item.nom.toLowerCase())
  );

  // Calculer la demande basée sur les recettes
  const relatedRecipes = recettes.filter(recette => 
    recette.produitFiniId && 
    (recette.produitFini?.nom?.toLowerCase().includes(formData.nom.toLowerCase()) ||
     formData.nom.toLowerCase().includes(recette.produitFini?.nom?.toLowerCase()))
  );

  const applySuggestions = () => {
    if (!formData.categorie) {
      const nom = formData.nom.toLowerCase();
      if (nom.includes('farine')) {
        setFormData({ ...formData, categorie: 'Farine', unite: 'kg' });
      } else if (nom.includes('huile')) {
        setFormData({ ...formData, categorie: 'Huile', unite: 'L' });
      } else if (nom.includes('couscous')) {
        setFormData({ ...formData, categorie: 'Céréale transformée', unite: 'kg' });
      }
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🤖</span>
        <h4 className="font-semibold text-indigo-900">Assistant IA - Produit Fini</h4>
      </div>

      {similarProducts.length > 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
          <p className="text-yellow-800 text-sm font-medium">⚠️ Produits similaires existants:</p>
          <ul className="mt-2 space-y-1">
            {similarProducts.map(item => (
              <li key={item.id} className="text-yellow-700 text-sm">
                • {item.nom} - {item.categorie} ({item.unite})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
          <p className="text-green-800 text-sm font-medium">✅ Nouveau produit unique</p>
          <p className="text-green-600 text-xs mt-1">
            Opportunité de créer un nouveau marché !
          </p>
        </div>
      )}

      <div className="bg-white rounded p-3 mb-3">
        <p className="text-indigo-800 text-sm mb-3">{aiMessage}</p>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Demande:</span>
            <p className={`text-lg font-semibold ${
              marketTrends.demand === 'high' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {marketTrends.demand === 'high' ? '📈 Élevée' : '📊 Moyenne'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Prix moyen:</span>
            <p className="text-lg font-semibold text-blue-600">{marketTrends.price}k FCFA</p>
          </div>
          <div>
            <span className="text-gray-600">Concurrence:</span>
            <p className={`text-lg font-semibold ${
              marketTrends.competition === 'high' ? 'text-red-600' : 'text-green-600'
            }`}>
              {marketTrends.competition === 'high' ? '🔴 Élevée' : '🟢 Faible'}
            </p>
          </div>
        </div>

        {relatedRecipes.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-gray-600 text-sm">
              📊 {relatedRecipes.length} recette(s) utilise(nt) ce type de produit
            </p>
          </div>
        )}
      </div>

      <button
        onClick={applySuggestions}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        ✨ Appliquer les suggestions IA
      </button>
    </div>
  );
}
