import { useState, useEffect } from 'react';
import { API_URL } from '../api';

const PlayersList = ({ players }) => {
    // La funzione per eliminare un giocatore non ha bisogno di modifiche,
    // ma la passiamo qui per completezza
    const deletePlayer = async (id) => {
        if (!confirm(`Sei sicuro di voler eliminare il giocatore con ID ${id}?`)) return;
        // La logica di eliminazione va gestita nel componente padre per aggiornare lo stato
        // Per ora, questo pulsante non farà nulla se non passiamo una funzione
    };

    return (
        <div className="players-list">
            <h2>Elenco Giocatori</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Ruolo Preferito</th>
                        <th>Punti</th>
                        {/* Azioni rimosse per ora, da re-implementare se necessario */}
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => (
                        <tr key={player.id}>
                            <td>{player.id}</td>
                            <td>{player.name}</td>
                            <td>{player.preferred_role || 'N/D'}</td>
                            <td>{player.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AddPlayerForm = ({ onPlayerAdded }) => {
    const [name, setName] = useState('');
    const [preferredRole, setPreferredRole] = useState('');
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (preferredRole) formData.append('preferred_role', preferredRole);
        if (photo) formData.append('photo', photo);

        try {
            const response = await fetch(`${API_URL}/players`, { method: 'POST', body: formData });
            if (response.ok) {
                const newPlayer = await response.json();
                onPlayerAdded(newPlayer); // Chiama la funzione del genitore per aggiornare lo stato
                setName('');
                setPreferredRole('');
                setPhoto(null);
                e.target.reset();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Errore');
            }
        } catch (err) {
            setError('Errore di connessione.');
        }
    };

    return (
        <div className="add-player-form form-container">
            <h2>Aggiungi Giocatore</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                <div className="form-field">
                    <label htmlFor="player-name">Nome:</label>
                    <input id="player-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
                </div>
                <div className="form-field">
                    <label htmlFor="player-role">Ruolo:</label>
                    <select id="player-role" value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)}>
                        <option value="">Seleziona ruolo</option>
                        <option value="attaccante">Attaccante</option>
                        <option value="portiere">Portiere</option>
                    </select>
                </div>
                <div className="form-field">
                     <label htmlFor="player-photo">Foto:</label>
                    <input id="player-photo" type="file" onChange={(e) => setPhoto(e.target.files[0])} />
                </div>
                </fieldset>
                <button type="submit">Aggiungi Giocatore</button>
                {error && <p className="form-error">{error}</p>}
            </form>
        </div>
    );
};

// COMPONENTE PRINCIPALE
const Players = () => {
    const [playersWithStats, setPlayersWithStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [playersRes, matchesRes] = await Promise.all([
                fetch(`${API_URL}/players`),
                fetch(`${API_URL}/matches`)
            ]);
            if (!playersRes.ok || !matchesRes.ok) throw new Error('Errore caricamento dati');

            const players = await playersRes.json();
            const matches = await matchesRes.json();
            const stats = {};
            players.forEach(p => {
                stats[p.id] = { ...p, points: 0, wins: 0, losses: 0, matches_played: 0 };
            });

            matches.forEach(match => {
                const teamA_ids = [match.teamA_attacker_id, match.teamA_goalkeeper_id];
                const teamB_ids = [match.teamB_attacker_id, match.teamB_goalkeeper_id];

                if (match.score_a > match.score_b) {
                    const isCappotto = match.score_a === 6;
                    const points_A = isCappotto ? 4 : 3;
                    const points_B = isCappotto ? -1 : 0;
                    teamA_ids.forEach(id => { if (stats[id]) stats[id].points += points_A; });
                    teamB_ids.forEach(id => { if (stats[id]) stats[id].points += points_B; });
                } else if (match.score_b > match.score_a) {
                    const isCappotto = match.score_b === 6;
                    const points_B = isCappotto ? 4 : 3;
                    const points_A = isCappotto ? -1 : 0;
                    teamB_ids.forEach(id => { if (stats[id]) stats[id].points += points_B; });
                    teamA_ids.forEach(id => { if (stats[id]) stats[id].points += points_A; });
                }
            });
            
            const finalPlayers = Object.values(stats).sort((a, b) => a.name.localeCompare(b.name));
            setPlayersWithStats(finalPlayers);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    if (loading) return <p>Caricamento giocatori...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <AddPlayerForm onPlayerAdded={() => fetchData()} />
            <PlayersList players={playersWithStats} />
        </div>
    );
};

export default Players;
