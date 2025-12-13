import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { api } from '../api';
import formatINR from '../utils/currency';
import MenuItem from '../components/MenuItem';
import { motion } from 'framer-motion';

// --- Coupon Display Component ---
const CouponDisplay = () => {
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        api.get('/coupons').then(res => setCoupons(res.data)).catch(console.error);
    }, []);

    if (coupons.length === 0) return null;

    return (
        <div className="coupon-section mb-5">
            <h3 className="text-center mb-4">Available Offers</h3>
            <div className="coupon-scroll-container">
                {coupons.map(coupon => (
                    <div key={coupon._id} className="coupon-card">
                        <div className="coupon-code">{coupon.code}</div>
                        <div className="coupon-description">{coupon.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Customization Modal Component ---
const CustomizationModal = ({ show, handleClose, item, onAddToCart }) => {
    if (!item) {
        return null;
    }

    const [variant, setVariant] = useState('full');
    const [quantity, setQuantity] = useState(1);
    const [instructions, setInstructions] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (item) {
            const initialVariant = item.price && item.price.half != null ? 'half' : 'full';
            setVariant(initialVariant);
            setQuantity(1);
            setInstructions('');
            if (item.price) {
               setPrice(item.price[initialVariant]);
            }
        }
    }, [item]);

    useEffect(() => {
        if (item && item.price) {
            const newPrice = variant === 'half' ? item.price.half : item.price.full;
            setPrice(newPrice);
        }
    }, [variant, item]);
    
    const handleAddToCartClick = () => {
        onAddToCart(item, variant, quantity, instructions);
        handleClose();
    };

    const handleQuantityChange = (amount) => {
        setQuantity(prev => Math.max(1, prev + amount));
    };

    const hasHalfPrice = item.price && typeof item.price.half === 'number';

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{item.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted">{item.description}</p>
                <Form>
                    {hasHalfPrice && (
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="2">Size</Form.Label>
                            <Col sm="10">
                                <Form.Check
                                    type="radio"
                                    label={`Half (${formatINR(item.price.half)})`}
                                    name="variant"
                                    value="half"
                                    checked={variant === 'half'}
                                    onChange={(e) => setVariant(e.target.value)}
                                />
                                <Form.Check
                                    type="radio"
                                    label={`Full (${formatINR(item.price.full)})`}
                                    name="variant"
                                    value="full"
                                    checked={variant === 'full'}
                                    onChange={(e) => setVariant(e.target.value)}
                                />
                            </Col>
                        </Form.Group>
                    )}
                    
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column sm="2">Quantity</Form.Label>
                        <Col sm="10" className="d-flex align-items-center">
                            <Button variant="outline-secondary" size="sm" onClick={() => handleQuantityChange(-1)}>-</Button>
                            <span className="mx-3">{quantity}</span>
                            <Button variant="outline-secondary" size="sm" onClick={() => handleQuantityChange(1)}>+</Button>
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Special Instructions</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={2} 
                            placeholder="e.g., make it extra spicy"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </Form.Group>
                </Form>
                <div className="d-grid mt-4">
                     <Button variant="danger" onClick={handleAddToCartClick}>
                        Add to Cart - Total: {formatINR(price * quantity)}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

// --- Category Nav ---
const CategoryNav = ({ menu, selectedCategory, onSelect }) => {
    if (!menu?.length) return null;
    return (
        <nav className="category-nav" aria-label="Categories">
            <div className="category-nav-inner">
                {menu.map((c) => (
                    <button
                        key={c.name}
                        className={"category-nav-button" + (selectedCategory === c.name ? ' active' : '')}
                        onClick={() => onSelect(c.name)}
                    >{c.name}</button>
                ))}
            </div>
        </nav>
    );
};

// --- Single Category Section ---
const CategorySection = ({ category, items, onItemClick }) => {
    if (!category) return null;
    const sectionVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 }
    };
    return (
        <motion.section
            id={`category-${category.replace(/\s+/g,'-')}`}
            className="menu-list-container mb-4"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <h2 className="mb-4">{category}</h2>
            {items?.map((item, index) => (
                <motion.div key={item._id} variants={itemVariants} whileHover={{ scale: 1.01 }}>
                    <MenuItem item={item} index={index} onAdd={(it) => onItemClick(it)} />
                </motion.div>
            ))}
            {!items?.length && <div className="text-muted">No items in this category yet.</div>}
        </motion.section>
    );
};


// --- Main Menu Page Component ---
const MenuPage = ({ onAddToCart }) => {
    const [menu, setMenu] = useState([]); // CORRECTED: Expect an array of categories
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        api.get('/menu')
            .then(res => {
                setMenu(res.data);
            })
            .catch(err => {
                console.error("Error fetching menu:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // When menu loads, initialize selectedCategory if not set
    useEffect(() => {
        if (menu && menu.length && !selectedCategory) {
            setSelectedCategory(menu[0].name);
        }
    }, [menu, selectedCategory]);

    const handleShowModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };
    
    const HeroSection = () => (
        <div className="hero-section text-center">
            <h1 className="display-4">Welcome to Steamy Bites</h1>
            <p className="lead">Experience the finest flavors and culinary delights.</p>
        </div>
    );
    
    if (loading) {
        return <div className="text-center"><div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    }

    

    const activeCategoryData = menu.find((c) => c.name === selectedCategory);

    return (
        <div className="fade-in">
            <HeroSection />
            <CouponDisplay />

            {/* Category nav */}
            <CategoryNav menu={menu} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

            {menu.length === 0 && !loading && (
                <div className="text-center">
                    <h2>Our menu is currently empty.</h2>
                    <p>Please check back later!</p>
                </div>
            )}

            <CategorySection
                category={activeCategoryData?.name}
                items={activeCategoryData?.items}
                onItemClick={handleShowModal}
            />

            {selectedItem && (
                <CustomizationModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    item={selectedItem}
                    onAddToCart={onAddToCart}
                />
            )}
        </div>
    );
};

export default MenuPage;


