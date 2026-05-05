-- AlterTable
ALTER TABLE "transformations" ADD COLUMN     "dateExpiration" TIMESTAMP(3),
ADD COLUMN     "dateFabrication" TIMESTAMP(3),
ADD COLUMN     "dureeConservation" INTEGER,
ADD COLUMN     "pertePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "statut" TEXT NOT NULL DEFAULT 'en_cours';
