import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Spinner from './Spinner';

const Map = ({ magnitudeFilter }) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.features.filter(
          (earthquake) => earthquake.properties.mag >= parseFloat(magnitudeFilter)
        );
        setEarthquakes(filteredData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching earthquake data:', error);
        setLoading(false);
      });
  }, [magnitudeFilter]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {earthquakes.map((earthquake) => {
        const { coordinates } = earthquake.geometry;
        const { mag, place } = earthquake.properties;
        return (
          <Marker
            key={earthquake.id}
            position={[coordinates[1], coordinates[0]]}
            icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <strong>Magnitude:</strong> {mag} <br />
              <strong>Location:</strong> {place} <br />
              <strong>Time:</strong> {new Date(earthquake.properties.time).toLocaleString()}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
