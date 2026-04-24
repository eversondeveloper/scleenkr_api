require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const bodyParser = require('body-parser');

const empresasRoutes    = require('./src/modules/empresas/empresas.routes');
const produtosRoutes    = require('./src/modules/produtos/produtos.routes');
const atendentesRoutes  = require('./src/modules/atendentes/atendentes.routes');
const retiradasRoutes   = require('./src/modules/retiradas/retiradas.routes');
const observacoesRoutes = require('./src/modules/observacoes/observacoes.routes');
const sessoesRoutes     = require('./src/modules/sessoes/sessoes.routes');
const pagamentosRoutes  = require('./src/modules/pagamentos/pagamentos.routes');
const vendasRoutes      = require('./src/modules/vendas/vendas.routes');
const authRoutes        = require('./src/modules/auth/auth.routes');
const authMiddleware    = require('./src/middlewares/authMiddleware');
const errorHandler      = require('./src/middlewares/errorHandler');
const { limiterGeral }  = require('./src/middlewares/rateLimiter');

const aplicativo = express();
const porta = process.env.PORT || 3000;

// ── Segurança ─────────────────────────────────────────────────────────────────
aplicativo.use(helmet());

const origensPermitidas = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

aplicativo.use(cors({
    origin: origensPermitidas,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

aplicativo.use(limiterGeral);

// ── Parsing ───────────────────────────────────────────────────────────────────
aplicativo.use(bodyParser.json());
aplicativo.use(bodyParser.urlencoded({ extended: true }));

// ── Rotas públicas (sem JWT) ──────────────────────────────────────────────────
aplicativo.use('/auth', authRoutes);

// ── Autenticação obrigatória a partir daqui ───────────────────────────────────
aplicativo.use(authMiddleware);

// ── Módulos protegidos ────────────────────────────────────────────────────────
aplicativo.use('/empresas',            empresasRoutes);
aplicativo.use('/produtos',            produtosRoutes);
aplicativo.use('/atendentes',          atendentesRoutes);
aplicativo.use('/retiradas-caixa',     retiradasRoutes);
aplicativo.use('/observacoes-diarias', observacoesRoutes);
aplicativo.use('/sessoes-caixa',       sessoesRoutes);
aplicativo.use('/vendas',              pagamentosRoutes);
aplicativo.use('/vendas',              vendasRoutes);

// ── Handler central de erros ──────────────────────────────────────────────────
aplicativo.use(errorHandler);

aplicativo.listen(porta, () => {
    console.log(`API EversCash rodando na porta ${porta}.`);
});
