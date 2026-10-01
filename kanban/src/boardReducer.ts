import type { Board } from "./type"

export type BoardAction =
  | { type: "addCard"; columnId: string; title: string; cardId: string }
  | { type: "deleteCard"; columnId: string; cardId: string }
  | { type: "updateCardTitle"; columnId: string; cardId: string; title: string }

export function boardReducer(state: Board, action: BoardAction): Board {
  switch (action.type) {
    case "addCard": {
      // App.addCard 몸통. board → state, setBoard({...}) → return {...}
      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id !== action.columnId) return column
          return {
            ...column,
            cards: [...column.cards, { id: action.cardId, title: action.title }],
          }
        }),
      }
    }
    case "deleteCard": {
      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id !== action.columnId) return column
          return {
            ...column,
            cards: column.cards.filter((card) => action.cardId !== card.id),
          }
        }),
      }
    }
    case "updateCardTitle": {
      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id !== action.columnId) return column
          return {
            ...column,
            cards: column.cards.map((card) => {
              if (card.id !== action.cardId) return card
              return { ...card, title: action.title }
            }),
          }
        }),
      }
    }
    default: {
      const exhaustive: never = action
      return exhaustive
    }
  }
}
