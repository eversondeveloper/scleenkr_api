const { z } = require('zod');

const criarSchema = z.object({
    nome:       z.string().min(2, 'Nome é obrigatório.'),
    cpf:        z.string().min(11, 'CPF inválido.').max(14, 'CPF inválido.'),
    senha:      z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
    email:      z.string().email('Email inválido.').optional().or(z.literal('')),
    telefone:   z.string().optional(),
    id_empresa: z.number({ required_error: 'id_empresa é obrigatório.' }).int().positive(),
});

const atualizarSchema = z.object({
    nome:     z.string().min(2).optional(),
    email:    z.string().email().optional().or(z.literal('')),
    telefone: z.string().optional(),
    cpf:      z.string().min(11).max(14).optional(),
    ativo:    z.boolean().optional(),
});

const atualizarSenhaSchema = z.object({
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
});

module.exports = { criarSchema, atualizarSchema, atualizarSenhaSchema };
