const pool = require('../../config/database');
const AppError = require('../../shared/errors/AppError');

// ─── LEITURA ────────────────────────────────────────────────────────────────

const obterTodas = async () => {
    const consulta = `
        SELECT
            v.*,
            a.nome AS nome_atendente,
            a.cpf  AS cpf_atendente,
            (
                SELECT json_agg(item)
                FROM (
                    SELECT id_item, categoria, descricao_item, preco_unitario, quantidade, subtotal
                    FROM itens_vendidos
                    WHERE venda_id = v.id_venda
                ) item
            ) AS itens,
            (
                SELECT json_agg(p)
                FROM pagamentos p
                WHERE p.venda_id = v.id_venda
            ) AS pagamentos
        FROM vendas v
        LEFT JOIN sessoes_caixa sc ON v.id_sessao = sc.id_sessao
        LEFT JOIN atendentes    a  ON sc.id_atendente = a.id_atendente
        ORDER BY v.data_hora DESC
    `;
    const resultado = await pool.query(consulta);
    return resultado.rows;
};

const obterPorId = async (idVenda) => {
    const consulta = `
        SELECT v.*, a.nome AS nome_atendente, a.cpf AS cpf_atendente
        FROM vendas v
        LEFT JOIN sessoes_caixa sc ON v.id_sessao = sc.id_sessao
        LEFT JOIN atendentes    a  ON sc.id_atendente = a.id_atendente
        WHERE v.id_venda = $1
    `;
    const resultado = await pool.query(consulta, [idVenda]);
    const venda = resultado.rows[0];
    if (!venda) return null;

    venda.itens      = (await pool.query('SELECT * FROM itens_vendidos WHERE venda_id = $1', [idVenda])).rows;
    venda.pagamentos = (await pool.query('SELECT * FROM pagamentos     WHERE venda_id = $1', [idVenda])).rows;
    return venda;
};

// ─── CRIAÇÃO (transação ACID: vendas + pagamentos + itens_vendidos + produtos) ─

