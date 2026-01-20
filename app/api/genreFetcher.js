const PROXY = "https://tmdb-relay.onrender.com/tmdb?url=";
const MAX_PER_GENRE = 500;
const DELAY = 300;

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export async function fetchGenreCorpus({ onProgress, onComplete }) {
  const seenIds = new Set();
  const corpus = [];

  for (const { id: genreId, name } of GENRES) {
    let collected = 0;
    let page = 1;

    while (collected < MAX_PER_GENRE) {
      const url = `${PROXY}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&include_adult=false&include_video=false&language=en-US&page=${page}`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        const newMovies = json.results.filter((m) => !seenIds.has(m.id));

        newMovies.forEach((m) => {
          seenIds.add(m.id);
          corpus.push({
            id: m.id,
            title: m.title,
            vote_average: m.vote_average,
            vote_count: m.vote_count,
            release_date: m.release_date,
            genre_ids: m.genre_ids,
            poster_path: m.poster_path,
          });
        });

        collected += newMovies.length;
        if (page >= json.total_pages) break;
        page++;
        await new Promise((res) => setTimeout(res, DELAY));
      } catch (err) {
        console.warn(`⚠ Error loading genre ${name}:`, err.message);
        break;
      }
    }

    console.log(`✅ ${name}: added ${collected} unique movies`);
    onProgress?.(name, collected);
  }

  onComplete?.(corpus);
}
