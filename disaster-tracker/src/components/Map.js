import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

const Map = ({ magnitudeFilter, disasterFilter }) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [hurricanes, setHurricanes] = useState([]);
  const [wildfires, setWildfires] = useState([]);

  // Fetch earthquake data
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

  // Fetch hurricane data
  useEffect(() => {
    fetch('https://www.nhc.noaa.gov/json/active.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Hurricane Data:', data); // Debug: Log the data
        setHurricanes(data);
      })
      .catch((error) => console.error('Error fetching hurricane data:', error));
  }, []);

  // Fetch wildfire data
  useEffect(() => {
    fetch('https://firms.modaps.eosdis.nasa.gov/api/area/csv/7514f19c7af58d2caeaee02d40e552de/VIIRS_SNPP_NRT/world/1')
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            console.log('Wildfire Data:', result.data); // Debug: Log the data
            setWildfires(result.data);
          },
        });
      })
      .catch((error) => console.error('Error fetching wildfire data:', error));
  }, []);

  // Custom icons
  const earthquakeIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const hurricaneIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/740/740878.png', // Hurricane icon
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [1, -34],
  });

  const wildfireIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2973/2973687.png', // Wildfire icon
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Earthquake markers */}
      {disasterFilter.earthquake &&
        earthquakes.map((earthquake) => {
          const { coordinates } = earthquake.geometry;
          const { mag, place } = earthquake.properties;
          return (
            <Marker
              key={earthquake.id}
              position={[coordinates[1], coordinates[0]]}
              icon={earthquakeIcon}
            >
              <Popup>
                <strong>Earthquake</strong> <br />
                <strong>Magnitude:</strong> {mag} <br />
                <strong>Location:</strong> {place} <br />
                <strong>Time:</strong> {new Date(earthquake.properties.time).toLocaleString()}
              </Popup>
            </Marker>
          );
        })}

      {/* Hurricane markers */}
      {disasterFilter.hurricane &&
        hurricanes.map((hurricane) => (
          <Marker
            key={hurricane.id}
            position={[hurricane.lat, hurricane.lon]}
            icon={hurricaneIcon}
          >
            <Popup>
              <strong>Hurricane</strong> <br />
              <strong>Name:</strong> {hurricane.name} <br />
              <strong>Category:</strong> {hurricane.category} <br />
              <strong>Wind Speed:</strong> {hurricane.wind_speed} mph <br />
              <strong>Pressure:</strong> {hurricane.pressure} hPa
            </Popup>
          </Marker>
        ))}

      {/* Wildfire markers */}
      {disasterFilter.wildfire &&
        wildfires.map((wildfire) => (
          <Marker
            key={`${wildfire.latitude}-${wildfire.longitude}`}
            position={[wildfire.latitude, wildfire.longitude]}
            icon={wildfireIcon}
          >
            <Popup>
              <strong>Wildfire</strong> <br />
              <strong>Location:</strong> {wildfire.latitude}, {wildfire.longitude} <br />
              <strong>Brightness:</strong> {wildfire.brightness} <br />
              <strong>Date:</strong> {wildfire.acq_date}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default Map;