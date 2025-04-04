import React, { useState } from 'react';
import './App.css';
import Map from './components/Map';
import Filter from './components/Filter';
import DisasterFilter from './components/DisasterFilter';
import AuthButtons from './components/AuthButtons';
import NotificationService from './components/NotificationService';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [magnitudeFilter, setMagnitudeFilter] = useState('0');
  const [disasterFilter, setDisasterFilter] = useState({
    earthquake: true,
    hurricane: true,
    wildfire: true,
  });

  const handleFilterChange = (value) => {
    setMagnitudeFilter(value);
  };

  const handleDisasterFilterChange = (newFilter) => {
    setDisasterFilter(newFilter);
  };

  return (
    <div className="App">
      <AuthButtons />
      <h1>Natural Disaster Tracker</h1>
      <Filter onFilterChange={handleFilterChange} />
      <DisasterFilter
        disasterFilter={disasterFilter}
        onFilterChange={handleDisasterFilterChange}
      />
      <Map magnitudeFilter={magnitudeFilter} disasterFilter={disasterFilter} />
    </div>
  );
}

export default App;
