const service = require('./pagamentos.service');

const atualizar = async (req, res) => {
    const venda = await service.atualizar(req.params.id, req.body.pagamentos);
    res.status(200).json({ mensagem: 'Pagamentos atualizados com sucesso.', venda });
};

module.exports = { atualizar };
