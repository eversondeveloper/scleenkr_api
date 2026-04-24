const repository = require('./pagamentos.repository');
const AppError = require('../../shared/errors/AppError');

const atualizar = async (idVenda, pagamentos) => {
    if (!pagamentos || !Array.isArray(pagamentos)) {
        throw new AppError('O corpo da requisição deve conter um array de pagamentos.', 400);
    }
    return repository.atualizarDaVenda(idVenda, pagamentos);
};

module.exports = { atualizar };
