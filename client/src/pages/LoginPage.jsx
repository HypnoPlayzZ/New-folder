import React, { useState, useEffect, useCallback } from 'react';
import { Card, Alert, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
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
            maxWidth: 720,
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        },
        cardWrapper: {
            width: '100%',
            maxWidth: 460
        },
        cardBody: {
            background: 'rgba(255,255,255,0.95)'
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
                {/* Floating logo above centered auth card */}
                <motion.img src="/Logo.png" alt="Steamy Bites logo" style={{ width: 110, height: 'auto', marginBottom: 18 }} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} />

                <div style={styles.cardWrapper}>
                    <Card style={{ borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                        <Card.Body style={styles.cardBody}>
                            <div className="d-flex align-items-center mb-3 justify-content-center">
                                <div>
                                    <h5 className="mb-0 text-center">Customer Login</h5>
                                    <small className="text-muted d-block text-center">Sign in with Google</small>
                                </div>
                            </div>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <div className="mb-3 d-flex justify-content-center">
                                <div id="google-signin-button"></div>
                            </div>

                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;