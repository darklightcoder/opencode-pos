# POS System - MERN Stack

A full-stack Point of Sale (POS) system built with MongoDB, Express, React, and Node.js.

## Features

- **Authentication** - Role-based access (Admin, Manager, Cashier)
- **POS Screen** - Quick product selection and cart management
- **Product Management** - CRUD operations for products and categories
- **Sales Tracking** - Transaction history and daily reports
- **User Management** - Manage staff accounts (Admin only)
- **Dashboard** - Real-time sales statistics

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Backend Setup

```bash
cd pos-system/backend
npm install
```

### 2. Frontend Setup

```bash
cd pos-system/frontend
npm install
```

## Configuration

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=your_jwt_secret_key
```

### Frontend

The frontend is configured to proxy API requests to `http://localhost:5000` via Vite.

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system.

### 2. Seed the Database

```bash
cd pos-system/backend
node seed.js
```

This creates:
- Admin user: `admin@pos.com` / `admin123`
- Cashier user: `cashier@pos.com` / `cashier123`
- Sample categories and products

### 3. Start Backend

```bash
cd pos-system/backend
npm run dev
```

### 4. Start Frontend

```bash
cd pos-system/frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## User Roles

| Role    | Permissions |
|---------|-------------|
| Admin   | Full access to all features |
| Manager | Products, Categories, Sales, View Users |
| Cashier | POS, View Sales |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - List sales
- `GET /api/sales/today` - Today's sales
- `GET /api/sales/dashboard` - Dashboard stats

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React 18, React Router, Axios, Vite
- **Authentication**: JWT, bcrypt

## License

MIT
