import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Container } from 'react-bootstrap';

// Import the separated components with corrected paths
import { api } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; // Kept in case you re-add it
import AdminRegisterPage from './pages/AdminRegisterPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import { AboutPage, ContactPage } from './pages/StaticPage.jsx';
import CartModal from './components/CartModalMain.jsx'; // Renamed import
import Header from './components/HeaderMain.jsx';     // Renamed import
import Footer from './components/FooterMain.jsx';     // Renamed import
import { GlobalStyles } from './styles/GlobalStyles.jsx';
import WelcomePage from './components/WelcomePage.jsx';


// --- Main App ---
function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [menuItems, setMenuItems] = useState([]);
  
  // Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [showCart, setShowCart] = useState(false);
  
  const [auth, setAuth] = useState({
      customer: { token: null, name: null },
      admin: { token: null, name: null }
  });

  // --- NEW STATE for 2-step UPI checkout ---
  const [orderForPayment, setOrderForPayment] = useState(null);
  const [orderError, setOrderError] = useState('');
  // --- END NEW STATE ---

  const isCustomerLoggedIn = !!auth.customer.token;
  const isAdminLoggedIn = !!auth.admin.token;
  
  const handleHashChange = () => setRoute(window.location.hash || '#/');

  useEffect(() => {
    // Corrected localStorage keys to match api.js interceptor
    const customerToken = localStorage.getItem('customerToken');
    const customerName = localStorage.getItem('customerName');
    const adminToken = localStorage.getItem('adminToken');
    const adminName = localStorage.getItem('adminName');

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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleLoginSuccess = (token, name, role) => {
      if (role === 'admin') {
          // Corrected keys
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminName', name);
          setAuth(prev => ({ ...prev, admin: { token, name } }));
          window.location.hash = '#/admin';
      } else {
          // Corrected keys
          localStorage.setItem('customerToken', token);
          localStorage.setItem('customerName', name);
          setAuth(prev => ({ ...prev, customer: { token, name } }));
          window.location.hash = '#/menu'; // <-- Redirect to menu after login
      }
  };

  const handleLogout = (role) => {
      if (role === 'admin') {
          // Corrected keys
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminName');
          setAuth(prev => ({ ...prev, admin: { token: null, name: null } }));
          window.location.hash = '#/admin-login';
      } else {
          // Corrected keys
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerName');
          setAuth(prev => ({ ...prev, customer: { token: null, name: null } }));
          // Clear customer-specific data on logout
          setCartItems([]);
          localStorage.removeItem('cartItems');
          window.location.hash = '#/'; // <-- Redirect to welcome page on logout
      }
  };

  // --- MODIFIED: This function now handles the two-step payment flow ---
  const handlePlaceOrder = async (orderDetails) => {
      setOrderError('');
      try {
          // Note: orderDetails now contains paymentMethod
          const response = await api.post('/orders', orderDetails);
          const savedOrder = response.data;

          if (savedOrder.paymentMethod === 'UPI') {
              // If UPI, don't clear cart. Move to payment step.
              setOrderForPayment(savedOrder);
          } else {
              // If COD, clear cart and show success.
              setCartItems([]);
              // localStorage.removeItem('cartItems'); // Handled by useEffect
              setShowCart(false);
              alert('Order placed successfully (Cash on Delivery)!'); // Use a modal for this in production
          }
      } catch (err) {
          console.error('Error placing order:', err);
          setOrderError(err.response?.data?.message || 'Failed to place order.');
      }
  };

  // --- NEW FUNCTION: To confirm the UPI payment with UTR ---
  const handleConfirmUpiPayment = async (utr) => {
      if (!utr || utr.trim().length < 12) {
          setOrderError('Please enter a valid 12-digit UTR number.');
          return;
      }
      setOrderError('');
      
      try {
          await api.patch(`/api/orders/${orderForPayment._id}/confirm-payment`, { utr });
          
          // Payment successful
          setCartItems([]);
          // localStorage.removeItem('cartItems'); // Handled by useEffect
          setShowCart(false);
          setOrderForPayment(null); // Reset payment flow
          alert('Payment confirmed! Your order is being prepared.'); // Use a modal for this
          window.location.hash = '#/dashboard'; // Redirect to dashboard

      } catch (err) {
          console.error('Error confirming payment:', err);
          setOrderError(err.response?.data?.message || 'Failed to confirm payment. Please check your UTR and try again.');
      }
  };

  // --- NEW FUNCTION: To cancel the UPI payment step ---
  const handleCancelUpiPayment = () => {
      // In a real app, you might want to call an endpoint to delete the 'Pending Payment' order.
      // For now, we'll just reset the UI state.
      setOrderForPayment(null);
      setOrderError('');
  };
  
    const handleAddToCart = (itemToAdd, variant, quantity = 1, instructions = '') => {
        setCartItems(prevItems => {
            const cartId = `${itemToAdd._id}-${variant}-${instructions}`;
            const isItemInCart = prevItems.find(item => item.cartId === cartId);
            
            if (isItemInCart) {
                return prevItems.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item);
            }

            // Ensure priceAtOrder is correctly assigned from the item's price object
            const priceAtOrder = itemToAdd.price[variant];
            if (priceAtOrder == null) {
              console.error("Could not find price for variant:", variant, "on item:", itemToAdd);
              // Don't add item if price is missing
              return prevItems;
            }

            const newItem = {
                ...itemToAdd,
                quantity: quantity,
                variant: variant,
                priceAtOrder: priceAtOrder, // Use the correct price
                instructions: instructions,
                cartId: cartId
            };
            return [...prevItems, newItem];
        });
    };

    // --- NEW: Quantity Handlers for Cart ---
    const handleRemoveFromCart = (cartId) => {
      setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    const handleUpdateQuantity = (cartId, newQuantity) => {
      if (newQuantity < 1) {
        handleRemoveFromCart(cartId);
        return;
      }
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.cartId === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
    };
    // --- END: Quantity Handlers ---

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
      case '#/register': return <RegisterPage />; // Kept in case you re-add
      case '#/dashboard': return isCustomerLoggedIn ? <CustomerDashboard userName={auth.customer.name} /> : <WelcomePage />;
      case '#/menu': return isCustomerLoggedIn ? <MenuPage onAddToCart={handleAddToCart} menuItems={menuItems} /> : <WelcomePage />;
      case '#/':
      default:
        return isCustomerLoggedIn ? <MenuPage onAddToCart={handleAddToCart} menuItems={menuItems}/> : <WelcomePage />;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <GlobalStyles />
      <Header
        route={route}
        auth={auth}
        isCustomerLoggedIn={isCustomerLoggedIn}
        isAdminLoggedIn={isAdminLoggedIn}
        handleLogout={handleLogout}
        setShowCart={setShowCart}
        cartItems={cartItems}
      />
      {/* Use Container for consistent padding */}
      <Container as="main" className="my-5 flex-grow-1">
        {renderPage()}
      </Container>
      <Footer />
      
      {/* --- MODIFIED: Pass all new props to CartModal --- */}
      <CartModal
          show={showCart}
          handleClose={() => {
            setShowCart(false);
            handleCancelUpiPayment(); // Also cancel payment flow if closing modal
          }}
          cartItems={cartItems}
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onPlaceOrder={handlePlaceOrder}
          isLoggedIn={isCustomerLoggedIn}
          orderForPayment={orderForPayment}
          onConfirmUpiPayment={handleConfirmUpiPayment}
          onCancelUpiPayment={handleCancelUpiPayment}
          orderError={orderError}
      />
    </div>
  );
}

export default App;

