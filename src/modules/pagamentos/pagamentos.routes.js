const { Router } = require('express');
const controller = require('./pagamentos.controller');

const router = Router({ mergeParams: true });

router.patch('/:id/pagamentos', controller.atualizar);

module.exports = router;
