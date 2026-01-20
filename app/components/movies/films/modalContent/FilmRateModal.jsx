"use client";
import React from "react";
import { movieCache } from "../../../../cache/MovieCache";
import "./FilmRateModal.css";

export default function FilmRateModal({ film, setVisibleId, onRefresh }) {
  const saveRating = (rating) => {
    movieCache.updateRating(film.id, rating ?? undefined);
    movieCache.saveToLocal();

    onRefresh?.();

    setVisibleId(null);

    const payload = {
      user_id: String(localStorage.getItem("user_id")),
      movie_id: Number(film.id),
      user_rating: rating == null ? null : Number(rating),
    };

    fetch("https://tmdb-relay.onrender.com/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res
            .text()
            .then((txt) => console.error("Server rejected:", res.status, txt));
        }
      })
      .catch((err) => console.error("Ошибка сохранения рейтинга:", err));
  };

  return (
    <div className="modal-overlay" onClick={() => setVisibleId(null)}>
      <div
        className="modal-content"
        role="button"
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
      >
        <h1>Your rating</h1>
        <div className="modal-divider"></div>
        <div className="title">{film.title}</div>
        <div className="rating-stars-row">
          {[...Array(10)].map((_, i) => {
            const starRating = i + 1;
            return (
              <span
                key={starRating}
                className="rating-star"
                onClick={() => saveRating(starRating)}
                style={{
                  color: film.user_rating >= starRating ? "#9854F6" : "#7B7C88",
                  cursor: "pointer",
                }}
              >
                ★
              </span>
            );
          })}
        </div>

        <button className="remove-rating-btn" onClick={() => saveRating(null)}>
          remove rating
        </button>
      </div>
    </div>
  );
}
