import styles from "../../../styles/CastGrid.module.scss";

interface CastMember {
  person: {
    id: number;
    name: string;
    image?: { medium: string };
  };
  character: {
    name: string;
  };
}

export default function CastGrid({ cast }: { cast: CastMember[] }) {
  return (
    <section className={styles.cast}>
      <h2>Top Cast</h2>
      <div className={styles.castGrid}>
        {cast.map(({ person, character }) => (
          <div key={person.id} className={styles.castCard}>
            <img
              loading="lazy"
              src={person.image?.medium || "/assets/default-image.jpg"}
              alt={person.name}
              className={styles.castImage}
            />
            <p>
              <strong>{person.name}</strong>
              <br />
              as {character.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
