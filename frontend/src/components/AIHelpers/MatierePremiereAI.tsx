import { useState, useEffect } from 'react';

interface MatierePremiereAIProps {
  formData: any;
  setFormData: (data: any) => void;
  existingMatieres: any[];
}

export function MatierePremiereAI({ formData, setFormData, existingMatieres }: MatierePremiereAIProps) {
  const [suggestions, setSuggestions] = useState({
    stockMin: 0,
    stockMax: 0,
    categorie: '',
  });
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (formData.nom) {
      analyzeAndSuggest();
    }
  }, [formData.nom, formData.categorie]);

  const analyzeAndSuggest = () => {
    const nom = formData.nom.toLowerCase();
    
    // Suggestions basées sur le nom (contexte Sénégal)
    if (nom.includes('mil')) {
      setSuggestions({
        stockMin: 50,
        stockMax: 500,
        categorie: 'Céréale',
      });
      setAiMessage('🇸🇳 Le mil est la base alimentaire. Stock min: 50kg. Prix moyen: 300-350 FCFA/kg (saison des pluies)');
    } else if (nom.includes('maïs')) {
      setSuggestions({
        stockMin: 30,
        stockMax: 300,
        categorie: 'Céréale',
      });
      setAiMessage('🇸🇳 Le maïs se cultive partout. Stock min: 30kg. Prix: 250-300 FCFA/kg (Thiès, Diourbel)');
    } else if (nom.includes('sorgho')) {
      setSuggestions({
        stockMin: 20,
        stockMax: 200,
        categorie: 'Céréale',
      });
      setAiMessage('🇸🇳 Le sorgho résiste à la sécheresse. Stock min: 20kg. Prix: 280 FCFA/kg');
    } else if (nom.includes('arachide')) {
      setSuggestions({
        stockMin: 25,
        stockMax: 250,
        categorie: 'Légumineuse',
      });
      setAiMessage('🇸🇳 L\'arachide est l\'or blanc du Sénégal. Stock min: 25kg. Prix: 350-450 FCFA/kg (Kaolack, Fatick)');
    } else if (nom.includes('niébé')) {
      setSuggestions({
        stockMin: 15,
        stockMax: 150,
        categorie: 'Légumineuse',
      });
      setAiMessage('🇸🇳 Le niébé enrichit les sols. Stock min: 15kg. Prix: 500 FCFA/kg');
    } else if (nom.includes('sésame')) {
      setSuggestions({
        stockMin: 10,
        stockMax: 100,
        categorie: 'Oléagineux',
      });
      setAiMessage('🇸🇳 Le sésame est exporté. Stock min: 10kg. Prix: 800 FCFA/kg');
    } else {
      setSuggestions(prev => ({
        ...prev,
        stockMin: 20,
        stockMax: 200,
      }));
      setAiMessage('💡 Valeurs par défaut. Adaptez selon la région (Nord: mil, Centre: arachide, Sud: riz)');
    }

    // Détection automatique de catégorie
    if (!formData.categorie) {
      if (nom.includes('mil') || nom.includes('blé') || nom.includes('maïs') || nom.includes('riz')) {
        setSuggestions(prev => ({ ...prev, categorie: 'Céréale' }));
      } else if (nom.includes('arachide') || nom.includes('soja') || nom.includes('haricot')) {
        setSuggestions(prev => ({ ...prev, categorie: 'Légumineuse' }));
      } else if (nom.includes('sésame') || nom.includes('tournesol')) {
        setSuggestions(prev => ({ ...prev, categorie: 'Oléagineux' }));
      }
    }
  };

  const applySuggestions = () => {
    setFormData({
      ...formData,
      stockMin: suggestions.stockMin,
      stockMax: suggestions.stockMax,
      categorie: suggestions.categorie || formData.categorie,
    });
  };

  // Vérifier les similarités
  const similarItems = existingMatieres.filter(item => 
    item.nom.toLowerCase().includes(formData.nom.toLowerCase()) ||
    formData.nom.toLowerCase().includes(item.nom.toLowerCase())
  );

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🤖</span>
        <h4 className="font-semibold text-blue-900">Assistant IA - Matière Première</h4>
      </div>

      {similarItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
          <p className="text-yellow-800 text-sm font-medium">⚠️ Attention, des matières similaires existent:</p>
          <ul className="mt-2 space-y-1">
            {similarItems.map(item => (
              <li key={item.id} className="text-yellow-700 text-sm">
                • {item.nom} ({item.categorie}) - Stock: {item.stock} {item.unite}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded p-3 mb-3">
        <p className="text-blue-800 text-sm mb-2">{aiMessage}</p>
        
        {(suggestions.stockMin || suggestions.stockMax) && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Stock min suggéré:</span>
              <span className="ml-2 font-semibold text-blue-700">{suggestions.stockMin} kg</span>
            </div>
            <div>
              <span className="text-gray-600">Stock max suggéré:</span>
              <span className="ml-2 font-semibold text-blue-700">{suggestions.stockMax} kg</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={applySuggestions}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        ✨ Appliquer les suggestions IA
      </button>
    </div>
  );
}
