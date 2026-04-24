
const pool = require('./src/config/database');



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

// ========== FUNÇÕES PARA EMPRESAS ==========


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

module.exports = {
    obterSessoesCaixa, obterSessaoAtual, abrirSessaoCaixa, fecharSessaoCaixa,
    obterVendas, obterDetalhesVenda, criarVenda, atualizarStatusVenda, apagarVenda, apagarVendasEmMassa,
    atualizarPagamentosVenda, atualizarVendaCompleta, salvarObservacaoDiaria, obterObservacaoPorData, deletarObservacaoDiaria, obterObservacoesPorPeriodo
};