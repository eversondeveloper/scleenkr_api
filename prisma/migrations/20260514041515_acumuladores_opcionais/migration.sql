-- AlterTable
ALTER TABLE "sessoes_caixa" ALTER COLUMN "total_sangrias" DROP NOT NULL,
ALTER COLUMN "total_suprimentos" DROP NOT NULL,
ALTER COLUMN "total_vendas" DROP NOT NULL,
ALTER COLUMN "total_retiradas" DROP NOT NULL;
