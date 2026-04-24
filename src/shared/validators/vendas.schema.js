const { z } = require('zod');

const itemSchema = z.object({
    id_produto:     z.number().int().positive().optional(),
    categoria:      z.string().optional(),
    descricao:      z.string().min(1, 'Descrição do item é obrigatória.'),
    descricao_item: z.string().optional(),
    preco_unitario: z.number().min(0).optional(),
    preco:          z.number().min(0).optional(),
    quantidade:     z.number().positive('Quantidade deve ser positiva.'),
    subtotal:       z.number().min(0).optional(),
});

const pagamentoSchema = z.object({
    metodo:            z.string().min(1, 'Método de pagamento é obrigatório.'),
    valor_pago:        z.number().min(0).optional(),
    valorPago:         z.number().min(0).optional(),
    referencia_metodo: z.string().optional(),
    referenciaMetodo:  z.string().optional(),
});

const criarSchema = z.object({
    id_empresa:         z.number().int().positive(),
    id_sessao:          z.number().int().positive(),
    id_atendente:       z.number().int().positive().optional(),
    valor_total_bruto:  z.number().min(0).optional(),
    valorTotalBruto:    z.number().min(0).optional(),
    valor_pago_total:   z.number().min(0).optional(),
    valorPagoTotal:     z.number().min(0).optional(),
    valor_troco:        z.number().min(0).optional(),
    valorTroco:         z.number().min(0).optional(),
    statusVenda:        z.string().optional(),
    itens:      z.array(itemSchema).min(1, 'Venda deve ter pelo menos 1 item.'),
    pagamentos: z.array(pagamentoSchema).min(1, 'Venda deve ter pelo menos 1 pagamento.'),
});

const atualizarStatusSchema = z.object({
    status: z.string().min(1, 'Status é obrigatório.'),
});

module.exports = { criarSchema, atualizarStatusSchema };
