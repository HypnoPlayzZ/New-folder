import React from 'react';
import { Button } from 'react-bootstrap';

const WelcomePage = () => {
    return (
        <div className="hero">
            <div className="blob blob-1" aria-hidden></div>
            <div className="blob blob-2" aria-hidden></div>
            <div className="hero-inner">
                <div className="hero-left">
                    <h1 className="mb-2">Welcome to Steamy Bites</h1>
                    <p className="lead">Delicious meals delivered hot — explore our menu and order in a few taps.</p>
                    <div className="d-flex gap-3 mt-3">
                        <Button href="#/login" className="btn-cta">Login</Button>
                        <Button href="#/register" className="btn-ghost">Register</Button>
                    </div>
                </div>

                <div className="hero-right">
                    <div style={{ textAlign: 'center' }}>
                        <div className="brand-logo mb-3">
                            <img src="/Logo.png" alt="logo" style={{ width:44, height:44 }} />
                        </div>
                        <div style={{ maxWidth: 320, color: '#8b8b8b' }}>
                            <p style={{ marginBottom: 8 }}>Fast delivery • Freshly cooked • Secure payments</p>
                            <img src="/assets/hero-food.png" alt="food" style={{ maxWidth: '100%', opacity: 0.95, borderRadius: 10 }} onError={(e) => e.target.style.display='none'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
