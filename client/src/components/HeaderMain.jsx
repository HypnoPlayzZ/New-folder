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


// --- Header Component ---

const Header = ({ route, auth, isCustomerLoggedIn, isAdminLoggedIn, handleLogout, setShowCart, cartItems }) => {
    const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const renderAuthButtons = () => {
        if (isCustomerLoggedIn) {
            return (
                <>
                    <Nav.Link href="#/dashboard" className="nav-link-style d-flex align-items-center me-2 text-black">
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
                :root {
                    --brand-red: #dc3545;
                }

                .navbar-brand-style {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--brand-red) !important;
                    transition: transform 0.3s ease;
                }
                .navbar-brand-style:hover {
                    transform: scale(1.05);
                }

                .nav-link-style {
                    font-weight: 500;
                    color: rgba(0, 0, 0, 0.75) !important;
                    transition: color 0.2s ease;
                    position: relative;
                }
                .nav-link-style:hover,
                .nav-link-style.active {
                    color: white !important;
                }

                .btn-style-fill, .btn-style-outline, .cart-button-style {
                    border-radius: 50px;
                    font-weight: 600;
                    padding: 0.5rem 1.25rem;
                    transition: all 0.3s ease;
                    border-width: 2px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-style-fill {
                    background-color: var(--brand-red);
                    border-color: var(--brand-red);
                }
                .btn-style-fill:hover {
                    background-color: #bb2d3b;
                    border-color: #b02a37;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(220, 53, 69, 0.4);
                }

                .btn-style-outline {
                    color: white;
                    border-color: rgba(10, 10, 10, 0.5);
                }
                .btn-style-outline:hover {
                    color: black;
                    background-color: white;
                    border-color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
                }

                .cart-button-style {
                    background-color: var(--brand-red);
                    border-color: var(--brand-red);
                }
                .cart-button-style .badge {
                    background-color: white !important;
                    color: var(--brand-red) !important;
                    transition: transform 0.2s ease;
                }
                .cart-button-style:hover {
                    background-color: #bb2d3b;
                    border-color: #b02a37;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(220, 53, 69, 0.4);
                }
                .cart-button-style:hover .badge {
                    transform: scale(1.15);
                }
                `}
            </style>
            <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
                <Container fluid className="px-md-4">
                    <Navbar.Brand href={isCustomerLoggedIn ? "#/menu" : "#/"} className="navbar-brand-style d-flex align-items-center">
                        <IconFire className="me-2" />
                        Steamy Bites
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            {isCustomerLoggedIn && <Nav.Link href="#/menu" className="nav-link-style">Menu</Nav.Link>}
                            <Nav.Link href="#/about" className="nav-link-style">About</Nav.Link>
                            <Nav.Link href="#/contact" className="nav-link-style">Contact</Nav.Link>
                            
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
