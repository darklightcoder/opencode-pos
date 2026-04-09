import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { saleService, productService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayTransactions: 0,
    last30DaysRevenue: 0,
    lowStockProducts: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          saleService.getDashboardStats(),
          saleService.getTodaySales()
        ]);
        setStats(statsRes.data);
        setRecentSales(salesRes.data.sales.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Today's Revenue</h4>
          <div className="value text-success">{formatCurrency(stats.todayRevenue)}</div>
        </div>
        <div className="stat-card">
          <h4>Today's Transactions</h4>
          <div className="value">{stats.todayTransactions}</div>
        </div>
        <div className="stat-card">
          <h4>Last 30 Days Revenue</h4>
          <div className="value">{formatCurrency(stats.last30DaysRevenue)}</div>
        </div>
        <div className="stat-card">
          <h4>Low Stock Items</h4>
          <div className="value text-danger">{stats.lowStockProducts}</div>
        </div>
      </div>

      <div className="recent-sales card">
        <h3>Recent Sales</h3>
        {recentSales.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale._id}>
                  <td>#{sale._id.slice(-8)}</td>
                  <td>{sale.items.length} items</td>
                  <td className="text-success">{formatCurrency(sale.total)}</td>
                  <td>{formatDate(sale.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No sales today</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
