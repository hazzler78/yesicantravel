-- CreateTable
CREATE TABLE "VisitorFeedback" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "comment" TEXT,
    "pageUrl" TEXT NOT NULL,
    "placeId" TEXT,
    "city" TEXT,
    "checkin" TEXT,
    "checkout" TEXT,
    "adults" INTEGER,
    "stayType" TEXT,
    "resultCount" INTEGER,
    "language" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorFeedback_createdAt_idx" ON "VisitorFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "VisitorFeedback_answer_createdAt_idx" ON "VisitorFeedback"("answer", "createdAt");
