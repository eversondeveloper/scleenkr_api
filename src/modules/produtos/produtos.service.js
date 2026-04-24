const repository = require('./produtos.repository');
const AppError = require('../../shared/errors/AppError');

const listar = async () => repository.obterTodos();

const buscarPorId = async (idProduto) => {
    const produto = await repository.obterPorId(idProduto);
    if (!produto) throw new AppError('Produto não encontrado.', 404);
    return produto;
};

const criar = async (dados) => repository.criar(dados);

const atualizar = async (idProduto, dados) => {
    const produto = await repository.atualizar(idProduto, dados);
    if (!produto) throw new AppError('Produto não encontrado.', 404);
    return produto;
};

const desativar = async (idProduto) => {
    const produto = await repository.desativar(idProduto);
    if (!produto) throw new AppError('Produto não encontrado.', 404);
    return produto;
};

module.exports = { listar, buscarPorId, criar, atualizar, desativar };
