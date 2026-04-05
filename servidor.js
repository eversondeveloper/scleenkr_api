const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const consultas = require('./consultas');

const aplicativo = express();
const porta = 3000;

aplicativo.use(cors());
aplicativo.use(bodyParser.json());
aplicativo.use(bodyParser.urlencoded({ extended: true }));

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

// ========== ROTAS PARA ATENDENTES ==========
aplicativo.get('/atendentes', async (requisicao, resposta) => {
    try {
        const { ativo, nome } = requisicao.query;
        const atendentes = await consultas.obterAtendentes(ativo, nome);
        resposta.status(200).json(atendentes);
    } catch (erro) {
        resposta.status(500).send('Erro ao obter atendentes');
    }
});

aplicativo.get('/atendentes/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const atendente = await consultas.obterAtendentePorId(id);
        if (atendente) {
            resposta.status(200).json(atendente);
        } else {
            resposta.status(404).send('Atendente não encontrado');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao obter detalhes do atendente');
    }
});

aplicativo.post('/atendentes', async (requisicao, resposta) => {
    try {
        const resultado = await consultas.criarAtendente(requisicao.body);
        if (resultado.sucesso) {
            resposta.status(201).json({ 
                mensagem: 'Atendente criado com sucesso', 
                atendente: resultado.atendente 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao criar atendente', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao criar atendente');
    }
});

aplicativo.put('/atendentes/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const resultado = await consultas.atualizarAtendente(id, requisicao.body);
        if (resultado.sucesso) {
            resposta.status(200).json({ 
                mensagem: 'Atendente atualizado com sucesso', 
                atendente: resultado.atendente 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao atualizar atendente', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao atualizar atendente');
    }
});

aplicativo.delete('/atendentes/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const resultado = await consultas.deletarAtendente(id);
        if (resultado.sucesso) {
            resposta.status(200).json({ 
                mensagem: 'Atendente deletado com sucesso' 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao deletar atendente', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao deletar atendente');
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

// ========== ROTAS PARA PRODUTOS ==========
aplicativo.get('/produtos', async (requisicao, resposta) => {
    try {
        const produtos = await consultas.obterProdutos(); 
        resposta.status(200).json(produtos);
    } catch (erro) {
        console.error('Erro ao obter produtos:', erro);
        resposta.status(500).send('Erro ao obter produtos');
    }
});

aplicativo.get('/produtos/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const produto = await consultas.obterProdutoPorId(id);
        if (produto) {
            resposta.status(200).json(produto);
        } else {
            resposta.status(404).send('Produto não encontrado');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao obter produto');
    }
});

aplicativo.post('/produtos', async (requisicao, resposta) => {
    try {
        const novoProduto = await consultas.criarProduto(requisicao.body);
        resposta.status(201).json(novoProduto);
    } catch (erro) {
        resposta.status(500).send('Erro ao criar produto');
    }
});

aplicativo.patch('/produtos/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const produtoAtualizado = await consultas.atualizarProduto(id, requisicao.body);
        if (produtoAtualizado) {
            resposta.status(200).json(produtoAtualizado);
        } else {
            resposta.status(404).send('Produto não encontrado para atualização');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao atualizar produto');
    }
});

aplicativo.delete('/produtos/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const produtoDesativado = await consultas.desativarProduto(id);
        if (produtoDesativado) {
            resposta.status(200).json({ mensagem: 'Produto desativado com sucesso', idProduto: id });
        } else {
            resposta.status(404).send('Produto não encontrado para desativação');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao desativar produto');
    }
});

// ========== ROTAS PARA EMPRESAS ==========
aplicativo.get('/empresas', async (requisicao, resposta) => {
    try {
        const empresas = await consultas.obterEmpresas();
        resposta.status(200).json(empresas);
    } catch (erro) {
        resposta.status(500).send('Erro ao obter dados da empresa');
    }
});

aplicativo.get('/empresas/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const empresa = await consultas.obterEmpresaPorId(id);
        if (empresa) {
            resposta.status(200).json(empresa);
        } else {
            resposta.status(404).send('Empresa não encontrada');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao obter detalhes da empresa');
    }
});

aplicativo.post('/empresas', async (requisicao, resposta) => {
    try {
        const novaEmpresa = await consultas.criarEmpresa(requisicao.body);
        resposta.status(201).json(novaEmpresa);
    } catch (erro) {
        resposta.status(500).send('Erro ao cadastrar empresa');
    }
});

aplicativo.patch('/empresas/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const empresaAtualizada = await consultas.atualizarEmpresa(id, requisicao.body);
        if (empresaAtualizada) {
            resposta.status(200).json(empresaAtualizada);
        } else {
            resposta.status(404).send('Empresa não encontrada para atualização');
        }
    } catch (erro) {
        resposta.status(500).send('Erro ao atualizar dados da empresa');
    }
});

