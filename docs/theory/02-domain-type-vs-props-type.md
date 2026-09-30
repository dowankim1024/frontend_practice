# 도메인 타입 vs Props 타입

## 한 줄 정의
- **도메인 타입**(`Card`, `Column`, `Board`): 앱이 다루는 **데이터의 모양**. 컴포넌트와 무관하게 존재한다.
- **Props 타입**(`CardProps`): 특정 **컴포넌트가 받는 입력의 계약**. 그 컴포넌트 파일 안에 산다.

둘은 다른 것이다. 도메인 타입 이름을 `XxxProps`로 바꾸는 건 두 개념을 하나로 뭉갠 것.

## 왜 나누나
`Card` 데이터에는 `onDelete` 같은 콜백이 없다. 하지만 `Card` 컴포넌트는 2단계에서 삭제 버튼을 달아야 하고, 그 콜백은 props로 받아야 한다.
Props에는 "데이터 + 그 컴포넌트가 할 수 있는 행동"이 들어가고, 도메인 타입에는 데이터만 들어간다.

```ts
// type.ts — 도메인
export interface Card { id: string; title: string; description?: string }

// Card.tsx — 이 컴포넌트의 계약
interface CardProps {
  card: Card           // 데이터
  // onDelete?: () => void   ← 2단계에서 여기 추가된다. Card 데이터에는 안 들어감.
}
```

## 이름 충돌 처리
같은 파일에서 타입 `Card`와 컴포넌트 `Card`를 둘 다 쓰면 TS는 컴파일해주지만(타입/값 네임스페이스 분리) 사람이 헷갈린다.
`import type { Card as CardData }`로 별칭을 주면 해결된다.

## 이 프로젝트의 선택: `card: Card` 통째로 받기
필드를 낱개로 받는 방식(`{ title, description }`)도 가능하지만 통째로 받기로 함.
- 카드에 필드가 추가돼도 `Column`이 `Card`에 넘기는 코드가 안 바뀐다.
- 데이터(`card`)와 행동(`onDelete` 등)이 props 안에서 시각적으로 분리된다.
- 5단계 DnD에서 `card.id`를 dataTransfer에 실어야 하는데, 낱개로 받으면 id를 따로 또 받아야 한다.

## 매개변수 구조분해 읽는 법
```ts
function Card({ card }: CardProps)
```
"`CardProps` 모양의 객체 하나를 받고, 그 안의 `card` 키를 꺼낸다"는 뜻.
`{ props }`라고 쓰면 "`props`라는 키를 꺼낸다"가 되는데 `CardProps`에 그런 키가 없으니 에러가 난다.
중괄호 안에 쓰는 이름은 **내가 짓는 이름이 아니라 타입에 이미 있는 키 이름**이어야 한다.

## 면접에서 이렇게 말한다
> "도메인 타입은 데이터의 모양이고 props 타입은 컴포넌트의 입력 계약이라 분리했습니다. props에는 콜백처럼 데이터가 아닌 것도 들어가니까요. Card 컴포넌트는 도메인 객체를 통째로 받게 해서 필드가 늘어나도 부모 코드가 안 바뀌게 했고, 타입 이름과 컴포넌트 이름이 겹치는 건 import 별칭으로 풀었습니다."
