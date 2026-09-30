# Card 컴포넌트에서 props를 못 받았다

- 단계: 1
- 증상: `function Card({ props }: CardProps)` → `Property 'props' does not exist on type 'CardProps'`
- 삽질한 것:
  1. "props 타입을 만들라"는 말을 듣고 `type.ts`의 도메인 타입 이름을 전부 `CardProps`, `ColumnProps`, `BoardProps`로 바꿈.
  2. 매개변수 구조분해 `{ props }`에서 `props`가 임의로 짓는 이름인 줄 앎.
  3. `{description && <p></p>}` — 조건부 렌더링은 맞게 썼는데 `<p>` 안이 비어 있음.
- 진짜 원인:
  - 도메인 타입과 props 타입이 다른 개념이라는 걸 몰랐음 → [theory/02](../theory/02-domain-type-vs-props-type.md)
  - 구조분해 중괄호 안의 이름은 타입에 실제로 있는 키여야 함.
- 해결 (Claude가 직접 수정, 사용자 요청):
  - `type.ts`를 `Card` / `Column` / `Board`로 되돌림.
  - `Card.tsx` 안에 `interface CardProps { card: Card }` 선언. 타입 이름 충돌은 `import type { Card as CardData }`로 회피.
  - `Card.module.css` 추가, 감싸는 `div`에 클래스 적용.
  - 화면에 찍던 `id` 제거, `description`을 `<p>` 안에 넣음.
  - `initalBoard` 오타 → `initialBoard`.
- 다시 만나면: "props 타입"은 컴포넌트 파일 안에, "데이터 타입"은 `type.ts`에. 둘을 섞지 않는다.
