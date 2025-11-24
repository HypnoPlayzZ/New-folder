import React from 'react';
import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const WelcomePage = () => {
    // Motion variants
    const headingVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i = 1) => ({ opacity: 1, y: 0, transition: { delay: 0.3 * i, duration: 0.6 } })
    };
    const blobFloat = {
        animate: {
            y: [0, -12, 0],
            x: [0, 8, 0],
            transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
    };

    return (
        <div className="hero hero--clean">
            {/* decorative blobs with subtle floating motion */}
            <motion.div className="blob blob-1" aria-hidden
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                variants={blobFloat}
                whileHover={{ scale: 1.05 }}
            />
            <motion.div className="blob blob-2" aria-hidden
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                variants={blobFloat}
            />

            <div className="hero-inner hero-inner--center">
                <motion.div className="hero-left hero-left--center"
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    variants={headingVariants}
                >
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="brand-logo mb-3">
                            <img src="/Logo.png" alt="logo" style={{ width: 44, height: 44 }} />
                        </div>
                    </div>

                    <motion.h1 className="mb-2"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Welcome to Steamy Bites
                    </motion.h1>

                    <motion.p className="lead"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        Delicious meals delivered hot — order in a few taps.
                    </motion.p>

                    <motion.div className="d-flex justify-content-center gap-3 mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <motion.a href="#/login" whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                            <Button className="btn-cta">Login</Button>
                        </motion.a>
                        <motion.button
                            className="btn-outline-small"
                            onClick={() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >About</motion.button>
                        <motion.button
                            className="btn-outline-small"
                            onClick={() => window.location.href = '#/contact'}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >Contact Us</motion.button>
                    </motion.div>

                    <motion.div className="cta-wrap mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                        <motion.button className="btn-order-now"
                            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(255,120,40,0.18)' }}
                            whileTap={{ scale: 0.98 }}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        >Order Now</motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default WelcomePage;
