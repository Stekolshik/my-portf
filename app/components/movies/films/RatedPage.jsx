"use client";
import React, { useEffect, useState } from "react";
import FilmCard from "./FilmCard";
import Pagination from "./pagination.jsx";
import "./filmsPage.css";
import { movieCache } from "../../../cache/MovieCache";

const PAGE_SIZE = 20;

export default function RatedPage({ searchQuery = "" }) {
  const [films, setFilms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_id");
      if (stored) setUserId(stored);
    }
  }, []);

  useEffect(() => {
    const onUserChange = (e) => {
      const newId = e.detail?.userId ?? localStorage.getItem("user_id");
      setUserId(newId);
    };
    window.addEventListener("user-id-changed", onUserChange);
    return () => window.removeEventListener("user-id-changed", onUserChange);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user_id") setUserId(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          "https://tmdb-relay.onrender.com/tmdb?url=/genre/movie/list"
        );
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Ошибка загрузки жанров:", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    movieCache.loadFromLocal();

    const sync = async () => {
      try {
        const res = await fetch(
          `https://tmdb-relay.onrender.com/ratings?user_id=${userId}`
        );
        const serverRatings = await res.json();
        Object.entries(serverRatings).forEach(([movieId, { user_rating }]) =>
          movieCache.updateRating(Number(movieId), user_rating)
        );
        movieCache.saveToLocal();
      } catch (err) {
        console.error("Ошибка загрузки рейтингов:", err);
      }

      const rated = movieCache
        .filterBy((f) => typeof f.user_rating === "number" && f.user_rating > 0)
        .filter((f) =>
          f.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      setFilms(rated);
      setCurrentPage(1);
    };

    if (userId) sync();
  }, [userId, searchQuery]);

  const totalPages = Math.ceil(films.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = films.slice(start, start + PAGE_SIZE);

  return (
    <>
     
      <FilmCard films={pageItems} genres={genres} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={films.length}
        itemLabel="Оценённые фильмы"
      />
    </>
  );
}
