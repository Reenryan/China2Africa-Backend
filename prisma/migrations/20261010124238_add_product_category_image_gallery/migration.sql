/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductCategory" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
