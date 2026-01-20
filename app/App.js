"use client";
import React, { useState } from "react";
import SideBar from "./components/SideBar/SideBar.jsx";
import Header from "./components/movies/header/Header.jsx";
import RatedHeader from "./components/movies/header/RatedHeader.jsx";
import RatedPage from "./components/movies/films/RatedPage.jsx";

import "./app.css";
import "./globals.css";

export default function App() {
  const [activePage, setActivePage] = useState("movies");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={`App ${activePage}`}>
      <SideBar onNavigate={setActivePage} />

      {activePage === "movies" && (
        <>
          <Header />
        </>
      )}

      {activePage === "rated" && (
        <div className="rated-content">
          <RatedHeader onSearch={setSearchQuery} />
          <RatedPage searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
}
