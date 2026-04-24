const service = require('./auth.service');

const login = async (req, res) => {
    const resultado = await service.login(req.body.cpf, req.body.senha);
    res.status(200).json(resultado);
};

module.exports = { login };
