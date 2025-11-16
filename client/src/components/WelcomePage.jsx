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
                        <div className="brand-logo mb-3"><img src="/Logo.png" alt="logo" style={{ width:44, height:44 }} /></div>
                    </div>
                    <h1 className="mb-2">Welcome to Steamy Bites</h1>
                    <p className="lead">Delicious meals delivered hot — explore our menu and order in a few taps.</p>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                        <Button href="#/login" className="btn-cta">Login</Button>
                        <Button href="#/register" className="btn-ghost">Register</Button>
                    </div>

                    <p style={{ color: '#8b8b8b', marginTop: '2.2rem' }}>Fast delivery • Freshly cooked • Secure payments</p>
                </div>

                <div className="hero-right" aria-hidden>
                    {/* Decorative SVG illustration - lightweight and always available */}
                    <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="320" height="220" rx="18" fill="url(#g1)" />
                        <g transform="translate(24,32)">
                            <ellipse cx="120" cy="80" rx="64" ry="44" fill="#fff" opacity="0.6" />
                            <g>
                                <circle cx="80" cy="56" r="28" fill="#ff7a00" />
                                <rect x="120" y="40" width="110" height="40" rx="8" fill="#ffd6b3" />
                            </g>
                        </g>
                        <defs>
                            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                                <stop offset="0" stopColor="#fff8f0" />
                                <stop offset="1" stopColor="#fff1e6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
