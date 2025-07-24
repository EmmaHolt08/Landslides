import React, { useState, useEffect, useMemo} from 'react'
import { MapContainer, TileLayer, useMap, GeoJSON} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const center = [38.6263, -96.1751]
const zoom = 4

//makes the map
function MapContent({ setMapInstance }) {
  const map = useMap(); 
  useEffect(() => {
    setMapInstance(map); 
  }, [map, setMapInstance]);

  return null;
}

export default function MapCoords(){ 
    const [map, setMap] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);

    //gets points from database
    useEffect(() => {
    const fetchPoints = async () => {
      try {
        const apiUrl = 'http://127.0.0.1:8000/query-data-imports/';
        const response = await fetch(apiUrl);

         if (response.status === 404) {
          const errorDetail = await response.json(); // Parse the error detail
          console.warn("No data import records found:", errorDetail.detail);
          setGeoJsonData({ type: 'FeatureCollection', features: [] }); // Set an empty GeoJSON to display an empty map
          return; // Exit the function as there's no data to process
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

         if (!data || data.length === 0) {
            console.log("Received empty data array from backend.");
            setGeoJsonData({ type: 'FeatureCollection', features: [] });
            return;
        }
        
        const processedData = data.map(item => {
          console.log("Before parsing, item.geometry type:", typeof item.geometry, "value:", item.geometry); // DEBUG LOG 1
          let parsedGeometry = item.geometry;
          if (typeof item.geometry === 'string') {
            try {
              parsedGeometry = JSON.parse(item.geometry);
              console.log("After parsing, parsedGeometry type:", typeof parsedGeometry, "value:", parsedGeometry); // DEBUG LOG 2
            } catch (e) {
              console.error("Failed to parse geometry string for map:", e, item.geometry);
              parsedGeometry = null; // Set to null if parsing fails
            }
          }
          return { ...item, geometry: parsedGeometry };
        });

        //for the popup
        const featureCollection = {
          type: 'FeatureCollection',
          features: data.map(item => ({
            type: 'Feature',
            properties: {
              landslideid: item.landslideID,
              latitude: item.latitude,
              longitude: item.longitude,
              lsType: item.lsType,
              lssource: item.lsSource,
              impact: item.impact,
              wea13_id: item.wea13_id,
              wea13_type: item.wea13_type,
            },
            geometry: item.geometry, 
          })),
        };
        setGeoJsonData(featureCollection);
      } catch (error) {
        console.error('Error fetching geo data:', error);
      }
    };

    fetchPoints();
  }, []);

        // green circles
        const pointToLayer = (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 5, 
            fillColor: '#9cada5',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
        };

      const onEachFeature = (feature, layer) => {
      if (feature.properties) {
      const props = feature.properties;
      layer.bindPopup(
        `<div>
          <strong>Landslide ID:</strong> ${props.landslideid}<br/>
          <strong>Type:</strong> ${props.lsType}<br/>
          <strong>Source:</strong> ${props.lssource}<br/>
          <strong>Impact:</strong> ${props.impact}<br/>
          <strong>Latitude:</strong> ${props.latitude}<br/>
          <strong>Longitude:</strong> ${props.longitude}<br/>
          ${props.wea13_id ? `<strong>WEA13 ID:</strong> ${props.wea13_id}<br/>` : ''}
          ${props.wea13_type ? `<strong>WEA13 Type:</strong> ${props.wea13_type}<br/>` : ''}
        </div>`
       );
      }
    };

      const displayMap = useMemo(
      () => (
          <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '85vh', width: '100%' }}
          >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
           <MapContent setMapInstance={setMap} />

           {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            pointToLayer={pointToLayer}
            onEachFeature={onEachFeature}
          />
        )}
          </MapContainer>
        ),
    [geoJsonData],
    )

    return (
      <div className = "MapContainerWrapper">
        {displayMap}
      </div>
    )
  }