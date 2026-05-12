-- AlterTable
ALTER TABLE "sessoes_caixa" ADD COLUMN     "total_sangrias" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_suprimentos" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_vendas" DECIMAL(10,2) NOT NULL DEFAULT 0;
