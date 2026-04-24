const pool = require('../../config/database');

const obterTodas = async (inicio, fim) => {
    let query = `
        SELECT *,
            (data_retirada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_corrigida
        FROM retiradas_caixa
    `;
    const params = [];

    if (inicio && fim) {
        query += ` WHERE DATE(data_retirada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') BETWEEN $1 AND $2`;
        params.push(inicio, fim);
    }

    query += ' ORDER BY data_corrigida DESC';
    return (await pool.query(query, params)).rows;
};

const criar = async (dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const valor = typeof dados.valor === 'string'
            ? parseFloat(dados.valor.replace('R$', '').replace(',', '.'))
            : dados.valor;

        const resultado = await cliente.query(
            `INSERT INTO retiradas_caixa (valor, motivo, observacao, data_retirada, id_empresa)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [valor, dados.motivo, dados.observacao, dados.dataRetirada, dados.id_empresa]
        );
        await cliente.query('COMMIT');
        return resultado.rows[0];
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

module.exports = { obterTodas, criar };
