import React from 'react';
import { Navbar, Nav, Button, Badge, Container } from 'react-bootstrap';

// --- SVG Icons ---
// Using inline SVGs for a unique look without new dependencies

const IconFire = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-fire" viewBox="0 0 16 16" style={{ transform: 'translateY(-1px)' }}>
    <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2.75-2.5 2.75-1.25 0-2.75-1.25-2.75-2.75 0-1.5 1-2.75 2.5-4C6.5 2 6 4.5 6 6c0 3.5 2.686 5.5 6 5.5-1.25 0-2 1-2 2.5 0 .828.672 1.5 1.5 1.5.65 0 1.5-.5 2-1 .5 2-1 4-4 4z" />
  </svg>
);

const IconBasket = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-basket-fill" viewBox="0 0 16 16">
    <path d="M5.071 1.243a.5.5 0 0 1 .858.514L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-.623l-1.844 6.456a.75.75 0 0 1-.722.544H3.69a.75.75 0 0 1-.722-.544L1.123 8H.5a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 .5 6h1.717zM3.5 10.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0m2 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0m2 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0m2 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0m2 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0" />
  </svg>
);

const IconPerson = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
  </svg>
);

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
  </svg>
);

const IconLogin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z" />
    <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
  </svg>
);

const IconMoon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-moon-stars" viewBox="0 0 16 16">
        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.733 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278" />
        <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
    </svg>
);

const IconSun = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-sun" viewBox="0 0 16 16">
        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
        <path d="M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707L12.536 4.17a.5.5 0 1 1-.707-.707l1.122-1.12a.5.5 0 0 1 .707 0M4.171 12.536a.5.5 0 0 1 0 .707l-1.12 1.122a.5.5 0 0 1-.708-.707l1.122-1.122a.5.5 0 0 1 .706 0m9.193 1.829a.5.5 0 0 1-.707 0l-1.122-1.122a.5.5 0 1 1 .707-.707l1.122 1.122a.5.5 0 0 1 0 .707M4.171 3.464a.5.5 0 0 1-.707 0L2.342 2.343a.5.5 0 1 1 .707-.707l1.122 1.122a.5.5 0 0 1 0 .707" />
    </svg>
);


// --- Header Component ---

