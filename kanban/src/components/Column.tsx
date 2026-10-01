import type { Column as ColumnData } from "../type"
import { AddCardForm } from "./AddCardForm"
import { Card } from "./Card"
import styles from "./Column.module.css"
interface ColumnProps {
  column: ColumnData
}
export function Column({ column }: ColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.title}>{column.title}</h2>
      {column.cards.map((card) => (
        <Card key={card.id} card={card} columnId={column.id} />
      ))}
      <AddCardForm columnId={column.id} />
    </div>
  )
}
