const AppError = require('../shared/errors/AppError');

/**
 * Middleware central de tratamento de erros do Express.
 * Deve ser registrado DEPOIS de todas as rotas em app.js/servidor.js:
 *   app.use(errorHandler);
 *
 * Distingue erros operacionais conhecidos (AppError) de erros inesperados.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'erro',
      mensagem: err.message,
    });
  }

  // Erro inesperado — não vazar detalhes internos em produção
  console.error('[ERRO NÃO TRATADO]', err);

  return res.status(500).json({
    status: 'erro',
    mensagem: 'Erro interno do servidor.',
  });
}

module.exports = errorHandler;
