/*
  Warnings:

  - Added the required column `cargo` to the `funcionarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_atualizacao` to the `funcionarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "funcionarios" ADD COLUMN     "cargo" VARCHAR(255) NOT NULL,
ADD COLUMN     "data_atualizacao" TIMESTAMPTZ NOT NULL;
