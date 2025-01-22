/*
  Warnings:

  - Changed the type of `schedule_mv_id` on the `schedules_assisteds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "schedules_assisteds" DROP COLUMN "schedule_mv_id",
ADD COLUMN     "schedule_mv_id" INTEGER NOT NULL;
