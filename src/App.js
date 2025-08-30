import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("favorites")) || [];
      setFavorites(saved);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const searchMovies = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=ce89814a&s=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      if (data.Response === "False") {
        setMovies([]);
        setError(data.Error || "No results.");
      } else {
        const detailedMovies = await Promise.all(
          data.Search.map(async (m) => {
            const detailsRes = await fetch(
              `https://www.omdbapi.com/?apikey=ce89814a&i=${m.imdbID}`
            );
            return detailsRes.json();
          })
        );
        setMovies(detailedMovies);
      }
    } catch (err) {
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  };

  let filteredMovies = movies.filter((m) => {
    let ok = true;
    if (yearFilter && m.Year !== yearFilter) ok = false;
    if (minRating && parseFloat(m.imdbRating) < parseFloat(minRating)) ok = false;
    return ok;
  });

  if (sortOption === "yearAsc") {
    filteredMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  } else if (sortOption === "yearDesc") {
    filteredMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  } else if (sortOption === "ratingAsc") {
    filteredMovies.sort((a, b) => parseFloat(a.imdbRating) - parseFloat(b.imdbRating));
  } else if (sortOption === "ratingDesc") {
    filteredMovies.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
  }

  const toggleFavorite = (movie) => {
    const exists = favorites.find((f) => f.imdbID === movie.imdbID);
    if (exists) {
      setFavorites(favorites.filter((f) => f.imdbID !== movie.imdbID));
    } else {
      setFavorites([...favorites, movie]);
    }
  };

  const isFavorite = (id) => favorites.some((f) => f.imdbID === id);

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">🎬 Movie Search</h1>

      <form onSubmit={searchMovies} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search movies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="number"
          placeholder="Filter by year"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 w-40"
        />
        <input
          type="number"
          placeholder="Min IMDb rating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="border rounded-lg px-3 py-2 w-40"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Sort by…</option>
          <option value="yearAsc">Year ↑</option>
          <option value="yearDesc">Year ↓</option>
          <option value="ratingAsc">Rating ↑</option>
          <option value="ratingDesc">Rating ↓</option>
        </select>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!error && movies.length === 0 && !loading && (
        <div className="text-gray-500 mb-4">Try searching for “Inception”.</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMovies.map((m) => (
          <div
            key={m.imdbID}
            className="bg-white rounded-xl shadow p-3 flex flex-col"
          >
            <img
              src={
                m.Poster !== "N/A"
                  ? m.Poster
                  : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={m.Title}
              className="w-full h-64 object-cover rounded-lg mb-3"
            />
            <h2 className="font-semibold text-lg">{m.Title}</h2>
            <p className="text-gray-600 text-sm">{m.Year}</p>
            <p className="text-sm mb-2">⭐ {m.imdbRating}</p>
            <button
              onClick={() => toggleFavorite(m)}
              className={`px-3 py-1 rounded-lg font-medium ${
                isFavorite(m.imdbID)
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {isFavorite(m.imdbID) ? "★ Favorited" : "☆ Favorite"}
            </button>
          </div>
        ))}
      </div>

      {favorites.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">⭐ Your Favorites</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((m) => (
              <div
                key={m.imdbID}
                className="bg-yellow-50 border border-yellow-200 rounded-xl shadow p-3 flex flex-col"
              >
                <img
                  src={
                    m.Poster !== "N/A"
                      ? m.Poster
                      : "https://via.placeholder.com/300x450?text=No+Image"
                  }
                  alt={m.Title}
                  className="w-full h-64 object-cover rounded-lg mb-3"
                />
                <h2 className="font-semibold text-lg">{m.Title}</h2>
                <p className="text-gray-600 text-sm">{m.Year}</p>
                <p className="text-sm">⭐ {m.imdbRating}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
