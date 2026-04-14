const { Pool } = require('pg');
const configuracao = require('./configuracaoBanco');

const pool = new Pool(configuracao);

/**
 * FUNÇÃO AUXILIAR DE LIMPEZA SEGURA
 */
const deletarSeColunaExistir = async (cliente, tabela, coluna, valor) => {
    try {
        const check = await cliente.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = $2
        `, [tabela, coluna]);

        if (check.rows.length > 0) {
            await cliente.query(`DELETE FROM ${tabela} WHERE ${coluna} = $1`, [valor]);
        }
    } catch (e) {
        console.warn(`Aviso: Falha ao limpar tabela ${tabela}. Prosseguindo...`);
    }
};

// ========== FUNÇÕES PARA ATENDENTES ==========

const obterAtendentes = async (ativo = null, nome = null) => {
    let query = 'SELECT * FROM atendentes WHERE 1=1';
    const params = [];
    if (ativo !== null) {
        query += ' AND ativo = $1';
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

const obterAtendentePorId = async (idAtendente) => {
    const consulta = 'SELECT * FROM atendentes WHERE id_atendente = $1';
    const resultado = await pool.query(consulta, [idAtendente]);
    return resultado.rows[0];
};

const criarAtendente = async (dadosAtendente) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consulta = `
            INSERT INTO atendentes (nome, email, telefone, cpf, id_empresa) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const valores = [
            dadosAtendente.nome, 
            dadosAtendente.email, 
            dadosAtendente.telefone, 
            dadosAtendente.cpf,
            dadosAtendente.id_empresa
        ];
        const resultado = await cliente.query(consulta, valores);
        await cliente.query('COMMIT');
        return { sucesso: true, atendente: resultado.rows[0] };
    } catch (erro) {
        await cliente.query('ROLLBACK');
        if (erro.code === '23505') return { sucesso: false, erro: 'Email ou CPF já cadastrado' };
        return { sucesso: false, erro: erro.message };
    } finally { cliente.release(); }
};

const atualizarAtendente = async (idAtendente, dadosAtendente) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consulta = `
            UPDATE atendentes SET nome = COALESCE($1, nome), email = COALESCE($2, email),
            telefone = COALESCE($3, telefone), cpf = COALESCE($4, cpf), ativo = COALESCE($5, ativo)
            WHERE id_atendente = $6 RETURNING *
        `;
        const valores = [dadosAtendente.nome, dadosAtendente.email, dadosAtendente.telefone, dadosAtendente.cpf, dadosAtendente.ativo, idAtendente];
        const resultado = await cliente.query(consulta, valores);
        await cliente.query('COMMIT');
        return { sucesso: true, atendente: resultado.rows[0] };
    } catch (erro) {
        await cliente.query('ROLLBACK');
        return { sucesso: false, erro: erro.message };
    } finally { cliente.release(); }
};

const deletarAtendente = async (idAtendente) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const sessaoAberta = await cliente.query('SELECT * FROM sessoes_caixa WHERE id_atendente = $1 AND status = $2', [idAtendente, 'aberta']);
        if (sessaoAberta.rows.length > 0) { 
            await cliente.query('ROLLBACK'); 
            return { sucesso: false, erro: 'Sessão aberta detectada. Feche o caixa antes de eliminar.' }; 
        }
        await cliente.query('UPDATE atendentes SET ativo = false WHERE id_atendente = $1', [idAtendente]);
        await cliente.query('COMMIT');
        return { sucesso: true };
    } catch (erro) { 
        await cliente.query('ROLLBACK'); 
        return { sucesso: false, erro: 'Este atendente possui registros vinculados.' }; 
    } finally { cliente.release(); }
};

// ========== FUNÇÕES PARA SESSÕES DE CAIXA ==========

const obterSessoesCaixa = async () => {
    const consulta = `SELECT sc.*, a.nome as nome_atendente FROM sessoes_caixa sc 
                      LEFT JOIN atendentes a ON sc.id_atendente = a.id_atendente ORDER BY sc.data_abertura DESC`;
    const resultado = await pool.query(consulta);
    return resultado.rows;
};

