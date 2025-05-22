"use client"; // Ensure this component runs client-side (needed for useEffect and dynamic behavior)

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "../../../styles/show.module.scss";

import SeasonAccordion from "../../components/show/SeasonAccordion";
import CastGrid from "../../components/show/CastGrid";

// Types for the fetched show data

interface ShowImage {
  original: string;
}

interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
  image?: { medium: string };
}

interface CastMember {
  person: {
    id: number;
    name: string;
    image?: { medium: string };
  };
  character: { name: string };
}

interface CrewMember {
  type: string;
  person: { name: string };
}

interface Season {
  id: number;
  number: number;
  episodeOrder?: number;
  premiereDate?: string;
  endDate?: string;
}

interface ShowData {
  name: string;
  image?: ShowImage;
  summary: string;
  genres: string[];
  status: string;
  premiered: string;
  language: string;
  type: string;
  runtime: number;
  officialSite?: string;
  schedule: {
    time: string;
    days: string[];
  };
  rating: { average: number };
  _embedded: {
    episodes: Episode[];
    cast: CastMember[];
    crew: CrewMember[];
    seasons: Season[];
    images: { resolutions: { original: { url: string } } }[];
  };
}

export default function ShowPage() {
  // Sates set up
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [show, setShow] = useState<ShowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [openSeason, setOpenSeason] = useState<number | null>(null);
  const seasonRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track if component mounted client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data including embedded episodes, cast, crew, seasons, images
  useEffect(() => {
    if (!isClient || !id) return;

    const fetchShow = async () => {
      try {
        const res = await fetch(
          `https://api.tvmaze.com/shows/${encodeURIComponent(
            id
          )}?embed[]=episodes&embed[]=cast&embed[]=crew&embed[]=seasons&embed[]=images`
        );
        if (!res.ok) throw new Error("Failed to fetch show");

        const data = await res.json();
        setShow(data);

        // Automatically open Season 1 if available
        const indexOfSeason1 = data._embedded.seasons.findIndex(
          (season: { number: number }) => season.number === 1
        );

        setOpenSeason(indexOfSeason1 >= 0 ? indexOfSeason1 : null);
      } catch (err) {
        console.error(err);
        setShow(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShow();
  }, [isClient, id]);

  // Scroll to the open season accordion
  useEffect(() => {
    if (openSeason !== null && seasonRefs.current[openSeason]) {
      seasonRefs.current[openSeason]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [openSeason]);

  // Handle loading or missing data
  if (!isClient || loading) return <p>Loading show details...</p>;
  if (!show) return <p>Show not found.</p>;

  return (
    <div className={styles.container}>
      {/* Header with title and image */}
      <header className={styles.header}>
        <h1 className={styles.title}>{show.name}</h1>
        {show.image?.original && (
          <div className={styles.imageContainer}>
            <img
              loading="lazy"
              src={show.image.original}
              alt={show.name}
              className={styles.image}
            />
          </div>
        )}
      </header>

      <main className={styles.main}>
        {/* Summary - HTML from API */}
        <section className={styles.summary}>
          <div
            dangerouslySetInnerHTML={{ __html: show.summary || "" }}
            className={styles.summaryText}
          />
        </section>

        {/* Show Details Section */}
        <section className={styles.details}>
          <div className={styles.detailsItem}>
            <strong>Genres:</strong> {show.genres.join(", ")}
          </div>
          <div className={styles.detailsItem}>
            <strong>Status:</strong> {show.status}
          </div>
          <div className={styles.detailsItem}>
            <strong>Premiered:</strong> {show.premiered}
          </div>
          <div className={styles.detailsItem}>
            <strong>Language:</strong> {show.language}
          </div>
          <div className={styles.detailsItem}>
            <strong>Type:</strong> {show.type}
          </div>
          <div className={styles.detailsItem}>
            <strong>Runtime:</strong> {show.runtime} min
          </div>
          <div className={styles.detailsItem}>
            <strong>Schedule:</strong> {show.schedule.days.join(", ")} at{" "}
            {show.schedule.time}
          </div>
          <div className={styles.detailsItem}>
            <strong>Rating:</strong> {show.rating.average || "N/A"}
          </div>
          {show.officialSite && (
            <div className={styles.detailsItem}>
              <strong>Official Site:</strong>{" "}
              <a
                href={show.officialSite}
                target="_blank"
                rel="noopener noreferrer"
              >
                {show.officialSite}
              </a>
            </div>
          )}
        </section>

        {/* Seasons Accordion */}
        <SeasonAccordion
          seasons={show._embedded.seasons}
          episodes={show._embedded.episodes}
          openSeason={openSeason}
          setOpenSeason={setOpenSeason}
          seasonRefs={seasonRefs}
          fallbackImage={show.image?.original}
        />

        {/* Cast grid */}
        <CastGrid cast={show._embedded.cast} />

        {/* Crew list */}
        <section className={styles.crew}>
          <h2>Crew</h2>
          <ul className={styles.crewList}>
            {show._embedded.crew.map((crew, idx) => (
              <li key={idx}>
                {crew.type}: {crew.person.name}
              </li>
            ))}
          </ul>
        </section>

        {/* Image gallery */}
        <section className={styles.gallery}>
          <h2>Gallery</h2>
          <div className={styles.imageGallery}>
            {show._embedded.images.map((img, index) => (
              <img
                key={index}
                loading="lazy"
                src={img.resolutions.original.url}
                alt={`Gallery image ${index + 1}`}
                className={styles.galleryImage}
              />
            ))}
          </div>
        </section>
      </main>
      {/* Link back to home */}
      <footer className={styles.backLink}>
        <Link href="/">&larr; Back to Home</Link>
      </footer>
    </div>
  );
}
