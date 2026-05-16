-- AlterTable
ALTER TABLE "AvailabilitySlot" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "dayOfWeek" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL;
