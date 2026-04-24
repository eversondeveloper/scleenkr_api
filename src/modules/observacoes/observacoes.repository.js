const pool = require('../../config/database');

const obterPorData = async (data) => {
    const resultado = await pool.query(
        'SELECT * FROM observacoes_diarias WHERE data_observacao = $1',
        [data]
    );
    return resultado.rows[0] || null;
};

const obterPorPeriodo = async (inicio, fim) => {
    const resultado = await pool.query(
        `SELECT * FROM observacoes_diarias
         WHERE data_observacao BETWEEN $1 AND $2
         ORDER BY data_observacao ASC`,
        [inicio, fim]
    );
    return resultado.rows;
};

const salvar = async (data, texto, id_empresa) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consulta = `
            INSERT INTO observacoes_diarias (data_observacao, texto, id_empresa)
            VALUES ($1, $2, $3)
            ON CONFLICT (data_observacao)
            DO UPDATE SET texto = EXCLUDED.texto, data_criacao = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const resultado = await cliente.query(consulta, [data, texto, id_empresa]);
        await cliente.query('COMMIT');
        return resultado.rows[0];
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

const deletar = async (data) => {
    const resultado = await pool.query(
        'DELETE FROM observacoes_diarias WHERE data_observacao = $1 RETURNING *',
        [data]
    );
    return resultado.rows[0] || null;
};

module.exports = { obterPorData, obterPorPeriodo, salvar, deletar };
