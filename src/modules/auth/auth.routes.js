const { Router } = require('express');
const controller  = require('./auth.controller');
const validate    = require('../../shared/validators/validate');
const { loginSchema } = require('../../shared/validators/auth.schema');
const { limiterLogin } = require('../../middlewares/rateLimiter');

const router = Router();

router.post('/login', limiterLogin, validate(loginSchema), controller.login);

module.exports = router;
