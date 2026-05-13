-- CreateTable
CREATE TABLE "CompletedDinner" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "allergies" TEXT,
    "favoriteCuisines" TEXT,
    "dinnerDate" TIMESTAMP(3),
    "dinnerTime" TEXT,
    "menu" TEXT,
    "notes" TEXT,
    "photoDataUrls" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedDinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompletedDinner_completedAt_idx" ON "CompletedDinner"("completedAt");

-- CreateIndex
CREATE INDEX "CompletedDinner_guestEmail_idx" ON "CompletedDinner"("guestEmail");
