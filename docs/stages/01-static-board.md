# Stage 1 — 정적 보드 렌더링

## 목표
하드코딩된 데이터를 받아 컬럼과 카드가 화면에 그려진다. 상태 변경 없음. **데이터 모델과 컴포넌트 경계를 제대로 잡는 게 전부다.**

## 요구사항
1. `src/types.ts`에 도메인 타입을 정의한다. 최소 `Card`, `Column`, `Board`.
   - 카드는 id, 제목, (선택) 설명을 가진다.
   - 컬럼은 id, 제목, 그리고 카드 순서를 가진다.
   - **카드를 컬럼 안에 배열로 중첩할지, 카드는 별도 맵으로 두고 컬럼은 cardIds만 가질지** 결정하고 그 이유를 스펙 하단에 적는다. (5단계 DnD, 6단계 undo에서 이 결정이 돌아온다.)
2. `src/data.ts`에 컬럼 3개("To Do", "In Progress", "Done"), 카드 5~6개짜리 초기 데이터.
3. 컴포넌트 3개: `Board`, `Column`, `Card`. 각각 폴더 또는 파일로 분리, CSS Modules 사용.
4. `App`은 `Board`에 데이터를 넘기기만 한다.
5. 컬럼은 가로로 나열, 카드는 컬럼 안에 세로로 쌓인다. 예쁠 필요 없고 구분만 되면 된다.

## 완료 조건
- [x] `pnpm build` 에러 없음 (`tsc -b` 포함).
- [x] `pnpm lint` 경고 없음.
- [x] 브라우저에서 컬럼 3개, 카드가 올바른 컬럼에 표시.
- [x] 콘솔에 key 관련 경고 없음.
- [x] `any` 사용 0회.

## 힌트 (막히면 보기)
- props 타입은 `interface XxxProps`로 따로 선언하고 `function Xxx({ ... }: XxxProps)` 형태로.
- CSS Modules는 `Xxx.module.css` 파일명이면 Vite가 자동 처리한다. `import styles from './Xxx.module.css'`.
- key는 배열 index가 아니라 id.

## 스스로 답해볼 면접 질문 (리뷰 때 물어본다)
1. key는 왜 필요하고, index를 key로 쓰면 언제 문제가 되는가?
2. 정규화(normalize)된 상태와 중첩 상태의 트레이드오프는? 이 프로젝트에서 뭘 택했고 왜?
3. `interface`와 `type`의 차이, 그리고 props 타입에는 뭘 쓰는가?
4. 컴포넌트를 나누는 기준을 뭐라고 설명할 건가?

## 구현 메모 (Claude가 대화 기반으로 기록)
- 데이터 모델: **중첩 구조** 선택. `Column.cards: Card[]`, `Board.columns: Column[]`. 정규화 대신 단순함을 택함. 5단계 DnD에서 카드 이동 시 두 컬럼 배열을 동시에 갱신해야 하는 비용은 그때 체감하고 필요하면 리팩터.
- 막힌 지점 1: 타입 파일에서 "무엇을 담을지" 감이 안 옴 → 화면에 그리는 데 필요한 것만 거꾸로 적는 방식으로 풀림.
- 막힌 지점 2: `Board`의 역할이 뭔지 모호함 → 지금은 컬럼 묶음이지만 4단계(저장 단위), 6단계(undo 단위)에서 상태 루트가 되는 자리.
- 막힌 지점 3: 빈 컬럼 대비로 `cards?` 사용 → [troubleshooting/01](../troubleshooting/01-cards-optional-misconception.md)

## 리뷰 결과 (Claude가 채움)

### 2026-09-30 1차 리뷰 — 통과 (면접 문답 대기)

**잘한 것**
- `Card` → `Column` → `Board` 세 컴포넌트가 완전히 같은 패턴. props 인터페이스는 컴포넌트 파일 안에, 도메인 타입은 `type.ts`에. 타입/컴포넌트 이름 충돌은 `as XxxData` 별칭으로 일관되게 처리.
- key를 `map`이 반환하는 요소에, `id`로 정확히 붙임.
- `App`은 데이터를 `Board`에 넘기기만 함. 스펙 요구사항 4번 충족.

**Claude가 직접 손댄 부분 (사용자 요청)**
- `Card.tsx` 전체 (troubleshooting/02 참고), `Column.module.css`, `Board.module.css`, `Column.moudle.css` 파일명 오타.

**사소한 것 (지금 안 고쳐도 됨)**
- `data.ts`만 세미콜론을 씀. 나머지는 안 씀. 8단계쯤에서 Prettier 붙이면 자동으로 정리됨.
- `.board`에 `min-height: 100vh`를 줬는데 `App`의 `<h1>` 높이가 더해져 세로 스크롤이 조금 생김. Claude가 쓴 CSS의 문제. 2단계 때 정리.
- `{card.description && ...}` 패턴은 값이 문자열이라 안전. 숫자 필드였다면 `0`이 화면에 찍히는 함정이 있음. 면접 단골.

**면접 질문** — 아래 3개에 대한 사용자 답변을 듣고 종료 처리.
1. index를 key로 쓰면 언제 문제가 생기는가?
2. props 타입을 `type.ts`가 아니라 컴포넌트 파일 안에 둔 이유는?
3. `{card.description && <p>...</p>}`에서 `description`이 숫자 `0`이었다면 어떻게 되는가?
