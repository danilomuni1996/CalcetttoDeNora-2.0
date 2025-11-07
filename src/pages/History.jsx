import { useState, useEffect } from 'react';
import { API_URL } from '../api';

const History = () => {
    const [matches, setMatches] = useState([]);
    const [players, setPlayers] = useState({});

    const fetchHistory = async () => {
        try {
            const [matchesRes, playersRes] = await Promise.all([
                fetch(`${API_URL}/matches`),
                fetch(`${API_URL}/players`)
            ]);
            const matchesData = await matchesRes.json();
            const playersData = await playersRes.json();
            const playersMap = playersData.reduce((acc, player) => {
                acc[player.id] = player.name;
                return acc;
            }, {});
            setMatches(matchesData);
            setPlayers(playersMap);
        } catch (error) {
            console.error("Errore nel caricamento dei dati:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const deleteMatch = async (matchId) => {
        if (!confirm(`Sei sicuro di voler eliminare la partita con ID ${matchId}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/matches/${matchId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Partita eliminata con successo!');
                // Ricarica lo storico per mostrare l'aggiornamento
                fetchHistory(); 
            } else {
                const errorData = await response.json();
                alert(`Errore durante l'eliminazione: ${errorData.detail}`);
            }
        } catch (error) {
            console.error("Errore di rete:", error);
            alert("Errore di rete o connessione al server fallita.");
        }
    };

    const getPlayerName = (id) => players[id] || `ID: ${id}`;

    return (
        <div className="history">
            <h2>Storico Partite</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID Partita</th>
                        <th>Data</th>
                        <th>Team A</th>
                        <th>Team B</th>
                        <th>Risultato</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map(match => (
                        <tr key={match.id}>
                            <td>{match.id}</td>
                            <td>{new Date(match.created_at).toLocaleDateString()}</td>
                            <td>{getPlayerName(match.teamA_attacker_id)} & {getPlayerName(match.teamA_goalkeeper_id)}</td>
                            <td>{getPlayerName(match.teamB_attacker_id)} & {getPlayerName(match.teamB_goalkeeper_id)}</td>
                            <td>{match.score_a} - {match.score_b}</td>
                            <td>
                                <button className="delete-button" onClick={() => deleteMatch(match.id)}>
                                    Elimina
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default History;
