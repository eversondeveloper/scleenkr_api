const { z } = require('zod');

const abrirSchema = z.object({
    id_atendente:  z.number({ required_error: 'id_atendente é obrigatório.' }).int().positive(),
    id_empresa:    z.number({ required_error: 'id_empresa é obrigatório.' }).int().positive(),
    valor_inicial: z.number().min(0).optional(),
});

const fecharSchema = z.object({
    valor_final: z.number().min(0).optional(),
});

module.exports = { abrirSchema, fecharSchema };
