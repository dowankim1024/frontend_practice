# Lesson 3 — useReducer + Context 리팩터

> 3단계 교재. 동작은 2단계와 똑같다. 구조만 바뀐다.

## 1. 과제
2단계의 prop drilling(`Board`가 쓰지도 않는 콜백 3개를 통과)을 없앤다.
상태 변경 로직을 `App`에서 리듀서(순수 함수)로 옮기고, `dispatch`를 Context로 배달해 말단이 직접 부른다.
리팩터 = 겉보기 동작 유지 + 내부 구조 변경. 2단계 완료 조건이 끝까지 전부 통과해야 한다.

## 2. 전체 그림

### 2단계 (before)
```
App(useState + 함수3개) ──board, 콜백3개──▶ Board ──콜백3개──▶ Column ──포장지──▶ Card
                                            (안 씀, 통과)       (id 끼움)
```

### 3단계 (after)
```
App
 └ <BoardProvider>              ← useReducer가 여기. board/dispatch를 Context에 실음
     └ Board: useBoard()         ← 와이파이로 board를 잡음. props 없음
         └ Column                ← card, columnId만 내려줌. 콜백 모름
             ├ Card: useBoardDispatch()         → dispatch({ type: "deleteCard", ... })
             └ AddCardForm: useBoardDispatch()  → dispatch({ type: "addCard", ... })
```

### 리듀서와 Context는 독립이다
- **리듀서**: "이전 상태 + 무슨 일(액션) → 다음 상태"를 계산하는 **순수 함수**. 상태를 **어떻게** 바꾸나를 한 곳에 모은다.
- **Context**: props를 거치지 않고 위에서 넣은 값을 아래 어디서든 꺼내는 **배달 통로**. 상태를 관리하지 않는다.
- 둘을 같이 쓰면 2단계 콜백 체인이 통째로 사라진다. 그래서 순서가 "리듀서 먼저, Context 나중".

### 파일 구조
```
src/
  type.ts             도메인 타입
  data.ts             초기 데이터
  boardReducer.ts     BoardAction 타입 + boardReducer (순수 함수)
  BoardContext.ts     Context 객체 2개 (컴포넌트 없음)
  BoardProvider.tsx   Provider 컴포넌트 (useReducer가 여기 삶)
  useBoard.ts         useBoard / useBoardDispatch 훅
  App.tsx             Provider로 감싸기만
  components/         Board, Column, Card, AddCardForm
```
세 파일로 나눈 이유: Vite Fast Refresh는 "컴포넌트만 export하는 파일"에서만 동작. Context 객체나 훅이 섞이면 lint 경고.

## 3. 최종 코드

### 3.1 `src/boardReducer.ts`
```ts
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
```

**해설**
- `BoardAction`은 **discriminated union**. `|`로 "셋 중 하나", `type` 필드로 구분. `switch (action.type)`의 각 `case` 안에서 TS가 `action`의 타입을 좁혀준다. `case "addCard"` 안에서 `action.cardId`는 되고 `action.title`도 되지만, `case "deleteCard"` 안에서 `action.title`은 빨간 줄.
- 각 case 몸통은 2단계 `App`의 세 함수에서 그대로 옮긴 것. 바뀐 건 `board → state`, `setBoard({...}) → return {...}` 둘뿐.
- **순수 함수.** 같은 `(state, action)`이면 항상 같은 결과. 그래서 `crypto.randomUUID()`를 안에 두지 않고 `action.cardId`로 받는다. 이유: ① 테스트에서 `expect(reducer(s, a)).toEqual(기대값)`을 쓸 수 있다 ② React StrictMode는 개발 중 리듀서를 두 번 호출하는데, 부수효과가 있으면 두 번 일어난다.
- `default`의 `const exhaustive: never = action` — "여기 오는 액션은 없어야 한다"는 선언. 나중에 `BoardAction`에 `moveCard`를 추가하고 case를 안 만들면 `action`이 `never`가 아니게 되어 **컴파일 에러**. "액션 추가하고 리듀서 수정 깜빡함"을 실행 전에 잡는다. `return exhaustive`는 안 쓰는 변수 에러를 피하려는 것(`never`는 어떤 타입에도 대입 가능).

### 3.2 `src/BoardContext.ts` / `src/BoardProvider.tsx` / `src/useBoard.ts`
```ts
// BoardContext.ts
import { createContext, type Dispatch } from "react"
import type { Board } from "./type"
import type { BoardAction } from "./boardReducer"

// 와이파이 공유기 두 대. 하나는 상태용, 하나는 dispatch용.
// 둘을 나누는 이유: board는 매 변경마다 새 객체라 자주 바뀌고, dispatch는 절대 안 바뀐다.
// 한 Context에 넣으면 dispatch만 쓰는 컴포넌트도 board가 바뀔 때마다 리렌더된다.
export const BoardContext = createContext<Board | null>(null)
export const BoardDispatchContext = createContext<Dispatch<BoardAction> | null>(null)
```
```tsx
// BoardProvider.tsx
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
```
```ts
// useBoard.ts
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
```

