import React from 'react';
import { Button } from 'react-bootstrap';

const WelcomePage = () => {
    return (
        <div className="hero">
            <div className="blob blob-1" aria-hidden></div>
            <div className="blob blob-2" aria-hidden></div>
            <div className="hero-inner">
                <div className="hero-left">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="brand-logo mb-3 fade-up delay-1"><img src="/Logo.png" alt="logo" style={{ width:44, height:44 }} /></div>
                    </div>

                    <h1 className="mb-2 fade-up delay-2">Welcome to Steamy Bites</h1>
                    <p className="lead fade-up delay-3">Delicious meals delivered hot — explore our menu and order in a few taps.</p>

                    <div className="d-flex justify-content-center gap-3 mt-3 fade-up delay-3">
                        <Button href="#/login" className="btn-cta">Login</Button>
                        <Button href="#/register" className="btn-ghost">Register</Button>
                    </div>

                    <p style={{ color: '#8b8b8b', marginTop: '2.2rem' }} className="fade-up delay-3">Fast delivery • Freshly cooked • Secure payments</p>
                </div>

                <div className="hero-right fade-up delay-2" aria-hidden>
                    {/* Use external richer illustration so it's easy to replace with a PNG/SVG asset in public/assets */}
                    <img src="/assets/hero-illustration.svg" alt="Hero illustration" className="hero-illustration" />
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
