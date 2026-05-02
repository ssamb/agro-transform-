-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR', 'OBSERVATEUR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TRANSFORMATEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matieres_premieres" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matieres_premieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits_finis" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_finis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recettes_transformation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "rendementPercent" DOUBLE PRECISION NOT NULL,
    "dureeTotale" INTEGER,
    "pertePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matierePremiereId" TEXT NOT NULL,
    "produitFiniId" TEXT NOT NULL,
    "userUserId" TEXT NOT NULL,

    CONSTRAINT "recettes_transformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapes" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "duree" INTEGER,
    "recetteId" TEXT NOT NULL,

    CONSTRAINT "etapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transformations" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantiteMP" DOUBLE PRECISION NOT NULL,
    "quantitePF" DOUBLE PRECISION NOT NULL,
    "perteReelle" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observations" TEXT,
    "userId" TEXT NOT NULL,
    "recetteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transformations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "recettes_transformation" ADD CONSTRAINT "recettes_transformation_matierePremiereId_fkey" FOREIGN KEY ("matierePremiereId") REFERENCES "matieres_premieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recettes_transformation" ADD CONSTRAINT "recettes_transformation_produitFiniId_fkey" FOREIGN KEY ("produitFiniId") REFERENCES "produits_finis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recettes_transformation" ADD CONSTRAINT "recettes_transformation_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapes" ADD CONSTRAINT "etapes_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "recettes_transformation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transformations" ADD CONSTRAINT "transformations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transformations" ADD CONSTRAINT "transformations_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "recettes_transformation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
