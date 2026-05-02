import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Utilisateur 1: Admin
    const adminExist = await prisma.user.findUnique({
      where: { email: 'admin@agrotransform.com' },
    });

    if (!adminExist) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@agrotransform.com',
          password: hashedPassword,
          nom: 'Administrateur',
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin créé: admin@agrotransform.com / admin123');
    } else {
      console.log('✅ Admin existe déjà: admin@agrotransform.com');
    }

    // Utilisateur 2: Transformateur
    const transfoExist = await prisma.user.findUnique({
      where: { email: 'transform@agrotransform.com' },
    });

    if (!transfoExist) {
      const hashedPassword = await bcrypt.hash('transform123', 10);
      await prisma.user.create({
        data: {
          email: 'transform@agrotransform.com',
          password: hashedPassword,
          nom: 'Transformateur Test',
          role: 'TRANSFORMATEUR',
        },
      });
      console.log('✅ Transformateur créé: transform@agrotransform.com / transform123');
    } else {
      console.log('✅ Transformateur existe déjà: transform@agrotransform.com');
    }

    // Utilisateur 3: Formateur
    const formExist = await prisma.user.findUnique({
      where: { email: 'formateur@agrotransform.com' },
    });

    if (!formExist) {
      const hashedPassword = await bcrypt.hash('form123', 10);
      await prisma.user.create({
        data: {
          email: 'formateur@agrotransform.com',
          password: hashedPassword,
          nom: 'Formateur Test',
          role: 'FORMATEUR',
        },
      });
      console.log('✅ Formateur créé: formateur@agrotransform.com / form123');
    } else {
      console.log('✅ Formateur existe déjà: formateur@agrotransform.com');
    }

    console.log('\n📝 Comptes de test disponibles:');
    console.log('   admin@agrotransform.com / admin123 (ADMIN)');
    console.log('   transform@agrotransform.com / transform123 (TRANSFORMATEUR)');
    console.log('   formateur@agrotransform.com / form123 (FORMATEUR)');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
