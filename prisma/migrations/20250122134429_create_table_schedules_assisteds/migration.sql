-- CreateTable
CREATE TABLE "schedules_assisteds" (
    "id" TEXT NOT NULL,
    "schedule_mv_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_assisteds_pkey" PRIMARY KEY ("id")
);
