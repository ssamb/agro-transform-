import { useState, useEffect } from 'react';

interface TransformationAIProps {
  formData: any;
  setFormData: (data: any) => void;
  recettes: any[];
  transformations: any[];
}

export function TransformationAI({ formData, setFormData, recettes, transformations }: TransformationAIProps) {
  const [prediction, setPrediction] = useState({
    quantitePF: 0,
    perteReelle: 0,
    rendementReel: 0,
    confidence: 0,
  });
  const [aiMessage, setAiMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (formData.recetteId && formData.quantiteMP) {
      predictResult();
      checkAnomalies();
    }
  }, [formData.recetteId, formData.quantiteMP, formData.quantitePF]);

  const predictResult = () => {
    const recette = recettes.find(r => r.id === formData.recetteId);
    if (!recette || !formData.quantiteMP) {
      setPrediction({ quantitePF: 0, perteReelle: 0, rendementReel: 0, confidence: 0 });
      return;
    }

    // Calcul théorique
    const theoreticalYield = (formData.quantiteMP * recette.rendementPercent) / 100;
    const theoreticalLoss = formData.quantiteMP * (recette.pertePercent / 100);

    // Analyse des transformations précédentes
    const previousTransforms = transformations.filter(t => t.recetteId === recette.id);
    let avgYield = recette.rendementPercent;
    let avgLoss = recette.pertePercent;

    if (previousTransforms.length > 0) {
      const totalMP = previousTransforms.reduce((sum, t) => sum + t.quantiteMP, 0);
      const totalPF = previousTransforms.reduce((sum, t) => sum + t.quantitePF, 0);
      avgYield = (totalPF / totalMP) * 100;
      
      const totalLoss = previousTransforms.reduce((sum, t) => sum + t.perteReelle, 0);
      avgLoss = (totalLoss / previousTransforms.length);
    }

    // Prédiction basée sur la moyenne historique
    const predictedPF = (formData.quantiteMP * avgYield) / 100;
    const predictedLoss = formData.quantiteMP * (avgLoss / 100);
    const confidence = previousTransforms.length > 2 ? 0.9 : 0.7;

    setPrediction({
      quantitePF: parseFloat(predictedPF.toFixed(2)),
      perteReelle: parseFloat(predictedLoss.toFixed(2)),
      rendementReel: parseFloat(avgYield.toFixed(2)),
      confidence,
    });

    setAiMessage(`📊 Basé sur ${previousTransforms.length} transformation(s) précédente(s): Rendement moyen ${avgYield.toFixed(1)}%`);
  };

  const checkAnomalies = () => {
    if (!formData.quantiteMP || !formData.quantitePF) {
      setAlertMessage('');
      return;
    }

    const actualYield = (formData.quantitePF / formData.quantiteMP) * 100;
    const recette = recettes.find(r => r.id === formData.recetteId);
    
    if (!recette) return;

    const yieldDiff = actualYield - recette.rendementPercent;

    if (yieldDiff < -15) {
      setAlertMessage(`⚠️ Rendement très bas (${actualYield.toFixed(1)}% vs ${recette.rendementPercent}%). Cause: MP humide (saison pluies)? Perte: ${(100 - actualYield).toFixed(0)}%. Prix de revient élevé!`);
    } else if (yieldDiff > 15) {
      setAiMessage(`🎉 Excellent! +${yieldDiff.toFixed(1)}% vs normale. Astuce à partager (Groupement femmes, Coopérative). Économie: ${((formData.quantitePF * 800) - (formData.quantiteMP * 300)).toLocaleString('fr-FR')} FCFA`);
    } else if (yieldDiff < -5) {
      setAlertMessage(`⚠️ Rendement -${Math.abs(yieldDiff).toFixed(1)}%. Vérifiez: 1) Stockage MP (humidité?), 2) Technique (traditionnelle ou moderne?), 3) Perte au concassage.`);
    } else {
      const margeBenef = (formData.quantitePF * 800) - (formData.quantiteMP * 300);
      const margeBenefRealiste = (formData.quantitePF * 1100) - (formData.quantiteMP * 350);
      setAlertMessage(`✅ Rendement conforme. Marge estimée: ${margeBenefRealiste.toLocaleString('fr-FR')} FCFA (huile à 1100 FCFA/L). Tourteau: ${(formData.quantiteMP * 0.6 * 200).toLocaleString('fr-FR')} FCFA (sous-produit). Astuce: Vendre en saison sèche = +30% prix`);
    }
  };

  const applyPrediction = () => {
    setFormData({
      ...formData,
      quantitePF: prediction.quantitePF,
    });
  };

  if (!formData.recetteId) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🤖</span>
        <h4 className="font-semibold text-green-900">Assistant IA - Transformation</h4>
      </div>

      {alertMessage && (
        <div className={`rounded p-3 mb-3 ${alertMessage.includes('⚠️') ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
          <p className={`text-sm font-medium ${alertMessage.includes('⚠️') ? 'text-yellow-800' : 'text-green-800'}`}>
            {alertMessage}
          </p>
        </div>
      )}

      <div className="bg-white rounded p-3 mb-3">
        <p className="text-green-800 text-sm mb-3">{aiMessage}</p>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Quantité MP:</span>
            <p className="text-lg font-semibold text-blue-600">{formData.quantiteMP} kg</p>
          </div>
          <div>
            <span className="text-gray-600">PF théorique:</span>
            <p className="text-lg font-semibold text-green-600">{prediction.quantitePF} kg</p>
          </div>
          <div>
            <span className="text-gray-600">Perte estimée:</span>
            <p className="text-lg font-semibold text-orange-600">{prediction.perteReelle} kg</p>
          </div>
        </div>

        {prediction.confidence > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-gray-600">Confiance de la prédiction:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${prediction.confidence * 100}%` }}
              ></div>
            </div>
            <span className="font-semibold text-green-700">{(prediction.confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={applyPrediction}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          ✨ Appliquer la prédiction
        </button>
        <button
          onClick={() => setFormData({ ...formData, quantitePF: prediction.quantitePF })}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          📊 Calculer optimal
        </button>
      </div>
    </div>
  );
}
