import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Container, Row, Col, Form } from 'react-bootstrap';
import { api } from '../api';

const LoginPage = ({ onLoginSuccess }) => {
    const [error, setError] = useState('');

    const styles = {
        page: {
            minHeight: '100vh',
            background: 'linear-gradient(90deg, #fff7f0 0%, #ffe7d0 50%, #fff1e6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px'
        },
        inner: {
            width: '100%',
            maxWidth: 1200,
            display: 'flex',
            gap: 40,
            alignItems: 'center'
        },
        left: {
            flex: 1,
            color: '#222',
            padding: 24
        },
        title: {
            fontSize: 44,
            fontWeight: 700,
            marginBottom: 10
        },
        subtitle: {
            fontSize: 16,
            color: '#6b6b6b',
            marginBottom: 18
        },
        ctaRow: {
            display: 'flex',
            gap: 12,
            marginTop: 8
        },
        ctaBtn: {
            background: 'linear-gradient(180deg,#ff8c1a,#ff6b00)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(255,107,0,0.18)'
        },
        right: {
            width: 520,
            maxWidth: '45%'
        },
        cardBody: {
            background: 'rgba(255,255,255,0.9)'
        }
    };

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
        <div style={styles.page}>
            <div style={styles.inner}>
                <div style={styles.left}>
                    <img src="/Logo.png" alt="logo" style={{ width: 56, marginBottom: 12 }} />
                    <div style={styles.title}>Welcome to Steamy Bites</div>
                    <div style={styles.subtitle}>Delicious meals delivered hot — explore our menu and order in a few taps.</div>

                    <div style={styles.ctaRow}>
                        <button style={styles.ctaBtn}>Login</button>
                        <button style={{ ...styles.ctaBtn, background: 'white', color: '#ff6b00', border: '1px solid rgba(255,107,0,0.12)' }}>Register</button>
                    </div>
                </div>

                <div style={styles.right}>
                    <Card style={{ borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                        <Card.Body style={styles.cardBody}>
                            <div className="d-flex align-items-center mb-3">
                                <div className="brand-logo me-3"><img src="/Logo.png" alt="logo" style={{ width:38 }} /></div>
                                <div>
                                    <h5 className="mb-0">Customer Login</h5>
                                    <small className="text-muted">Sign in with Google or use email</small>
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