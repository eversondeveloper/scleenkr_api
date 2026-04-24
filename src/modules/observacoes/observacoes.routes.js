const { Router } = require('express');
const controller = require('./observacoes.controller');

const router = Router();

router.get('/',    controller.listar);
router.post('/',   controller.salvar);
router.delete('/', controller.deletar);

module.exports = router;
