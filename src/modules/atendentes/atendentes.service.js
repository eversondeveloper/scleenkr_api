const repository = require('./atendentes.repository');
const AppError = require('../../shared/errors/AppError');

const listar = async (ativo, nome) => repository.obterTodos(ativo, nome);

const buscarPorId = async (idAtendente) => {
    const atendente = await repository.obterPorId(idAtendente);
    if (!atendente) throw new AppError('Atendente não encontrado.', 404);
    return atendente;
};

const criar = async (dados) => repository.criar(dados);

const atualizar = async (idAtendente, dados) => {
    const atendente = await repository.atualizar(idAtendente, dados);
    if (!atendente) throw new AppError('Atendente não encontrado.', 404);
    return atendente;
};

const desativar = async (idAtendente) => {
    await buscarPorId(idAtendente);
    await repository.desativar(idAtendente);
};

module.exports = { listar, buscarPorId, criar, atualizar, desativar };
