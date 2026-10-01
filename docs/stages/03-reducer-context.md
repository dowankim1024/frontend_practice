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
- [x] 2단계 완료 조건 전부 여전히 통과 (추가/삭제/수정/빈 제목/Escape/blur).
- [x] `Board`, `Column`의 props에 콜백이 하나도 없음.
- [x] `App`에 `setBoard`, `addCard` 등 상태 변경 함수가 없음. Provider로 감싸기만.
- [x] `boardReducer`가 `Math.random`, `Date`, `crypto` 등 부수효과를 안 씀.
- [x] `switch`에 `default` 처리가 있고, 알 수 없는 액션에 대해 TS가 `never`로 잡아줌.
- [x] `pnpm build`, `pnpm lint`, `pnpm format:check` 통과.

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
- 순서: 리듀서만 먼저(콜백 유지) → Context 파일 → App에서 props 제거 → 빨간 줄 따라 Board→Column→Card→AddCardForm.
- Claude가 직접 쓴 것(사용자 요청): 리듀서 틀, Context 틀, `Card`의 dispatch 두 줄, 파일 분리(`BoardContext.ts`/`BoardProvider.tsx`) + format.
- 사용자가 직접: 리듀서 세 case 몸통 옮기기, `App` useReducer 전환, `App`/`Board`/`Column` props 제거, `AddCardForm` dispatch 전환, 훅 파일 분리, UUID 밖으로.
- 리듀서를 Node에서 직접 호출해 "그냥 함수"임을 확인 (lesson 03 §4).
- 질문: 리듀서/Context가 뭔지, Context 역할, 전역 상태인지, useReducer가 뭔 뜻인지.

## 리뷰 결과 (Claude가 채움)

### 2026-10-01 리뷰 — 통과
- 브라우저: 삭제/추가/수정 정상. tsc·lint·format·build 전부 깨끗.
- 구조: `App`은 Provider로 감싸기만. `Board`/`Column`은 데이터 props만. `Card`/`AddCardForm`이 `useBoardDispatch()`로 직접 dispatch.
- 파일: `BoardContext.ts`(Context 객체), `BoardProvider.tsx`(Provider 컴포넌트), `useBoard.ts`(훅 둘). Fast Refresh 경고 때문에 셋으로 나눔.
- UUID는 `AddCardForm`에서 생성해 payload로. 리듀서 순수.

### 면접 문답 결과
1. **useReducer 언제** — "복잡할 때". 보완: 여러 액션이 같은 상태를 건드릴 때 / 다음 상태가 이전 상태에 의존할 때 / 로직을 컴포넌트 밖으로 빼 테스트하고 싶을 때. 신호: setX가 3개 이상이고 같은 객체를 만질 때.
2. **Context 분리** — "쓰는 곳이 달라서". 보완: **리렌더 범위**. board는 매번 새 객체, dispatch는 불변. 합치면 dispatch만 쓰는 컴포넌트도 board 변경마다 리렌더. (지금 앱에선 어차피 다 리렌더돼 효과 안 보임. 9단계 memo에서 체감.)
3. **Context vs 전역 상태** — 정확. "Provider 서브트리 안의 의존성 주입. 상태는 useReducer가 가짐."
4. **순수 리듀서** — "같은 입력 같은 출력". 보완: 테스트에서 `toEqual` 가능 / StrictMode가 리듀서를 두 번 호출해도 안전.
5. **exhaustive check** — 모름 → 설명. 액션 추가 후 case 누락을 컴파일 타임에 잡음. 5단계 `moveCard`에서 체감.

**Stage 3 종료.**
