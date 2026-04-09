const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, productController.getProducts);
router.get('/low-stock', protect, authorize('admin', 'manager'), productController.getLowStockProducts);
router.get('/barcode/:barcode', protect, productController.getProductByBarcode);
router.get('/:id', protect, productController.getProductById);
router.post('/', protect, authorize('admin', 'manager'), productController.createProduct);
router.put('/:id', protect, authorize('admin', 'manager'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);

module.exports = router;
