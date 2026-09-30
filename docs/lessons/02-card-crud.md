# Lesson 2 — 카드 CRUD

> 2단계 교재. 코드는 1차 리뷰 시점 기준. 콜백 시그니처 통일 후 §3.2가 갱신된다.

## 1. 과제
카드 추가·삭제·제목 수정. 상태는 `App`의 `useState<Board>` 하나. 상태를 바꾸는 함수는 `App`에 정의해 `Board → Column → Card`로 내려보낸다. 불변 업데이트만 사용. 폼은 `AddCardForm`으로 분리.

## 2. 전체 그림: 데이터는 아래로, 사건은 위로
```
App(상태) ── board ──▶ Board ──▶ Column ──▶ Card / AddCardForm
  ▲                                              │
  └──── "이 컬럼의 이 카드 지워줘" ◀── 콜백 ────┘
```
- 상태는 `App`에만 있다. 아래 컴포넌트는 상태를 못 바꾼다.
- 아래 컴포넌트는 "이런 일이 일어났다"를 **함수 props**로 위에 보고한다.
- 보고서는 올라가는 길에 각 층이 아는 정보(컬럼 id, 카드 id)가 채워진다.

누가 뭘 아는가:

| 컴포넌트 | 아는 것 | 모르는 것 |
|----------|---------|-----------|
| `AddCardForm` | 사용자가 친 제목 | 자기가 어느 컬럼에 있는지 |
| `Card` | 자기 카드 데이터 | 자기가 어느 컬럼에 있는지 |
| `Column` | 자기 id, 자기 카드들 | 사용자가 뭘 칠지 |
| `App` | 전체 보드 | 어디서 무슨 일이 났는지 |

## 3. 최종 코드

### 3.1 `src/App.tsx` — 상태와 세 가지 변경 함수
```tsx
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
```

**해설**
- `useState<BoardType>(initialBoard)` — `initialBoard`는 이제 초기값일 뿐. 진짜 데이터는 `board` 상태.
- 세 함수 모두 같은 뼈대: `setBoard({ ...board, columns: board.columns.map(...) })`. "관계없는 컬럼은 그대로 반환, 해당 컬럼만 새 객체로".
- **불변 업데이트 3종:**
  - 삭제 = `filter` (해당 id가 아닌 것만 남김)
  - 추가 = `[...column.cards, 새카드]` (기존 뒤에 붙인 새 배열)
  - 수정 = `map` + `{ ...card, title }` (해당 카드만 복사본, **자리 유지**)
- spread(`...`)가 있는 곳마다 "복사본을 만든다". 원본 `board`, `column`, `cards`는 하나도 안 건드린다.
- 새 카드 id는 `crypto.randomUUID()`.
- ⚠ `setBoard({ ...board })`가 클로저의 `board`를 읽는다. 지금은 문제없지만 Q3 참고.

### 3.2 콜백 체인: `Board` → `Column` → `Card`
```tsx
// Board.tsx
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
      {board.columns.map((column) => <Column key={column.id} column={column} onDeleteCard={onDeleteCard} onAddCard={onAddCard} onUpdateTitle={(cardId, title) => onUpdateTitle(column.id, cardId, title)} />)}
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
  onDeleteCard: (columnId: string, cardId: string) => void
  onAddCard: (columnId: string, title: string) => void
  onUpdateTitle: (cardId: string, title: string) => void
}
export function Column({ column, onDeleteCard, onAddCard, onUpdateTitle }: ColumnProps) {
  return (
    <div className={styles.column}>
      <h2 className={styles.title}>{column.title}</h2>
      {column.cards.map((card) => <Card key={card.id} card={card} onDelete={() => onDeleteCard(column.id, card.id)} onUpdateTitle={(title) => onUpdateTitle(card.id, title)} />)}
      <AddCardForm onAdd={(title) => onAddCard(column.id, title)} />
    </div>
  )
}
```

**해설: 함수는 값이다**
```ts
const onDeleteCard = deleteCard   // 새 함수가 아니라 같은 함수에 이름표 하나 더
```
`<Board onDeleteCard={deleteCard} />`는 `Board` 안에서 이 대입이 일어난 것. `Board`가 `onDeleteCard={onDeleteCard}`로 넘기면 `Column` 안에서도 같은 함수.

**해설: 포장지(화살표로 감싸기)**
```tsx
onDelete={(cardId) => onDeleteCard(column.id, cardId)}
```
"`cardId`를 받아서, 내 `column.id`를 끼워서, 위로 올리는 **새 함수**". `Card`는 자기 컬럼을 모르니 `Column`이 대신 채운다. 두 칸짜리 함수를 한 칸짜리로 바꾸는 어댑터.

