# 편집 모드 진입하면 input이 바로 사라지고 포커스가 안 됨

- 단계: 2
- 증상: 제목 클릭 → input으로 바뀜 → input 클릭하면 다시 h3로 돌아감. 포커스 불가.
- 코드:
  ```tsx
  <div onClick={() => setIsEditing(!isEditing)}>
    {isEditing ? <input ... /> : <h3>...</h3>}
  </div>
  ```
- 진짜 원인: **이벤트 버블링**. input이 div 안에 있으므로 input 클릭 이벤트가 부모 div까지 올라가 `onClick`이 다시 실행됨. 토글이라 `isEditing`이 false로 돌아가 input이 언마운트.
  ```
  클릭 → input → (버블링) → div.onClick → isEditing=false → input 사라짐
  ```
- 해결:
  1. `onClick`을 div가 아니라 `<h3>`에. input은 h3의 자식이 아니라 버블링이 h3에 안 닿는다.
  2. 토글 대신 `setIsEditing(true)`. 진입과 종료는 다른 이벤트(클릭 / Enter·Escape)가 담당.
  3. `<input autoFocus />`로 마운트 시 포커스.
- 다시 만나면: 부모에 클릭 핸들러가 있고 자식이 인터랙티브 요소면 버블링부터 의심. `e.stopPropagation()`으로 막을 수도 있지만, 핸들러를 정확한 요소에 붙이는 게 먼저.
- 면접: "이벤트 버블링이 뭔가요" → "자식 요소에서 발생한 이벤트가 DOM 트리를 따라 부모로 전파되는 것. React의 합성 이벤트도 같은 순서를 따른다."
