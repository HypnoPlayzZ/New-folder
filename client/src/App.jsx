import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import the separated components with corrected paths
import { api } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
// Admin dashboard lives in the separate `admin/` app. Use a lightweight placeholder
// so the client build doesn't fail when referencing admin routes.
const AdminDashboard = ({ adminName, handleLogout }) => (
  <div className="p-5 text-center">
    <h2>Admin Console</h2>
    <p>This project separates the Admin app. Open the <a href="/admin/index.html">Admin dashboard</a> in a new tab.</p>
    <p>If you intended to embed admin here, add <code>client/src/pages/AdminDashboard.jsx</code>.</p>
  </div>
);
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminRegisterPage from './pages/AdminRegisterPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import { AboutPage, ContactPage } from './pages/StaticPage.jsx';
import CartModal from './components/CartModalMain.jsx';
import Header from './components/HeaderMain.jsx';
import Footer from './components/FooterMain.jsx';
import { GlobalStyles } from './styles/GlobalStyles.jsx';
import WelcomePage from './components/WelcomePage.jsx'; // <-- Import the new Welcome Page


// --- Main App ---
function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [menuItems, setMenuItems] = useState([]);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      console.warn('Failed to read theme from storage', e);
      return 'light';
    }
  });
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse stored cart items', e);
      return [];
    }
  });
  const [showCart, setShowCart] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState(null);
  const [orderError, setOrderError] = useState('');
  const [waitingForAdmin, setWaitingForAdmin] = useState(false);
  const [adminWaitLeft, setAdminWaitLeft] = useState(600); // 10 minutes
  const adminPollRef = React.useRef(null);
  const adminTimerRef = React.useRef(null);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(false);
  
  const [auth, setAuth] = useState({
      customer: { token: null, name: null },
      admin: { token: null, name: null }
  });

  const isCustomerLoggedIn = !!auth.customer.token;
  const isAdminLoggedIn = !!auth.admin.token;
  
  const handleHashChange = () => setRoute(window.location.hash || '#/');

  // Persist current theme to DOM and localStorage
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme', e);
    }
  }, [theme]);

  // Toggle between dark and light theme
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');
    const adminToken = localStorage.getItem('admin_token');
    const adminName = localStorage.getItem('admin_name');

    setAuth({
        customer: { token: customerToken, name: customerName },
        admin: { token: adminToken, name: adminName }
    });

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  useEffect(() => {
    if (isCustomerLoggedIn) { // Only fetch menu if a customer is logged in
        api.get('/menu')
          .then(response => setMenuItems(response.data))
          .catch(error => console.error("Error fetching menu items:", error));
    }
  }, [isCustomerLoggedIn]);

  const handleLoginSuccess = (token, name, role) => {
    if (role === 'admin') {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_name', name);
      setAuth(prev => ({ ...prev, admin: { token, name } }));
      window.location.hash = '#/admin';
    } else {
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_name', name);
      setAuth(prev => ({ ...prev, customer: { token, name } }));
      setShowWelcomeOverlay(true);
      window.location.hash = '#/menu'; // <-- Redirect to menu after login
    }
  };

  const handleLogout = (role) => {
      if (role === 'admin') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_name');
          setAuth(prev => ({ ...prev, admin: { token: null, name: null } }));
          window.location.hash = '#/admin-login';
      } else {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_name');
          // keep cart persistent across refreshes even after logout; remove if you prefer clearing on logout
          setAuth(prev => ({ ...prev, customer: { token: null, name: null } }));
          window.location.hash = '#/'; // <-- Redirect to welcome page on logout
      }
  };

  // Persist cart to localStorage whenever it changes so a full page refresh won't clear it
  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartItems || []));
    } catch (e) {
      console.warn('Failed to persist cart items', e);
    }
  }, [cartItems]);

  const submitOrder = async (finalTotal, appliedCoupon = null, address, customerNameParam = null, paymentMethodParam = 'COD', mobileParam = null, locationCoordsParam = null) => {
    const orderDetails = {
      items: cartItems.map(item => ({ 
        menuItemId: item._id, 
        quantity: item.quantity,
        variant: item.variant,
        priceAtOrder: item.priceAtOrder,
        instructions: item.instructions
      })),
      totalPrice: cartItems.reduce((total, item) => total + item.priceAtOrder * item.quantity, 0),
      finalPrice: finalTotal,
      paymentMethod: paymentMethodParam,
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue
      } : undefined,
      customerName: customerNameParam || auth.customer.name,
      address: address, // Include the address in the order details
      mobile: mobileParam || undefined,
      locationCoords: locationCoordsParam || undefined,
      locationLink: locationCoordsParam ? `https://maps.google.com/?q=${encodeURIComponent(locationCoordsParam)}` : undefined
    };

    try {
      const res = await api.post('/orders', orderDetails);
      // If UPI, return the created order and keep cart until payment confirmed
      if (paymentMethodParam === 'UPI') {
        const created = res.data;
        setOrderForPayment(created);
        setShowCart(true);
        return created;
      }

      // For COD, clear cart immediately
      alert('Order placed successfully!');
      setCartItems([]);
      setShowCart(false);
      return res.data;
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.response?.data?.message || 'There was a problem placing your order.';
      setOrderError(errorMessage);
      alert(errorMessage);
      throw error;
    }
  };

  const handleConfirmUpiPayment = async (orderId, utr) => {
    try {
      const res = await api.patch(`/orders/${orderId}/confirm-payment`, { utr });
      // Server accepted the UTR and set paymentStatus = 'Paid' and status = 'Received'
      const updatedOrder = res.data;
      setOrderForPayment(updatedOrder);

      // Start waiting for admin acknowledgement (in case admin still needs to mark as Received)
      setWaitingForAdmin(true);
      setAdminWaitLeft(600); // 10 minutes

      // Start polling customer's orders to detect admin confirmation
      if (adminPollRef.current) clearInterval(adminPollRef.current);
      adminPollRef.current = setInterval(async () => {
        try {
          const all = await api.get('/my-orders');
          const found = (all.data || []).find(o => o._id === orderId);
          if (found) {
            setOrderForPayment(found);
            // Consider payment confirmed when paymentStatus is Paid OR admin has acknowledged/isAcknowledged true OR status === 'Received'
            // Wait for explicit admin acknowledgement (isAcknowledged) before finalizing for the user.
            if (found.isAcknowledged) {
              clearInterval(adminPollRef.current); adminPollRef.current = null;
              if (adminTimerRef.current) { clearInterval(adminTimerRef.current); adminTimerRef.current = null; }
              setWaitingForAdmin(false);
              setCartItems([]);
              setOrderForPayment(null);
              setShowCart(false);
              alert('Payment acknowledged by admin. Thank you!');
            }
          }
        } catch (e) {
          console.warn('Polling orders failed', e);
        }
      }, 5000);

      // Admin wait countdown
      if (adminTimerRef.current) clearInterval(adminTimerRef.current);
      adminTimerRef.current = setInterval(() => {
        setAdminWaitLeft(s => {
          if (s <= 1) {
            // timeout: stop polling and notify user
            if (adminPollRef.current) { clearInterval(adminPollRef.current); adminPollRef.current = null; }
            if (adminTimerRef.current) { clearInterval(adminTimerRef.current); adminTimerRef.current = null; }
            setWaitingForAdmin(false);
            setOrderError('Waiting for admin confirmation timed out. Please contact support.');
            return 0;
          }
          return s - 1;
        });

      }, 1000);

      return updatedOrder;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm payment.';
      setOrderError(msg);
      alert(msg);
      throw err;
    }
  };

  const handleCancelUpiPayment = () => {
    setOrderForPayment(null);
    setOrderError('');
    setWaitingForAdmin(false);
    setAdminWaitLeft(0);
    if (adminPollRef.current) { clearInterval(adminPollRef.current); adminPollRef.current = null; }
    if (adminTimerRef.current) { clearInterval(adminTimerRef.current); adminTimerRef.current = null; }
  };
  
    const handleAddToCart = (itemToAdd, variant, quantity = 1, instructions = '') => {
        setCartItems(prevItems => {
            const cartId = `${itemToAdd._id}-${variant}-${instructions}`;
            const isItemInCart = prevItems.find(item => item.cartId === cartId);
            
            if (isItemInCart) { 
                return prevItems.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item); 
            }

            const newItem = { 
                ...itemToAdd, 
                quantity: quantity, 
                variant: variant,
                priceAtOrder: itemToAdd.price[variant],
                instructions: instructions,
                cartId: cartId
            };
            return [...prevItems, newItem];
        });
    };

  const renderPage = () => {
    // Admin routes are separate and require admin login
    if (route.startsWith('#/admin')) {
         if (!isAdminLoggedIn) return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
         switch(route) {
            case '#/admin': return <AdminDashboard adminName={auth.admin.name} handleLogout={handleLogout} />;
            case '#/admin-register': return <AdminRegisterPage />;
            default: return <AdminDashboard adminName={auth.admin.name} handleLogout={handleLogout} />;
         }
    }

    // Customer routes
    switch (route) {
      case '#/about': return <AboutPage />;
      case '#/contact': return <ContactPage />;
      case '#/login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case '#/register': return <RegisterPage />;
      case '#/dashboard': return isCustomerLoggedIn ? <CustomerDashboard userName={auth.customer.name} /> : <HomePage />;
      case '#/menu': return isCustomerLoggedIn ? <MenuPage onAddToCart={handleAddToCart} menuItems={menuItems} /> : <HomePage />;
      case '#/home': return <HomePage />;
      case '#/': 
      default: 
        return <HomePage />;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <GlobalStyles />
      {isCustomerLoggedIn && showWelcomeOverlay && (
        <div className="glass-overlay" role="dialog" aria-label="Welcome back">
          <div className="glass-card">
            <div className="promo-bubble-container">
              <div className="promo-bubble">
                <div className="promo-bubble-text">Order Now for Free Home Delivery and 10% Instant Discount</div>
              </div>
            </div>
            <div className="overlay-content">
              <div className="overlay-main">
                <h4 className="overlay-title">Welcome back! 🎉</h4>
                <p className="overlay-subtitle">Your next order comes with exclusive perks</p>
                <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
                  <Button variant="primary" size="lg" className="btn-style-fill" onClick={() => setShowWelcomeOverlay(false)}>Start ordering</Button>
                  <Button variant="outline-light" size="lg" className="btn-style-outline" onClick={() => setShowWelcomeOverlay(false)}>Maybe later</Button>
                </div>
              </div>
              <div className="reviews-panel">
                <div className="reviews-title">⭐ Live Reviews from Happy Diners</div>
                <div className="reviews-window">
                  <div className="reviews-track">
                    {[
                      { name: 'Ananya', text: 'Super quick delivery and piping hot momos!', rating: '★★★★★' },
                      { name: 'Rohit', text: 'Loved the spicy chutney. Ordering again tonight.', rating: '★★★★☆' },
                      { name: 'Priya', text: 'Free delivery made my day. Great portions too.', rating: '★★★★★' },
                      { name: 'Kabir', text: 'Soft inside, crispy outside. Perfect!', rating: '★★★★☆' },
                      { name: 'Meera', text: 'Best momos in town! Fresh and delicious.', rating: '★★★★★' },
                      { name: 'Sanjay', text: 'The garlic sauce is addictive. Must try!', rating: '★★★★★' },
                      { name: 'Nikita', text: 'Generous portions, fair prices. Love it!', rating: '★★★★☆' },
                      { name: 'Arjun', text: 'Delivery in 15 minutes! Amazing service.', rating: '★★★★★' },
                      { name: 'Ananya', text: 'Super quick delivery and piping hot momos!', rating: '★★★★★' },
                      { name: 'Rohit', text: 'Loved the spicy chutney. Ordering again tonight.', rating: '★★★★☆' },
                      { name: 'Priya', text: 'Free delivery made my day. Great portions too.', rating: '★★★★★' },
                      { name: 'Kabir', text: 'Soft inside, crispy outside. Perfect!', rating: '★★★★☆' },
                    ].map((rev, idx) => (
                      <div key={idx} className="review-item">
                        <div className="review-rating">{rev.rating}</div>
                        <div className="review-text">"{rev.text}"</div>
                        <div className="review-name">— {rev.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button className="overlay-close" onClick={() => setShowWelcomeOverlay(false)} aria-label="Close welcome overlay">×</button>
          </div>
        </div>
      )}
      <Header 
        route={route}
        auth={auth}
        isCustomerLoggedIn={isCustomerLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
        handleLogout={handleLogout}
        setShowCart={setShowCart}
        cartItems={cartItems}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="container my-5 flex-grow-1">{renderPage()}</main>
      <Footer />
      <CartModal 
          show={showCart} 
          handleClose={() => setShowCart(false)} 
          cartItems={cartItems} 
          setCartItems={setCartItems} 
      submitOrder={submitOrder} 
      isLoggedIn={isCustomerLoggedIn}
      orderForPayment={orderForPayment}
    onConfirmUpiPayment={(utr) => handleConfirmUpiPayment(orderForPayment?._id, utr)}
      onCancelUpiPayment={handleCancelUpiPayment}
      orderError={orderError}
    waitingForAdmin={waitingForAdmin}
    adminWaitLeft={adminWaitLeft}
    upiId={'8178767938-3@ybl'}
    upiQrUrl={'/upi_qr.png'}
      />
    </div>
  );
}

export default App;

// Cleanup intervals on module unmount (if app hot-reloads or navigates away)
// Note: React components rarely unmount in SPA, but this is defensive.
// This runs when the module is re-evaluated in dev/hmr; keep intervals cleared.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    try {
      // Clear any global refs if present
    } catch (e) {}
  });
}

