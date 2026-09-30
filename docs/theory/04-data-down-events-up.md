# 데이터는 아래로, 사건은 위로

## 한 줄 정의
상태는 한 곳(`App`)에만 있다. 아래 컴포넌트는 상태를 직접 바꾸지 않고 **"이런 일이 일어났다"를 함수 props로 위에 보고**한다. `setState`를 가진 `App`만 상태를 바꾼다.

```
App        ── board 데이터 ──▶  Board  ──▶  Column  ──▶  Card / AddCardForm
 ▲                                                              │
 └──────── "이 컬럼에 이 제목으로 카드 추가해줘" ◀───── 보고 ────┘
```

## 왜 이렇게 하나
- 상태를 바꾸는 코드가 `App` 한 곳에 모이니 "누가 언제 바꿨지"를 추적할 수 있다.
- 아래 컴포넌트는 "무슨 일이 일어났나"만 말하고 "그래서 데이터를 어떻게 바꿔야 하나"는 모른다. 그래서 재사용이 쉽다.

## 보고서는 올라가면서 한 칸씩 채워진다
`App.addCard`는 `(columnId, title)` 두 칸이 필요하다. 누가 뭘 아는지 보면:

| 컴포넌트 | 아는 것 | 모르는 것 |
|----------|---------|-----------|
| `AddCardForm` | 사용자가 친 제목 | 자기가 어느 컬럼 안에 있는지 |
| `Column` | 자기 id | 사용자가 뭘 칠지 |
| `App` | 전체 보드 | 어디서 무슨 일이 일어났는지 |

```
AddCardForm:  onAdd("빨래하기")                    ← 제목 칸만 채움
Column:       onAddCard(column.id, "빨래하기")     ← 컬럼 칸을 여기서 끼움
Board:        그대로 통과
App:          addCard("100", "빨래하기") → setBoard(...)
```

`Column`의 이 한 줄이 "제목 받아서, 내 id 끼워서, 위로 올린다":
```tsx
<AddCardForm onAdd={(title) => onAddCard(column.id, title)} />
```
삭제도 같은 모양. `Card`는 `onDelete(card.id)`만 하고, `Column`이 `(cardId) => onDeleteCard(column.id, cardId)`로 컬럼 id를 끼운다.

## 왜 `AddCardForm`에 `columnId`를 그냥 안 주나
줘도 된다. 하지만 그러면 `AddCardForm`이 "칸반 컬럼"의 존재를 알아야 한다.
지금 방식이면 `AddCardForm`은 "글자 받아서 위로 올리는 폼"일 뿐이라, 나중에 컬럼 추가 폼 등으로 그대로 재사용 가능.
**각 컴포넌트는 자기가 아는 것만 다룬다.**

## 함수는 값이다: "그대로 넘기기" vs "새로 만들어 넘기기"
```ts
const onDeleteCard = deleteCard   // 새 함수가 아니라 같은 함수에 이름표 하나 더
onDeleteCard("300", "5")          // deleteCard("300", "5") 와 동일
```
`<Board onDeleteCard={deleteCard} />`는 `Board` 안에서 이 대입이 일어난 것. 별명을 불러도 같은 사람이 온다.

| 코드 | 무슨 일 | 어디서 |
|------|---------|--------|
| `onDeleteCard={onDeleteCard}` | 같은 함수를 그대로 통과. 이름표만 추가 | `Board` |
| `onDelete={(cardId) => onDeleteCard(column.id, cardId)}` | **새 함수**를 만들어 넘김. 안에서 원래 함수 호출 | `Column` |

`Card`가 받은 `onDelete`는 `App.deleteCard`와 **다른 함수**다. `Column`이 만든 것이고, 호출되면 안에서 `deleteCard`를 호출한다.

## 포장지(화살표 함수로 감싸기) 패턴
| 상황 | 코드 | 이유 |
|------|------|------|
| onClick에 인자 있는 함수 | `onClick={() => onDelete(card.id)}` | React는 onClick을 이벤트로 호출하므로 인자를 직접 못 넣음 |
| 위에서 온 함수에 내 정보 끼우기 | `onAdd={(title) => onAddCard(column.id, title)}` | 아래는 모르고 나는 아는 값을 미리 채움 |

둘 다 "함수를 그대로 넘기지 않고, 원하는 인자로 호출하는 새 함수를 만들어 넘긴다".

## 이 방식의 비용 (3단계 동기)
`Board`는 `onDeleteCard`, `onAddCard`를 쓰지도 않으면서 받아서 넘기기만 한다. 함수가 늘수록 중간 컴포넌트의 props가 비대해진다. 이게 **prop drilling**이고, 3단계에서 Context로 푼다.

## 면접에서 이렇게 말한다
> "단방향 데이터 흐름입니다. 상태는 최상위에 두고 데이터는 props로 내려보내고, 하위 컴포넌트는 콜백으로 이벤트만 올립니다. 콜백은 올라가는 길에 각 계층이 아는 정보를 끼워 넣어서, 하위 컴포넌트가 자기 위치나 도메인을 몰라도 되게 했습니다. 대신 중간 컴포넌트가 안 쓰는 콜백을 전달만 하게 되는 prop drilling이 생겨서, 그건 Context로 해결했습니다."
