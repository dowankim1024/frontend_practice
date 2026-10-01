import { useState } from "react"
import type { Card as CardData } from "../type"
import styles from "./Card.module.css"
import { useBoardDispatch } from "../useBoard"

interface CardProps {
  card: CardData
  columnId: string
}

export function Card({ card, columnId }: CardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [text, setText] = useState<string>(card.title)
  const dispatch = useBoardDispatch()
  function commit() {
    if (!text.trim()) setText(card.title)
    else dispatch({ type: "updateCardTitle", columnId, cardId: card.id, title: text.trim() })
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
      <button onClick={() => dispatch({ type: "deleteCard", columnId, cardId: card.id })}>
        삭제
      </button>
    </div>
  )
}
