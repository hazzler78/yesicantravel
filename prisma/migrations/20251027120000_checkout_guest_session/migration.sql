-- CreateTable
CREATE TABLE "CheckoutGuestSession" (
    "prebookId" TEXT NOT NULL,
    "clientReference" TEXT,
    "holder" JSONB NOT NULL,
    "stayContext" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutGuestSession_pkey" PRIMARY KEY ("prebookId")
);

-- CreateTable
CREATE TABLE "CheckoutEvent" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "prebookId" TEXT,
    "transactionId" TEXT,
    "offerId" TEXT,
    "hotelId" TEXT,
    "errorCode" INTEGER,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutGuestSession_expiresAt_idx" ON "CheckoutGuestSession"("expiresAt");

-- CreateIndex
CREATE INDEX "CheckoutEvent_kind_createdAt_idx" ON "CheckoutEvent"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutEvent_prebookId_createdAt_idx" ON "CheckoutEvent"("prebookId", "createdAt");
