import React from 'react';
import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const WelcomePage = () => {
    return (
        <div className="hero">
            <motion.div 
                className="blob blob-1" 
                aria-hidden
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
            <motion.div 
                className="blob blob-2" 
                aria-hidden
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
            ></motion.div>
            <div className="hero-inner">
                <motion.div 
                    className="hero-left"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="brand-logo mb-3">
                            <img src="/Logo.png" alt="logo" style={{ width: 44, height: 44 }} />
                        </div>
                    </div>

                    <h1 className="mb-2">Welcome to Steamy Bites</h1>
                    <p className="lead">Delicious meals delivered hot — explore our menu and order in a few taps.</p>

                    <div className="d-flex justify-content-center gap-3 mt-3">
                        <Button href="#/login" className="btn-cta">Login</Button>
                        <Button href="#/about" variant="outline-primary">About</Button>
                        <Button href="#/contact" variant="outline-primary">Contact Us</Button>
                    </div>
                </motion.div>

                <motion.div 
                    className="hero-right" 
                    aria-hidden
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    <img src="/assets/hero-illustration.svg" alt="Hero illustration" className="hero-illustration" />
                </motion.div>
            </div>

            {/* Feature Cards Section */}
            <div className="feature-cards-container">
                <motion.div 
                    className="feature-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                >
                    <div className="card-icon">
                        <img src="/assets/fast-delivery.svg" alt="Fast Delivery" />
                    </div>
                    <h3>Fast Delivery</h3>
                    <p>Get your favorite meals delivered to your doorstep in minutes.</p>
                </motion.div>
                <motion.div 
                    className="feature-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                >
                    <div className="card-icon">
                        <img src="/assets/fresh-ingredients.svg" alt="Fresh Ingredients" />
                    </div>
                    <h3>Fresh Ingredients</h3>
                    <p>Our chefs use only the freshest ingredients for the best taste.</p>
                </motion.div>
                <motion.div 
                    className="feature-card"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.9 }}
                >
                    <div className="card-icon">
                        <img src="/assets/secure-payments.svg" alt="Secure Payments" />
                    </div>
                    <h3>Secure Payments</h3>
                    <p>Pay with confidence using our secure and encrypted payment gateway.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default WelcomePage;
