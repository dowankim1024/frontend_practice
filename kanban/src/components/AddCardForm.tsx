import { useState } from "react"
import { useBoardDispatch } from "../useBoard"

interface AddCardFormProps {
  columnId: string
}

export function AddCardForm({ columnId }: AddCardFormProps) {
  const [text, setText] = useState("")
  const dispatch = useBoardDispatch()

  function handleSubmit() {
    if (!text.trim()) return
    dispatch({ type: "addCard", columnId, title: text.trim(), cardId: crypto.randomUUID() })
    setText("")
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSubmit}>추가</button>
    </div>
  )
}
