/*
  Warnings:

  - You are about to drop the column `userUserId` on the `recettes_transformation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "recettes_transformation" DROP CONSTRAINT "recettes_transformation_userUserId_fkey";

-- AlterTable
ALTER TABLE "recettes_transformation" DROP COLUMN "userUserId";

-- AddForeignKey
ALTER TABLE "recettes_transformation" ADD CONSTRAINT "recettes_transformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
