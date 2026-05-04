import { useState, useRef } from 'react';
import axios from 'axios';

interface ImportPreview {
  total: number;
  valid: number;
  invalid: number;
  errors?: Array<{ row: number; errors: string[] }>;
  preview?: any[];
}

interface DataImportProps {
  entity: 'matieres-premieres' | 'produits-finis' | 'recettes' | 'transformations';
  onSuccess?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function DataImport({ entity, onSuccess }: DataImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setError(null);
      setSuccess(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token') || '';
      const isCsv = file.name.endsWith('.csv');
      const text = await file.text();
      let data: any[] = [];

      if (isCsv) {
        // Parser CSV
        const lines = text.trim().split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
          data = lines.slice(1).map((line) => {
            const values = line.split(/,(?=(?:([^"]*"){2})*[^"]*$)/);
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              let value = values[index]?.trim() || '';
              value = value.replace(/^"|"$/g, '').replace(/""/g, '"');
              if (value === 'true') obj[header] = true;
              else if (value === 'false') obj[header] = false;
              else if (/^\d+$/.test(value)) obj[header] = parseInt(value, 10);
              else if (/^\d+\.\d+$/.test(value)) obj[header] = parseFloat(value);
              else obj[header] = value;
            });
            return obj;
          });
        }
      } else {
        data = JSON.parse(text);
        if (!Array.isArray(data)) {
          throw new Error('Le fichier JSON doit contenir un tableau');
        }
      }

      // Preview
      const response = await axios.post(
        `${API_URL}/data/import/${entity}/preview`,
        { data },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPreview(response.data);
    } catch (err: any) {
      console.error('Erreur preview:', err);
      setError(err.response?.data?.error || 'Erreur lors de la prévisualisation');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token') || '';
      const isCsv = file.name.endsWith('.csv');
      const text = await file.text();
      let data: any[] = [];

      if (isCsv) {
        const lines = text.trim().split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
          data = lines.slice(1).map((line) => {
            const values = line.split(/,(?=(?:([^"]*"){2})*[^"]*$)/);
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              let value = values[index]?.trim() || '';
              value = value.replace(/^"|"$/g, '').replace(/""/g, '"');
              if (value === 'true') obj[header] = true;
              else if (value === 'false') obj[header] = false;
              else if (/^\d+$/.test(value)) obj[header] = parseInt(value, 10);
              else if (/^\d+\.\d+$/.test(value)) obj[header] = parseFloat(value);
              else obj[header] = value;
            });
            return obj;
          });
        }
      } else {
        data = JSON.parse(text);
      }

      const response = await axios.post(
        `${API_URL}/data/import/${entity}`,
        { data, format: isCsv ? 'csv' : 'json' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(response.data.message);
      setPreview(null);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Erreur import:', err);
      setError(
        err.response?.data?.error || 'Erreur lors de l\'import'
      );
    } finally {
      setLoading(false);
    }
  };

  const getEntityLabel = () => {
    switch (entity) {
      case 'matieres-premieres':
        return 'Matières premières';
      case 'produits-finis':
        return 'Produits finis';
      case 'recettes':
        return 'Recettes';
      case 'transformations':
        return 'Transformations';
      default:
        return entity;
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Importer - {getEntityLabel()}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fichier (JSON ou CSV)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {file && !preview && (
          <button
            onClick={handlePreview}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Aperçu avant import'}
          </button>
        )}

        {preview && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Aperçu</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-lg font-semibold">{preview.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Valides</div>
                <div className="text-lg font-semibold text-green-600">{preview.valid}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Invalides</div>
                <div className="text-lg font-semibold text-red-600">{preview.invalid}</div>
              </div>
            </div>

            {preview.errors && preview.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-red-600 mb-2">Erreurs:</h4>
                <ul className="text-sm text-gray-600 max-h-32 overflow-y-auto">
                  {preview.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx} className="mb-1">
                      Ligne {err.row}: {err.errors.join(', ')}
                    </li>
                  ))}
                  {preview.errors.length > 5 && (
                    <li className="text-gray-400">... et {preview.errors.length - 5} autres</li>
                  )}
                </ul>
              </div>
            )}

            {preview.invalid === 0 ? (
              <button
                onClick={handleImport}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Import en cours...' : `Importer ${preview.valid} éléments`}
              </button>
            ) : (
              <div className="text-red-600 text-sm">
                Corrigez les erreurs avant d'importer
              </div>
            )}
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
      </div>
    </div>
  );
}
