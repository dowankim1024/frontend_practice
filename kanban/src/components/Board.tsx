import { Column } from "./Column"
import styles from "./Board.module.css"
import { useBoard } from "../useBoard"

export function Board() {
  const board = useBoard()
  return (
    <div className={styles.board}>
      {board.columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </div>
  )
}
