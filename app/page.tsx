"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/home.module.scss";

// Types for the fetched show data
interface ShowImage {
  medium: string;
}

interface Show {
  id: number;
  name: string;
  genres: string[];
  image?: ShowImage;
}

const SHOWS_PER_PAGE = 10;

export default function Home() {
  // State hooks
  const [shows, setShows] = useState<Show[]>([]); // All fetched shows
  const [searchQuery, setSearchQuery] = useState<string>(""); // User's search input
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error message
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page index
  const [totalShows, setTotalShows] = useState<number>(0); // Total number of shows fetched

  // Fetch shows when component mounts or searchQuery changes
  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      setError(null);

      try {
        let res;
        if (searchQuery) {
          // If searching, use the search endpoint
          res = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(
              searchQuery
            )}`
          );
          if (!res.ok) throw new Error("Failed to search shows");
          const data = await res.json();
          const results = data.map((item: { show: Show }) => item.show);
          setShows(results);
          setTotalShows(results.length);
        } else {
          // Otherwise fetch all shows
          res = await fetch("https://api.tvmaze.com/shows");
          if (!res.ok) throw new Error("Failed to fetch shows");
          const data = await res.json();
          setShows(data);
          setTotalShows(data.length);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError("Error fetching shows: " + error.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [searchQuery]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.trim());
    setCurrentPage(1); // Reset to page 1 on new search
  };

  // Pagination logic
  const indexOfLastShow = currentPage * SHOWS_PER_PAGE;
  const indexOfFirstShow = indexOfLastShow - SHOWS_PER_PAGE;
  const currentShows = shows.slice(indexOfFirstShow, indexOfLastShow);
  const totalPages = Math.ceil(shows.length / SHOWS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <main className={styles.main}>
      {/* Header & Navigation */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <img
              src="/assets/AlbertFlixLogo.png"
              alt="AlbertFlix Logo"
              className={styles.logo}
            />
          </Link>
        </div>
      </header>

      {/* Hero section with search bar */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>Explore the World of TV Shows!</h2>
          <input
            type="text"
            className={styles.searchBar}
            placeholder="Search for a show..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </section>

      {/* Show list section */}
      <section className={styles.showList}>
        <h2 className={styles.showTitle}>Popular Shows</h2>
        <p className={styles.totalCount}>Total Shows Found: {totalShows}</p>

        {loading ? (
          <p>Loading shows...</p>
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : (
          <>
            {/* Grid of show cards */}
            <div className={styles.showGrid}>
              {currentShows.length === 0 ? (
                <p>No shows found.</p>
              ) : (
                currentShows.map((show) => (
                  <div key={show.id} className={styles.showCard}>
                    <Link
                      href={`/shows/${show.id}`}
                      className={styles.showLink}
                    >
                      <img
                        src={show.image?.medium || "/assets/default-image.jpg"}
                        alt={show.name}
                        className={styles.showImage}
                      />
                      <h3 className={styles.showName}>{show.name}</h3>
                      <p className={styles.showGenre}>
                        {show.genres.join(", ")}
                      </p>
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Pagination controls */}
            <div className={styles.pagination}>
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