// Rota de Deleção DEFINITIVA (Reset da Empresa)
aplicativo.delete('/empresas/:id', async (requisicao, resposta) => {
    const id = parseInt(requisicao.params.id);
    try {
        const resultado = await consultas.deletarEmpresaDefinitivo(id);
        if (resultado.sucesso) {
            resposta.status(200).json({ mensagem: `Empresa ${id} e todos os registros vinculados foram apagados com sucesso.` });
        } else {
            resposta.status(404).send('Empresa não encontrada ou erro ao apagar');
        }
    } catch (erro) {
        console.error("Erro na rota de deleção da empresa:", erro);
        resposta.status(500).send('Erro ao apagar empresa e registros vinculados');
    }
});

// ========== ROTAS PARA RETIRADAS DE CAIXA ==========

aplicativo.post('/retiradas-caixa', async (requisicao, resposta) => {
    try {
        const resultado = await consultas.criarRetiradaCaixa(requisicao.body);
        if (resultado.sucesso) {
            resposta.status(201).json({ 
                mensagem: 'Retirada registrada com sucesso', 
                retirada: resultado.retirada 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao registrar retirada', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        resposta.status(500).send('Erro interno do servidor ao processar retirada');
    }
});

aplicativo.get('/retiradas-caixa', async (requisicao, resposta) => {
    try {
        const { inicio, fim } = requisicao.query;
        const retiradas = await consultas.obterRetiradasCaixa(inicio, fim);
        resposta.status(200).json(retiradas);
    } catch (erro) {
        resposta.status(500).send('Erro ao obter retiradas do caixa');
    }
});

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

// ========== ROTAS PARA OBSERVAÇÕES DIÁRIAS (CRUD COMPLETO) ==========

aplicativo.get('/observacoes-diarias', async (requisicao, resposta) => {
    try {
        const { data, fim } = requisicao.query; 
        if (!data) {
            return resposta.status(400).send('Data de início não informada');
        }
        const observacoes = await consultas.obterObservacoesPorPeriodo(data, fim || data);
        resposta.status(200).json(observacoes);
    } catch (erro) {
        console.error('Erro ao buscar observações:', erro);
        resposta.status(500).send('Erro ao obter observações diárias');
    }
});

aplicativo.post('/observacoes-diarias', async (requisicao, resposta) => {
    try {
        const { data, texto, id_empresa } = requisicao.body;
        if (!data || texto === undefined) {
            return resposta.status(400).json({ mensagem: 'Data e texto são obrigatórios' });
        }
        const resultado = await consultas.salvarObservacaoDiaria(data, texto, id_empresa);
        if (resultado.sucesso) {
            resposta.status(200).json({ 
                mensagem: 'Observação salva com sucesso', 
                observacao: resultado.observacao 
            });
        } else {
            resposta.status(400).json({ 
                mensagem: 'Falha ao salvar observação', 
                erro: resultado.erro 
            });
        }
    } catch (erro) {
        console.error('Erro na rota de salvamento:', erro);
        resposta.status(500).send('Erro interno ao processar observação');
    }
});

aplicativo.delete('/observacoes-diarias', async (requisicao, resposta) => {
    try {
        const { data } = requisicao.query;
        if (!data) {
            return resposta.status(400).send('Data não informada');
        }
        const resultado = await consultas.deletarObservacaoDiaria(data);
        if (resultado.sucesso) {
            if (resultado.deletado) {
                resposta.status(200).json({ mensagem: 'Observação excluída com sucesso' });
            } else {
                resposta.status(404).json({ mensagem: 'Nenhuma observação encontrada para esta data' });
            }
        } else {
            resposta.status(400).json({ mensagem: 'Falha ao excluir observação', erro: resultado.erro });
        }
    } catch (erro) {
        console.error('Erro na rota de exclusão:', erro);
        resposta.status(500).send('Erro interno ao excluir observação');
    }
});

aplicativo.listen(porta, () => {
    console.log(`API EversCash rodando na porta ${porta}.`);
});