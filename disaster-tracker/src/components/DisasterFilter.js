import React from 'react';

const DisasterFilter = ({ disasterFilter, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, checked } = e.target;
    onFilterChange({ ...disasterFilter, [name]: checked });
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label>
        <input
          type="checkbox"
          name="earthquake"
          checked={disasterFilter.earthquake}
          onChange={handleChange}
        />
        Earthquakes
      </label>
      <label style={{ marginLeft: '10px' }}>
        <input
          type="checkbox"
          name="hurricane"
          checked={disasterFilter.hurricane}
          onChange={handleChange}
        />
        Hurricanes
      </label>
      <label style={{ marginLeft: '10px' }}>
        <input
          type="checkbox"
          name="wildfire"
          checked={disasterFilter.wildfire}
          onChange={handleChange}
        />
        Wildfires
      </label>
    </div>
  );
};

export default DisasterFilter;
