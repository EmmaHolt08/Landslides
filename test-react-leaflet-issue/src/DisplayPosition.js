//not used at this point. also questionably still had errors
import React, { useState, useEffect, useCallback, useMemo, useRef} from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, useMap, useMapEvents, Tooltip} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';


const center = [38.6263, -90.1751]
const zoom = 10

export default function DisplayPosition ({map})
  {
      const [position, setPosition] = useState(() => map.getCenter()) 

      // const [lat, setLat] = useState(() => map.target.getCenter())
      // const [lon, setLon] = useState(()  => map.target.getCenter())
      const onClick = useCallback(() => {
          map.setView(center, zoom)
      }, [map])

      const onMove = useCallback(() => {
          setPosition(map.getCenter())
      }, [map])

      useEffect(() => {
          map.on('move', onMove)
          return () => {
              map.off('move', onMove)
              // setLat(position.lat.toFixed(4))
              // setLon(position.lng.toFixed(4))
          }
      }, [map, onMove])

      return(
      <p>
        latitude: {position.lat.toFixed(4)}, longitude: {position.lng.toFixed(4)}{' '}
      </p>
      )
    }