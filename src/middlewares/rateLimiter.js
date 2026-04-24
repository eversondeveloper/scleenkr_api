const rateLimit = require('express-rate-limit');

const limiterGeral = rateLimit({
    windowMs: 60 * 1000,  // 1 minuto
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensagem: 'Muitas requisições. Tente novamente em instantes.' },
});

const limiterLogin = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensagem: 'Muitas tentativas de login. Aguarde 1 minuto.' },
});

module.exports = { limiterGeral, limiterLogin };
