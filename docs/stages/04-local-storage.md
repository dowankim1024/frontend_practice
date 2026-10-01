# Stage 4 — localStorage 영속화

## 목표
새로고침해도 보드가 유지된다. 핵심은 **"상태를 바깥 세계(브라우저 저장소)와 동기화"**하는 React의 방식, 즉 `useEffect`와 커스텀 훅이다.
3단계 회고에서 "이번엔 틀 없이 먼저 시도"라고 했다. 힌트는 막혔을 때만 본다.

## 요구사항
1. **저장.** `board`가 바뀔 때마다 `localStorage`에 JSON으로 저장한다. 키 이름은 상수로 (`"kanban:board"` 같은).
2. **복원.** 앱이 켜질 때 `localStorage`에 저장된 보드가 있으면 그걸 초기 상태로, 없으면 `initialBoard`.
3. **복원은 lazy init으로.** `useReducer`의 세 번째 인자(초기화 함수)를 쓴다. 렌더마다 `localStorage`를 읽으면 안 된다. 왜 안 되는지 설명할 수 있어야 한다.
4. **깨진 데이터 방어.** 저장된 값이 JSON이 아니거나 모양이 이상하면(수동으로 localStorage를 망가뜨려 테스트) 앱이 죽지 않고 `initialBoard`로 돌아간다.
5. **커스텀 훅으로 분리.** 저장/복원 로직이 `BoardProvider` 안에 흩어지지 않게 `usePersistedReducer` 같은 훅으로 뺀다. 시그니처는 네가 설계한다. 힌트: `useReducer`와 같은 모양으로 반환하면 `BoardProvider`는 한 줄만 바뀐다.
6. **"초기화" 버튼.** 보드를 `initialBoard`로 되돌리는 `resetBoard` 액션 추가. 3단계 exhaustive check가 실제로 작동하는지 이때 확인한다(case를 안 쓰면 컴파일 에러가 나야 한다).

## 완료 조건
- [ ] 카드를 바꾸고 새로고침하면 그대로.
- [ ] DevTools → Application → Local Storage에서 키와 JSON이 보임.
- [ ] 저장된 값을 `"garbage"`로 바꾸고 새로고침해도 앱이 뜸(초기 보드로).
- [ ] `localStorage.getItem`이 **마운트 시 한 번만** 호출됨. `console.log`로 확인 후 제거.
- [ ] `localStorage.setItem`이 **board가 바뀔 때만** 호출됨. 제목 편집 모드 토글(`isEditing`)로는 호출되지 않아야 함.
- [ ] 초기화 버튼이 동작하고, `resetBoard` case를 잠시 주석 처리하면 `never` 에러가 남.
- [ ] 2·3단계 완료 조건 전부 유지. build/lint/format 통과.

## 힌트 (막히면 보기)
- `useEffect(() => { ... }, [board])` — 의존성 배열에 `board`를 넣으면 board가 바뀔 때만 실행. 빈 배열이면 마운트 때 한 번.
- `useReducer(reducer, initialArg, init)` — `init(initialArg)`의 결과가 초기 상태. 첫 렌더에 한 번만 호출된다.
- `JSON.parse`는 실패하면 **throw**한다. `try/catch`.
- 파싱에 성공해도 모양이 맞는지는 모른다. 최소한 `Array.isArray(parsed.columns)` 정도는 확인.
- 커스텀 훅은 그냥 `use`로 시작하는 함수. 안에서 다른 훅을 부를 수 있다. 반환값 모양은 자유.

## 스스로 답해볼 면접 질문
1. `useEffect`는 언제 실행되나? 의존성 배열이 `[]`, `[board]`, 없음일 때 각각 어떻게 다른가?
2. 초기값을 `useReducer(reducer, loadFromStorage())`로 직접 넣으면 왜 안 좋은가? lazy init이 뭘 해결하나?
3. "렌더 중에 하면 안 되는 일"에는 뭐가 있나? `localStorage` 접근은 왜 effect로 가야 하나?
4. 커스텀 훅과 일반 함수의 차이는? 훅 규칙(Rules of Hooks) 두 가지는?
5. 저장된 데이터의 모양이 나중에 바뀌면(예: 카드에 필드 추가) 어떻게 대처하나? (키워드: 버전, 마이그레이션)

## 구현 메모 (Claude가 대화 기반으로 기록)

## 리뷰 결과 (Claude가 채움)
