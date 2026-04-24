const repository = require('./observacoes.repository');
const AppError = require('../../shared/errors/AppError');

const listarPorPeriodo = async (inicio, fim) => repository.obterPorPeriodo(inicio, fim);

const salvar = async (data, texto, id_empresa) => {
    if (!data || !texto) throw new AppError('Data e texto são obrigatórios.', 400);
    return repository.salvar(data, texto, id_empresa);
};

const deletar = async (data) => {
    if (!data) throw new AppError('Data é obrigatória.', 400);
    const observacao = await repository.deletar(data);
    if (!observacao) throw new AppError('Nenhuma observação encontrada para esta data.', 404);
    return observacao;
};

module.exports = { listarPorPeriodo, salvar, deletar };
