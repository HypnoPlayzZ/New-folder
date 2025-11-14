import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Row, Col, Nav, Card, Table, Button, Modal, Form,
    Badge, Alert, Spinner, Tab, Tabs, Accordion
} from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { api } from '../api';

// --- Admin Register Page Component (from File 2) ---
const AdminRegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        try {
            await api.post('/admin/register', { name, email, password });
            setSuccess('New admin registered successfully!');
            setName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Admin registration failed.');
        }
    };

    return (
        <div className="row justify-content-center fade-in mt-4">
            <div className="col-md-8">
                <Card className="shadow-sm">
                    <Card.Body className="p-5">
                        <h3 className="text-center mb-4">Register New Admin</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Email address</Form.Label><Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required /></Form.Group>
                            <Button variant="primary" type="submit" className="w-100">Register Admin</Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

// --- MERGED: Order Management Component (from File 1 logic) ---
const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [viewOrder, setViewOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/orders');
            // --- THIS IS THE FIX ---
            // It checks if res.data is an array. If not, it uses an empty array.
            setOrders(Array.isArray(res.data) ? res.data : []);
            // --- END FIX ---

        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.response?.data?.message || 'Could not fetch orders');
            // --- ADD THIS LINE ---
            setOrders([]); // Also set to empty array on failure
            // --- END FIX ---
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Server expects the status update at /api/admin/orders/:id/status
            const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(prevOrders => Array.isArray(prevOrders) ? prevOrders.map(order =>
                order._id === orderId ? res.data : order
            ) : []);
        } catch (err) {
            console.error("Error updating order status:", err);
            setError(err.response?.data?.message || 'Could not update status');
        }
    };

    const handleAcknowledge = async (orderId) => {
        try {
            const res = await api.patch(`/admin/orders/${orderId}/acknowledge`);
            setOrders(prevOrders => Array.isArray(prevOrders) ? prevOrders.map(order =>
                order._id === orderId ? { ...order, isAcknowledged: res.data.isAcknowledged } : order
            ) : []);
        } catch (err) {
            console.error("Error acknowledging order:", err);
            setError(err.response?.data?.message || 'Could not acknowledge order');
        }
    };

    const renderOrderModal = () => {
        if (!viewOrder) return null;

        return (
            <Modal show={!!viewOrder} onHide={() => setViewOrder(null)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Order Details ({viewOrder._id})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Customer:</strong> {viewOrder.customerName}</p>
                    <p><strong>User Email:</strong> {viewOrder.user?.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {viewOrder.address}</p>
                    <p><strong>Status:</strong> <Badge bg={getOrderStatusBadge(viewOrder.status)}>{viewOrder.status}</Badge></p>
                    <hr />
                    {/* --- NEW PAYMENT DETAILS --- */}
                    <h5>Payment Details</h5>
                    <p>
                        <strong>Method:</strong>
                        <Badge bg={viewOrder.paymentMethod === 'UPI' ? 'primary' : 'secondary'} className="ms-2">
                            {viewOrder.paymentMethod}
                        </Badge>
                    </p>
                    <p>
                        <strong>Payment Status:</strong>
                        <Badge bg={viewOrder.paymentStatus === 'Paid' ? 'success' : 'warning'} className="ms-2">
                            {viewOrder.paymentStatus}
                        </Badge>
                    </p>
                    {viewOrder.utr && (
                        <p><strong>Payment UTR:</strong> <code style={{ fontSize: '1.1rem' }}>{viewOrder.utr}</code></p>
                    )}
                    {/* --- END OF NEW PAYMENT DETAILS --- */}
                    <hr />
                    <h5>Items</h5>
                    <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Variant</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                                {(viewOrder.items || []).map(item => (
                                    <tr key={(item.menuItemId?._id || '') + (item.variant || '')}>
                                        <td>{item.menuItemId?.name || 'Item not found'}</td>
                                        <td>{item.variant}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{(item.priceAtOrder ?? 0).toFixed(2)}</td>
                                        <td>₹{((item.priceAtOrder ?? 0) * (item.quantity ?? 0)).toFixed(2)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                    <h5 className="text-end">Subtotal: ₹{viewOrder.totalPrice.toFixed(2)}</h5>
                    {viewOrder.appliedCoupon && (
                        <h5 className="text-end text-success">Discount ({viewOrder.appliedCoupon.code}): -₹{(viewOrder.totalPrice - viewOrder.finalPrice).toFixed(2)}</h5>
                    )}
                    <h4 className="text-end">Total Paid: ₹{viewOrder.finalPrice.toFixed(2)}</h4>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setViewOrder(null)}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    };

    if (isLoading) return <div className="text-center"><Spinner animation="border" text="danger" role="status" /></div>;

    return (
        <Card>
            <Card.Header>
                <Button variant="light" onClick={fetchOrders} disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Refresh Orders'}
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Acknowledged</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(orders || []).map(order => (
                            <tr key={order._id}>
                                <td><small>{order._id}</small></td>
                                <td>{order.customerName}<br /><small>{order.user?.email}</small></td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>₹{(order.finalPrice ?? 0).toFixed(2)}</td>
                                {/* --- MODIFIED: Show payment status and UTR --- */}
                                <td>
                                        <Badge bg={order.paymentMethod === 'UPI' ? 'primary' : 'secondary'}>
                                        {order.paymentMethod}
                                    </Badge>
                                    <br />
                                        <Badge bg={(order.paymentStatus === 'Paid') ? 'success' : 'warning'} pill>
                                            {order.paymentStatus || 'Unknown'}
                                        </Badge>
                                    {order.utr && <><br /><small>UTR: {order.utr}</small></>}
                                </td>
                                <td>
                                    <Form.Select
                                        size="sm"
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        style={{ backgroundColor: getOrderStatusColor(order.status), color: 'white' }}
                                    >
                                        <option value="Pending Payment">Pending Payment</option>
                                        <option value="Received">Received</option>
                                        <option value="Preparing">Preparing</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Rejected">Rejected</option>
                                    </Form.Select>
                                </td>
                                <td>
                                    {order.isAcknowledged ? (
                                        <Badge bg="success">Yes</Badge>
                                    ) : (
                                        <Button size="sm" variant="outline-primary" onClick={() => handleAcknowledge(order._id)}>
                                            Ack
                                        </Button>
                                    )}
                                </td>
                                <td>
                                    <Button size="sm" variant="info" onClick={() => setViewOrder(order)}>
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
            {renderOrderModal()}
        </Card>
    );
};


// --- Menu Management Component (from File 2) ---
const MenuManager = () => {
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', category: '', price: { half: '', full: '' } });
    const [imageFile, setImageFile] = useState(null);
    const [isClient, setIsClient] = useState(false); // For react-beautiful-dnd hydration

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const response = await api.get('/menu');
            const data = response.data;
            // If API returns an array, convert to grouped object by category
            if (Array.isArray(data)) {
                const grouped = data.reduce((acc, item) => {
                    const cat = item.category || 'Uncategorized';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                }, {});
                setMenu(grouped);
            } else {
                setMenu(data || {});
            }
        } catch (error) {
            console.error("Error fetching menu items:", error);
            setMenu({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
        setIsClient(true);
    }, []);

        const handleFormChange = (e) => {
            const { name, value } = e.target;
            if (name === 'half' || name === 'full') {
                setFormData(prev => ({ ...prev, price: { ...prev.price, [name]: value } }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        };

        const handleFileChange = (e) => {
            setImageFile(e.target.files[0]);
        };

        const handleShowModal = (item = null) => {
            setCurrentItem(item);
            setImageFile(null);
            if (item) {
                const price = (typeof item.price === 'object' && item.price !== null)
                    ? item.price
                    : { half: '', full: '' };
                setFormData({
                    name: item.name || '',
                    description: item.description || '',
                    category: item.category || 'Uncategorized',
                    price: { half: price.half?.toString() || '', full: price.full?.toString() || '' }
                });
            } else {
                setFormData({ name: '', description: '', category: '', price: { half: '', full: '' } });
            }
            setShowModal(true);
        };

        const handleCloseModal = () => {
            setShowModal(false);
            setCurrentItem(null);
        };

        const handleSubmit = async (e) => {
            e.preventDefault();

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category || 'Uncategorized');
            data.append('priceHalf', formData.price.half);
            data.append('priceFull', formData.price.full);

            if (imageFile) {
                data.append('image', imageFile);
            } else if (currentItem) {
                data.append('imageUrl', currentItem.imageUrl);
            }

            const apiCall = currentItem
                ? api.patch(`/admin/menu/${currentItem._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
                : api.post('/admin/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });

            try {
                await apiCall;
                fetchMenu();
                handleCloseModal();
            } catch (error) {
                console.error('Error saving menu item:', error);
                alert('Failed to save item.');
            }
        };

        const handleDelete = (id) => {
            if (window.confirm('Are you sure you want to delete this item?')) {
                api.delete(`/admin/menu/${id}`)
                    .then(() => fetchMenu())
                    .catch(error => { console.error('Error deleting menu item:', error); alert('Failed to delete item.'); });
            }
        };

        const onDragEnd = (result) => {
            const { source, destination } = result;
            if (!destination) return;

            const sourceCategory = source.droppableId;
            const destCategory = destination.droppableId;

            if (sourceCategory === destCategory) {
                const items = Array.isArray(menu[sourceCategory]) ? Array.from(menu[sourceCategory]) : [];
                const [reorderedItem] = items.splice(source.index, 1);
                items.splice(destination.index, 0, reorderedItem);

                setMenu(prevMenu => ({ ...prevMenu, [sourceCategory]: items }));

                const orderedIds = Array.isArray(items) ? items.map(item => item._id) : [];
                api.patch('/admin/menu/reorder', { category: sourceCategory, orderedIds })
                    .catch(err => {
                        alert('Failed to save new order. Reverting changes.');
                        fetchMenu();
                    });
            }
        };

        if (loading) return <div className="text-center"><div className="spinner-border text-danger" role="status"></div></div>;

        return (
            <div>
                <Button variant="danger" className="mb-3" onClick={() => handleShowModal()}>Add New Menu Item</Button>

                {isClient && (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Accordion defaultActiveKey="0" alwaysOpen>
                            {Object.entries(menu || {}).map(([category, items], index) => (
                                <Accordion.Item eventKey={index.toString()} key={String(category)}>
                                    <Accordion.Header>{category} ({Array.isArray(items) ? items.length : 0})</Accordion.Header>
                                    <Accordion.Body>
                                        <div className="d-none d-md-flex row fw-bold mb-2 border-bottom pb-2">
                                            <div className="col-1 text-center">Move</div>
                                            <div className="col">Name</div>
                                            <div className="col-2">Half Price</div>
                                            <div className="col-2">Full Price</div>
                                            <div className="col-3">Actions</div>
                                        </div>
                                        <Droppable droppableId={category}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                                    {Array.isArray(items) ? items.map((item, idx) => (
                                                        <Draggable key={String(item?._id ?? `${category}-${idx}`)} draggableId={String(item?._id ?? idx)} index={idx}>
                                                            {(provided) => (
                                                                <div
                                                                    className="row align-items-center py-2 border-bottom"
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <div className="col-1 text-center" style={{ cursor: 'grab' }}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grip-vertical" viewBox="0 0 16 16">
                                                                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="col">{item.name}</div>
                                                                    <div className="col-2">₹{item.price?.half != null ? item.price.half.toFixed(2) : 'N/A'}</div>
                                                                    <div className="col-2">₹{item.price?.full != null ? item.price.full.toFixed(2) : 'N/A'}</div>
                                                                    <div className="col-3">
                                                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(item)}>Edit</Button>
                                                                        <Button variant="outline-secondary" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )) : null}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                    </DragDropContext>
                )}

                <Modal show={showModal} onHide={handleCloseModal}>
                    <Modal.Header closeButton><Modal.Title>{currentItem ? 'Edit' : 'Add'} Menu Item</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Category</Form.Label><Form.Control type="text" name="category" value={formData.category} onChange={handleFormChange} placeholder="e.g., Appetizers, Main Course" required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Half Price (Optional)</Form.Label><Form.Control type="number" step="0.01" name="half" value={formData.price.half} onChange={handleFormChange} /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Full / Item Price</Form.Label><Form.Control type="number" step="0.01" name="full" value={formData.price.full} onChange={handleFormChange} required /></Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Image</Form.Label>
                                {currentItem?.imageUrl && !imageFile && <img src={currentItem.imageUrl} alt="Current" width="100" className="mb-2 d-block" />}
                                <Form.Control type="file" name="image" onChange={handleFileChange} />
                            </Form.Group>
                            <Button variant="danger" type="submit">Save Changes</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        );
    };

    // --- Complaint Management Component (from File 2) ---
    const ComplaintManager = () => {
        const [complaints, setComplaints] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            api.get('/admin/complaints')
                .then(res => setComplaints(res.data))
                .catch(err => console.error("Failed to fetch complaints:", err))
                .finally(() => setLoading(false));
        }, []);

        const handleStatusChange = (id, status) => {
            api.patch(`/admin/complaints/${id}`, { status })
                .then(res => {
                    setComplaints(prev => Array.isArray(prev) ? prev.map(c => c._id === id ? res.data : c) : []);
                })
                .catch(err => alert('Failed to update complaint status.'));
        };

        if (loading) return <div className="text-center"><div className="spinner-border text-danger"></div></div>;

        return (
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead><tr><th>Customer</th><th>Order Date</th><th>Message</th><th>Status</th></tr></thead>
                    <tbody>
                        {(complaints || []).map(c => (
                            <tr key={c._id}>
                                <td>{c.user ? `${c.user.name} (${c.user.email})` : 'User Not Found'}</td>
                                <td>{c.orderId ? new Date(c.orderId.createdAt).toLocaleString() : 'N/A'}</td>
                                <td>{c.message}</td>
                                <td>
                                    <Form.Select size="sm" value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)}>
                                        <option>Pending</option><option>In Progress</option><option>Resolved</option>
                                    </Form.Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    // --- Bulk Upload Component (from File 2) ---
    const BulkUploadManager = () => {
        const [csvFile, setCsvFile] = useState(null);
        const [isUploading, setIsUploading] = useState(false);
        const [uploadResult, setUploadResult] = useState(null);
        const [error, setError] = useState('');

        const handleFileChange = (e) => {
            setCsvFile(e.target.files[0]);
            setUploadResult(null);
            setError('');
        };

        const handleUpload = async () => {
            if (!csvFile) {
                setError('Please select a CSV file to upload.');
                return;
            }

            setIsUploading(true);
            setError('');
            setUploadResult(null);

            const formData = new FormData();
            formData.append('csvFile', csvFile);

            try {
                const response = await api.post('/admin/menu/upload-csv', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setUploadResult(response.data);
            } catch (err) {
                setError('Upload failed. Please check the file format or server logs.');
                console.error(err);
            } finally {
                setIsUploading(false);
            }
        };

        const handleDownloadSample = () => {
            const csvContent = "Item,Category,Item Price,Half,Full\n" +
                "Veg Momos,Appetizers,,130,250\n" +
                "Paneer Chilli Dry,Main Course,,350,500\n" +
                "Veg Burger,Snacks,100,,\n";

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "sample-menu.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        return (
            <Card className="shadow-sm">
                <Card.Body className="p-4">
                    <Card.Title>Upload Menu CSV</Card.Title>
                    <Card.Text>
                        Upload a CSV file with columns: "Item", "Category", "Item Price", "Half", and "Full" to bulk update your menu.
                    </Card.Text>
                    <Form.Group className="mb-3">
                        <Form.Control type="file" accept=".csv" onChange={handleFileChange} />
                    </Form.Group>
                    <div className="d-flex gap-2">
                        <Button onClick={handleUpload} disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                        <Button variant="outline-secondary" onClick={handleDownloadSample}>
                            Download Sample
                        </Button>
                    </div>

                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    {uploadResult && (
                        <Alert variant="success" className="mt-3">
                            <Alert.Heading>Upload Complete!</Alert.Heading>
                            <p>{uploadResult.message}</p>
                            <hr />
                            <p className="mb-0">
                                Items Created: {uploadResult.created} | Items Updated: {uploadResult.updated}
                            </p>
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        );
    };

    // --- Coupon Management Component (from File 2) ---
    const CouponManager = () => {
        const [coupons, setCoupons] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [showModal, setShowModal] = useState(false);
        const [formData, setFormData] = useState({ code: '', description: '', discountType: 'percentage', discountValue: 0 });

        const fetchCoupons = () => {
            api.get('/admin/coupons').then(res => {
                setCoupons(Array.isArray(res.data) ? res.data : []);
                setIsLoading(false);
            });
        };

        useEffect(fetchCoupons, []);

        const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                await api.post('/admin/coupons', { ...formData, code: formData.code.toUpperCase() });
                setShowModal(false);
                fetchCoupons(); // Refresh the list
            } catch (error) {
                alert('Failed to create coupon. Make sure the code is unique.');
            }
        };

        const toggleCouponStatus = async (coupon) => {
            try {
                await api.patch(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive });
                fetchCoupons();
            } catch (error) {
                alert('Failed to update coupon status.');
            }
        };

        if (isLoading) return <div className="text-center"><div className="spinner-border text-danger" role="status"></div></div>;

        return (
            <>
                <Button onClick={() => setShowModal(true)} className="mb-3">Create New Coupon</Button>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                            <tr><th>Code</th><th>Description</th><th>Type</th><th>Value</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {(coupons || []).map(coupon => (
                                <tr key={coupon._id}>
                                    <td>{coupon.code}</td>
                                    <td>{coupon.description}</td>
                                    <td>{coupon.discountType}</td>
                                    <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue.toFixed(2)}`}</td>
                                    <td>
                                        <Badge bg={coupon.isActive ? 'success' : 'secondary'}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button size="sm" variant={coupon.isActive ? 'warning' : 'success'} onClick={() => toggleCouponStatus(coupon)}>
                                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton><Modal.Title>Create Coupon</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3"><Form.Label>Coupon Code</Form.Label><Form.Control type="text" name="code" onChange={handleFormChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control type="text" name="description" onChange={handleFormChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Discount Type</Form.Label><Form.Select name="discountType" onChange={handleFormChange}><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option></Form.Select></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Discount Value</Form.Label><Form.Control type="number" name="discountValue" onChange={handleFormChange} required /></Form.Group>
                            <Button type="submit">Create</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </>
        );
    };

    // --- Main Admin Dashboard Component (from File 2 structure) ---
    const AdminDashboard = ({ adminName, handleLogout }) => (
        <Container fluid className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Admin Dashboard</h1>
                <div>
                    <span className="me-3">Welcome, {adminName}</span>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleLogout('admin')}>Logout</Button>
                </div>
            </div>
            <Tab.Container defaultActiveKey="menu">
                <Nav variant="tabs" className="mb-3 justify-content-center">
                    <Nav.Item><Nav.Link eventKey="menu">Manage Menu</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="orders">Manage Orders</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="complaints">Manage Complaints</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="bulk-upload">Bulk Upload</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="coupons">Manage Coupons</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link href="#/admin-register">Register New Admin</Nav.Link></Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="menu"><MenuManager /></Tab.Pane>
                    <Tab.Pane eventKey="orders"><OrderManager /></Tab.Pane>
                    <Tab.Pane eventKey="complaints"><ComplaintManager /></Tab.Pane>
                    <Tab.Pane eventKey="bulk-upload"><BulkUploadManager /></Tab.Pane>
                    <Tab.Pane eventKey="coupons"><CouponManager /></Tab.Pane>
                    {/* The "Register New Admin" tab just links to the hash route, which App.js will handle */}
                </Tab.Content>
            </Tab.Container>
        </Container>
    );

    // --- Helper Functions (from File 1) ---
    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Rejected': return 'danger';
            case 'Preparing':
            case 'Ready':
            case 'Out for Delivery': return 'primary';
            case 'Received': return 'info';
            case 'Pending Payment': return 'warning';
            default: return 'secondary';
        }
    };

    const getOrderStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#198754'; // success
            case 'Rejected': return '#dc3545'; // danger
            case 'Preparing':
            case 'Ready':
            case 'Out for Delivery': return '#0d6efd'; // primary
            case 'Received': return '#0dcaf0'; // info
            case 'Pending Payment': return '#ffc107'; // warning
            default: return '#6c757d'; // secondary
        }
    };

    export default AdminDashboard;