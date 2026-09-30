import type { Board as BoardData } from "../type"
import { Column } from "./Column"
import styles from "./Board.module.css"
interface BoardProps {
  board: BoardData
  onDeleteCard: (columnId: string, cardId: string) => void
  onAddCard: (columnId: string, title: string) => void
  onUpdateTitle: (columnId: string, cardId: string, title: string) => void
}
export function Board({ board, onDeleteCard, onAddCard, onUpdateTitle }: BoardProps) {
  return (
    <div className={styles.board}>
      {board.columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          onDeleteCard={onDeleteCard}
          onAddCard={onAddCard}
          onUpdateTitle={onUpdateTitle}
        />
      ))}
    </div>
  )
}
