import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#2c3e50",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1000,
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left side - Hamburger menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Site title - now outside the menu items */}
        <div
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          Project OMAC
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "20px",
              backgroundColor: "white",
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              padding: "10px",
              zIndex: 1001,
              minWidth: "200px",
            }}
          >
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "8px 12px",
                color: "#2c3e50",
                textDecoration: "none",
                borderRadius: "4px",
                transition: "background-color 0.3s",
                marginBottom: "5px",
              }}
            >
              Disaster Tracker
            </Link>
            <Link
              to="/noticeboard"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "8px 12px",
                color: "#2c3e50",
                textDecoration: "none",
                borderRadius: "4px",
                transition: "background-color 0.3s",
              }}
            >
              Noticeboard
            </Link>
          </div>
        )}
      </div>

      {/* Right side - Account link */}
      <div>
        <Link
          to="/account"
          style={{
            color: "white",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "background-color 0.3s",
          }}
        >
          My Account
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
