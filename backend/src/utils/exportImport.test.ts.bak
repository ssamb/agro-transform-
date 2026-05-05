import { parseToCSV, parseFromCSV, validateEntityData } from './exportImport';

describe('ExportImport Utils', () => {
  describe('parseToCSV', () => {
    it('devrait convertir un tableau d\'objets en CSV', () => {
      const data = [
        { nom: 'Mil', categorie: 'Céréale', unite: 'kg', stock: 100 },
        { nom: 'Maïs', categorie: 'Céréale', unite: 'kg', stock: 50 },
      ];
      
      const csv = parseToCSV(data);
      
      expect(csv).toContain('nom,categorie,unite,stock');
      expect(csv).toContain('Mil,Céréale,kg,100');
      expect(csv).toContain('Maïs,Céréale,kg,50');
    });

    it('devrait gérer les chaînes avec des virgules', () => {
      const data = [
        { nom: 'Test, value', categorie: 'Cat' },
      ];
      
      const csv = parseToCSV(data);
      
      expect(csv).toContain('"Test, value"');
    });
  });

  describe('parseFromCSV', () => {
    it('devrait parser un CSV en tableau d\'objets', () => {
      const csv = `nom,categorie,unite,stock
Mil,Céréale,kg,100
Maïs,Céréale,kg,50`;
      
      const result = parseFromCSV(csv, 'matieres-premieres');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        nom: 'Mil',
        categorie: 'Céréale',
        unite: 'kg',
        stock: 100,
      });
    });
  });

  describe('validateEntityData', () => {
    it('devrait valider une matière première correcte', () => {
      const data = {
        nom: 'Mil',
        categorie: 'Céréale',
        unite: 'kg',
      };
      
      const result = validateEntityData(data, 'matieres-premieres');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter une matière première sans nom', () => {
      const data = {
        categorie: 'Céréale',
        unite: 'kg',
      };
      
      const result = validateEntityData(data, 'matieres-premieres');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('nom requis (string)');
    });

    it('devrait valider une recette correcte', () => {
      const data = {
        nom: 'Recette couscous',
        matierePremiereId: 'uuid-1',
        produitFiniId: 'uuid-2',
        userId: 'uuid-3',
        rendementPercent: 85,
      };
      
      const result = validateEntityData(data, 'recettes');
      
      expect(result.valid).toBe(true);
    });

    it('devrait rejeter une recette avec rendement incorrect', () => {
      const data = {
        nom: 'Recette',
        matierePremiereId: 'uuid-1',
        produitFiniId: 'uuid-2',
        userId: 'uuid-3',
      };
      
      const result = validateEntityData(data, 'recettes');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('rendementPercent requis (number)');
    });
  });

  describe('Round-trip (CSV → Object → CSV)', () => {
    it('devrait préserver les données après export → import', () => {
      const original = [
        { nom: 'Mil', categorie: 'Céréale', unite: 'kg', stock: 100 },
        { nom: 'Maïs', categorie: 'Céréale', unite: 'kg', stock: 50 },
      ];
      
      const csv = parseToCSV(original);
      const parsed = parseFromCSV(csv, 'matieres-premieres');
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].nom).toBe(original[0].nom);
      expect(parsed[0].stock).toBe(original[0].stock);
    });
  });
});
