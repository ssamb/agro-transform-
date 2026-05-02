/**
 * Prix moyens au Sénégal (FCFA - 2024)
 * Sources: Marché Sandaga (Dakar), ANCAR, Ministère de l'Agriculture
 */

export interface PriceData {
  product: string;
  category: 'cereale' | 'legumineuse' | 'oleagineux' | 'transforme';
  buyPrice: number;  // Prix d'achat MP
  sellPrice: number; // Prix de vente PF
  unit: string;
  region: string;
  seasonality: 'hivernage' | 'secheresse' | 'annee';
}

export const SENEGAL_PRICES: Record<string, PriceData> = {
  // Matières premières
  'mil': { product: 'Mil', category: 'cereale', buyPrice: 300, sellPrice: 350, unit: 'kg', region: 'Toutes régions', seasonality: 'annee' },
  'maïs': { product: 'Maïs', category: 'cereale', buyPrice: 250, sellPrice: 300, unit: 'kg', region: 'Thiès, Diourbel', seasonality: 'annee' },
  'sorgho': { product: 'Sorgho', category: 'cereale', buyPrice: 280, sellPrice: 330, unit: 'kg', region: 'Bassin arachidier', seasonality: 'annee' },
  'riz': { product: 'Riz', category: 'cereale', buyPrice: 400, sellPrice: 450, unit: 'kg', region: 'Saint-Louis, Casamance', seasonality: 'annee' },
  'arachide': { product: 'Arachide', category: 'oleagineux', buyPrice: 350, sellPrice: 450, unit: 'kg', region: 'Kaolack, Fatick', seasonality: 'annee' },
  'niébé': { product: 'Niébé', category: 'legumineuse', buyPrice: 500, sellPrice: 600, unit: 'kg', region: 'Toutes régions', seasonality: 'annee' },
  'sésame': { product: 'Sésame', category: 'oleagineux', buyPrice: 800, sellPrice: 1000, unit: 'kg', region: 'Export', seasonality: 'annee' },
  
  // Produits transformés
  'couscous mil': { product: 'Couscous de mil', category: 'transforme', buyPrice: 400, sellPrice: 800, unit: 'kg', region: 'Dakar', seasonality: 'annee' },
  'farine maïs': { product: 'Farine de maïs', category: 'transforme', buyPrice: 300, sellPrice: 600, unit: 'kg', region: 'Dakar, Thiès', seasonality: 'annee' },
  'huile arachide': { product: 'Huile d\'arachide', category: 'transforme', buyPrice: 600, sellPrice: 1100, unit: 'L', region: 'Toutes régions', seasonality: 'annee' },
  'bouillie': { product: 'Bouillie', category: 'transforme', buyPrice: 50, sellPrice: 100, unit: 'L', region: 'Dakar', seasonality: 'annee' },
  'beignet niébé': { product: 'Beignet niébé', category: 'transforme', buyPrice: 15, sellPrice: 50, unit: 'pièce', region: 'Dakar', seasonality: 'annee' },
};

/**
 * Marge bénéficiaire par produit
 */
export const PROFIT_MARGINS = {
  'couscous': { min: 50, max: 70, average: 60 }, // % de marge
  'farine': { min: 40, max: 60, average: 50 },
  'huile': { min: 50, max: 80, average: 65 },
  'beignet': { min: 60, max: 80, average: 70 },
  'bouillie': { min: 40, max: 60, average: 50 },
};

/**
 * Rendements typiques
 */
export const TYPICAL_YIELDS = {
  'mil_couscous': { yield: 82, loss: 8 },
  'mais_farine': { yield: 88, loss: 4 },
  'arachide_huile': { yield: 42, loss: 3 },
  'sorgho_couscous': { yield: 80, loss: 10 },
  'niebe_beignet': { yield: 95, loss: 2 },
};

/**
 * Variations saisonnières des prix
 */
export const SEASONAL_VARIATION = {
  'hivernage': { // Juin-Octobre
    mil: { variation: -10 }, // Baisse offre abondante
    mais: { variation: -15 },
    arachide: { variation: 0 },
  },
  'secheresse': { // Nov-Mai
    mil: { variation: 20 }, // Hausse stocks bas
    mais: { variation: 25 },
    arachide: { variation: 10 },
  },
};

/**
 * Marchés de référence
 */
export const MARKETS = {
  'Dakar': { name: 'Marché Sandaga', type: 'Gros', region: 'Dakar' },
  'Thiès': { name: 'Marché central', type: 'Gros', region: 'Thiès' },
  'Kaolack': { name: 'Marché arachidier', type: 'Spécialisé', region: 'Kaolack' },
  'Saint-Louis': { name: 'Marché du fleuve', type: 'Riz', region: 'Saint-Louis' },
  'Ziguinchor': { name: 'Marché du sud', type: 'Mixte', region: 'Casamance' },
};

/**
 * Calcul du prix de revient
 */
export function calculateCostPrice(mpPrice: number, yieldPercent: number, processingCost: number = 100): number {
  // Prix de revient = (Prix MP / Rendement) + Coût transformation
  return (mpPrice / (yieldPercent / 100)) + processingCost;
}

/**
 * Calcul de la marge bénéficiaire
 */
export function calculateProfitMargin(costPrice: number, sellPrice: number): number {
  return ((sellPrice - costPrice) / costPrice) * 100;
}

/**
 * Prix conseillé selon la saison
 */
export function getSeasonalPrice(basePrice: number, season: 'hivernage' | 'secheresse'): number {
  const variation = season === 'hivernage' ? 0.9 : 1.2;
  return Math.round(basePrice * variation);
}

/**
 * Analyse de rentabilité
 */
export interface ProfitabilityAnalysis {
  costPrice: number;
  sellPrice: number;
  margin: number;
  profit: number;
  recommendation: string;
}

export function analyzeProfitability(
  mpPrice: number,
  sellPrice: number,
  yieldPercent: number,
  product: string
): ProfitabilityAnalysis {
  const costPrice = calculateCostPrice(mpPrice, yieldPercent);
  const margin = calculateProfitMargin(costPrice, sellPrice);
  const profit = sellPrice - costPrice;
  
  let recommendation = '';
  if (margin > 60) {
    recommendation = '✅ Excellente marge! Production recommandée.';
  } else if (margin > 40) {
    recommendation = '👍 Marge correcte. Optimisez les coûts pour +20%.';
  } else if (margin > 20) {
    recommendation = '⚠️ Marge faible. Ciblez la saison sèche pour +30%.';
  } else {
    recommendation = '❌ Marge insuffisante. Augmentez prix ou réduisez coûts.';
  }
  
  return {
    costPrice: Math.round(costPrice),
    sellPrice,
    margin: Math.round(margin),
    profit: Math.round(profit),
    recommendation,
  };
}
