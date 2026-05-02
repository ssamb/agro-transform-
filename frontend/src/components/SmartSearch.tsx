import { useState, useEffect, useRef } from 'react';

interface SmartSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
}

interface SearchFilters {
  type: 'all' | 'matiere' | 'produit' | 'recette' | 'transformation';
  sortBy: 'date' | 'nom' | 'stock' | 'rendement';
  order: 'asc' | 'desc';
}

interface Suggestion {
  id: string;
  text: string;
  type: 'matiere' | 'produit' | 'recette' | 'transformation';
  category?: string;
}

export function SmartSearch({ onSearch, placeholder = 'Recherche intelligente...', className = '' }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'nom',
    order: 'asc',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Détection de l'intention de recherche
  const detectIntent = (text: string): Partial<SearchFilters> => {
    const lowerText = text.toLowerCase();
    
    // Détection du type
    if (lowerText.includes('matière') || lowerText.includes('stock')) {
      return { type: 'matiere' };
    }
    if (lowerText.includes('produit') || lowerText.includes('fini')) {
      return { type: 'produit' };
    }
    if (lowerText.includes('recette') || lowerText.includes('transformation')) {
      return { type: 'recette' };
    }
    if (lowerText.includes('historique') || lowerText.includes('transformation')) {
      return { type: 'transformation' };
    }

    return {};
  };

  // Suggestions basées sur le texte
  const getSuggestions = (text: string): Suggestion[] => {
    const commonSuggestions = [
      { id: '1', text: 'Voir les stocks bas', type: 'matiere' as const, category: 'stock' },
      { id: '2', text: 'Matières premières', type: 'matiere' as const },
      { id: '3', text: 'Produits finis', type: 'produit' as const },
      { id: '4', text: 'Recettes avec haut rendement', type: 'recette' as const },
      { id: '5', text: 'Transformations récentes', type: 'transformation' as const },
      { id: '6', text: 'Trier par date', type: 'all' as const, category: 'sort' },
      { id: '7', text: 'Afficher les alertes', type: 'all' as const, category: 'alert' },
    ];

    if (!text.trim()) {
      return commonSuggestions.slice(0, 5);
    }

    return commonSuggestions.filter(s => 
      s.text.toLowerCase().includes(text.toLowerCase())
    ).slice(0, 5);
  };

  useEffect(() => {
    const detected = detectIntent(query);
    const newSuggestions = getSuggestions(query);
    setSuggestions(newSuggestions);
  }, [query]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text, { ...filters, ...detectIntent(suggestion.text) });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value, filters);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearch}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="w-full border-2 border-indigo-200 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>

        {/* Filtre rapide */}
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
          className="border-2 border-indigo-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="all">Tout</option>
          <option value="matiere">Matières</option>
          <option value="produit">Produits</option>
          <option value="recette">Recettes</option>
          <option value="transformation">Transformations</option>
        </select>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex justify-between items-center border-b last:border-b-0 transition-colors"
            >
              <span className="text-gray-800">{suggestion.text}</span>
              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded capitalize">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
