const pool = require('../../config/database');
const AppError = require('../../shared/errors/AppError');

const obterTodas = async () => {
    const consulta = `
        SELECT sc.*, a.nome AS nome_atendente
        FROM sessoes_caixa sc
        LEFT JOIN atendentes a ON sc.id_atendente = a.id_atendente
        ORDER BY sc.data_abertura DESC
    `;
    return (await pool.query(consulta)).rows;
};

const obterAtual = async () => {
    const consulta = `
        SELECT sc.*, a.nome AS nome_atendente
        FROM sessoes_caixa sc
        LEFT JOIN atendentes a ON sc.id_atendente = a.id_atendente
        WHERE sc.status = 'aberta'
        ORDER BY sc.data_abertura DESC
        LIMIT 1
    `;
    return (await pool.query(consulta)).rows[0] || null;
};

const abrir = async (dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        const sessaoAberta = await cliente.query(
            "SELECT 1 FROM sessoes_caixa WHERE id_atendente = $1 AND status = 'aberta'",
            [dados.id_atendente]
        );
        if (sessaoAberta.rows.length > 0) {
            await cliente.query('ROLLBACK');
            throw new AppError('Já existe uma sessão de caixa aberta para este atendente.', 409);
        }

        const resultado = await cliente.query(
            `INSERT INTO sessoes_caixa (id_atendente, valor_inicial, id_empresa)
             VALUES ($1, $2, $3) RETURNING *`,
            [dados.id_atendente, dados.valor_inicial || 0, dados.id_empresa]
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

const fechar = async (idSessao, dadosFechamento) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const valorFinal = parseFloat(dadosFechamento?.valor_final) || 0;
        const resultado = await cliente.query(
            `UPDATE sessoes_caixa
             SET data_fechamento = CURRENT_TIMESTAMP, valor_final = $1, status = 'fechada'
             WHERE id_sessao = $2 AND status = 'aberta'
             RETURNING *`,
            [valorFinal, idSessao]
        );
        await cliente.query('COMMIT');
        return resultado.rows[0] || null;
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

module.exports = { obterTodas, obterAtual, abrir, fechar };