const obterSessaoAtual = async () => {
    const consulta = `SELECT sc.*, a.nome as nome_atendente FROM sessoes_caixa sc 
                      LEFT JOIN atendentes a ON sc.id_atendente = a.id_atendente 
                      WHERE sc.status = 'aberta' ORDER BY sc.data_abertura DESC LIMIT 1`;
    const resultado = await pool.query(consulta);
    return resultado.rows[0] || null;
};

const abrirSessaoCaixa = async (dadosSessao) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const sessaoAberta = await cliente.query('SELECT * FROM sessoes_caixa WHERE id_atendente = $1 AND status = $2', [dadosSessao.id_atendente, 'aberta']);
        if (sessaoAberta.rows.length > 0) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: 'Já existe sessão aberta' }; }
        
        const consulta = `INSERT INTO sessoes_caixa (id_atendente, valor_inicial, id_empresa) VALUES ($1, $2, $3) RETURNING *`;
        const resultado = await cliente.query(consulta, [
            dadosSessao.id_atendente, 
            dadosSessao.valor_inicial || 0, 
            dadosSessao.id_empresa
        ]);
        
        await cliente.query('COMMIT');
        return { sucesso: true, sessao: resultado.rows[0] };
    } catch (erro) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: erro.message }; } finally { cliente.release(); }
};

const fecharSessaoCaixa = async (idSessao, dadosFechamento) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const valorFinal = parseFloat(dadosFechamento?.valor_final) || 0;
        const consulta = `UPDATE sessoes_caixa SET data_fechamento = CURRENT_TIMESTAMP, valor_final = $1, status = 'fechada'
                          WHERE id_sessao = $2 AND status = 'aberta' RETURNING *`;
        const resultado = await cliente.query(consulta, [valorFinal, idSessao]);
        await cliente.query('COMMIT');
        return { sucesso: true, sessao: resultado.rows[0] };
    } catch (erro) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: erro.message }; } finally { cliente.release(); }
};

// ========== FUNÇÕES PARA VENDAS ==========

const obterVendas = async () => {
    const consulta = `
        SELECT 
            v.*, 
            a.nome AS nome_atendente, 
            a.cpf AS cpf_atendente,
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
        LEFT JOIN atendentes a ON sc.id_atendente = a.id_atendente
        ORDER BY v.data_hora DESC`;
    const resultado = await pool.query(consulta);
    return resultado.rows;
};

const obterDetalhesVenda = async (idVenda) => {
    const consulta = `
        SELECT v.*, a.nome AS nome_atendente, a.cpf AS cpf_atendente
        FROM vendas v
        LEFT JOIN sessoes_caixa sc ON v.id_sessao = sc.id_sessao
        LEFT JOIN atendentes a ON sc.id_atendente = a.id_atendente
        WHERE v.id_venda = $1`;
    const resultadoVenda = await pool.query(consulta, [idVenda]);
    const venda = resultadoVenda.rows[0];
    if (!venda) return null;
    venda.itens = (await pool.query('SELECT * FROM itens_vendidos WHERE venda_id = $1', [idVenda])).rows;
    venda.pagamentos = (await pool.query('SELECT * FROM pagamentos WHERE venda_id = $1', [idVenda])).rows;
    return venda;
};