**해설**
- `createContext<Board | null>(null)` — 공유기. Provider로 안 감쌌을 때 기본값이 `null`. 훅에서 `null` 검사로 "Provider 없이 썼다"를 조용히 넘기지 않고 바로 터뜨린다.
- `BoardProvider`는 평범한 컴포넌트. 2단계 `App`에 있던 `useReducer`가 여기로 왔다. **상태는 Context가 아니라 이 컴포넌트의 `useReducer`에 산다.** `children`을 Provider 안에 그대로 그린다.
- `useReducer(boardReducer, initialBoard)`는 `[board, dispatch]`. `useState`와 모양이 같고, 바꾸는 함수에 **새 값** 대신 **액션**을 넣는다. `dispatch(액션)` → React가 `boardReducer(현재 board, 액션)` 호출 → 결과를 새 board로.
- **Context를 둘로 나눈 이유: 리렌더 범위.** Context 값이 바뀌면 그걸 구독하는 컴포넌트가 전부 리렌더. `board`는 카드 하나만 바꿔도 새 객체(매번 바뀜), `dispatch`는 앱이 사는 동안 불변. 한 Context에 넣으면 `dispatch`만 쓰는 `AddCardForm`도 보드 변경마다 리렌더. 나누면 안 흔들린다. (지금 앱에선 `Board→Column→Card`가 어차피 다 리렌더돼 효과가 안 보인다. 9단계 `memo`에서 체감.)
- `Dispatch<BoardAction>` = `(action: BoardAction) => void`. React 제공 타입.

### 3.3 `src/App.tsx`
```tsx
import { BoardProvider } from "./BoardProvider"
import { Board } from "./components/Board"

function App() {
  return (
    <BoardProvider>
      <div>
        <h1>Kanban</h1>
        <Board />
      </div>
    </BoardProvider>
  )
}

export default App
```

**해설**
- `App`은 Provider로 감싸기만. 상태도, 함수도 없다.
- `App`은 `useBoard()`를 **못 쓴다.** 자기가 Provider를 그리는 쪽이라 그 밖에 있다. 와이파이는 공유기 아래층부터 잡힌다.

### 3.4 `src/components/Board.tsx` / `Column.tsx`
```tsx
// Board.tsx
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
```
```tsx
// Column.tsx
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
```

**해설**
- `Board`는 props가 없다. `useBoard()`로 잡는다.
- `Column`은 `card`와 `columnId`만 내려준다. 콜백은 모른다.
- `columnId={column.id}` — 2단계의 "누가 id를 끼우나"가 이 형태로 돌아왔다. `Card`가 `dispatch`를 직접 부르니 자기 컬럼 id를 알아야 하고, 그걸 `Column`이 props로 준다.

### 3.5 `src/components/Card.tsx` / `AddCardForm.tsx`
```tsx
// Card.tsx
import { useState } from "react"
import type { Card as CardData } from "../type"
import styles from "./Card.module.css"
import { useBoardDispatch } from "../useBoard"

interface CardProps {
  card: CardData
  columnId: string
}

export function Card({ card, columnId }: CardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [text, setText] = useState<string>(card.title)
  const dispatch = useBoardDispatch()
  function commit() {
    if (!text.trim()) setText(card.title)
    else dispatch({ type: "updateCardTitle", columnId, cardId: card.id, title: text.trim() })
    setIsEditing(false)
  }
  return (
    <div className={styles.card}>
      {isEditing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit()
            }
            if (e.key === "Escape") {
              setText(card.title)
              setIsEditing(false)
            }
          }}
          onBlur={commit}
        />
      ) : (
        <h3 className={styles.title} onClick={() => setIsEditing(true)}>
          {card.title}
        </h3>
      )}
      {card.description && <p className={styles.description}>{card.description}</p>}
      <button onClick={() => dispatch({ type: "deleteCard", columnId, cardId: card.id })}>
        삭제
      </button>
    </div>
  )
}
```
```tsx
// AddCardForm.tsx
import { useState } from "react"
import { useBoardDispatch } from "../useBoard"

interface AddCardFormProps {
  columnId: string
}

export function AddCardForm({ columnId }: AddCardFormProps) {
  const [text, setText] = useState("")
  const dispatch = useBoardDispatch()

  function handleSubmit() {
    if (!text.trim()) return
    dispatch({ type: "addCard", columnId, title: text.trim(), cardId: crypto.randomUUID() })
    setText("")
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSubmit}>추가</button>
    </div>
  )
}
```

