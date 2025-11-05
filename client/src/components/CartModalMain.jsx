import React, { useState, useMemo } from 'react';
import { Modal, Button, ListGroup, Form, Row, Col, InputGroup, Alert, Spinner } from 'react-bootstrap';
// We need api here if we add coupon logic back
// import { api } from '../api'; 

// --- UPDATED: Add props for the new UPI flow ---
const CartModalMain = ({
    show,
    handleClose,
    cartItems,
    onRemoveFromCart,
    onUpdateQuantity,
    onPlaceOrder,
    orderForPayment, // The new order object (if payment is pending)
    onConfirmUpiPayment, // Function to call with UTR
    onCancelUpiPayment,  // Function to call if user cancels
    orderError           // Error message from App.jsx
}) => {
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            paymentMethod, // Pass the selected payment method
            // Pass coupon details if applied
            appliedCoupon: couponDiscount ? {
                code: couponDiscount.coupon.code,
                discountType: couponDiscount.coupon.discountType,
                discountValue: couponDiscount.coupon.discountValue
            } : undefined
        };
        
        await onPlaceOrder(orderDetails);
        setIsSubmitting(false);
    };

    const handleInternalConfirmPayment = async () => {
        setIsSubmitting(true);
        await onConfirmUpiPayment(utr);
        setIsSubmitting(false);
    };

    // Reset local state when modal is closed or payment is done
    const internalHandleClose = () => {
        if (orderForPayment) {
            onCancelUpiPayment(); // Tell App.jsx to reset the order state
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
                {cartItems.map(item => (
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
                                onChange={(e) => onUpdateQuantity(item._id, item.variant, parseInt(e.target.value))}
                                style={{ width: '60px', marginRight: '10px' }}
                                min="1"
                            />
                            <Button variant="outline-danger" size="sm" onClick={() => onRemoveFromCart(item._id, item.variant)}>
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
        </div>
    );

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
