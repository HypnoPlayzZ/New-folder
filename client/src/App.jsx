import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import the separated components with corrected paths
import { api } from './api.js';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminRegisterPage from './pages/AdminRegisterPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import { AboutPage, ContactPage } from './pages/StaticPage.jsx';
import CartModalMain from './components/CartModalMain.jsx'; // This is CartModalMain
import Header from './components/HeaderMain.jsx';     // This is HeaderMain
import Footer from './components/FooterMain.jsx';     // This is FooterMain
import { GlobalStyles } from './styles/GlobalStyles.jsx';
import WelcomePage from './components/WelcomePage.jsx';

// --- Main App ---
function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [menuItems, setMenuItems] = useState([]);
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        if (!savedCart) {
            return [];
        }
        const items = JSON.parse(savedCart);
        
        // --- DATA MIGRATION/CLEANUP ---
        // Check if any item has the old price format (an object)
        const needsCleaning = items.some(item => typeof item.price === 'object' && item.price !== null);
        
        if (needsCleaning) {
            const cleanedItems = items.map(item => {
                if (typeof item.price === 'object' && item.price !== null) {
                    // It's the old format. Convert it.
                    // We must have a variant to know which price to use.
                    if (item.variant === 'half' && item.price.half) {
                        return { ...item, price: item.price.half };
                    }
                    // Default to full price if variant is 'full' or 'half' is missing
                    return { ...item, price: item.price.full };
                }
                // It's already in the new format (or it's broken, in which case it'll be filtered)
                return item;
            }).filter(item => typeof item.price === 'number' && !isNaN(item.price)); // Filter out any broken items
            
            localStorage.setItem('cartItems', JSON.stringify(cleanedItems)); // Save the cleaned cart
            return cleanedItems;
        }
        
        return items; // No cleaning needed
    });
    const [showCart, setShowCart] = useState(false);
  
  const [auth, setAuth] = useState({
      customer: { token: null, name: null },
      admin: { token: null, name: null }
  });

  // --- NEW STATE for 2-step UPI checkout (from File 1) ---
  const [orderForPayment, setOrderForPayment] = useState(null);
  const [orderError, setOrderError] = useState('');

  const isCustomerLoggedIn = !!auth.customer.token;
  const isAdminLoggedIn = !!auth.admin.token;
  
  const handleHashChange = () => setRoute(window.location.hash || '#/');

  useEffect(() => {
    const customerToken = localStorage.getItem('customer_token');
    const customerName = localStorage.getItem('customer_name');
    const adminToken = localStorage.getItem('admin_token');
    const adminName = localStorage.getItem('admin_name');

    setAuth({
        customer: { token: customerToken, name: customerName },
        admin: { token: adminToken, name: adminName }
    });
    
    // Persist cart from localStorage
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

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
          localStorage.removeItem('cartItems'); // Clear cart on logout
          setAuth(prev => ({ ...prev, customer: { token: null, name: null } }));
          setCartItems([]); // Clear cart state
          window.location.hash = '#/'; // <-- Redirect to welcome page on logout
      }
  };

  // --- Cart Handlers ---

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

  // Added from File 1's prop requirements
  const handleRemoveFromCart = (cartId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };

  // Added from File 1's prop requirements
  const handleUpdateQuantity = (cartId, quantity) => {
    if (quantity < 1) {
        handleRemoveFromCart(cartId);
        return;
    }
    setCartItems(prevItems => 
        prevItems.map(item => 
            item.cartId === cartId ? { ...item, quantity: quantity } : item
        )
    );
  };

  // --- MERGED ORDER LOGIC ---
  // This combines File 2's `submitOrder` and File 1's `handlePlaceOrder`
  const handlePlaceOrder = async (finalTotal, appliedCoupon, address, paymentMethod) => {
    setOrderError(''); // Clear previous errors
    
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
        appliedCoupon: appliedCoupon ? {
            code: appliedCoupon.code,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue
        } : undefined,
        customerName: auth.customer.name,
        address: address,
        paymentMethod: paymentMethod // Add payment method to the order
    };

    try {
        const response = await api.post('/api/orders', orderDetails);
        const savedOrder = response.data;

        if (savedOrder.paymentMethod === 'UPI') {
            // If UPI, don't clear cart. Move to payment step.
            setOrderForPayment(savedOrder);
        } else {
            // If COD, clear cart and show success.
            setCartItems([]);
            localStorage.removeItem('cartItems');
            setShowCart(false);
            alert('Order placed successfully (Cash on Delivery)!'); // Use a modal for this in production
        }
    } catch (err) {
        console.error('Error placing order:', err);
        setOrderError(err.response?.data?.message || 'Failed to place order.');
    }
  };

  // --- NEW FUNCTION: To confirm the UPI payment with UTR (from File 1) ---
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
          localStorage.removeItem('cartItems');
          setShowCart(false);
          setOrderForPayment(null); // Reset payment flow
          alert('Payment confirmed! Your order is being prepared.'); // Use a modal for this
          window.location.hash = '#/dashboard'; // Redirect to dashboard

      } catch (err) {
          console.error('Error confirming payment:', err);
          setOrderError(err.response?.data?.message || 'Failed to confirm payment. Please check your UTR and try again.');
      }
  };

  // --- NEW FUNCTION: To cancel the UPI payment step (from File 1) ---
  const handleCancelUpiPayment = () => {
      // Here you might want to delete the 'Pending Payment' order on the backend,
      // but for now, we'll just reset the UI.
      setOrderForPayment(null);
      setOrderError('');
  };

  // --- Page Rendering Logic (from File 2) ---
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
      <main className="container my-5 flex-grow-1">{renderPage()}</main>
      <Footer />
      
      {/* --- MODIFIED: Cart modal now uses all new props --- */}
      <CartModal 
          show={showCart} 
          handleClose={() => setShowCart(false)} 
          cartItems={cartItems} 
          isLoggedIn={isCustomerLoggedIn}
          // --- Updated Props ---
          onRemoveFromCart={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onPlaceOrder={handlePlaceOrder} // Replaced submitOrder
          // --- New Props for UPI Flow ---
          orderForPayment={orderForPayment}
          onConfirmUpiPayment={handleConfirmUpiPayment}
          onCancelUpiPayment={handleCancelUpiPayment}
          orderError={orderError}
      />
    </div>
  );
}

export default App;