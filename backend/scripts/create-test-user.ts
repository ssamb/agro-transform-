import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
    });

    if (existingUser) {
      console.log('✅ L\'utilisateur admin@test.com existe déjà');
      console.log('   Email:', existingUser.email);
      console.log('   Nom:', existingUser.nom);
      console.log('   Rôle:', existingUser.role);
      return;
    }

    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        nom: 'Admin User',
        role: 'ADMIN',
      },
    });

    console.log('✅ Utilisateur de test créé avec succès !');
    console.log('   Email: admin@test.com');
    console.log('   Mot de passe: admin123');
    console.log('   Nom:', user.nom);
    console.log('   Rôle:', user.role);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
