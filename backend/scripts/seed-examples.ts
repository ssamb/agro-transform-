import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des données d\'exemple...');

  // 1. Matières premières
  const matieres = await Promise.all([
    prisma.matierePremiere.create({
      data: {
        nom: 'Mil',
        categorie: 'Céréale',
        unite: 'kg',
        stock: 500,
        stockMin: 50,
        stockMax: 1000,
      },
    }),
    prisma.matierePremiere.create({
      data: {
        nom: 'Maïs',
        categorie: 'Céréale',
        unite: 'kg',
        stock: 300,
        stockMin: 30,
        stockMax: 800,
      },
    }),
    prisma.matierePremiere.create({
      data: {
        nom: 'Arachide',
        categorie: 'Oléagineux',
        unite: 'kg',
        stock: 200,
        stockMin: 20,
        stockMax: 500,
      },
    }),
    prisma.matierePremiere.create({
      data: {
        nom: 'Sorgho',
        categorie: 'Céréale',
        unite: 'kg',
        stock: 400,
        stockMin: 40,
        stockMax: 900,
      },
    }),
  ]);

  console.log('✅ Matières premières créées:', matieres.length);

  // 2. Produits finis
  const produits = await Promise.all([
    prisma.produitFini.create({
      data: {
        nom: 'Couscous Mil',
        categorie: 'Produit transformé',
        unite: 'kg',
      },
    }),
    prisma.produitFini.create({
      data: {
        nom: 'Farine Maïs',
        categorie: 'Produit transformé',
        unite: 'kg',
      },
    }),
    prisma.produitFini.create({
      data: {
        nom: 'Huile Arachide',
        categorie: 'Produit transformé',
        unite: 'litre',
      },
    }),
    prisma.produitFini.create({
      data: {
        nom: 'Semoule Sorgho',
        categorie: 'Produit transformé',
        unite: 'kg',
      },
    }),
  ]);

  console.log('✅ Produits finis créés:', produits.length);

  // 3. Utilisateur par défaut
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  let user = await prisma.user.findUnique({
    where: { email: 'admin@agrotransform.com' },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@agrotransform.com',
        password: hashedPassword,
        nom: 'Admin Transform',
        role: 'ADMIN',
      },
    });
    console.log('✅ Utilisateur admin créé');
  } else {
    console.log('✅ Utilisateur admin existe déjà');
  }

  // 4. Recettes
  const recettes = await Promise.all([
    prisma.recetteTransformation.create({
      data: {
        nom: 'Transformation Mil en Couscous',
        description: 'Processus de transformation du mil en couscous',
        rendementPercent: 85,
        dureeTotale: 120,
        pertePercent: 5,
        userId: user.id,
        matierePremiereId: matieres[0].id,
        produitFiniId: produits[0].id,
      },
    }),
    prisma.recetteTransformation.create({
      data: {
        nom: 'Transformation Maïs en Farine',
        description: 'Mouture du maïs pour produire de la farine',
        rendementPercent: 90,
        dureeTotale: 90,
        pertePercent: 3,
        userId: user.id,
        matierePremiereId: matieres[1].id,
        produitFiniId: produits[1].id,
      },
    }),
    prisma.recetteTransformation.create({
      data: {
        nom: 'Transformation Arachide en Huile',
        description: 'Extraction de l\'huile d\'arachide',
        rendementPercent: 45,
        dureeTotale: 180,
        pertePercent: 2,
        userId: user.id,
        matierePremiereId: matieres[2].id,
        produitFiniId: produits[2].id,
      },
    }),
    prisma.recetteTransformation.create({
      data: {
        nom: 'Transformation Sorgho en Semoule',
        description: 'Transformation du sorgho en semoule',
        rendementPercent: 88,
        dureeTotale: 100,
        pertePercent: 4,
        userId: user.id,
        matierePremiereId: matieres[3].id,
        produitFiniId: produits[3].id,
      },
    }),
  ]);

  console.log('✅ Recettes créées:', recettes.length);

  // 5. Transformations (historique)
  const transformations = await Promise.all([
    prisma.transformation.create({
      data: {
        quantiteMP: 100,
        quantitePF: 85,
        perteReelle: 5,
        pertePercent: 5,
        observations: 'Première transformation de mil',
        userId: user.id,
        recetteId: recettes[0].id,
        statut: 'termine',
        date: new Date(Date.now() - 86400000 * 5),
        dateFabrication: new Date(Date.now() - 86400000 * 5),
        dateExpiration: new Date(Date.now() + 86400000 * 25),
      },
    }),
    prisma.transformation.create({
      data: {
        quantiteMP: 50,
        quantitePF: 45,
        perteReelle: 1.5,
        pertePercent: 3,
        observations: 'Production de farine de maïs',
        userId: user.id,
        recetteId: recettes[1].id,
        statut: 'termine',
        date: new Date(Date.now() - 86400000 * 3),
        dateFabrication: new Date(Date.now() - 86400000 * 3),
        dateExpiration: new Date(Date.now() + 86400000 * 27),
      },
    }),
    prisma.transformation.create({
      data: {
        quantiteMP: 80,
        quantitePF: 36,
        perteReelle: 1.6,
        pertePercent: 2,
        observations: 'Extraction huile arachide',
        userId: user.id,
        recetteId: recettes[2].id,
        statut: 'termine',
        date: new Date(Date.now() - 86400000 * 2),
        dateFabrication: new Date(Date.now() - 86400000 * 2),
        dateExpiration: new Date(Date.now() + 86400000 * 58),
      },
    }),
    prisma.transformation.create({
      data: {
        quantiteMP: 60,
        quantitePF: 52.8,
        perteReelle: 2.4,
        pertePercent: 4,
        observations: 'Semoule de sorgho - batch #1',
        userId: user.id,
        recetteId: recettes[3].id,
        statut: 'en_cours',
        date: new Date(),
      },
    }),
  ]);

  console.log('✅ Transformations créées:', transformations.length);

  console.log('\n📊 Récapitulatif:');
  console.log(`   - ${matieres.length} matières premières`);
  console.log(`   - ${produits.length} produits finis`);
  console.log(`   - ${recettes.length} recettes`);
  console.log(`   - ${transformations.length} transformations`);
  console.log('\n🔐 Identifiants admin:');
  console.log('   Email: admin@agrotransform.com');
  console.log('   Mot de passe: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
