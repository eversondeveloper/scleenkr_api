const service = require('./atendentes.service');

const listar = async (req, res) => {
    const { ativo, nome } = req.query;
    const atendentes = await service.listar(ativo ?? null, nome ?? null);
    res.status(200).json(atendentes);
};

const buscarPorId = async (req, res) => {
    const atendente = await service.buscarPorId(req.params.id);
    res.status(200).json(atendente);
};

const criar = async (req, res) => {
    const atendente = await service.criar(req.body);
    res.status(201).json({ mensagem: 'Atendente criado com sucesso.', atendente });
};

const atualizar = async (req, res) => {
    const atendente = await service.atualizar(req.params.id, req.body);
    res.status(200).json({ mensagem: 'Atendente atualizado com sucesso.', atendente });
};

const desativar = async (req, res) => {
    await service.desativar(req.params.id);
    res.status(200).json({ mensagem: 'Atendente desativado com sucesso.' });
};

module.exports = { listar, buscarPorId, criar, atualizar, desativar };
