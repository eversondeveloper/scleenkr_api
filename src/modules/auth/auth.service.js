const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const repository = require('./auth.repository');
const AppError   = require('../../shared/errors/AppError');

const login = async (cpf, senha) => {
    const atendente = await repository.buscarPorCpf(cpf);

    // Mensagem genérica intencional — não revelar se o CPF existe
    if (!atendente) throw new AppError('CPF ou senha inválidos.', 401);

    if (!atendente.senha_hash) {
        throw new AppError('Senha não configurada. Solicite ao administrador.', 401);
    }

    const senhaCorreta = await bcrypt.compare(senha, atendente.senha_hash);
    if (!senhaCorreta) throw new AppError('CPF ou senha inválidos.', 401);

    const token = jwt.sign(
        {
            id_atendente: atendente.id_atendente,
            id_empresa:   atendente.id_empresa,
            nome:         atendente.nome,
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return {
        token,
        atendente: {
            id_atendente: atendente.id_atendente,
            nome:         atendente.nome,
            id_empresa:   atendente.id_empresa,
        },
    };
};

module.exports = { login };
