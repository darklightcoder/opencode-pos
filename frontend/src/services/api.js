import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock')
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

export const saleService = {
  createSale: (data) => api.post('/sales', data),
  getSales: (params) => api.get('/sales', { params }),
  getSale: (id) => api.get(`/sales/${id}`),
  getTodaySales: () => api.get('/sales/today'),
  getDashboardStats: () => api.get('/sales/dashboard'),
  refundSale: (id) => api.post(`/sales/${id}/refund`)
};

export const userService = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getCashiers: () => api.get('/users/cashiers')
};

export default api;
