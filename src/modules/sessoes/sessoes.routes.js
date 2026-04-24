const { Router } = require('express');
const controller = require('./sessoes.controller');

const router = Router();

router.get('/',         controller.listar);
router.get('/atual',    controller.obterAtual);
router.post('/',        controller.abrir);
router.put('/:id/fechar', controller.fechar);

module.exports = router;
