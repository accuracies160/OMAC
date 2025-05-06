import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Map from './components/Map';
import Filter from './components/Filter';
import DisasterFilter from './components/DisasterFilter';
import AuthButtons from './components/AuthButtons';
import NotificationService from './components/NotificationService';
import Noticeboard from './components/Noticeboard';
import Navbar from './components/Navbar';
import AccountPage from './components/AccountPage'; 
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
      <Navbar />
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1001 
      }}>
        <AuthButtons />
      </div>
      
      <div style={{ 
        paddingTop: '80px', 
        minHeight: 'calc(100vh - 80px)'
      }}>
        <Routes>
          <Route path="/" element={
            <>
              <h1>Natural Disaster Tracker</h1>
              <Filter onFilterChange={handleFilterChange} />
              <DisasterFilter
                disasterFilter={disasterFilter}
                onFilterChange={handleDisasterFilterChange}
              />
              <Map magnitudeFilter={magnitudeFilter} disasterFilter={disasterFilter} />
            </>
          } />
          <Route path="/noticeboard" element={
            <div style={{ padding: '20px' }}>
              <Noticeboard />
            </div>
          } />
          <Route path="/account" element={
            <div style={{ padding: '20px' }}>
              <AccountPage />
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
