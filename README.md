# $cleenkr API 🚀

A **$cleenkr API** é o núcleo de processamento do ecossistema de PDV (Ponto de Venda) e Gestão Financeira focado em escalabilidade e automação. Desenvolvida para oferecer rapidez e integridade de dados, ela gerencia de forma centralizada múltiplos estabelecimentos, catálogos de produtos, sessões de caixa e auditorias de vendas.

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js
* **Framework:** Express
* **Banco de Dados:** PostgreSQL (Arquitetura Multi-tenant)
* **Integração:** RESTful API com suporte a CORS e processamento de dados via JSON.

## 📊 Estrutura do Banco de Dados

O banco de dados deve ser criado com o nome `scleenkr`. Abaixo está o Schema atualizado (v2026), otimizado para o modelo de startup SaaS, garantindo o isolamento de dados por empresa e suporte total a auditoria.

### Script de Inicialização (SQL)

```sql
-- $cleenkr Database Schema 2026
-- Nome do Banco de Dados: scleenkr

BEGIN;

-- 1. Gestão de Empresas (Unidades de Negócio)
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    inscricao_estadual VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado CHARACTER(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Operadores e Atendentes
CREATE TABLE IF NOT EXISTS atendentes (
    id_atendente SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Controle de Fluxo de Caixa (Sessões)
CREATE TABLE IF NOT EXISTS sessoes_caixa (
    id_sessao SERIAL PRIMARY KEY,
    id_atendente INTEGER REFERENCES atendentes(id_atendente),
    id_empresa INTEGER REFERENCES empresas(id_empresa),
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP,
    valor_inicial NUMERIC(10, 2) DEFAULT 0,
    valor_final NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'aberta'
);

-- 4. Registro de Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id_venda SERIAL PRIMARY KEY,
    id_sessao INTEGER REFERENCES sessoes_caixa(id_sessao),
    id_atendente INTEGER REFERENCES atendentes(id_atendente),
    id_empresa INTEGER REFERENCES empresas(id_empresa),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total_bruto NUMERIC(10, 2) NOT NULL,
    valor_pago_total NUMERIC(10, 2) NOT NULL,
    valor_troco NUMERIC(10, 2) DEFAULT 0,
    quantidade_itens INTEGER DEFAULT 0,
    status_venda VARCHAR(50) DEFAULT 'Finalizada',
    editada BOOLEAN DEFAULT FALSE
);

-- 5. Itens da Transação (Snapshot de Venda)
CREATE TABLE IF NOT EXISTS itens_vendidos (
    id_item SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id_venda) ON DELETE CASCADE,
    id_produto INTEGER,
    categoria VARCHAR(100),
    descricao_item TEXT NOT NULL,
    preco_unitario NUMERIC(10, 2) NOT NULL,
    quantidade INTEGER NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 6. Detalhamento de Pagamentos e Referências
CREATE TABLE IF NOT EXISTS pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id_venda) ON DELETE CASCADE,
    metodo VARCHAR(50) NOT NULL,
    valor_pago NUMERIC(10, 2) NOT NULL,
    referencia_metodo VARCHAR(255)
);

-- 7. Catálogo de Produtos e Gestão de Estoque
CREATE TABLE IF NOT EXISTS produtos (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa),
    categoria VARCHAR(100),
    descricao TEXT NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    custo_unitario NUMERIC(10, 2) DEFAULT 0,
    estoque_atual INTEGER DEFAULT 0,
    tipo_item VARCHAR(50) DEFAULT 'Produto',
    codigo_barra VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE
);

-- 8. Sangrias e Retiradas de Caixa
CREATE TABLE IF NOT EXISTS retiradas_caixa (
    id_retirada SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa),
    id_sessao INTEGER REFERENCES sessoes_caixa(id_sessao),
    valor NUMERIC(10, 2) NOT NULL,
    motivo VARCHAR(255),
    observacao TEXT,
    data_retirada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Relatórios e Observações Diárias
CREATE TABLE IF NOT EXISTS observacoes_diarias (
    id_observacao SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa),
    data_observacao DATE UNIQUE NOT NULL,
    texto TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
```

## 🚀 Como Executar

1.  Certifique-se de ter o **PostgreSQL** instalado e crie a database `scleenkr`.
2.  Execute o script SQL acima para gerar as tabelas.
3.  Configure as credenciais de acesso ao banco no arquivo de conexão.
4.  Instale as dependências: `npm install`.
5.  Inicie o servidor: `npm start`.

---
© 2026 $cleenkr - Tecnologia para Gestão e Escalabilidade Comercial.