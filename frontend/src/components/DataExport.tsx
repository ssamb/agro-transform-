import { useState } from 'react';
import axios from 'axios';

interface ExportOptions {
  entity: 'matieres-premieres' | 'produits-finis' | 'recettes' | 'transformations';
  format: 'json' | 'csv' | 'xlsx';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DataExport() {
const [options, setOptions] = useState<ExportOptions>({
  entity: 'matieres-premieres',
  format: 'json',
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/data/export`, {
        params: options,
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    // Créer le lien de téléchargement
    let mimeType = 'application/json';
    if (options.format === 'csv') mimeType = 'text/csv';
    else if (options.format === 'xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    const blob = new Blob([response.data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.entity}-${new Date().toISOString().split('T')[0]}.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Erreur export:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Exporter des données</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Entité</label>
          <select
            value={options.entity}
            onChange={(e) => setOptions({ ...options, entity: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="matieres-premieres">Matières premières</option>
            <option value="produits-finis">Produits finis</option>
            <option value="recettes">Recettes</option>
            <option value="transformations">Transformations</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <select
            value={options.format}
            onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (XLSX)</option>
          </select>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Export en cours...' : 'Exporter'}
        </button>
      </div>
    </div>
  );
}
