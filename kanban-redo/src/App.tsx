import { Board } from "./components/Board"
import { initialBoard } from "./data"
function App() {
  return (<div>
    <h1>Kanban</h1>
    <Board board={initialBoard} />
  </div>
  )
}

export default App
