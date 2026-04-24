const pool = require('../../config/database');

const atualizarDaVenda = async (idVenda, novosPagamentos) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        await cliente.query('DELETE FROM pagamentos WHERE venda_id = $1', [idVenda]);

        for (const p of novosPagamentos) {
            const valorFinal = parseFloat(p.valor_pago ?? p.valorPago ?? 0);
            await cliente.query(
                `INSERT INTO pagamentos (venda_id, metodo, valor_pago, referencia_metodo)
                 VALUES ($1, $2, $3, $4)`,
                [idVenda, p.metodo || 'Dinheiro', isNaN(valorFinal) ? 0 : valorFinal, p.referencia_metodo ?? p.referenciaMetodo ?? null]
            );
        }

        const resTotais = await cliente.query(
            'SELECT SUM(valor_pago) AS total FROM pagamentos WHERE venda_id = $1',
            [idVenda]
        );
        const totalPago = parseFloat(resTotais.rows[0].total) || 0;

        const resVenda = await cliente.query(
            `UPDATE vendas
             SET valor_pago_total = $1,
                 valor_troco      = GREATEST($1 - valor_total_bruto, 0),
                 editada          = true
             WHERE id_venda = $2
             RETURNING *`,
            [totalPago, idVenda]
        );

        await cliente.query('COMMIT');
        return resVenda.rows[0];
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

module.exports = { atualizarDaVenda };
