import React, { useState } from 'react';
import './App.css'; 

export default function QueryForm() {
    // State for input fields
    const [searchLandslideID, setSearchLandslideID] = useState('');
    const [minLat, setMinLat] = useState('');
    const [maxLat, setMaxLat] = useState(''); 
    const [minLon, setMinLon] = useState('');
    const [maxLon, setMaxLon] = useState('');
    const [landslideType, setLandslideType] = useState('');
    const [landslideSource, setLandslideSource] = useState('');
    const [impact, setImpact] = useState('');
    const [wea13id, setWea13id] = useState('');
    const [wea13type, setWea13type] = useState('');
    const [coords, setCoords] = useState('');

    const [queryResults, setQueryResults] = useState([]);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('idle'); 

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setStatus('submitting');
        setError(null); 

        try {
            // Construct query parameters
            const params = new URLSearchParams();
            if (searchLandslideID) {
                params.append('search_landslideid', searchLandslideID);
            }
            if (minLat) {
                params.append('min_latitude', minLat);
            }
            if (maxLat) {
                params.append('max_latitude', maxLat);
            }
            if (minLon){
                params.append('min_longitude', minLon);
            }
            if (maxLon){
                params.append('max_longitude', maxLon);
            }
            if (landslideType) {
                params.append('landslide_type', landslideType); 
            }
            if (landslideSource) {
                params.append('landslide_source', landslideSource); 
            }
            if(impact) {
                params.append('impact', impact)
            }
            if(wea13id) {
                params.append('wea13_id', wea13id)
            }
            if(wea13type){
                params.append('wea13_type', wea13type)
            }
            if(coords){
                params.append('coordinates', coords)
            }

            const queryString = params.toString();
            const url = `http://localhost:8000/query-data-imports/?${queryString}`;

            const response = await fetch(url);

            if (response.ok) { 
                const data = await response.json();
                setQueryResults(data);
                setStatus('success');
            } else if (response.status === 404) {
                setQueryResults([]); // No results found
                setError(new Error('No records found matching your criteria.'));
                setStatus('error');
            } else {
                const errorData = await response.json(); 
                setError(new Error(errorData.detail || `Server error: ${response.status}`));
                setStatus('error');
            }
        } catch (err) {
            console.error("Network or parsing error:", err);
            setError(new Error('Failed to connect to the backend API'));
            setStatus('error');
        }
    };

    return (
        <div className="query-form-container">
            <h2>Query Data Imports</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="landslideId">Landslide ID:</label>
                    <input
                        id="landslideId"
                        type="text"
                        value={searchLandslideID}
                        onChange={(e) => setSearchLandslideID(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="minlat">Minimum Latitude:</label>
                    <input
                        id="minLat"
                        type="text"
                        value={minLat}
                        onChange={(e) => setMinLat(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="maxLat">Maximum Latitude:</label>
                    <input
                        id="maxLat"
                        type="text"
                        value={maxLat}
                        onChange={(e) => setMaxLat(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="minLon">Minimum Longitude:</label>
                    <input
                        id="minLon"
                        type="text"
                        value={minLon}
                        onChange={(e) => setMinLon(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="maxLon">Maximum Longitude:</label>
                    <input
                        id="maxLon"
                        type="text"
                        value={maxLon}
                        onChange={(e) => setMaxLon(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="landslideType">Landslide Type:</label>
                    <input
                        id="landslideType"
                        type="text"
                        value={landslideType}
                        onChange={(e) => setLandslideType(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="landslideSource">Landslide Source:</label>
                    <input
                        id="landslideSource"
                        type="text"
                        value={landslideSource}
                        onChange={(e) => setLandslideSource(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="impact">Impact:</label>
                    <input
                        id="impact"
                        type="text"
                        value={impact}
                        onChange={(e) => setImpact(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="wea13id">wea13 ID:</label>
                    <input
                        id="wea13id"
                        type="text"
                        value={wea13id}
                        onChange={(e) => setWea13id(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="wea13type">wea13 type:</label>
                    <input
                        id="wea13type"
                        type="text"
                        value={wea13type}
                        onChange={(e) => setWea13type(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="coords">Coordinates:</label>
                    <input
                        id="coords"
                        type="text"
                        value={coords}
                        onChange={(e) => setCoords(e.target.value)}
                        disabled={status === 'submitting'}
                    />
                </div>

                <button type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Searching...' : 'Submit Query'}
                </button>

                {error && (
                    <p className="error-message">Error: {error.message}</p>
                )}
            </form>

            <div className="query-results-section">
                <h3>Results:</h3>
                {status === 'submitting' && <p>Loading...</p>}
                {status === 'success' && queryResults.length === 0 && <p>No records found.</p>}
                {status === 'success' && queryResults.length > 0 && (
                    <div className="results-list">
                        {queryResults.map((record, index) => (
                            <div key={index} className="record-item">
                                <p><strong>ID:</strong> {record.landslideID}</p>
                                <p><strong>Latitude:</strong> {record.latitude}</p>
                                <p><strong>Longitude:</strong> {record.longitude}</p>
                                <p><strong>Type:</strong> {record.lsType}</p>
                                <p><strong>Source:</strong> {record.lsSource}</p>
                                <p><strong>Impact:</strong> {record.impact}</p>
                                <p><strong>wea13id:</strong> {record.wea13_id}</p>
                                <p><strong>wea13type:</strong> {record.wea13_type}</p>
                                <p><strong>Coordinates:</strong> {JSON.stringify(record.geometry)}</p>                            </div> 
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
