// ua: утиліта для розрахунку параметрів пагінації для Prisma

// ua: приймає об'єкт query з параметрами page та limit, і повертає
// об'єкт з параметрами skip та take для Prisma - обмеження кількості
// записів та пропуску певної кількості записів для пагінації

const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
};

module.exports = { getPagination };
