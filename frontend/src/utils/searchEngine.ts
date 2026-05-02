/**
 * Moteur de recherche intelligent pour AgroTransform
 * Interprète les requêtes en langage naturel
 */

export interface SearchQuery {
  original: string;
  type: 'all' | 'matiere' | 'produit' | 'recette' | 'transformation';
  filters: {
    stock?: {
      min?: number;
      max?: number;
      isLow?: boolean;
    };
    rendement?: {
      min?: number;
      max?: number;
      high?: boolean; // > 80%
      low?: boolean;  // < 50%
    };
    date?: {
      from?: string;
      to?: string;
      recent?: boolean;
    };
    category?: string;
  };
  sortBy: 'date' | 'nom' | 'stock' | 'rendement';
  order: 'asc' | 'desc';
}

export function parseQuery(query: string): SearchQuery {
  const lowerQuery = query.toLowerCase();
  const result: SearchQuery = {
    original: query,
    type: 'all',
    filters: {},
    sortBy: 'nom',
    order: 'asc',
  };

  // Détection du type
  if (lowerQuery.includes('matière') || lowerQuery.includes('stock')) {
    result.type = 'matiere';
  } else if (lowerQuery.includes('produit') || lowerQuery.includes('fini')) {
    result.type = 'produit';
  } else if (lowerQuery.includes('recette')) {
    result.type = 'recette';
  } else if (lowerQuery.includes('transformation') || lowerQuery.includes('historique')) {
    result.type = 'transformation';
  }

  // Détection "stocks bas"
  if (lowerQuery.includes('bas') || lowerQuery.includes('faible') || lowerQuery.includes('alerte')) {
    result.filters.stock = { isLow: true };
  }

  // Détection seuil stock
  const stockMatch = query.match(/stock\s*(<|<=|>|>=|=|inférieur|supérieur)\s*(\d+)/);
  if (stockMatch) {
    const [, op, value] = stockMatch;
    const numValue = parseInt(value);
    result.filters.stock = {
      min: op.includes('>') || op.includes('inf') ? numValue : undefined,
      max: op.includes('<') || op.includes('sup') ? numValue : undefined,
    };
  }

  // Détection rendement
  const rendementMatch = query.match(/rendement\s*(<|<=|>|>=|=)\s*(\d+)/);
  if (rendementMatch) {
    const [, op, value] = rendementMatch;
    const numValue = parseInt(value);
    result.filters.rendement = {
      min: op.includes('>') ? numValue : undefined,
      max: op.includes('<') ? numValue : undefined,
      high: lowerQuery.includes('haut') || lowerQuery.includes('élevé') ? true : undefined,
      low: lowerQuery.includes('faible') || lowerQuery.includes('bas') ? true : undefined,
    };
  }

  // Détection date (récents, aujourd'hui, cette semaine)
  if (lowerQuery.includes('récent') || lowerQuery.includes('aujourd\'hui') || lowerQuery.includes('semaine')) {
    result.filters.date = { recent: true };
  }

  // Tri
  if (lowerQuery.includes('trier') || lowerQuery.includes('ordre')) {
    if (lowerQuery.includes('date')) {
      result.sortBy = 'date';
    } else if (lowerQuery.includes('stock')) {
      result.sortBy = 'stock';
    } else if (lowerQuery.includes('rendement')) {
      result.sortBy = 'rendement';
    } else {
      result.sortBy = 'nom';
    }

    result.order = lowerQuery.includes('décroissant') || lowerQuery.includes('desc') ? 'desc' : 'asc';
  }

  return result;
}

export function executeSearch<T extends any[]>(items: T, query: SearchQuery): T {
  let filtered = items;

  // Filtrage par type
  if (query.type !== 'all') {
    // Logique de filtrage spécifique au type
  }

  // Filtrage stock
  if (query.filters.stock) {
    const { stock } = query.filters;
    if (stock?.isLow) {
      filtered = filtered.filter((item: any) => item.stock <= item.stockMin) as T;
    }
    if (stock?.min !== undefined) {
      filtered = filtered.filter((item: any) => item.stock >= stock.min) as T;
    }
    if (stock?.max !== undefined) {
      filtered = filtered.filter((item: any) => item.stock <= stock.max) as T;
    }
  }

  // Filtrage rendement
  if (query.filters.rendement) {
    const { rendement } = query.filters;
    if (rendement?.min !== undefined) {
      filtered = filtered.filter((item: any) => item.rendementPercent >= rendement.min) as T;
    }
    if (rendement?.max !== undefined) {
      filtered = filtered.filter((item: any) => item.rendementPercent <= rendement.max) as T;
    }
    if (rendement?.high) {
      filtered = filtered.filter((item: any) => item.rendementPercent >= 80) as T;
    }
    if (rendement?.low) {
      filtered = filtered.filter((item: any) => item.rendementPercent < 50) as T;
    }
  }

  // Tri
  filtered = [...filtered].sort((a: any, b: any) => {
    let comparison = 0;
    switch (query.sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'stock':
        comparison = (a.stock || 0) - (b.stock || 0);
        break;
      case 'rendement':
        comparison = (a.rendementPercent || 0) - (b.rendementPercent || 0);
        break;
      default:
        comparison = (a.nom || '').localeCompare(b.nom || '');
    }
    return query.order === 'desc' ? -comparison : comparison;
  }) as T;

  return filtered;
}

export function getQuickFilters() {
  return [
    { id: 'low_stock', label: 'Stocks bas', query: 'stocks bas' },
    { id: 'high_yield', label: 'Haut rendement', query: 'rendement > 80%' },
    { id: 'recent', label: 'Récents', query: 'récents' },
    { id: 'cereales', label: 'Céréales', query: 'céréale' },
  ];
}
