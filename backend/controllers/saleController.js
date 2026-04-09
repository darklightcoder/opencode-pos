const Sale = require('../models/Sale');
const Product = require('../models/Product');

const saleController = {
  createSale: async (req, res) => {
    try {
      const { items, subtotal, tax, discount, total, paymentMethod, amountPaid, change } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in sale' });
      }

      const saleItems = [];
      
      for (const item of items) {
        const product = await Product.findById(item.product);
        
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.name}` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        product.stock -= item.quantity;
        await product.save();

        saleItems.push({
          product: product._id,
          name: product.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        });
      }

      const sale = new Sale({
        items: saleItems,
        subtotal,
        tax: tax || 0,
        discount: discount || 0,
        total,
        paymentMethod: paymentMethod || 'cash',
        amountPaid: amountPaid || total,
        change: change || 0,
        cashier: req.user._id
      });

      const createdSale = await sale.save();
      await createdSale.populate('cashier', 'name');
      await createdSale.populate('items.product', 'name');

      res.status(201).json(createdSale);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getSales: async (req, res) => {
    try {
      const { startDate, endDate, page = 1, limit = 20 } = req.query;
      
      let query = {};
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const sales = await Sale.find(query)
        .populate('cashier', 'name')
        .populate('items.product', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Sale.countDocuments(query);

      const totalRevenue = await Sale.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      res.json({
        sales,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
        totalRevenue: totalRevenue[0]?.total || 0
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getSaleById: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id)
        .populate('cashier', 'name')
        .populate('items.product', 'name');

      if (sale) {
        res.json(sale);
      } else {
        res.status(404).json({ message: 'Sale not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getTodaySales: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sales = await Sale.find({
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('cashier', 'name').sort({ createdAt: -1 });

      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const totalTransactions = sales.length;

      res.json({
        sales,
        totalRevenue,
        totalTransactions
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDashboardStats: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySales = await Sale.find({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
      const todayTransactions = todaySales.length;

      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const last30DaysSales = await Sale.find({
        createdAt: { $gte: thirtyDaysAgo, $lt: tomorrow }
      });

      const last30DaysRevenue = last30DaysSales.reduce((sum, sale) => sum + sale.total, 0);

      const lowStockProducts = await Product.countDocuments({
        isActive: true,
        stock: { $lte: 10 }
      });

      res.json({
        todayRevenue,
        todayTransactions,
        last30DaysRevenue,
        lowStockProducts
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  refundSale: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }

      if (sale.status === 'refunded') {
        return res.status(400).json({ message: 'Sale already refunded' });
      }

      for (const item of sale.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      sale.status = 'refunded';
      await sale.save();

      res.json({ message: 'Sale refunded successfully', sale });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = saleController;
