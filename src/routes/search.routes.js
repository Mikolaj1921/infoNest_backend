const express = require('express');
// controllers
const searchController = require('../controllers/search.controller');
// middlewares
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
// validations
const { globalSearchSchema } = require('../validations/search.validation');

const router = express.Router();

// ua: всі операції з пошуком потребують авторизації
router.use(protect);

// ua: глобальний пошук по документам та категоріям

router.get('/', validate(globalSearchSchema), searchController.globalSearch);

module.exports = router;
