import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, Button, ListGroup, Form, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
// We need api here if we add coupon logic back
// import { api } from '../api'; 

// --- UPDATED: Add props for the new UPI flow ---
const CartModalMain = ({
    show,
    handleClose,
    cartItems = [],
    onRemoveFromCart = undefined,
    onUpdateQuantity = undefined,
    onPlaceOrder = undefined,
    submitOrder = undefined, // App.jsx passes submitOrder
    setCartItems = undefined, // App.jsx passes setCartItems
    orderForPayment = null, // The new order object (if payment is pending)
    onConfirmUpiPayment = async () => {}, // Function to call with UTR
    onCancelUpiPayment = () => {},  // Function to call if user cancels
    orderError = ''           // Error message from App.jsx
}) => {
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef(null);
    const scanIntervalRef = useRef(null);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    // ... (coupon logic remains, though not fully hooked up in this example)
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(null);

    const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
        // Check if price is an object and pick the correct one
        const price = (item.price && typeof item.price === 'object')
                        ? (item.variant === 'half' ? item.price.half : item.price.full)
                        : item.price;
        return acc + (Number(price) || 0) * item.quantity;
    }, 0);
}, [cartItems]);

    const finalPrice = couponDiscount ? totalPrice - couponDiscount.discountAmount : totalPrice;

    const handleApplyCoupon = async () => {
        // Placeholder: Implement coupon logic
        console.log('Applying coupon:', couponCode);
    };

    const handleInternalPlaceOrder = async () => {
        setIsSubmitting(true);

        // If parent passed `submitOrder` (App.jsx) prefer that API: submitOrder(finalTotal, appliedCoupon, address)
        if (typeof submitOrder === 'function') {
            try {
                await submitOrder(finalPrice, couponDiscount ? couponDiscount.coupon : null, address, customerName, paymentMethod);
            } catch (err) {
                console.error('Error placing order via submitOrder:', err);
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Otherwise construct the orderDetails object and call onPlaceOrder if provided
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
            } : undefined
        };

        if (typeof onPlaceOrder === 'function') {
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

    // Reset local state when modal is closed or payment is done
    const internalHandleClose = () => {
        if (orderForPayment) {
            if (typeof onCancelUpiPayment === 'function') onCancelUpiPayment(); // Tell App.jsx to reset the order state
        }
        setCustomerName('');
        setAddress('');
        setPaymentMethod('COD');
        setUtr('');
        setCouponCode('');
        setCouponDiscount(null);
        setIsSubmitting(false);
        handleClose(); // This is the original handleClose from App.jsx
    };

    // --- Render logic for 2-step checkout ---
    const renderCartContents = () => (
        <>
            <ListGroup variant="flush">
                {(cartItems || []).map(item => (
                    <ListGroup.Item key={`${item._id}-${item.variant}`} className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong className="d-block">{item.name} ({item.variant})</strong>
                            <small className="text-muted">
    ₹{
        ((item.price && typeof item.price === 'object')
            ? (item.variant === 'half' ? item.price.half : item.price.full)
            : item.price)
        ?.toFixed(2) || '0.00'
    }
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
                            }}>
                                &times;
                            </Button>
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
                    <Form.Control as="textarea" rows={3} placeholder="Enter your full address" value={address} onChange={e => setAddress(e.target.value)} required />
                </Form.Group>

                {/* --- PAYMENT METHOD SELECTION --- */}
                <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Check
                        type="radio"
                        label="Cash on Delivery (COD)"
                        name="paymentMethod"
                        id="cod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        label="UPI (Pay Now)"
                        name="paymentMethod"
                        id="upi"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                </Form.Group>
            </Form>

            {/* ... (Coupon Input Group) ... */}
            
            <h4 className="text-end mt-3">Total: ₹{finalPrice.toFixed(2)}</h4>
        </>
    );

    const renderPaymentStep = () => (
        <div className="text-center">
            <h4>Complete Your Payment</h4>
            <p className="lead">Your order (ID: {orderForPayment._id}) is pending.</p>
            <Alert variant="info">
                <p className="mb-0">Please pay <strong>₹{orderForPayment.finalPrice.toFixed(2)}</strong> to the following UPI ID:</p>
                <h5 className="my-2" style={{ userSelect: 'all' }}>steamybites@upi</h5>
                <p className="mt-2 mb-0">After paying, enter the 12-digit UTR (Transaction ID) below and click confirm.</p>
            </Alert>
            <div className="mb-2">
                <strong>Time left to pay:</strong> <span style={{ fontSize: '1.2rem' }}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</span>
            </div>

            {/* Video preview for scanner (if supported) */}
            <div className="mb-3">
                <video ref={videoRef} style={{ width: '220px', height: '220px', border: '1px solid #ddd', borderRadius: 8 }} autoPlay muted playsInline />
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

    // Scanner & timer effects when orderForPayment present
    useEffect(() => {
        let detector = null;

        const startCameraAndScan = async () => {
            if (!orderForPayment || orderForPayment.paymentMethod !== 'UPI') return;
            setTimeLeft(120);
            // start timer
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

            // BarcodeDetector API
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
                                // Try to extract UTR-like numeric string
                                const match = code.match(/\d{10,}/);
                                if (match) {
                                    setUtr(match[0]);
                                    // stop scanning
                                    stopScanning();
                                }
                            }
                        } catch (e) {
                            // ignore detection errors
                        }
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
                    orderForPayment ? renderPaymentStep() : renderCartContents()
                )}
                
                {orderError && <Alert variant="danger" className="mt-3">{orderError}</Alert>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={internalHandleClose}>
                    {orderForPayment ? 'Cancel' : 'Close'}
                </Button>
                
                {cartItems.length > 0 && !orderForPayment && (
                    <Button 
                        variant="danger" 
                        onClick={handleInternalPlaceOrder}
                        disabled={!customerName || !address || isSubmitting}
                    >
                        {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : `Place Order (${paymentMethod})`}
                    </Button>
                )}

                {orderForPayment && (
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
