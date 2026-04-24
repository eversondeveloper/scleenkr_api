const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const consultas = require('./consultas');
const empresasRoutes = require('./src/modules/empresas/empresas.routes');
const produtosRoutes = require('./src/modules/produtos/produtos.routes');
const atendentesRoutes = require('./src/modules/atendentes/atendentes.routes');
const retiradasRoutes   = require('./src/modules/retiradas/retiradas.routes');
const observacoesRoutes = require('./src/modules/observacoes/observacoes.routes');
const errorHandler = require('./src/middlewares/errorHandler');

const aplicativo = express();
const porta = 3000;

aplicativo.use(cors());
aplicativo.use(bodyParser.json());
aplicativo.use(bodyParser.urlencoded({ extended: true }));

// ========== MÓDULOS REFATORADOS (Strangler Fig) ==========
aplicativo.use('/empresas', empresasRoutes);
aplicativo.use('/produtos', produtosRoutes);
aplicativo.use('/atendentes', atendentesRoutes);
aplicativo.use('/retiradas-caixa', retiradasRoutes);
aplicativo.use('/observacoes-diarias', observacoesRoutes);

// ========== ROTAS PARA VENDAS ==========
aplicativo.get('/vendas', async (requisicao, resposta) => {
    try {
        const vendas = await consultas.obterVendas();
        resposta.status(200).json(vendas);
    } catch (erro) {
        resposta.status(500).send('Erro ao obter vendas');
    }
});

aplicativo.get('/vendas/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const detalhes = await consultas.obterDetalhesVenda(id);
        if (detalhes) {
            resposta.status(200).json(detalhes);
        } else {
            resposta.status(404).send('Venda não encontrada');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao obter detalhes da venda');
    }
});

aplicativo.post('/vendas', async (requisicao, resposta) => {
    try {
        const resultado = await consultas.criarVenda(requisicao.body);
        if (resultado.sucesso) {
            resposta.status(201).json({ 
                mensagem: 'Venda criada com sucesso', 
                idVenda: resultado.idVenda 
            });
        } else {
            resposta.status(400).json({ mensagem: 'Falha ao criar venda', erro: resultado.erro });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao processar a venda');
    }
});

aplicativo.patch('/vendas/:id/status', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    const { status } = requisicao.body;

    try {
        const vendaAtualizada = await consultas.atualizarStatusVenda(id, status);
        if (vendaAtualizada) {
            resposta.status(200).json({ mensagem: `Status da venda ${id} atualizado para ${status}` });
        } else {
            resposta.status(404).send('Venda não encontrada');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao atualizar o status da venda');
    }
});

aplicativo.delete('/vendas/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const sucesso = await consultas.apagarVenda(id);
        if (sucesso) {
            resposta.status(200).json({ mensagem: `Venda ${id} e seus detalhes apagados com sucesso.` });
        } else {
            resposta.status(404).send('Venda não encontrada ou erro ao apagar');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao apagar a venda');
    }
});

aplicativo.post('/vendas/deletar-periodo', async (requisicao, resposta) => {
    const { idsVendas } = requisicao.body;

    try {
        const resultado = await consultas.apagarVendasEmMassa(idsVendas);

        if (resultado.sucesso) {
            resposta.status(200).json({ mensagem: `${resultado.deletadas} vendas apagadas.`, deletadas: resultado.deletadas });
        } else {
            resposta.status(400).json({ mensagem: 'Falha na exclusão em massa.', erro: resultado.mensagem });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao processar exclusão em massa.');
    }
});

// ========== ROTAS PARA SESSÕES DE CAIXA ==========
aplicativo.get('/sessoes-caixa', async (requisicao, resposta) => {
    try {
        const sessoes = await consultas.obterSessoesCaixa();
        resposta.status(200).json(sessoes);
    } catch (erro) {
        resposta.status(500).send('Erro ao obter sessões de caixa');
    }
});

aplicativo.get('/sessoes-caixa/atual', async (requisicao, resposta) => {
    try {
        const sessao = await consultas.obterSessaoAtual();
        resposta.status(200).json(sessao);
    } catch (erro) {
        resposta.status(500).send('Erro ao obter sessão atual');
    }
});

aplicativo.post('/sessoes-caixa', async (requisicao, resposta) => {
    try {
        const resultado = await consultas.abrirSessaoCaixa(requisicao.body);
        if (resultado.sucesso) {
            resposta.status(201).json({ 
                mensagem: 'Sessão de caixa aberta com sucesso', 
                sessao: resultado.sessao 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao abrir sessão de caixa', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao abrir sessão de caixa');
    }
});

aplicativo.put('/sessoes-caixa/:id/fechar', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const resultado = await consultas.fecharSessaoCaixa(id, requisicao.body);
        if (resultado.sucesso) {
            resposta.status(200).json({ 
                mensagem: 'Sessão de caixa fechada com sucesso', 
                sessao: resultado.sessao 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao fechar sessão de caixa', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao fechar sessão de caixa');
    }
});

// ========== ROTAS PARA EMPRESAS ==========
// ========== ATUALIZAÇÃO DE PAGAMENTOS E VENDAS ==========

aplicativo.patch('/vendas/:id/pagamentos', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    const pagamentos = requisicao.body.pagamentos;

    if (!pagamentos || !Array.isArray(pagamentos)) {
        return resposta.status(400).json({ mensagem: 'O corpo da requisição deve conter um array de pagamentos' });
    }

    try {
        const resultado = await consultas.atualizarPagamentosVenda(id, pagamentos);
        if (resultado.sucesso) {
            resposta.status(200).json({ 
                mensagem: 'Pagamentos atualizados com sucesso', 
                venda: resultado.venda 
            });
        } else {
            resposta.status(400).json({ mensagem: 'Falha ao atualizar pagamentos', erro: resultado.erro });
        }
    } catch (erro) {
        console.error('Erro na rota patch /pagamentos:', erro);
        resposta.status(500).send('Erro interno do servidor');
    }
});

aplicativo.patch('/vendas/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const resultado = await consultas.atualizarVendaCompleta(id, requisicao.body);
        if (resultado.sucesso) {
            resposta.status(200).json({ 
                mensagem: 'Venda atualizada com sucesso', 
                venda: resultado.venda 
            });
        } else {
            resposta.status(400).json({ mensagem: 'Falha ao atualizar venda', erro: resultado.erro });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao atualizar venda');
    }
});

aplicativo.listen(porta, () => {
    console.log(`API EversCash rodando na porta ${porta}.`);
});