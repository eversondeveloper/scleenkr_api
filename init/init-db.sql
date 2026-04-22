-- $cleenkr Database Schema Corrigido 2026
-- Localização: ./init/init-db.sql

BEGIN;

-- 1. Tabela EMPRESAS (Dados Cadastrais)
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    inscricao_estadual VARCHAR(50),
    endereco TEXT,
    cidade VARCHAR(100),
    estado CHARACTER(2),
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela ATENDENTES (Operadores do Sistema)
CREATE TABLE IF NOT EXISTS atendentes (
    id_atendente SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela SESSOES_CAIXA (Controle de Fluxo Diário)
CREATE TABLE IF NOT EXISTS sessoes_caixa (
    id_sessao SERIAL PRIMARY KEY,
    id_atendente INTEGER REFERENCES atendentes(id_atendente),
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP WITH TIME ZONE,
    valor_inicial NUMERIC(10, 2) DEFAULT 0,
    valor_final NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'aberta'
);

-- 4. Tabela PRODUTOS (Catálogo de Itens)
CREATE TABLE IF NOT EXISTS produtos (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    custo_unitario NUMERIC(10, 2) DEFAULT 0.00,
    estoque_atual INTEGER DEFAULT 0,
    tipo_item VARCHAR(50) NOT NULL DEFAULT 'Serviço',
    codigo_barra VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela VENDAS (Registro de Cabeçalho)
CREATE TABLE IF NOT EXISTS vendas (
    id_venda SERIAL PRIMARY KEY,
    id_sessao INTEGER REFERENCES sessoes_caixa(id_sessao),
    id_atendente INTEGER REFERENCES atendentes(id_atendente),
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valor_total_bruto NUMERIC(10, 2) NOT NULL,
    valor_pago_total NUMERIC(10, 2) NOT NULL,
    valor_troco NUMERIC(10, 2) DEFAULT 0,
    quantidade_itens INTEGER DEFAULT 0,
    status_venda VARCHAR(50) DEFAULT 'Finalizada',
    editada BOOLEAN DEFAULT FALSE
);

-- 6. Tabela ITENS_VENDIDOS (Snapshot da Transação)
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

-- 7. Tabela PAGAMENTOS (Métodos de Recebimento)
CREATE TABLE IF NOT EXISTS pagamentos (
    id_pagamento SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id_venda) ON DELETE CASCADE,
    metodo VARCHAR(50) NOT NULL,
    valor_pago NUMERIC(10, 2) NOT NULL,
    referencia_metodo VARCHAR(255)
);

-- 8. Tabela RETIRADAS_CAIXA (Sangrias)
CREATE TABLE IF NOT EXISTS retiradas_caixa (
    id_retirada SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    id_sessao INTEGER REFERENCES sessoes_caixa(id_sessao),
    valor NUMERIC(10, 2) NOT NULL,
    motivo VARCHAR(255),
    observacao TEXT,
    data_retirada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tabela OBSERVACOES_DIARIAS
CREATE TABLE IF NOT EXISTS observacoes_diarias (
    id_observacao SERIAL PRIMARY KEY,
    id_empresa INTEGER REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    data_observacao DATE UNIQUE NOT NULL,
    texto TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INSERÇÃO DE EMPRESAS PARA TESTE
INSERT INTO empresas (razao_social, nome_fantasia, cnpj, cidade, estado, telefone, email) VALUES 
('Yakov Letreiros e Comunicação Visual', 'Yakov Letreiros', '00.000.000/0001-00', 'Rio de Janeiro', 'RJ', '(21) 9999-9999', 'contato@yakov.com.br'),
('Fast Cash Comércio LTDA', 'Fast Cash Store', '12.345.678/0001-90', 'São Paulo', 'SP', '(11) 9999-8888', 'contato@fastcash.com.br')
ON CONFLICT DO NOTHING;

-- CARGA INICIAL DE PRODUTOS ESPECÍFICOS (VINCULADOS À YAKOV LETREIROS - ID 1)
INSERT INTO produtos (id_empresa, categoria, descricao, preco, tipo_item, estoque_atual) VALUES
(1, 'Cópia', 'pb', 0.50, 'Serviço', 1000),
(1, 'Cópia', 'cl', 2.00, 'Serviço', 1000),
(1, 'Impressão', 'a4pb', 2.00, 'Serviço', 1000),
(1, 'Impressão', 'a4cl', 5.00, 'Serviço', 1000),
(1, 'Impressão', 'a3pb', 4.00, 'Serviço', 1000),
(1, 'Impressão', 'a3cl', 9.00, 'Serviço', 1000),
(1, 'Revelação', '3x4', 10.00, 'Serviço', 1000),
(1, 'Revelação', '10x15', 3.50, 'Serviço', 1000),
(1, 'Revelação', '15x20', 7.00, 'Serviço', 1000),
(1, 'Scan', 'a4', 1.50, 'Serviço', 1000),
(1, 'Scan', 'a3', 3.00, 'Serviço', 1000),
(1, 'Encadernação', '25 FLS', 10.00, 'Serviço', 1000),
(1, 'Encadernação', '50 FLS', 13.00, 'Serviço', 1000),
(1, 'Encadernação', '70 FLS', 18.00, 'Serviço', 1000),
(1, 'Encadernação', '85 FLS', 21.00, 'Serviço', 1000),
(1, 'Encadernação', '100 FLS', 23.00, 'Serviço', 1000),
(1, 'Encadernação', '120 FLS', 27.00, 'Serviço', 1000),
(1, 'Encadernação', '150 FLS', 29.00, 'Serviço', 1000),
(1, 'Encadernação', '160 FLS', 31.90, 'Serviço', 1000),
(1, 'Encadernação', '200 FLS', 42.90, 'Serviço', 1000),
(1, 'Encadernação', '250 FLS', 46.90, 'Serviço', 1000),
(1, 'Encadernação', '350 FLS', 52.90, 'Serviço', 1000),
(1, 'Encadernação', '400 FLS', 58.90, 'Serviço', 1000),
(1, 'Encadernação', '450 FLS', 63.90, 'Serviço', 1000),
(1, 'Documento', 'currículo 2 folhas + envelope', 10.00, 'Serviço', 1000),
(1, 'Documento', 'Contrato (somente digitação até 4 fls)', 40.00, 'Serviço', 1000),
(1, 'Documento', 'Boletim Ocorrência', 40.00, 'Serviço', 1000),
(1, 'Documento', 'MEI cancelamento', 30.00, 'Serviço', 1000),
(1, 'Documento', 'Envelope Pardo', 1.00, 'Produto', 1000),
(1, 'Papelaria', 'Cola Branca', 2.00, 'Produto', 1000),
(1, 'Papelaria', 'Cartolina', 2.50, 'Produto', 1000),
(1, 'Serviço', 'Currículo enviar por zap/email', 4.00, 'Serviço', 1000),
(1, 'Serviço', 'acesso a internet balcao', 2.00, 'Serviço', 1000),
(1, 'Serviço', 'agendamentos ( TODOS)', 10.00, 'Serviço', 1000),
(1, 'Documento', 'Alistamento Militar', 15.00, 'Serviço', 1000),
(1, 'Apostila Color', 'Apostila C/ 100 folhas', 79.90, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila C/ 200 Folhas', 139.90, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila C/ 25 folhas', 29.90, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila C/ 50 folhas', 49.00, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila Color C/ 100 folhas', 89.90, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila Color C/ 200 Folhas', 149.90, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila Color C/ 50 folhas', 65.90, 'Produto', 1000),
(1, 'Apostila Color', 'Apostila Color.C/ 25 folhas', 44.50, 'Produto', 1000),
(1, 'Papelaria', 'Blocão A3', 98.00, 'Produto', 1000),
(1, 'Papelaria', 'Caneta', 2.50, 'Produto', 1000),
(1, 'Documento', 'Certidão Negativa (cada site)', 10.00, 'Serviço', 1000),
(1, 'Documento', 'contra cheque (TODOS)', 10.00, 'Serviço', 1000),
(1, 'Documento', 'CPF ( CORREÇÃO DE DADOS)', 15.00, 'Serviço', 1000),
(1, 'Documento', 'cpf impresso colorido', 8.00, 'Serviço', 1000),
(1, 'Documento', 'CPF impresso colorido e plastficado', 10.00, 'Serviço', 1000),
(1, 'Documento', 'CPF impresso preto e branco', 8.00, 'Serviço', 1000),
(1, 'Documento', 'CPF impresso preto e branco plastificado', 9.00, 'Serviço', 1000),
(1, 'Serviço', 'digitaçao a4 cada folha', 10.00, 'Serviço', 1000),
(1, 'Serviço', 'Duda (cada)', 6.00, 'Serviço', 1000),
(1, 'Serviço', 'e-brat', 30.00, 'Serviço', 1000),
(1, 'Revelação', 'Foto 5x7 passaporte com data', 10.00, 'Serviço', 1000),
(1, 'Serviço', 'GOV.br cadastro/criação de senha', 20.00, 'Serviço', 1000),
(1, 'Serviço', 'GPS-previdendia social-inss', 6.00, 'Serviço', 1000),
(1, 'Serviço', 'grt cada', 6.00, 'Serviço', 1000),
(1, 'Plastificação', 'plastificação A3', 25.00, 'Serviço', 1000),
(1, 'Plastificação', 'plastificaçao A4', 14.00, 'Serviço', 1000),
(1, 'Plastificação', 'plastificaçao CPF', 7.00, 'Serviço', 1000),
(1, 'Plastificação', 'plastificaçao identidade', 9.00, 'Serviço', 1000),
(1, 'Plastificação', 'plastificaçao meia A4', 12.00, 'Serviço', 1000),
(1, 'Papelaria', 'Porta Retrato 10x15', 10.00, 'Produto', 1000),
(1, 'Papelaria', 'Porta Retrato com Vidro', 14.00, 'Produto', 1000),
(1, 'Revelação', 'Quadro Acrílico com Foto 10X15', 13.90, 'Serviço', 1000),
(1, 'Revelação', 'Quadro de madeira com vidro e foto 10X15', 16.90, 'Serviço', 1000),
(1, 'Papelaria', 'RESMA DE PAPEL A4', 32.90, 'Produto', 1000),
(1, 'Revelação', 'revelaçao kodak 15x20', 7.00, 'Serviço', 1000),
(1, 'Cópia', 'xerox A3 colorida', 6.00, 'Serviço', 1000),
(1, 'Cópia', 'xerox color', 2.00, 'Serviço', 1000),
(1, 'Cópia', 'xerox preto e branco A3', 2.50, 'Serviço', 1000),
(1, 'Papelaria', 'topo de bolo couche (editando)', 20.00, 'Produto', 1000),
(1, 'Serviço', 'SPC E SERASA CNPJ', 40.00, 'Serviço', 1000),
(1, 'Serviço', 'SPC E SERASA CPF', 25.00, 'Serviço', 1000);

COMMIT;