const Product = require('../models/Product');
const Category = require('../models/Category');

const productController = {
  getProducts: async (req, res) => {
    try {
      const { category, search, page = 1, limit = 50 } = req.query;
      
      let query = { isActive: true };
      
      if (category) {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ];
      }

      const products = await Product.find(query)
        .populate('category', 'name')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Product.countDocuments(query);

      res.json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate('category', 'name');
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getProductByBarcode: async (req, res) => {
    try {
      const product = await Product.findOne({ barcode: req.params.barcode }).populate('category', 'name');
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, price, category, barcode, stock, description, image } = req.body;

      const product = new Product({
        name,
        price,
        category,
        barcode,
        stock: stock || 0,
        description,
        image
      });

      const createdProduct = await product.save();
      await createdProduct.populate('category', 'name');
      
      res.status(201).json(createdProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price !== undefined ? req.body.price : product.price;
        product.category = req.body.category || product.category;
        product.barcode = req.body.barcode || product.barcode;
        product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
        product.description = req.body.description || product.description;
        product.image = req.body.image || product.image;

        const updatedProduct = await product.save();
        await updatedProduct.populate('category', 'name');
        
        res.json(updatedProduct);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (product) {
        product.isActive = false;
        await product.save();
        res.json({ message: 'Product removed' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getLowStockProducts: async (req, res) => {
    try {
      const products = await Product.find({ 
        isActive: true, 
        stock: { $lte: 10 } 
      }).populate('category', 'name').sort({ stock: 1 });
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = productController;
