import { useState } from 'react';
import DataExport from '../components/DataExport';
import DataImport from '../components/DataImport';

type EntityType = 'matieres-premieres' | 'produits-finis' | 'recettes' | 'transformations';

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('matieres-premieres');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="border-b">
          <h1 className="text-2xl font-bold p-6">Gestion des données</h1>
          
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'export'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'import'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Import
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'export' ? (
            <DataExport />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type de données</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="matieres-premieres">Matières premières</option>
                  <option value="produits-finis">Produits finis</option>
                  <option value="recettes">Recettes</option>
                  <option value="transformations">Transformations</option>
                </select>
              </div>
              
              <DataImport entity={selectedEntity} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Exportez régulièrement vos données pour sauvegarde</li>
          <li>• Vérifiez l'aperçu avant d'importer des données</li>
          <li>• Les doublons seront détectés et signalés</li>
          <li>• Formats supportés: JSON et CSV</li>
        </ul>
      </div>
    </div>
  );
}
