import { useState } from "react";
import './App.css';
import './index.css';

// Importa i componenti pagina
import Players from "./pages/Players.jsx";
import NewMatch from "./pages/NewMatch.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import History from "./pages/History.jsx";
import MonthlyStats from "./pages/MonthlyStats.jsx";

export default function App() {
  // 1. IMPOSTA "newmatch" COME PAGINA INIZIALE
  const [page, setPage] = useState("newmatch"); 

  return (
    <div className="App">
      {/* 2. RIORDINA I PULSANTI NELLA NAVIGAZIONE */}
      <nav>
        <button onClick={() => setPage("newmatch")}>Nuova Partita</button>
        <button onClick={() => setPage("players")}>Giocatori</button>
        <button onClick={() => setPage("leaderboard")}>Classifica Generale</button>
        <button onClick={() => setPage("monthly-stats")}>Statistiche Mensili</button>
        <button onClick={() => setPage("history")}>Storico</button>
      </nav>

      <main>
        {/* La logica di rendering qui non ha bisogno di essere cambiata */}
        {page === "players" && <Players />}
        {page === "newmatch" && <NewMatch />}
        {page === "leaderboard" && <Leaderboard />}
        {page === "history" && <History />}
        {page === "monthly-stats" && <MonthlyStats />}
      </main>
    </div>
  );
}