const criarVenda = async (dadosVenda) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');

        const valorBruto = parseFloat(dadosVenda.valor_total_bruto || dadosVenda.valorTotalBruto || 0);
        const valorPago = parseFloat(dadosVenda.valor_pago_total || dadosVenda.valorPagoTotal || 0);
        const valorTroco = parseFloat(dadosVenda.valor_troco || dadosVenda.valorTroco || 0);
        
        const itensParaSalvar = dadosVenda.itens || [];
        const totalItens = itensParaSalvar.reduce((acc, item) => acc + parseFloat(item.quantidade || 0), 0);

        const consultaVenda = `
            INSERT INTO vendas (valor_total_bruto, valor_pago_total, valor_troco, status_venda, id_empresa, id_atendente, id_sessao, quantidade_itens, editada) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_venda`;
        
        const valoresVenda = [
            valorBruto, valorPago, valorTroco, 
            dadosVenda.statusVenda || 'Finalizada',
            dadosVenda.id_empresa, dadosVenda.id_atendente, dadosVenda.id_sessao,
            totalItens, false
        ];
        
        const resVenda = await cliente.query(consultaVenda, valoresVenda);
        const idVenda = resVenda.rows[0].id_venda;

        for (const p of (dadosVenda.pagamentos || [])) {
            const vPago = parseFloat(p.valor_pago ?? p.valorPago ?? 0);
            await cliente.query(`INSERT INTO pagamentos (venda_id, metodo, valor_pago, referencia_metodo) VALUES ($1, $2, $3, $4)`,
                [idVenda, p.metodo, isNaN(vPago) ? 0 : vPago, p.referencia_metodo ?? p.referenciaMetodo]);
        }
        
        for (const i of itensParaSalvar) {
            const precoUni = parseFloat(i.preco_unitario ?? i.precoUnitario ?? i.preco ?? 0);
            const qtd = parseFloat(i.quantidade || 0);
            
            // MAPEAR DESCRIÇÃO CORRETAMENTE:
            // O frontend do carrinho usa 'descricao'. O backend esperava 'descricao_item'.
            const nomeDoProduto = i.descricao || i.descricao_item || i.descricaoItem || "PRODUTO SEM NOME";

            await cliente.query(`INSERT INTO itens_vendidos (venda_id, categoria, descricao_item, preco_unitario, quantidade, subtotal) VALUES ($1, $2, $3, $4, $5, $6)`,
                [idVenda, i.categoria || "Geral", nomeDoProduto, precoUni, qtd, i.subtotal || (precoUni * qtd)]);
            
            if (i.id_produto) {
                await cliente.query(`UPDATE produtos SET estoque_atual = estoque_atual - $1 WHERE id_produto = $2`, [qtd, i.id_produto]);
            }
        }
        
        await cliente.query('COMMIT');
        return { idVenda, sucesso: true };
    } catch (erro) { 
        await cliente.query('ROLLBACK'); 
        return { sucesso: false, erro: erro.message }; 
    } finally { cliente.release(); }
};

const atualizarStatusVenda = async (idVenda, status) => {
    const resultado = await pool.query('UPDATE vendas SET status_venda = $1 WHERE id_venda = $2 RETURNING *', [status, idVenda]);
    return resultado.rows[0];
};

const apagarVenda = async (idVenda) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        await cliente.query('DELETE FROM pagamentos WHERE venda_id = $1', [idVenda]);
        await cliente.query('DELETE FROM itens_vendidos WHERE venda_id = $1', [idVenda]);
        const res = await cliente.query('DELETE FROM vendas WHERE id_venda = $1 RETURNING id_venda', [idVenda]);
        await cliente.query('COMMIT');
        return res.rows.length > 0;
    } catch (erro) { await cliente.query('ROLLBACK'); return false; } finally { cliente.release(); }
};

const apagarVendasEmMassa = async (idsVendas) => {
    if (!idsVendas?.length) return { sucesso: false, mensagem: 'Sem IDs' };
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const placeholders = idsVendas.map((_, i) => `$${i + 1}`).join(', ');
        await cliente.query(`DELETE FROM pagamentos WHERE venda_id IN (${placeholders})`, idsVendas);
        await cliente.query(`DELETE FROM itens_vendidos WHERE venda_id IN (${placeholders})`, idsVendas);
        const res = await cliente.query(`DELETE FROM vendas WHERE id_venda IN (${placeholders}) RETURNING id_venda`, idsVendas);
        await cliente.query('COMMIT');
        return { sucesso: true, deletadas: res.rows.length };
    } catch (erro) { await cliente.query('ROLLBACK'); return { sucesso: false, mensagem: erro.message }; } finally { cliente.release(); }
};

