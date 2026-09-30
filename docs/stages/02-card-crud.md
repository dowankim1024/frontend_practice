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
- [ ] 세 동작(추가/삭제/수정) 모두 브라우저에서 동작.
- [ ] 빈 제목 추가 불가, 빈 제목 수정 시 원복.
- [ ] Escape로 수정 취소 시 원래 제목 복원.
- [ ] `pnpm build`, `pnpm lint` 통과.
- [ ] 콘솔 경고 없음 (특히 "controlled → uncontrolled" 경고).
- [ ] `push`, `splice`, 직접 대입으로 상태를 바꾸는 코드 0줄.
- [ ] `initialBoard`를 `App` 외 다른 곳에서 import하는 코드 없음.

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

## 리뷰 결과 (Claude가 채움)
