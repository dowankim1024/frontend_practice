import type { Column as ColumnData } from "../type"
import { AddCardForm } from "./AddCardForm"
import { Card } from "./Card"
import styles from "./Column.module.css"
interface ColumnProps {
  column: ColumnData
  onDeleteCard: (columnId: string, cardId: string) => void
  onAddCard: (columnId: string, title: string) => void
  onUpdateTitle: (cardId: string, title: string) => void
}
export function Column({ column, onDeleteCard, onAddCard, onUpdateTitle }: ColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.title}>{column.title}</h2>
      {column.cards.map((card) => <Card key={card.id} card={card} onDelete={(cardId) => onDeleteCard(column.id, cardId)} onUpdateTitle={(title) => onUpdateTitle(card.id, title)} />)}
      <AddCardForm onAdd={(title) => onAddCard(column.id, title)} />
    </div>
  )
}