// ========== FUNÇÕES PARA PRODUTOS ==========

const obterProdutosComVendas = async () => {
    const consulta = `SELECT p.*, COALESCE(SUM(iv.quantidade), 0) AS total_vendido FROM produtos p
                      LEFT JOIN itens_vendidos iv ON p.categoria = iv.categoria AND p.descricao = iv.descricao_item
                      WHERE p.ativo = TRUE GROUP BY p.id_produto ORDER BY p.id_produto ASC`;
    const resultado = await pool.query(consulta);
    return resultado.rows.map(row => ({ ...row, total_vendido: parseInt(row.total_vendido, 10) || 0 }));
};

const obterProdutoPorId = async (idProduto) => {
    const resultado = await pool.query('SELECT * FROM produtos WHERE id_produto = $1', [idProduto]);
    return resultado.rows[0];
};

const criarProduto = async (dados) => {
    const consulta = `INSERT INTO produtos (categoria, descricao, preco, tipo_item, custo_unitario, estoque_atual, codigo_barra, id_empresa) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const res = await pool.query(consulta, [dados.categoria, dados.descricao, dados.preco, dados.tipoItem || 'Serviço', dados.custoUnitario || 0, dados.estoqueAtual || 0, dados.codigoBarra, dados.id_empresa]);
    return res.rows[0];
};

const atualizarProduto = async (id, dados) => {
    const consulta = `UPDATE produtos SET categoria = COALESCE($1, categoria), descricao = COALESCE($2, descricao),
                      preco = COALESCE($3, preco), tipo_item = COALESCE($4, tipo_item), custo_unitario = COALESCE($5, custo_unitario),
                      estoque_atual = COALESCE($6, estoque_atual), codigo_barra = COALESCE($7, codigo_barra)
                      WHERE id_produto = $8 RETURNING *`;
    const res = await pool.query(consulta, [dados.categoria, dados.descricao, dados.preco, dados.tipoItem, dados.custoUnitario, dados.estoqueAtual, dados.codigoBarra, id]);
    return res.rows[0];
};

const desativarProduto = async (id) => {
    const res = await pool.query('UPDATE produtos SET ativo = FALSE WHERE id_produto = $1 RETURNING *', [id]);
    return res.rows[0];
};

// ========== FUNÇÕES PARA EMPRESAS ==========

const obterEmpresas = async () => (await pool.query('SELECT * FROM empresas ORDER BY id_empresa ASC')).rows;

const obterEmpresaPorId = async (id) => {
    const res = await pool.query('SELECT * FROM empresas WHERE id_empresa = $1', [id]);
    return res.rows[0];
};

const criarEmpresa = async (d) => {
    const consulta = `INSERT INTO empresas (razao_social, nome_fantasia, cnpj, inscricao_estadual, endereco, cidade, estado, cep, telefone, email) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    return (await pool.query(consulta, [d.razaoSocial, d.nomeFantasia, d.cnpj, d.inscricaoEstadual, d.endereco, d.cidade, d.estado, d.cep, d.telefone, d.email])).rows[0];
};

const atualizarEmpresa = async (id, d) => {
    const consulta = `UPDATE empresas SET razao_social = COALESCE($1, razao_social), nome_fantasia = COALESCE($2, nome_fantasia),
                      cnpj = COALESCE($3, cnpj), inscricao_estadual = COALESCE($4, inscricao_estadual), endereco = COALESCE($5, endereco),
                      cidade = COALESCE($6, cidade), estado = COALESCE($7, estado), cep = COALESCE($8, cep), telefone = COALESCE($9, telefone),
                      email = COALESCE($10, email) WHERE id_empresa = $11 RETURNING *`;
    const res = await pool.query(consulta, [d.razaoSocial, d.nomeFantasia, d.cnpj, d.inscricaoEstadual, d.endereco, d.cidade, d.estado, d.cep, d.telefone, d.email, id]);
    return res.rows[0];
};