const criar = async (dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        const valorBruto = parseFloat(dados.valor_total_bruto ?? dados.valorTotalBruto ?? 0);
        const valorPago  = parseFloat(dados.valor_pago_total  ?? dados.valorPagoTotal  ?? 0);
        const valorTroco = parseFloat(dados.valor_troco       ?? dados.valorTroco      ?? 0);

        const itens      = dados.itens || [];
        const totalItens = itens.reduce((acc, i) => acc + parseFloat(i.quantidade || 0), 0);

        const resVenda = await cliente.query(
            `INSERT INTO vendas
                (valor_total_bruto, valor_pago_total, valor_troco, status_venda,
                 id_empresa, id_atendente, id_sessao, quantidade_itens, editada)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id_venda`,
            [
                valorBruto, valorPago, valorTroco,
                dados.statusVenda || 'Finalizada',
                dados.id_empresa, dados.id_atendente, dados.id_sessao,
                totalItens, false,
            ]
        );
        const idVenda = resVenda.rows[0].id_venda;

        for (const p of (dados.pagamentos || [])) {
            const vPago = parseFloat(p.valor_pago ?? p.valorPago ?? 0);
            await cliente.query(
                `INSERT INTO pagamentos (venda_id, metodo, valor_pago, referencia_metodo)
                 VALUES ($1, $2, $3, $4)`,
                [idVenda, p.metodo, isNaN(vPago) ? 0 : vPago, p.referencia_metodo ?? p.referenciaMetodo]
            );
        }

        for (const i of itens) {
            const preco = parseFloat(i.preco_unitario ?? i.precoUnitario ?? i.preco ?? 0);
            const qtd   = parseFloat(i.quantidade || 0);
            const nome  = i.descricao || i.descricao_item || i.descricaoItem || 'PRODUTO SEM NOME';

            await cliente.query(
                `INSERT INTO itens_vendidos
                    (venda_id, categoria, descricao_item, preco_unitario, quantidade, subtotal)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [idVenda, i.categoria || 'Geral', nome, preco, qtd, i.subtotal || preco * qtd]
            );

            if (i.id_produto) {
                await cliente.query(
                    'UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id_produto = $2',
                    [qtd, i.id_produto]
                );
            }
        }

        await cliente.query('COMMIT');
        return { idVenda };
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw new AppError(`Erro ao registrar venda: ${erro.message}`, 500);
    } finally {
        cliente.release();
    }
};

// ─── ATUALIZAÇÃO SIMPLES DE STATUS ──────────────────────────────────────────

const atualizarStatus = async (idVenda, status) => {
    const resultado = await pool.query(
        'UPDATE vendas SET status_venda = $1 WHERE id_venda = $2 RETURNING *',
        [status, idVenda]
    );
    return resultado.rows[0] || null;
};

// ─── ATUALIZAÇÃO COMPLETA (transação ACID: vendas + pagamentos) ─────────────

const atualizar = async (idVenda, dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        const res = await cliente.query(
            `UPDATE vendas SET
                valor_total_bruto = COALESCE($1, valor_total_bruto),
                valor_pago_total  = COALESCE($2, valor_pago_total),
                valor_troco       = COALESCE($3, valor_troco),
                editada           = true
             WHERE id_venda = $4
             RETURNING *`,
            [dados.valorTotalBruto, dados.valorPagoTotal, dados.valorTroco, idVenda]
        );

        if (res.rows.length === 0) {
            await cliente.query('ROLLBACK');
            return null;
        }

        if (dados.pagamentos?.length > 0) {
            await cliente.query('DELETE FROM pagamentos WHERE venda_id = $1', [idVenda]);
            for (const p of dados.pagamentos) {
                const vFinal = parseFloat(p.valor_pago ?? p.valorPago ?? 0);
                await cliente.query(
                    `INSERT INTO pagamentos (venda_id, metodo, valor_pago, referencia_metodo)
                     VALUES ($1, $2, $3, $4)`,
                    [idVenda, p.metodo, isNaN(vFinal) ? 0 : vFinal, p.referencia_metodo ?? p.referenciaMetodo ?? null]
                );
            }
        }

        await cliente.query('COMMIT');
        return res.rows[0];
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw new AppError(`Erro ao atualizar venda: ${erro.message}`, 500);
    } finally {
        cliente.release();
    }
};

// ─── EXCLUSÃO UNITÁRIA (transação ACID: pagamentos + itens_vendidos + vendas) ─

const apagar = async (idVenda) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        await cliente.query('DELETE FROM pagamentos     WHERE venda_id = $1', [idVenda]);
        await cliente.query('DELETE FROM itens_vendidos WHERE venda_id = $1', [idVenda]);
        const res = await cliente.query(
            'DELETE FROM vendas WHERE id_venda = $1 RETURNING id_venda',
            [idVenda]
        );
        await cliente.query('COMMIT');
        return res.rows.length > 0;
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw new AppError(`Erro ao apagar venda: ${erro.message}`, 500);
    } finally {
        cliente.release();
    }
};

// ─── EXCLUSÃO EM MASSA (transação ACID) ─────────────────────────────────────

const apagarEmMassa = async (idsVendas) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const placeholders = idsVendas.map((_, i) => `$${i + 1}`).join(', ');
        await cliente.query(`DELETE FROM pagamentos     WHERE venda_id IN (${placeholders})`, idsVendas);
        await cliente.query(`DELETE FROM itens_vendidos WHERE venda_id IN (${placeholders})`, idsVendas);
        const res = await cliente.query(
            `DELETE FROM vendas WHERE id_venda IN (${placeholders}) RETURNING id_venda`,
            idsVendas
        );
        await cliente.query('COMMIT');
        return res.rows.length;
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw new AppError(`Erro ao apagar vendas em massa: ${erro.message}`, 500);
    } finally {
        cliente.release();
    }
};

module.exports = { obterTodas, obterPorId, criar, atualizarStatus, atualizar, apagar, apagarEmMassa };
