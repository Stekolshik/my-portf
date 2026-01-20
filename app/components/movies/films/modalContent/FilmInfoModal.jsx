import React, { useEffect, useState, useCallback } from "react";
import "./FilmInfoModal.css";
import FilmRateModal from "./FilmRateModal.jsx";
import { movieCache } from "../../../../cache/MovieCache";

export default function FilmInfoModal({
  film,
  genres,
  getGenreNames,
  onClose,
  onUserRate,
}) {
  const [fullFilm, setFullFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState(null);
  const [bgUrl, setBgUrl] = useState(null);
  const [visibleId, setVisibleId] = useState(null);

  const fetchImage = useCallback(
    (path, size = "w500") =>
      path ? `https://tmdb-relay.onrender.com/image?path=/${size}${path}` : "",
    []
  );

  const handleIconClick = useCallback((id) => {
    setVisibleId((prev) => (prev === id ? null : id));
  }, []);

  const handleRate = useCallback(
    (id, rating) => {
      if (!movieCache) return;

      const all = movieCache
        .getAll()
        .map((m) =>
          m.id === id ? { ...m, user_rating: rating ?? undefined } : m
        );
      movieCache.clear();
      movieCache.addBatch(all);
      movieCache.saveToLocal();
      onUserRate?.(id, rating);

       
      setFullFilm((prev) =>
        prev && prev.id === id
          ? { ...prev, user_rating: rating ?? undefined }
          : prev
      );

      setVisibleId(null);
    },
    [onUserRate]
  );

   
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setVisibleId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

   
  useEffect(() => {
    if (!film?.id) return;

    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://tmdb-relay.onrender.com/tmdb?url=/movie/${film.id}`
        );
        const data = await res.json();
        setFullFilm({ ...film, ...data });
      } catch (err) {
        console.warn("Error loading movie details:", err.message);
        setFullFilm(film);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [film]);

   
  useEffect(() => {
    if (!film?.id) return;

    async function fetchTrailer() {
      try {
        const res = await fetch(
          `https://tmdb-relay.onrender.com/tmdb?url=/movie/${film.id}/videos`
        );
        const data = await res.json();
        const trailer = data.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        if (trailer) setTrailerKey(trailer.key);
      } catch (err) {
        console.warn("Error loading trailer:", err.message);
      }
    }

    fetchTrailer();
  }, [film]);

   
  useEffect(() => {
    if (!film) return;

    if (film.poster_path) {
      setBgUrl(fetchImage(film.poster_path, "w500"));
    }

    const filmData = fullFilm || film;
    if (filmData?.backdrop_path) {
      const nextUrl = fetchImage(filmData.backdrop_path, "original");
      const img = new Image();
      img.src = nextUrl;
      img.onload = () => setBgUrl(nextUrl);
    }
  }, [fullFilm, film, fetchImage]);

   
  useEffect(() => {
    if (film) {
      document.body.classList.add("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [film]);

  if (!film) return null;

  const filmData = fullFilm || film;

  return (
    <div
      className="modal-background"
      onClick={onClose}
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#f2ebf9",
      }}
    >
      <div className="exit">
        <button onClick={onClose}>X</button>
      </div>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="film-detail">
          <div className="poster">
            {filmData.poster_path && (
              <img
                src={fetchImage(filmData.poster_path, "w500")}
                alt={filmData.title}
                className="detail-poster"
                loading="lazy"
              />
            )}
          </div>

          <div className="film-details">
            <h2 className="modal-title">{filmData.title}</h2>

            <div className="modal-year">
              {filmData.release_date
                ? new Date(filmData.release_date).getFullYear()
                : "—"}
            </div>

            <div className="detail-rating">
              ⭐ {filmData.vote_average?.toFixed(1) ?? "none info"} (
              <span className="vote-count">
                {filmData.vote_count?.toLocaleString() ?? "none info"} votes
              </span>
              )
            </div>

            <div className="duration">
              Duration:{" "}
              <span>
                {filmData.runtime
                  ? `${Math.floor(filmData.runtime / 60)}h ${
                      filmData.runtime % 60
                    }m`
                  : "none info"}
              </span>
            </div>

            <div className="premiere">
              Premiere:{" "}
              <span>
                {filmData.release_date
                  ? new Date(filmData.release_date).toLocaleDateString("ru-RU")
                  : "none info"}
              </span>
            </div>

            <div className="budget">
              Budget:{" "}
              <span>
                {filmData.budget
                  ? `$${(filmData.budget / 1_000_000).toFixed(1)} M`
                  : "none info"}
              </span>
            </div>

            <div className="profit">
              Gross worldwide:{" "}
              <span>
                {filmData.revenue
                  ? `$${(filmData.revenue / 1_000_000).toFixed(1)} млн`
                  : "none info"}
              </span>
            </div>

            {filmData.genre_ids?.length > 0 && (
              <div className="detail-genres">
                Genres: <span>{getGenreNames(filmData.genre_ids)}</span>
              </div>
            )}
          </div>

          <div>
            <div
              className="film-card-rating-icon"
              onClick={() => handleIconClick(filmData.id)}
            >
              <img
                src={filmData.user_rating ? "/star-rated.svg" : "/star.svg"}
                alt="Звезда"
                className="film-card-star"
              />
              {filmData.user_rating != null && (
                <span className="user-rating-label">
                  {filmData.user_rating}
                </span>
              )}
            </div>
          </div>

          {visibleId === filmData.id && (
            <FilmRateModal
              film={filmData}
              onUserRate={handleRate}
              setVisibleId={setVisibleId}
            />
          )}
        </div>

        <div className="details">
          {trailerKey && (
            <div className="trailer">
              Trailer
              <span>
                <iframe
                  width="500"
                  height="281"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Трейлер"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video"
                ></iframe>
              </span>
            </div>
          )}
          <div className="divider"></div>
          <div className="Description">
            Description
            <span>
              {loading
                ? "Loading description..."
                : filmData.overview ?? "none info."}
            </span>
          </div>
          <div className="divider"></div>

          {filmData.production_companies?.length > 0 && (
            <div className="detail-companies">
              <h3>Production :</h3>
              <ul>
                {filmData.production_companies.map((company) => (
                  <li className="productions" key={company.id}>
                    {company.logo_path ? (
                      <img
                        src={`https://tmdb-relay.onrender.com/image?path=/w200${company.logo_path}`}
                        alt={company.name}
                        style={{ height: "32px", marginRight: "8px" }}
                      />
                    ) : (
                      <span
                        style={{
                          marginRight: "48px",
                          borderColor: "black",
                          borderStyle: "solid",
                          borderRadius: "50%",
                          borderWidth: "1px",
                        }}
                      >
                        ?
                      </span>
                    )}
                    <span className="company-name">{company.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
