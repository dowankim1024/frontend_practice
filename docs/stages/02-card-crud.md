# Stage 2 — 카드 CRUD

## 목표
카드를 추가·수정·삭제할 수 있다. **상태를 어디에 두고, 어떻게 바꾸고, 어떻게 아래로 내려보내는지**가 전부다.
이 단계 끝나면 "prop drilling이 왜 괴로운지" 몸으로 느껴야 한다. 그게 3단계의 동기가 된다.

## 요구사항
1. **상태 위치.** `App`에서 `useState<Board>(initialBoard)`로 보드 상태를 잡는다. `initialBoard`는 이제 초기값일 뿐이고, 실제 데이터는 상태다.
2. **추가.** 각 컬럼 하단에 제목 input + "추가" 버튼. 제목이 비어 있으면(공백만 있어도) 추가되지 않는다. 추가 후 input은 비워진다. 새 카드의 id는 `crypto.randomUUID()`.
3. **삭제.** 카드마다 삭제 버튼. 누르면 즉시 사라진다.
4. **제목 수정.** 카드 제목을 클릭하면 input으로 바뀐다. Enter 또는 blur로 확정, Escape로 취소(원래 제목으로 복원). 빈 제목으로 확정하면 원래 제목 유지.
5. **불변 업데이트.** 상태 객체나 배열을 직접 수정(`push`, `splice`, `obj.x = ...`)하지 않는다. `map`, `filter`, spread로 새 객체를 만든다.
6. **함수는 위에서 정의, 아래로 전달.** 상태를 바꾸는 함수(`addCard`, `deleteCard`, `updateCardTitle`)는 `App`에 정의한다. `Board` → `Column` → `Card`로 props로 내려보낸다. 중간 컴포넌트가 쓰지도 않는 함수를 받아서 넘기게 되는데, **그게 의도다**. 얼마나 귀찮은지 기억해둬라.
7. **폼은 별도 컴포넌트.** 카드 추가 폼은 `AddCardForm` 컴포넌트로 분리. input 값은 그 컴포넌트의 로컬 상태.

## 완료 조건
- [x] 세 동작(추가/삭제/수정) 모두 브라우저에서 동작.
- [x] 빈 제목 추가 불가, 빈 제목 수정 시 원복.
- [x] Escape로 수정 취소 시 원래 제목 복원.
- [x] `pnpm build`, `pnpm lint` 통과.
- [x] 콘솔 경고 없음 (특히 "controlled → uncontrolled" 경고).
- [x] `push`, `splice`, 직접 대입으로 상태를 바꾸는 코드 0줄.
- [x] `initialBoard`를 `App` 외 다른 곳에서 import하는 코드 없음.

## 힌트 (막히면 보기)
- 함수 props의 타입: `onDelete: (cardId: string) => void` 처럼 "무엇을 받고 무엇을 돌려주나"를 적는다.
- 컬럼 안의 카드를 바꾸려면 "어느 컬럼의 어느 카드인지" 두 id가 필요하다. 함수 시그니처를 먼저 정해라.
- 불변 업데이트의 기본형: `columns.map(col => col.id !== targetId ? col : { ...col, cards: ... })`. 바꿀 것만 새로 만들고 나머지는 그대로 반환.
- 제어 컴포넌트: `<input value={text} onChange={e => setText(e.target.value)} />`. `value`와 `onChange`는 항상 세트.
- 편집 모드 진입/탈출은 `Card` 안의 `useState<boolean>`. 편집 중 텍스트도 `Card` 안의 로컬 상태. 확정할 때만 위로 올린다.
- `onKeyDown`에서 `e.key === 'Enter'`, `'Escape'`.

## 스스로 답해볼 면접 질문 (리뷰 때 물어본다)
1. 왜 상태를 직접 수정하면 안 되는가? React는 어떻게 "바뀌었다"를 판단하는가?
2. 제어 컴포넌트와 비제어 컴포넌트의 차이는? 여기서는 왜 제어를 썼는가?
3. 편집 중 텍스트를 `Card` 로컬 상태로 두고 확정할 때만 올리는 것과, 키 입력마다 `App` 상태를 바꾸는 것의 차이는?
4. `AddCardForm`을 `Column` 안에 인라인으로 안 쓰고 분리한 이유는?
5. `useState`의 setter에 값 대신 함수(`setBoard(prev => ...)`)를 넘기는 건 언제 필요한가?

