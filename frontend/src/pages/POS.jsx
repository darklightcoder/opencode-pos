import { useState, useEffect } from 'react';
import { productService, categoryService, saleService } from '../services/api';
import './POS.css';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');

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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
    const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product === product._id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price
        }
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.product !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product === productId
            ? { ...item, quantity, subtotal: quantity * item.price }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setProcessing(true);
    try {
      const payment = parseFloat(amountPaid) || cartTotal;
      await saleService.createSale({
        items: cart,
        subtotal: cartTotal,
        tax: 0,
        discount: 0,
        total: cartTotal,
        paymentMethod: 'cash',
        amountPaid: payment,
        change: payment - cartTotal
      });
      
      setCart([]);
      setShowCheckout(false);
      setAmountPaid('');
      alert('Sale completed successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Sale failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading POS...</div>;
  }

  return (
    <div className="pos-page">
      <div className="pos-products">
        <div className="pos-header">
          <h2>Products</h2>
          <div className="pos-controls">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="category-tabs">
          <button
            className={`category-tab ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`category-tab ${selectedCategory === cat._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => addToCart(product)}
            >
              <div className="product-name">{product.name}</div>
              <div className="product-price">${product.price.toFixed(2)}</div>
              <div className="product-stock">Stock: {product.stock}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-cart">
        <h2>Cart ({cart.length})</h2>
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Cart is empty</p>
            <small>Click products to add them</small>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.product} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">${item.price.toFixed(2)}</div>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.product, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product, item.quantity + 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeFromCart(item.product)}>×</button>
                  </div>
                  <div className="cart-item-subtotal">${item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary checkout-btn" onClick={() => setShowCheckout(true)}>
              Checkout
            </button>
          </>
        )}
      </div>

      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Checkout</h3>
              <button onClick={() => setShowCheckout(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="checkout-total">
                <span>Total Amount</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="form-group">
                <label>Amount Paid</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount"
                  min={cartTotal}
                  step="0.01"
                />
              </div>
              {amountPaid && parseFloat(amountPaid) >= cartTotal && (
                <div className="change-display">
                  Change: ${(parseFloat(amountPaid) - cartTotal).toFixed(2)}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCheckout(false)}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleCheckout}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
