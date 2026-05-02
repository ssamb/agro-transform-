import { useState, useCallback, useEffect } from 'react';

interface SearchHistory {
  query: string;
  timestamp: number;
  type: string;
}

interface UseSmartSearchOptions {
  storageKey?: string;
  maxHistory?: number;
  debounceMs?: number;
}

export function useSmartSearch<T extends any[]>(
  items: T,
  options: UseSmartSearchOptions = {}
) {
  const {
    storageKey = 'smart_search_history',
    maxHistory = 10,
    debounceMs = 300,
  } = options;

  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<T>(items);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Charger l'historique
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur chargement historique:', e);
      }
    }
  }, [storageKey]);

  // Sauvegarder dans l'historique
  const saveToHistory = useCallback((searchQuery: string, type: string) => {
    const newEntry: SearchHistory = {
      query: searchQuery,
      timestamp: Date.now(),
      type,
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev.filter(h => h.query !== searchQuery)].slice(0, maxHistory);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey, maxHistory]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Fonction de recherche intelligente
  const search = useCallback((searchQuery: string, type: string = 'all') => {
    setQuery(searchQuery);
    
    if (searchQuery.trim()) {
      saveToHistory(searchQuery, type);
    }

    const lowerQuery = searchQuery.toLowerCase().trim();
    
    // Recherche floue
    const filtered = items.filter((item: any) => {
      if (!lowerQuery) return true;

      const searchableFields = [
        item.nom,
        item.description,
        item.categorie,
        item.type,
      ].filter(Boolean).map(f => f.toLowerCase());

      return searchableFields.some(field => 
        field.includes(lowerQuery) ||
        // Recherche partielle
        lowerQuery.split(' ').every(word => 
          word.length > 2 && field.includes(word)
        )
      );
    }) as T;

    setFilteredItems(filtered);
    return filtered;
  }, [items, saveToHistory]);

  // Suggestions basées sur l'historique
  const suggestions = useCallback(() => {
    return history
      .slice(0, 5)
      .map(h => h.query);
  }, [history]);

  // Effacer l'historique
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    query,
    setQuery,
    debouncedQuery,
    filteredItems,
    search,
    suggestions,
    history,
    clearHistory,
  };
}
