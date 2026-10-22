/*
  Warnings:

  - You are about to drop the column `theme` on the `Whiteboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Whiteboard"
ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE "Whiteboard"
SET "settings" = jsonb_build_object('theme', "theme");

ALTER TABLE "Whiteboard"
DROP COLUMN "theme";
