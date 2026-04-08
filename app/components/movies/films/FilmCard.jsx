"use client";
import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import "./FilmCard.css";
import { movieCache } from "../../../cache/MovieCache";
import FilmInfoModal from "./modalContent/FilmInfoModal.jsx";
import FilmRateModal from "./modalContent/FilmRateModal.jsx";

const fetchImage = (path, size = "original") =>
  `https://tmdb-relay.onrender.com/image?path=/${size}${path}`;

const FilmCardItem = memo(function FilmCardItem({
  id,
  title,
  poster,
  voteAverage,
  voteCount,
  releaseDate,
  genreIds,
  userRating,
  onOpenModal,
  onOpenRate,
  onUserRate,
  getGenreNames,
}) {
  const [localRating, setLocalRating] = useState(userRating ?? null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLocalRating(userRating ?? null);
  }, [userRating]);

  useEffect(() => {
    const checkImage = () => {
      if (imgRef.current?.complete) {
        setImgLoaded(true);
      }
    };

    checkImage();

    const timer = setTimeout(checkImage, 100);
    return () => clearTimeout(timer);
  }, [poster]);

  return (
    <div className="film-card">
      <div className="film-poster-wrap">
        {!imgLoaded && <div className="loader"></div>}
        <img
          ref={imgRef}
          src={poster ? fetchImage(poster, "w500") : "/poster-fallback.png"}
          alt={title}
          className={`film-poster ${imgLoaded ? "visible" : "hidden"}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
      </div>

      <div className="film-info">
        <button className="film-title" onClick={() => onOpenModal(id)}>
          {title}
        </button>
        <div className="film-rating">
          ⭐ {voteAverage?.toFixed(1) ?? "—"} (
          <span className="vote-count">
            {voteCount?.toLocaleString() ?? "—"} votes
          </span>
          )
        </div>
        <div className="film-year">
          {releaseDate ? new Date(releaseDate).getFullYear() : "—"}
        </div>
        {Array.isArray(genreIds) && genreIds.length > 0 && (
          <div className="film-genres">
            <span>{getGenreNames(genreIds)}</span>
          </div>
        )}
      </div>

      <div
        className="film-card-rating-icon"
        onClick={() => onOpenRate({ id, title, user_rating: localRating })}
      >
        <img
          src={localRating ? "/star-rated.svg" : "/star.svg"}
          alt="Звезда"
          className="film-card-star"
        />
        {localRating != null && (
          <span className="user-rating-label">{localRating}</span>
        )}
      </div>
    </div>
  );
});

export default function FilmCard({ films, genres, onUserRate }) {
  const [rateModalFilm, setRateModalFilm] = useState(null);
  const [infoModalFilm, setInfoModalFilm] = useState(null);
  const [scrollYBeforeModal, setScrollYBeforeModal] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setRateModalFilm(null);
        setInfoModalFilm(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenModal = useCallback(
    (id) => {
      const film = films.find((f) => f.id === id);
      if (!film) return;
      setScrollYBeforeModal(window.scrollY);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setInfoModalFilm(film);
    },
    [films],
  );

  const handleCloseModal = useCallback(() => {
    setInfoModalFilm(null);
    window.scrollTo({ top: scrollYBeforeModal, behavior: "smooth" });
  }, [scrollYBeforeModal]);

  const handleRate = useCallback(
    (id, rating) => {
      const all = movieCache
        .getAll()
        .map((m) =>
          m.id === id ? { ...m, user_rating: rating ?? undefined } : m,
        );
      movieCache.clear();
      movieCache.addBatch(all);
      movieCache.saveToLocal();
      onUserRate?.(id, rating);

      setInfoModalFilm((prev) =>
        prev && prev.id === id
          ? { ...prev, user_rating: rating ?? undefined }
          : prev,
      );

      setRateModalFilm(null);
    },
    [onUserRate],
  );

  const getGenreNames = useCallback(
    (ids) => {
      if (!Array.isArray(ids)) return "";
      return ids
        .map((id) => genres?.find((g) => g.id === id)?.name || "Unknown")
        .slice(0, 3)
        .join(", ");
    },
    [genres],
  );

  if (!films?.length) {
    return (
      <section className="film-posters">
        <div className="no-results">😔 No movies found</div>
      </section>
    );
  }

  return (
    <section className="film-posters">
      {films.map((film) => (
        <FilmCardItem
          key={film.id}
          id={film.id}
          title={film.title}
          poster={film.poster_path}
          voteAverage={film.vote_average}
          voteCount={film.vote_count}
          releaseDate={film.release_date}
          genreIds={film.genre_ids}
          userRating={film.user_rating}
          onOpenModal={handleOpenModal}
          onOpenRate={setRateModalFilm}
          onUserRate={handleRate}
          getGenreNames={getGenreNames}
        />
      ))}

      {infoModalFilm && (
        <FilmInfoModal
          film={infoModalFilm}
          genres={genres}
          getGenreNames={getGenreNames}
          onClose={handleCloseModal}
          onUserRate={handleRate}
        />
      )}

      {rateModalFilm && (
        <FilmRateModal
          film={rateModalFilm}
          onUserRate={handleRate}
          setVisibleId={() => setRateModalFilm(null)}
        />
      )}
    </section>
  );
}
