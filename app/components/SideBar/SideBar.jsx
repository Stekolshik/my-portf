"use client";
import React, { useState, useEffect } from "react";
import "./sideBar.css";
import { fetchGenreCorpus } from "../../api/genreFetcher";
import { movieCache } from "../../cache/MovieCache";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

function getOrCreateUserId() {
  const KEY = "user_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export default function SideBar({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [genreIndex, setGenreIndex] = useState(0);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [lastGenre, setLastGenre] = useState("");
  const [activeTab, setActiveTab] = useState("movies");

  const [userId, setUserId] = useState("");
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  const emitUserChange = (newId) => {
    window.dispatchEvent(
      new CustomEvent("user-id-changed", { detail: { userId: newId } })
    );
  };

  const handleDownload = () => {
    setError(null);
    setLoading(true);
    setGenreIndex(0);
    setTotal(0);
    setLastGenre("");

    fetchGenreCorpus({
      onProgress: (genreName, countSoFar) => {
        setGenreIndex((prev) => prev + 1);
        setLastGenre(genreName);
        setTotal((prev) => prev + countSoFar);
      },
      onComplete: (corpus) => {
        movieCache.clear();
        movieCache.addBatch(corpus);
        movieCache.saveToLocal();
        setLoading(false);
      },
      onError: (err) => {
        setError(err.message || "Error on loading");
        setLoading(false);
      },
    });
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear the cache?")) {
      movieCache.clear();
      window.location.reload();
    }
  };

  const handleLogin = async () => {
    if (userId.trim()) {
      localStorage.setItem("user_id", userId.trim());
      emitUserChange(userId.trim());

      try {
        const res = await fetch(
          `https://tmdb-relay.onrender.com/ratings?user_id=${userId.trim()}`
        );
        const serverRatings = await res.json();
        Object.entries(serverRatings).forEach(([movieId, { user_rating }]) => {
          movieCache.updateRating(Number(movieId), user_rating);
        });
        movieCache.saveToLocal();
      } catch (err) {
        console.error("Ratings loading error:", err);
      }

      setBanner({
        text: (
          <>
            Signed in by ID:{" "}
            <span style={{ color: "green", fontWeight: "bold" }}>{userId}</span>
          </>
        ),
      });
    }
  };

  const handleLogout = () => {
    if (window.confirm("Reset all ratings and logout?")) {
      localStorage.removeItem("user_id");
      const newId = crypto.randomUUID();
      localStorage.setItem("user_id", newId);
      setUserId(newId);
      emitUserChange(newId);

      movieCache.getAll().forEach((m) => (m.user_rating = undefined));
      movieCache.saveToLocal();

      setBanner({
        text: "Signed out. A new login ID has been created, and the ratings have been reset.",
      });
    }
  };

  return (
    <section className="sideBar">
      <div className={`sideBar_title ${poppins.className}`}>Menu</div>

      <div className="sideBar_butts">
        <div className="sideBar_movies">
          <button
            className={`sideBar_movies_button ${
              activeTab === "movies" ? "active" : ""
            }`}
            onClick={() => {
              onNavigate("movies");
              setActiveTab("movies");
            }}
          >
            Movies
          </button>
        </div>

        <div className="sideBar_rated">
          <button
            className={`sideBar_rated_button ${
              activeTab === "rated" ? "active" : ""
            }`}
            onClick={() => {
              onNavigate("rated");
              setActiveTab("rated");
            }}
          >
            Rated movies
          </button>
        </div>

        <div className="sideBar_auth">
          {banner && <div className="sideBar_banner">{banner.text}</div>}
          <div className="text">Enter code for login</div>
          <div className="input_login">
            <input
              className="inputL"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              aria-label="Enter user ID"
            />
          </div>
          <button className="login" onClick={handleLogin}>
            Login
          </button>
          <button className="unLogin" onClick={handleLogout}>
            New user
          </button>
        </div>

        <div className="divide"></div>
        <div className="cacheButtons">
          <button
            className="sideBar_load_button"
            onClick={!loading ? handleDownload : undefined}
          >
            {loading
              ? `Загрузка: ${lastGenre} (${genreIndex}/19)`
              : "Download cache"}
          </button>
          {loading && (
            <div className="sideBar_progress">🎬 Unique films: {total}</div>
          )}
          {error && <div className="sideBar_error">❗ {error}</div>}

          <button className="sideBar_clear_button" onClick={handleClearCache}>
            delete cache
          </button>
        </div>
      </div>
    </section>
  );
}
