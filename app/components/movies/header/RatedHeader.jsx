"use client";
import React, { useState } from "react";
import "./ratedHeader.css";

export default function RatedHeader({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <div className="Rtop">
      <div className="Rmovies">Rated movies</div>
      <div className="rated-search">
        <input
          type="text"
          placeholder="🔍 search..."
          value={searchTerm}
          onChange={handleInput}
          className="search-input"
        />
      </div>
    </div>
  );
}
