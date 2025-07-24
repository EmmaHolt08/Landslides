import React, { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import AuthPage, { AuthContext } from './AuthPage.js';

// for marker
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const landslideTypes = ['Debris', 'Flow', 'Rock', 'Lateral', 'Coherent'];
const landslideSources = ['Natural', 'Modified'];
const impactOptions = ['None', 'Road', 'Econ', 'Structure'];
const wea13Types = ['Coherent', 'Lateral Spread', 'Disrupted', 'None']; 


export default function ReportForm() {

    const [landslideID, setLandslideID] = useState(''); 
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [lsType, setLsType] = useState('');
    const [lsSource, setLsSource] = useState('');
    const [impact, setImpact] = useState('');
    const [wea13id, setWea13id] = useState(''); 
    const [wea13type, setWea13type] = useState('');

    const [status, setStatus] = useState('idle'); 
    const [error, setError] = useState(null);
    const [formMessage, setFormMessage] = useState('');

    const [markerPosition, setMarkerPosition] = useState(null);

    const {user_id} = useContext(AuthContext);

    const mapRef = useRef(null);

    const [currentUserId, setCurrentUserid] = useState('');

    // gets max lsID from database and addds one to the assigned for new data
    useEffect(() => {
        const fetchMaxIDs = async () => {
            setStatus('generating_ids');
            setError(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/get-max-ids/');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                const currentMaxLandslideID = data.max_landslide_id !== null ? parseInt(data.max_landslide_id) : 100089;
                const nextLandslideID = currentMaxLandslideID + 1;

                setLandslideID(String(nextLandslideID));
                setStatus('idle');
                console.log("IDs generated successfully.");
            } catch (err) {
                console.error("Failed to fetch max IDs:", err);
                setError(new Error('Failed to generate IDs. Please check backend.'));
                setStatus('error');
            }
        };

        const fetchUserId = async () => {
            setStatus('getting userID');
            setError(null);
            try{
                const response = await fetch('http://127.0.0.1:8000/user/me/');
                if (!response.ok) {
                    throw new Error('HTTP error (userid version)');
                }
                const data = await response.json();

                setCurrentUserid(String(user_id))
                setStatus ('idle');
                console.log("UserID from db works")

            }

            catch (err) {
                console.error("failed to get user id :(", err);
                setError(new Error('Failed to get user id'))
                setStatus('error')
            }
        }
        fetchMaxIDs();
    }, []); 

    // set lat & long from click on map
    function MapClickHandler() {
        useMapEvents({
            click: (e) => {
                setLatitude(e.latlng.lat.toFixed(4)); 
                setLongitude(e.latlng.lng.toFixed(4));
                setMarkerPosition(e.latlng);
            },
        });
        return null; 
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setError(null);
        setFormMessage('');

        if (!latitude || !longitude || !lsType || !lsSource || !impact || !wea13type) {
            setError(new Error('Please fill in all required fields (including map click).'));
            setStatus('idle');
            return;
        }

        try {

            // sets everything in database
            const response = await fetch('http://127.0.0.1:8000/data-imports/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    landslideID: landslideID,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    lsType: lsType,
                    lsSource: lsSource,
                    impact: impact,
                    wea13id: wea13id === 'None' ? null : wea13type, 
                    wea13type: wea13type === 'None' ? null : wea13type,
                    user_id: user_id,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setFormMessage(`Record added successfully! ID: ${result.landslideID}`);
                setStatus('success');

                setLatitude('');
                setLongitude('');
                setLsType('');
                setLsSource('');
                setImpact('');
                setWea13type('');
                setMarkerPosition(null);
                //setUserID('');
            } else {
                const errorData = await response.json();
                setError(new Error(errorData.detail || `Server error: ${response.status}`));
                setStatus('error');
            }
        } catch (err) {
            console.error("Network or submission error:", err);
            setError(new Error('Failed to submit data. Please check network or server.'));
            setStatus('error');
        }
    }; 

    return (
        <div className="add-data-form-container">
            <h2>Add New Landslide Data</h2>
            {status === 'generating_ids' && <p className="loading-message">Generating IDs...</p>}
            {error && <p className="error-message">Error: {error.message}</p>}
            {formMessage && <p className="success-message">{formMessage}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="landslideId">Landslide ID:</label>
                    <input
                        id="landslideId"
                        type="text"
                        value={landslideID}
                        readOnly 
                        disabled={status === 'submitting' || status === 'generating_ids'}
                    />
                </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="user_id">User ID:</label>
                    <input
                        id="user_id"
                        type="text"
                        value={user_id}
                        readOnly
                        isabled={status === 'submitting' || status === 'generating_ids'}
                    />
                </div>
            </form>
             {/* got rid of the wea13 id because in the database they stopped generating after a certain point*/}
                <div className="form-group">
                    <label htmlFor="latitude">Latitude (Click Map):</label>
                    <input
                        id="latitude"
                        type="text"
                        value={latitude}
                        readOnly 
                        disabled={status === 'submitting'}
                        placeholder="Click on map to set"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="longitude">Longitude (Click Map):</label>
                    <input
                        id="longitude"
                        type="text"
                        value={longitude}
                        readOnly 
                        disabled={status === 'submitting'}
                        placeholder="Click on map to set"
                    />
                </div>

                <div className="map-input-section">
                    <MapContainer
                        center={[38.6263, -97.1751]} 
                        zoom={2}
                        scrollWheelZoom={true}
                        style={{ height: '300px', width: '100%', borderRadius: '8px', marginBottom: '15px' }}
                        whenCreated={mapInstance => { mapRef.current = mapInstance; }} 
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler />
                        {markerPosition && (
                            <Marker position={markerPosition}>
                                <Popup>
                                    Lat: {markerPosition.lat.toFixed(4)} <br />
                                    Lon: {markerPosition.lng.toFixed(4)}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                <div className="form-group">
                    <label htmlFor="lsType">Landslide Type:</label>
                    <select
                        id="lsType"
                        value={lsType}
                        onChange={(e) => setLsType(e.target.value)}
                        required
                        disabled={status === 'submitting'}
                    >
                        <option value="">Select Type</option>
                        {landslideTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="lsSource">Landslide Source:</label>
                    <select
                        id="lsSource"
                        value={lsSource}
                        onChange={(e) => setLsSource(e.target.value)}
                        required
                        disabled={status === 'submitting'}
                    >
                        <option value="">Select Source</option>
                        {landslideSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="impact">Impact:</label>
                    <select
                        id="impact"
                        value={impact}
                        onChange={(e) => setImpact(e.target.value)}
                        required
                        disabled={status === 'submitting'}
                    >
                        <option value="">Select Impact</option>
                        {impactOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="wea13type">wea13 Type:</label>
                    <select
                        id="wea13type"
                        value={wea13type}
                        onChange={(e) => setWea13type(e.target.value)}
                        required
                        disabled={status === 'submitting'}
                    >
                        <option value="">Select wea13 Type</option>
                        {wea13Types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" disabled={status === 'submitting' || status === 'generating_ids'}>
                    {status === 'submitting' ? 'Adding Data...' : status === 'generating_ids' ? 'Loading IDs...' : 'Add Record'}
                </button>
            </form>
        </div>
    );
}
