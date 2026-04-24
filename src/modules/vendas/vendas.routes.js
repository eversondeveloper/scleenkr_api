const { Router } = require('express');
const controller = require('./vendas.controller');
const validate   = require('../../shared/validators/validate');
const { criarSchema, atualizarStatusSchema } = require('../../shared/validators/vendas.schema');

const router = Router();

// Rotas específicas antes das parametrizadas
router.post('/deletar-periodo', controller.apagarEmMassa);

router.get('/',              controller.listar);
router.post('/',             validate(criarSchema),            controller.criar);

router.get('/:id',           controller.obterPorId);
router.patch('/:id/status',  validate(atualizarStatusSchema),  controller.atualizarStatus);
router.patch('/:id',         controller.atualizar);
router.delete('/:id',        controller.apagar);

module.exports = router;
