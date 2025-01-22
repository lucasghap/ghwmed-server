/*
  Warnings:

  - Added the required column `user_id` to the `schedules_assisteds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules_assisteds" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "schedules_assisteds" ADD CONSTRAINT "schedules_assisteds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
