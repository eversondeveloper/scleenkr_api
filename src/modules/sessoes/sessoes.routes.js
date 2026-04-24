const { Router } = require('express');
const controller = require('./sessoes.controller');
const validate   = require('../../shared/validators/validate');
const { abrirSchema, fecharSchema } = require('../../shared/validators/sessoes.schema');

const router = Router();

router.get('/',           controller.listar);
router.get('/atual',      controller.obterAtual);
router.post('/',          validate(abrirSchema),   controller.abrir);
router.put('/:id/fechar', validate(fecharSchema),  controller.fechar);

module.exports = router;
