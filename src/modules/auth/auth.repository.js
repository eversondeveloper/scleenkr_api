const pool = require('../../config/database');

const buscarPorCpf = async (cpf) => {
    const resultado = await pool.query(
        'SELECT * FROM atendentes WHERE cpf = $1 AND ativo = TRUE',
        [cpf]
    );
    return resultado.rows[0] || null;
};

module.exports = { buscarPorCpf };
