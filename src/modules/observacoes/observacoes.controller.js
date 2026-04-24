const service = require('./observacoes.service');

const listar = async (req, res) => {
    const { data, fim } = req.query;
    const observacoes = await service.listarPorPeriodo(data, fim || data);
    res.status(200).json(observacoes);
};

const salvar = async (req, res) => {
    const { data, texto, id_empresa } = req.body;
    const observacao = await service.salvar(data, texto, id_empresa);
    res.status(200).json({ mensagem: 'Observação salva com sucesso.', observacao });
};

const deletar = async (req, res) => {
    const { data } = req.query;
    await service.deletar(data);
    res.status(200).json({ mensagem: 'Observação excluída com sucesso.' });
};

module.exports = { listar, salvar, deletar };
