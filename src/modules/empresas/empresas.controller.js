const service = require('./empresas.service');

/**
 * Controller de Empresas — adaptador HTTP.
 * Responsabilidades: ler req, chamar service, formatar res.
 * Sem lógica de negócio aqui — toda regra fica no service.
 *
 * Errors operacionais (AppError) são capturados pelo errorHandler central.
 * Não há try/catch aqui: o Express 5 propaga erros async automaticamente.
 */

const listar = async (req, res) => {
  const empresas = await service.listar();
  res.status(200).json(empresas);
};

const buscarPorId = async (req, res) => {
  const empresa = await service.buscarPorId(parseInt(req.params.id));
  res.status(200).json(empresa);
};

const criar = async (req, res) => {
  const novaEmpresa = await service.criar(req.body);
  res.status(201).json(novaEmpresa);
};

const atualizar = async (req, res) => {
  const empresaAtualizada = await service.atualizar(parseInt(req.params.id), req.body);
  res.status(200).json(empresaAtualizada);
};

const deletarDefinitivo = async (req, res) => {
  const id = parseInt(req.params.id);
  await service.deletarDefinitivo(id);
  res.status(200).json({
    mensagem: `Empresa ${id} e todos os registros vinculados foram apagados com sucesso.`,
  });
};

module.exports = { listar, buscarPorId, criar, atualizar, deletarDefinitivo };
