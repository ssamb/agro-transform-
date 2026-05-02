import { useState, useEffect } from 'react';

interface RecetteAIProps {
  formData: any;
  setFormData: (data: any) => void;
  matieresPremieres: any[];
  produitsFinis: any[];
  existingRecettes: any[];
}

export function RecetteAI({ formData, setFormData, matieresPremieres, produitsFinis, existingRecettes }: RecetteAIProps) {
  const [aiSuggestions, setAiSuggestions] = useState({
    rendementPercent: 0,
    pertePercent: 0,
    dureeTotale: 0,
    etapes: [] as string[],
  });
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (formData.matierePremiereId && formData.produitFiniId) {
      calculateOptimalRecipe();
    }
  }, [formData.matierePremiereId, formData.produitFiniId, formData.nom]);

  const calculateOptimalRecipe = () => {
    const mp = matieresPremieres.find(m => m.id === formData.matierePremiereId);
    const pf = produitsFinis.find(p => p.id === formData.produitFiniId);

    if (!mp || !pf) return;

    const mpNom = mp.nom.toLowerCase();
    const pfNom = pf.nom.toLowerCase();

    // Calcul basé sur des recettes types (contexte Sénégal)
    if (mpNom.includes('mil') && pfNom.includes('couscous')) {
      setAiSuggestions({
        rendementPercent: 82,
        pertePercent: 8,
        dureeTotale: 150,
        etapes: ['Nettoyage (15 min)', 'Trempage (30 min)', 'Séchage soleil (60 min)', 'Concassage mortier (30 min)', 'Tamisage (15 min)'],
      });
      setAiMessage('🇸🇳 Couscous de mil traditionnel: Rendement 82%. Perte 8%. Durée 2h30. Prix vente: 800 FCFA/kg. Marge: 60%');
    } else if (mpNom.includes('maïs') && (pfNom.includes('farine') || pfNom.includes('maïs'))) {
      setAiSuggestions({
        rendementPercent: 88,
        pertePercent: 4,
        dureeTotale: 90,
        etapes: ['Nettoyage (10 min)', 'Séchage (40 min)', 'Mouture moulin (30 min)', 'Tamisage (10 min)'],
      });
      setAiMessage('🇸🇳 Farine de maïs: Rendement 88%. Perte 4%. Durée 1h30. Prix: 600 FCFA/kg. Marge: 50%');
    } else if (mpNom.includes('arachide') && pfNom.includes('huile')) {
      setAiSuggestions({
        rendementPercent: 42,
        pertePercent: 3,
        dureeTotale: 240,
        etapes: ['Tri manuel (30 min)', 'Grillage (40 min)', 'Décorticage (40 min)', 'Pression manuelle (90 min)', 'Filtrage (40 min)'],
      });
      setAiMessage('🇸🇳 Huile d\'arachide artisanale: Rendement 42%. Perte 3%. Durée 4h. Prix: 1000-1200 FCFA/L (marché). Marge: 70-80%. Tourteau: 200 FCFA/kg (sous-produit)');
    } else if (mpNom.includes('sorgho') && pfNom.includes('couscous')) {
      setAiSuggestions({
        rendementPercent: 80,
        pertePercent: 10,
        dureeTotale: 180,
        etapes: ['Nettoyage (20 min)', 'Trempage (40 min)', 'Séchage (80 min)', 'Concassage (30 min)', 'Tamisage (10 min)'],
      });
      setAiMessage('🇸🇳 Couscous de sorgho: Rendement 80%. Perte 10%. Durée 3h. Prix: 700 FCFA/kg. Marge: 55%');
    } else if (mpNom.includes('niébé') && pfNom.includes('beignet')) {
      setAiSuggestions({
        rendementPercent: 95,
        pertePercent: 2,
        dureeTotale: 120,
        etapes: ['Tri (15 min)', 'Trempage (60 min)', 'Broyage (30 min)', 'Assaisonnement (15 min)'],
      });
      setAiMessage('🇸🇳 Beignets de niébé (Accara): Rendement 95%. Perte 2%. Durée 2h. Prix: 50 FCFA/pièce. Marge: 70%');
    } else {
      setAiSuggestions({
        rendementPercent: 75,
        pertePercent: 8,
        dureeTotale: 120,
        etapes: ['Préparation (30 min)', 'Transformation (60 min)', 'Finition (30 min)'],
      });
      setAiMessage('💡 Recette standard. Adaptez selon le produit. Exemple: couscous mil = 82% rendement, 60% marge');
    }
  };

  // Vérifier recettes similaires
  const similarRecettes = existingRecettes.filter(recette => 
    recette.matierePremiereId === formData.matierePremiereId &&
    recette.produitFiniId === formData.produitFiniId
  );

  const applySuggestions = () => {
    setFormData({
      ...formData,
      rendementPercent: aiSuggestions.rendementPercent,
      pertePercent: aiSuggestions.pertePercent,
      dureeTotale: aiSuggestions.dureeTotale,
    });
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🤖</span>
        <h4 className="font-semibold text-purple-900">Assistant IA - Recette</h4>
      </div>

      {similarRecettes.length > 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
          <p className="text-yellow-800 text-sm font-medium">⚠️ Recettes similaires existantes:</p>
          <ul className="mt-2 space-y-1">
            {similarRecettes.map(recette => (
              <li key={recette.id} className="text-yellow-700 text-sm">
                • {recette.nom} - Rendement: {recette.rendementPercent}%, Perte: {recette.pertePercent}%
              </li>
            ))}
          </ul>
          <p className="text-yellow-600 text-xs mt-2">
            💡 Astuce: Inspirez-vous de ces recettes pour optimiser la vôtre
          </p>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
          <p className="text-green-800 text-sm font-medium">✅ Aucune recette similaire trouvée</p>
          <p className="text-green-600 text-xs mt-1">
            Vous créez une recette unique !
          </p>
        </div>
      )}

      <div className="bg-white rounded p-3 mb-3">
        <p className="text-purple-800 text-sm mb-3">{aiMessage}</p>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Rendement suggéré:</span>
            <p className="text-lg font-semibold text-green-600">{aiSuggestions.rendementPercent}%</p>
          </div>
          <div>
            <span className="text-gray-600">Perte estimée:</span>
            <p className="text-lg font-semibold text-orange-600">{aiSuggestions.pertePercent}%</p>
          </div>
          <div>
            <span className="text-gray-600">Durée estimée:</span>
            <p className="text-lg font-semibold text-blue-600">{aiSuggestions.dureeTotale} min</p>
          </div>
        </div>

        {aiSuggestions.etapes.length > 0 && (
          <div className="mt-3">
            <p className="text-gray-600 text-sm font-medium">Étapes suggérées:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {aiSuggestions.etapes.map((etape, idx) => (
                <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  {idx + 1}. {etape}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={applySuggestions}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
      >
        ✨ Appliquer les suggestions IA
      </button>
    </div>
  );
}
