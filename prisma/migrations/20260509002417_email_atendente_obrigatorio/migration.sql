/*
  Warnings:

  - Made the column `email` on table `atendentes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data_cadastro` on table `atendentes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "atendentes" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "data_cadastro" SET NOT NULL;
