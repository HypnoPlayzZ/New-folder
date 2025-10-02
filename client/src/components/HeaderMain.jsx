import React from 'react';
import { Navbar, Nav, Button, Badge } from 'react-bootstrap';

const Header = ({ route, auth, isCustomerLoggedIn, isAdminLoggedIn, handleLogout, setShowCart, cartItems }) => {
    const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const renderCustomerNav = () => {
        if (isCustomerLoggedIn) {
            return (
                <>
                    <Nav.Link href="#/dashboard" className="interactive-nav-link">My Dashboard</Nav.Link>
                    <Nav.Link onClick={() => handleLogout('customer')} className="interactive-nav-link">Logout ({auth.customer.name})</Nav.Link>
                </>
            );
        }
        return (
            <>
                <Nav.Link href="#/login" className="interactive-nav-link">Login</Nav.Link>
                <Button href="#/register" variant="outline-danger" className="interactive-button register-button ms-2">Register</Button>
            </>
        );
    };
    
    if (route.startsWith('#/admin')) {
        return null; 
    }

    return (
        <>
            <style type="text/css">
                {`
                .navbar-brand.brand-animated {
                    transition: transform 0.3s ease-in-out;
                }
                .navbar-brand.brand-animated:hover {
                    transform: scale(1.05);
                }
                .interactive-nav-link {
                    position: relative;
                    transition: color 0.3s ease;
                }
                .interactive-nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: -4px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--bs-danger);
                    transition: width 0.3s ease-in-out;
                }
                .interactive-nav-link:hover::after {
                    width: 100%;
                }
                .interactive-button {
                    transition: all 0.2s ease-in-out;
                    border-radius: 20px;
                    padding: 8px 20px;
                    font-weight: 500;
                    border-width: 2px;
                }
                .interactive-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .interactive-button:active {
                    transform: translateY(0px);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }
                .cart-button {
                    position: relative;
                    overflow: hidden;
                }
                .cart-button .badge {
                    transition: transform 0.2s ease-in-out, background-color 0.2s ease;
                }
                .cart-button:hover .badge {
                    transform: scale(1.15);
                    background-color: white !important;
                    color: var(--bs-danger) !important;
                }
                `}
            </style>
            <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm px-3">
                <Navbar.Brand href={isCustomerLoggedIn ? "#/menu" : "#/"} className="fw-bold text-danger brand-animated">Steamy Bites</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        {isCustomerLoggedIn && <Nav.Link href="#/menu" className="interactive-nav-link">Menu</Nav.Link>}
                        <Nav.Link href="#/about" className="interactive-nav-link">About</Nav.Link>
                        <Nav.Link href="#/contact" className="interactive-nav-link">Contact</Nav.Link>
                        {renderCustomerNav()}
                        {isCustomerLoggedIn && (
                             <Button variant="danger" onClick={() => setShowCart(true)} className="ms-3 interactive-button cart-button">
                                Cart <Badge bg="light" text="dark" pill>{cartItemCount}</Badge>
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    );
};

export default Header;