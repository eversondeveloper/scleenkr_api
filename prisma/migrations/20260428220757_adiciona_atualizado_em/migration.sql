/*
  Warnings:

  - Added the required column `data_atualizacao` to the `empresas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "data_atualizacao" TIMESTAMPTZ NOT NULL;
