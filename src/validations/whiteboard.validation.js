// ua: валідація для оновлення таблиці

const Joi = require('joi');

const updateWhiteboardSchema = Joi.object({
  elements: Joi.array().items(Joi.object().unknown(true)).required(),
});

module.exports = {
  updateWhiteboardSchema,
};
