const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, categoryController.getCategories);
router.get('/:id', protect, categoryController.getCategoryById);
router.post('/', protect, authorize('admin', 'manager'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin', 'manager'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;
