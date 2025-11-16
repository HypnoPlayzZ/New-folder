import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Container, Row, Col, Form } from 'react-bootstrap';
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
        const GOOGLE_CLIENT_ID = "414726937830-u8n7mhl0ujipnd6lr9ikku005nu72ec6.apps.googleusercontent.com";
        const buttonDiv = document.getElementById("google-signin-button");

        const initGoogleButton = () => {
            if (window.google?.accounts?.id && buttonDiv) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleSignIn
                });
                window.google.accounts.id.renderButton(
                    buttonDiv,
                    { theme: "outline", size: "large" }
                );
            }
        };

        if (window.google?.accounts?.id) {
            initGoogleButton();
        } else {
            const interval = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(interval);
                    initGoogleButton();
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [handleGoogleSignIn]);

    return (
        <div className="hero">
            <div className="blob blob-1" aria-hidden></div>
            <div className="hero-inner">
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Card className="login-card" style={{ width: '100%', maxWidth: 480 }}>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <div className="brand-logo me-3"><img src="/Logo.png" alt="logo" style={{ width:38 }} /></div>
                                <div>
                                    <h5 className="mb-0">Customer Login</h5>
                                    <small className="text-muted">Sign in to continue</small>
                                </div>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <div className="mb-3">
                                <div id="google-signin-button" className="d-flex justify-content-center"></div>
                            </div>

                            <div className="text-center text-muted">— or —</div>

                            <Form className="mt-3">
                                <Form.Group className="mb-2"><Form.Label>Email</Form.Label><Form.Control type="email" placeholder="you@example.com" /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" placeholder="Password" /></Form.Group>
                                <div className="d-grid">
                                    <button type="button" className="btn btn-cta">Sign in</button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;