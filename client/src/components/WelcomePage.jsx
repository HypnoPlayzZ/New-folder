import React from 'react';
import { Button, Container } from 'react-bootstrap';

const WelcomePage = () => {
    return (
        <Container className="text-center d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <h1 className="display-3 mb-4">Welcome to Steamy Bites</h1>
            <p className="lead mb-4">Please log in or register to view our menu and place an order.</p>
            <div>
                <Button href="#/login" variant="danger" size="lg" className="me-3 px-5">Login</Button>
                <Button href="#/register" variant="outline-danger" size="lg" className="px-5">Register</Button>
            </div>
        </Container>
    );
};

export default WelcomePage;
