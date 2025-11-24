import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, Button, ListGroup, Form, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode';
import LocationPickerModal from './LocationPickerModal';
import { api } from '../api';
import { auth } from '../firebase.config'; // We use this exported auth instance directly
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const CartModalMain = ({
    show,
    handleClose,
    cartItems = [],
    onRemoveFromCart = undefined,
    onUpdateQuantity = undefined,
    onPlaceOrder = undefined,
    submitOrder = undefined,
    setCartItems = undefined,
    orderForPayment = null,
    onConfirmUpiPayment = async () => {},
    onCancelUpiPayment = () => {},
    orderError = '',
    waitingForAdmin = false,
    adminWaitLeft = 0,
    upiId = '8178767938-3@ybl',
    upiQrUrl = '/upi_qr.png'
}) => {
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [locationCoords, setLocationCoords] = useState('');
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [mobile, setMobile] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);
    const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef(null);
    const scanIntervalRef = useRef(null);
    const timerRef = useRef(null);
    const streamRef = useRef(null);
    const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState('');

    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(null);

    const totalPrice = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const price = (item.price && typeof item.price === 'object')
                ? (item.variant === 'half' ? item.price.half : item.price.full)
                : item.price;
            return acc + (Number(price) || 0) * item.quantity;
        }, 0);
    }, [cartItems]);

    const finalPrice = couponDiscount ? totalPrice - couponDiscount.discountAmount : totalPrice;

    const handleApplyCoupon = async () => {
        console.log('Applying coupon:', couponCode);
    };

    const handleInternalPlaceOrder = async () => {
        setIsSubmitting(true);
        if (typeof submitOrder === 'function') {
            try {
                let firebaseToken = undefined;
                if (firebaseUser) {
                    try { firebaseToken = await firebaseUser.getIdToken(); } catch (e) { console.warn('Could not get firebase token', e); }
                }
                await submitOrder(finalPrice, couponDiscount ? couponDiscount.coupon : null, address, customerName, paymentMethod, mobile, locationCoords, firebaseToken);
            } catch (err) {
                console.error('Error placing order via submitOrder:', err);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        const orderDetails = {
            items: cartItems.map(item => ({
                menuItemId: item._id,
                quantity: item.quantity,
                variant: item.variant,
                priceAtOrder: (item.price && typeof item.price === 'object')
                    ? (item.variant === 'half' ? item.price.half : item.price.full)
                    : item.price,
                instructions: item.instructions || ''
            })),
            totalPrice: totalPrice,
            finalPrice: finalPrice,
            customerName,
            address,
            paymentMethod,
            appliedCoupon: couponDiscount ? {
                code: couponDiscount.coupon.code,
                discountType: couponDiscount.coupon.discountType,
                discountValue: couponDiscount.coupon.discountValue
            } : undefined,
            locationCoords: locationCoords || undefined,
            locationLink: locationCoords ? `https://maps.google.com/?q=${encodeURIComponent(locationCoords)}` : undefined,
            mobile: mobile || undefined
        };

        if (typeof onPlaceOrder === 'function') {
            if (firebaseUser) {
                try { orderDetails.firebaseToken = await firebaseUser.getIdToken(); } catch (e) { console.warn('Could not get firebase token', e); }
            }
            await onPlaceOrder(orderDetails);
        } else {
            console.warn('onPlaceOrder is not a function', onPlaceOrder);
        }
        setIsSubmitting(false);
    };

    const handleInternalConfirmPayment = async () => {
        setIsSubmitting(true);
        if (typeof onConfirmUpiPayment === 'function') {
            await onConfirmUpiPayment(utr);
        } else {
            console.warn('onConfirmUpiPayment is not a function', onConfirmUpiPayment);
        }
        setIsSubmitting(false);
    };

    const internalHandleClose = () => {
        if (orderForPayment) {
            if (typeof onCancelUpiPayment === 'function') onCancelUpiPayment();
        }
        setCustomerName('');
        setAddress('');
        setPaymentMethod('UPI');
        setUtr('');
        setCouponCode('');
        setCouponDiscount(null);
        setIsSubmitting(false);
        setLocationCoords('');
        setMobile('');
        setShowLocationPicker(false);
        handleClose();
    };

    // --- RECAPTCHA & OTP LOGIC (FIXED) ---
    const handleSendOtp = async () => {
        if (!/^[0-9]{10}$/.test(mobile)) { 
            alert('Enter a valid 10-digit mobile number'); 
            return; 
        }
        
        setSendOtpLoading(true);

        try {
            // 1. Initialize Recaptcha
            if (!window.recaptchaVerifier) {
                
                // --- FIX: Clear the container manually to prevent "already rendered" error ---
                const recaptchaContainer = document.getElementById('recaptcha-container');
                if (recaptchaContainer) {
                    recaptchaContainer.innerHTML = ''; 
                }

                // Initialize verify with 'auth' as the first argument
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': (response) => {
                        console.log("Recaptcha verified");
                    },
                    'expired-callback': () => {
                        console.warn("Recaptcha expired");
                    }
                });
            }

            // 2. Send OTP
            const phoneNumber = `+91${mobile}`;
            const appVerifier = window.recaptchaVerifier;
            
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            
            window.confirmationResult = confirmationResult;
            setOtpSent(true);
            setResendTimer(60);
            alert('OTP sent via Firebase.');

        } catch (err) {
            console.error('Firebase Send OTP failed', err);
            
            // If it fails, clear the verifier AND the DOM so the user can try again
            if(window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch(e) {}
                window.recaptchaVerifier = null;
                
                const recaptchaContainer = document.getElementById('recaptcha-container');
                if (recaptchaContainer) recaptchaContainer.innerHTML = '';
            }
            
            alert(err.message || 'Failed to send OTP. Please refresh and try again.');
        } finally {
            setSendOtpLoading(false);
        }
    };

    // --- RENDER HELPERS ---
    const renderCartContents = () => (
        <>
            <ListGroup variant="flush">
                {(cartItems || []).map(item => (
                    <ListGroup.Item key={`${item._id}-${item.variant}`} className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong className="d-block">{item.name} ({item.variant})</strong>
                            <small className="text-muted">
                                ₹{((item.price && typeof item.price === 'object')
                                    ? (item.variant === 'half' ? item.price.half : item.price.full)
                                    : item.price)?.toFixed(2) || '0.00'}
                            </small>
                        </div>
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="number"
                                size="sm"
                                value={item.quantity}
                                onChange={(e) => {
                                    const q = parseInt(e.target.value) || 1;
                                    if (typeof onUpdateQuantity === 'function') {
                                        onUpdateQuantity(item._id, item.variant, q);
                                    } else if (typeof setCartItems === 'function') {
                                        setCartItems(prev => prev.map(ci => ci._id === item._id && ci.variant === item.variant && ci.instructions === item.instructions ? { ...ci, quantity: q } : ci));
                                    }
                                }}
                                style={{ width: '60px', marginRight: '10px' }}
                                min="1"
                            />
                            <Button variant="outline-danger" size="sm" onClick={() => {
                                if (typeof onRemoveFromCart === 'function') {
                                    onRemoveFromCart(item._id, item.variant);
                                } else if (typeof setCartItems === 'function') {
                                    setCartItems(prev => prev.filter(ci => !(ci._id === item._id && ci.variant === item.variant && ci.instructions === item.instructions)));
                                }
                            }}>×</Button>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
            
            <hr />

            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" placeholder="Enter your name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Delivery Address</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Control as="textarea" rows={3} placeholder="Enter your full address" value={address} onChange={e => setAddress(e.target.value)} required />
                            <div className="d-flex flex-column">
                                <Button variant="outline-primary" onClick={() => setShowLocationPicker(true)}>Pick on map</Button>
                                {locationCoords ? <a className="mt-2 text-muted" target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${encodeURIComponent(locationCoords)}`}>Open map</a> : null}
                            </div>
                        </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <div>
                        <Form.Check
                            type="radio"
                            label="UPI (Pay Now)"
                            name="paymentMethod"
                            id="upi"
                            value="UPI"
                            checked={paymentMethod === 'UPI'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={mobile}
                        onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setMobile(v);
                            setOtpVerified(false);
                            setOtpSent(false);
                            setOtpCode('');
                        }}
                        required
                    />
                    <Form.Text className="text-muted">Needed for delivery updates. Enter 10 digits.</Form.Text>
                </Form.Group>

                <div className="mb-3">
                    {!otpVerified ? (
                        <div className="d-flex gap-2 align-items-center">
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={handleSendOtp} 
                                disabled={sendOtpLoading || resendTimer > 0}
                            >
                                {sendOtpLoading ? 'Sending...' : (resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Send OTP')}
                            </Button>

                            {otpSent && (
                                <div className="d-flex gap-2 align-items-center">
                                    <Form.Control type="text" size="sm" placeholder="Enter OTP" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0,6))} style={{ width: 140 }} />
                                    <Button size="sm" variant="success" onClick={async () => {
                                        if (!otpCode || otpCode.length < 4) { alert('Enter the OTP'); return; }
                                        setVerifyOtpLoading(true);
                                        try {
                                            const confirmationResult = window.confirmationResult;
                                            if (!confirmationResult) throw new Error('No confirmation result found. Please request OTP again.');
                                            const result = await confirmationResult.confirm(otpCode);
                                            setOtpVerified(true);
                                            setFirebaseUser(result.user);
                                            setOtpSent(false);
                                            setOtpCode('');
                                            setResendTimer(0);
                                        } catch (err) {
                                            console.error('Firebase Verify OTP failed', err);
                                            alert(err.message || 'OTP verification failed');
                                        } finally {
                                            setVerifyOtpLoading(false);
                                        }
                                    }} disabled={verifyOtpLoading}>
                                        {verifyOtpLoading ? 'Verifying...' : 'Verify OTP'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Alert variant="success">Mobile number verified ✓</Alert>
                    )}
                </div>
            </Form>
            
            <h4 className="text-end mt-3">Total: ₹{finalPrice.toFixed(2)}</h4>
        </>
    );

    const renderPaymentStep = () => (
        <div className="text-center">
            <h4>Complete Your Payment</h4>
            <p className="lead">Your order (ID: {orderForPayment._id}) is pending.</p>
            <Alert variant="info">
                <p className="mb-0">Please pay <strong>₹{orderForPayment.finalPrice.toFixed(2)}</strong> to the following UPI ID:</p>
                <h5 className="my-2" style={{ userSelect: 'all' }}>{upiId}</h5>
                <p className="mt-2 mb-0">After paying, enter the 12-digit UTR (Transaction ID) below and click confirm.</p>
            </Alert>
            <div className="mb-2">
                <strong>Time left to pay:</strong> <span style={{ fontSize: '1.2rem' }}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
            </div>

            <div className="mb-3 d-flex justify-content-center">
                {generatedQrDataUrl ? (
                    <img src={generatedQrDataUrl} alt="UPI QR" style={{ width: 220, height: 220, objectFit: 'contain', border: '1px solid #eee', borderRadius: 8 }} />
                ) : upiQrUrl ? (
                    <img src={upiQrUrl} alt="UPI QR" style={{ width: 220, height: 220, objectFit: 'contain', border: '1px solid #eee', borderRadius: 8 }} />
                ) : (
                    <video ref={videoRef} style={{ width: '220px', height: '220px', border: '1px solid #ddd', borderRadius: 8 }} autoPlay muted playsInline />
                )}
            </div>
            <Form.Group className="my-3">
                <Form.Label><strong>Enter UTR / Transaction ID</strong></Form.Label>
                <Form.Control
                    type="text"
                    placeholder="12-digit UTR Number"
                    value={utr}
                    onChange={e => setUtr(e.target.value)}
                    required
                    minLength={12}
                />
            </Form.Group>
            <div className="mb-2">
                <small className="text-muted">You can scan the transaction QR using your camera if supported, or enter the UTR manually.</small>
            </div>
        </div>
    );

    const renderWaitingForAdmin = () => (
        <div className="text-center">
            <h4>Waiting for Admin Confirmation</h4>
            <p className="lead">We've received your UTR and notified the kitchen. Please wait while an administrator verifies the payment.</p>
            <div className="my-3">
                <Spinner animation="border" role="status" />
            </div>
            <div className="mb-2">
                <strong>Time left for admin to confirm:</strong> <span style={{ fontSize: '1.1rem' }}>{Math.floor(adminWaitLeft/60)}:{String(adminWaitLeft%60).padStart(2,'0')}</span>
            </div>
            {utr && (
                <div className="mt-2">
                    <small className="text-muted">Submitted UTR: <strong style={{ userSelect: 'all' }}>{utr}</strong></small>
                </div>
            )}
            <div className="mt-3">
                <Button variant="outline-secondary" onClick={() => {
                    if (typeof onCancelUpiPayment === 'function') onCancelUpiPayment();
                }}>Cancel</Button>
            </div>
        </div>
    );

    useEffect(() => {
        let detector = null;
        const startCameraAndScan = async () => {
            if (!orderForPayment || orderForPayment.paymentMethod !== 'UPI') return;
            setTimeLeft(120);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
                        stopScanning();
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);

            try {
                if ('BarcodeDetector' in window) {
                    detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                    setIsScanning(true);
                    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
                    scanIntervalRef.current = setInterval(async () => {
                        try {
                            const detections = await detector.detect(videoRef.current);
                            if (detections && detections.length > 0) {
                                const code = detections[0].rawValue;
                                const match = code.match(/\d{10,}/);
                                if (match) {
                                    setUtr(match[0]);
                                    stopScanning();
                                }
                            }
                        } catch (e) {}
                    }, 800);
                }
            } catch (err) {
                console.warn('Scanner init failed', err);
            }
        };

        const stopScanning = () => {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
            const s = streamRef.current || videoRef.current?.srcObject;
            if (s) {
                try { s.getTracks().forEach(t => t.stop()); } catch (e) {}
                if (videoRef.current) videoRef.current.srcObject = null;
                streamRef.current = null;
            }
            setIsScanning(false);
        };

        if (orderForPayment && orderForPayment.paymentMethod === 'UPI') {
            startCameraAndScan();
            return () => { stopScanning(); };
        }
        return () => {};
    }, [orderForPayment]);

    useEffect(() => {
        let mounted = true;
        const generate = async () => {
            try {
                if (!upiId || !orderForPayment) return setGeneratedQrDataUrl('');
                const amount = (orderForPayment.finalPrice || finalPrice || 0).toFixed(2);
                const payeeName = encodeURIComponent('Steamy Bites');
                const uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${payeeName}&am=${amount}&cu=INR`;
                const dataUrl = await QRCode.toDataURL(uri, { margin: 1, scale: 6 });
                if (mounted) setGeneratedQrDataUrl(dataUrl);
            } catch (e) {
                console.warn('QR generation failed', e);
                if (mounted) setGeneratedQrDataUrl('');
            }
        };
        generate();
        return () => { mounted = false; };
    }, [upiId, orderForPayment, finalPrice]);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setInterval(() => {
            setResendTimer(r => {
                if (r <= 1) { clearInterval(t); return 0; }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [resendTimer]);

    const handleLocationSelect = (coordsString) => {
        setLocationCoords(coordsString);
    };

    return (
        <Modal show={show} onHide={internalHandleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    {orderForPayment ? 'Confirm Payment' : 'Your Cart'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cartItems.length === 0 && !orderForPayment ? (
                    <p>Your cart is empty.</p>
                ) : (
                    orderForPayment ? (waitingForAdmin ? renderWaitingForAdmin() : renderPaymentStep()) : renderCartContents()
                )}
                
                {orderError && <Alert variant="danger" className="mt-3">{orderError}</Alert>}
                <LocationPickerModal show={showLocationPicker} handleClose={() => setShowLocationPicker(false)} onLocationSelect={handleLocationSelect} />
            </Modal.Body>
            
            {/* The hidden container for reCAPTCHA - MUST be present */}
            <div id="recaptcha-container"></div>
            
            <Modal.Footer>
                <Button variant="secondary" onClick={internalHandleClose}>
                    {orderForPayment ? 'Cancel' : 'Close'}
                </Button>
                
                {cartItems.length > 0 && !orderForPayment && (
                    <Button 
                        variant="danger" 
                        onClick={handleInternalPlaceOrder}
                        disabled={!customerName || !address || mobile.length !== 10 || !locationCoords || !otpVerified || isSubmitting}
                    >
                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : `Place Order (${paymentMethod})`}
                    </Button>
                )}

                {orderForPayment && !waitingForAdmin && (
                    <Button 
                        variant="success" 
                        onClick={handleInternalConfirmPayment}
                        disabled={!utr || utr.length < 12 || isSubmitting}
                    >
                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : 'Confirm Payment'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default CartModalMain;