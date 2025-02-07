import React, { useState } from 'react';
import './App.css';
import Map from './components/Map';
import Filter from './components/Filter';

function App() {
  const [magnitudeFilter, setMagnitudeFilter] = useState('0');

  const handleFilterChange = (value) => {
    setMagnitudeFilter(value);
  };

  return (
    <div className="App">
      <h1>Natural Disaster Tracker</h1>
      <Filter onFilterChange={handleFilterChange} />
      <Map magnitudeFilter={magnitudeFilter} />
    </div>
  );
}

export default App;
