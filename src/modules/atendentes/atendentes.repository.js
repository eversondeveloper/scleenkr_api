const pool = require('../../config/database');
const AppError = require('../../shared/errors/AppError');

const obterTodos = async (ativo = null, nome = null) => {
    let query = 'SELECT id_atendente, nome, email, telefone, cpf, id_empresa, ativo FROM atendentes WHERE 1=1';
    const params = [];

    if (ativo !== null) {
        query += ` AND ativo = $${params.length + 1}`;
        params.push(ativo === 'true');
    }
    if (nome) {
        query += ` AND nome ILIKE $${params.length + 1}`;
        params.push(`%${nome}%`);
    }
    query += ' ORDER BY nome';

    const resultado = await pool.query(query, params);
    return resultado.rows;
};

const obterPorId = async (idAtendente) => {
    const resultado = await pool.query(
        'SELECT id_atendente, nome, email, telefone, cpf, id_empresa, ativo FROM atendentes WHERE id_atendente = $1',
        [idAtendente]
    );
    return resultado.rows[0];
};

const criar = async (dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consulta = `
            INSERT INTO atendentes (nome, email, telefone, cpf, id_empresa, senha_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_atendente, nome, email, telefone, cpf, id_empresa, ativo
        `;
        const resultado = await cliente.query(consulta, [
            dados.nome,
            dados.email,
            dados.telefone,
            dados.cpf,
            dados.id_empresa,
            dados.senha_hash,   // já vem hasheado do service
        ]);
        await cliente.query('COMMIT');
        return resultado.rows[0];
    } catch (erro) {
        await cliente.query('ROLLBACK');
        if (erro.code === '23505') throw new AppError('Email ou CPF já cadastrado.', 409);
        throw erro;
    } finally {
        cliente.release();
    }
};

const atualizar = async (idAtendente, dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consulta = `
            UPDATE atendentes SET
                nome     = COALESCE($1, nome),
                email    = COALESCE($2, email),
                telefone = COALESCE($3, telefone),
                cpf      = COALESCE($4, cpf),
                ativo    = COALESCE($5, ativo)
            WHERE id_atendente = $6
            RETURNING id_atendente, nome, email, telefone, cpf, id_empresa, ativo
        `;
        const resultado = await cliente.query(consulta, [
            dados.nome,
            dados.email,
            dados.telefone,
            dados.cpf,
            dados.ativo,
            idAtendente,
        ]);
        await cliente.query('COMMIT');
        return resultado.rows[0];
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

const atualizarSenha = async (idAtendente, senhaHash) => {
    await pool.query(
        'UPDATE atendentes SET senha_hash = $1 WHERE id_atendente = $2',
        [senhaHash, idAtendente]
    );
};

const desativar = async (idAtendente) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const sessaoAberta = await cliente.query(
            "SELECT 1 FROM sessoes_caixa WHERE id_atendente = $1 AND status = 'aberta'",
            [idAtendente]
        );
        if (sessaoAberta.rows.length > 0) {
            await cliente.query('ROLLBACK');
            throw new AppError('Sessão de caixa aberta detectada. Feche o caixa antes de desativar.', 409);
        }
        await cliente.query(
            'UPDATE atendentes SET ativo = false WHERE id_atendente = $1',
            [idAtendente]
        );
        await cliente.query('COMMIT');
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

module.exports = { obterTodos, obterPorId, criar, atualizar, atualizarSenha, desativar };
