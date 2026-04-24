const { Router } = require('express');
const controller  = require('./vendas.controller');

const router = Router();

// Rotas específicas antes das parametrizadas (evita conflito com /:id)
router.post('/deletar-periodo', controller.apagarEmMassa);

router.get('/',    controller.listar);
router.post('/',   controller.criar);

router.get('/:id',            controller.obterPorId);
router.patch('/:id/status',   controller.atualizarStatus);
router.patch('/:id',          controller.atualizar);
router.delete('/:id',         controller.apagar);

module.exports = router;
