const { z } = require('zod');

const loginSchema = z.object({
    cpf:   z.string().min(11, 'CPF inválido.').max(14, 'CPF inválido.'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
});

module.exports = { loginSchema };
