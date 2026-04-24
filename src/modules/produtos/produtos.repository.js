const pool = require('../../config/database');

const obterTodos = async () => {
    const consulta = `
        SELECT p.*, COALESCE(SUM(iv.quantidade), 0) AS total_vendido
        FROM produtos p
        LEFT JOIN itens_vendidos iv
            ON p.categoria = iv.categoria AND p.descricao = iv.descricao_item
        WHERE p.ativo = TRUE
        GROUP BY p.id_produto
        ORDER BY p.id_produto ASC
    `;
    const resultado = await pool.query(consulta);
    return resultado.rows.map(row => ({
        ...row,
        total_vendido: parseInt(row.total_vendido, 10) || 0,
    }));
};

const obterPorId = async (idProduto) => {
    const resultado = await pool.query(
        'SELECT * FROM produtos WHERE id_produto = $1',
        [idProduto]
    );
    return resultado.rows[0];
};

const criar = async (dados) => {
    const consulta = `
        INSERT INTO produtos
            (categoria, descricao, preco, tipo_item, custo_unitario, estoque_atual, codigo_barra, id_empresa)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const valores = [
        dados.categoria,
        dados.descricao,
        dados.preco,
        dados.tipoItem || 'Serviço',
        dados.custoUnitario || 0,
        dados.estoqueAtual || 0,
        dados.codigoBarra,
        dados.id_empresa,
    ];
    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0];
};

const atualizar = async (idProduto, dados) => {
    const consulta = `
        UPDATE produtos SET
            categoria      = COALESCE($1, categoria),
            descricao      = COALESCE($2, descricao),
            preco          = COALESCE($3, preco),
            tipo_item      = COALESCE($4, tipo_item),
            custo_unitario = COALESCE($5, custo_unitario),
            estoque_atual  = COALESCE($6, estoque_atual),
            codigo_barra   = COALESCE($7, codigo_barra)
        WHERE id_produto = $8
        RETURNING *
    `;
    const valores = [
        dados.categoria,
        dados.descricao,
        dados.preco,
        dados.tipoItem,
        dados.custoUnitario,
        dados.estoqueAtual,
        dados.codigoBarra,
        idProduto,
    ];
    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0];
};

const desativar = async (idProduto) => {
    const resultado = await pool.query(
        'UPDATE produtos SET ativo = FALSE WHERE id_produto = $1 RETURNING *',
        [idProduto]
    );
    return resultado.rows[0];
};

module.exports = { obterTodos, obterPorId, criar, atualizar, desativar };
