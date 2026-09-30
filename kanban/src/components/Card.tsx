import type { Card as CardData } from "../type"
import styles from "./Card.module.css"

interface CardProps {
  card: CardData
}

export function Card({ card }: CardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{card.title}</h3>
      {card.description && <p className={styles.description}>{card.description}</p>}
    </div>
  )
}
