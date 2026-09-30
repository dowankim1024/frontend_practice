import { useState } from "react"
import type { Card as CardData } from "../type"
import styles from "./Card.module.css"

interface CardProps {
  card: CardData
  onDelete: () => void
  onUpdateTitle: (title: string) => void
}

export function Card({ card, onDelete, onUpdateTitle }: CardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [text, setText] = useState<string>(card.title)
  function commit() {
    if (!text.trim()) setText(card.title)
    else onUpdateTitle(text.trim())
    setIsEditing(false)
  }
  return (
    <div className={styles.card}>
      {isEditing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit()
            }
            if (e.key === "Escape") {
              setText(card.title)
              setIsEditing(false)
            }
          }}
          onBlur={commit}
        />
      ) : (
        <h3 className={styles.title} onClick={() => setIsEditing(true)}>
          {card.title}
        </h3>
      )}
      {card.description && <p className={styles.description}>{card.description}</p>}
      <button onClick={onDelete}>삭제</button>
    </div>
  )
}
