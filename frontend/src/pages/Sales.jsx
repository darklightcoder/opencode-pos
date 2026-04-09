import { useState, useEffect } from 'react';
import { saleService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Sales.css';

const Sales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalRevenue: 0, total: 0 });

  const isManager = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchSales();
  }, [page]);

  const fetchSales = async () => {
    try {
      const response = await saleService.getSales({ page, limit: 20 });
      setSales(response.data.sales);
      setTotalPages(response.data.totalPages);
      setStats({ totalRevenue: response.data.totalRevenue, total: response.data.total });
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id) => {
    if (!confirm('Are you sure you want to refund this sale?')) return;
    try {
      await saleService.refundSale(id);
      fetchSales();
      setSelectedSale(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Refund failed');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading sales...</div>;
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Sales History</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <h4>Total Revenue</h4>
          <div className="value text-success">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <h4>Total Transactions</h4>
          <div className="value">{stats.total}</div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Cashier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id}>
                <td>#{sale._id.slice(-8)}</td>
                <td>{formatDate(sale.createdAt)}</td>
                <td>{sale.items.length} items</td>
                <td className="text-success">{formatCurrency(sale.total)}</td>
                <td>{sale.paymentMethod}</td>
                <td>{sale.cashier?.name || '-'}</td>
                <td>
                  <span className={`badge ${sale.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                    {sale.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSale(sale)}>
                    View
                  </button>
                  {isManager && sale.status === 'completed' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleRefund(sale._id)}>
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedSale && (
        <div className="modal-overlay" onClick={() => setSelectedSale(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sale Details</h3>
              <button onClick={() => setSelectedSale(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="sale-details">
                <div className="detail-row">
                  <span>Sale ID:</span>
                  <span>#{selectedSale._id.slice(-8)}</span>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{formatDate(selectedSale.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span>Cashier:</span>
                  <span>{selectedSale.cashier?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`badge ${selectedSale.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                    {selectedSale.status}
                  </span>
                </div>
              </div>

              <h4>Items</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="sale-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Tax:</span>
                  <span>{formatCurrency(selectedSale.tax)}</span>
                </div>
                <div className="total-row">
                  <span>Discount:</span>
                  <span>{formatCurrency(selectedSale.discount)}</span>
                </div>
                <div className="total-row total">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
