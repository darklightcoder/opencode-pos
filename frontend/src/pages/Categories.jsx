import { useState, useEffect } from 'react';
import { categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Categories.css';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header flex justify-between items-center">
        <h1>Categories</h1>
        {isManager && (
          <button className="btn btn-primary" onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            setShowModal(true);
          }}>
            + Add Category
          </button>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created</th>
              {isManager && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>
                  <span className={`badge ${category.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                {isManager && (
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(category)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(category._id)}>
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
              <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
