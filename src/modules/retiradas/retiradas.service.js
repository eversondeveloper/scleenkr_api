const repository = require('./retiradas.repository');

const listar = async (inicio, fim) => repository.obterTodas(inicio, fim);

const criar = async (dados) => repository.criar(dados);

module.exports = { listar, criar };
