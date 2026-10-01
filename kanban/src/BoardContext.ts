import { createContext, type Dispatch } from "react"
import type { Board } from "./type"
import type { BoardAction } from "./boardReducer"

// 와이파이 공유기 두 대. 하나는 상태용, 하나는 dispatch용.
// 둘을 나누는 이유: board는 매 변경마다 새 객체라 자주 바뀌고, dispatch는 절대 안 바뀐다.
// 한 Context에 넣으면 dispatch만 쓰는 컴포넌트도 board가 바뀔 때마다 리렌더된다.
export const BoardContext = createContext<Board | null>(null)
export const BoardDispatchContext = createContext<Dispatch<BoardAction> | null>(null)
