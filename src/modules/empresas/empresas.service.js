const repository = require('./empresas.repository');
const AppError = require('../../shared/errors/AppError');

/**
 * Service de Empresas — camada de regras de negócio.
 * Chama o repository para persistência; nunca toca o pool diretamente.
 *
 * Regras atuais:
 *  - Listagem e busca são pass-through (sem lógica adicional por enquanto).
 *  - Criação: nenhuma validação de CNPJ duplicado ainda (será adicionada na Fase 5 com Zod).
 *  - Deleção definitiva: operação destrutiva — apaga empresa e TODOS os registros vinculados.
 */

const listar = async () => repository.obterTodas();

const buscarPorId = async (id) => {
  const empresa = await repository.obterPorId(id);
  if (!empresa) throw new AppError('Empresa não encontrada.', 404);
  return empresa;
};

const criar = async (dados) => repository.criar(dados);

const atualizar = async (id, dados) => {
  const empresa = await repository.atualizar(id, dados);
  if (!empresa) throw new AppError('Empresa não encontrada para atualização.', 404);
  return empresa;
};

const deletarDefinitivo = async (id) => {
  const resultado = await repository.deletarDefinitivo(id);
  if (!resultado.sucesso) throw new AppError('Empresa não encontrada ou erro ao apagar.', 404);
  return resultado;
};

module.exports = { listar, buscarPorId, criar, atualizar, deletarDefinitivo };
