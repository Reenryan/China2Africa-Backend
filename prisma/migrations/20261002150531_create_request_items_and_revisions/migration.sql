-- CreateEnum
CREATE TYPE "RequestItemUnit" AS ENUM ('PIECE', 'PAIR', 'SET', 'BOX', 'CARTON', 'PACK', 'KG', 'TON', 'LITER', 'METER', 'ROLL', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestItemRevisionStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "RequestItemImageStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "RequestItem" (
    "id" TEXT NOT NULL,
    "sourcingRequestId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT,
    "specifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestItemRevision" (
    "id" TEXT NOT NULL,
    "requestItemId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specifications" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" "RequestItemUnit" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "RequestItemRevisionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "RequestItemRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestItemImage" (
    "id" TEXT NOT NULL,
    "requestItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "status" "RequestItemImageStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "RequestItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestItem_sourcingRequestId_idx" ON "RequestItem"("sourcingRequestId");

-- CreateIndex
CREATE INDEX "RequestItem_createdAt_idx" ON "RequestItem"("createdAt");

-- CreateIndex
CREATE INDEX "RequestItemRevision_requestItemId_idx" ON "RequestItemRevision"("requestItemId");

-- CreateIndex
CREATE INDEX "RequestItemRevision_categoryId_idx" ON "RequestItemRevision"("categoryId");

-- CreateIndex
CREATE INDEX "RequestItemRevision_status_idx" ON "RequestItemRevision"("status");

-- CreateIndex
CREATE INDEX "RequestItemRevision_createdAt_idx" ON "RequestItemRevision"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RequestItemRevision_requestItemId_revisionNumber_key" ON "RequestItemRevision"("requestItemId", "revisionNumber");

-- CreateIndex
CREATE INDEX "RequestItemImage_requestItemId_idx" ON "RequestItemImage"("requestItemId");

-- CreateIndex
CREATE INDEX "RequestItemImage_status_idx" ON "RequestItemImage"("status");

-- CreateIndex
CREATE INDEX "RequestItemImage_createdAt_idx" ON "RequestItemImage"("createdAt");

-- AddForeignKey
ALTER TABLE "RequestItem" ADD CONSTRAINT "RequestItem_sourcingRequestId_fkey" FOREIGN KEY ("sourcingRequestId") REFERENCES "SourcingRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItemRevision" ADD CONSTRAINT "RequestItemRevision_requestItemId_fkey" FOREIGN KEY ("requestItemId") REFERENCES "RequestItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItemRevision" ADD CONSTRAINT "RequestItemRevision_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestItemImage" ADD CONSTRAINT "RequestItemImage_requestItemId_fkey" FOREIGN KEY ("requestItemId") REFERENCES "RequestItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ensure quantity is always greater than zero
ALTER TABLE "RequestItemRevision"
ADD CONSTRAINT "RequestItemRevision_quantity_positive"
CHECK ("quantity" > 0);

-- Ensure only one confirmed revision exists per request item
CREATE UNIQUE INDEX "RequestItemRevision_one_confirmed_per_item"
ON "RequestItemRevision" ("requestItemId")
WHERE "status" = 'CONFIRMED';

-- Ensure only one confirmed image exists per request item
CREATE UNIQUE INDEX "RequestItemImage_one_confirmed_per_item"
ON "RequestItemImage" ("requestItemId")
WHERE "status" = 'CONFIRMED';
