import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { api } from '../api';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, userName, userRole } = response.data;
            onLoginSuccess(token, userName, userRole);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };
    
    const handleGoogleSignIn = async (googleResponse) => {
        try {
            const response = await api.post('/auth/google', { token: googleResponse.credential });
            const { token, userName, userRole } = response.data;
            onLoginSuccess(token, userName, userRole);
        } catch (err) {
            setError('Google Sign-In failed. Please try again.');
        }
    };
    
    useEffect(() => {
        // IMPORTANT: Replace with your Google Client ID
        const GOOGLE_CLIENT_ID = "414726937830-u8n7mhl0ujipnd6lr9ikku005nu72ec6.apps.googleusercontent.com";

        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn
            });
            window.google.accounts.id.renderButton(
                document.getElementById("google-signin-button"),
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    }, []);

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-5">
                            <h3 className="text-center mb-4">Customer Login</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </Form.Group>
                                <Button variant="danger" type="submit" className="w-100">Login</Button>
                            </Form>
                            
                            <div className="divider my-4"><span>OR</span></div>
                            
                            <div id="google-signin-button"></div>
                            
                            <div className="text-center mt-3">
                                <a href="#/register">Don't have an account? Register here.</a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;
