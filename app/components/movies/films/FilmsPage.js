"use client";
import React, { useEffect, useState } from "react";
import FilmCard from "./FilmCard";
import Pagination from "./pagination.jsx";
import "./filmsPage.css";
import { movieCache } from "../../../cache/MovieCache";

const PAGE_SIZE = 20;

export default function FilmsPage({ searchQuery = "", filters }) {
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
        console.error("Error loading genres:", err);
      }
    };
    fetchGenres();
  }, []);

  const refreshFilms = () => {
    let updated = movieCache.filterBy((f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filters.genre !== "all") {
      updated = updated.filter((f) =>
        f.genre_ids.includes(Number(filters.genre))
      );
    }

    if (filters.releaseYear !== "all") {
      updated = updated.filter(
        (f) =>
          new Date(f.release_date).getFullYear() === Number(filters.releaseYear)
      );
    }

    if (filters.ratingFrom !== "all") {
      updated = updated.filter(
        (f) => (f.vote_average ?? 0) >= Number(filters.ratingFrom)
      );
    }
    if (filters.ratingTo !== "all") {
      updated = updated.filter(
        (f) => (f.vote_average ?? 0) <= Number(filters.ratingTo)
      );
    }

    switch (filters.sortBy) {
      case "ratingAsc":
        updated.sort((a, b) => (a.vote_average ?? 0) - (b.vote_average ?? 0));
        break;
      case "ratingDesc":
        updated.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
        break;
      case "yearAsc":
        updated.sort(
          (a, b) =>
            new Date(a.release_date).getFullYear() -
            new Date(b.release_date).getFullYear()
        );
        break;
      case "yearDesc":
        updated.sort(
          (a, b) =>
            new Date(b.release_date).getFullYear() -
            new Date(a.release_date).getFullYear()
        );
        break;
      default:
        break;
    }

    setFilms(updated);
    const maxPage = Math.max(1, Math.ceil(updated.length / PAGE_SIZE));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  };

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
        console.error("Error loading ratings:", err);
      }

      refreshFilms();
    };

    if (userId) sync();
  }, [userId, searchQuery, filters]);

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
        itemLabel="movies"
      />
    </>
  );
}
