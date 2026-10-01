import { useReducer, type ReactNode } from "react"
import { BoardContext, BoardDispatchContext } from "./BoardContext"
import { boardReducer } from "./boardReducer"
import { initialBoard } from "./data"

// 공유기를 켜는 컴포넌트. 상태는 여기 useReducer에 산다.
export function BoardProvider({ children }: { children: ReactNode }) {
  const [board, dispatch] = useReducer(boardReducer, initialBoard)
  return (
    <BoardContext.Provider value={board}>
      <BoardDispatchContext.Provider value={dispatch}>{children}</BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}
