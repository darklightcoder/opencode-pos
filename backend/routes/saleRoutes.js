const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, saleController.createSale);
router.get('/', protect, saleController.getSales);
router.get('/today', protect, saleController.getTodaySales);
router.get('/dashboard', protect, authorize('admin', 'manager'), saleController.getDashboardStats);
router.get('/:id', protect, saleController.getSaleById);
router.post('/:id/refund', protect, authorize('admin', 'manager'), saleController.refundSale);

module.exports = router;
