import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const RESTAURANT_LOCATION = { lat: 28.64631707513742, lon: 77.27905573083078 };

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const LocationPickerModal = ({ show, handleClose, onLocationSelect }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if(show) {
            // Set initial position to restaurant when modal opens
            setPosition({ lat: RESTAURANT_LOCATION.lat, lng: RESTAURANT_LOCATION.lon });
        }
    }, [show]);

    const handleConfirm = () => {
        if (position) {
            onLocationSelect(`${position.lat}, ${position.lng}`);
        }
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Select Your Delivery Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted">Click on the map to place a pin at your delivery address.</p>
                <MapContainer center={[RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lon]} zoom={15} scrollWheelZoom={true} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirm} disabled={!position}>Confirm Location</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LocationPickerModal;
