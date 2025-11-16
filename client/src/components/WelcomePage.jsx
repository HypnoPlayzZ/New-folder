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
                    {/* Decorative SVG illustration - lightweight and always available */}
                    <svg width="420" height="300" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="420" height="300" rx="20" fill="url(#g1)" />
                        <g transform="translate(36,40)">
                            <ellipse cx="150" cy="100" rx="82" ry="54" fill="#fff" opacity="0.6" />
                            <g>
                                <circle cx="100" cy="72" r="36" fill="#ff7a00" />
                                <rect x="156" y="56" width="140" height="52" rx="10" fill="#ffd6b3" />
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
