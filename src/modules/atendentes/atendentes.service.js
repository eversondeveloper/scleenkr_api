const bcrypt     = require('bcryptjs');
const repository = require('./atendentes.repository');
const AppError   = require('../../shared/errors/AppError');

const listar = (ativo, nome) => repository.obterTodos(ativo, nome);

const buscarPorId = async (idAtendente) => {
    const atendente = await repository.obterPorId(idAtendente);
    if (!atendente) throw new AppError('Atendente não encontrado.', 404);
    return atendente;
};

const criar = async (dados) => {
    const senhaHash = await bcrypt.hash(dados.senha, 12);
    return repository.criar({ ...dados, senha_hash: senhaHash });
};

const atualizar = async (idAtendente, dados) => {
    const atendente = await repository.atualizar(idAtendente, dados);
    if (!atendente) throw new AppError('Atendente não encontrado.', 404);
    return atendente;
};

const atualizarSenha = async (idAtendente, senha) => {
    await buscarPorId(idAtendente);   // lança 404 se não existir
    const senhaHash = await bcrypt.hash(senha, 12);
    await repository.atualizarSenha(idAtendente, senhaHash);
};

const desativar = async (idAtendente) => {
    await buscarPorId(idAtendente);
    await repository.desativar(idAtendente);
};

module.exports = { listar, buscarPorId, criar, atualizar, atualizarSenha, desativar };
