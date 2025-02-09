import React from 'react';

const Filter = ({ onFilterChange }) => {
  return (
    <div className="filter">
      <label htmlFor="magnitude">Filter by Magnitude: </label>
      <select id="magnitude" onChange={(e) => onFilterChange(e.target.value)}>
        <option value="0">All</option>
        <option value="2">2+</option>
        <option value="4">4+</option>
        <option value="6">6+</option>
      </select>
    </div>
  );
};

export default Filter;
