import { useState } from "react"
import type { Board as BoardType } from "./type"
import { Board } from "./components/Board"
import { initialBoard } from "./data"


function App() {
  const [board, setBoard] = useState<BoardType>(initialBoard);
  function deleteCard(columnId: string, cardId: string) {
    setBoard({
      ...board,
      columns: board.columns.map((column) => {
        if (column.id !== columnId) return column
        return {
          ...column,
          cards: column.cards.filter((card) => cardId !== card.id)
        }
      }),
    })
  }
  function addCard(columnId: string, title: string) {
    setBoard({
      ...board,
      columns: board.columns.map((column) => {
        if (column.id !== columnId) return column;
        return {
          ...column,
          cards: [...column.cards, { id: crypto.randomUUID(), title: title }]
        }
      }),
    })
  }
  function updateTitle(columnId: string, cardId: string, title: string) {
    setBoard({
      ...board,
      columns: board.columns.map((column) => {
        if (column.id !== columnId) return column;
        return {
          ...column,
          cards: column.cards.map((card) => {
            if (card.id !== cardId) return card       // 관계없는 카드는 그대로
            return { ...card, title }                  // 해당 카드만 title 바꾼 복사본
          })
        }
      })
    });
  }

  return (
    <div>
      <h1>Kanban</h1>
      <Board board={board} onDeleteCard={deleteCard} onAddCard={addCard} onUpdateTitle={updateTitle} />
    </div>
  )
}

export default App
