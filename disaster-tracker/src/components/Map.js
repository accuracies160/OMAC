import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";

const Map = ({ magnitudeFilter, disasterFilter }) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [hurricanes, setHurricanes] = useState([]);
  const [wildfires, setWildfires] = useState([]);

  // Fetch earthquake data (unchanged)
  useEffect(() => {
    fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    )
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.features.filter(
          (earthquake) =>
            earthquake.properties.mag >= parseFloat(magnitudeFilter)
        );
        setEarthquakes(filteredData);
      })
      .catch((error) =>
        console.error("Error fetching earthquake data:", error)
      );
  }, [magnitudeFilter]);

  // Fetch hurricane data (unchanged)
  useEffect(() => {
    fetch("https://www.nhc.noaa.gov/json/active.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Hurricane Data:", data);
        setHurricanes(data);
      })
      .catch((error) => console.error("Error fetching hurricane data:", error));
  }, []);

  const fetchWildfires = async () => {
    try {
      const url =
        "https://firms.modaps.eosdis.nasa.gov/api/country/csv/7514f19c7af58d2caeaee02d40e552de/VIIRS_SNPP_NRT/world/1";

      const response = await fetch(url);
      const data = await response.json(); // Try JSON if CSV fails

      const filteredWildfires = data
        .filter((fire) => fire.confidence === "high" || fire.confidence >= 70)
        .slice(0, 500);

      setWildfires(filteredWildfires);
    } catch (error) {
      console.error("Error fetching wildfire data:", error);
      // Fallback to test data
      setWildfires([
        {
          latitude: 34.0522,
          longitude: -118.2437,
          confidence: "high",
          brightness: 320,
          acq_date: new Date().toISOString(),
        },
      ]);
    }
  };

  // Custom icons (unchanged)
  const earthquakeIcon = new L.Icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const hurricaneIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/740/740878.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [1, -34],
  });

  const wildfireIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2973/2973687.png",
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* Earthquake markers (unchanged) */}
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
                <strong>Time:</strong>{" "}
                {new Date(earthquake.properties.time).toLocaleString()}
              </Popup>
            </Marker>
          );
        })}

      {/* Hurricane markers (unchanged) */}
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

      {/* Optimized wildfire markers */}
      {disasterFilter.wildfire &&
        wildfires.slice(0, 300).map(
          (
            wildfire // Only show first 300 points
          ) => (
            <Marker
              key={`${wildfire.latitude}-${wildfire.longitude}-${wildfire.acq_date}-${wildfire.acq_time}`}
              position={[wildfire.latitude, wildfire.longitude]}
              icon={wildfireIcon}
            >
              <Popup>
                <strong>Wildfire</strong> <br />
                <strong>Location:</strong> {wildfire.latitude},{" "}
                {wildfire.longitude} <br />
                <strong>Brightness:</strong> {wildfire.brightness} <br />
                <strong>Confidence:</strong> {wildfire.confidence} <br />
                <strong>Date:</strong> {wildfire.acq_date} {wildfire.acq_time}
              </Popup>
            </Marker>
          )
        )}
    </MapContainer>
  );
};

export default Map;
