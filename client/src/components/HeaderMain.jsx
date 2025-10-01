import React from 'react';
import { Navbar, Nav, Button, Badge } from 'react-bootstrap';

const Header = ({ route, auth, isCustomerLoggedIn, isAdminLoggedIn, handleLogout, setShowCart, cartItems }) => {
    const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const renderCustomerNav = () => {
        if (isCustomerLoggedIn) {
            return (
                <>
                    <Nav.Link href="#/dashboard">My Dashboard</Nav.Link>
                    <Nav.Link onClick={() => handleLogout('customer')}>Logout ({auth.customer.name})</Nav.Link>
                </>
            );
        }
        return (
            <>
                <Nav.Link href="#/login">Login</Nav.Link>
                <Nav.Link href="#/register">Register</Nav.Link>
            </>
        );
    };
    
    if (route.startsWith('#/admin')) {
        return null; 
    }

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
            <Navbar.Brand href={isCustomerLoggedIn ? "#/menu" : "#/"} className="fw-bold text-danger">Steamy Bites</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto align-items-center">
                    {isCustomerLoggedIn && <Nav.Link href="#/menu">Menu</Nav.Link>}
                    <Nav.Link href="#/about">About</Nav.Link>
                    <Nav.Link href="#/contact">Contact</Nav.Link>
                    {renderCustomerNav()}
                    {isCustomerLoggedIn && (
                         <Button variant="danger" onClick={() => setShowCart(true)} className="ms-2">
                            Cart <Badge bg="light" text="dark">{cartItemCount}</Badge>
                        </Button>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
