const service = require('./produtos.service');

const listar = async (req, res) => {
    const produtos = await service.listar();
    res.status(200).json(produtos);
};

const buscarPorId = async (req, res) => {
    const produto = await service.buscarPorId(req.params.id);
    res.status(200).json(produto);
};

const criar = async (req, res) => {
    const produto = await service.criar(req.body);
    res.status(201).json(produto);
};

const atualizar = async (req, res) => {
    const produto = await service.atualizar(req.params.id, req.body);
    res.status(200).json(produto);
};

const desativar = async (req, res) => {
    await service.desativar(req.params.id);
    res.status(200).json({ mensagem: 'Produto desativado com sucesso.', idProduto: req.params.id });
};

module.exports = { listar, buscarPorId, criar, atualizar, desativar };
