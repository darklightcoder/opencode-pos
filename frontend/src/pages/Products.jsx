import { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Products.css';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    barcode: '',
    stock: '',
    description: ''
  });

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, data);
      } else {
        await productService.createProduct(data);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', barcode: '', stock: '', description: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category?._id || '',
      barcode: product.barcode || '',
      stock: product.stock.toString(),
      description: product.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header flex justify-between items-center">
        <h1>Products</h1>
        {isManager && (
          <button className="btn btn-primary" onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: '', barcode: '', stock: '', description: '' });
            setShowModal(true);
          }}>
            + Add Product
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Barcode</th>
              {isManager && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.category?.name || '-'}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <span className={`badge ${product.stock <= 10 ? 'badge-warning' : 'badge-success'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>{product.barcode || '-'}</td>
                {isManager && (
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(product)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product._id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
