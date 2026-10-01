import { BoardProvider } from "./BoardProvider"
import { Board } from "./components/Board"

function App() {
  return (
    <BoardProvider>
      <div>
        <h1>Kanban</h1>
        <Board />
      </div>
    </BoardProvider>
  )
}

export default App
