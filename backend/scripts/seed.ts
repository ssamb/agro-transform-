/**
 * Script de peuplement de la base de données
 * Exécuter avec : npx ts-node scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Nettoyer la base
  await prisma.transformation.deleteMany();
  await prisma.etape.deleteMany();
  await prisma.recetteTransformation.deleteMany();
  await prisma.produitFini.deleteMany();
  await prisma.matierePremiere.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base nettoyée');

  // Créer les utilisateurs
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@agrotransform.com',
      password: hashedPassword,
      nom: 'Administrateur',
      role: 'ADMIN',
    },
  });

  const transformateur = await prisma.user.create({
    data: {
      email: 'transform@agrotransform.com',
      password: hashedPassword,
      nom: 'Transformateur Demo',
      role: 'TRANSFORMATEUR',
    },
  });

  const formateur = await prisma.user.create({
    data: {
      email: 'formateur@agrotransform.com',
      password: hashedPassword,
      nom: 'Formateur Demo',
      role: 'FORMATEUR',
    },
  });

  await prisma.user.create({
    data: {
      email: 'observateur@agrotransform.com',
      password: hashedPassword,
      nom: 'Observateur Demo',
      role: 'OBSERVATEUR',
    },
  });

  console.log('✅ Utilisateurs créés');

  // Créer les matières premières
  const mil = await prisma.matierePremiere.create({
    data: {
      nom: 'Mil',
      categorie: 'Céréale',
      unite: 'kg',
      stock: 100,
      stockMin: 20,
      stockMax: 200,
    },
  });

  const mais = await prisma.matierePremiere.create({
    data: {
      nom: 'Maïs',
      categorie: 'Céréale',
      unite: 'kg',
      stock: 80,
      stockMin: 15,
      stockMax: 150,
    },
  });

  const arachide = await prisma.matierePremiere.create({
    data: {
      nom: 'Arachide',
      categorie: 'Légumineuse',
      unite: 'kg',
      stock: 50,
      stockMin: 10,
      stockMax: 100,
    },
  });

  console.log('✅ Matières premières créées');

  // Créer les produits finis
  const couscous = await prisma.produitFini.create({
    data: {
      nom: 'Couscous',
      categorie: 'Céréale transformée',
      unite: 'kg',
    },
  });

  const farine = await prisma.produitFini.create({
    data: {
      nom: 'Farine de maïs',
      categorie: 'Farine',
      unite: 'kg',
    },
  });

  const huile = await prisma.produitFini.create({
    data: {
      nom: "Huile d'arachide",
      categorie: 'Huile',
      unite: 'L',
    },
  });

  console.log('✅ Produits finis créés');

  // Créer les recettes
  const recetteCouscous = await prisma.recetteTransformation.create({
    data: {
      nom: 'Couscous de mil traditionnel',
      description: 'Transformation du mil en couscous par séchage et concassage',
      rendementPercent: 85,
      dureeTotale: 120,
      pertePercent: 5,
      matierePremiereId: mil.id,
      produitFiniId: couscous.id,
      userId: admin.id,
      etapes: {
        create: [
          { numero: 1, description: 'Nettoyage du mil', duree: 15 },
          { numero: 2, description: 'Trempage', duree: 30 },
          { numero: 3, description: 'Séchage', duree: 60 },
          { numero: 4, description: 'Concassage', duree: 15 },
        ],
      },
    },
  });

  const recetteFarine = await prisma.recetteTransformation.create({
    data: {
      nom: 'Farine de maïs',
      description: 'Mouture du maïs pour obtenir de la farine',
      rendementPercent: 90,
      dureeTotale: 60,
      pertePercent: 3,
      matierePremiereId: mais.id,
      produitFiniId: farine.id,
      userId: admin.id,
      etapes: {
        create: [
          { numero: 1, description: 'Nettoyage du maïs', duree: 10 },
          { numero: 2, description: 'Décorticage', duree: 20 },
          { numero: 3, description: 'Mouture', duree: 30 },
        ],
      },
    },
  });

  const recetteHuile = await prisma.recetteTransformation.create({
    data: {
      nom: 'Huile d\'arachide',
      description: 'Extraction de l\'huile d\'arachide par pression',
      rendementPercent: 45,
      dureeTotale: 180,
      pertePercent: 2,
      matierePremiereId: arachide.id,
      produitFiniId: huile.id,
      userId: admin.id,
      etapes: {
        create: [
          { numero: 1, description: 'Tri des arachides', duree: 20 },
          { numero: 2, description: 'Grillage', duree: 30 },
          { numero: 3, description: 'Décorticage', duree: 30 },
          { numero: 4, description: 'Pression', duree: 60 },
          { numero: 5, description: 'Filtrage', duree: 40 },
        ],
      },
    },
  });

  console.log('✅ Recettes créées');

  // Créer des transformations
  await prisma.transformation.create({
    data: {
      quantiteMP: 50,
      quantitePF: 42.5,
      perteReelle: 2.5,
      observations: 'Production normale',
      userId: transformateur.id,
      recetteId: recetteCouscous.id,
    },
  });

  await prisma.transformation.create({
    data: {
      quantiteMP: 30,
      quantitePF: 27,
      perteReelle: 0.9,
      observations: 'Bon rendement',
      userId: transformateur.id,
      recetteId: recetteFarine.id,
    },
  });

  console.log('✅ Transformations créées');

  console.log('🎉 Seed terminé avec succès !');
  console.log('\n📊 Récapitulatif:');
  console.log(`  - 4 utilisateurs`);
  console.log(`  - 3 matières premières`);
  console.log(`  - 3 produits finis`);
  console.log(`  - 3 recettes`);
  console.log(`  - 2 transformations`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
