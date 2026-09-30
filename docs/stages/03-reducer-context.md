# Stage 3 — useReducer + Context 리팩터

## 목표
동작은 하나도 안 바뀐다. **구조만 바꾼다.** 2단계에서 `Board`가 쓰지도 않는 콜백 3개를 통과시켰던 prop drilling을 없애고, 상태 변경 로직을 `App`에서 리듀서로 옮긴다.
리팩터의 정의: 겉보기 동작을 유지하면서 내부 구조를 바꾸는 것. 2단계 완료 조건이 끝까지 전부 통과해야 한다.

## 요구사항
1. **리듀서.** `src/boardReducer.ts`에 `boardReducer(state: Board, action: BoardAction): Board`. 액션은 3개: 카드 추가 / 삭제 / 제목 수정. `App`에 있던 세 함수의 몸통이 여기로 옮겨진다.
2. **액션 타입.** `BoardAction`은 **discriminated union**. `type` 필드로 구분하고, 각 액션이 필요한 payload만 갖는다.
   ```ts
   type BoardAction =
     | { type: "addCard"; columnId: string; title: string }
     | { type: "deleteCard"; ... }
     | { type: "updateCardTitle"; ... }
   ```
   `switch (action.type)`에서 각 case 안에서 TS가 payload 타입을 좁혀주는 걸 확인할 것.
3. **Context.** `src/BoardContext.tsx`에 Context + Provider 컴포넌트. `App`은 `useReducer`로 상태를 잡고 Provider로 감싼다. `Board`, `Column`, `Card`, `AddCardForm`은 **콜백 props를 전부 제거**하고 Context에서 `dispatch`를 꺼내 쓴다.
4. **Context 분리.** 상태(`board`)와 `dispatch`를 **서로 다른 Context**에 담는다. 이유를 설명할 수 있어야 한다(힌트: `dispatch`는 절대 안 바뀐다).
5. **커스텀 훅.** `useBoard()`, `useBoardDispatch()`. Provider 밖에서 쓰면 명확한 에러를 던진다.
6. **`Card`에 `columnId` 전달.** 콜백이 사라지면 `Card`가 `dispatch({ type: "deleteCard", columnId, cardId })`를 직접 부르므로 자기 컬럼 id를 알아야 한다. `Column`이 `columnId` prop으로 넘긴다. 2단계에서 "누가 id를 끼우나" 고민이 이 형태로 돌아온다.
7. **리듀서는 순수 함수.** `crypto.randomUUID()` 같은 부수효과는 리듀서 안이 아니라 dispatch하는 쪽에서 만들어 payload로 넣는다. 이유를 설명할 수 있어야 한다.

## 완료 조건
- [ ] 2단계 완료 조건 전부 여전히 통과 (추가/삭제/수정/빈 제목/Escape/blur).
- [ ] `Board`, `Column`의 props에 콜백이 하나도 없음.
- [ ] `App`에 `setBoard`, `addCard` 등 상태 변경 함수가 없음. `useReducer` + Provider만.
- [ ] `boardReducer`가 `Math.random`, `Date`, `crypto` 등 부수효과를 안 씀.
- [ ] `switch`에 `default` 처리가 있고, 알 수 없는 액션에 대해 TS가 `never`로 잡아줌.
- [ ] `pnpm build`, `pnpm lint`, `pnpm format:check` 통과.

## 순서 추천
1. `boardReducer.ts`만 먼저. `App`의 세 함수 몸통을 옮기고, `App`에서 `useState` → `useReducer`로 바꿔 **콜백은 그대로 둔 채** 동작 확인. (리듀서 도입만 먼저.)
2. `BoardContext.tsx` 만들고 `App`을 Provider로 감싸기. 아직 아무도 안 씀.
3. 말단(`Card`)부터 콜백 대신 `useBoardDispatch()` 사용. 그 콜백 prop 제거 → TS 에러가 `Column`, `Board`, `App`을 순서대로 가리킴 → 따라가며 제거.
4. `AddCardForm`도 같은 방식.
5. 마지막에 상태/dispatch Context 분리.

## 힌트 (막히면 보기)
- `useReducer(boardReducer, initialBoard)`는 `[board, dispatch]`를 반환.
- `createContext<T | null>(null)`로 만들고, 커스텀 훅에서 `null`이면 `throw new Error("...")`.
- Provider는 `children`을 받는 컴포넌트. `children: React.ReactNode`.
- discriminated union의 `default:` 에서 `const _exhaustive: never = action`을 쓰면 액션 추가를 빼먹었을 때 컴파일 에러.
- 리듀서 안에서 `state`를 직접 수정하지 않는 건 2단계와 동일.

## 스스로 답해볼 면접 질문
1. `useState`로 충분한데 왜 `useReducer`를 쓰나? 언제 갈아타나?
2. 상태와 dispatch를 왜 별도 Context로 나누나? 안 나누면 뭐가 리렌더되나?
3. Context는 전역 상태 라이브러리(Redux, Zustand)와 뭐가 다른가? Context의 한계는?
4. 리듀서가 순수해야 하는 이유는? 테스트와 어떤 관계인가?
5. discriminated union에서 `never`를 쓰는 exhaustive check가 뭘 막아주나?

## 구현 메모 (Claude가 대화 기반으로 기록)

## 리뷰 결과 (Claude가 채움)