const Header = ({ route, auth, isCustomerLoggedIn, isAdminLoggedIn, handleLogout, setShowCart, cartItems, theme, onToggleTheme }) => {
    const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const renderAuthButtons = () => {
        if (isCustomerLoggedIn) {
            return (
                <>
                    <Nav.Link href="#/dashboard" className="nav-link-style d-flex align-items-center me-2 text-white">
                        <IconPerson className="me-2" />
                        {auth.customer.name}
                    </Nav.Link>
                    <Button variant="outline-light" onClick={() => handleLogout('customer')} className="btn-style-outline ms-2 d-flex align-items-center">
                        <IconLogout className="me-2" />
                        Logout
                    </Button>
                </>
            );
        }
        return (
            <Button href="#/login" variant="danger" className="btn-style-fill ms-2 d-flex align-items-center">
                <IconLogin className="me-2" />
                Login
            </Button>
        );
    };
    
    if (route.startsWith('#/admin')) {
        return null; 
    }

    return (
        <>
            <style type="text/css">
                {`
                /* Load an attractive headline font */
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap');

                :root {
                    --brand-orange: #ff7a00;
                    --brand-dark: #111111;
                    --muted: rgba(0,0,0,0.65);
                }

                :root[data-theme='dark'] {
                    --brand-dark: #f5f7fb;
                }

                .navbar-brand-style {
                    font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--brand-orange) !important;
                    transition: transform 0.28s ease, text-shadow 0.2s ease;
                    letter-spacing: 0.4px;
                    text-shadow: 0 2px 6px rgba(0,0,0,0.06);
                }
                .navbar-brand-style:hover {
                    transform: translateY(-3px) scale(1.02);
                }

                .nav-link-style {
                    font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
                    font-weight: 600;
                    color: var(--brand-dark) !important;
                    transition: color 0.22s ease, transform 0.22s ease;
                    position: relative;
                    padding-bottom: 6px;
                }
                .nav-link-style::after {
                    content: '';
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    bottom: 0;
                    height: 3px;
                    width: 60%;
                    background: linear-gradient(90deg, var(--brand-orange), #ffB66b);
                    transition: transform 0.26s cubic-bezier(.2,.9,.3,1);
                    transform-origin: center;
                    border-radius: 4px;
                }
                .nav-link-style:hover,
                .nav-link-style.active {
                    color: var(--brand-dark) !important;
                    transform: translateY(-4px);
                }
                .nav-link-style:hover::after,
                .nav-link-style.active::after {
                    transform: translateX(-50%) scaleX(1);
                }

                .btn-style-fill, .btn-style-outline, .cart-button-style, .theme-toggle {
                    border-radius: 50px;
                    font-weight: 600;
                    padding: 0.5rem 1.25rem;
                    transition: all 0.28s ease;
                    border-width: 2px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Smaller, well-aligned theme toggle */
                .theme-toggle {
                    padding: 0.3rem 0.75rem;
                    font-size: 0.85rem;
                    line-height: 1;
                    border-radius: 24px;
                    gap: 6px;
                }

                .btn-style-fill {
                    background-color: var(--brand-orange);
                    border-color: var(--brand-orange);
                    color: white;
                }
                .btn-style-fill:hover {
                    background-color: #ff8f33;
                    border-color: #ff8f33;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(255,122,0,0.18);
                }

                .btn-style-outline {
                    color: var(--brand-dark);
                    border-color: rgba(0,0,0,0.08);
                    background: transparent;
                }
                .btn-style-outline:hover {
                    color: white;
                    background-color: var(--brand-dark);
                    border-color: var(--brand-dark);
                    transform: translateY(-3px);
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                }

                .cart-button-style {
                    background-color: var(--brand-orange);
                    border-color: var(--brand-orange);
                    color: white;
                }
                .cart-button-style .badge {
                    background-color: white !important;
                    color: var(--brand-orange) !important;
                    transition: transform 0.2s ease;
                }
                .cart-button-style:hover {
                    background-color: #ff8f33;
                    border-color: #ff8f33;
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(255,122,0,0.18);
                }
                .cart-button-style:hover .badge {
                    transform: scale(1.12);
                }
                `}
            </style>
            <Navbar bg="light" variant="light" expand="lg" sticky="top" className="shadow-sm py-3">
                <Container fluid className="px-md-4">
                    <Navbar.Brand href={isCustomerLoggedIn ? "#/menu" : "#/"} className="navbar-brand-style d-flex align-items-center">
                        {/* Logo from public folder (place your logo as public/steamy-logo.png) */}
                        <img
                            src="/Logo.png"
                            alt="Steamy Bites"
                            style={{ height: 36, width: 'auto', marginRight: 8 }}
                            onError={(e) => { /* hide if missing so SVG fallback remains visible */ e.target.style.display = 'none'; }}
                        />
                        {/* SVG fallback icon remains for when image is absent */}
                        Steamy Bites
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            {isCustomerLoggedIn && <Nav.Link href="#/menu" className="nav-link-style">Menu</Nav.Link>}
                            <Nav.Link href="#/" className="nav-link-style">Home</Nav.Link>
                            <Nav.Link href="#/about" className="nav-link-style">About</Nav.Link>
                            <Nav.Link href="#/contact" className="nav-link-style">Contact</Nav.Link>
                            <Button 
                                variant="outline-secondary" 
                                onClick={onToggleTheme} 
                                className="me-2 btn-style-outline theme-toggle d-flex align-items-center"
                                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                {theme === 'dark' ? <IconSun /> : <IconMoon />}
                                <span className="ms-1">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                            </Button>
                            
                            {/* Render Login or (Dashboard + Logout) */}
                            {renderAuthButtons()}

                            {isCustomerLoggedIn && (
                                <Button 
                                    variant="danger" 
                                    onClick={() => setShowCart(true)} 
                                    className="ms-2 cart-button-style"
                                >
                                    <IconBasket className="me-2" />
                                    Cart 
                                    <Badge pill bg="light" text="dark" className="ms-2">
                                        {cartItemCount}
                                    </Badge>
                                </Button>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default Header;
