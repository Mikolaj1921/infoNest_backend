const validate = (schema) => (req, res, next) => {
  try {
    // валідування body, query та params одночасно
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // апдейт даних на валідовані (Zod)
    if (validatedData.body !== undefined) {
      req.body = validatedData.body;
    }

    if (validatedData.query !== undefined) {
      req.query = validatedData.query;
    }

    if (validatedData.params !== undefined) {
      req.params = validatedData.params;
    }

    next();
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
};

module.exports = validate;
