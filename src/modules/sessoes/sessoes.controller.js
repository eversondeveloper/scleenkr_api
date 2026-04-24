const service = require('./sessoes.service');

const listar = async (req, res) => {
    const sessoes = await service.listar();
    res.status(200).json(sessoes);
};

const obterAtual = async (req, res) => {
    const sessao = await service.obterAtual();
    res.status(200).json(sessao);
};

const abrir = async (req, res) => {
    const sessao = await service.abrir(req.body);
    res.status(201).json({ mensagem: 'Sessão de caixa aberta com sucesso.', sessao });
};

const fechar = async (req, res) => {
    const sessao = await service.fechar(req.params.id, req.body);
    res.status(200).json({ mensagem: 'Sessão de caixa fechada com sucesso.', sessao });
};

module.exports = { listar, obterAtual, abrir, fechar };
