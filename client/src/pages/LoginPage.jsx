import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { api } from '../api';

const LoginPage = ({ onLoginSuccess }) => {
    const [error, setError] = useState('');

    const handleGoogleSignIn = useCallback(async (googleResponse) => {
        try {
            const response = await api.post('/auth/google', { token: googleResponse.credential });
            const { token, userName, userRole } = response.data;
            onLoginSuccess(token, userName, userRole);
        } catch (err) {
            setError('Google Sign-In failed. Please try again.');
        }
    }, [onLoginSuccess]);
    
    useEffect(() => {
        // IMPORTANT: Replace with your Google Client ID
        const GOOGLE_CLIENT_ID = "414726937830-u8n7mhl0ujipnd6lr9ikku005nu72ec6.apps.googleusercontent.com";
        const buttonDiv = document.getElementById("google-signin-button");

        // Function to initialize and render the button
        const initGoogleButton = () => {
            if (window.google?.accounts?.id && buttonDiv) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn
                });
                window.google.accounts.id.renderButton(
                    buttonDiv,
                    { theme: "outline", size: "large", width: "100%" }
                );
            }
        };

        // If window.google is already loaded, render immediately
        if (window.google?.accounts?.id) {
            initGoogleButton();
        } else {
            // Otherwise, set an interval to check every 100ms
            const interval = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(interval);
                    initGoogleButton();
                }
            }, 100);

            // Clean up the interval if the component unmounts
            return () => clearInterval(interval);
        }
    }, [handleGoogleSignIn]);

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-5">
                            <h3 className="text-center mb-4">Customer Login</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            <p className="text-center text-muted">Sign in with your Google account to continue.</p>
                            
                            <div id="google-signin-button" className="mt-3 d-flex justify-content-center"></div>
                            
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;