# EversCash API 🚀

A **EversCash API** é o núcleo de processamento do sistema de PDV (Ponto de Venda) e Gestão Financeira. Desenvolvida para oferecer rapidez e integridade de dados, ela gerencia desde o catálogo de produtos e controle de estoque até o fechamento detalhado de sessões de caixa e relatórios de vendas.

## 🛠️ Tecnologias Utilizadas

* **Runtime:** Node.js
* **Framework:** Express
* **Banco de Dados:** PostgreSQL
* **Integração:** RESTful API com suporte a CORS e Body-Parser

## 📊 Estrutura do Banco de Dados

O banco de dados deve ser criado com o nome `everscash03`. Abaixo está o Schema atualizado (v2026), que inclui suporte a auditoria de vendas editadas, referências de pagamentos digitais e contagem de itens por transação.

### Script de Inicialização (SQL)

```sql
-- EversCash Database Schema 2026
-- Nome do Banco de Dados: everscash03

BEGIN;

-- 1. Gestão de Empresas
CREATE TABLE empresas (
    id_empresa SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20),
    inscricao_estadual VARCHAR(30),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(100)
);

-- 2. Operadores e Atendentes
CREATE TABLE atendentes (
    id_atendente SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 3. Controle de Fluxo de Caixa (Sessões)
CREATE TABLE sessoes_caixa (
    id_sessao SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    id_atendente INTEGER REFERENCES atendentes(id_atendente) ON DELETE CASCADE,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP,
    valor_inicial NUMERIC DEFAULT 0,
    valor_final NUMERIC,
    status VARCHAR(20) DEFAULT 'aberta'
);

-- 4. Registro de Vendas
CREATE TABLE vendas (
    id_venda SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    id_atendente INTEGER REFERENCES atendentes(id_atendente),
    id_sessao INTEGER REFERENCES sessoes_caixa(id_sessao),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total_bruto NUMERIC NOT NULL,
    valor_pago_total NUMERIC NOT NULL,
    valor_troco NUMERIC DEFAULT 0,
    status_venda VARCHAR(50) DEFAULT 'Finalizada',
    quantidade_itens INTEGER DEFAULT 0,
    editada BOOLEAN DEFAULT FALSE
);

-- 5. Itens da Transação
CREATE TABLE itens_vendidos (
    id_item SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id_venda) ON DELETE CASCADE,
    categoria VARCHAR(100),
    descricao_item VARCHAR(255),
    preco_unitario NUMERIC NOT NULL,
    quantidade INTEGER NOT NULL,
    subtotal NUMERIC NOT NULL
);

-- 6. Detalhamento de Pagamentos
CREATE TABLE pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id_venda) ON DELETE CASCADE,
    metodo VARCHAR(50) NOT NULL,
    valor_pago NUMERIC NOT NULL,
    referencia_metodo VARCHAR(255)
);

-- 7. Catálogo de Produtos e Estoque
CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    preco NUMERIC NOT NULL,
    tipo_item VARCHAR(50),
    custo_unitario NUMERIC DEFAULT 0,
    estoque_atual INTEGER DEFAULT 0,
    codigo_barra VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE
);

-- 8. Sangrias e Retiradas
CREATE TABLE retiradas_caixa (
    id_retirada SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    data_retirada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor NUMERIC NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    observacao TEXT
);

-- 9. Relatórios e Notas Diárias
CREATE TABLE observacoes_diarias (
    id_observacao SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    data_observacao DATE UNIQUE NOT NULL,
    texto TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
```

## 🚀 Como Executar

1.  Certifique-se de ter o **PostgreSQL** instalado e crie a database `everscash03`.
2.  Execute o script SQL acima para gerar as tabelas.
3.  Configure as credenciais no arquivo `configuracaoBanco.js`.
4.  Instale as dependências: `npm install`.
5.  Inicie o servidor: `npm start`.

© 2026 Everscript - Todos os direitos reservados.
