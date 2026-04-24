const { Router } = require('express');
const controller = require('./atendentes.controller');
const validate   = require('../../shared/validators/validate');
const { criarSchema, atualizarSchema, atualizarSenhaSchema } = require('../../shared/validators/atendentes.schema');

const router = Router();

router.get('/',             controller.listar);
router.get('/:id',          controller.buscarPorId);
router.post('/',            validate(criarSchema),           controller.criar);
router.put('/:id',          validate(atualizarSchema),       controller.atualizar);
router.patch('/:id/senha',  validate(atualizarSenhaSchema),  controller.atualizarSenha);
router.delete('/:id',       controller.desativar);

module.exports = router;