const obterDadosEmpresa = async () => {
    const resultado = await pool.query('SELECT * FROM empresas ORDER BY id_empresa LIMIT 1');
    return resultado.rows[0];
};

// ========== RETIRADAS DE CAIXA ==========

const obterRetiradasCaixa = async (inicio, fim) => {
    let query = `SELECT *, (data_retirada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') AS data_corrigida FROM retiradas_caixa`;
    const params = [];
    if (inicio && fim) { query += ` WHERE DATE(data_retirada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') BETWEEN $1 AND $2`; params.push(inicio, fim); }
    query += ` ORDER BY data_corrigida DESC`;
    return (await pool.query(query, params)).rows;
};

const criarRetiradaCaixa = async (dados) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        let valor = typeof dados.valor === 'string' ? parseFloat(dados.valor.replace('R$', '').replace(',', '.')) : dados.valor;
        const res = await cliente.query(`INSERT INTO retiradas_caixa (valor, motivo, observacao, data_retirada, id_empresa) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [valor, dados.motivo, dados.observacao, dados.dataRetirada, dados.id_empresa]);
        await cliente.query('COMMIT');
        return { sucesso: true, retirada: res.rows[0] };
    } catch (e) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: e.message }; } finally { cliente.release(); }
};

// ========== ATUALIZAÇÃO DE PAGAMENTOS E VENDAS ==========

const atualizarPagamentosVenda = async (idVenda, novosPagamentos) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        await cliente.query('DELETE FROM pagamentos WHERE venda_id = $1', [idVenda]);
        for (const p of novosPagamentos) {
            const valorFinal = parseFloat(p.valor_pago ?? p.valorPago ?? 0);
            await cliente.query(`INSERT INTO pagamentos (venda_id, metodo, valor_pago, referencia_metodo) VALUES ($1, $2, $3, $4)`,
                [idVenda, p.metodo || 'Dinheiro', isNaN(valorFinal) ? 0 : valorFinal, p.referencia_metodo ?? p.referenciaMetodo ?? null]);
        }
        const resTotais = await cliente.query('SELECT SUM(valor_pago) as total FROM pagamentos WHERE venda_id = $1', [idVenda]);
        const totalPago = parseFloat(resTotais.rows[0].total) || 0;
        const resVenda = await cliente.query(`UPDATE vendas SET valor_pago_total = $1, valor_troco = GREATEST($1 - valor_total_bruto, 0), editada = true
                                              WHERE id_venda = $2 RETURNING *`, [totalPago, idVenda]);
        await cliente.query('COMMIT');
        return { sucesso: true, venda: resVenda.rows[0] };
    } catch (e) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: e.message }; } finally { cliente.release(); }
};

const atualizarVendaCompleta = async (idVenda, dadosVenda) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consultaVenda = `UPDATE vendas SET valor_total_bruto = COALESCE($1, valor_total_bruto),
                               valor_pago_total = COALESCE($2, valor_pago_total), valor_troco = COALESCE($3, valor_troco), editada = true
                               WHERE id_venda = $4 RETURNING *`;
        const res = await cliente.query(consultaVenda, [dadosVenda.valorTotalBruto, dadosVenda.valorPagoTotal, dadosVenda.valorTroco, idVenda]);
        if (dadosVenda.pagamentos?.length > 0) {
            await cliente.query('DELETE FROM pagamentos WHERE venda_id = $1', [idVenda]);
            for (const p of dadosVenda.pagamentos) {
                const vFinal = parseFloat(p.valor_pago ?? p.valorPago ?? 0);
                await cliente.query(`INSERT INTO pagamentos (venda_id, metodo, valor_pago, referencia_metodo) VALUES ($1, $2, $3, $4)`,
                    [idVenda, p.metodo, isNaN(vFinal) ? 0 : vFinal, p.referencia_metodo ?? p.referenciaMetodo ?? null]);
            }
        }
        await cliente.query('COMMIT');
        return { sucesso: true, venda: res.rows[0] };
    } catch (e) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: e.message }; } finally { cliente.release(); }
};

// ========== OBSERVAÇÕES DIÁRIAS ==========

const obterObservacaoPorData = async (data) => {
    const resultado = await pool.query(`SELECT * FROM observacoes_diarias WHERE data_observacao = $1`, [data]);
    return resultado.rows[0] || null;
};

const salvarObservacaoDiaria = async (data, texto, id_empresa) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        const consulta = `INSERT INTO observacoes_diarias (data_observacao, texto, id_empresa)
                          VALUES ($1, $2, $3)
                          ON CONFLICT (data_observacao) 
                          DO UPDATE SET texto = EXCLUDED.texto, data_criacao = CURRENT_TIMESTAMP
                          RETURNING *;`;
        const resultado = await cliente.query(consulta, [data, texto, id_empresa]);
        await cliente.query('COMMIT');
        return { sucesso: true, observacao: resultado.rows[0] };
    } catch (e) { await cliente.query('ROLLBACK'); return { sucesso: false, erro: e.message }; } finally { cliente.release(); }
};

const deletarObservacaoDiaria = async (data) => {
    const resultado = await pool.query(`DELETE FROM observacoes_diarias WHERE data_observacao = $1 RETURNING *`, [data]);
    return { sucesso: true, deletado: resultado.rows.length > 0 };
};

const obterObservacoesPorPeriodo = async (inicio, fim) => {
    const resultado = await pool.query(`SELECT * FROM observacoes_diarias WHERE data_observacao BETWEEN $1 AND $2 ORDER BY data_observacao ASC`, [inicio, fim]);
    return resultado.rows;
};

const deletarEmpresaDefinitivo = async (idEmpresa) => {
    const cliente = await pool.connect();
    try {
        await cliente.query('BEGIN');
        await cliente.query('DELETE FROM pagamentos WHERE venda_id IN (SELECT id_venda FROM vendas WHERE id_empresa = $1)', [idEmpresa]);
        await cliente.query('DELETE FROM itens_vendidos WHERE venda_id IN (SELECT id_venda FROM vendas WHERE id_empresa = $1)', [idEmpresa]);
        const tabelas = ['vendas', 'sessoes_caixa', 'retiradas_caixa', 'atendentes', 'produtos', 'observacoes_diarias'];
        for (const t of tabelas) {
            await deletarSeColunaExistir(cliente, t, 'id_empresa', idEmpresa);
        }
        const res = await cliente.query('DELETE FROM empresas WHERE id_empresa = $1 RETURNING *', [idEmpresa]);
        await cliente.query('COMMIT');
        return { sucesso: res.rows.length > 0 };
    } catch (e) { await cliente.query('ROLLBACK'); throw e; } finally { cliente.release(); }
};

module.exports = {
    obterAtendentes, obterAtendentePorId, criarAtendente, atualizarAtendente, deletarAtendente,
    obterSessoesCaixa, obterSessaoAtual, abrirSessaoCaixa, fecharSessaoCaixa,
    obterVendas, obterDetalhesVenda, criarVenda, atualizarStatusVenda, apagarVenda, apagarVendasEmMassa,
    obterProdutos: obterProdutosComVendas, obterProdutoPorId, criarProduto, atualizarProduto, desativarProduto,
    obterEmpresas, obterEmpresaPorId, criarEmpresa, atualizarEmpresa,
    obterRetiradasCaixa, criarRetiradaCaixa, atualizarPagamentosVenda, atualizarVendaCompleta, obterDadosEmpresa, salvarObservacaoDiaria, obterObservacaoPorData, deletarObservacaoDiaria, obterObservacoesPorPeriodo, deletarEmpresaDefinitivo
};