| 코드 | 무슨 일 |
|------|---------|
| `onDeleteCard={onDeleteCard}` | 같은 함수 그대로 통과 |
| `onDelete={(cardId) => onDeleteCard(column.id, cardId)}` | 새 함수. 안에서 원래 함수 호출 |

**해설: 시그니처 일관성 (리뷰 지적)**
1차 리뷰 시점엔 세 콜백이 각각 다른 층에서 id를 끼웠다. 통일 규칙:
- `Board`는 전부 통과 (아무것도 모른다)
- `Column`이 `column.id`와 `card.id`를 모두 끼운다 (map 안에서 둘 다 안다)
- 말단은 payload만 (`Card`: `onDelete()`, `onUpdateTitle(title)`)

시니어 원칙 세 가지: ① 말단은 모르는 정보를 요구받지 않는다 ② id는 map 도는 곳에서 끼운다 ③ 중간 층은 가능하면 통과(포장할수록 새 함수가 생겨 9단계 memo에 불리). ②와 ③이 `Board`에서 충돌하면 "두 id를 모두 아는 가장 아래 층에서 한 번에"로 푼다.

### 3.3 `src/components/Card.tsx` — 편집 모드
```tsx
import { useState } from "react";
import type { Card as CardData } from "../type"
import styles from "./Card.module.css"

interface CardProps {
  card: CardData
  onDelete: () => void
  onUpdateTitle: (title: string) => void
}

export function Card({ card, onDelete, onUpdateTitle }: CardProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [text, setText] = useState<string>(card.title);
  function commit() {
    if (!text.trim()) setText(card.title);
    else onUpdateTitle(text.trim());
    setIsEditing(false);
  }
  return (
    <div className={styles.card}>
      {isEditing ? <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
          }
          if (e.key === "Escape") {
            setText(card.title);
            setIsEditing(false);
          }
        }}
        onBlur={commit}
      /> : <h3 className={styles.title} onClick={() => setIsEditing(true)}>{card.title}</h3>}
      {card.description && <p className={styles.description}>{card.description}</p>}
      <button onClick={onDelete}>삭제</button>
    </div>
  )
}
```

**해설**
- 제목이 두 개 있다. `card.title`(부모가 준 진짜 값, `<h3>`에 보임)과 `text`(편집용 임시 값, `<input>`에 보임).
- 편집 모드를 닫을 땐 **항상 `text`를 `card.title`에 맞춰놓고** 닫는다. 안 그러면 다음에 열 때 낡은 값이 남는다. 확정이 성공하면 부모가 `card.title`을 바꿔주니 어차피 같아지고, 거부(빈 제목)되면 원복.
- `onClick`은 `div`가 아니라 `<h3>`에. `div`에 두면 input 클릭이 **버블링**으로 div까지 올라가 편집 모드가 꺼진다.
- 토글(`!isEditing`)이 아니라 `setIsEditing(true)`. 진입과 종료는 다른 이벤트 담당.
- `autoFocus` — 마운트 시 포커스. JSX라 카멜케이스.
- `onKeyDown`의 `e.key`로 `"Enter"`/`"Escape"` 판별. `onClick`과 같은 종류의 이벤트 핸들러.
- `onBlur={commit}` — 포커스를 잃으면 확정. Enter와 같은 일이라 `commit` 함수로 묶어 중복 제거. `commit`은 인자를 안 받으니 포장지 없이 그대로 넘겨도 된다.
- 확정할 때만 위로 올린다. 키 입력마다 `App` 상태를 바꾸면 매 타이핑에 보드 전체가 리렌더된다.

### 3.4 `src/components/AddCardForm.tsx` — 제어 컴포넌트
```tsx
import { useState } from "react"

interface AddCardFormProps {
  onAdd: (title: string) => void
}

export function AddCardForm({ onAdd }: AddCardFormProps) {
  const [text, setText] = useState("")

  function handleSubmit() {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
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
- **제어 컴포넌트:** `value={text}` + `onChange`가 세트. React 상태가 input 값의 유일한 출처. `value`만 주고 `onChange`를 안 주면 타이핑이 안 되고 경고가 난다.
- `!text.trim()` — "공백 제거 후 비어 있으면 나간다". `!!`로 쓰면 반대가 되어 제목이 있을 때 나가고 없을 때 추가한다(실제로 그렇게 됐었음).
- 이 컴포넌트는 "칸반"을 모른다. 글자 받아서 `onAdd`로 올릴 뿐. 그래서 재사용 가능.
- 개선 여지: `<form onSubmit>`으로 바꾸면 input에서 Enter 제출이 되고 시맨틱이 맞다. `e.preventDefault()` 필요.

## 4. 흐름 추적 예시: "Done"(id 300)의 "살기"(id 5) 삭제
```
Card:    onDelete("5")                       ← 버튼 onClick 포장지가 card.id를 넣음
Column:  onDeleteCard("300", "5")            ← column.id 끼움
Board:   onDeleteCard("300", "5")            ← 그대로 통과
App:     deleteCard("300", "5")
         → setBoard(300번 컬럼의 cards에서 id 5를 filter한 새 보드)
         → 리렌더
