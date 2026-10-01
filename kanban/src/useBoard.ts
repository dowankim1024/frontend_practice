import { useContext } from "react"
import { BoardContext, BoardDispatchContext } from "./BoardContext"

// 와이파이 잡는 훅. Provider 밖에서 쓰면 null이라 바로 터뜨린다.
export function useBoard() {
  const board = useContext(BoardContext)
  if (board === null) throw new Error("useBoard는 BoardProvider 안에서만 쓸 수 있다")
  return board
}

export function useBoardDispatch() {
  const boardDispatch = useContext(BoardDispatchContext)
  if (boardDispatch === null)
    throw new Error("useBoardDispatch는 BoardProvider 안에서만 쓸 수 있다")
  return boardDispatch
}
