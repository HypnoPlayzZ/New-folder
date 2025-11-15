import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import the main leaflet library

// --- FIX for missing marker icons ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
// --- END of FIX ---


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

    // Helper component to invalidate Leaflet map size after modal opens
    const InvalidateMapOnShow = ({ when }) => {
        const map = useMap();
        useEffect(() => {
            if (when && map) {
                // Slight delay to allow modal animation/layout to settle
                const t = setTimeout(() => {
                    try { map.invalidateSize(); } catch (e) { /* ignore */ }
                }, 200);
                return () => clearTimeout(t);
            }
        }, [when, map]);
        return null;
    };

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
                    {/* Invalidate size when modal is shown so tiles render correctly */}
                    <InvalidateMapOnShow when={show} />
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

