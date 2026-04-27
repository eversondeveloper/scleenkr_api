-- CreateTable
CREATE TABLE "empresas" (
    "id_empresa" TEXT NOT NULL,
    "razao_social" VARCHAR(255) NOT NULL,
    "nome_fantasia" VARCHAR(255),
    "cnpj" VARCHAR(20),
    "inscricao_estadual" VARCHAR(50),
    "endereco" TEXT,
    "cidade" VARCHAR(100),
    "estado" CHAR(2),
    "cep" VARCHAR(10),
    "telefone" VARCHAR(20),
    "email" VARCHAR(100),
    "data_cadastro" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id_empresa")
);

-- CreateTable
CREATE TABLE "atendentes" (
    "id_atendente" TEXT NOT NULL,
    "id_empresa" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "telefone" VARCHAR(20),
    "cpf" VARCHAR(14),
    "ativo" BOOLEAN DEFAULT true,
    "data_cadastro" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atendentes_pkey" PRIMARY KEY ("id_atendente")
);

-- CreateTable
CREATE TABLE "sessoes_caixa" (
    "id_sessao" TEXT NOT NULL,
    "id_atendente" TEXT,
    "id_empresa" TEXT NOT NULL,
    "data_abertura" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "data_fechamento" TIMESTAMPTZ,
    "valor_inicial" DECIMAL(10,2) DEFAULT 0,
    "valor_final" DECIMAL(10,2),
    "status" VARCHAR(20) DEFAULT 'aberta',

    CONSTRAINT "sessoes_caixa_pkey" PRIMARY KEY ("id_sessao")
);

-- CreateTable
CREATE TABLE "retiradas_caixa" (
    "id_retirada" TEXT NOT NULL,
    "id_empresa" TEXT NOT NULL,
    "id_sessao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "motivo" VARCHAR(255),
    "observacao" TEXT,
    "data_retirada" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retiradas_caixa_pkey" PRIMARY KEY ("id_retirada")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id_produto" TEXT NOT NULL,
    "id_empresa" TEXT NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "custo_unitario" DECIMAL(10,2) DEFAULT 0.00,
    "estoque_atual" INTEGER DEFAULT 0,
    "tipo_item" VARCHAR(50) NOT NULL DEFAULT 'Serviço',
    "codigo_barra" VARCHAR(50),
    "ativo" BOOLEAN DEFAULT true,
    "data_cadastro" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id_produto")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id_venda" TEXT NOT NULL,
    "id_sessao" TEXT,
    "id_atendente" TEXT,
    "id_empresa" TEXT NOT NULL,
    "data_hora" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "valor_total_bruto" DECIMAL(10,2) NOT NULL,
    "valor_pago_total" DECIMAL(10,2) NOT NULL,
    "valor_troco" DECIMAL(10,2) DEFAULT 0,
    "quantidade_itens" INTEGER DEFAULT 0,
    "status_venda" VARCHAR(50) DEFAULT 'Finalizada',
    "editada" BOOLEAN DEFAULT false,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id_venda")
);

-- CreateTable
CREATE TABLE "itens_vendidos" (
    "id_item" TEXT NOT NULL,
    "venda_id" TEXT,
    "id_produto" TEXT,
    "categoria" VARCHAR(100),
    "descricao_item" TEXT NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_vendidos_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id_pagamento" TEXT NOT NULL,
    "venda_id" TEXT,
    "metodo" VARCHAR(50) NOT NULL,
    "valor_pago" DECIMAL(10,2) NOT NULL,
    "referencia_metodo" VARCHAR(255),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateTable
CREATE TABLE "observacoes_diarias" (
    "id_observacao" TEXT NOT NULL,
    "id_empresa" TEXT NOT NULL,
    "data_observacao" DATE NOT NULL,
    "texto" TEXT,
    "data_criacao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "observacoes_diarias_pkey" PRIMARY KEY ("id_observacao")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "atendentes_email_key" ON "atendentes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "atendentes_cpf_key" ON "atendentes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "observacoes_diarias_data_observacao_key" ON "observacoes_diarias"("data_observacao");

-- AddForeignKey
ALTER TABLE "atendentes" ADD CONSTRAINT "atendentes_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_caixa" ADD CONSTRAINT "sessoes_caixa_id_atendente_fkey" FOREIGN KEY ("id_atendente") REFERENCES "atendentes"("id_atendente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_caixa" ADD CONSTRAINT "sessoes_caixa_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiradas_caixa" ADD CONSTRAINT "retiradas_caixa_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiradas_caixa" ADD CONSTRAINT "retiradas_caixa_id_sessao_fkey" FOREIGN KEY ("id_sessao") REFERENCES "sessoes_caixa"("id_sessao") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_id_sessao_fkey" FOREIGN KEY ("id_sessao") REFERENCES "sessoes_caixa"("id_sessao") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_id_atendente_fkey" FOREIGN KEY ("id_atendente") REFERENCES "atendentes"("id_atendente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_vendidos" ADD CONSTRAINT "itens_vendidos_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id_venda") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id_venda") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observacoes_diarias" ADD CONSTRAINT "observacoes_diarias_id_empresa_fkey" FOREIGN KEY ("id_empresa") REFERENCES "empresas"("id_empresa") ON DELETE CASCADE ON UPDATE CASCADE;
