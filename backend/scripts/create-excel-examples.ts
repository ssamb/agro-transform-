import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

async function createExcelExamples() {
  console.log('📊 Création des fichiers Excel d\'exemple...');

  // 1. Matières premières
  const mpWorkbook = new ExcelJS.Workbook();
  const mpWorksheet = mpWorkbook.addWorksheet('Matieres_Premieres');
  
  mpWorksheet.columns = [
    { header: 'nom', key: 'nom', width: 20 },
    { header: 'categorie', key: 'categorie', width: 15 },
    { header: 'unite', key: 'unite', width: 10 },
    { header: 'stock', key: 'stock', width: 10 },
    { header: 'stockMin', key: 'stockMin', width: 10 },
    { header: 'stockMax', key: 'stockMax', width: 10 },
  ];

  mpWorksheet.addRows([
    { nom: 'Mil', categorie: 'Céréale', unite: 'kg', stock: 500, stockMin: 50, stockMax: 1000 },
    { nom: 'Maïs', categorie: 'Céréale', unite: 'kg', stock: 300, stockMin: 30, stockMax: 800 },
    { nom: 'Arachide', categorie: 'Oléagineux', unite: 'kg', stock: 200, stockMin: 20, stockMax: 500 },
    { nom: 'Sorgho', categorie: 'Céréale', unite: 'kg', stock: 400, stockMin: 40, stockMax: 900 },
    { nom: 'Niebé', categorie: 'Légumineuse', unite: 'kg', stock: 150, stockMin: 15, stockMax: 400 },
    { nom: 'Sésame', categorie: 'Oléagineux', unite: 'kg', stock: 100, stockMin: 10, stockMax: 300 },
  ]);

  // 2. Recettes
  const recetteWorkbook = new ExcelJS.Workbook();
  const recetteWorksheet = recetteWorkbook.addWorksheet('Recettes');
  
  recetteWorksheet.columns = [
    { header: 'nom', key: 'nom', width: 35 },
    { header: 'description', key: 'description', width: 40 },
    { header: 'matierePremiereId', key: 'matierePremiereId', width: 20 },
    { header: 'produitFiniId', key: 'produitFiniId', width: 20 },
    { header: 'rendementPercent', key: 'rendementPercent', width: 15 },
    { header: 'dureeTotale', key: 'dureeTotale', width: 12 },
    { header: 'pertePercent', key: 'pertePercent', width: 12 },
  ];

  // IDs à remplacer par les vrais IDs après import
  recetteWorksheet.addRows([
    { 
      nom: 'Transformation Mil en Couscous', 
      description: 'Processus de transformation du mil en couscous',
      matierePremiereId: '[ID Mil]',
      produitFiniId: '[ID Couscous]',
      rendementPercent: 85,
      dureeTotale: 120,
      pertePercent: 5
    },
    { 
      nom: 'Transformation Maïs en Farine', 
      description: 'Mouture du maïs pour produire de la farine',
      matierePremiereId: '[ID Maïs]',
      produitFiniId: '[ID Farine]',
      rendementPercent: 90,
      dureeTotale: 90,
      pertePercent: 3
    },
    { 
      nom: 'Transformation Arachide en Huile', 
      description: 'Extraction de l\'huile d\'arachide',
      matierePremiereId: '[ID Arachide]',
      produitFiniId: '[ID Huile]',
      rendementPercent: 45,
      dureeTotale: 180,
      pertePercent: 2
    },
  ]);

  // 3. Transformations
  const transfoWorkbook = new ExcelJS.Workbook();
  const transfoWorksheet = transfoWorkbook.addWorksheet('Transformations');
  
  transfoWorksheet.columns = [
    { header: 'recetteId', key: 'recetteId', width: 20 },
    { header: 'userId', key: 'userId', width: 20 },
    { header: 'quantiteMP', key: 'quantiteMP', width: 12 },
    { header: 'quantitePF', key: 'quantitePF', width: 12 },
    { header: 'perteReelle', key: 'perteReelle', width: 12 },
    { header: 'pertePercent', key: 'pertePercent', width: 12 },
    { header: 'observations', key: 'observations', width: 30 },
    { header: 'statut', key: 'statut', width: 15 },
  ];

  transfoWorksheet.addRows([
    { 
      recetteId: '[ID Recette 1]',
      userId: '[ID User]',
      quantiteMP: 100,
      quantitePF: 85,
      perteReelle: 5,
      pertePercent: 5,
      observations: 'Transformation batch #1',
      statut: 'termine'
    },
    { 
      recetteId: '[ID Recette 2]',
      userId: '[ID User]',
      quantiteMP: 50,
      quantitePF: 45,
      perteReelle: 1.5,
      pertePercent: 3,
      observations: 'Production farine',
      statut: 'termine'
    },
    { 
      recetteId: '[ID Recette 3]',
      userId: '[ID User]',
      quantiteMP: 80,
      quantitePF: 36,
      perteReelle: 1.6,
      pertePercent: 2,
      observations: 'Extraction huile',
      statut: 'termine'
    },
  ]);

  // Sauvegarde
  const outputDir = path.join(__dirname, '..', 'examples');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  await mpWorkbook.xlsx.writeFile(path.join(outputDir, 'exemple-matieres-premieres.xlsx'));
  console.log('✅ Matières premières: examples/exemple-matieres-premieres.xlsx');

  await recetteWorkbook.xlsx.writeFile(path.join(outputDir, 'exemple-recettes.xlsx'));
  console.log('✅ Recettes: examples/exemple-recettes.xlsx');

  await transfoWorkbook.xlsx.writeFile(path.join(outputDir, 'exemple-transformations.xlsx'));
  console.log('✅ Transformations: examples/exemple-transformations.xlsx');

  console.log('\n📁 Fichiers Excel créés dans le dossier "backend/examples/"');
  console.log('💡 Importez ces fichiers via /data après avoir importé les données de base');
}

createExcelExamples()
  .catch(console.error);
