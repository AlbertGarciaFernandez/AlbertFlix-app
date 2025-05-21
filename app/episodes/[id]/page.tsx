"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../../styles/episode.module.scss";

// Types for the fetched show data
interface EpisodeData {
  id: number;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number;
  image?: {
    medium: string;
    original: string;
  };
  rating: {
    average: number;
  };
  summary: string;
  url: string;
}

export default function EpisodePage() {
  // Get episode ID from dynamic route
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const router = useRouter();

  // State to store episode info, loading state, and errors
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isClient = typeof window !== "undefined";

  // Fetch episode details when the component mounts and the ID is available
  useEffect(() => {
    if (!isClient || !id || isNaN(Number(id))) return;

    const fetchEpisodeDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://api.tvmaze.com/episodes/${encodeURIComponent(id)}`
        );
        if (!res.ok) throw new Error("Failed to fetch episode");

        const epData = await res.json();
        setEpisode(epData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error);
          setError(error.message);
        } else {
          setError("Failed to load episode.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeDetails();
  }, [id, isClient]);

  // Navigate to the next episode
  const handleNext = () => {
    if (id) router.push(`/episodes/${Number(id) + 1}`);
  };

  // Navigate to the previous episode (unless it's the first one)
  const handlePrevious = () => {
    if (id && Number(id) > 1) router.push(`/episodes/${Number(id) - 1}`);
  };

  // Handle loading and error states
  if (!isClient || loading) return <p>Loading episode...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!episode) return <p>Episode not found.</p>;

  return (
    <div className={styles.container}>
      {/* Episode title and image */}
      <header className={styles.header}>
        <h1 className={styles.title}>{episode.name}</h1>
        <img
          src={episode.image?.original || "/assets/default-image.jpg"}
          alt={episode.name}
          className={styles.image}
        />
      </header>

      <main className={styles.main}>
        {/* Episode metadata */}
        <section className={styles.details}>
          <p>
            <strong>Season:</strong> {episode.season}
          </p>
          <p>
            <strong>Episode:</strong> {episode.number}
          </p>
          <p>
            <strong>Type:</strong> {episode.type}
          </p>
          <p>
            <strong>Air Date:</strong> {episode.airdate} at {episode.airtime}
          </p>
          <p>
            <strong>Runtime:</strong> {episode.runtime} minutes
          </p>
          <p>
            <strong>Rating:</strong> {episode.rating?.average || "N/A"} / 10
          </p>
          <p>
            <strong>TVmaze:</strong>{" "}
            <a href={episode.url} target="_blank" rel="noopener noreferrer">
              Visit Episode Page
            </a>
          </p>
        </section>

        {/* Episode summary */}
        <section className={styles.summary}>
          <h2>Summary</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: episode.summary || "<p>No summary available.</p>",
            }}
          />
        </section>

        {/* Navigation between episodes */}
        <div className={styles.navigationButtons}>
          <button onClick={handlePrevious} disabled={Number(id) <= 1}>
            ← Previous Episode
          </button>
          <button onClick={handleNext}>Next Episode →</button>
        </div>
      </main>

      {/* Link back to home */}
      <footer className={styles.backLink}>
        <Link href="/">&larr; Back to Home</Link>
      </footer>
    </div>
  );
}
