const { Router } = require('express');
const controller = require('./produtos.controller');

const router = Router();

router.get('/',     controller.listar);
router.get('/:id',  controller.buscarPorId);
router.post('/',    controller.criar);
router.patch('/:id', controller.atualizar);
router.delete('/:id', controller.desativar);

module.exports = router;
