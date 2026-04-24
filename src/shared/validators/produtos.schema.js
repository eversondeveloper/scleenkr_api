const { z } = require('zod');

const criarSchema = z.object({
    categoria:      z.string().min(1, 'Categoria é obrigatória.'),
    descricao:      z.string().min(1, 'Descrição é obrigatória.'),
    preco:          z.number({ required_error: 'Preço é obrigatório.' }).positive('Preço deve ser positivo.'),
    tipo_item:      z.enum(['Produto', 'Serviço']).optional(),
    custoUnitario:  z.number().min(0).optional(),
    estoqueAtual:   z.number().int().min(0).optional(),
    codigoBarra:    z.string().optional(),
    id_empresa:     z.number().int().positive(),
});

const atualizarSchema = z.object({
    categoria:     z.string().min(1).optional(),
    descricao:     z.string().min(1).optional(),
    preco:         z.number().positive().optional(),
    tipoItem:      z.enum(['Produto', 'Serviço']).optional(),
    custoUnitario: z.number().min(0).optional(),
    estoqueAtual:  z.number().int().min(0).optional(),
    codigoBarra:   z.string().optional(),
});

module.exports = { criarSchema, atualizarSchema };
