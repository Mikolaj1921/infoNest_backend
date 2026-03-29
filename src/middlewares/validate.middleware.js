const validate = (schema) => (req, res, next) => {
  try {
    // валідування body, query та params одночасно
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // апдейт даних на валідовані (Zod)
    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;

    next();
  } catch (error) {
    // Zod у наш глобальний обробник

    error.statusCode = 400;
    next(error);
  }
};

module.exports = validate;