**해설**
- `const dispatch = useBoardDispatch()` — 와이파이 잡기.
- 2단계에서 `onUpdateTitle(text.trim())` 한 마디 하던 자리에서, 이제 "어느 컬럼, 어느 카드, 무슨 제목"을 액션 객체 하나에 담아 던진다. `columnId`는 props에서, `card.id`는 원래 갖고 있던 것.
- 삭제 버튼은 `dispatch`에 인자를 넣어야 하니 포장지 `() => ...`가 다시 붙는다.
- `AddCardForm`이 `cardId: crypto.randomUUID()`를 만든다. 부수효과는 dispatch하는 쪽에서. 이제 이 컴포넌트는 "칸반 컬럼"을 안다(`columnId`). 2단계의 "칸반을 모르는 폼"과 트레이드오프.

## 4. 리듀서는 그냥 함수다 — React 없이 돌려보기
Node에서 리듀서를 직접 호출한 결과:
```ts
const s1 = boardReducer(initialBoard, { type: "deleteCard", columnId: "100", cardId: "1" })
const s2 = boardReducer(s1, { type: "addCard", columnId: "300", cardId: "x", title: "빨래하기" })
const s3 = boardReducer(s2, { type: "updateCardTitle", columnId: "200", cardId: "3", title: "놀기!!" })
```
```
0. 시작         To Do: [공부하기, 잠자기]  |  In Progress: [놀기, 먹기]    |  Done: [살기, 태어나기]
1. 공부하기 삭제 To Do: [잠자기]          |  In Progress: [놀기, 먹기]    |  Done: [살기, 태어나기]
2. Done에 추가   To Do: [잠자기]          |  In Progress: [놀기, 먹기]    |  Done: [살기, 태어나기, 빨래하기]
3. 놀기 수정     To Do: [잠자기]          |  In Progress: [놀기!!, 먹기]  |  Done: [살기, 태어나기, 빨래하기]
원본은 그대로?   To Do: [공부하기, 잠자기]  |  ...                          (initialBoard 변화 없음)
s1 === s2 ?     false                                                   (매번 새 객체)
```
- 보드 넣고 액션 넣으면 새 보드. React도 훅도 없이 돌아간다.
- 이전 결과를 다음 입력으로 넣으면 이어진다. 앱에서 클릭 세 번 = React가 이걸 세 번 해주는 것.
- 원본은 안 건드린다. 참조가 매번 다르다(2단계 Q1).
- 8단계 테스트는 이 코드를 `expect(...)`로 감싸는 것.

**`useReducer`가 하는 일 한 줄:** 현재 보드를 기억하고 있다가, `dispatch(액션)`이 오면 `boardReducer(현재보드, 액션)`을 호출하고, 결과를 새 현재 보드로 바꿔치기한 뒤 리렌더.

## 5. 대화에서 나온 질문과 답

**Q. 리듀서랑 Context가 뭔가?**
§2. 리듀서 = 2단계 `App`의 세 함수를 하나로 합친 순수 함수. Context = props 안 거치는 배달 통로. 서로 독립.

**Q. `useReducer`가 무슨 뜻인지 모르겠다.**

| | `useState` | `useReducer` |
|---|---|---|
| 돌려주는 것 | `[값, 바꾸는 함수]` | `[값, 바꾸는 함수]` 똑같음 |
| 바꾸는 함수에 넣는 것 | 새 값 `setBoard(새보드)` | 액션 `dispatch({ type, ... })` |
| 새 값을 누가 계산 | 내가 | `boardReducer`가 |

"`useState`인데, 새 값을 내가 만드는 대신 무슨 일인지만 말하면 리듀서가 만들어주는 버전."

**Q. Context 역할이 뭔가?**
"props를 거치지 않고, 위에서 한 번 넣어둔 값을 아래 어디서든 꺼내 쓰게 해주는 통로." 상태 관리는 안 한다. 택배(props) vs 건물 와이파이(Context). 바로 아래 자식한테 주는 건 그냥 props가 맞다.

**Q. 전역 상태는 아닌 거지?**
아니다. ① Provider 서브트리 안에서만 잡힌다 ② Context 자체는 상태를 안 갖는다(상태는 `BoardProvider`의 `useReducer`에). Redux/Zustand는 React 밖 store에 상태가 있고 앱 어디서든 접근.

| | Context | Redux / Zustand |
|---|---|---|
| 상태가 사는 곳 | Provider 컴포넌트 안 | React 밖 store |
| 접근 범위 | Provider 서브트리 | 앱 어디서든 |
| 본질 | 값 배달(의존성 주입) | 저장소 |

