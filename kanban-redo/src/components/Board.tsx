import type { Board as BoardData } from "../type"
import { Column } from "./Column"
import styles from "./Board.module.css"
interface BoardProps {
  board: BoardData
}
export function Board({ board }: BoardProps) {
  return (
    <div className={styles.board}>
      {board.columns.map((column) => <Column key={column.id} column={column} />)}
    </div>
  )
}