```

## 5. 대화에서 나온 질문과 답

**Q. 상태 만들었는데 그 다음 뭘 해야 하나?**
한 기능(삭제)을 끝까지 뚫는다. ① `App`에 함수 시그니처만 정의 ② `Board`에 넘기고 Props에 타입 추가 ③ `Board`→`Column` 통과 ④ `Column`→`Card`에 id 끼워서 ⑤ `Card`에 버튼. 여기까지 되면 몸통 채우기.

**Q. `board.onDeleteCard`라고 썼는데 에러가 난다.**
콜백은 데이터 안에 없다. props의 **별개 키**다. `{ board, onDeleteCard }: BoardProps`로 둘 다 꺼내야 한다.

**Q. `onClick={onDelete}`가 왜 안 되나?**
React는 `onClick`을 마우스 이벤트로 호출한다. `onDelete`는 문자열을 원한다. `onClick={() => onDelete(card.id)}`로 포장.

**Q. `(title) => onAddCard(column.id, title)` 자체가 이해가 안 된다.**
§2와 §3.2 해설. "제목 받아서, 내 id 끼워서, 위로 올리는 새 함수".

**Q. `onDeleteCard`가 곧 `deleteCard`라는 게 헷갈린다.**
함수도 값. `const a = f`면 `a`와 `f`는 같은 함수. props로 넘기는 것도 이 대입. 반면 화살표로 감싼 건 **새 함수**.

**Q. `onUpdateTitle`엔 왜 cardId를 안 올리나?**
`Column`이 map 안에서 `card.id`를 이미 알기 때문에 대신 끼울 수 있다. 삭제도 똑같이 할 수 있었다. 어느 쪽이든 되지만 **섞지 말 것**.

**Q. 수정 기능은 어느 파일부터?**
잘 모르는 쪽부터. 체인은 아니까 새 개념(편집 모드)이 있는 `Card`부터. 로컬 상태로 토글만 먼저 만들고, `CardProps`에 콜백을 추가하면 TS 빨간 줄이 `Column`→`Board`→`App` 순으로 다음 할 일을 가리킨다.

**Q. blur가 뭔가?**
포커스를 잃는 것. 편집 중 다른 곳을 클릭하면 저장하고 닫히게 하려고 `onBlur`에 `commit`.

**Q. "text가 안 돌아간다"는 게 무슨 뜻?**
§3.3 해설. `card.title`과 `text`가 따로 놀아서, Enter로 닫아도 `text`에 낡은 값이 남는 문제.

## 6. 삽질 기록
| 증상 | 원인 | 해결 |
|------|------|------|
| `board.onDeleteCard` 에러 | 콜백을 데이터에서 찾음 | props에서 구조분해 |
| `onClick={onDelete}` 타입 에러 | 이벤트가 인자로 들어감 | 화살표 포장 |
| 추가 버튼이 반대로 동작 | `!!text.trim()` 조건 반전 | `!text.trim()` |
| 편집 모드 진입 즉시 꺼짐, 포커스 불가 | `div`의 onClick이 input 클릭 버블링을 받아 토글 | `h3`로 이동, `setIsEditing(true)` |
| 수정하면 카드가 맨 아래로 가고 description 사라짐 | `filter`+append = 삭제 후 추가 | `map` + `{ ...card, title }` |
| `updateTitle` 몸통에서 `cards:` 뒤가 빔 | 문법 에러 `Expression expected` | 위 map 패턴 |

## 7. 팁
- **한 기능을 끝까지:** 삭제 하나를 App→Card까지 완주하면 나머지는 같은 패턴 반복.
- **TS 에러 = 할 일 목록:** 아래에서 위로 갈 때 빨간 줄이 다음 파일을 가리킨다.
- **조건문은 소리 내 읽기:** `!`가 들어간 조건은 "이게 참일 때 뭘 하나"를 말로 옮겨 반대로 쓴 걸 잡는다.
- **불변 업데이트 3종 암기:** 삭제 `filter`, 추가 `[...arr, x]`, 수정 `map` + spread.
- **부모에 클릭 핸들러 + 자식이 인터랙티브 = 버블링 의심.**
- **포맷팅은 도구에:** `pnpm format` (Prettier).

## 8. 면접 문답
_(답변 후 채움)_
1. 왜 상태를 직접 수정하면 안 되는가? React는 어떻게 "바뀌었다"를 판단하는가?
2. 제어 컴포넌트가 뭔가? `value`와 `onChange`를 왜 세트로 써야 하는가?
3. `setBoard(prev => ...)` 형태는 언제 필요한가? 지금 코드에서 어떤 상황이면 문제가 되는가?
