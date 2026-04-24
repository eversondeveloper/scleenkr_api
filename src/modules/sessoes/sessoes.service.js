const repository = require('./sessoes.repository');
const AppError = require('../../shared/errors/AppError');

const listar = async () => repository.obterTodas();

const obterAtual = async () => repository.obterAtual();

const abrir = async (dados) => repository.abrir(dados);

const fechar = async (idSessao, dadosFechamento) => {
    const sessao = await repository.fechar(idSessao, dadosFechamento);
    if (!sessao) throw new AppError('Sessão não encontrada ou já está fechada.', 404);
    return sessao;
};

module.exports = { listar, obterAtual, abrir, fechar };
