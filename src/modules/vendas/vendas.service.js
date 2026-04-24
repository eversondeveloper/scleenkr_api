const repository = require('./vendas.repository');
const AppError   = require('../../shared/errors/AppError');

const obterTodas = () => repository.obterTodas();

const obterPorId = async (idVenda) => {
    const venda = await repository.obterPorId(idVenda);
    if (!venda) throw new AppError('Venda não encontrada.', 404);
    return venda;
};

const criar = (dados) => repository.criar(dados);

const atualizarStatus = async (idVenda, status) => {
    const venda = await repository.atualizarStatus(idVenda, status);
    if (!venda) throw new AppError('Venda não encontrada.', 404);
    return venda;
};

const atualizar = async (idVenda, dados) => {
    const venda = await repository.atualizar(idVenda, dados);
    if (!venda) throw new AppError('Venda não encontrada.', 404);
    return venda;
};

const apagar = async (idVenda) => {
    const apagou = await repository.apagar(idVenda);
    if (!apagou) throw new AppError('Venda não encontrada.', 404);
};

const apagarEmMassa = async (idsVendas) => {
    if (!idsVendas?.length) throw new AppError('Nenhum ID de venda informado.', 400);
    const deletadas = await repository.apagarEmMassa(idsVendas);
    return { deletadas };
};

module.exports = { obterTodas, obterPorId, criar, atualizarStatus, atualizar, apagar, apagarEmMassa };