**Q. 리듀서 틀, Context 틀 잡아달라.**
§3.1, §3.2. 몸통은 사용자가 2단계 코드에서 옮김.

**Q. `App`에서 `board`, `dispatch`가 빨간 줄인데 어떻게 푸나?**
`App`에 가져오는 게 아니라 **`App`이 더 이상 아무것도 안 넘기면** 풀린다. 그러면 빨간 줄이 `Board`로 넘어가고, 거기서 `useBoard()`. 빨간 줄을 위에서 아래로 밀어낸다.

## 6. 삽질 기록
| 증상 | 원인 | 해결 |
|------|------|------|
| `_exhaustive` never read | tsconfig `noUnusedLocals` | `return exhaustive` (never는 어디든 대입 가능) |
| `useReducer` 썼는데 import 안 바꿈, `setBoard` 이름으로 `dispatch` 쓰려 함 | 개념 전환 중 | `[board, dispatch] = useReducer(...)` |
| lint: Fast refresh only works when a file only exports components | 훅/Context 객체가 컴포넌트와 한 파일 | `BoardContext.ts` / `BoardProvider.tsx` / `useBoard.ts` 셋으로 분리 |
| dev 서버 꺼짐 | 터미널 종료 | `.claude/launch.json`으로 재시작 |

## 7. 팁
- **리팩터는 한 번에 하나.** 리듀서 도입(콜백 유지) → 동작 확인 → Context 도입. 둘을 동시에 바꾸면 뭐가 깨졌는지 못 찾는다.
- **빨간 줄 밀어내기.** `App`에서 props를 지우면 에러가 `Board`로, `Board`에서 지우면 `Column`으로. TS가 다음 파일을 가리킨다.
- **리듀서 디버깅은 Node에서.** React 없이 `boardReducer(state, action)` 호출해 결과를 찍어보면 가장 빠르다.
- **Context 값은 "안 바뀌는 것"과 "자주 바뀌는 것"을 나눠 싣는다.**
- **순수성 체크:** 리듀서 안에 `Math.random`, `Date.now`, `crypto`, `fetch`, `console.log`가 있으면 밖으로.

## 8. 면접 문답 (실제 답변 + 교정)

**Q1. `useState`로 충분한데 왜 `useReducer`를 쓰나? 언제 갈아타나?**
답변: "상태 변경 로직이 복잡할 때."
교정: 맞지만 "복잡"을 구체화. ① 여러 액션이 같은 상태를 건드릴 때 ② 다음 상태가 이전 상태에 의존할 때(함수형 setter 문제 소멸) ③ 로직을 컴포넌트 밖으로 빼서 테스트하고 싶을 때. 갈아타는 신호: `setX`가 3개 이상이고 같은 객체를 만지기 시작할 때.

**Q2. 상태와 dispatch를 왜 별도 Context로 나누나?**
답변: "쓰는 곳이 달라서?"
교정: 이유는 **리렌더 범위**. Context 값이 바뀌면 구독자 전부 리렌더. `board`는 매번 새 객체, `dispatch`는 불변. 합치면 `dispatch`만 쓰는 컴포넌트도 `board` 변경마다 리렌더. 현재 앱은 어차피 다 리렌더돼 안 보이고, 9단계 `memo`에서 체감.

**Q3. Context는 전역 상태 라이브러리와 뭐가 다른가?**
답변: "자기 자식 트리에서만 쓸 수 있고, 상태가 외부 저장소에 있는 게 아니라 reducer에 있다. 중간의 의존성 주입을 편하게 해주는 것."
교정: 정확. 모범답안: "Context는 저장소가 아니라 Provider 서브트리 안에서 값을 배달하는 의존성 주입 도구고, 상태 자체는 useReducer가 가집니다. 한계는 값이 바뀌면 구독자가 전부 리렌더되고 선택적 구독이 안 된다는 점입니다."

**Q4. 리듀서가 순수해야 하는 이유는?**
답변: "같은 입력에 같은 값 나와야 해서?"
교정: 핵심 맞음. 따라오는 것: ① 테스트에서 `toEqual`로 기대값 비교 가능 ② StrictMode가 리듀서를 두 번 호출해도 안전. 그래서 `crypto.randomUUID()`를 dispatch 쪽으로 뺐다.

**Q5. exhaustive check(`never`)가 뭘 막아주나?**
답변: 모름.
설명: 액션 타입을 추가하고 `case`를 빼먹었을 때, `default`의 `action`이 `never`가 아니게 되어 컴파일 에러. "액션 추가 후 리듀서 수정 누락"을 실행 전에 잡는다. 5단계 `moveCard` 추가 시 체감.
