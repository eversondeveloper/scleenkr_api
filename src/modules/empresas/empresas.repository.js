const pool = require('../../config/database');

/**
 * Repository de Empresas — única camada que toca o banco.
 * Todas as queries são escopadas por id_empresa (modelo multi-tenant).
 *
 * Convenção de nomenclatura:
 *  - camelCase nos parâmetros JS
 *  - snake_case nos campos SQL (conforme schema existente)
 */

/**
 * Helper interno: deleta registros de uma tabela apenas se a coluna existir.
 * Preservado do legado para suportar a deleção definitiva com segurança.
 */

// Essa função é EXTREMAMENTE PERIGOSA e nem deveria existir.
async function deletarSeColunaExistir(cliente, tabela, coluna, valor) {
  const check = await cliente.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [tabela, coluna]
  );
  if (check.rows.length > 0) {
    await cliente.query(`DELETE FROM ${tabela} WHERE ${coluna} = $1`, [valor]);
    // ponto de atenção na linha a cima, ela está variável a SQL Injection, uma vulnerabilidade extretamente perigosa
    // que permite o atacante a executar querys na nossa base de dados. Dessa forma, ele pode roubar informações confidenciais 
    // e o cliente poderia processar a empresa/scleenkr (e com razão). 
  }
}

// ── Leitura ──────────────────────────────────────────────────────────────────

const obterTodas = async () => {
  const res = await pool.query('SELECT * FROM empresas ORDER BY id_empresa ASC');
  return res.rows;
};

const obterPorId = async (id) => {
  const res = await pool.query('SELECT * FROM empresas WHERE id_empresa = $1', [id]);
  return res.rows[0] || null;
};

// ── Escrita ──────────────────────────────────────────────────────────────────

const criar = async (d) => {
  const sql = `
    INSERT INTO empresas
      (razao_social, nome_fantasia, cnpj, inscricao_estadual,
       endereco, cidade, estado, cep, telefone, email)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`;
  const res = await pool.query(sql, [
    d.razaoSocial, d.nomeFantasia, d.cnpj, d.inscricaoEstadual,
    d.endereco, d.cidade, d.estado, d.cep, d.telefone, d.email,
  ]);
  return res.rows[0];
};

const atualizar = async (id, d) => {
  const sql = `
    UPDATE empresas SET
      razao_social      = COALESCE($1,  razao_social),
      nome_fantasia     = COALESCE($2,  nome_fantasia),
      cnpj              = COALESCE($3,  cnpj),
      inscricao_estadual= COALESCE($4,  inscricao_estadual),
      endereco          = COALESCE($5,  endereco),
      cidade            = COALESCE($6,  cidade),
      estado            = COALESCE($7,  estado),
      cep               = COALESCE($8,  cep),
      telefone          = COALESCE($9,  telefone),
      email             = COALESCE($10, email)
    WHERE id_empresa = $11
    RETURNING *`;
  const res = await pool.query(sql, [
    d.razaoSocial, d.nomeFantasia, d.cnpj, d.inscricaoEstadual,
    d.endereco, d.cidade, d.estado, d.cep, d.telefone, d.email, id,
  ]);
  return res.rows[0] || null;
};

/**
 * Deleção definitiva com CASCADE manual — apaga empresa e todos os registros
 * vinculados em uma única transação ACID.
 *
 * A ordem de deleção respeita as FKs:
 *   pagamentos → itens_vendidos → vendas → sessoes_caixa →
 *   retiradas_caixa → atendentes → produtos → observacoes_diarias → empresas
 */
const deletarDefinitivo = async (idEmpresa) => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    await cliente.query(
      'DELETE FROM pagamentos WHERE venda_id IN (SELECT id_venda FROM vendas WHERE id_empresa = $1)',
      [idEmpresa]
    );
    await cliente.query(
      'DELETE FROM itens_vendidos WHERE venda_id IN (SELECT id_venda FROM vendas WHERE id_empresa = $1)',
      [idEmpresa]
    );

    const tabelas = ['vendas', 'sessoes_caixa', 'retiradas_caixa', 'atendentes', 'produtos', 'observacoes_diarias'];
    for (const t of tabelas) {
      await deletarSeColunaExistir(cliente, t, 'id_empresa', idEmpresa);
    }

    const res = await cliente.query(
      'DELETE FROM empresas WHERE id_empresa = $1 RETURNING *',
      [idEmpresa]
    );

    await cliente.query('COMMIT');
    return { sucesso: res.rows.length > 0 };
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
};

module.exports = { obterTodas, obterPorId, criar, atualizar, deletarDefinitivo };
