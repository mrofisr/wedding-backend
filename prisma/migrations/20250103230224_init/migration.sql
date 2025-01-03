-- CreateEnum
CREATE TYPE "AttendingStatus" AS ENUM ('ATTENDING', 'NOT_ATTENDING', 'MAYBE');

-- CreateTable
CREATE TABLE "Wish" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attending" "AttendingStatus" NOT NULL,

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);
