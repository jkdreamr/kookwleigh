-- CreateTable
CREATE TABLE "CompletedDinner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "allergies" TEXT,
    "favoriteCuisines" TEXT,
    "dinnerDate" DATETIME,
    "dinnerTime" TEXT,
    "menu" TEXT,
    "notes" TEXT,
    "photoDataUrls" TEXT,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "CompletedDinner_completedAt_idx" ON "CompletedDinner"("completedAt");

-- CreateIndex
CREATE INDEX "CompletedDinner_guestEmail_idx" ON "CompletedDinner"("guestEmail");
