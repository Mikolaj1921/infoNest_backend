// функція, яка повертає іншу функцію для обробки асинхронних помилок
// ловить помилки в асинхронному коді і відправляє їх у глобальний errorMiddleware
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
