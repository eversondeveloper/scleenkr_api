/**
 * Erro operacional conhecido — algo que a aplicação prevê
 * (ex.: recurso não encontrado, payload inválido, regra de negócio violada).
 *
 * Uso:
 *   throw new AppError('Empresa não encontrada.', 404);
 *   throw new AppError('CNPJ já cadastrado.', 409);
 */
class AppError extends Error {
  /**
   * @param {string} message  - Mensagem legível para o cliente.
   * @param {number} statusCode - HTTP status code (padrão 400).
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';

    // Captura o stack trace sem incluir o construtor
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
