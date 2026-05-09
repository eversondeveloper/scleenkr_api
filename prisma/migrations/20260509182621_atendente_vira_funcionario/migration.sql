/*
  Warnings:

  - You are about to drop the column `id_atendente` on the `sessoes_caixa` table. All the data in the column will be lost.
  - You are about to drop the column `id_atendente` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the `atendentes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "atendentes" DROP CONSTRAINT "atendentes_id_empresa_fkey";

-- DropForeignKey
ALTER TABLE "sessoes_caixa" DROP CONSTRAINT "sessoes_caixa_id_atendente_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_id_atendente_fkey";

-- AlterTable
ALTER TABLE "sessoes_caixa" DROP COLUMN "id_atendente",
ADD COLUMN     "id_funcionario" TEXT;

-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "id_atendente",
ADD COLUMN     "id_funcionario" TEXT;

-- DropTable
DROP TABLE "atendentes";

-- CreateTable
CREATE TABLE "funcionarios" (
    "id_funcionario" TEXT NOT NULL,
    "id_empresa" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefone" VARCHAR(20),
    "cpf" VARCHAR(14),
    "ativo" BOOLEAN DEFAULT true,
    "data_cadastro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id_funcionario")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_caixa" ADD CONSTRAINT "sessoes_caixa_id_funcionario_fkey" FOREIGN KEY ("id_funcionario") REFERENCES "funcionarios"("id_funcionario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_id_funcionario_fkey" FOREIGN KEY ("id_funcionario") REFERENCES "funcionarios"("id_funcionario") ON DELETE SET NULL ON UPDATE CASCADE;
