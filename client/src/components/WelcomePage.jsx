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
                        <div className="brand-logo mb-3 fade-up delay-1">
                            <img src="/Logo.png" alt="logo" style={{ width: 44, height: 44 }} />
                        </div>
                    </div>

                    <h1 className="mb-2 fade-up delay-2">Welcome to Steamy Bites</h1>
                    <p className="lead fade-up delay-3">Delicious meals delivered hot — explore our menu and order in a few taps.</p>

                    <div className="d-flex justify-content-center gap-3 mt-3 fade-up delay-3">
                        <Button href="#/login" className="btn-cta">Login</Button>
                    </div>
                </div>

                <div className="hero-right fade-up delay-2" aria-hidden>
                    <img src="/assets/hero-illustration.svg" alt="Hero illustration" className="hero-illustration" />
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="feature-cards-container">
                <div className="feature-card fade-up delay-4">
                    <div className="card-icon">
                        <img src="/assets/fast-delivery.svg" alt="Fast Delivery" />
                    </div>
                    <h3>Fast Delivery</h3>
                    <p>Get your favorite meals delivered to your doorstep in minutes.</p>
                </div>
                <div className="feature-card fade-up delay-5">
                    <div className="card-icon">
                        <img src="/assets/fresh-ingredients.svg" alt="Fresh Ingredients" />
                    </div>
                    <h3>Fresh Ingredients</h3>
                    <p>Our chefs use only the freshest ingredients for the best taste.</p>
                </div>
                <div className="feature-card fade-up delay-6">
                    <div className="card-icon">
                        <img src="/assets/secure-payments.svg" alt="Secure Payments" />
                    </div>
                    <h3>Secure Payments</h3>
                    <p>Pay with confidence using our secure and encrypted payment gateway.</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
