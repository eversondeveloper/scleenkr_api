const service = require('./vendas.service');

const listar = async (req, res) => {
    const vendas = await service.obterTodas();
    res.status(200).json(vendas);
};

const obterPorId = async (req, res) => {
    const venda = await service.obterPorId(parseInt(req.params.id));
    res.status(200).json(venda);
};

const criar = async (req, res) => {
    const { idVenda } = await service.criar(req.body);
    res.status(201).json({ mensagem: 'Venda criada com sucesso.', idVenda });
};

const atualizarStatus = async (req, res) => {
    const venda = await service.atualizarStatus(parseInt(req.params.id), req.body.status);
    res.status(200).json({ mensagem: `Status da venda atualizado para ${venda.status_venda}.` });
};

const atualizar = async (req, res) => {
    const venda = await service.atualizar(parseInt(req.params.id), req.body);
    res.status(200).json({ mensagem: 'Venda atualizada com sucesso.', venda });
};

const apagar = async (req, res) => {
    await service.apagar(parseInt(req.params.id));
    res.status(200).json({ mensagem: `Venda ${req.params.id} apagada com sucesso.` });
};

const apagarEmMassa = async (req, res) => {
    const resultado = await service.apagarEmMassa(req.body.idsVendas);
    res.status(200).json({ mensagem: `${resultado.deletadas} vendas apagadas.`, ...resultado });
};

module.exports = { listar, obterPorId, criar, atualizarStatus, atualizar, apagar, apagarEmMassa };
