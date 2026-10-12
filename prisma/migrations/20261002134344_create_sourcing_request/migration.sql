-- CreateEnum
CREATE TYPE "SourcingRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SPECIFICATIONS_CONFIRMED', 'SUPPLIER_SOURCING', 'CUSTOMER_CONFIRMATION', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SourcingRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "status" "SourcingRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "customerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourcingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourcingRequest_requestNumber_key" ON "SourcingRequest"("requestNumber");

-- CreateIndex
CREATE INDEX "SourcingRequest_customerId_idx" ON "SourcingRequest"("customerId");

-- CreateIndex
CREATE INDEX "SourcingRequest_status_idx" ON "SourcingRequest"("status");

-- CreateIndex
CREATE INDEX "SourcingRequest_createdAt_idx" ON "SourcingRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "SourcingRequest" ADD CONSTRAINT "SourcingRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
