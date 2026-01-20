"use client";
import React, { useState, useEffect } from "react";
import FilmsPage from "../../../components/movies/films/FilmsPage";
import "./header.css";

const GENRES_API_URL =
  "https://tmdb-relay.onrender.com/tmdb?url=/genre/movie/list";

export default function Header() {
  const [filters, setFilters] = useState({
    genre: "all",
    releaseYear: "all",
    ratingFrom: "all",
    ratingTo: "all",
    sortBy: "none",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [genreOptions, setGenreOptions] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(GENRES_API_URL);
        const data = await response.json();
        if (data.genres) {
          setGenreOptions(data.genres);
        }
      } catch (err) {
        console.error("Failed to load genres:", err);
      }
    };
    fetchGenres();
  }, []);

  const currentYear = new Date().getFullYear();
  const releaseYears = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );
  const ratings = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFilters((prev) => {
      const updated = { ...prev, [field]: value };

      if (
        (field === "releaseYear" || field === "genre") &&
        value !== "all" &&
        prev.sortBy === "none"
      ) {
        updated.sortBy = "none";
      }

      return updated;
    });
  };

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setFilters({
      genre: "all",
      releaseYear: "all",
      ratingFrom: "all",
      ratingTo: "all",
      sortBy: "none",
    });
    setSearchTerm("");
  };

  return (
    <section className="header">
      <div className="block">
        <div className="top">
          <div className="head_movies">Movies</div>
          <div className="search">
            <input
              type="text"
              name="search"
              placeholder="🔍 search..."
              value={searchTerm}
              onChange={handleSearchInput}
              className="search-input"
            />
          </div>
             
        </div>

        <div className="sortWindow">
          <div className="genres">
            <label htmlFor="genre-select">Genres</label>
            <div className="dropWindow">
              <select
                id="genre-select"
                name="genre"
                className="genres_dropdown"
                value={filters.genre}
                onChange={handleChange("genre")}
              >
                <option value="all">All</option>
                {genreOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="release_year">
            <label htmlFor="release-year-select">Release Year</label>
            <div className="dropWindow">
              {" "}
              <select
                id="release-year-select"
                name="releaseYear"
                className="release_year_dropdown"
                value={filters.releaseYear}
                onChange={handleChange("releaseYear")}
              >
                <option value="all">All</option>
                {releaseYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ratings">
            <label htmlFor="rating-from">Ratings</label>
            <div className="ratings-row">
              <div className="dropWindowF">
                <select
                  id="rating-from"
                  name="ratingFrom"
                  className="ratings_from_dropdown"
                  value={filters.ratingFrom}
                  onChange={handleChange("ratingFrom")}
                >
                  <option value="all">From</option>
                  {ratings.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dropWindowT">
                {" "}
                <select
                  id="rating-to"
                  name="ratingTo"
                  className="ratings_to_dropdown"
                  value={filters.ratingTo}
                  onChange={handleChange("ratingTo")}
                >
                  <option value="all">To</option>
                  {ratings
                    .slice()
                    .reverse()
                    .map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="reset">
            <button onClick={resetFilters}>Reset filters</button>
          </div>
        </div>

        <div className="sort_by">
          <label htmlFor="sort-by-select">Sort by</label>
          <div className="dropWindow">
            <select
              id="sort-by-select"
              name="sortBy"
              className="sort_by_dropdown"
              value={filters.sortBy}
              onChange={handleChange("sortBy")}
            >
              <option value="none">None</option>
              <option value="ratingAsc">From low Rating</option>
              <option value="ratingDesc">From high Rating</option>
              <option value="yearAsc">Oldest</option>
              <option value="yearDesc">Newest</option>
            </select>
          </div>
        </div>

        <div className="films-container">
          <FilmsPage filters={filters} searchQuery={searchTerm} />
        </div>
      </div>
    </section>
  );
}
