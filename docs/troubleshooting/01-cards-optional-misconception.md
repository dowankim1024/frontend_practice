# 빈 컬럼 대비하려고 `cards?`를 붙였다

- 단계: 1
- 증상: `Column.cards`, `Board.columns`에 `?`를 붙임.
- 오해: "카드가 없을 때 오류가 안 나게 하려고" 옵셔널을 씀. `?`를 "비어 있을 수 있음"으로 이해.
- 진짜 원인: `?`는 `undefined` 허용이다. 빈 배열 `[]`이 이미 "없음"을 표현하는데 상태를 하나 더 만든 것. 오히려 `undefined.map()`으로 터질 가능성이 생김.
- 해결: 두 필드 모두 필수로 변경. `description?`만 유지.
- 다시 만나면: "비어 있을 수 있나"면 빈 값(`[]`, `""`), "없을 수 있나"면 `?`. 이 둘을 먼저 구분한다.
- 관련 이론: [theory/01-optional-field-vs-empty.md](../theory/01-optional-field-vs-empty.md)
