const User = require('../models/User');

const userController = {
  getUsers: async (req, res) => {
    try {
      const users = await User.find({ isActive: true }).select('-password').sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({
        name,
        email,
        password,
        role: role || 'cashier'
      });

      const createdUser = await user.save();
      
      res.status(201).json({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        isActive: createdUser.isActive
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        
        if (req.body.password) {
          user.password = req.body.password;
        }

        if (req.body.isActive !== undefined) {
          user.isActive = req.body.isActive;
        }

        const updatedUser = await user.save();
        
        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        if (user.role === 'admin') {
          return res.status(400).json({ message: 'Cannot delete admin user' });
        }
        
        user.isActive = false;
        await user.save();
        res.json({ message: 'User removed' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getCashiers: async (req, res) => {
    try {
      const users = await User.find({ 
        isActive: true, 
        role: { $in: ['cashier', 'manager'] } 
      }).select('-password').sort({ name: 1 });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userController;
