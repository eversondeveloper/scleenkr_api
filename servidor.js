const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const empresasRoutes    = require('./src/modules/empresas/empresas.routes');
const produtosRoutes    = require('./src/modules/produtos/produtos.routes');
const atendentesRoutes  = require('./src/modules/atendentes/atendentes.routes');
const retiradasRoutes   = require('./src/modules/retiradas/retiradas.routes');
const observacoesRoutes = require('./src/modules/observacoes/observacoes.routes');
const sessoesRoutes     = require('./src/modules/sessoes/sessoes.routes');
const pagamentosRoutes  = require('./src/modules/pagamentos/pagamentos.routes');
const vendasRoutes      = require('./src/modules/vendas/vendas.routes');
const errorHandler      = require('./src/middlewares/errorHandler');

const aplicativo = express();
const porta = 3000;

aplicativo.use(cors());
aplicativo.use(bodyParser.json());
aplicativo.use(bodyParser.urlencoded({ extended: true }));

// ========== MÓDULOS REFATORADOS (Strangler Fig) ==========
aplicativo.use('/empresas',            empresasRoutes);
aplicativo.use('/produtos',            produtosRoutes);
aplicativo.use('/atendentes',          atendentesRoutes);
aplicativo.use('/retiradas-caixa',     retiradasRoutes);
aplicativo.use('/observacoes-diarias', observacoesRoutes);
aplicativo.use('/sessoes-caixa',       sessoesRoutes);
aplicativo.use('/vendas',              pagamentosRoutes);
aplicativo.use('/vendas',              vendasRoutes);

aplicativo.use(errorHandler);

aplicativo.listen(porta, () => {
    console.log(`API EversCash rodando na porta ${porta}.`);
});
