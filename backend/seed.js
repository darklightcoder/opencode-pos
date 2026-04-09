const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@pos.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created:', adminUser.email);

    const cashierUser = await User.create({
      name: 'Cashier',
      email: 'cashier@pos.com',
      password: 'cashier123',
      role: 'cashier'
    });
    console.log('Cashier user created:', cashierUser.email);

    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Food & Beverages', description: 'Food and drink items' },
      { name: 'Clothing', description: 'Apparel and accessories' },
      { name: 'Office Supplies', description: 'Office and stationery items' }
    ]);
    console.log('Categories created');

    const products = await Product.insertMany([
      { name: 'Laptop', price: 999.99, category: categories[0]._id, stock: 50, barcode: 'LAP001' },
      { name: 'Mouse', price: 29.99, category: categories[0]._id, stock: 100, barcode: 'MOU001' },
      { name: 'Keyboard', price: 79.99, category: categories[0]._id, stock: 75, barcode: 'KEY001' },
      { name: 'Coffee', price: 4.99, category: categories[1]._id, stock: 200, barcode: 'COF001' },
      { name: 'Sandwich', price: 8.99, category: categories[1]._id, stock: 50, barcode: 'SAN001' },
      { name: 'Water Bottle', price: 1.99, category: categories[1]._id, stock: 150, barcode: 'WAT001' },
      { name: 'T-Shirt', price: 19.99, category: categories[2]._id, stock: 80, barcode: 'TSH001' },
      { name: 'Jeans', price: 49.99, category: categories[2]._id, stock: 40, barcode: 'JEA001' },
      { name: 'Notebook', price: 2.99, category: categories[3]._id, stock: 300, barcode: 'NOT001' },
      { name: 'Pen Set', price: 5.99, category: categories[3]._id, stock: 120, barcode: 'PEN001' }
    ]);
    console.log('Products created');

    console.log('\n=== Seed Complete ===');
    console.log('Login credentials:');
    console.log('Admin: admin@pos.com / admin123');
    console.log('Cashier: cashier@pos.com / cashier123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
