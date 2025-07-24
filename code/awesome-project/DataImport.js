//Connect front end to back end w a query form
import {useState} from 'react';


// Need to be able to specify what they are trying to query (buttons/checkbox)
// from there should go through specific route in python to find answer 
// then pull answer from back end and display on front end

export default function DataImport() {
    const [queryResults, setQueryResults] = useState([]);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('idle');


    const [searchLandslideID, setSearchLandslideID] = useState('');
    const [landslideType, setLandslideType] = useState('');
    const [landslideSource, setLandslideSource] = useState('');

// catches errors in front end
const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior (page reload)
        setStatus('submitting');
        setError(null); // Clear previous errors

        try {
            // Construct query parameters dynamically
            const params = new URLSearchParams();
            if (searchLandslideID) {
                params.append('search_landslideid', searchLandslideID);
            }
            if (landslideType) {
                params.append('landslide_type', landslideType);
            }
            if (landslideSource) {
                params.append('landslide_source', landslideSource);
            }
            // Add other parameters:
            // if (minLatitude) params.append('min_latitude', minLatitude);
            // if (maxLatitude) params.append('max_latitude', maxLatitude);
            // if (coordinates) params.append('coordinates', coordinates);

            const queryString = params.toString();
            const url = `http://127.0.0.1:8000/query-data-imports/?${queryString}`;

            const response = await fetch(url);

            if (response.ok) { // Check if response status is 2xx
                const data = await response.json();
                setQueryResults(data);
                setStatus('success');
            } else if (response.status === 404) {
                setQueryResults([]); // No results found
                setError(new Error('No records found matching your criteria.'));
                setStatus('error');
            } else {
                const errorData = await response.json(); // Attempt to parse error message from backend
                setError(new Error(errorData.detail || `Server error: ${response.status}`));
                setStatus('error');
            }
        } catch (err) {
            setError(new Error('Failed to connect to the backend API. Please check your network or server.'));
            setStatus('error');
        };

    return (
        <div className="query-form-container">
            <h2>Query Data Imports</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="landslideId">Landslide ID:</label>
                    <input
                        id="landslideId"
                        type="text" // Keep as text as your DB column is string
                        value={searchLandslideID}
                        onChange={(e) => setSearchLandslideID(e.target.value)}
                        placeholder="e.g., 70"
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
                        placeholder="e.g., Debris, Rock, Flow"
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
                        placeholder="e.g., Natural, USGS"
                        disabled={status === 'submitting'}
                    />
                </div>

                {/* Add more form fields for other query parameters here */}
                {/* Example for min/max latitude: */}
                {/*
                <div className="form-group">
                    <label htmlFor="minLat">Min Latitude:</label>
                    <input id="minLat" type="number" value={minLatitude} onChange={(e) => setMinLatitude(e.target.value)} disabled={status === 'submitting'} />
                </div>
                <div className="form-group">
                    <label htmlFor="maxLat">Max Latitude:</label>
                    <input id="maxLat" type="number" value={maxLatitude} onChange={(e) => setMaxLatitude(e.target.value)} disabled={status === 'submitting'} />
                </div>
                */}

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
                                <p><strong>Lat/Lon:</strong> {record.latitude}, {record.longitude}</p>
                                <p><strong>Type:</strong> {record.lsType}</p>
                                <p><strong>Source:</strong> {record.lsSource}</p>
                                <p><strong>Impact:</strong> {record.impact}</p>
                                <p><strong>wea13id:</strong> {record.wea13id || 'N/A'}</p>
                                <p><strong>wea13type:</strong> {record.wea13type || 'N/A'}</p>
                                <p><strong>Geometry:</strong> {record.geometry}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
}

// where the sumbit should be processed
// where answer should first be processed?
function submitForm(answer) {
    //if statements for which type is specifies, then calls query_data_imports from 
    //main.py
    //query_data_imports(answer)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldError){
                reject(new Error(''));
            } else {
                resolve();
            }
        }, 1500);
    });
}

// this just takes the input and makes it the "answer"
function handleInput(e) {
    setQuestion(e.target.value)
}

