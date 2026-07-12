import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import only the necessary admin components
import { api } from './api.js';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminRegisterPage from './pages/AdminRegisterPage.jsx';
import Footer from './components/FooterMain.jsx';
import { GlobalStyles } from './styles/GlobalStyles.jsx';


// Catches any render-time crash (e.g. a malformed order record) so ONE bad row can't
// white-screen the entire dashboard. Without this, an unguarded field access unmounts
// the whole React tree for every admin.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('[admin] render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-5 text-center">
          <h4>Something went wrong loading this view.</h4>
          <p className="text-muted">One record couldn't be displayed. The rest of the dashboard is fine.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload dashboard</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main Admin App ---
function App() {
  const [route, setRoute] = useState(window.location.hash || '#/admin-login');
  const [auth, setAuth] = useState({ token: null, name: null });
  const isAdminLoggedIn = !!auth.token;
  
  const handleHashChange = () => setRoute(window.location.hash || '#/admin-login');

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminName = localStorage.getItem('admin_name');
    setAuth({ token: adminToken, name: adminName });

    // When any API call 401s (expired/invalid token), api.js fires this — flip auth state
    // so the app shows the login page instead of a hung, silently-failing dashboard.
    const onUnauth = () => setAuth({ token: null, name: null });
    window.addEventListener('admin-unauthorized', onUnauth);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('admin-unauthorized', onUnauth);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLoginSuccess = (token, name) => {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_name', name);
      setAuth({ token, name });
      window.location.hash = '#/admin'; // Redirect to dashboard on successful login
  };

  const handleLogout = () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_name');
      setAuth({ token: null, name: null });
      window.location.hash = '#/admin-login';
  };

  const renderPage = () => {
    if (!isAdminLoggedIn) {
        // If not logged in, show the login page regardless of the hash
        return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    
    // If logged in, render pages based on the route
    switch (route) {
      case '#/admin-register': return <AdminRegisterPage />;
      case '#/admin':
      default:
         return <AdminDashboard adminName={auth.name} handleLogout={handleLogout} />;
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <GlobalStyles />
      <main className="container my-5 flex-grow-1"><ErrorBoundary>{renderPage()}</ErrorBoundary></main>
      <Footer />
    </div>
  );
}

export default App;

