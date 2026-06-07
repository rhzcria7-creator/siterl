export function errorHandler(logger) {
    return (err, _req, res, _next) => {
        logger.error(err.message, { stack: err.stack });
        // Não expõe detalhes do erro em produção
        if (process.env.NODE_ENV === "production") {
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(500).json({ error: err.message, stack: err.stack });
    };
}
