import Link from "next/link";
import styles from "../../../styles/SeasonAccordion.module.scss";

interface Episode {
  id: number;
  name: string;
  season: number;
  number: number;
  image?: { medium: string };
}

interface Season {
  id: number;
  number: number;
  episodeOrder?: number;
  premiereDate?: string;
  endDate?: string;
}

interface Props {
  seasons: Season[];
  episodes: Episode[];
  openSeason: number | null;
  setOpenSeason: (index: number | null) => void;
  seasonRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  fallbackImage?: string;
}

export default function SeasonAccordion({
  seasons,
  episodes,
  openSeason,
  setOpenSeason,
  seasonRefs,
  fallbackImage,
}: Props) {
  return (
    <section className={styles.seasons}>
      <h2>Seasons</h2>
      {seasons.map((season, index) => {
        const isOpen = openSeason === index;
        const seasonEpisodes = episodes.filter(
          (ep) => ep.season === season.number
        );

        return (
          <div
            key={season.id}
            className={styles.accordionItem}
            ref={(el) => (seasonRefs.current[index] = el)}
          >
            <button
              className={styles.accordionHeader}
              onClick={() => setOpenSeason(isOpen ? null : index)}
            >
              Season {season.number}
              <span className={styles.accordionIcon}>{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className={styles.accordionContent}>
                <p>
                  <strong>Premiere:</strong> {season.premiereDate || "Unknown"}
                </p>
                <p>
                  <strong>End Date:</strong> {season.endDate || "Unknown"}
                </p>
                <p>
                  <strong>Episodes:</strong>{" "}
                  {season.episodeOrder || seasonEpisodes.length}
                </p>

                <div className={styles.episodeGrid}>
                  {seasonEpisodes.map((ep, i) => (
                    <div
                      key={ep.id}
                      className={styles.episodeCard}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <Link
                        href={`/episodes/${ep.id}`}
                        className={styles.episodeLink}
                      >
                        <img
                          loading="lazy"
                          src={
                            ep.image?.medium ||
                            fallbackImage ||
                            "/assets/default-image.jpg"
                          }
                          alt={ep.name}
                          className={styles.episodeImage}
                        />
                        <h3 className={styles.episodeName}>{ep.name}</h3>
                        <p className={styles.episodeInfo}>
                          Episode {ep.number}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
