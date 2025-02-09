import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ magnitudeFilter }) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [femaDisasters, setFemaDisasters] = useState([]);

  // Fetch earthquake data from USGS API
  useEffect(() => {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.features.filter(
          (earthquake) => earthquake.properties.mag >= parseFloat(magnitudeFilter)
        );
        setEarthquakes(filteredData);
      })
      .catch((error) => console.error('Error fetching earthquake data:', error));
  }, [magnitudeFilter]);

  // Fetch FEMA disaster data
  useEffect(() => {
    const apiKey = process.env.REACT_APP_FEMA_API_KEY;
    fetch(`https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$limit=100&$api_key=${apiKey}`)
      .then((response) => response.json())
      .then((data) => {
        setFemaDisasters(data.DisasterDeclarationsSummaries);
      })
      .catch((error) => console.error('Error fetching FEMA data:', error));
  }, []);

  // Custom icons
  const earthquakeIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const femaIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer center={[37.8, -96.9]} zoom={4} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Display earthquake markers */}
      {earthquakes.map((earthquake) => {
        const { coordinates } = earthquake.geometry;
        const { mag, place } = earthquake.properties;
        return (
          <Marker
            key={earthquake.id}
            position={[coordinates[1], coordinates[0]]}
            icon={earthquakeIcon}
          >
            <Popup>
              <strong>Magnitude:</strong> {mag} <br />
              <strong>Location:</strong> {place} <br />
              <strong>Time:</strong> {new Date(earthquake.properties.time).toLocaleString()}
            </Popup>
          </Marker>
        );
      })}
      {/* Display FEMA disaster markers */}
      {femaDisasters.map((disaster) => {
        const { incidentBeginDate, incidentType, state, declarationTitle } = disaster;
        return (
          <Marker
            key={disaster.id}
            position={[disaster.lat, disaster.lng]} // Ensure FEMA data includes lat/lng
            icon={femaIcon}
          >
            <Popup>
              <strong>Type:</strong> {incidentType} <br />
              <strong>State:</strong> {state} <br />
              <strong>Date:</strong> {new Date(incidentBeginDate).toLocaleDateString()} <br />
              <strong>Title:</strong> {declarationTitle}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
