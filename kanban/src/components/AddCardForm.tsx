import { useState } from "react"

interface AddCardFormProps {
  onAdd: (title: string) => void
}

export function AddCardForm({ onAdd }: AddCardFormProps) {
  const [text, setText] = useState("")

  function handleSubmit() {
    if (!text.trim()) return
    onAdd(text.trim())
    setText("")
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSubmit}>추가</button>
    </div>
  )
}
