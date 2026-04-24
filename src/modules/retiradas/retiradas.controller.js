const service = require('./retiradas.service');

const listar = async (req, res) => {
    const { inicio, fim } = req.query;
    const retiradas = await service.listar(inicio, fim);
    res.status(200).json(retiradas);
};

const criar = async (req, res) => {
    const retirada = await service.criar(req.body);
    res.status(201).json({ mensagem: 'Retirada registrada com sucesso.', retirada });
};

module.exports = { listar, criar };