## 구현 메모 (Claude가 대화 기반으로 기록)
- 순서: 삭제 → 추가 → 수정. 삭제는 `App`부터 위→아래, 수정은 `Card`부터 아래→위(TS 에러를 할 일 목록으로).
- 막힌 지점: 콜백을 데이터 안에서 찾음(`board.onDeleteCard`) / `onClick={onDelete}`에 이벤트가 들어감 / `!!text.trim()` 조건 반전 / `div`에 onClick 붙여 버블링으로 편집 모드 꺼짐 / 수정을 filter+append로 해서 순서 바뀌고 description 유실.
- 개념 정리: theory/04 (단방향 흐름, 포장지 패턴, 함수는 값), troubleshooting/03 (버블링).

## 리뷰 결과 (Claude가 채움)

### 2026-09-30 1차 리뷰 — 동작 통과, 수정 1건 후 면접 문답

**브라우저 검증 (Claude가 직접 조작)**
- 삭제 / 추가 / 제목 수정 정상. 공백만 입력한 추가는 무시됨. 빈 제목 Enter 시 원복. Escape 취소 정상. blur 확정 정상. 수정 후 순서와 description 유지.

**잘한 것**
- 불변 업데이트 세 종류를 정확히 씀. 삭제=`filter`, 추가=`[...arr, new]`, 수정=`map` + `{ ...card, title }`.
- `Card`의 Enter/blur 로직을 `commit`으로 묶어 중복 제거.
- `AddCardForm`이 컬럼을 전혀 모름. 재사용 가능한 폼.
- `trim()`을 저장 시점에도 적용.

**반드시 고칠 것 (1건) — 콜백 시그니처 일관성**
세 콜백이 세 가지 다른 방식으로 id를 채우고 있다.

| 콜백 | Board | Column | 말단 |
|------|-------|--------|------|
| `onDeleteCard` | 통과 | `column.id` 끼움 | `Card`가 `card.id` 올림 |
| `onAddCard` | 통과 | `column.id` 끼움 | 제목만 |
| `onUpdateTitle` | **`column.id` 끼움** | **`card.id` 끼움** | 제목만 |

`Board`가 `onUpdateTitle`만 포장하고 나머지는 통과시키는 게 특히 어색하다. 규칙 하나로 통일:
- `Board`는 **전부 통과**. (Board는 아무것도 모른다.)
- `Column`이 **`column.id`와 `card.id`를 모두 끼운다.** (Column은 map 안에서 둘 다 안다.)
- 말단(`Card`, `AddCardForm`)은 **payload만** 올린다. `Card`는 `onDelete()`, `onUpdateTitle(title)`.

이렇게 하면 `Card`는 자기 id를 몰라도 되고, 나중에 콜백이 늘어도 같은 규칙으로 붙는다.

**지금 안 고쳐도 되는 것**
- `App`의 세 함수가 "컬럼 찾아서 교체"를 세 번 반복. 3단계 리듀서로 옮기면서 자연스럽게 정리됨.
- `setBoard({ ...board })`가 클로저의 `board`를 읽음. 면접 질문 5번과 연결. 3단계에서 리듀서로 가면 사라지는 문제.
- `AddCardForm`이 `<div>`+버튼 onClick. `<form onSubmit>`이면 input에서 Enter로 제출되고 시맨틱이 맞음. 원하면 지금 바꿔도 됨(`e.preventDefault()` 필요).
- 포맷팅: Prettier 세팅해둠. `pnpm format` 실행하면 세미콜론/줄바꿈 정리됨.

**면접 질문** — 아래 3개 답변 후 종료.
1. 왜 상태를 직접 수정하면 안 되는가? React는 어떻게 "바뀌었다"를 판단하는가?
2. 제어 컴포넌트가 뭔가? `value`와 `onChange`를 왜 세트로 써야 하는가?
3. `setBoard(prev => ...)` 형태는 언제 필요한가? 지금 코드에서 어떤 상황이면 문제가 되는가?
