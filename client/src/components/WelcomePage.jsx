import React from 'react';
import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const WelcomePage = () => {
    const logoEntrance = { initial: { y: -120, opacity: 0, scale: 0.7 }, animate: { y: 0, opacity: 1, scale: 1 }, transition: { duration: 0.8, ease: 'easeOut' } };
    const floatLoop = { y: [0, -10, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #fff7f0 0%, #fff0e6 100%)', padding: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 980, width: '100%' }}>
                <motion.div style={{ display: 'flex', justifyContent: 'center' }} initial={logoEntrance.initial} animate={logoEntrance.animate} transition={logoEntrance.transition}>
                    <motion.img src="/Logo.png" alt="Steamy Bites logo" style={{ width: 'clamp(120px, 28vw, 220px)', height: 'auto', display: 'block' }} animate={floatLoop} />
                </motion.div>

                <motion.h1 style={{ marginTop: '1.2rem', fontSize: 'clamp(28px, 6vw, 64px)', lineHeight: 1.03, fontWeight: 700, color: '#333' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }}>
                    Steamy Bites
                </motion.h1>

                <motion.p style={{ marginTop: '0.6rem', fontSize: 'clamp(14px, 2.2vw, 18px)', color: '#555' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.6 }}>
                    Delicious meals delivered hot — order in a few taps.
                </motion.p>

                <motion.div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}>
                    <motion.a href="#/login" whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                        <Button style={{ padding: '12px 24px', fontSize: 18, borderRadius: 12, background: 'linear-gradient(90deg,#ff8a00,#ff6a00)', border: 'none' }}>Login</Button>
                    </motion.a>
                </motion.div>
            </div>
        </div>
    );
};

export default WelcomePage;
