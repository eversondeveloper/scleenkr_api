const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const erros = result.error.errors.map(e => ({
            campo:    e.path.join('.'),
            mensagem: e.message,
        }));
        return res.status(400).json({ mensagem: 'Dados inválidos.', erros });
    }
    req.body = result.data;   // coerce e limpa campos extras
    next();
};

module.exports = validate;
