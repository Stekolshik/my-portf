class MovieCache {
  #movies = [];

  addBatch(batch) {
    const before = this.#movies.length;
    const unique = batch.filter(
      (m) => !this.#movies.some((x) => x.id === m.id)
    );
    this.#movies.push(...unique);
    console.log(`➕ added: ${this.#movies.length - before} new movies`);
  }

  getAll() {
    return [...this.#movies];
  }

  filterBy(fn) {
    return this.getAll().filter(fn);
  }

  updateRating(id, rating) {
    const index = this.#movies.findIndex((m) => m.id === id);
    if (index !== -1) {
      this.#movies[index].user_rating = rating;
      console.log(
        `⭐ Updated rating for "${this.#movies[index].title}": ${rating}`
      );
      this.saveToLocal();
    }
  }

  clear() {
    this.#movies = [];
    const totalChunks = parseInt(
      localStorage.getItem("movie_cache_chunks") || "0",
      10
    );
    for (let i = 1; i <= totalChunks; i++) {
      localStorage.removeItem(`movie_cache_${i}`);
    }
    localStorage.removeItem("movie_cache_chunks");
  }

  saveToLocal() {
    const CHUNK_SIZE = 1000;
    const minimal = this.#movies.map(
      ({
        id,
        title,
        vote_average,
        vote_count,
        release_date,
        genre_ids,
        poster_path,
        user_rating,
      }) => ({
        id,
        title,
        vote_average,
        vote_count,
        release_date,
        genre_ids,
        poster_path,
        user_rating,
      })
    );

    let chunks = 0;
    for (let i = 0; i < minimal.length; i += CHUNK_SIZE) {
      const chunk = minimal.slice(i, i + CHUNK_SIZE);
      localStorage.setItem(`movie_cache_${++chunks}`, JSON.stringify(chunk));
    }
    localStorage.setItem("movie_cache_chunks", chunks);
  }

  loadFromLocal() {
    const count = parseInt(
      localStorage.getItem("movie_cache_chunks") || "0",
      10
    );
    this.#movies = [];
    for (let i = 1; i <= count; i++) {
      const raw = localStorage.getItem(`movie_cache_${i}`);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          this.#movies.push(...parsed);
        } catch (err) {
          console.warn(`⚠ Block loading error ${i}:`, err);
        }
      }
    }
    console.log(`📦 Loaded from localStorage: ${this.#movies.length} films`);
  }
}

export const movieCache = new MovieCache();
