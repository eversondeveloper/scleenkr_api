const { Router } = require('express');
const controller = require('./produtos.controller');
const validate   = require('../../shared/validators/validate');
const { criarSchema, atualizarSchema } = require('../../shared/validators/produtos.schema');

const router = Router();

router.get('/',      controller.listar);
router.get('/:id',   controller.buscarPorId);
router.post('/',     validate(criarSchema),      controller.criar);
router.put('/:id',   validate(atualizarSchema),  controller.atualizar);
router.delete('/:id', controller.desativar);

module.exports = router;
